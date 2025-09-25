const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/database");

// 라우트 임포트
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const typingRoutes = require("./routes/typing");
const aiRoutes = require("./routes/ai");
const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 3001;

// 데이터베이스 연결
connectDB();

// 미들웨어
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

// CORS 설정
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// 레이트 리미팅
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 최대 100 요청
});
app.use(limiter);

// JSON 파싱
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/typing", typingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check 엔드포인트
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 핸들러
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `경로 ${req.originalUrl}을 찾을 수 없습니다.`,
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);

  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    error: err.message || "서버 내부 오류가 발생했습니다.",
    ...(isDevelopment && { stack: err.stack }),
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 환경: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 CORS 허용 URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});

module.exports = app;
