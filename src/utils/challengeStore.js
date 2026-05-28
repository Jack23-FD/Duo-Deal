import dayjs from 'dayjs';

let challengesCache = [];
let normalTasksCache = {};
let challengesInitialized = false;
let normalTasksInitialized = false;
const STORAGE_CHALLENGES_KEY = 'duo_deals_challenges';
const STORAGE_NORMAL_TASKS_KEY = 'duo_deals_normal_tasks';



const broadcastUpdate = () => {
  window.dispatchEvent(new Event('challenge_store_update'));
};

const getTodayStr = () => dayjs().format('YYYY-MM-DD');

// Seed normal tasks
const getInitialNormalTasks = () => {
  return {};
};

const getLoggedInUser = () => {
  try {
    const data = localStorage.getItem('user_profile');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return null;
};

export const challengeStore = {
  getChallenges: () => {
    if (!challengesInitialized) {
      try {
        const data = localStorage.getItem(STORAGE_CHALLENGES_KEY);
        if (data) {
          challengesCache = JSON.parse(data);
        } else {
          challengesCache = [];
          localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(challengesCache));
        }
      } catch (e) {
        console.error('Error parsing challenges', e);
        challengesCache = [];
      }
      challengesInitialized = true;
    }
    return challengesCache;
  },

  saveChallenges: (challenges) => {
    challengesCache = challenges;
    localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(challenges));
    challengesInitialized = true;
    broadcastUpdate();
  },

  createChallenge: ({ opponent, startDate, endDate, tasks, backendId }) => {
    const challenges = challengeStore.getChallenges();
    const cleanTasks = tasks
      .filter(t => t && t.name && t.name.trim())
      .map((t, idx) => ({
        id: `stored_task_${Date.now()}_${idx}`,
        name: t.name.trim(),
        time: t.time ? t.time.trim() : 'Anytime'
      }));
    
    const user = getLoggedInUser();
    const challengerName = user && user.username ? user.username : 'Felix';
    const challengerPhoto = user && user.profilePhotoUrl ? user.profilePhotoUrl : null;
    
    const newChallenge = {
      id: `duel_${Date.now()}`,
      challenger: challengerName,
      challengerPhoto: challengerPhoto,
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

  toggleChallengeTask: (challengeId, username, dateStr, taskId) => {
    const challenges = challengeStore.getChallenges();
    const updated = challenges.map(ch => {
      if (ch.id === challengeId) {
        const newProgress = { ...ch.progress };
        if (!newProgress[dateStr]) newProgress[dateStr] = {};
        if (!newProgress[dateStr][username]) newProgress[dateStr][username] = {};
        
        // Toggle task for the specified user
        const currentVal = !!newProgress[dateStr][username][taskId];
        newProgress[dateStr][username][taskId] = !currentVal;

        return { ...ch, progress: newProgress };
      }
      return ch;
    });
    challengeStore.saveChallenges(updated);
  },

  // --- Normal Daily Tasks Management ---
  getNormalTasks: () => {
    if (!normalTasksInitialized) {
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
      normalTasksInitialized = true;
    }
    return normalTasksCache;
  },

  saveNormalTasks: (tasks) => {
    normalTasksCache = tasks;
    localStorage.setItem(STORAGE_NORMAL_TASKS_KEY, JSON.stringify(tasks));
    normalTasksInitialized = true;
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
