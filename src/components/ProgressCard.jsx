import { motion } from 'framer-motion';

const ProgressCard = ({ userProgress, opponentProgress, userName = 'Felix', opponentName = 'Opponent' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: 120,
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* ── Left Half: User (Blue Background) ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #007bff 0%, #00c6ff 100%)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative background shape */}
        <div style={{
          position: 'absolute', left: -20, bottom: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)'
        }} />
        <span style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.3px',
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          zIndex: 1,
        }}>
          {userName}
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 4,
          zIndex: 1,
        }}>
          {userProgress}% Completed
        </span>
      </div>

      {/* ── Center: VS Battle Badge (Silver/White Bold) ── */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #b0b0b0 100%)',
        border: '3px solid #fff',
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 900,
          color: '#1a1a1a',
          letterSpacing: '0.5px',
        }}>VS</span>
      </div>

      {/* ── Right Half: Opponent (Orange Background) ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #ff8c00 0%, #ffb347 100%)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'right',
      }}>
        {/* Decorative background shape */}
        <div style={{
          position: 'absolute', right: -20, bottom: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)'
        }} />
        <span style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.3px',
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          zIndex: 1,
        }}>
          {opponentName}
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 4,
          zIndex: 1,
        }}>
          {opponentProgress}% Completed
        </span>
      </div>
    </motion.div>
  );
};

export default ProgressCard;
