import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, User, Award } from 'lucide-react';
import '../styles/BottomNavbar.css';

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={24} />, path: '/', label: 'Home' },
    { icon: <ClipboardList size={24} />, path: '/activity', label: 'Activity' },
    { icon: <PlusCircle size={32} strokeWidth={2.5} className="create-icon" />, path: '/create', label: 'Create' },
    { icon: <Award size={24} />, path: '/challenges', label: 'Deals' },
    { icon: <User size={24} />, path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="bottom-navbar">
      {navItems.map((item) => (
        <div
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNavbar;
