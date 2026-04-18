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
        users: new Set(),
        hostId: socket.id, // 👑 FIRST USER = HOST
      };
    }

    const room = rooms[roomId];

    // Track user
    room.users.add(socket.id);

    console.log(`👤 ${socket.id} joined room ${roomId}`);

    // Emit user count
    io.to(roomId).emit("user-count", room.users.size);

    // Send room state + host info
    socket.emit("room-state", {
      queue: room.queue,
      isPlaying: room.isPlaying,
      currentTime: room.currentTime,
      isHost: socket.id === room.hostId, // 👑
    });
  });

  // ➕ ADD SONG
  socket.on("add-song", ({ roomId, song }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.queue.push(song);

    // Reset votes
    room.votes.clear();

    io.to(roomId).emit("queue-updated", room.queue);

    io.to(roomId).emit("vote-update", {
      votes: 0,
      total: room.users.size || 1,
    });
  });

  // ▶️ PLAY
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

  // ⏸ PAUSE
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

  // 🗳 VOTE SKIP
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

    // 50% threshold
    if (votes >= Math.ceil(totalClients / 2)) {
      room.queue.shift();
      room.votes.clear();

      io.to(roomId).emit("queue-updated", room.queue);

      io.to(roomId).emit("vote-update", {
        votes: 0,
        total: totalClients,
      });

      const now = Date.now();
      room.startTime = now;

      io.to(roomId).emit("play-sync", {
        startTime: now,
      });

      console.log("🔥 Auto-skip triggered by votes");
    }
  });

  // 👑 FORCE SKIP (HOST ONLY)
  socket.on("force-skip", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    // Only host allowed
    if (socket.id !== room.hostId) {
      console.log("🚫 Non-host tried to force skip");
      return;
    }

    room.queue.shift();
    room.votes.clear();

    io.to(roomId).emit("queue-updated", room.queue);

    io.to(roomId).emit("vote-update", {
      votes: 0,
      total: room.users.size || 1,
    });

    const now = Date.now();
    room.startTime = now;

    io.to(roomId).emit("play-sync", {
      startTime: now,
    });

    console.log("👑 Host forced skip");
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);

        // 👑 If host leaves → assign new host
        if (socket.id === room.hostId) {
          const nextUser = room.users.values().next().value;

          room.hostId = nextUser || null;

          if (nextUser) {
            io.to(roomId).emit("host-updated", {
              hostId: nextUser,
            });

            console.log(`👑 New host assigned: ${nextUser}`);
          }
        }

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
