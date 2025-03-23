
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import votingRoutes from './routes/voting';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voteguard',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Make database pool available in req object
app.use((req: any, res, next) => {
  req.db = pool;
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/admin', adminRoutes);

// WebSocket events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_election', (electionId) => {
    socket.join(`election_${electionId}`);
    console.log(`Client ${socket.id} joined election ${electionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing purposes
export { app, server, io, pool };
