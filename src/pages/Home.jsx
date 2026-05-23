import { useSyncExternalStore, useCallback } from 'react';
import { Typography, Avatar, Badge, Space } from 'antd';
import { Flame, Target, Bell, Search, TrendingUp, MoreHorizontal, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { challengeStore } from '../utils/challengeStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/* ─────────────────────────────────────────────
   Home Task Row Component
   ───────────────────────────────────────────── */
const HomeTaskRow = ({ title, time, completed }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: completed ? '#e5ffe5' : '#ffe5e5',
      border: `1.5px solid ${completed ? '#52c41a' : '#ff4d4f'}`,
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 10,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        margin: 0, fontSize: 15, fontWeight: 700,
        color: completed ? '#1e7e34' : '#bd2130',
        textDecoration: completed ? 'line-through' : 'none',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      }}>{title}</p>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-gray)', marginTop: 2 }}>{time}</p>
    </div>

    <div style={{ flexShrink: 0 }}>
      <div style={{
        padding: '6px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: completed ? '#52c41a' : '#ff4d4f',
        color: '#fff',
        border: `1.5px solid ${completed ? '#52c41a' : '#ff4d4f'}`,
        textAlign: 'center',
        minWidth: '100px',
        boxShadow: completed ? '0 2px 8px rgba(82,196,26,0.15)' : '0 2px 8px rgba(255,77,79,0.15)',
        transition: 'all 0.2s ease',
      }}>
        {completed ? 'Complete' : 'Incomplete'}
      </div>
    </div>
  </motion.div>
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

  const subscribeToChallengeUpdates = useCallback((callback) => {
    window.addEventListener('challenge_store_update', callback);
    return () => window.removeEventListener('challenge_store_update', callback);
  }, []);

  const getChallenges = useCallback(() => challengeStore.getChallenges(), []);
  const challenges = useSyncExternalStore(
    subscribeToChallengeUpdates,
    getChallenges,
    getChallenges
  );

  const getNormalTasks = useCallback(() => challengeStore.getNormalTasks(), []);
  const normalTasks = useSyncExternalStore(
    subscribeToChallengeUpdates,
    getNormalTasks,
    getNormalTasks
  );

  const activeDuels = challenges.filter(c => c.status === 'ACTIVE');
  const soloToday = normalTasks[todayStr] || [];

  const duoToday = activeDuels.flatMap((active) =>
    active.tasks.map((task, idx) => {
      const taskName = task.name || task;
      const taskTime = task.time || '';
      return {
        id: `duel_task_${active.id}_${idx}`,
        title: taskName,
        time: `Duel vs ${active.opponent} ⚔️` + (taskTime ? ` (${taskTime})` : ''),
        completed: !!(active.progress[todayStr] &&
                      active.progress[todayStr]['Felix'] &&
                      active.progress[todayStr]['Felix'][taskName]),
        isDuelTask: true,
        challengeId: active.id
      };
    })
  );

  const totalCount = soloToday.length + duoToday.length;
  const dailyGoalPercent = totalCount === 0 ? 0 : Math.round((soloToday.filter(t => t.completed).length + duoToday.filter(t => t.completed).length) / totalCount * 100);

  const toggleTask = (task) => {
    if (task.isDuelTask) {
      challengeStore.toggleChallengeTask(task.challengeId, 'Felix', todayStr, task.title);
    } else {
      challengeStore.toggleNormalTask(todayStr, task.id);
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
            <Avatar size={50} src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" style={{ border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
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
            <Text style={{ fontSize: '14px', color: 'var(--text-gray)', fontWeight: 500 }}>GM, Felix! 👋</Text>
            <Title level={3} style={{ margin: 0, letterSpacing: '-0.5px' }}>Your Hub</Title>
          </div>
        </Space>
        <Space size={16}>
          <div className="icon-button"><Search size={22} color="#595959" /></div>
          <Badge dot color="var(--primary-orange)">
            <div className="icon-button"><Bell size={22} color="#595959" /></div>
          </Badge>
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
          <div style={{ fontSize: '24px', fontWeight: 800 }}>12 Days</div>
        </div>
        <div className="modern-card" style={{ background: '#fff', padding: '20px', color: 'var(--text-dark)', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.2 }}>
            <Target size={80} color="#ff8c00" />
          </div>
          <TrendingUp size={20} color="var(--primary-orange)" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', color: 'var(--text-gray)', fontWeight: 500 }}>DAILY GOAL</div>
          <h3 style={{ margin: '4px 0 8px', fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #ff8c00, #ffb347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{dailyGoalPercent}%</h3>
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
          <div style={{ background: 'white', borderRadius: 24, padding: '32px 16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(0,123,255,0.1))', display: 'flex', alignItems: 'center', justifycontent: 'center', margin: '0 auto 12px' }}>
              <Swords size={24} color="var(--primary-orange)" />
            </div>
            <Text style={{ color: 'var(--text-gray)', fontSize: 14 }}>No active duels for today</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>Tap here to challenge a friend! ⚔️</Text>
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
              const rates = getDuelCompletions(duel);
              const challengerName = duel.challenger === 'Jack23' ? 'Jack23' : 'Felix';
              return (
                <VSBattleCard
                  key={duel.id}
                  challenger={challengerName}
                  opponent={duel.opponent}
                  challengerRate={rates.challengerRate}
                  opponentRate={rates.opponentRate}
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
            soloToday.map(task => (
              <HomeTaskRow 
                key={task.id}
                title={task.title}
                time={task.time}
                completed={task.completed}
              />
            ))
          )}
        </div>

        {/* ⚔️ Duo Deal */}
        <div>
          <h5 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚔️</span> Duo Deal
          </h5>
          {duoToday.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>No active duel habits.</Text>
            </div>
          ) : (
            duoToday.map(task => (
              <HomeTaskRow 
                key={task.id}
                title={task.title}
                time={task.time}
                completed={task.completed}
              />
            ))
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
      `}} />
    </motion.div>
  );
};

export default Home;
