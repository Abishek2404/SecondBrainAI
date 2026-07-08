import { Request, Response, NextFunction } from 'express';
import { Document } from '../models/Document';
import { Flashcard } from '../models/Flashcard';
import { FlashcardDeck } from '../models/FlashcardDeck';
import { QuizAttempt } from '../models/QuizAttempt';
import { StudyPlan } from '../models/StudyPlan';

// @desc    Get dashboard analytics
// @route   GET /api/analytics
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    // 1. Documents count
    const totalDocuments = await Document.countDocuments({ user: userId });

    // 2. Flashcards Mastered vs Total
    const decks = await FlashcardDeck.find({ user: userId }).select('_id');
    const deckIds = decks.map(d => d._id);
    
    const totalFlashcards = await Flashcard.countDocuments({ deck: { $in: deckIds } });
    const masteredFlashcards = await Flashcard.countDocuments({ 
      deck: { $in: deckIds },
      repetitions: { $gte: 3 }
    });
    const reviewedFlashcards = await Flashcard.countDocuments({ 
      deck: { $in: deckIds },
      repetitions: { $gte: 1 } 
    });

    // 3. Quiz Average Score
    const attempts = await QuizAttempt.find({ user: userId });
    const totalQuizzesTaken = attempts.length;
    let avgQuizScore = 0;
    if (totalQuizzesTaken > 0) {
      const sum = attempts.reduce((acc, a) => acc + (a.score / a.totalQuestions), 0);
      avgQuizScore = Math.round((sum / totalQuizzesTaken) * 100);
    }

    // 4. Study Hours / Tasks (assuming duration string like "1h" or "30m" is rough, we just count completed tasks for simplicity here or parse them)
    // Here we'll just count total completed tasks
    const plans = await StudyPlan.find({ user: userId });
    let completedTasks = 0;
    let totalTasks = 0;
    
    const today = new Date().toISOString().split('T')[0];
    const upcomingTasks: any[] = [];
    
    plans.forEach(plan => {
      plan.tasks.forEach(t => {
        totalTasks++;
        if (t.status === 'completed') completedTasks++;
        else if (plan.date >= today) {
          upcomingTasks.push({
            title: t.title,
            date: plan.date,
            type: t.type,
            duration: t.duration
          });
        }
      });
    });

    const dueCardsAgg = await Flashcard.aggregate([
      {
        $match: {
          nextReviewDate: { $lte: new Date() }
        }
      },
      {
        $group: {
          _id: '$deck',
          dueCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'flashcarddecks',
          localField: '_id',
          foreignField: '_id',
          as: 'deck'
        }
      },
      { $unwind: '$deck' },
      { $match: { 'deck.user': userId } }
    ]);

    dueCardsAgg.forEach(dueDeck => {
      if (dueDeck.dueCount > 0) {
        upcomingTasks.push({
          title: `Review ${dueDeck.deck.title}`,
          date: today,
          type: 'Flashcards',
          duration: `${dueDeck.dueCount} cards due`
        });
      }
    });

    if (upcomingTasks.length < 3) {
      const recentDocs = await Document.find({ user: userId }).sort('-createdAt').limit(3);
      recentDocs.forEach(doc => {
        if (upcomingTasks.length < 4) {
          upcomingTasks.push({
            title: `Review ${doc.title}`,
            date: today,
            type: 'Reading',
            duration: '15 mins'
          });
        }
      });
    }

    upcomingTasks.sort((a, b) => a.date.localeCompare(b.date));

    // 5. Subject Performance
    const quizAttemptsAgg = await QuizAttempt.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz',
          foreignField: '_id',
          as: 'quizData'
        }
      },
      { $unwind: '$quizData' },
      {
        $group: {
          _id: { $ifNull: ['$quizData.subject', 'General'] },
          avgScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
        }
      }
    ]);

    const flashcardDecksAgg = await FlashcardDeck.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'deck',
          as: 'cards'
        }
      },
      { $unwind: '$cards' },
      {
        $group: {
          _id: { $ifNull: ['$subject', 'General'] },
          totalCards: { $sum: 1 },
          masteredCards: {
            $sum: { $cond: [{ $gte: ['$cards.repetitions', 3] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 1,
          masteryScore: { $multiply: [{ $divide: ['$masteredCards', '$totalCards'] }, 100] }
        }
      }
    ]);

    const subjectMap = new Map<string, { quizScore?: number, masteryScore?: number }>();
    
    quizAttemptsAgg.forEach(q => {
      subjectMap.set(q._id, { quizScore: q.avgScore });
    });
    
    flashcardDecksAgg.forEach(f => {
      const existing = subjectMap.get(f._id) || {};
      existing.masteryScore = f.masteryScore;
      subjectMap.set(f._id, existing);
    });

    const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, scores]) => {
      let totalScore = 0;
      let count = 0;
      if (scores.quizScore !== undefined) {
        totalScore += scores.quizScore;
        count++;
      }
      if (scores.masteryScore !== undefined) {
        totalScore += scores.masteryScore;
        count++;
      }
      return {
        subject,
        score: count > 0 ? Math.round(totalScore / count) : 0
      };
    });

    // 6. Daily Study Time (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const recentAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
    });

    const recentPlans = await StudyPlan.find({
      user: userId,
      date: { $in: last7Days }
    });

    const distributionMap = new Map<string, number>();
    last7Days.forEach(date => distributionMap.set(date, 0));

    recentAttempts.forEach(attempt => {
      // @ts-ignore
      const date = attempt.createdAt?.toISOString().split('T')[0];
      if (date && distributionMap.has(date)) {
        distributionMap.set(date, distributionMap.get(date)! + 0.25); // 15 mins per quiz
      }
    });

    recentPlans.forEach(plan => {
      if (distributionMap.has(plan.date)) {
        let hours = 0;
        plan.tasks.forEach(t => {
          if (t.status === 'completed') {
            const timeStr = t.duration || '';
            if (timeStr.includes('m')) {
              hours += parseInt(timeStr) / 60;
            } else if (timeStr.includes('h')) {
              hours += parseInt(timeStr);
            } else {
              hours += 0.5; // default 30m
            }
          }
        });
        distributionMap.set(plan.date, distributionMap.get(plan.date)! + hours);
      }
    });

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const studyDistribution = last7Days.map(date => {
      const d = new Date(date);
      return {
        day: daysOfWeek[d.getDay()],
        hours: parseFloat((distributionMap.get(date) || 0).toFixed(1))
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalDocuments,
        totalFlashcards,
        masteredFlashcards,
        reviewedFlashcards,
        totalQuizzesTaken,
        avgQuizScore,
        completedTasks,
        totalTasks,
        subjectPerformance,
        upcomingTasks,
        studyDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};
