import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { Bell, Search, Mail } from 'lucide-react';
import { Badge } from 'antd';
import EmailSimulatorDrawer from '../components/EmailSimulatorDrawer';
import api from '../utils/api';

const MainLayout = () => {
  const [emailOpen, setEmailOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Inline fetch with mount guard
  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (isMounted) setPendingCount(0);
        return;
      }
      try {
        const res = await api.get('/duels/pending');
        if (isMounted) setPendingCount(res.data?.count ?? 0);
      } catch (err) {
        console.error('Failed to fetch pending count:', err);
        if (isMounted) setPendingCount(0);
      }
    };
    fetch();
    // Event listeners
    window.addEventListener('activity_saved', fetch);
    const handleOpenEmail = () => setEmailOpen(true);
    window.addEventListener('open_email_simulator', handleOpenEmail);

    return () => {
      window.removeEventListener('activity_saved', fetch);
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
          <Search size={22} color="var(--text-dark)" style={{ cursor: 'pointer' }} />
          
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

          <Bell size={22} color="var(--text-dark)" style={{ cursor: 'pointer' }} />
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

      {/* Global simulated email overlay client */}
      <EmailSimulatorDrawer open={emailOpen} onClose={() => setEmailOpen(false)} />

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

