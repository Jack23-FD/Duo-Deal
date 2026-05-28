import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import { Typography, Avatar, Badge, Space } from 'antd';
import { Flame, Target, Bell, Search, TrendingUp, MoreHorizontal, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/* ─────────────────────────────────────────────
   Home Task Row Component
   ───────────────────────────────────────────── */
const HomeTaskRow = ({ title, time, completed }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: completed ? '#e5ffe5' : '#ffffff',
      border: completed ? '1.5px solid #52c41a' : '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 10,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{
        margin: 0, fontSize: 15, fontWeight: 700,
        color: completed ? '#1e7e34' : 'var(--text-dark)',
        wordBreak: 'break-word',
        lineHeight: '1.4',
        padding: '2px 0',
        display: 'block'
      }}>{title}</span>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-gray)', marginTop: 2 }}>{time}</p>
    </div>
  </div>
);

const getDuelCompletions = (duel) => {
  const start = dayjs(duel.startDate);
  const end = dayjs(duel.endDate);
  const totalDays = end.diff(start, 'day') + 1;

  let challengerTotal = 0;
  let challengerDone = 0;
  let opponentTotal = 0;
  let opponentDone = 0;

  // Use the seed/stored date range keys to verify progress
  for (let i = 0; i < totalDays; i++) {
    const dStr = start.add(i, 'day').format('YYYY-MM-DD');
    duel.tasks.forEach(t => {
      const taskName = t.name || t;
      
      challengerTotal++;
      const challengerCompleted = !!(duel.progress[dStr] &&
                                     duel.progress[dStr][duel.challenger] &&
                                     duel.progress[dStr][duel.challenger][taskName]);
      if (challengerCompleted) challengerDone++;

      opponentTotal++;
      const opponentCompleted = !!(duel.progress[dStr] &&
                                   duel.progress[dStr][duel.opponent] &&
                                   duel.progress[dStr][duel.opponent][taskName]);
      if (opponentCompleted) opponentDone++;
    });
  }

  return {
    challengerRate: challengerTotal === 0 ? 0 : Math.round((challengerDone / challengerTotal) * 100),
    opponentRate: opponentTotal === 0 ? 0 : Math.round((opponentDone / opponentTotal) * 100)
  };
};

