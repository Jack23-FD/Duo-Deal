import { useState, useEffect } from 'react';
import { Drawer, Button, Typography, Space, message } from 'antd';
import { Bell, Check, Flame, Swords, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const NotificationsDrawer = ({ open, onClose, onRefreshCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
      if (onRefreshCount) {
        onRefreshCount();
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Hook into custom events to update notifications automatically
  useEffect(() => {
    window.addEventListener('activity_saved', fetchNotifications);
    return () => window.removeEventListener('activity_saved', fetchNotifications);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      message.success('All notifications marked as read! 🔔');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const getNotificationEmoji = (msg) => {
    if (msg.includes('completed')) return '🔥';
    if (msg.includes('streak')) return '⚡';
    if (msg.includes('XP')) return '⭐';
    return '⚔️';
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
          <Bell size={20} color="var(--primary-orange)" />
          <span style={{ fontWeight: 800, fontSize: '18px' }}>Battle Alerts</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={360}
      styles={{
        header: { borderBottom: '1px solid #f1f5f9', padding: '16px' },
        body: { padding: '16px', background: '#f8fafc' }
      }}
      extra={
        notifications.some(n => !n.isRead) && (
          <Button 
            type="text" 
            onClick={handleMarkAllRead} 
            icon={<Check size={16} />}
            style={{ 
              color: 'var(--primary-orange)', 
              fontWeight: 600, 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Mark all read
          </Button>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
        
        {/* Helper info tag */}
        <div style={{
          background: 'rgba(255, 140, 0, 0.06)',
          border: '1px solid rgba(255, 140, 0, 0.12)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <Text style={{ fontSize: '11px', color: '#7c2d12', fontWeight: 500, lineHeight: 1.4 }}>
            Motivational alerts disappear automatically after 24 hours to keep the pressure high! Finish your daily habits to stay ahead! ⚔️
          </Text>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,140,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <Swords size={28} color="var(--primary-orange)" />
              </div>
              <Text strong style={{ fontSize: '15px', color: '#334155', display: 'block', marginBottom: '4px' }}>
                No Battle Alerts Yet
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', lineHeight: 1.4 }}>
                When your opponents complete their habits in active Duo Deals, you'll receive motivation alerts here to push you! 💪
              </Text>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((n, idx) => {
                const relativeTime = dayjs(n.createdAt).format('h:mm A');
                
                return (
                  <motion.div
                    key={n.id || idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{
                      background: n.isRead ? 'white' : 'linear-gradient(135deg, #ffffff 0%, #fffbf0 100%)',
                      border: n.isRead ? '1px solid #e2e8f0' : '1px solid rgba(255, 140, 0, 0.2)',
                      borderRadius: '16px',
                      padding: '14px',
                      boxShadow: n.isRead ? 'none' : '0 4px 12px rgba(255, 140, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      
                      {/* Active Unread Indicator Dot */}
                      {!n.isRead && (
                        <div style={{
                          position: 'absolute',
                          top: '14px',
                          right: '14px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--primary-orange)',
                          boxShadow: '0 0 8px rgba(255, 140, 0, 0.6)'
                        }} />
                      )}

                      {/* Emoji Icon Badge */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: n.isRead ? '#f1f5f9' : 'rgba(255, 140, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        {getNotificationEmoji(n.message)}
                      </div>

                      {/* Content Details */}
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <Text style={{ 
                          fontSize: '13px', 
                          color: '#1e293b', 
                          fontWeight: n.isRead ? 500 : 600,
                          lineHeight: 1.4,
                          display: 'block'
                        }}>
                          {n.message}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '10px', fontWeight: 600, marginTop: '4px', display: 'block', color: 'var(--text-gray)' }}>
                          ⏰ {relativeTime}
                        </Text>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default NotificationsDrawer;
