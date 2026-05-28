import { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Avatar, Space, Row, Col, Tag, Button, message } from 'antd';
import { Swords, ClipboardList, Award, PlusCircle, ArrowLeft, Calendar, Flame, ChevronRight } from 'lucide-react';
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

  const getLoggedInUser = () => {
    try {
      const data = localStorage.getItem('user_profile');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return null;
  };
  const loggedIn = getLoggedInUser();
  const currentUsername = loggedIn?.username || 'Felix';

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

  // Swap names so that the logged-in user is ALWAYS first (on the left)
  let leftName = challengerName;
  let rightName = opponentName;
  let leftRate = challengerRate;
  let rightRate = opponentRate;
  let leftDiff = rateDiff;

  if (selectedDuel) {
    if (opponentName.toLowerCase() === currentUsername.toLowerCase()) {
      leftName = opponentName;
      rightName = challengerName;
      leftRate = opponentRate;
      rightRate = challengerRate;
      leftDiff = -rateDiff;
    }
  }

  // Optimistic UI Toggle Handler
  const handleToggle = async (task, dateStr, username) => {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const loggedInUser = getLoggedInUser();
    if (dateStr === todayStr && loggedInUser && username.toLowerCase() === loggedInUser.username.toLowerCase()) {
      
      // Save old state for reversion on network error
      const oldProgress = selectedDuelProgress ? { ...selectedDuelProgress } : null;
      
      // Calculate active status optimistically
      const currentVal = !!(selectedDuelProgress &&
                           selectedDuelProgress.dailyProgress &&
                           selectedDuelProgress.dailyProgress[dateStr] &&
                           selectedDuelProgress.dailyProgress[dateStr][username] &&
                           selectedDuelProgress.dailyProgress[dateStr][username][task.id]);
      
      const newVal = !currentVal;
      
      // Duplicate structure cleanly
      const updatedProgress = JSON.parse(JSON.stringify(selectedDuelProgress || {}));
      if (!updatedProgress.dailyProgress) updatedProgress.dailyProgress = {};
      if (!updatedProgress.dailyProgress[dateStr]) updatedProgress.dailyProgress[dateStr] = {};
      if (!updatedProgress.dailyProgress[dateStr][username]) updatedProgress.dailyProgress[dateStr][username] = {};
      updatedProgress.dailyProgress[dateStr][username][task.id] = newVal;
      
      // Calculate new completion rate optimistically
      const totalPossibleTasks = totalDays * (selectedDuel.tasks || []).length;
      let completedCount = 0;
      for (const d of datesList) {
        const dayProgress = updatedProgress.dailyProgress[d]?.[username] || {};
        for (const t of selectedDuel.tasks || []) {
          if (dayProgress[t.id]) {
            completedCount++;
          }
        }
      }
      
      const newRate = totalPossibleTasks > 0 ? Math.round((completedCount / totalPossibleTasks) * 100) : 0;
      
      // Apply correct rate updates based on actual database username mappings
      if (username === challengerName) {
        updatedProgress.challengerCompletionRate = newRate;
      } else {
        updatedProgress.opponentCompletionRate = newRate;
      }

      // Update state instantly for fluid, lag-free user experience
      setSelectedDuelProgress(updatedProgress);

      try {
        await api.patch(`/duels/tasks/${task.id}/complete`, null, { params: { date: dateStr } });
        // Retrieve true state from server in background
        const res = await api.get(`/duels/${selectedDuelId}/progress`);
        setSelectedDuelProgress(res.data);
        window.dispatchEvent(new Event('activity_saved'));
      } catch (err) {
        console.error("Failed to toggle duel task, reverting:", err);
        if (oldProgress) {
          setSelectedDuelProgress(oldProgress);
        }
        message.error("Unable to update task. Connection issue.");
      }
    }
  };

  return (
    <div className="deals-page-container" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', minHeight: '100vh', paddingBottom: '40px' }}>
      
      <div className="page-content" style={{ padding: '0 8px' }}>
        
        {selectedDuel ? (
          <div>
            {/* Top Back Arrow & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0 12px' }}>
              <Button 
                type="text" 
                icon={<ArrowLeft size={20} />} 
                onClick={() => setSelectedDuelId(null)}
                style={{ 
                  background: 'white', 
                  borderRadius: '50%', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px'
                }}
              />
              <Text strong style={{ fontSize: '15px', color: '#475569', fontWeight: 600 }}>Back to Active Deals</Text>
            </div>

            {/* Duo Challenge Detail Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white',
                borderRadius: '28px',
                padding: '24px 16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.02)',
                marginBottom: '20px'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 140, 0, 0.08)', padding: '4px 12px', borderRadius: '20px', marginBottom: '8px' }}>
                  <Swords size={12} color="var(--primary-orange)" />
                  <span style={{ fontSize: '10px', color: '#7c2d12', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Habit Arena</span>
                </div>
                <h2 style={{ margin: '4px 0', fontWeight: 900, fontSize: '26px', color: '#0f172a', letterSpacing: '-0.5px' }}>Duo Progress</h2>
                
                {/* VS Badge — Blue & Orange Split (Always shows current user first) */}
                <div style={{ display: 'inline-flex', borderRadius: '12px', overflow: 'hidden', fontWeight: 700, fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '8px' }}>
                  <span style={{ background: '#eff6ff', color: '#007bff', padding: '6px 14px' }}>{leftName}</span>
                  <span style={{ background: '#f8fafc', color: '#64748b', padding: '6px 10px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>VS</span>
                  <span style={{ background: '#fff7ed', color: '#ff8c00', padding: '6px 14px' }}>{rightName}</span>
                </div>
              </div>

              {/* Premium Top Side-By-Side Rate Comparison Board */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '24px',
                padding: '24px 16px',
                border: '1px solid rgba(0,0,0,0.03)',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Gradient divider line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  height: '4px',
                  width: '60px',
                  background: 'linear-gradient(90deg, #007bff, #ff8c00)',
                  borderRadius: '0 0 4px 4px'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  
                  {/* Left Column (Current User - Blue text) */}
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      {leftName}
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#007bff', margin: '2px 0', letterSpacing: '-1.5px' }}>
                      {leftRate}%
                    </div>
                    <div style={{ 
                      display: 'inline-block',
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: leftDiff >= 0 ? '#16a34a' : '#dc2626',
                      background: leftDiff >= 0 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                      padding: '2px 8px',
                      borderRadius: '99px'
                    }}>
                      {leftDiff >= 0 ? `+${leftDiff}%` : `${leftDiff}%`}
                    </div>
                  </div>

                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'white', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '13px', 
                    fontWeight: 900, 
                    color: '#cbd5e1'
                  }}>VS</div>

                  {/* Right Column (Opponent - Orange text) */}
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#ff8c00', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      {rightName}
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#ff8c00', margin: '2px 0', letterSpacing: '-1.5px' }}>
                      {rightRate}%
                    </div>
                    <div style={{ 
                      display: 'inline-block',
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: leftDiff <= 0 ? '#16a34a' : '#dc2626',
                      background: leftDiff <= 0 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                      padding: '2px 8px',
                      borderRadius: '99px'
                    }}>
                      {leftDiff <= 0 ? `+${Math.abs(leftDiff)}%` : `-${leftDiff}%`}
                    </div>
                  </div>

                </div>
              </div>

              {/* Grid Column Header */}
              <div style={{
                display: 'flex',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '8px',
                marginBottom: '14px',
                fontWeight: 700,
                fontSize: '12px',
                color: '#64748b',
                alignItems: 'center'
              }}>
                <div style={{ width: '80px', flexShrink: 0, paddingLeft: '4px' }}>DATE</div>
                <div style={{ flex: 1, textAlign: 'center', color: '#007bff', fontWeight: 800, fontSize: '11px', letterSpacing: '0.5px' }}>
                  <span>{leftName.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, textAlign: 'center', color: '#ff8c00', fontWeight: 800, fontSize: '11px', letterSpacing: '0.5px' }}>
                  <span>{rightName.toUpperCase()}</span>
                </div>
              </div>

              {/* Daily Checklist Side-By-Side Row Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
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
                      padding: isToday ? '8px' : '4px 0',
                      borderLeft: isToday ? '4px solid #ff8c00' : 'none',
                      background: isToday ? 'linear-gradient(90deg, #fffaf0 0%, #ffffff 100%)' : 'transparent',
                      borderRadius: isToday ? '12px' : '0',
                      borderBottom: isToday ? '1px solid rgba(255, 140, 0, 0.15)' : '1px dashed #f1f5f9'
                    }}>
                      {/* Date Column */}
                      <div style={{ 
                        width: '85px', 
                        fontSize: '12px', 
                        fontWeight: isToday ? 800 : 600, 
                        color: isToday ? '#ff8c00' : '#475569', 
                        flexShrink: 0 
                      }}>
                        {isToday ? `🔥 ${formattedDate}` : formattedDate}
                      </div>

                      {/* Challenger/Left Checkboxes Column (Blue Accent) */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                        background: isToday ? 'rgba(0, 123, 255, 0.05)' : 'rgba(0, 123, 255, 0.02)',
                        padding: '8px 4px',
                        borderRadius: '14px',
                        border: isToday ? '1px solid rgba(0, 123, 255, 0.1)' : '1px solid rgba(0, 123, 255, 0.03)',
                        marginRight: '6px'
                      }}>
                        {(selectedDuel.tasks || []).map((t, idx) => {
                          const taskName = t.taskName || t.name || t;
                          const completed = !!(selectedDuelProgress &&
                                               selectedDuelProgress.dailyProgress &&
                                               selectedDuelProgress.dailyProgress[dStr] &&
                                               selectedDuelProgress.dailyProgress[dStr][leftName] &&
                                               selectedDuelProgress.dailyProgress[dStr][leftName][t.id]);

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
                              title={`${taskName} (${leftName})`}
                              style={{ position: 'relative', display: 'inline-block' }}
                              onMouseEnter={handleTriggerTooltip}
                              onClick={() => {
                                handleTriggerTooltip();
                                if (!isFuture) {
                                  handleToggle(t, dStr, leftName);
                                }
                              }}
                            >
                              {completed ? (
                                <div style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  fontWeight: 900,
                                  boxShadow: '0 2px 6px rgba(34, 197, 94, 0.2)',
                                  cursor: isToday ? 'pointer' : 'default'
                                }}>✓</div>
                              ) : isPast ? (
                                <div style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)',
                                  cursor: 'default'
                                }}>✗</div>
                              ) : isToday ? (
                                <div 
                                  className="pulse-btn-blue"
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '6px',
                                    border: '1.5px solid rgba(0, 123, 255, 0.25)', // Extremely light soft blue border
                                    background: 'white',
                                    cursor: 'pointer',
                                  }} 
                                />
                              ) : (
                                <div style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '6px',
                                  border: '1.5px solid #e2e8f0', // Extremely light grey border
                                  background: '#f8fafc',
                                  cursor: 'default'
                                }} />
                              )}

                              <AnimatePresence>
                                {activeTooltip && activeTooltip.key === tooltipKey && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: -32, scale: 1 }}
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
                                      zIndex: 999,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
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

                      {/* Opponent/Right Checkboxes Column (Orange Accent) */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                        background: isToday ? 'rgba(255, 140, 0, 0.05)' : 'rgba(255, 140, 0, 0.02)',
                        padding: '8px 4px',
                        borderRadius: '14px',
                        border: isToday ? '1px solid rgba(255, 140, 0, 0.1)' : '1px solid rgba(255, 140, 0, 0.03)',
                        marginLeft: '6px'
                      }}>
                        {(selectedDuel.tasks || []).map((t, idx) => {
                          const taskName = t.taskName || t.name || t;
                          const completed = !!(selectedDuelProgress &&
                                               selectedDuelProgress.dailyProgress &&
                                               selectedDuelProgress.dailyProgress[dStr] &&
                                               selectedDuelProgress.dailyProgress[dStr][rightName] &&
                                               selectedDuelProgress.dailyProgress[dStr][rightName][t.id]);

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
                              title={`${taskName} (${rightName})`}
                              style={{ position: 'relative', display: 'inline-block' }}
                              onMouseEnter={handleTriggerTooltip}
                              onClick={() => {
                                handleTriggerTooltip();
                                if (!isFuture) {
                                  handleToggle(t, dStr, rightName);
                                }
                              }}
                            >
                              {completed ? (
                                <div style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  fontWeight: 900,
                                  boxShadow: '0 2px 6px rgba(34, 197, 94, 0.2)',
                                  cursor: isToday ? 'pointer' : 'default'
                                }}>✓</div>
                              ) : isPast ? (
                                <div style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)',
                                  cursor: 'default'
                                }}>✗</div>
                              ) : isToday ? (
                                <div 
                                  className="pulse-btn-orange"
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '6px',
                                    border: '1.5px solid rgba(255, 140, 0, 0.25)', // Extremely light soft orange border
                                    background: 'white',
                                    cursor: 'pointer',
                                  }} 
                                />
                              ) : (
                                <div style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '6px',
                                  border: '1.5px solid #e2e8f0', // Extremely light grey border
                                  background: '#f8fafc',
                                  cursor: 'default'
                                }} />
                              )}

                              <AnimatePresence>
                                {activeTooltip && activeTooltip.key === tooltipKey && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: -32, scale: 1 }}
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
                                      zIndex: 999,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
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

            </motion.div>
          </div>
        ) : (
          /* --- DUO CHALLENGE LIST VIEW (REDESIGNED FOR PREMIUM VISUALS) --- */
          <div>
            <div style={{ textAlign: 'center', margin: '24px 0 20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(0,123,255,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}>
                <Swords size={24} color="var(--primary-orange)" />
              </div>
              <Title level={3} style={{ fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>Active Habit Deals</Title>
              <Text type="secondary" style={{ fontSize: '13px', color: '#64748b' }}>Tap any active duel card to open the habit battlefield arena</Text>
            </div>

            {activeDuels.length === 0 ? (
              <Card className="modern-card" style={{ textAlign: 'center', padding: '50px 24px', border: '1px solid rgba(0,0,0,0.02)', borderRadius: '24px' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 140, 0, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px'
                }}>
                  <Swords size={28} color="var(--primary-orange)" />
                </div>
                <Title level={4} style={{ fontWeight: 800, margin: '0 0 8px', color: '#1e293b' }}>No Active Habit Deals</Title>
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '20px', lineHeight: 1.5 }}>
                  Lock-in your daily habit routines by inviting a friend to a battle!
                </Text>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/create')}
                  style={{
                    background: 'linear-gradient(135deg, #ff8c00, #ffb347)',
                    border: 'none', borderRadius: '12px', height: '44px', fontWeight: 700, padding: '0 24px'
                  }}
                >
                  Start New Duel ⚔️
                </Button>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeDuels.map((duel, index) => {
                  // Determine names, always putting the current user on the left
                  const rawLeftName = duel.challengerName;
                  const rawRightName = duel.opponentName;
                  const rawLeftRate = duel.challengerCompletionRate || 0;
                  const rawRightRate = duel.opponentCompletionRate || 0;

                  let dispLeftName = rawLeftName;
                  let dispRightName = rawRightName;
                  let dispLeftRate = rawLeftRate;
                  let dispRightRate = rawRightRate;

                  if (rawRightName.toLowerCase() === currentUsername.toLowerCase()) {
                    dispLeftName = rawRightName;
                    dispRightName = rawLeftName;
                    dispLeftRate = rawRightRate;
                    dispRightRate = rawLeftRate;
                  }

                  return (
                    <motion.div
                      key={duel.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDuelId(duel.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                        padding: '20px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease'
                      }}>
                        {/* Decorative subtle team colors gradient bar at top */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #007bff 0%, #ff8c00 100%)'
                        }} />

                        {/* Top row: Badges and Battle index (#Deal instead of Duel) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            background: '#f1f5f9', 
                            color: '#475569', 
                            fontWeight: 700, 
                            padding: '3px 8px', 
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            ⚔️ #Deal {index + 1}
                          </span>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                            <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>Active</span>
                          </div>
                        </div>

                        {/* Middle row: Fighter details and VS emblem (Challenger/Opponent labels removed) */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          
                          {/* Current User always first */}
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <Text strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {dispLeftName}
                            </Text>
                          </div>

                          {/* VS Circle */}
                          <div style={{ 
                            width: '30px', 
                            height: '30px', 
                            borderRadius: '50%', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '11px', 
                            fontWeight: 900, 
                            color: '#94a3b8',
                            flexShrink: 0
                          }}>
                            VS
                          </div>

                          {/* Opponent */}
                          <div style={{ flex: 1, textAlign: 'right' }}>
                            <Text strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {dispRightName}
                            </Text>
                          </div>

                        </div>

                        {/* Dynamic Double Progress Bars */}
                        <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          {/* Left (Current User) Score */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>🔵 {dispLeftName} Rate</span>
                            <span style={{ color: '#007bff', fontWeight: 800 }}>{dispLeftRate}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                            <div style={{ width: `${dispLeftRate}%`, height: '100%', background: 'linear-gradient(90deg, #007bff, #3b82f6)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                          </div>

                          {/* Right (Opponent) Score */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>🟠 {dispRightName} Rate</span>
                            <span style={{ color: '#ff8c00', fontWeight: 800 }}>{dispRightRate}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ width: `${dispRightRate}%`, height: '100%', background: 'linear-gradient(90deg, #ff8c00, #f97316)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                          </div>
                        </div>

                        {/* Bottom action row: Date and Arena redirect link */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '11px', fontWeight: 500 }}>
                            <Calendar size={13} />
                            <span>Ends {dayjs(duel.endDate).format('MMM DD')}</span>
                          </div>
                          
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.08) 0%, rgba(255, 140, 0, 0.15) 100%)',
                            color: 'var(--primary-orange)',
                            padding: '5px 12px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(255, 140, 0, 0.05)'
                          }}>
                            ENTER ARENA <ChevronRight size={12} />
                          </span>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Embedded styles for pulse and keyframe animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.3); }
          70% { box-shadow: 0 0 0 6px rgba(0, 123, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
        }
        @keyframes pulse-orange {
          0% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.3); }
          70% { box-shadow: 0 0 0 6px rgba(255, 140, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0); }
        }
        .pulse-btn-blue {
          animation: pulse-blue 2s infinite;
          transition: all 0.2s ease-in-out;
        }
        .pulse-btn-blue:hover {
          transform: scale(1.05);
          background: #eff6ff;
        }
        .pulse-btn-orange {
          animation: pulse-orange 2s infinite;
          transition: all 0.2s ease-in-out;
        }
        .pulse-btn-orange:hover {
          transform: scale(1.05);
          background: #fff7ed;
        }
      `}} />
    </div>
  );
};

export default Challenges;