const VSBattleCard = ({ challenger, opponent, challengerRate, opponentRate }) => (
  <div style={{
    width: '100%',
    minWidth: '280px',
    height: '140px',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)',
    position: 'relative',
    flexShrink: 0,
    scrollSnapAlign: 'start'
  }}>
    {/* Left Half - Challenger (Blue bg) */}
    <div style={{
      flex: 1,
      background: 'linear-gradient(135deg, #007bff 0%, #00c6ff 100%)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {challenger}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 900, marginTop: '6px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
        {challengerRate}%
      </div>
    </div>

    {/* Center VS circle */}
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#475569',
      fontWeight: 900,
      fontSize: '13px',
      boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
      border: '3px solid white',
      zIndex: 10
    }}>
      VS
    </div>

    {/* Right Half - Opponent (Orange bg) */}
    <div style={{
      flex: 1,
      background: 'linear-gradient(135deg, #ff8c00 0%, #ffb347 100%)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {opponent}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 900, marginTop: '6px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
        {opponentRate}%
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Home Component
   ───────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const todayStr = dayjs().format('YYYY-MM-DD');
  const [streakDays, setStreakDays] = useState(0);
  const [userName, setUserName] = useState('Felix');
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        console.log('User API response:', res.data); // check streakDays here
        setStreakDays(res.data.streakDays ?? res.data.streak_days ?? 0);
        setUserName(res.data.username || 'Felix');
        setUserAvatar(res.data.profilePhotoUrl || null);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
    window.addEventListener('activity_saved', fetchUser);
    return () => window.removeEventListener('activity_saved', fetchUser);
  }, []);

  const [activeDuels, setActiveDuels] = useState([]);
  const [duoProgressMap, setDuoProgressMap] = useState({});

  const fetchActiveDuels = useCallback(async () => {
    try {
      const res = await api.get('/duels/my');
      const activeFromApi = res.data.filter(d => {
        if (d.status !== 'ACTIVE') return false;
        const startStr = dayjs(d.startDate).format('YYYY-MM-DD');
        const endStr = dayjs(d.endDate).format('YYYY-MM-DD');
        return todayStr >= startStr && todayStr <= endStr;
      });
      setActiveDuels(activeFromApi);
      
      const progressPromises = activeFromApi.map(d => api.get(`/duels/${d.id}/progress`));
      const progressResponses = await Promise.all(progressPromises);
      const newProgressMap = {};
      progressResponses.forEach((pRes, idx) => {
        const d = activeFromApi[idx];
        newProgressMap[d.id] = pRes.data;
      });
      setDuoProgressMap(newProgressMap);
    } catch (err) {
      console.error('Failed to load active duels/progress from database:', err);
    }
  }, [todayStr]);

  const [soloToday, setSoloToday] = useState([]);

  const fetchSoloToday = useCallback(async () => {
    try {
      const res = await api.get('/solo-tasks', { params: { date: todayStr } });
      setSoloToday(res.data);
    } catch (err) {
      console.error("Failed to load today's solo tasks:", err);
    }
  }, [todayStr]);

  useEffect(() => {
    fetchSoloToday();
    fetchActiveDuels();
    window.addEventListener('activity_saved', fetchSoloToday);
    window.addEventListener('activity_saved', fetchActiveDuels);
    return () => {
      window.removeEventListener('activity_saved', fetchSoloToday);
      window.removeEventListener('activity_saved', fetchActiveDuels);
    };
  }, [fetchSoloToday, fetchActiveDuels]);

  const getLoggedInUser = () => {
    try {
      const data = localStorage.getItem('user_profile');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return null;
  };
  const loggedIn = getLoggedInUser();
  const currentUsername = loggedIn && loggedIn.username ? loggedIn.username : 'Felix';

  const duoToday = activeDuels.flatMap((active) => {
    const progressData = duoProgressMap[active.id];
    const opponentName = active.challengerName === currentUsername ? active.opponentName : active.challengerName;
    return (active.tasks || []).map((task) => {
      const taskName = task.taskName || task.name || task;
      const taskTime = task.taskTime || task.time || '';
      const completed = !!(progressData &&
                           progressData.dailyProgress &&
                           progressData.dailyProgress[todayStr] &&
                           progressData.dailyProgress[todayStr][currentUsername] &&
                           progressData.dailyProgress[todayStr][currentUsername][task.id]);
      return {
        id: task.id,
        title: taskName,
        time: `Duel vs ${opponentName} ⚔️` + (taskTime ? ` (${taskTime})` : ''),
        completed: completed,
        isDuelTask: true,
        challengeId: active.id
      };
    });
  });

  const totalCount = soloToday.length + duoToday.length;
  const dailyGoalPercent = totalCount === 0 ? 0 : Math.round((soloToday.filter(t => t.isCompleted).length + duoToday.filter(t => t.completed).length) / totalCount * 100);

  const toggleLocalDuoProgress = (duelId, taskId, completedState) => {
    setDuoProgressMap(prev => {
      const duelProgress = prev[duelId] ? { ...prev[duelId] } : {};
      const dailyProgress = duelProgress.dailyProgress ? { ...duelProgress.dailyProgress } : {};
      const dayProgress = dailyProgress[todayStr] ? { ...dailyProgress[todayStr] } : {};
      const userProgress = dayProgress[currentUsername] ? { ...dayProgress[currentUsername] } : {};
      
      userProgress[taskId] = completedState;
      dayProgress[currentUsername] = userProgress;
      dailyProgress[todayStr] = dayProgress;
      duelProgress.dailyProgress = dailyProgress;
      
      return {
        ...prev,
        [duelId]: duelProgress
      };
    });
  };

  const toggleTask = async (task) => {
    if (task.isDuelTask) {
      const currentlyCompleted = task.completed;
      const newCompletedState = !currentlyCompleted;
      
      // Optimistic update
      toggleLocalDuoProgress(task.challengeId, task.id, newCompletedState);
      
      try {
        await api.patch(`/duels/tasks/${task.id}/complete`, null, { params: { date: todayStr } });
        window.dispatchEvent(new Event('activity_saved'));
      } catch (err) {
        console.error('Failed to toggle duel task:', err);
        // Revert back on failure
        toggleLocalDuoProgress(task.challengeId, task.id, currentlyCompleted);
      }
    } else {
      try {
        const res = await api.patch(`/solo-tasks/${task.id}/complete`);
        setSoloToday(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: res.data.isCompleted } : t));
        window.dispatchEvent(new Event('activity_saved'));
      } catch (err) {
        console.error('Failed to toggle task:', err);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="page-container"
      style={{ background: '#fafafa' }}
    >
      {/* Premium Header */}
      <motion.div variants={itemVariants} style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '28px',
        padding: '8px 0'
      }}>
        <Space size={16}>
          <div style={{ position: 'relative' }}>
            <Avatar size={50} src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} style={{ border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              width: 14, 
              height: 14, 
              background: '#52c41a', 
              borderRadius: '50%', 
              border: '2px solid white' 
            }} />
          </div>
          <div>
            <Text style={{ fontSize: '14px', color: 'var(--text-gray)', fontWeight: 500 }}>GM, {userName}! 👋</Text>
            <Title level={3} style={{ margin: 0, letterSpacing: '-0.5px' }}>Your Hub</Title>
          </div>
        </Space>
      </motion.div>

      {/* Stats Board */}
      <motion.div variants={itemVariants} style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px', 
        marginBottom: '28px' 
      }}>
        <div className="modern-card" style={{ 
          background: 'var(--gradient-orange)', 
          padding: '20px', 
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.2 }}>
            <Flame size={80} color="white" />
          </div>
          <Flame size={20} color="white" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>CURR. STREAK</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{streakDays} Days</div>
        </div>
        <div className="modern-card" style={{ 
          background: 'linear-gradient(135deg, #007bff 0%, #00c6ff 100%)', 
          padding: '20px', 
          color: 'white', 
          position: 'relative', 
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.2 }}>
            <Target size={80} color="white" />
          </div>
          <TrendingUp size={20} color="white" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>DAILY GOAL</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{dailyGoalPercent}%</div>
        </div>
      </motion.div>

      {/* ── Ongoing Deals Section ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Ongoing Deals</Title>
          <Text strong onClick={() => navigate('/challenges')} style={{ color: 'var(--primary-orange)', fontSize: '14px', cursor: 'pointer' }}>View All</Text>
        </div>
        {activeDuels.length === 0 ? (
          <div
            onClick={() => navigate('/challenges')}
            style={{
              background: 'white',
              borderRadius: 24,
              padding: '32px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
            className="empty-deal-card"
          >
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,140,0,0.15), rgba(0,123,255,0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Swords size={24} color="var(--primary-orange)" />
            </div>
            <Text style={{ color: 'var(--text-gray)', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 2 }}>
              No active duels for today
            </Text>
            <Text style={{ color: 'var(--primary-orange)', fontSize: 11, fontWeight: 600, display: 'block' }}>
              Tap here to challenge a friend! ⚔️
            </Text>
          </div>
        ) : (
          <div className="ongoing-deals-track" style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            gap: '12px',
            paddingBottom: '8px',
            WebkitOverflowScrolling: 'touch'
          }}>
            {activeDuels.map((duel) => {
              const rates = duoProgressMap[duel.id] || {};
              const challengerName = duel.challengerName;
              const opponentName = duel.opponentName;
              const challengerRate = rates.challengerCompletionRate ?? duel.challengerCompletionRate ?? 0;
              const opponentRate = rates.opponentCompletionRate ?? duel.opponentCompletionRate ?? 0;
              return (
                <VSBattleCard
                  key={duel.id}
                  challenger={challengerName}
                  opponent={opponentName}
                  challengerRate={challengerRate}
                  opponentRate={opponentRate}
                />
              );
            })}
          </div>
        )}
      </motion.section>

      {/* Today's Tasks (View-Only habits) */}
      <motion.section variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Today's Tasks</Title>
          <div onClick={() => navigate('/activity')} style={{ cursor: 'pointer' }}>
            <MoreHorizontal size={20} color="var(--text-gray)" />
          </div>
        </div>

        {/* 📋 Solo Deal */}
        <div style={{ marginBottom: '24px' }}>
          <h5 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📋</span> Solo Deal
          </h5>
          {soloToday.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', marginBottom: '8px' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>No personal habits planned.</Text>
            </div>
          ) : (
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '16px 20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📋</span>
                <span>Solo Habits</span>
              </div>
              <div>
                {soloToday.map(task => (
                  <HomeTaskRow 
                    key={task.id}
                    title={task.taskName}
                    time={task.taskTime}
                    completed={task.isCompleted}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ⚔️ Duo Deal */}
        <div>
          <h5 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚔️</span> Duo Deal
          </h5>
          {activeDuels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>No active duel habits.</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeDuels.map(duel => (
                <div key={duel.id} style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '16px 20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Swords size={16} color="var(--primary-orange)" />
                    <span>{duel.opponentName === currentUsername ? duel.challengerName : duel.opponentName}</span>
                  </div>
                  <div>
                    {(duel.tasks || []).map((task, idx) => {
                      const taskName = task.taskName || task.name || task;
                      const taskTime = task.taskTime || task.time || '';
                      const progressData = duoProgressMap[duel.id];
                      const isCompleted = !!(progressData &&
                                             progressData.dailyProgress &&
                                             progressData.dailyProgress[todayStr] &&
                                             progressData.dailyProgress[todayStr][currentUsername] &&
                                             progressData.dailyProgress[todayStr][currentUsername][task.id]);
                      return (
                        <HomeTaskRow
                          key={`${duel.id}_${idx}`}
                          title={taskName}
                          time={taskTime || 'Anytime'}
                          completed={isCompleted}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <style dangerouslySetInnerHTML={{ __html: `
        .icon-button {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-button:active {
          transform: scale(0.95);
        }
        .ongoing-deals-track::-webkit-scrollbar {
          display: none;
        }
        .empty-deal-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .empty-deal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
        }
        .empty-deal-card:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04) !important;
        }
      `}} />
    </motion.div>
  );
};

export default Home;
