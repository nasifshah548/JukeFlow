const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend connection
    methods: ["GET", "POST"],
  },
});

// In-memory room state (later can be DB/Redis)
const rooms = {};

io.on("connection", (socket) => {
  // Vote to skip
  socket.on("vote-skip", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    room.votes.add(socket.id);

    const totalClients = io.sockets.adapter.rooms.get(roomId)?.size || 1;
    const votes = room.votes.size;

    console.log(`🗳 Votes: ${votes}/${totalClients}`);

    io.to(roomId).emit("vote-update", {
      votes,
      total: totalClients,
    });

    // Threshold: 50%
    if (votes >= Math.ceil(totalClients / 2)) {
      // Skip song
      room.queue.shift();
      room.votes.clear();

      io.to(roomId).emit("queue-updated", room.queue);

      // Auto play next
      const now = Date.now();
      room.startTime = now;

      io.to(roomId).emit("play-sync", {
        startTime: now,
      });

      console.log("⏭ Song skipped by votes");
    }
  });

  // Join room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        queue: [],
        isPlaying: false,
        startTime: null,
        currentTime: 0,
        votes: new Set(),
      };
    }

    console.log(`👤 ${socket.id} joined room ${roomId}`);

    // Send current state to new user
    socket.emit("room-state", rooms[roomId]);
  });

  // Add song
  socket.on("add-song", ({ roomId, song }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Add song to queue
    room.queue.push(song);

    // Reset votes whenever queue changes
    room.votes.clear();

    // Broadcast updated queue
    io.to(roomId).emit("queue-updated", room.queue);

    // Reset vote UI for all clients
    io.to(roomId).emit("vote-update", {
      votes: 0,
      total: io.sockets.adapter.rooms.get(roomId)?.size || 1,
    });
  });

  // Play (sync)
  socket.on("play", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    const now = Date.now();

    room.isPlaying = true;
    room.startTime = now;

    console.log(`▶️ Play in room ${roomId}`);

    io.to(roomId).emit("play-sync", {
      startTime: now,
    });
  });

  // Pause (sync)
  socket.on("pause", (roomId) => {
    const room = rooms[roomId];
    if (!room || !room.startTime) return;

    const elapsed = (Date.now() - room.startTime) / 1000;

    room.isPlaying = false;
    room.currentTime += elapsed;

    console.log(`⏸ Pause in room ${roomId}`);

    io.to(roomId).emit("pause-sync", {
      currentTime: room.currentTime,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Basic health check route
app.get("/", (req, res) => {
  res.send("Neon Sync Server is running 🚀");
});

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
