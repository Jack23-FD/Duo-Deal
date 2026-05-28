import { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Avatar, Space, Row, Col, Tag, Button, message } from 'antd';
import { Swords, ClipboardList, Award, PlusCircle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Challenges = () => {
  const navigate = useNavigate();
  const [duelsList, setDuelsList] = useState([]);
  const [selectedDuelId, setSelectedDuelId] = useState(null);
  const [selectedDuelProgress, setSelectedDuelProgress] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const fetchDuels = useCallback(async () => {
    try {
      const res = await api.get('/duels/my');
      const activeFromApi = res.data.filter(d => d.status === 'ACTIVE');
      setDuelsList(activeFromApi);
    } catch (err) {
      console.error('Failed to fetch active duels from database:', err);
    }
  }, [selectedDuelId]);

  const fetchProgress = useCallback(async (id) => {
    try {
      const res = await api.get(`/duels/${id}/progress`);
      setSelectedDuelProgress(res.data);
    } catch (err) {
      console.error("Failed to fetch duel progress:", err);
    }
  }, []);

  useEffect(() => {
    fetchDuels();
    window.addEventListener('activity_saved', fetchDuels);
    return () => window.removeEventListener('activity_saved', fetchDuels);
  }, [fetchDuels]);

  useEffect(() => {
    if (selectedDuelId) {
      fetchProgress(selectedDuelId);
    }
  }, [selectedDuelId, fetchProgress]);

  const handleToggle = async (task, dateStr, username) => {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const getLoggedInUser = () => {
      try {
        const data = localStorage.getItem('user_profile');
        if (data) return JSON.parse(data);
      } catch (e) {}
      return null;
    };
    const loggedIn = getLoggedInUser();
    if (dateStr === todayStr && loggedIn && username.toLowerCase() === loggedIn.username.toLowerCase()) {
      try {
        await api.patch(`/duels/tasks/${task.id}/complete`, null, { params: { date: dateStr } });
        message.success('Task status updated! ⚔️');
        fetchProgress(selectedDuelId);
        window.dispatchEvent(new Event('activity_saved'));
      } catch (err) {
        console.error("Failed to toggle duel task:", err);
      }
    }
  };

  const activeDuels = duelsList;
  
  const selectedDuel = selectedDuelId 
    ? activeDuels.find(d => d.id === selectedDuelId)
    : null;

  // Calculations for active selected duel
  let totalDays = 0;
  let datesList = [];
  let challengerRate = 0;
  let opponentRate = 0;
  let rateDiff = 0;
  let challengerName = 'Challenger';
  let opponentName = 'Opponent';

  if (selectedDuel) {
    const start = dayjs(selectedDuel.startDate);
    const end = dayjs(selectedDuel.endDate);
    totalDays = end.diff(start, 'day') + 1;

    // Generate dates list from start to end (chronological order: oldest first)
    for (let i = 0; i < totalDays; i++) {
      datesList.push(start.add(i, 'day').format('YYYY-MM-DD'));
    }

    challengerName = selectedDuelProgress ? selectedDuelProgress.challengerName : selectedDuel.challengerName || 'Challenger';
    opponentName = selectedDuelProgress ? selectedDuelProgress.opponentName : selectedDuel.opponentName || 'Opponent';
    challengerRate = selectedDuelProgress ? selectedDuelProgress.challengerCompletionRate : selectedDuel.challengerCompletionRate || 0;
    opponentRate = selectedDuelProgress ? selectedDuelProgress.opponentCompletionRate : selectedDuel.opponentCompletionRate || 0;
    rateDiff = challengerRate - opponentRate;
  }

  return (
    <div className="deals-page-container" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #fffbf0 100%)', minHeight: '100vh', paddingBottom: '30px' }}>
      
      <div className="page-content" style={{ padding: '0 15px' }}>
        
        {selectedDuel ? (
          <div>
            {/* Top Back Arrow & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0 8px' }}>
              <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => setSelectedDuelId(null)} />
              <Text strong style={{ fontSize: '15px' }}>Back to Active Deals</Text>
            </div>

            {/* Duo Challenge Detail Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '24px 16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.04)',
                marginBottom: '20px'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-gray)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Daily habit battle</p>
                <h2 style={{ margin: '4px 0', fontWeight: 800, fontSize: '24px', color: '#1e293b' }}>Duo Progress</h2>
                
                {/* VS Badge — Blue & Orange Split */}
                <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', fontWeight: 700, fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <span style={{ background: '#e6f7ff', color: '#007bff', padding: '4px 12px' }}>{challengerName}</span>
                  <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px' }}>VS</span>
                  <span style={{ background: '#fff7e6', color: '#ff8c00', padding: '4px 12px' }}>{opponentName}</span>
                </div>
              </div>

              {/* Grid Column Header */}
              <div style={{
                display: 'flex',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '8px',
                marginBottom: '12px',
                fontWeight: 700,
                fontSize: '12px',
                color: '#64748b',
                alignItems: 'flex-end'
              }}>
                <div style={{ width: '80px', flexShrink: 0, paddingBottom: '4px' }}>DATE</div>
                <div style={{ flex: 1, textAlign: 'center', color: '#007bff', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span>{challengerName.toUpperCase()}</span>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#007bff', marginTop: '2px' }}>{challengerRate}%</span>
                </div>
                <div style={{ flex: 1, textAlign: 'center', color: '#ff8c00', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span>{opponentName.toUpperCase()}</span>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#ff8c00', marginTop: '2px' }}>{opponentRate}%</span>
                </div>
              </div>

              {/* Daily Checklist Side-By-Side Row Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {datesList.map(dStr => {
                  const todayStr = dayjs().format('YYYY-MM-DD');
                  const isToday = dStr === todayStr;
                  const isPast = dayjs(dStr).isBefore(dayjs(todayStr), 'day');
                  const isFuture = dayjs(dStr).isAfter(dayjs(todayStr), 'day');
                  const formattedDate = dayjs(dStr).format('D/M/YY');
                  
                  return (
                    <div key={dStr} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: isToday ? '10px 8px' : '4px 0',
                      borderLeft: isToday ? '4px solid #ff8c00' : 'none',
                      background: isToday ? '#fff7e6' : 'transparent',
                      borderRadius: isToday ? '8px' : '0',
                      borderBottom: isToday ? '1px solid rgba(255, 140, 0, 0.15)' : '1px dashed #f1f5f9'
                    }}>
                      {/* Date Column */}
                      <div style={{ 
                        width: '85px', 
                        fontSize: '13px', 
                        fontWeight: isToday ? 800 : 600, 
                        color: isToday ? '#ff8c00' : '#334155', 
                        flexShrink: 0 
                      }}>
                        {isToday ? `📅 ${formattedDate}` : formattedDate}
                      </div>

                      {/* Challenger Checkboxes Column */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {(selectedDuel.tasks || []).map((t, idx) => {
                          const taskName = t.taskName || t.name || t;
                          const completed = !!(selectedDuelProgress &&
                                               selectedDuelProgress.dailyProgress &&
                                               selectedDuelProgress.dailyProgress[dStr] &&
                                               selectedDuelProgress.dailyProgress[dStr][challengerName] &&
                                               selectedDuelProgress.dailyProgress[dStr][challengerName][t.id]);

                          const tooltipKey = `${dStr}_${idx}_ch`;
                          const handleTriggerTooltip = () => {
                            setActiveTooltip({ key: tooltipKey, name: taskName });
                            if (window.tooltipTimer) clearTimeout(window.tooltipTimer);
                            window.tooltipTimer = setTimeout(() => {
                              setActiveTooltip(null);
                            }, 2500);
                          };

                          return (
                            <div 
                              key={`ch_${idx}`}
                              style={{ position: 'relative', display: 'inline-block' }}
                              onMouseEnter={handleTriggerTooltip}
                              onClick={() => {
                                handleTriggerTooltip();
                                if (!isFuture) {
                                  handleToggle(t, dStr, challengerName);
                                }
                              }}
                            >
                              {completed ? (
                                <div style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  background: '#52c41a',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: isToday ? 'pointer' : 'default'
                                }}>✓</div>
                              ) : isPast ? (
                                <div style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  background: '#ff4d4f',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'default'
                                }}>✗</div>
                              ) : isToday ? (
                                <div style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  border: '2px solid #ff8c00',
                                  background: 'white',
                                  cursor: 'pointer'
                                }} />
                              ) : (
                                <div style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  border: '2px solid #cbd5e1',
                                  background: '#f8fafc',
                                  cursor: 'default'
                                }} />
                              )}

                              <AnimatePresence>
                                {activeTooltip && activeTooltip.key === tooltipKey && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: -30, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                      position: 'absolute',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      background: '#1e293b',
                                      color: '#fff',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      zIndex: 200,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    {activeTooltip.name}
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '-4px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      width: 0,
                                      height: 0,
                                      borderLeft: '4px solid transparent',
                                      borderRight: '4px solid transparent',
                                      borderTop: '4px solid #1e293b'
                                    }} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>

                      {/* Opponent Checkboxes Column */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {(selectedDuel.tasks || []).map((t, idx) => {
                          const taskName = t.taskName || t.name || t;
                          const completed = !!(selectedDuelProgress &&
                                               selectedDuelProgress.dailyProgress &&
                                               selectedDuelProgress.dailyProgress[dStr] &&
                                               selectedDuelProgress.dailyProgress[dStr][opponentName] &&
                                               selectedDuelProgress.dailyProgress[dStr][opponentName][t.id]);

                          const tooltipKey = `${dStr}_${idx}_opp`;
                          const handleTriggerTooltip = () => {
                            setActiveTooltip({ key: tooltipKey, name: taskName });
                            if (window.tooltipTimer) clearTimeout(window.tooltipTimer);
                            window.tooltipTimer = setTimeout(() => {
                              setActiveTooltip(null);
                            }, 2500);
                          };

                          return (
                            <div 
                              key={`opp_${idx}`}
                              style={{ position: 'relative', display: 'inline-block' }}
                              onMouseEnter={handleTriggerTooltip}
                              onClick={() => {
                                handleTriggerTooltip();
                                if (!isFuture) {
                                  handleToggle(t, dStr, opponentName);
                                }
                              }}
                            >
                              {completed ? (
                                <div style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  background: '#52c41a',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: isToday ? 'pointer' : 'default'
                                }}>✓</div>
                              ) : isPast ? (
                                <div style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  background: '#ff4d4f',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'default'
                                }}>✗</div>
                              ) : isToday ? (
                                <div style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  border: '2px solid #ff8c00',
                                  background: 'white',
                                  cursor: 'pointer'
                                }} />
                              ) : (
                                <div style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  border: '2px solid #cbd5e1',
                                  background: '#f8fafc',
                                  cursor: 'default'
                                }} />
                              )}

                              <AnimatePresence>
                                {activeTooltip && activeTooltip.key === tooltipKey && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: -30, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                      position: 'absolute',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      background: '#1e293b',
                                      color: '#fff',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      zIndex: 200,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      pointerEvents: 'none'
                                    }}
                                  >
                                    {activeTooltip.name}
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '-4px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      width: 0,
                                      height: 0,
                                      borderLeft: '4px solid transparent',
                                      borderRight: '4px solid transparent',
                                      borderTop: '4px solid #1e293b'
                                    }} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Side-By-Side Rate Comparison Board */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '20px',
                padding: '20px',
                border: '1.5px solid #e2e8f0',
                marginTop: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  
                  {/* Left Column (Challenger - Blue text) */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#007bff' }}>
                      {challengerName}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#007bff', margin: '4px 0' }}>
                      {challengerRate}%
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: 700, 
                      color: '#007bff'
                    }}>
                      {rateDiff >= 0 ? `+${rateDiff}%` : `${rateDiff}%`}
                    </div>
                  </div>

                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#cbd5e1', padding: '0 10px' }}>VS</div>

                  {/* Right Column (Opponent - Orange text) */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ff8c00' }}>
                      {opponentName}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#ff8c00', margin: '4px 0' }}>
                      {opponentRate}%
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: 700, 
                      color: '#ff8c00'
                    }}>
                      {rateDiff <= 0 ? `+${Math.abs(rateDiff)}%` : `-${rateDiff}%`}
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          </div>
        ) : (
          /* --- DUO CHALLENGE LIST VIEW --- */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Title level={3} style={{ fontWeight: 800, margin: 0 }}>Active Habit Deals</Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>Tap a battle to view the side-by-side Doo Challenge board</Text>
            </div>

            {activeDuels.length === 0 ? (
              <Card className="modern-card" style={{ textAlign: 'center', padding: '40px 20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 140, 0, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                }}>
                  <Swords size={28} color="var(--primary-orange)" />
                </div>
                <Title level={4} style={{ fontWeight: 800, margin: '0 0 8px' }}>No Active Deals</Title>
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '16px' }}>
                  Ready to battle? Challenge a friend to lock-in your daily habits.
                </Text>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/create')}
                  style={{
                    background: 'linear-gradient(135deg, #ff8c00, #007bff)',
                    border: 'none', borderRadius: '8px', height: '40px', fontWeight: 600
                  }}
                >
                  Create New Duel
                </Button>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeDuels.map((duel, index) => (
                  <motion.div
                    key={duel.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDuelId(duel.id)}
                  >
                    <Card
                      className="modern-card"
                      styles={{ body: { padding: '16px 20px' } }}
                      style={{ cursor: 'pointer', border: '1px solid rgba(0,0,0,0.03)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '24px' }}>🥊</span>
                          <div>
                            <Text strong style={{ fontSize: '14px', display: 'block', color: '#1e293b' }}>
                              {duel.challengerName} VS {duel.opponentName}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              Daily Task Battle #{index + 1}
                            </Text>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '11px', background: 'rgba(255, 140, 0, 0.1)', color: 'var(--primary-orange)',
                          padding: '3px 10px', borderRadius: '12px', fontWeight: 700, marginLeft: 'auto'
                        }}>
                          VIEW DETAIL
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Challenges;
