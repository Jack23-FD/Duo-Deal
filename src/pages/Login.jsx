import { useState } from 'react';
import { Form, Input, Button, Typography, Divider, message } from 'antd';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const { Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
                <Text type="link" style={{ fontSize: '13px', fontWeight: 500 }}>Forgot password?</Text>
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
                New to Duo Deals? <Text strong type="link" onClick={() => navigate('/register')} style={{ color: 'var(--primary-orange)' }}>Create Account</Text>
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
    </div>
  );
};

export default Login;
