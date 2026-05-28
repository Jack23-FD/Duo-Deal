import { useState, useCallback, useEffect } from 'react';
import { DatePicker, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, Calendar, Plus, Trash2,
  Flame, Save, ChevronLeft, ChevronRight, Target,
  X, Swords
} from 'lucide-react';
import api from '../utils/api';

/* ─────────────────────────────────────────────
   Progress Ring SVG
   ───────────────────────────────────────────── */
const ProgressRing = ({ pct, size = 80, stroke = 7, colorA = '#ff8c00', colorB = '#ffb347' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const id = `ring-${colorA.replace('#', '')}`;
  return (
    <svg width={size} height={size}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorA} />
          <stop offset="100%" stopColor={colorB} />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#f0f0f0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={`url(#${id})`} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
};

/* ─────────────────────────────────────────────
   Status Toggle Badge Helper
   ───────────────────────────────────────────── */
const StatusBadge = ({ completed }) => (
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
);


/* ─────────────────────────────────────────────
   Duo Task Row (for Duo Deal tasks - Felix only)
   ───────────────────────────────────────────── */
const DuoTaskRow = ({ title, completed, onToggle }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onToggle}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: completed ? '#e5ffe5' : '#ffffff',
      border: completed ? '1px solid #52c41a' : '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 10,
      cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-dark)',
        wordBreak: 'break-word',
        lineHeight: 1.2
      }}>{title}</span>
    </div>

    <div style={{ flexShrink: 0 }}>
      <StatusBadge completed={completed} />
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */
const Activity = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState({});
  const [messageApi, contextHolder] = message.useMessage();

  const dateKey = selectedDate.format('YYYY-MM-DD');

  const getLoggedInUser = () => {
    try {
      const data = localStorage.getItem('user_profile');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return null;
  };
  const loggedIn = getLoggedInUser();
  const currentUsername = loggedIn && loggedIn.username ? loggedIn.username : 'Felix';

  const [soloTasks, setSoloTasks] = useState([]);
  const [activeDuels, setActiveDuels] = useState([]);
  const [duoProgressMap, setDuoProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSoloTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/solo-tasks`, { params: { date: dateKey } });
      setSoloTasks(res.data);
    } catch (err) {
      console.error('Failed to load solo tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [dateKey]);

  const fetchActiveDuelsAndProgress = useCallback(async () => {
    try {
      const res = await api.get('/duels/my');
      const activeForDate = res.data.filter(ch => {
        if (ch.status !== 'ACTIVE') return false;
        const startStr = dayjs(ch.startDate).format('YYYY-MM-DD');
        const endStr = dayjs(ch.endDate).format('YYYY-MM-DD');
        const targetStr = selectedDate.format('YYYY-MM-DD');
        return targetStr >= startStr && targetStr <= endStr;
      });
      setActiveDuels(activeForDate);

      const progressPromises = activeForDate.map(d => api.get(`/duels/${d.id}/progress`));
      const progressResponses = await Promise.all(progressPromises);
      const newProgressMap = {};
      progressResponses.forEach((pRes, idx) => {
        const d = activeForDate[idx];
        newProgressMap[d.id] = pRes.data;
      });
      setDuoProgressMap(newProgressMap);
    } catch (err) {
      console.error('Failed to load active duels and progress:', err);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSoloTasks();
    fetchActiveDuelsAndProgress();
  }, [fetchSoloTasks, fetchActiveDuelsAndProgress]);

  useEffect(() => {
    window.addEventListener('activity_saved', fetchActiveDuelsAndProgress);
    return () => window.removeEventListener('activity_saved', fetchActiveDuelsAndProgress);
  }, [fetchActiveDuelsAndProgress]);

  // Combined Progress Calculation: Solo Deal tasks + Felix's Duo Deal tasks
  const soloTotal = soloTasks.length;
  const soloDone = soloTasks.filter(t => t.isCompleted).length;

  let duoTotal = 0;
  let duoDone = 0;

  activeDuels.forEach(duel => {
    const progressData = duoProgressMap[duel.id];
    (duel.tasks || []).forEach((task) => {
      duoTotal++;
      const isCompleted = !!(progressData &&
                             progressData.dailyProgress &&
                             progressData.dailyProgress[dateKey] &&
                             progressData.dailyProgress[dateKey][currentUsername] &&
                             progressData.dailyProgress[dateKey][currentUsername][task.id]);
      if (isCompleted) duoDone++;
    });
  });

  const total = soloTotal + duoTotal;
  const done = soloDone + duoDone;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  /* navigation */
  const shiftDate = (days) => {
    setSelectedDate(d => d.add(days, 'day'));
  };
  const isToday = selectedDate.isSame(dayjs(), 'day');

  /* toggle solo task */
  const toggleSoloTask = useCallback(async (taskId) => {
    try {
      const res = await api.patch(`/solo-tasks/${taskId}/complete`);
      setSoloTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: res.data.isCompleted } : t));
      setSaved(prev => ({ ...prev, [dateKey]: false }));
      window.dispatchEvent(new Event('activity_saved'));
    } catch (err) {
      console.error('Failed to toggle solo task:', err);
    }
  }, [dateKey]);

  /* delete solo task */
  const deleteSoloTask = useCallback(async (taskId) => {
    try {
      await api.delete(`/solo-tasks/${taskId}`);
      setSoloTasks(prev => prev.filter(t => t.id !== taskId));
      setSaved(prev => ({ ...prev, [dateKey]: false }));
      window.dispatchEvent(new Event('activity_saved'));
    } catch (err) {
      console.error('Failed to delete solo task:', err);
    }
  }, [dateKey]);

  /* add solo task */
  const addSoloTask = async () => {
    if (!newTitle.trim()) return;
    const formattedTime = newTime.trim() || 'Anytime';
    try {
      const res = await api.post('/solo-tasks', {
        taskName: newTitle.trim(),
        taskTime: formattedTime,
        taskDate: dateKey
      });
      setSoloTasks(prev => [...prev, res.data]);
      setNewTitle('');
      setNewTime('');
      setAdding(false);
      setSaved(prev => ({ ...prev, [dateKey]: false }));
      window.dispatchEvent(new Event('activity_saved'));
    } catch (err) {
      console.error('Failed to add solo task:', err);
    }
  };

  const toggleLocalDuoProgress = (duelId, taskId, completedState) => {
    setDuoProgressMap(prev => {
      const duelProgress = prev[duelId] ? { ...prev[duelId] } : {};
      const dailyProgress = duelProgress.dailyProgress ? { ...duelProgress.dailyProgress } : {};
      const dayProgress = dailyProgress[dateKey] ? { ...dailyProgress[dateKey] } : {};
      const userProgress = dayProgress[currentUsername] ? { ...dayProgress[currentUsername] } : {};
      
      userProgress[taskId] = completedState;
      dayProgress[currentUsername] = userProgress;
      dailyProgress[dateKey] = dayProgress;
      duelProgress.dailyProgress = dailyProgress;
      
      return {
        ...prev,
        [duelId]: duelProgress
      };
    });
  };

  /* save completions and redirect */
  const handleSave = () => {
    setSaved(prev => ({ ...prev, [dateKey]: true }));
    messageApi.success({ content: 'Activity saved! Redirecting to Home...', duration: 1.5 });
    setTimeout(() => {
      navigate('/');
    }, 1200);
  };

  /* label */
  const dateLabel = isToday
    ? 'Today'
    : selectedDate.isSame(dayjs().subtract(1, 'day'), 'day')
    ? 'Yesterday'
    : selectedDate.format('ddd, DD MMM YYYY');

  return (
    <div className="page-container" style={{ background: '#fafafa', minHeight: '100vh' }}>
      {contextHolder}

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 24 }}
      >
        <h2 style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span style={{ background: 'var(--gradient-orange)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Activities</span>
        </h2>
      </motion.div>

      {/* ── Date Navigator ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          borderRadius: 20,
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          marginBottom: 20,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <button onClick={() => shiftDate(-1)} style={arrowBtn}>
          <ChevronLeft size={20} color="var(--primary-orange)" />
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>{dateLabel}</p>
          <DatePicker
            value={selectedDate}
            onChange={(d) => { if (d) { setSelectedDate(d); } }}
            format="DD MMM YYYY"
            allowClear={false}
            style={{
              border: 'none', boxShadow: 'none', background: 'transparent',
              padding: '2px 0', fontSize: 12
            }}
          />
        </div>

        <button
          onClick={() => shiftDate(1)}
          disabled={isToday}
          style={{ ...arrowBtn, opacity: isToday ? 0.3 : 1 }}
        >
          <ChevronRight size={20} color="var(--primary-orange)" />
        </button>
      </motion.div>

      {/* ── Progress Card (Combined progress percentage) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        style={{
          background: 'linear-gradient(135deg, #ff8c00 0%, #ffb347 50%, #007bff 150%)',
          borderRadius: 24,
          padding: '22px 24px',
          color: '#fff',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 30px rgba(255,140,0,0.35)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* bg decoration */}
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
          <Target size={120} color="white" />
        </div>

        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, opacity: 0.85, letterSpacing: 1 }}>DAILY PROGRESS</p>
          <h3 style={{ margin: '4px 0 8px', fontSize: 28, fontWeight: 800 }}>{pct}%</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <Chip icon={<CheckCircle2 size={13} />} label={`${done} Done`} />
            <Chip icon={<Circle size={13} />} label={`${total - done} Left`} />
          </div>
          {total > 0 && (
            <div style={{ marginTop: 14, width: 160, height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 99 }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ height: '100%', background: '#fff', borderRadius: 99 }}
              />
            </div>
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <ProgressRing pct={pct} size={84} stroke={8} colorA="#fff" colorB="rgba(255,255,255,0.6)" />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            textAlign: 'center'
          }}>
            <Flame size={22} color="#fff" />
          </div>
        </div>
      </motion.div>

      {/* ── SECTION 1: 📋 Solo Deal ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: '20px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          marginBottom: 24,
          border: '1px solid rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h4 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📋</span> Solo Deal
            </h4>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-gray)' }}>
              {soloTotal === 0 ? 'No personal habits' : `${soloTotal} habit${soloTotal > 1 ? 's' : ''} planned`}
            </p>
          </div>
          <button onClick={() => setAdding(a => !a)} style={addBtn}>
            {adding ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {/* Add Task Form */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 14 }}
            >
              <div style={{
                background: '#fafafa', borderRadius: 16,
                padding: 14, border: '1px dashed var(--primary-orange)'
              }}>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSoloTask()}
                  placeholder="Habit title..."
                  style={inputStyle}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    placeholder="Time (e.g. 08:00 AM) — Optional"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={addSoloTask} style={saveSmallBtn}>Add</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Habits List */}
        <AnimatePresence>
          {soloTasks.length === 0 && !adding ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '24px 0' }}
            >
              <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: 14 }}>No personal habits set for today</p>
              <button
                onClick={() => setAdding(true)}
                style={{ ...saveSmallBtn, marginTop: 12, padding: '8px 20px' }}
              >
                + Add Habit
              </button>
            </motion.div>
          ) : (
            soloTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: task.isCompleted ? '#e5ffe5' : '#ffffff',
                  border: task.isCompleted ? '1px solid #52c41a' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16,
                  padding: '14px 16px',
                  marginBottom: 10,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                }}
                onClick={() => toggleSoloTask(task.id)}
                whileTap={{ scale: 0.98 }}
              >
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 15, fontWeight: 600,
                    color: 'var(--text-dark)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>{task.taskName}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-gray)', marginTop: 2 }}>{task.taskTime}</p>
                </div>

                {/* Status Badge */}
                <div style={{ flexShrink: 0 }}>
                  <StatusBadge completed={task.isCompleted} />
                </div>

                {/* Delete */}
                <div
                  onClick={e => { e.stopPropagation(); deleteSoloTask(task.id); }}
                  style={{ padding: 4, opacity: 0.4, transition: 'opacity 0.2s', marginLeft: 8 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                >
                  <Trash2 size={16} color="#ff4d4f" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── SECTION 2: ⚔️ Duo Deal (Vertically stacked, Felix only) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ padding: '0 4px', marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚔️</span> Duo Deal
          </h4>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-gray)' }}>
            {activeDuels.length === 0 ? 'No active duels' : `${activeDuels.length} active duel${activeDuels.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {activeDuels.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 24,
            padding: '32px 16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(0,123,255,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Swords size={24} color="var(--primary-orange)" />
            </div>
            <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: 14 }}>No active duels for today</p>
            <p style={{ margin: '4px 0 0', color: '#bfbfbf', fontSize: 12 }}>Accept challenges from DuoMail to start!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeDuels.map((duel) => {
              const progressData = duoProgressMap[duel.id];
              // Calculate today's completion stats for current user
              const userDoneToday = (duel.tasks || []).filter(t => {
                return !!(progressData &&
                          progressData.dailyProgress &&
                          progressData.dailyProgress[dateKey] &&
                          progressData.dailyProgress[dateKey][currentUsername] &&
                          progressData.dailyProgress[dateKey][currentUsername][t.id]);
              }).length;

              const opponentDisplay = duel.challengerName === currentUsername ? duel.opponentName : duel.challengerName;

              return (
                <div key={duel.id} style={{
                  background: '#fff',
                  borderRadius: 24,
                  padding: '32px 24px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}>
                  {/* Duel Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Swords size={18} color="var(--primary-orange)" />
                      <span>vs </span>
                      <span style={{ background: 'var(--gradient-orange)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {opponentDisplay}
                      </span>
                    </span>
                    <span style={{
                      fontSize: 11,
                      background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(0,123,255,0.05))',
                      color: 'var(--primary-orange)',
                      padding: '4px 12px',
                      borderRadius: 99,
                      fontWeight: 700,
                      letterSpacing: '0.2px'
                    }}>
                      {Math.max(0, dayjs(duel.endDate).diff(selectedDate, 'day') + 1)} DAYS LEFT
                    </span>
                  </div>

                  {/* Tasks List (Felix/Logged-in User only) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(duel.tasks || []).map((task, idx) => {
                      const taskName = task.taskName || task.name || task;
                      const taskTime = task.taskTime || task.time || '';
                      const isCompleted = !!(progressData &&
                                             progressData.dailyProgress &&
                                             progressData.dailyProgress[dateKey] &&
                                             progressData.dailyProgress[dateKey][currentUsername] &&
                                             progressData.dailyProgress[dateKey][currentUsername][task.id]);
                      return (
                        <DuoTaskRow
                          key={`user_${idx}`}
                          title={taskName + (taskTime ? ` (${taskTime})` : '')}
                          completed={isCompleted}
                          onToggle={async () => {
                             const currentlyCompleted = isCompleted;
                             const newCompletedState = !currentlyCompleted;
                             
                             // Optimistic update
                             toggleLocalDuoProgress(duel.id, task.id, newCompletedState);
                             
                             try {
                               await api.patch(`/duels/tasks/${task.id}/complete`, null, { params: { date: dateKey } });
                               setSaved(prev => ({ ...prev, [dateKey]: false }));
                               window.dispatchEvent(new Event('activity_saved'));
                             } catch (err) {
                               console.error('Failed to toggle duel task:', err);
                               message.error('Failed to toggle task ⚔️');
                               // Revert back on failure
                               toggleLocalDuoProgress(duel.id, task.id, currentlyCompleted);
                             }
                           }}
                        />
                      );
                    })}
                  </div>

                  {/* Card Footer - Felix Progress comparison */}
                  <div style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--text-gray)', fontWeight: 600 }}>
                      Your Progress: <strong style={{ color: 'var(--primary-orange)' }}>{userDoneToday}/{duel.tasks.length}</strong> Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Save Activity Button ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleSave}
          disabled={saved[dateKey]}
          style={{
            width: '100%',
            padding: '16px',
            border: 'none',
            borderRadius: 20,
            background: saved[dateKey]
              ? 'linear-gradient(135deg, #52c41a, #73d13d)'
              : 'linear-gradient(135deg, #ff8c00, #ffb347)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: saved[dateKey] ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: saved[dateKey]
              ? '0 8px 24px rgba(82,196,26,0.35)'
              : '0 8px 24px rgba(255,140,0,0.4)',
            transition: 'all 0.35s ease',
            fontFamily: 'inherit',
            transform: 'translateY(0)',
          }}
          onMouseEnter={e => { if (!saved[dateKey]) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {saved[dateKey] ? (
            <><CheckCircle2 size={20} /> Activity Saved!</>
          ) : (
            <><Save size={20} /> Save Activity</>
          )}
        </button>
      </motion.div>
    </div>
  );
};

/* ── Helpers ── */
const Chip = ({ icon, label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'rgba(255,255,255,0.25)', borderRadius: 99,
    padding: '3px 10px', fontSize: 12, fontWeight: 600, color: '#fff'
  }}>
    {icon} {label}
  </div>
);

const arrowBtn = {
  width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(255,140,0,0.2)',
  background: 'rgba(255,140,0,0.06)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.2s',
};

const addBtn = {
  width: 38, height: 38, borderRadius: 12, border: 'none',
  background: 'linear-gradient(135deg, #ff8c00, #ffb347)',
  color: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 14px rgba(255,140,0,0.35)', transition: 'all 0.2s',
};

const saveSmallBtn = {
  padding: '8px 16px', borderRadius: 10, border: 'none',
  background: 'linear-gradient(135deg, #ff8c00, #ffb347)',
  color: '#fff', fontWeight: 600, fontSize: 13,
  cursor: 'pointer', fontFamily: 'inherit',
};

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 12,
  border: '1px solid var(--border-gray)', fontSize: 14,
  fontFamily: 'inherit', outline: 'none',
  background: '#fff', color: 'var(--text-dark)',
  boxSizing: 'border-box',
};

export default Activity;
