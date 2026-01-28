const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

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
  console.log("⚡ Client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        queue: [],
        currentIndex: 0,
        isPlaying: false,
      };
    }

    // Send current room state
    socket.emit("room-state", rooms[roomId]);

    console.log(`🎧 ${socket.id} joined room ${roomId}`);
  });

  socket.on("add-song", ({ roomId, song }) => {
    if (!rooms[roomId]) return;

    rooms[roomId].queue.push(song);

    io.to(roomId).emit("queue-updated", rooms[roomId].queue);
  });

  socket.on("play", (roomId) => {
    if (!rooms[roomId]) return;

    rooms[roomId].isPlaying = true;
    io.to(roomId).emit("play");
  });

  socket.on("pause", (roomId) => {
    if (!rooms[roomId]) return;

    rooms[roomId].isPlaying = false;
    io.to(roomId).emit("pause");
  });

  socket.on("disconnect", () => {
    console.log("💨 Client disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("🔥 Neon Sync Server is alive");
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Neon Sync Server running on http://localhost:${PORT}`);
});
