import { generateContentWithRetry } from "../services/rag.service";
import { Request, Response, NextFunction } from 'express';
import { StudyPlan } from '../models/StudyPlan';
import { Exam } from '../models/Exam';
import { AppError } from '../middlewares/error';
import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

// @desc    Get all study plans for a date range (e.g., a month) and exams
// @route   GET /api/planner
export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await StudyPlan.find({ user: req.user?._id }).sort('date');
    const exams = await Exam.find({ user: req.user?._id }).sort('date');
    res.status(200).json({ success: true, data: plans, exams: exams });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update a plan for a specific date
// @route   POST /api/planner
export const setPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, tasks } = req.body;
    
    if (!date || !tasks) {
      return next(new AppError('Please provide date and tasks', 400));
    }

    let plan = await StudyPlan.findOne({ user: req.user?._id, date });

    if (plan) {
      plan.tasks = tasks;
      await plan.save();
    } else {
      plan = await StudyPlan.create({
        user: req.user?._id,
        date,
        tasks,
      });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate study schedule
// @route   POST /api/planner/generate
export const generateSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, examDate, availableHoursPerDay } = req.body;

    if (!topic || !examDate) {
      return next(new AppError('Please provide topic and examDate', 400));
    }

    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = Math.abs(exam.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let prompt = `Create a study schedule for the topic: "${topic}".
    The exam is in ${diffDays} days. I can study ${availableHoursPerDay || 2} hours per day.
    Generate a daily plan from day 1 to day ${Math.min(diffDays, 14)}.
    
    Return ONLY a valid JSON array of objects.
    Each object MUST have:
    - 'dayOffset' (number, 0 for today, 1 for tomorrow, etc.)
    - 'tasks' (array of objects with 'title', 'type', and 'duration'). Valid types are: "Reading", "Practice", "Review", "Quiz". Duration should be string like "30m" or "1h".`;

    const genAI = getAI();
    const response = await generateContentWithRetry({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    let content = response.text || "[]";
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    let schedule = [];
    try {
      schedule = JSON.parse(content);
    } catch (err) {
      return next(new AppError('Failed to parse AI schedule', 500));
    }

    // Convert relative days to actual dates and save
    const createdPlans = [];
    
    // Save the exam
    const newExam = await Exam.create({
      user: req.user?._id,
      title: topic,
      date: examDate,
    });
    
    for (const dayPlan of schedule) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayPlan.dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      const formattedTasks = dayPlan.tasks.map((t: any) => ({
        ...t,
        status: 'pending'
      }));

      let plan = await StudyPlan.findOne({ user: req.user?._id, date: dateStr });
      if (plan) {
        plan.tasks = [...plan.tasks, ...formattedTasks];
        await plan.save();
        createdPlans.push(plan);
      } else {
        plan = await StudyPlan.create({
          user: req.user?._id,
          date: dateStr,
          tasks: formattedTasks,
        });
        createdPlans.push(plan);
      }
    }

    res.status(201).json({ success: true, data: createdPlans });
  } catch (error) {
    next(error);
  }
};
