const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory room state
const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // 🏠 JOIN ROOM
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        queue: [],
        isPlaying: false,
        startTime: null,
        currentTime: 0,
        votes: new Set(),
        users: new Set(), // ✅ NEW
      };
    }

    const room = rooms[roomId];

    // ✅ Track user
    room.users.add(socket.id);

    console.log(`👤 ${socket.id} joined room ${roomId}`);

    // 🔥 Emit updated user count
    io.to(roomId).emit("user-count", room.users.size);

    // Send current state to new user
    socket.emit("room-state", {
      queue: room.queue,
      isPlaying: room.isPlaying,
      currentTime: room.currentTime,
    });
  });

  // ➕ ADD SONG
  socket.on("add-song", ({ roomId, song }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.queue.push(song);

    // ✅ Reset votes when queue changes
    room.votes.clear();

    io.to(roomId).emit("queue-updated", room.queue);

    // Reset vote UI
    io.to(roomId).emit("vote-update", {
      votes: 0,
      total: room.users.size || 1,
    });
  });

  // ▶️ PLAY (SYNC)
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

  // ⏸ PAUSE (SYNC)
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

  // 🗳 VOTE TO SKIP
  socket.on("vote-skip", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    room.votes.add(socket.id);

    const totalClients = room.users.size || 1;
    const votes = room.votes.size;

    console.log(`🗳 Votes: ${votes}/${totalClients}`);

    io.to(roomId).emit("vote-update", {
      votes,
      total: totalClients,
    });

    // ✅ Threshold = 50%
    if (votes >= Math.ceil(totalClients / 2)) {
      // ⏭ Remove current song
      room.queue.shift();

      // 🔄 Reset votes
      room.votes.clear();

      // 📢 Update queue
      io.to(roomId).emit("queue-updated", room.queue);

      // 📢 Reset vote UI
      io.to(roomId).emit("vote-update", {
        votes: 0,
        total: totalClients,
      });

      // ▶️ Auto play next song
      const now = Date.now();
      room.startTime = now;

      io.to(roomId).emit("play-sync", {
        startTime: now,
      });

      console.log("🔥 Auto-skip triggered by votes");
    }
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);

        // 🔥 Update user count
        io.to(roomId).emit("user-count", room.users.size);

        console.log(`👤 ${socket.id} left room ${roomId}`);
      }
    }
  });
});

// 🌐 Health check
app.get("/", (req, res) => {
  res.send("Neon Sync Server is running 🚀");
});

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
