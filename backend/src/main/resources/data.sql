-- Sample data for development
INSERT INTO users (id, username, email, password_hash, profile_photo_url, bio, streak_days, last_streak_date, total_xp, is_active, created_at, updated_at) VALUES
  (1, 'alice', 'alice@example.com', '{noop}password', NULL, 'I love challenges', 0, NULL, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'bob', 'bob@example.com', '{noop}password', NULL, 'Ready to duel', 0, NULL, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO duels (id, challenger_id, opponent_id, start_date, end_date, status, created_at) VALUES
  (1, 1, 2, CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 'PENDING', CURRENT_TIMESTAMP);
