const { exec } = require("child_process");

console.log("⚡ Starting Neon Dev Environment...\n");

// Start backend
exec("cd neon-sync-server && node server.js", (err) => {
  if (err) console.error("Backend error:", err);
});

// Start frontend
exec("npm run dev", (err) => {
  if (err) console.error("Frontend error:", err);
});
