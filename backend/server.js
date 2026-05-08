const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const http = require("http");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");
const { initializeSocket } = require("./socket");
const { connectRedis } = require("./config/redis");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Connect to Redis (optional, won't crash if Redis is not available)
connectRedis().catch(err => console.log('Redis connection failed, continuing without cache'));

// Security Middleware
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." }
});
app.use("/api", limiter);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data Sanitization against NoSQL Injection
app.use(mongoSanitize());

// Compression
app.use(compression());

// Kết nối MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/notes-app";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Backend is running!");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/shares", require("./routes/shares"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/activities", require("./routes/activities"));
app.use("/api/sync", require("./routes/sync"));

// Background jobs
const { cleanupDeletedNotes } = require("./utils/cleanup");
const { checkReminders } = require("./utils/reminders");

// Chạy cleanup mỗi ngày
setInterval(cleanupDeletedNotes, 24 * 60 * 60 * 1000);

// Kiểm tra reminders mỗi phút
setInterval(checkReminders, 60 * 1000);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST /api/auth/register - Đăng ký`);
  console.log(`   POST /api/auth/login - Đăng nhập`);
  console.log(`   GET  /api/notes - Lấy notes`);
  console.log(`   POST /api/notes - Tạo note`);
  console.log(`🔌 Socket.io initialized`);
});
