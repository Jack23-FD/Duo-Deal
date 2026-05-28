import { useState } from 'react';
import { Form, Input, Button, Typography, Divider, message, Modal } from 'antd';
import { User, Lock, ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const { Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Forgot Password Simulation State
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request, 2 = Email Delivery Simulation, 3 = Reset Password Form
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmailAddress, setResetEmailAddress] = useState('');
  const [forgotForm] = Form.useForm();
  const [newPasswordForm] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        usernameOrEmail: values.username,
        password: values.password
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_profile', JSON.stringify(res.data.user));
      message.success('Login successful!');
      
      window.dispatchEvent(new Event('activity_saved'));
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Login failed:', err);
      message.error(err.response?.data?.message || 'Login failed: Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (values) => {
    setForgotLoading(true);
    // Simulating endpoint checking / email sending
    setTimeout(() => {
      setForgotLoading(false);
      setResetUsername(values.email.split('@')[0]);
      setResetEmailAddress(values.email.includes('@') ? values.email : `${values.email}@duodeals.com`);
      setForgotStep(2);
      message.success('Simulated email delivered to your inbox!');
    }, 1200);
  };

  const handleResetPassword = async (values) => {
    setForgotLoading(true);
    try {
      // Hit the real backend password reset endpoint we just added!
      await api.post('/auth/reset-password', {
        usernameOrEmail: resetEmailAddress,
        newPassword: values.newPassword
      });

      setForgotLoading(false);
      setForgotOpen(false);
      setForgotStep(1);
      forgotForm.resetFields();
      newPasswordForm.resetFields();

      Modal.success({
        title: 'Password Updated!',
        content: 'Your password has been successfully reset in the database. You can now log in using your new password!',
        okButtonProps: { style: { background: 'var(--gradient-orange)', border: 'none' } }
      });
    } catch (err) {
      console.error('Password reset failed:', err);
      message.error(err.response?.data?.message || 'Failed to reset password. Please check your credentials.');
      setForgotLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="login-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at top right, rgba(255, 140, 0, 0.05), transparent 400px), radial-gradient(circle at bottom left, rgba(0, 123, 255, 0.05), transparent 400px)'
    }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.div variants={itemVariants}>
            <h1 className="gradient-text" style={{ 
              fontSize: '48px', 
              marginBottom: '12px', 
              letterSpacing: '-1.5px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))'
            }}>
              Duo Deals
            </h1>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Text style={{ 
              fontSize: '18px', 
              color: 'var(--text-gray)', 
              fontWeight: 400,
              display: 'block'
            }}>
              Level up your habits together.
            </Text>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <div className="modern-card">
            <Form 
              name="login" 
              onFinish={onFinish} 
              layout="vertical" 
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="username"
                label={<Text strong style={{ fontSize: '13px', color: '#595959' }}>USERNAME OR EMAIL</Text>}
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input 
                  prefix={<User size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                  placeholder="name@example.com" 
                  style={{ height: '50px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong style={{ fontSize: '13px', color: '#595959' }}>PASSWORD</Text>}
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password 
                  prefix={<Lock size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                  placeholder="Enter your password" 
                  style={{ height: '50px' }}
                />
              </Form.Item>

              <div style={{ textAlign: 'right', marginBottom: '24px', marginTop: '-8px' }}>
                <Text 
                  type="link" 
                  onClick={() => setForgotOpen(true)}
                  style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: 'var(--primary-orange)' }}
                >
                  Forgot password?
                </Text>
              </div>

              <Form.Item style={{ marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading}
                  style={{ height: '54px', fontSize: '16px', borderRadius: '16px' }}
                  icon={<ArrowRight size={18} />}
                  iconPlacement="end"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider plain>
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>OR</Text>
            </Divider>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text style={{ fontSize: '15px', color: 'var(--text-gray)' }}>
                New to Duo Deals? <Text strong type="link" onClick={() => navigate('/register')} style={{ color: 'var(--primary-orange)', cursor: 'pointer' }}>Create Account</Text>
              </Text>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text style={{ fontSize: '12px', color: '#bfbfbf' }}>
            Powered by modern habit-pairing tech.
          </Text>
        </motion.div>
      </motion.div>

      {/* Forgot Password Step-by-Step Simulation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {forgotStep === 1 && 'Reset Password'}
              {forgotStep === 2 && '📨 Simulated Inbox (1 New Email)'}
              {forgotStep === 3 && '🔒 Set New Password'}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              {forgotStep === 1 && 'We will simulate sending a recovery link'}
              {forgotStep === 2 && 'Double-click the action button below to simulation-bypass'}
              {forgotStep === 3 && 'This updates your actual account credentials'}
            </span>
          </div>
        }
        open={forgotOpen}
        onCancel={() => {
          if (!forgotLoading) {
            setForgotOpen(false);
            setForgotStep(1);
            forgotForm.resetFields();
            newPasswordForm.resetFields();
          }
        }}
        footer={null}
        centered
        styles={{ body: { paddingTop: '16px' } }}
      >
        {forgotStep === 1 && (
          <Form
            form={forgotForm}
            onFinish={handleForgotSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label={<Text strong style={{ fontSize: '12px', color: '#64748b' }}>EMAIL OR USERNAME</Text>}
              rules={[
                { required: true, message: 'Please input your email or username!' }
              ]}
            >
              <Input 
                prefix={<Mail size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                placeholder="e.g. Jack-23 or jack@example.com"
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <Button 
                onClick={() => {
                  setForgotOpen(false);
                  forgotForm.resetFields();
                }}
                disabled={forgotLoading}
                style={{ borderRadius: '10px', fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={forgotLoading}
                style={{ borderRadius: '10px', fontWeight: 600, background: 'var(--gradient-orange)', border: 'none' }}
              >
                Send Link
              </Button>
            </div>
          </Form>
        )}

        {forgotStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '16px', padding: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px', fontSize: '13px', color: '#64748b' }}>
                <div>
                  <strong>From:</strong> security@duodeals.com
                </div>
                <div>
                  <strong>To:</strong> {resetEmailAddress}
                </div>
              </div>
              <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>🔑 Reset your Duo Deals Password</h4>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                Hi there,<br /><br />
                We received a request to reset your password for the Duo Deals account linked to <strong>{resetUsername}</strong>.<br />
                To proceed, click the button below to secure your account and set a new password:
              </p>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <Button
                  type="primary"
                  onClick={() => setForgotStep(3)}
                  style={{
                    background: 'linear-gradient(135deg, #ff8c00, #007bff)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    height: '44px',
                    padding: '0 28px',
                    boxShadow: '0 4px 14px rgba(255, 140, 0, 0.25)',
                    cursor: 'pointer'
                  }}
                >
                  Reset Password Now
                </Button>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
                If you did not request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        )}

        {forgotStep === 3 && (
          <Form
            form={newPasswordForm}
            onFinish={handleResetPassword}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="newPassword"
              label={<Text strong style={{ fontSize: '12px', color: '#64748b' }}>NEW PASSWORD</Text>}
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password 
                prefix={<Lock size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                placeholder="At least 6 characters"
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<Text strong style={{ fontSize: '12px', color: '#64748b' }}>CONFIRM NEW PASSWORD</Text>}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<Lock size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                placeholder="Repeat new password"
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <Button 
                onClick={() => {
                  setForgotStep(2);
                  newPasswordForm.resetFields();
                }}
                disabled={forgotLoading}
                style={{ borderRadius: '10px', fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={forgotLoading}
                style={{ borderRadius: '10px', fontWeight: 600, background: 'var(--gradient-orange)', border: 'none' }}
              >
                Update Password
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Login;

