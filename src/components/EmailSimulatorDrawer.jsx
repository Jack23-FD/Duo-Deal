import { useState, useEffect } from 'react';
import { Drawer, Avatar, Button, Typography, Space, Tag, message } from 'antd';
import { Mail, MailOpen, Calendar, Swords, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const EmailSimulatorDrawer = ({ open, onClose }) => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [clashing, setClashing] = useState(false);
  const [pendingChallenges, setPendingChallenges] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await api.get('/duels/pending');
      const duelsArray = Array.isArray(res.data) ? res.data : (res.data?.duels || []);
      const mapped = duelsArray.map(d => ({
        id: d.id,
        challenger: d.challengerName || d.challengerUsername,
        opponent: d.opponentName || d.opponentUsername,
        startDate: d.startDate,
        endDate: d.endDate,
        status: d.status,
        tasks: d.tasks || [],
        createdAt: d.createdAt || new Date().toISOString()
      }));
      setPendingChallenges(mapped);
    } catch (err) {
      console.error('Failed to fetch pending challenges:', err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPending();
    }
  }, [open]);

  useEffect(() => {
    window.addEventListener('activity_saved', fetchPending);
    return () => window.removeEventListener('activity_saved', fetchPending);
  }, []);

  const handleAccept = async (ch) => {
    setClashing(true);
    try {
      await api.post(`/duels/${ch.id}/accept`);
    } catch (err) {
      console.error('Failed to accept challenge:', err);
      setClashing(false);
      message.error({
        content: 'Failed to accept challenge ⚔️',
        style: { marginTop: '10vh' }
      });
      return;
    }
    
    // Clash animation duration
    setTimeout(() => {
      setClashing(false);
      message.success({
        content: `Challenge Accepted! Duel with ${ch.challenger} is now ACTIVE! ⚔️`,
        style: { marginTop: '10vh' }
      });
      setSelectedChallenge(null);
      onClose(); // Automatically close drawer to reveal the refreshed dashboard!
      window.dispatchEvent(new Event('activity_saved'));
    }, 1500);
  };

  const handleReject = async (ch) => {
    try {
      await api.post(`/duels/${ch.id}/reject`);
      message.error({
        content: 'Challenge rejected 🚫',
        style: { marginTop: '10vh' }
      });
      setSelectedChallenge(null);
      onClose(); // Automatically close drawer to reveal the refreshed dashboard!
      window.dispatchEvent(new Event('activity_saved'));
    } catch (err) {
      console.error('Failed to reject challenge:', err);
      message.error({
        content: 'Failed to reject challenge 🚫',
        style: { marginTop: '10vh' }
      });
    }
  };

  const formatDate = (dateStr) => dayjs(dateStr).format('MMM DD, YYYY');
  
  const getDaysCount = (start, end) => {
    const s = dayjs(start);
    const e = dayjs(end);
    return e.diff(s, 'day') + 1;
  };
  const getLoggedInUser = () => {
    try {
      const data = localStorage.getItem('user_profile');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return null;
  };

  const loggedInUser = getLoggedInUser();
  const currentUsername = loggedInUser && loggedInUser.username ? loggedInUser.username.toLowerCase() : '';

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={20} color="var(--primary-orange)" />
          <span className="gradient-text" style={{ fontSize: '18px', fontWeight: 800 }}>DuoMail Simulator</span>
        </div>
      }
      placement="right"
      style={{ width: 440 }}
      onClose={onClose}
      open={open}
      styles={{ body: { padding: '0px', background: '#f5f7fa', position: 'relative', overflow: 'hidden' } }}
    >
      {/* Confetti / Clashing Overlay Animation */}
      <AnimatePresence>
        {clashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', gap: '30px', position: 'relative' }}>
              {/* Left Sword */}
              <motion.div
                initial={{ x: -150, y: -150, rotate: -45, scale: 0.5 }}
                animate={{ x: 10, y: 10, rotate: 15, scale: 1.5 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              >
                <Swords size={60} color="#ff8c00" />
              </motion.div>

              {/* Right Sword */}
              <motion.div
                initial={{ x: 150, y: -150, rotate: 45, scale: 0.5 }}
                animate={{ x: -10, y: 10, rotate: -15, scale: 1.5 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              >
                <Swords size={60} color="#007bff" style={{ transform: 'scaleX(-1)' }} />
              </motion.div>
            </div>

            {/* Spark Clash */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 2, 0], opacity: [1, 1, 0] }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'radial-gradient(circle, #fff 0%, #ff8c00 60%, transparent 100%)',
                position: 'absolute'
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{ marginTop: '40px', textAlign: 'center' }}
            >
              <h2 style={{ color: 'white', fontWeight: 800 }}>COMMITTED! ⚔️</h2>
              <p style={{ color: '#ccc', fontSize: '13px', marginTop: '8px' }}>Duel is now ACTIVE. Tasks are permanently locked.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!selectedChallenge ? (
          /* --- INBOX VIEW --- */
          <motion.div
            key="inbox"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {/* Simulator Context Bar */}
            <div style={{ background: 'linear-gradient(90deg, #ff8c00, #007bff)', padding: '12px 16px', color: 'white' }}>
              <Text style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>
                💡 simulating opponent's email address (e.g. <b>sarah@duodeals.com</b>)
              </Text>
            </div>

            {/* Emails List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {pendingChallenges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
                  <MailOpen size={48} color="#ccc" style={{ marginBottom: '16px', margin: '0 auto' }} />
                  <Title level={5} style={{ margin: 0 }}>Inbox is empty</Title>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Send a challenge to see emails arrive here.</Text>
                </div>
              ) : (
                pendingChallenges.map(ch => (
                  <motion.div
                    key={ch.id}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedChallenge(ch)}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '16px',
                      marginBottom: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      borderLeft: '4px solid var(--primary-orange)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Space>
                        <Avatar size={24} src={ch.challengerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ch.challenger}`} />
                        <Text strong style={{ fontSize: '14px' }}>{ch.challenger} via Duo Deals</Text>
                      </Space>
                      <Tag color="orange" style={{ margin: 0, borderRadius: '4px' }}>Invitation</Tag>
                    </div>
                    <Title level={5} style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700 }}>
                      ⚔️ Habit Duel Challenge from {ch.challenger}!
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      You have been challenged to a habit battle for {getDaysCount(ch.startDate, ch.endDate)} days! Daily tasks: {(ch.tasks || []).map(t => t.taskName || t.name || t).join(', ')}
                    </Text>
                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                      <Text style={{ fontSize: '10px', color: 'var(--text-gray)' }}>{dayjs(ch.createdAt).format('hh:mm A')}</Text>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          /* --- EMAIL DETAIL VIEW --- */
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}
          >
            {/* Email Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <Button type="text" icon={<ArrowLeft size={18} />} onClick={() => setSelectedChallenge(null)} />
              <Text strong style={{ fontSize: '14px' }}>Back to Inbox</Text>
            </div>

            {/* Email Body Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Subject */}
              <Title level={4} style={{ margin: '0 0 16px', fontWeight: 800, color: 'var(--text-dark)' }}>
                ⚔️ Invite: {selectedChallenge.challenger} challenged you to a habit battle
              </Title>

              {/* Envelope details */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <Avatar size={40} src={selectedChallenge.challengerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChallenge.challenger}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{selectedChallenge.challenger}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(selectedChallenge.createdAt).format('MMM DD, hh:mm A')}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    From: noreply@duodeals.com &lt;Duo Deals&gt;
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    To: {selectedChallenge.opponent.toLowerCase()}@duodeals.com &lt;{selectedChallenge.opponent}&gt;
                  </Text>
                </div>
              </div>

              {/* Email Content Body */}
              <div style={{ background: '#fcfcfc', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: '0 0 14px', fontSize: '15px' }}>Hi <b>{selectedChallenge.opponent}</b>,</p>
                
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#434343' }}>
                  <b>{selectedChallenge.challenger}</b> challenged you to a habit battle.
                  Habit battles are designed to keep you both accountable. Both users follow the **exact same daily tasks** until the end date.
                </p>

                {/* Challenge Details Grid */}
                <div style={{ background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.05) 0%, rgba(0, 123, 255, 0.05) 100%)', padding: '16px', borderRadius: '12px', margin: '20px 0', border: '1px solid rgba(255, 140, 0, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Calendar size={16} color="var(--primary-orange)" />
                    <Text strong style={{ fontSize: '13px' }}>DUEL DURATION</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: '11px', display: 'block', fontWeight: 600 }}>START DATE</Text>
                      <Text strong style={{ fontSize: '13px' }}>{formatDate(selectedChallenge.startDate)}</Text>
                    </div>
                    <div style={{ width: '40px', height: '1px', background: 'var(--border-gray)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <Text type="secondary" style={{ fontSize: '11px', display: 'block', fontWeight: 600 }}>END DATE</Text>
                      <Text strong style={{ fontSize: '13px' }}>{formatDate(selectedChallenge.endDate)}</Text>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <Tag color="blue" style={{ fontWeight: 600, border: 'none', borderRadius: '4px' }}>
                      {getDaysCount(selectedChallenge.startDate, selectedChallenge.endDate)} Days Battle
                    </Tag>
                  </div>
                </div>

                {/* Daily Tasks List */}
                <div style={{ margin: '20px 0' }}>
                  <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '12px', color: 'var(--text-dark)' }}>
                    📝 Compulsory Daily Tasks:
                  </Text>
                  {(selectedChallenge.tasks || []).map((task, idx) => {
                    const taskName = task.taskName || task.name || task;
                    const taskTime = task.taskTime || task.time || '';
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 12px', background: 'white', border: '1px solid #f0f0f0', borderRadius: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--gradient-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 800 }}>
                          {idx + 1}
                        </div>
                        <Text strong style={{ fontSize: '13px', color: '#434343' }}>{taskName}{taskTime ? ` (${taskTime})` : ''}</Text>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderLeft: '3px solid #ff4d4f', paddingLeft: '12px', margin: '20px 0 10px' }}>
                  <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic', display: 'block', lineHeight: 1.4 }}>
                    ⚠️ CRITICAL RULE: Once you accept, the duel becomes ACTIVE. Neither user can edit, add, or delete daily tasks. They are locked for the duration!
                  </Text>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button
                  danger
                  ghost
                  style={{ flex: 1, height: '48px', borderRadius: '12px', fontWeight: 600 }}
                  icon={<XCircle size={16} />}
                  onClick={() => handleReject(selectedChallenge)}
                >
                  Reject
                </Button>
                <Button
                  type="primary"
                  style={{
                    flex: 2, height: '48px', borderRadius: '12px', fontWeight: 700,
                    background: 'linear-gradient(135deg, #25a13c, #39d353)',
                    boxShadow: '0 4px 14px rgba(57,211,83,0.3)', border: 'none'
                  }}
                  icon={<CheckCircle2 size={16} />}
                  onClick={() => handleAccept(selectedChallenge)}
                >
                  Accept Duel ⚔️
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Drawer>
  );
};

export default EmailSimulatorDrawer;
