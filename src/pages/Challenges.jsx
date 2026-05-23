import { useState, useSyncExternalStore } from 'react';
import { Typography, Card, Avatar, Space, Row, Col, Tag, Button, Checkbox } from 'antd';
import { Swords, ClipboardList, Award, PlusCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { challengeStore } from '../utils/challengeStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Challenges = () => {
  const navigate = useNavigate();
  const [selectedDuelId, setSelectedDuelId] = useState(null);

  const subscribeToChallenges = (callback) => {
    window.addEventListener('challenge_store_update', callback);
    return () => window.removeEventListener('challenge_store_update', callback);
  };

  const challenges = useSyncExternalStore(
    subscribeToChallenges,
    () => challengeStore.getChallenges(),
    () => challengeStore.getChallenges()
  );

  const activeDuels = challenges.filter(ch => ch.status === 'ACTIVE');
  
  // Find currently selected duel or default to the first active one if selectedDuelId is not set
  const selectedDuel = selectedDuelId 
    ? activeDuels.find(d => d.id === selectedDuelId)
    : (activeDuels.length > 0 ? activeDuels[0] : null);

  // Calculations for active selected duel
  let totalDays = 0;
  let datesList = [];
  let challengerRate = 0;
  let opponentRate = 0;
  let rateDiff = 0;

  if (selectedDuel) {
    const start = dayjs(selectedDuel.startDate);
    const end = dayjs(selectedDuel.endDate);
    totalDays = end.diff(start, 'day') + 1;

    // Generate dates list from start to end (reverse chronological order)
    for (let i = totalDays - 1; i >= 0; i--) {
      datesList.push(start.add(i, 'day').format('YYYY-MM-DD'));
    }

    // Calculate overall completion rates
    let chTotal = 0;
    let chDone = 0;
    let oppTotal = 0;
    let oppDone = 0;

    datesList.forEach(dStr => {
      selectedDuel.tasks.forEach(t => {
        const taskName = t.name || t;
        
        chTotal++;
        const chCompleted = !!(selectedDuel.progress[dStr] &&
                               selectedDuel.progress[dStr][selectedDuel.challenger] &&
                               selectedDuel.progress[dStr][selectedDuel.challenger][taskName]);
        if (chCompleted) chDone++;

        oppTotal++;
        const oppCompleted = !!(selectedDuel.progress[dStr] &&
                               selectedDuel.progress[dStr][selectedDuel.opponent] &&
                               selectedDuel.progress[dStr][selectedDuel.opponent][taskName]);
        if (oppCompleted) oppDone++;
      });
    });

    challengerRate = chTotal === 0 ? 0 : Math.round((chDone / chTotal) * 100);
    opponentRate = oppTotal === 0 ? 0 : Math.round((oppDone / oppTotal) * 100);
    rateDiff = challengerRate - opponentRate;
  }

  return (
    <div className="deals-page-container" style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: '30px' }}>
      
      {/* ── Top Tabs Navigation Bar ── */}
      <div style={{
        display: 'flex',
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        <div 
          onClick={() => navigate('/activity')}
          style={{
            flex: 1, padding: '14px 0', textAlign: 'center', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <ClipboardList size={16} /> My Activity
        </div>
        <div 
          style={{
            flex: 1, padding: '14px 0', textAlign: 'center',
            fontSize: '13px', fontWeight: 700, color: 'var(--primary-orange)',
            borderBottom: '3px solid var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <Award size={16} /> Duo Challenge
        </div>
        <div 
          onClick={() => navigate('/create')}
          style={{
            flex: 1, padding: '14px 0', textAlign: 'center', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <PlusCircle size={16} /> Create Challenge
        </div>
      </div>

      <div className="page-content" style={{ padding: '0 15px' }}>
        
        {/* If an active selected duel is being viewed, render the Doo Challenge Detail Grid */}
        {selectedDuel ? (
          <div>
            {/* Header / Back Link to List */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Button 
                type="text" 
                icon={<ArrowLeft size={18} />} 
                onClick={() => setSelectedDuelId(null)}
                style={{ color: '#475569', fontWeight: 600 }}
              >
                Back to Deals
              </Button>
            </div>

            {/* Doo Challenge Detail Card */}
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
                <h2 style={{ margin: '4px 0', fontWeight: 800, fontSize: '24px', color: '#1e293b' }}>Doo Challenge</h2>
                <Tag color="orange" style={{ borderRadius: '6px', fontWeight: 600, padding: '2px 8px' }}>
                  {selectedDuel.challenger} VS {selectedDuel.opponent}
                </Tag>
              </div>

              {/* Grid Column Header */}
              <div style={{
                display: 'flex',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '8px',
                marginBottom: '12px',
                fontWeight: 700,
                fontSize: '12px',
                color: '#64748b'
              }}>
                <div style={{ width: '80px', flexShrink: 0 }}>DATE</div>
                <div style={{ flex: 1, textAlign: 'center' }}>{selectedDuel.challenger.toUpperCase()}</div>
                <div style={{ flex: 1, textAlign: 'center' }}>{selectedDuel.opponent.toUpperCase()}</div>
              </div>

              {/* Daily Checklist Side-By-Side Row Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {datesList.map(dStr => {
                  const formattedDate = dayjs(dStr).format('DD/M/YY');
                  
                  return (
                    <div key={dStr} style={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingBottom: '10px',
                      borderBottom: '1px dashed #f1f5f9'
                    }}>
                      {/* Date Column */}
                      <div style={{ width: '80px', fontSize: '13px', fontWeight: 600, color: '#334155', flexShrink: 0 }}>
                        {formattedDate}
                      </div>

                      {/* Challenger (Felix/Jack23) Checkboxes Column */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {selectedDuel.tasks.map((t, idx) => {
                          const taskName = t.name || t;
                          const completed = !!(selectedDuel.progress[dStr] &&
                                               selectedDuel.progress[dStr][selectedDuel.challenger] &&
                                               selectedDuel.progress[dStr][selectedDuel.challenger][taskName]);
                          return (
                            <Checkbox 
                              key={`ch_${idx}`} 
                              checked={completed} 
                              disabled 
                              style={{ 
                                scale: 1.15,
                                cursor: 'default'
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Opponent Checkboxes Column */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {selectedDuel.tasks.map((t, idx) => {
                          const taskName = t.name || t;
                          const completed = !!(selectedDuel.progress[dStr] &&
                                               selectedDuel.progress[dStr][selectedDuel.opponent] &&
                                               selectedDuel.progress[dStr][selectedDuel.opponent][taskName]);
                          return (
                            <Checkbox 
                              key={`opp_${idx}`} 
                              checked={completed} 
                              disabled 
                              style={{ 
                                scale: 1.15,
                                cursor: 'default'
                              }}
                            />
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
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  
                  {/* Left Column (Challenger) */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                      {selectedDuel.challenger}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#007bff', margin: '4px 0' }}>
                      {challengerRate}%
                    </div>
                    {/* Comparative indicator */}
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: rateDiff >= 0 ? '#22c55e' : '#ef4444',
                      background: rateDiff >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {rateDiff >= 0 ? `+${rateDiff}%` : `${rateDiff}%`}
                    </div>
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#cbd5e1' }}>VS</div>

                  {/* Right Column (Opponent) */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                      {selectedDuel.opponent}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#ff8c00', margin: '4px 0' }}>
                      {opponentRate}%
                    </div>
                    {/* Comparative indicator */}
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: rateDiff <= 0 ? '#22c55e' : '#ef4444',
                      background: rateDiff <= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '10px'
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
                      bodyStyle={{ padding: '16px 20px' }}
                      style={{ cursor: 'pointer', border: '1px solid rgba(0,0,0,0.03)' }}
                    >
                      <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '24px' }}>🥊</span>
                          <div>
                            <Text strong style={{ fontSize: '14px', display: 'block', color: '#1e293b' }}>
                              {duel.challenger === 'Jack23' ? 'Jack23' : 'Felix'} VS {duel.opponent}
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
