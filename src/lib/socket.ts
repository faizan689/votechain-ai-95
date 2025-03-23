
import { io, Socket } from "socket.io-client";
import { ElectionStats } from "@/types/api";

// Socket.io client instance
let socket: Socket | null = null;

// Event callbacks
const eventCallbacks: Record<string, Function[]> = {
  vote_update: [],
};

/**
 * Initialize Socket.io connection
 */
export function initializeSocket() {
  if (socket) return;
  
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
  
  socket = io(SOCKET_URL);
  
  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
  });
  
  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });
  
  socket.on("vote_update", (data: ElectionStats) => {
    // Call all registered callbacks for this event
    eventCallbacks.vote_update.forEach(callback => callback(data));
  });
}

/**
 * Join an election room to receive updates
 */
export function joinElection(electionId: string = "default") {
  if (!socket) {
    initializeSocket();
  }
  
  socket?.emit("join_election", electionId);
}

/**
 * Register callback for vote updates
 */
export function onVoteUpdate(callback: (data: ElectionStats) => void) {
  eventCallbacks.vote_update.push(callback);
  
  // Return a function to unregister the callback
  return () => {
    const index = eventCallbacks.vote_update.indexOf(callback);
    if (index !== -1) {
      eventCallbacks.vote_update.splice(index, 1);
    }
  };
}

/**
 * Close socket connection
 */
export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
