import { Form, Input, Button, Typography } from 'antd';
import { User, Lock, Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Text } = Typography;

const Register = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Success:', values);
    navigate('/');
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
    <div className="register-container" style={{ 
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
        <div style={{ position: 'absolute', top: '24px', left: '24px' }} onClick={() => navigate('/login')}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <ArrowLeft size={24} color="var(--text-dark)" style={{ cursor: 'pointer' }} />
          </motion.div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div variants={itemVariants}>
            <h1 className="gradient-text" style={{ 
              fontSize: '36px', 
              marginBottom: '8px', 
              letterSpacing: '-1px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))'
            }}>
              Join Duo Deals
            </h1>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Text style={{ 
              fontSize: '16px', 
              color: 'var(--text-gray)', 
              fontWeight: 400,
              display: 'block'
            }}>
              Start your habit journey with a duel.
            </Text>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <div className="modern-card">
            <Form 
              name="register" 
              onFinish={onFinish} 
              layout="vertical" 
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label={<Text strong style={{ fontSize: '13px', color: '#595959' }}>EMAIL ADDRESS</Text>}
                rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
              >
                <Input 
                  prefix={<Mail size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                  placeholder="name@example.com" 
                  style={{ height: '50px' }}
                />
              </Form.Item>

              <Form.Item
                name="username"
                label={<Text strong style={{ fontSize: '13px', color: '#595959' }}>USERNAME</Text>}
                rules={[{ required: true, message: 'Please choose a username!' }]}
              >
                <Input 
                  prefix={<User size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                  placeholder="Choose a cool name" 
                  style={{ height: '50px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong style={{ fontSize: '13px', color: '#595959' }}>PASSWORD</Text>}
                rules={[{ required: true, message: 'Please create a password!' }]}
                hasFeedback
              >
                <Input.Password 
                  prefix={<Lock size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                  placeholder="At least 8 characters" 
                  style={{ height: '50px' }}
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                label={<Text strong style={{ fontSize: '13px', color: '#595959' }}>CONFIRM PASSWORD</Text>}
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<ShieldCheck size={18} color="#bfbfbf" style={{ marginRight: '8px' }} />} 
                  placeholder="Repeat your password" 
                  style={{ height: '50px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '16px', marginTop: '8px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  style={{ height: '54px', fontSize: '16px', borderRadius: '16px' }}
                  icon={<ArrowRight size={18} />}
                  iconPosition="end"
                >
                  Create Account
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
                Already have an account? <Text strong type="link" onClick={() => navigate('/login')} style={{ color: 'var(--primary-orange)' }}>Log In</Text>
              </Text>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ textAlign: 'center', padding: '0 24px' }}>
          <Text style={{ fontSize: '12px', color: '#bfbfbf' }}>
            By signing up, you agree to our <Text strong style={{ fontSize: '11px', color: '#8c8c8c' }}>Terms of Service</Text> and <Text strong style={{ fontSize: '11px', color: '#8c8c8c' }}>Privacy Policy</Text>.
          </Text>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
