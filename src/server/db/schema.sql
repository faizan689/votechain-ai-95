
-- Database schema for VoteGuard application

-- Create voters table
CREATE TABLE IF NOT EXISTS voters (
  voter_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  biometric_hash VARCHAR(255),
  otp VARCHAR(255),
  otp_expires_at TIMESTAMP,
  has_voted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  logo_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  voter_id VARCHAR(20) NOT NULL REFERENCES voters(voter_id),
  party_id VARCHAR(20) NOT NULL REFERENCES parties(id),
  voted_at TIMESTAMP NOT NULL,
  blockchain_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(voter_id)
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial parties data
INSERT INTO parties (id, name, symbol, color, logo_path)
VALUES 
  ('bjp', 'Bharatiya Janata Party', 'Lotus', '#FF9933', '/lovable-uploads/bd528e11-c547-4096-be22-973ccf0a7e69.png'),
  ('inc', 'Indian National Congress', 'Hand', '#0078D7', '/lovable-uploads/6d40bf13-e73a-4e1b-82fe-7c36e7663ad3.png'),
  ('aap', 'Aam Aadmi Party', 'Broom', '#019934', '/lovable-uploads/9a3952b9-53e0-4a7b-bb60-05c1b1687c20.png'),
  ('nota', 'None of the Above', 'NOTA', '#6B7280', '/lovable-uploads/893342f4-7eb9-4b71-9b23-dbd4445bf9a0.png')
ON CONFLICT (id) DO NOTHING;

-- Insert initial admin user (username: admin, password: admin123)
INSERT INTO admins (username, password_hash, role)
VALUES ('admin', '$2b$10$3Xa0xNEP5BrHZBtuM7/o1eXHmZI/ZFwoUw.7.Hg.r3JJa.ztpNzw.', 'super_admin')
ON CONFLICT (username) DO NOTHING;
