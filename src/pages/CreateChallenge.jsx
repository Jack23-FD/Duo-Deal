import { useState, useRef, useEffect } from 'react';
import { Typography, Input, DatePicker, Button, Space, Avatar, message } from 'antd';
import { Search, Plus, Trash2, Swords, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CreateChallenge = () => {
  const [tasks, setTasks] = useState([{ name: '', time: '' }]);
  const [opponent, setOpponent] = useState('');
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [selectedOpponentId, setSelectedOpponentId] = useState(null);
  const [selectedOpponentEmail, setSelectedOpponentEmail] = useState(null);
  const [selectedOpponentPhoto, setSelectedOpponentPhoto] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [isSending, setIsSending] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestedUsers([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpponentInput = async (e) => {
    const val = e.target.value;
    setOpponent(val);
    setSelectedOpponent(null);
    setSelectedOpponentId(null);
    setSelectedOpponentEmail(null);
    setSelectedOpponentPhoto(null);
    if (val.trim().length < 3) { setSuggestedUsers([]); return; }
    try {
      const res = await api.get('/users/search', { params: { username: val.trim() } });
      setSuggestedUsers(res.data || []);
    } catch (err) {
      console.error('User search failed:', err?.response?.status, err?.response?.data || err?.message);
      setSuggestedUsers([]);
    }
  };

  const selectOpponent = (user) => {
    setOpponent(user.username);
    setSelectedOpponent(user.username);
    setSelectedOpponentId(user.id);
    setSelectedOpponentEmail(user.email);
    setSelectedOpponentPhoto(user.profilePhotoUrl);
    setSuggestedUsers([]);
  };

  const addTask = () => setTasks([...tasks, { name: '', time: '' }]);
  const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));
  const updateTaskName = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], name: value };
    setTasks(newTasks);
  };
  const updateTaskTime = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], time: value };
    setTasks(newTasks);
  };

  const handleCreate = async () => {
    if (!selectedOpponent) { message.warning('Please select an opponent first.'); return; }
    if (!dateRange[0] || !dateRange[1]) { message.warning('Please select a duration.'); return; }
    if (tasks.filter(t => !t.name.trim()).length > 0) { message.warning('Please fill in all task names.'); return; }

    setIsSending(true);
    try {
      const res = await api.post('/duels', {
        opponentId: selectedOpponentId,
        opponentUsernameOrEmail: selectedOpponent,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        tasks: tasks.map(t => ({ taskName: t.name.trim(), taskTime: t.time.trim() || 'Anytime' }))
      });

      message.success('Challenge Sent! 🎯 Email delivered to opponent.');
      setTasks([{ name: '', time: '' }]);
      setOpponent('');
      setSelectedOpponent(null);
      setSelectedOpponentId(null);
      setSelectedOpponentEmail(null);
      setSelectedOpponentPhoto(null);
      setDateRange([null, null]);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create challenge');
    } finally {
      setIsSending(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      style={{ background: '#fafafa', paddingBottom: '100px' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'linear-gradient(135deg, #ff8c00, #007bff)',
          borderRadius: '16px', padding: '20px', color: 'white',
          boxShadow: '0 8px 24px rgba(255,140,0,0.15)'
        }}>
          <Swords size={32} />
          <div>
            <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 800 }}>New Duel ⚔️</Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>Challenge a friend to a habit battle</Text>
          </div>
        </div>
      </motion.div>

      {/* Find Opponent — NO modern-card class, overflow visible */}
      <motion.div
        variants={itemVariants}
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          padding: '20px',
          marginBottom: '16px',
          overflow: 'visible',  /* CRITICAL — allows dropdown to float */
          position: 'relative',
          zIndex: 100
        }}
      >
        <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '12px', color: '#1e293b' }}>
          <span style={{ color: 'var(--primary-orange)' }}>①</span> Find Opponent
        </Text>

        {/* Search wrapper — relative so dropdown anchors here */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <Input
            prefix={<Search size={16} color="var(--primary-orange)" />}
            placeholder="Type username to search..."
            value={opponent}
            onChange={handleOpponentInput}
            style={{ borderRadius: '10px', height: '44px', border: '1.5px solid #e2e8f0' }}
          />

          {/* Dropdown — absolute, floats OVER everything below */}
          {suggestedUsers.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 99999,
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1.5px solid #E8820C',
              overflow: 'hidden'
            }}>
              {suggestedUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => selectOpponent(u)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <Avatar
                    size={36}
                    src={u.profilePhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                  />
                  <Text style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{u.username}</Text>
                  <span style={{
                    marginLeft: 'auto', padding: '3px 10px', borderRadius: '20px',
                    background: 'rgba(249,115,22,0.08)', color: 'var(--primary-orange)',
                    fontSize: '11px', fontWeight: 700
                  }}>
                    @{u.username.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Opponent Badge */}
        <AnimatePresence>
          {selectedOpponent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px',
                background: 'linear-gradient(90deg, #fff7ed, #eff6ff)',
                border: '1.5px solid #ffedd5', borderRadius: '12px', padding: '12px 16px'
              }}
            >
              <Avatar
                size={40}
                src={selectedOpponentPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedOpponent}`}
              />
              <div style={{ flex: 1 }}>
                <Text strong style={{ display: 'block' }}>{selectedOpponent}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>Ready to battle! ⚔️</Text>
              </div>
              <span style={{ fontSize: '10px', background: '#f97316', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                OPPONENT
              </span>
              <Button
                type="text" danger size="small"
                onClick={() => { setOpponent(''); setSelectedOpponent(null); setSelectedOpponentId(null); setSelectedOpponentPhoto(null); }}
                style={{ borderRadius: '50%', width: 28, height: 28, padding: 0, background: '#fee2e2' }}
              >
                ✕
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Duration — modern-card class OK here */}
      <motion.div variants={itemVariants} className="modern-card" style={{ padding: '20px', marginBottom: '16px' }}>
        <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '12px', color: '#1e293b' }}>
          <span style={{ color: 'var(--primary-orange)' }}>②</span> Duration
        </Text>
        <RangePicker
          style={{ width: '100%', borderRadius: '10px', height: '44px', border: '1.5px solid #e2e8f0' }}
          onChange={(dates) => setDateRange(dates || [null, null])}
          value={dateRange}
        />
      </motion.div>

      {/* Daily Tasks */}
      <motion.div variants={itemVariants} className="modern-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '15px', color: '#1e293b' }}>
            <span style={{ color: 'var(--primary-orange)' }}>③</span> Daily Tasks
          </Text>
          <Button type="text" icon={<Plus size={15} />} onClick={addTask} style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>
            Add Task
          </Button>
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #ff8c00, #007bff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '12px'
                }}>
                  {index + 1}
                </div>
                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                  <Input
                    placeholder="Task name (required)"
                    value={task.name}
                    onChange={(e) => updateTaskName(index, e.target.value)}
                    style={{ borderRadius: '10px', flex: 2, height: '40px' }}
                  />
                  <Input
                    placeholder="Time (optional)"
                    value={task.time}
                    onChange={(e) => updateTaskTime(index, e.target.value)}
                    style={{ borderRadius: '10px', flex: 1, height: '40px' }}
                  />
                </div>
                {tasks.length > 1 && (
                  <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => removeTask(index)} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </Space>
      </motion.div>

      {/* Send Button */}
      <motion.div variants={itemVariants}>
        <Button
          block size="large" onClick={handleCreate}
          loading={isSending} disabled={isSending}
          style={{
            background: 'linear-gradient(135deg, #ff8c00, #007bff)',
            border: 'none', color: 'white', fontWeight: 700,
            borderRadius: '12px', height: '52px', fontSize: '16px',
            boxShadow: '0 8px 20px rgba(255,140,0,0.35)', cursor: 'pointer'
          }}
        >
          {isSending ? 'Sending... ⚔️' : '⚔️ Send Challenge'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default CreateChallenge;
