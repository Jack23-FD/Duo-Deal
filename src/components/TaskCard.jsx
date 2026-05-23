import { Typography } from 'antd';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const { Text } = Typography;

const TaskCard = ({ title, time, completed, onToggle }) => {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="modern-card" 
      style={{ 
        padding: '16px', 
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: completed ? '4px solid #52c41a' : '4px solid var(--primary-orange)',
        background: completed ? 'rgba(82, 196, 26, 0.02)' : 'white'
      }}
    >
      <div style={{ flex: 1 }}>
        <motion.h4 
          animate={{ color: completed ? '#bfbfbf' : 'var(--text-dark)' }}
          style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}
        >
          {completed ? <del>{title}</del> : title}
        </motion.h4>
        <Text style={{ fontSize: '12px', color: 'var(--text-gray)' }}>{time || 'Daily Goal'}</Text>
      </div>
      
      <div onClick={onToggle} style={{ cursor: 'pointer', paddingLeft: '12px' }}>
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="checked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 color="#52c41a" size={26} fill="rgba(82, 196, 26, 0.1)" />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Circle color="var(--primary-orange)" size={26} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskCard;
