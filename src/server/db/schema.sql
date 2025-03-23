
-- Create voters table
CREATE TABLE IF NOT EXISTS voters (
  id SERIAL PRIMARY KEY,
  voter_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  district VARCHAR(50) NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(100),
  otp VARCHAR(100),
  otp_expires_at TIMESTAMP,
  facial_verification_attempts INTEGER DEFAULT 0,
  has_voted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS parties (
  id SERIAL PRIMARY KEY,
  party_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(100) NOT NULL,
  color VARCHAR(20),
  logo_path VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  voter_id VARCHAR(20) REFERENCES voters(voter_id),
  party_id VARCHAR(20) REFERENCES parties(party_id),
  district VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  performed_by VARCHAR(20),
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create failed authentication attempts table
CREATE TABLE IF NOT EXISTS failed_auth_attempts (
  id SERIAL PRIMARY KEY,
  voter_id VARCHAR(20),
  ip_address VARCHAR(50),
  attempt_type VARCHAR(20), -- 'otp', 'facial', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo data for voters
INSERT INTO voters (voter_id, name, district, phone, email, has_voted)
VALUES
  ('ABC-123-456', 'John Doe', 'North District', '+1234567890', 'john@example.com', FALSE),
  ('DEF-789-012', 'Jane Smith', 'East District', '+1987654321', 'jane@example.com', FALSE),
  ('GHI-345-678', 'Michael Johnson', 'West District', '+1456789012', 'michael@example.com', FALSE),
  ('JKL-901-234', 'Emily Davis', 'South District', '+1789012345', 'emily@example.com', FALSE),
  ('MNO-567-890', 'Robert Wilson', 'Central District', '+1321654987', 'robert@example.com', FALSE)
ON CONFLICT (voter_id) DO NOTHING;

-- Insert demo data for parties
INSERT INTO parties (party_id, name, symbol, color, logo_path)
VALUES
  ('PTY-001', 'Progressive Alliance', 'Star', '#1E88E5', '/logos/progressive-alliance.png'),
  ('PTY-002', 'Conservative Union', 'Tree', '#43A047', '/logos/conservative-union.png'),
  ('PTY-003', 'Liberty Party', 'Eagle', '#FDD835', '/logos/liberty-party.png'),
  ('PTY-004', 'National Front', 'Lion', '#F4511E', '/logos/national-front.png'),
  ('PTY-005', 'Unity Coalition', 'Handshake', '#8E24AA', '/logos/unity-coalition.png')
ON CONFLICT (party_id) DO NOTHING;

-- Insert demo admin
INSERT INTO admins (admin_id, name, email, password)
VALUES ('ADMIN-001', 'Admin User', 'admin@voteguard.com', '$2b$10$Z7Z3Z7Z3Z7Z3Z7Z3Z7Z3Z.Z7Z3Z7Z3Z7Z3Z7Z3Z7Z3Z7Z3Z7Z3Z7Z')
ON CONFLICT (admin_id) DO NOTHING;
