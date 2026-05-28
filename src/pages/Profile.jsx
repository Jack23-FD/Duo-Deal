import { useState, useEffect } from 'react';
import { Typography, Avatar, Card, Button, List, Switch, Space, Divider, Modal, Form, Input, message } from 'antd';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, Award, Lock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();

  // Profile state
  const [userName, setUserName] = useState('Felix');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [userBio, setUserBio] = useState('"Pair-habit warrior & daily builder."');
  const [streakDays, setStreakDays] = useState(0);
  const [totalDeals, setTotalDeals] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [notificationsOn, setNotificationsOn] = useState(true);

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Forms
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setUserName(res.data.username || 'Felix');
        setUserEmail(res.data.email || '');
        setUserBio(res.data.bio || '"Pair-habit warrior & daily builder."');
        setUserAvatar(res.data.profilePhotoUrl || null);

        editForm.setFieldsValue({
          username: res.data.username || '',
          bio: res.data.bio || '',
          profilePhotoUrl: res.data.profilePhotoUrl || '',
        });

        const statsRes = await api.get('/users/me/achievements');
        setStreakDays(statsRes.data.streakDays ?? 0);
        setTotalDeals(statsRes.data.totalDeals ?? 0);
        setCompletionRate(statsRes.data.completionRate ? Math.round(statsRes.data.completionRate) : 0);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // ── Edit Profile ──────────────────────────────────────
  const handleEditProfile = async () => {
    try {
      const values = await editForm.validateFields();
      await api.put('/users/me', { username: values.username, bio: values.bio, profilePhotoUrl: values.profilePhotoUrl });
      if (values.profilePhotoUrl) setUserAvatar(values.profilePhotoUrl);
      setUserName(values.username);
      setUserBio(values.bio);
      message.success('Profile updated! ✅');
      setEditProfileOpen(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // ── Change Password ───────────────────────────────────
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('Passwords do not match!');
        return;
      }
      await api.put('/users/me/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword
      });
      message.success('Password changed! ✅');
      passwordForm.resetFields();
      setChangePasswordOpen(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  // ── Logout ────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    message.success('Logged out successfully!');
    navigate('/login');
  };

  // ── Delete Account ────────────────────────────────────
  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/me');
      localStorage.clear();
      message.success('Account deleted.');
      navigate('/login');
    } catch (err) {
      message.error('Failed to delete account');
    }
  };

  // ── Menu Items ────────────────────────────────────────
  const menuItems = [
    {
      icon: <User size={20} />,
      label: 'Edit Profile',
      onClick: () => setEditProfileOpen(true)
    },
    {
      icon: <Bell size={20} />,
      label: 'Notifications',
      suffix: (
        <Switch
          checked={notificationsOn}
          onChange={setNotificationsOn}
          size="small"
        />
      )
    },
    {
      icon: <Shield size={20} />,
      label: 'Privacy & Security',
      onClick: () => setChangePasswordOpen(true)
    },
    {
      icon: <Award size={20} />,
      label: 'Achievements',
      onClick: () => setAchievementsOpen(true)
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      onClick: () => setSettingsOpen(true)
    },
  ];

  return (
    <div style={{ padding: '10px 0', paddingBottom: '100px' }}>

      {/* ── Profile Header ── */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Avatar
          size={100}
          src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
          style={{ border: '4px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginBottom: '16px' }}
        />
        <Title level={4} style={{ margin: 0, fontWeight: 800 }}>{userName} (Me)</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>@{userEmail}</Text>
        <Text style={{ fontSize: '13px', color: 'var(--text-gray)', fontStyle: 'italic', maxWidth: '280px', display: 'block', margin: '0 auto 16px' }}>
          {userBio}
        </Text>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '10px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '20px', color: 'var(--primary-orange)' }}>{streakDays} Days</div>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Streak</Text>
          </div>
          <div style={{ width: '1px', height: '40px', background: '#f0f0f0', alignSelf: 'center' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '20px', color: '#007bff' }}>{totalDeals}</div>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Total Deals</Text>
          </div>
          <div style={{ width: '1px', height: '40px', background: '#f0f0f0', alignSelf: 'center' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '20px', color: '#52c41a' }}>{completionRate}%</div>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Completed</Text>
          </div>
        </div>
      </div>

      {/* ── Menu ── */}
      <Card className="modern-card" style={{ padding: 0 }}>
        <List
          itemLayout="horizontal"
          dataSource={menuItems}
          renderItem={(item) => (
            <List.Item
              onClick={item.onClick}
              style={{ padding: '16px', cursor: item.onClick ? 'pointer' : 'default' }}
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

      {/* ── Logout Button ── */}
      <Button
        type="text" danger block
        icon={<LogOut size={18} />}
        onClick={() => setLogoutOpen(true)}
        style={{ marginTop: '20px', height: '50px', background: 'rgba(255,77,79,0.05)', borderRadius: '12px', cursor: 'pointer' }}
      >
        Logout
      </Button>

      {/* ══════════════════════════════════════
          MODALS
      ══════════════════════════════════════ */}

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editProfileOpen}
        onOk={handleEditProfile}
        onCancel={() => setEditProfileOpen(false)}
        okText="Save"
        okButtonProps={{ style: { background: 'var(--primary-orange)', border: 'none' } }}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Profile Photo URL" name="profilePhotoUrl">
            <Input placeholder="Paste image URL here (optional)" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Enter username' }]}>
            <Input placeholder="Enter username" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Bio" name="bio">
            <Input.TextArea placeholder="Write something about you..." rows={3} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Privacy & Security"
        open={changePasswordOpen}
        onOk={handleChangePassword}
        onCancel={() => { setChangePasswordOpen(false); passwordForm.resetFields(); }}
        okText="Change Password"
        okButtonProps={{ style: { background: 'var(--primary-orange)', border: 'none' } }}
      >
        <Form form={passwordForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Current Password" name="currentPassword" rules={[{ required: true, message: 'Enter current password' }]}>
            <Input.Password placeholder="Current password" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="New Password" name="newPassword" rules={[{ required: true, message: 'Enter new password' }]}>
            <Input.Password placeholder="New password" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Confirm New Password" name="confirmPassword" rules={[{ required: true, message: 'Confirm new password' }]}>
            <Input.Password placeholder="Confirm password" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        title="🏆 Achievements"
        open={achievementsOpen}
        onCancel={() => setAchievementsOpen(false)}
        footer={null}
      >
        <div style={{ padding: '16px 0' }}>
          {[
            { icon: '🔥', label: 'Current Streak', value: `${streakDays} Days`, color: 'var(--primary-orange)' },
            { icon: '⚔️', label: 'Total Deals', value: totalDeals, color: '#007bff' },
            { icon: '✅', label: 'Completion Rate', value: `${completionRate}%`, color: '#52c41a' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 16px', marginBottom: 10,
              background: '#fafafa', borderRadius: 12,
              border: '1px solid #f0f0f0'
            }}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <Text style={{ fontWeight: 600, color: '#1e293b' }}>{item.label}</Text>
              </div>
              <Text style={{ fontWeight: 900, fontSize: 18, color: item.color }}>{item.value}</Text>
            </div>
          ))}
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        title="⚙️ Settings"
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        footer={null}
      >
        <div style={{ padding: '16px 0' }}>
          {/* Dark Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Text style={{ fontWeight: 500 }}>🌙 Dark Mode</Text>
            <Switch size="small" onChange={(checked) => {
              document.body.style.background = checked ? '#1a1a1a' : '';
              document.body.style.color = checked ? '#fff' : '';
            }} />
          </div>

          {/* Language */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Text style={{ fontWeight: 500 }}>🌐 Language</Text>
            <Text type="secondary">English</Text>
          </div>

          {/* Delete Account */}
          <div style={{ marginTop: 20 }}>
            <Button
              danger block
              icon={<Trash2 size={16} />}
              onClick={() => { setSettingsOpen(false); setDeleteAccountOpen(true); }}
              style={{ borderRadius: 10, height: 44 }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirm Modal */}
      <Modal
        title="Logout"
        open={logoutOpen}
        onOk={handleLogout}
        onCancel={() => setLogoutOpen(false)}
        okText="Yes, Logout"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <Text>Are you sure you want to logout?</Text>
      </Modal>

      {/* Delete Account Confirm Modal */}
      <Modal
        title="⚠️ Delete Account"
        open={deleteAccountOpen}
        onOk={handleDeleteAccount}
        onCancel={() => setDeleteAccountOpen(false)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <Text>Are you sure? This action is permanent and cannot be undone.</Text>
      </Modal>

    </div>
  );
};

export default Profile;
