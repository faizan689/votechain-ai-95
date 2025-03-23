
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// JWT secret key (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'voteguard_secret_key';
const JWT_EXPIRY = '1h';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'voteguard_admin_secret_key';

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash a password or OTP
 */
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Compare a password or OTP with a hash
 */
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Generate a JWT token for a voter
 */
export function generateToken(voterId: string): string {
  return jwt.sign({ voterId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Generate a JWT token for an admin
 */
export function generateAdminToken(adminId: string): string {
  return jwt.sign({ adminId, isAdmin: true }, ADMIN_JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify if a voter exists in the database
 */
export async function verifyVoterExists(db: any, voterId: string): Promise<any> {
  const result = await db.query('SELECT * FROM voters WHERE voter_id = $1', [voterId]);
  return result.rows[0];
}
