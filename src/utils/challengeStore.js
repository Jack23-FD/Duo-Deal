import dayjs from 'dayjs';

let challengesCache = [];
let normalTasksCache = {};
const STORAGE_CHALLENGES_KEY = 'duo_deals_challenges';
const STORAGE_NORMAL_TASKS_KEY = 'duo_deals_normal_tasks';



const broadcastUpdate = () => {
  window.dispatchEvent(new Event('challenge_store_update'));
};

const getTodayStr = () => dayjs().format('YYYY-MM-DD');

// Seed normal tasks
const getInitialNormalTasks = () => {
  const today = getTodayStr();
  return {
    [today]: [
      { id: 1, title: '30 min Morning Yoga', time: '07:00 AM', completed: false },
      { id: 2, title: 'Read 10 pages — Atomic Habits', time: '09:00 PM', completed: false },
      { id: 3, title: 'Drink 3 L Water', time: 'All Day', completed: true },
      { id: 4, title: 'Evening Run (5 km)', time: '06:30 PM', completed: false },
    ],
  };
};

export const challengeStore = {
  getChallenges: () => {
    if (challengesCache.length === 0) {
      try {
        const data = localStorage.getItem(STORAGE_CHALLENGES_KEY);
        if (data) {
          challengesCache = JSON.parse(data);
        } else {
          const today = getTodayStr();
          const start = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
          const end = dayjs().add(5, 'day').format('YYYY-MM-DD');
          const endChris = dayjs().add(3, 'day').format('YYYY-MM-DD');
          
          challengesCache = [
            {
              id: 'duel_priya43',
              challenger: 'Jack23',
              opponent: 'Priya43',
              startDate: start,
              endDate: end,
              tasks: [
                { name: 'Morning Jog 3km', time: '07:00 AM' },
                { name: 'Read 10 Pages', time: '09:00 PM' },
                { name: 'Drink 3L Water', time: 'All Day' }
              ],
              status: 'ACTIVE',
              createdAt: dayjs().toISOString(),
              progress: {
                [today]: {
                  'Jack23': { 'Morning Jog 3km': true, 'Read 10 Pages': false, 'Drink 3L Water': true },
                  'Priya43': { 'Morning Jog 3km': true, 'Read 10 Pages': true, 'Drink 3L Water': false }
                },
                [dayjs().subtract(1, 'day').format('YYYY-MM-DD')]: {
                  'Jack23': { 'Morning Jog 3km': true, 'Read 10 Pages': true, 'Drink 3L Water': true },
                  'Priya43': { 'Morning Jog 3km': false, 'Read 10 Pages': true, 'Drink 3L Water': false }
                }
              }
            },
            {
              id: 'duel_alex',
              challenger: 'Felix',
              opponent: 'Alex',
              startDate: start,
              endDate: end,
              tasks: [
                { name: 'Morning Jog 3km', time: '07:00 AM' },
                { name: 'Read 10 Pages', time: '09:00 PM' }
              ],
              status: 'ACTIVE',
              createdAt: dayjs().toISOString(),
              progress: {}
            },
            {
              id: 'duel_chris',
              challenger: 'Felix',
              opponent: 'Chris',
              startDate: start,
              endDate: endChris,
              tasks: [
                { name: 'Water Habit 2L', time: 'Anytime' }
              ],
              status: 'ACTIVE',
              createdAt: dayjs().toISOString(),
              progress: {}
            }
          ];
          localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(challengesCache));
        }
      } catch (e) {
        console.error('Error parsing challenges', e);
        challengesCache = [];
      }
    }
    return challengesCache;
  },

  saveChallenges: (challenges) => {
    challengesCache = challenges;
    localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(challenges));
    broadcastUpdate();
  },

  createChallenge: ({ opponent, startDate, endDate, tasks }) => {
    const challenges = challengeStore.getChallenges();
    const cleanTasks = tasks
      .filter(t => t && t.name && t.name.trim())
      .map(t => ({
        name: t.name.trim(),
        time: t.time ? t.time.trim() : 'Anytime'
      }));
    
    const newChallenge = {
      id: `duel_${Date.now()}`,
      challenger: 'Felix',
      opponent,
      startDate: dayjs(startDate).format('YYYY-MM-DD'),
      endDate: dayjs(endDate).format('YYYY-MM-DD'),
      tasks: cleanTasks,
      status: 'PENDING',
      createdAt: dayjs().toISOString(),
      progress: {}
    };

    challenges.push(newChallenge);
    challengeStore.saveChallenges(challenges);
    return newChallenge;
  },

  acceptChallenge: (challengeId) => {
    const challenges = challengeStore.getChallenges();
    const updated = challenges.map(ch => {
      if (ch.id === challengeId) {
        return { ...ch, status: 'ACTIVE', acceptedAt: dayjs().toISOString() };
      }
      return ch;
    });
    challengeStore.saveChallenges(updated);
  },

  rejectChallenge: (challengeId) => {
    const challenges = challengeStore.getChallenges();
    const updated = challenges.map(ch => {
      if (ch.id === challengeId) {
        return { ...ch, status: 'REJECTED', rejectedAt: dayjs().toISOString() };
      }
      return ch;
    });
    challengeStore.saveChallenges(updated);
  },

  // Get all active duels for a specific date (date is a dayjs object or YYYY-MM-DD string)
  getActiveDuelsForDate: (date) => {
    const targetDate = dayjs(date);
    const challenges = challengeStore.getChallenges();
    
    // Filter all ACTIVE challenges where targetDate is within [startDate, endDate]
    return challenges.filter(ch => {
      if (ch.status !== 'ACTIVE') return false;
      const start = dayjs(ch.startDate);
      const end = dayjs(ch.endDate);
      return (targetDate.isAfter(start, 'day') || targetDate.isSame(start, 'day')) &&
             (targetDate.isBefore(end, 'day') || targetDate.isSame(end, 'day'));
    });
  },

  // Get active duel for a specific date (retained for backward compatibility)
  getActiveDuelForDate: (date) => {
    const activeDuels = challengeStore.getActiveDuelsForDate(date);
    return activeDuels.length > 0 ? activeDuels[0] : null;
  },

  toggleChallengeTask: (challengeId, username, dateStr, taskTitle) => {
    const challenges = challengeStore.getChallenges();
    const updated = challenges.map(ch => {
      if (ch.id === challengeId) {
        const newProgress = { ...ch.progress };
        if (!newProgress[dateStr]) newProgress[dateStr] = {};
        if (!newProgress[dateStr][username]) newProgress[dateStr][username] = {};
        
        // Toggle task for the specified user
        const currentVal = !!newProgress[dateStr][username][taskTitle];
        newProgress[dateStr][username][taskTitle] = !currentVal;

        return { ...ch, progress: newProgress };
      }
      return ch;
    });
    challengeStore.saveChallenges(updated);
  },

  // --- Normal Daily Tasks Management ---
  getNormalTasks: () => {
    if (Object.keys(normalTasksCache).length === 0) {
      try {
        const data = localStorage.getItem(STORAGE_NORMAL_TASKS_KEY);
        if (!data) {
          const initial = getInitialNormalTasks();
          localStorage.setItem(STORAGE_NORMAL_TASKS_KEY, JSON.stringify(initial));
          normalTasksCache = initial;
        } else {
          normalTasksCache = JSON.parse(data);
        }
      } catch (e) {
        console.error('Error parsing normal tasks', e);
        normalTasksCache = {};
      }
    }
    return normalTasksCache;
  },

  saveNormalTasks: (tasks) => {
    normalTasksCache = tasks;
    localStorage.setItem(STORAGE_NORMAL_TASKS_KEY, JSON.stringify(tasks));
    broadcastUpdate();
  },

  addNormalTask: (dateStr, title, time) => {
    const tasks = challengeStore.getNormalTasks();
    if (!tasks[dateStr]) tasks[dateStr] = [];
    
    const newTask = {
      id: Date.now(),
      title: title.trim(),
      time: time.trim() || 'Anytime',
      completed: false
    };
    
    tasks[dateStr].push(newTask);
    challengeStore.saveNormalTasks(tasks);
    return newTask;
  },

  deleteNormalTask: (dateStr, taskId) => {
    const tasks = challengeStore.getNormalTasks();
    if (!tasks[dateStr]) return;
    
    tasks[dateStr] = tasks[dateStr].filter(t => t.id !== taskId);
    challengeStore.saveNormalTasks(tasks);
  },

  toggleNormalTask: (dateStr, taskId) => {
    const tasks = challengeStore.getNormalTasks();
    if (!tasks[dateStr]) return;
    
    tasks[dateStr] = tasks[dateStr].map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    challengeStore.saveNormalTasks(tasks);
  }
};
