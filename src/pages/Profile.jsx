import { Typography, Avatar, Card, Button, List, Switch, Space, Divider } from 'antd';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, Award } from 'lucide-react';

const { Title, Text } = Typography;

const Profile = () => {
  const menuItems = [
    { icon: <User size={20} />, label: 'Edit Profile' },
    { icon: <Bell size={20} />, label: 'Notifications', suffix: <Switch defaultChecked size="small" /> },
    { icon: <Shield size={20} />, label: 'Privacy & Security' },
    { icon: <Award size={20} />, label: 'Achievements' },
    { icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="profile-page" style={{ padding: '10px 0' }}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Avatar size={100} src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" style={{ border: '4px solid white', boxShadow: 'var(--shadow-md)', marginBottom: '16px' }} />
        <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Felix (Me)</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>@felix_habits</Text>
        <Text style={{ fontSize: '13px', color: 'var(--text-gray)', fontStyle: 'italic', maxWidth: '280px', display: 'block', margin: '0 auto 16px' }}>
          "Pair-habit warrior & daily builder. Striving for 100% atomic compliance every day! 🥊"
        </Text>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '10px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '20px', color: 'var(--primary-orange)' }}>12 Days</div>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Streak</Text>
          </div>
          <Divider type="vertical" style={{ height: '40px' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '20px', color: '#007bff' }}>3</div>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Total Deals</Text>
          </div>
          <Divider type="vertical" style={{ height: '40px' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '20px', color: '#52c41a' }}>88%</div>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Completed</Text>
          </div>
        </div>
      </div>

      <Card className="modern-card" style={{ padding: '0' }}>
        <List
          itemLayout="horizontal"
          dataSource={menuItems}
          renderItem={(item) => (
            <List.Item 
              style={{ padding: '16px', display: 'flex', cursor: 'pointer' }}
              extra={item.suffix || <ChevronRight size={16} color="#bfbfbf" />}
            >
              <Space size="large">
                <div style={{ color: 'var(--primary-orange)' }}>{item.icon}</div>
                <Text style={{ fontWeight: 500 }}>{item.label}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      <Button 
        type="text" 
        danger 
        block 
        icon={<LogOut size={18} />} 
        style={{ marginTop: '20px', height: '50px', background: 'rgba(255, 77, 79, 0.05)', borderRadius: '12px' }}
      >
        Logout
      </Button>
    </div>
  );
};

export default Profile;
