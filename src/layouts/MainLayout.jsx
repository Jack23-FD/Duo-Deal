import { useState, useEffect, useSyncExternalStore } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { Bell, Search, Mail } from 'lucide-react';
import { Badge } from 'antd';
import EmailSimulatorDrawer from '../components/EmailSimulatorDrawer';
import { challengeStore } from '../utils/challengeStore';

const MainLayout = () => {
  const [emailOpen, setEmailOpen] = useState(false);

  const subscribeToChallengeUpdates = (callback) => {
    window.addEventListener('challenge_store_update', callback);
    return () => window.removeEventListener('challenge_store_update', callback);
  };

  const pendingCount = useSyncExternalStore(
    subscribeToChallengeUpdates,
    () => challengeStore.getChallenges().filter(ch => ch.status === 'PENDING').length,
    () => challengeStore.getChallenges().filter(ch => ch.status === 'PENDING').length
  );

  useEffect(() => {
    // Listen for custom trigger to open email simulator
    const handleOpenEmail = () => setEmailOpen(true);

    window.addEventListener('open_email_simulator', handleOpenEmail);

    return () => {
      window.removeEventListener('open_email_simulator', handleOpenEmail);
    };
  }, []);

  return (
    <div className="layout-wrapper" style={{ position: 'relative' }}>
      <header className="instagram-header">
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
      
      <main className="page-container">
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

