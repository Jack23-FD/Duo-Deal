import { useState } from 'react';
import { Typography, Input, DatePicker, Button, Space, Avatar, message } from 'antd';
import { Search, Plus, Trash2, Swords, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { challengeStore } from '../utils/challengeStore';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const mockUsers = ['Alex', 'Sarah', 'Jordan', 'Taylor', 'Chris'];

const CreateChallenge = () => {
  const [tasks, setTasks] = useState([{ name: '', time: '' }]);
  const [opponent, setOpponent] = useState('');
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [isSending, setIsSending] = useState(false);

  const handleOpponentInput = (e) => {
    const val = e.target.value;
    setOpponent(val);
    setSelectedOpponent(null);
    if (val.length > 0) {
      setSuggestions(mockUsers.filter(u => u.toLowerCase().includes(val.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  };

  const selectOpponent = (name) => {
    setOpponent(name);
    setSelectedOpponent(name);
    setSuggestions([]);
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

  const handleCreate = () => {
    if (!selectedOpponent) { message.warning('Please select an opponent first.'); return; }
    if (!dateRange[0] || !dateRange[1]) { message.warning('Please select a duration.'); return; }
    const emptyTasks = tasks.filter(t => !t || !t.name || !t.name.trim());
    if (emptyTasks.length > 0) { message.warning('Please fill in all task names.'); return; }
    
    setIsSending(true);
    
    // Simulate premium delivery flow
    setTimeout(() => {
      // Save in store
      challengeStore.createChallenge({
        opponent: selectedOpponent,
        startDate: dateRange[0].toDate(),
        endDate: dateRange[1].toDate(),
        tasks: tasks
      });

      setIsSending(false);
      message.success('Challenge Sent! 🎯 Simulated email delivered to opponent.');

      // Clear inputs
      setTasks([{ name: '', time: '' }]);
      setOpponent('');
      setSelectedOpponent(null);
      setDateRange([null, null]);

      // Automatically open email client overlay with a slight delay
      setTimeout(() => {
        window.dispatchEvent(new Event('open_email_simulator'));
      }, 1000);
    }, 1500);
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
      style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: '100px' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'linear-gradient(135deg, #ff8c00, #007bff)',
          borderRadius: '16px', padding: '20px', color: 'white'
        }}>
          <Swords size={32} />
          <div>
            <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 800 }}>New Duel ⚔️</Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>Challenge a friend to a habit battle</Text>
          </div>
        </div>
      </motion.div>

      {/* Opponent Search */}
      <motion.div variants={itemVariants} className="modern-card" style={{ padding: '20px', marginBottom: '16px', position: 'relative' }}>
        <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '12px' }}>
          <span style={{ color: 'var(--primary-orange)' }}>①</span> Find Opponent
        </Text>
        <div style={{ position: 'relative' }}>
          <Input
            prefix={<Search size={16} color="#999" />}
            placeholder="Search by username..."
            value={opponent}
            onChange={handleOpponentInput}
            style={{ borderRadius: '10px', height: '44px' }}
          />
          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute', left: 0, right: 0, zIndex: 100,
                  background: 'white', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', marginTop: '4px'
                }}
              >
                {suggestions.map(name => (
                  <div
                    key={name}
                    onClick={() => selectOpponent(name)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <Avatar size={32} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                    <Text strong>{name}</Text>
                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: 'auto' }}>@{name.toLowerCase()}</Text>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Opponent Badge */}
        <AnimatePresence>
          {selectedOpponent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', background: 'linear-gradient(135deg, rgba(255,140,0,0.08), rgba(0,123,255,0.08))', borderRadius: '10px', padding: '12px' }}
            >
              <Avatar size={40} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedOpponent}`} />
              <div>
                <Text strong style={{ display: 'block' }}>{selectedOpponent}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>Ready for a duel!</Text>
              </div>
              <CheckCircle size={20} color="#52c41a" style={{ marginLeft: 'auto' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Duration */}
      <motion.div variants={itemVariants} className="modern-card" style={{ padding: '20px', marginBottom: '16px' }}>
        <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '12px' }}>
          <span style={{ color: 'var(--primary-orange)' }}>②</span> Duration
        </Text>
        <RangePicker
          style={{ width: '100%', borderRadius: '10px', height: '44px' }}
          onChange={(dates) => setDateRange(dates || [null, null])}
        />
      </motion.div>

      {/* Daily Tasks */}
      <motion.div variants={itemVariants} className="modern-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '15px' }}>
            <span style={{ color: 'var(--primary-orange)' }}>③</span> Daily Tasks
          </Text>
          <Button
            type="text"
            icon={<Plus size={15} />}
            onClick={addTask}
            style={{ color: 'var(--primary-orange)', fontWeight: 600 }}
          >
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
                    placeholder={`Task name (required)`}
                    value={task.name}
                    onChange={(e) => updateTaskName(index, e.target.value)}
                    style={{ borderRadius: '10px', flex: 2 }}
                  />
                  <Input
                    placeholder={`Time (optional)`}
                    value={task.time}
                    onChange={(e) => updateTaskTime(index, e.target.value)}
                    style={{ borderRadius: '10px', flex: 1 }}
                  />
                </div>
                {tasks.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => removeTask(index)}
                    style={{ flexShrink: 0 }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </Space>
      </motion.div>

      {/* Create Button */}
      <motion.div variants={itemVariants}>
        <Button
          block
          size="large"
          onClick={handleCreate}
          loading={isSending}
          disabled={isSending}
          style={{
            background: 'linear-gradient(135deg, #ff8c00, #007bff)',
            border: 'none',
            color: 'white',
            fontWeight: 700,
            borderRadius: '12px',
            height: '52px',
            fontSize: '16px',
            letterSpacing: '0.5px',
            boxShadow: '0 8px 20px rgba(255, 140, 0, 0.35)',
          }}
        >
          {isSending ? 'Forging Contract ⚔️' : '⚔️ Send Challenge'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default CreateChallenge;
