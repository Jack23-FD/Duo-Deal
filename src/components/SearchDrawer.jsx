import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User } from 'lucide-react';
import api from '../utils/api';

const SearchDrawer = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const handleSearch = (val) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/search', { params: { username: val.trim() } });
        setResults(res.data || []);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
              zIndex: 1000, backdropFilter: 'blur(4px)'
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              background: 'white', zIndex: 1001,
              borderRadius: '0 0 24px 24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              padding: '16px 16px 20px',
            }}
          >
            {/* Search Input Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                background: '#f8fafc', borderRadius: '14px', padding: '10px 14px',
                border: '1.5px solid #e2e8f0'
              }}>
                <Search size={18} color="#ff8c00" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search users..."
                  style={{
                    border: 'none', outline: 'none', background: 'transparent',
                    flex: 1, fontSize: '15px', fontWeight: 500,
                    color: '#0f172a', fontFamily: 'inherit'
                  }}
                />
                {query.length > 0 && (
                  <button
                    onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                  >
                    <X size={16} color="#94a3b8" />
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: '12px',
                  padding: '10px 14px', cursor: 'pointer', fontWeight: 700,
                  color: '#475569', fontSize: '14px', fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
            </div>

            {/* Results */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '14px' }}
                >
                  Searching...
                </motion.div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: '24px 16px' }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                  <p style={{ margin: 0, color: '#64748b', fontWeight: 600, fontSize: '14px' }}>
                    No users found for "<span style={{ color: '#ff8c00' }}>{query}</span>"
                  </p>
                </motion.div>
              )}

              {!loading && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  {results.map((user, i) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '14px',
                        cursor: 'pointer', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                        background: 'linear-gradient(135deg, #ff8c00, #007bff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, border: '2px solid #fff7ed'
                      }}>
                        {user.profilePhotoUrl ? (
                          <img src={user.profilePhotoUrl} alt={user.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: 'white', fontWeight: 800, fontSize: '16px', fontFamily: 'Arial' }}>
                            {user.username?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Name & stats */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                          {user.username}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          🔥 {user.streakDays || 0} day streak &nbsp;·&nbsp; ⚡ {user.totalXp || 0} XP
                        </div>
                      </div>

                      {/* Tag */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(0,123,255,0.1))',
                        color: '#ff8c00', fontSize: '11px', fontWeight: 700,
                        padding: '4px 10px', borderRadius: '99px'
                      }}>
                        @{user.username.toLowerCase()}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!query && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '24px 16px 8px' }}
                >
                  <User size={28} color="#e2e8f0" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                    Type a username to find users
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchDrawer;
