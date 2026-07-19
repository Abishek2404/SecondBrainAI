const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

const mockStatsMarker = '  // Calculate mock stats';
const returnStartMarker = '  return (';

const statsIdx = file.indexOf(mockStatsMarker);
const returnIdx = file.indexOf(returnStartMarker, statsIdx);

const newStats = `  // Calculate real stats
  let totalQuizzesTaken = 0;
  let totalCorrect = 0;
  let totalQuestionsAttempted = 0;
  const subjectStats: Record<string, { correct: number, total: number }> = {};
  
  quizzes.forEach(q => {
    if (q.attemptsCount > 0) {
      totalQuizzesTaken++;
      const qCorrect = q.avgScore * q.attemptsCount;
      const qTotal = q.questionsCount * q.attemptsCount;
      
      totalCorrect += qCorrect;
      totalQuestionsAttempted += qTotal;
      
      if (q.subject) {
        if (!subjectStats[q.subject]) {
          subjectStats[q.subject] = { correct: 0, total: 0 };
        }
        subjectStats[q.subject].correct += qCorrect;
        subjectStats[q.subject].total += qTotal;
      }
    }
  });

  const totalQuestions = quizzes.reduce((acc, q) => acc + q.questionsCount, 0);
  const avgScorePct = totalQuestionsAttempted > 0 ? (totalCorrect / totalQuestionsAttempted) * 100 : 0;
  const bestScoreQuiz = quizzes.filter(q => q.attemptsCount > 0).sort((a, b) => (b.avgScore / b.questionsCount) - (a.avgScore / a.questionsCount))[0];

  const subjectArray = Object.entries(subjectStats).map(([name, stats]) => ({
    name,
    progress: Math.round((stats.correct / stats.total) * 100),
  })).sort((a, b) => b.progress - a.progress).slice(0, 5);

  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-600', 'bg-amber-500', 'bg-rose-500'];
  const formattedSubjects = subjectArray.map((sub, i) => ({ ...sub, color: colors[i % colors.length] }));

  const recentActivity = quizzes
    .filter(q => q.attemptsCount > 0)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 4)
    .map(q => {
      const s = Math.round((q.avgScore / q.questionsCount) * 100);
      return {
        icon: s >= 80 ? <Trophy className="h-4 w-4 text-emerald-600" /> : <CheckCircle2 className="h-4 w-4 text-blue-600" />,
        bg: s >= 80 ? "bg-emerald-50" : "bg-blue-50",
        title: \`Completed \${q.title}\`,
        subtitle: \`Score: \${s}% • \${Math.round(q.avgScore)}/\${q.questionsCount}\`,
        time: new Date(q.updatedAt || q.createdAt).toLocaleDateString()
      }
    });

`;

file = file.substring(0, statsIdx) + newStats + file.substring(returnIdx);

// Now patch the avg score card inside the left column
const avgScoreSearch = `                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Average Score</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{Math.round(avgScore) || 87}%</h3>`;
const avgScoreReplace = `                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Average Score</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{Math.round(avgScorePct)}%</h3>`;
file = file.replace(avgScoreSearch, avgScoreReplace);

// Best score card
const bestScoreSearch = `                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Best Score</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{bestScore ? Math.round((bestScore.avgScore / bestScore.questionsCount) * 100) : 100}%</h3>
                <p className="text-xs font-medium text-muted-foreground truncate">{bestScore ? bestScore.title : 'HTML_CSS Quiz'}</p>`;
const bestScoreReplace = `                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Best Score</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{bestScoreQuiz ? Math.round((bestScoreQuiz.avgScore / bestScoreQuiz.questionsCount) * 100) : 0}%</h3>
                <p className="text-xs font-medium text-muted-foreground truncate">{bestScoreQuiz ? bestScoreQuiz.title : 'Take a quiz!'}</p>`;
file = file.replace(bestScoreSearch, bestScoreReplace);

// Quizzes taken stat
const takenSearch = `                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Quizzes Taken</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{totalQuizzesTaken || 24}</h3>`;
const takenReplace = `                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Quizzes Taken</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{totalQuizzesTaken}</h3>`;
file = file.replace(takenSearch, takenReplace);

// Total Questions stat
const tqSearch = `<h3 className="text-2xl font-bold text-foreground mb-1">{totalQuestions || 482}</h3>`;
const tqReplace = `<h3 className="text-2xl font-bold text-foreground mb-1">{totalQuestions}</h3>`;
file = file.replace(tqSearch, tqReplace);

fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched top stats successfully");
