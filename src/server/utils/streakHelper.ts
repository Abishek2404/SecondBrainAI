import { IUser } from '../models/User';

export const getLocalDateString = (timeZone: string = 'UTC') => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [{ value: month }, , { value: day }, , { value: year }] = formatter.formatToParts(new Date());
    return `${year}-${month}-${day}`;
  } catch (err) {
    return new Date().toISOString().split('T')[0];
  }
};

export const getYesterdayDateString = (timeZone: string = 'UTC') => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [{ value: month }, , { value: day }, , { value: year }] = formatter.formatToParts(yesterday);
    return `${year}-${month}-${day}`;
  } catch (err) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
};

interface StreakResult {
  showPopup: boolean;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  coins: number;
  focusPoints: number;
  studyDays: string[];
  achievements: string[];
  reward?: {
    xp: number;
    coins: number;
    focus: number;
    streak: number;
  };
}

export const processStreakActivity = async (user: IUser): Promise<StreakResult> => {
  const timeZone = user.timeZone || 'UTC';
  const todayStr = getLocalDateString(timeZone);
  const yesterdayStr = getYesterdayDateString(timeZone);

  // Initialize defaults if they don't exist
  if (user.currentStreak === undefined) user.currentStreak = 0;
  if (user.longestStreak === undefined) user.longestStreak = 0;
  if (user.lastCompletedDate === undefined) user.lastCompletedDate = '';
  if (user.todayCompleted === undefined) user.todayCompleted = false;
  if (user.xp === undefined) user.xp = 0;
  if (user.level === undefined) user.level = 1;
  if (user.coins === undefined) user.coins = 0;
  if (user.focusPoints === undefined) user.focusPoints = 0;
  if (user.totalTasksCompleted === undefined) user.totalTasksCompleted = 0;
  if (!user.studyDays) user.studyDays = [];
  if (!user.achievements) user.achievements = [];

  user.totalTasksCompleted += 1;

  // Add today to studyDays if not present
  if (!user.studyDays.includes(todayStr)) {
    user.studyDays.push(todayStr);
  }

  // If already completed today, we don't show the streak pop-up again and we don't increment the streak
  if (user.lastCompletedDate === todayStr) {
    // Just save and return
    user.todayCompleted = true;
    await user.save();
    return {
      showPopup: false,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      xp: user.xp,
      level: user.level,
      coins: user.coins,
      focusPoints: user.focusPoints,
      studyDays: user.studyDays,
      achievements: user.achievements
    };
  }

  let showPopup = true;
  let prevStreak = user.currentStreak;

  if (user.lastCompletedDate === yesterdayStr) {
    // Streak continues
    user.currentStreak += 1;
  } else {
    // Missed yesterday or new user - reset/start streak at 1
    user.currentStreak = 1;
  }

  user.lastCompletedDate = todayStr;
  user.todayCompleted = true;

  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  // Award rewards
  const xpReward = 20;
  const coinsReward = 10;
  const focusReward = 5;

  user.xp += xpReward;
  user.coins += coinsReward;
  user.focusPoints += focusReward;

  // Calculate level (100 XP per level)
  user.level = Math.floor(user.xp / 100) + 1;

  // Check achievements
  const newAchievements: string[] = [];
  if (user.longestStreak >= 7 && !user.achievements.includes('Consistency Beginner')) {
    user.achievements.push('Consistency Beginner');
    newAchievements.push('Consistency Beginner');
  }
  if (user.longestStreak >= 30 && !user.achievements.includes('Focused Learner')) {
    user.achievements.push('Focused Learner');
    newAchievements.push('Focused Learner');
  }
  if (user.longestStreak >= 100 && !user.achievements.includes('Knowledge Builder')) {
    user.achievements.push('Knowledge Builder');
    newAchievements.push('Knowledge Builder');
  }
  if (user.longestStreak >= 365 && !user.achievements.includes('Second Brain Master')) {
    user.achievements.push('Second Brain Master');
    newAchievements.push('Second Brain Master');
  }

  await user.save();

  return {
    showPopup,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    xp: user.xp,
    level: user.level,
    coins: user.coins,
    focusPoints: user.focusPoints,
    studyDays: user.studyDays,
    achievements: user.achievements,
    reward: {
      xp: xpReward,
      coins: coinsReward,
      focus: focusReward,
      streak: user.currentStreak - prevStreak
    }
  };
};
