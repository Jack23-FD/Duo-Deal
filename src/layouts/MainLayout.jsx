import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { Bell, Search, Mail } from 'lucide-react';
import { Badge } from 'antd';
import EmailSimulatorDrawer from '../components/EmailSimulatorDrawer';
import NotificationsDrawer from '../components/NotificationsDrawer';
import SearchDrawer from '../components/SearchDrawer';
import api from '../utils/api';

const MainLayout = () => {
  const [emailOpen, setEmailOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch pending duels count and unread notification alerts count
  const fetchCounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPendingCount(0);
      setUnreadCount(0);
      return;
    }
    
    // 1. Fetch pending invitations count
    try {
      const res = await api.get('/duels/pending');
      setPendingCount(res.data?.count ?? 0);
    } catch (err) {
      console.error('Failed to fetch pending count:', err);
      setPendingCount(0);
    }

    // 2. Fetch unread notification alerts count
    try {
      const res = await api.get('/notifications');
      const unreadList = (res.data || []).filter(n => !n.isRead);
      setUnreadCount(unreadList.length);
    } catch (err) {
      console.error('Failed to fetch unread notifications count:', err);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const runFetch = () => {
      if (isMounted) {
        fetchCounts();
      }
    };

    runFetch();

    // Event listeners
    window.addEventListener('activity_saved', runFetch);
    const handleOpenEmail = () => setEmailOpen(true);
    window.addEventListener('open_email_simulator', handleOpenEmail);

    return () => {
      isMounted = false;
      window.removeEventListener('activity_saved', runFetch);
      window.removeEventListener('open_email_simulator', handleOpenEmail);
    };
  }, []);

  return (
    <div className="layout-wrapper" style={{ 
      position: 'relative',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <header className="instagram-header" style={{ flexShrink: 0 }}>
        <div className="logo gradient-text" style={{ fontSize: '22px' }}>Duo Deals</div>
        <div className="header-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Search 
            size={22} 
            color="var(--text-dark)" 
            style={{ cursor: 'pointer' }} 
            onClick={() => setSearchOpen(true)}
          />
          
          {/* Simulated Email Client Trigger in Header */}
          <Badge count={pendingCount} size="small" style={{ backgroundColor: 'var(--primary-orange)' }}>
            <div 
              onClick={() => setEmailOpen(true)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                animation: pendingCount > 0 ? 'pulse 2.5s infinite' : 'none'
              }}
            >
              <Mail size={22} color={pendingCount > 0 ? 'var(--primary-orange)' : 'var(--text-dark)'} />
            </div>
          </Badge>

          {/* Active Battle Notifications Bell Trigger */}
          <Badge count={unreadCount} size="small" style={{ backgroundColor: 'var(--primary-orange)' }}>
            <div 
              onClick={() => setNotificationsOpen(true)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                animation: unreadCount > 0 ? 'pulse 2.5s infinite' : 'none'
              }}
            >
              <Bell size={22} color={unreadCount > 0 ? 'var(--primary-orange)' : 'var(--text-dark)'} />
            </div>
          </Badge>
        </div>
      </header>
      
      <main className="page-container" style={{ 
        flex: 1, 
        overflowY: 'auto',
        position: 'relative',
        background: '#fafafa',
        paddingBottom: '80px'
      }}>
        <Outlet />
      </main>

      <BottomNavbar />

      {/* Global search overlay */}
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Global simulated email overlay client */}
      <EmailSimulatorDrawer open={emailOpen} onClose={() => setEmailOpen(false)} />

      {/* Global motivational battle notifications list client */}
      <NotificationsDrawer 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
        onRefreshCount={fetchCounts} 
      />

      {/* Inject basic custom animation for the bouncing badge */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 6px rgba(255, 140, 0, 0.4)); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  );
};

export default MainLayout;


