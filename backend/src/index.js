// ===================================
// 백엔드 메인 서버 파일 (index.js)
// ===================================
// 이 파일은 Express.js 웹 서버의 핵심 설정을 담고 있습니다.
// 프론트엔드가 백엔드와 통신할 때 거쳐가는 모든 요청의 시작점입니다.

// 필요한 라이브러리들을 불러옵니다
const express = require("express"); // 웹 서버 프레임워크
const cors = require("cors"); // 프론트엔드-백엔드 간 통신 허용 설정
const helmet = require("helmet"); // 보안 강화 미들웨어
const compression = require("compression"); // 응답 데이터 압축으로 속도 향상
const morgan = require("morgan"); // HTTP 요청 로그 기록
const rateLimit = require("express-rate-limit"); // 과도한 요청 방지
require("dotenv").config({ path: "./tutor.env" }); // 환경변수 파일(.env) 설정 로드

// 데이터베이스 연결 함수 불러오기
const connectDB = require("./config/database");

// ===================================
// API 라우트(경로) 파일들 불러오기
// ===================================
// 각 기능별로 분리된 라우트 파일들입니다
const authRoutes = require("./routes/auth"); // 로그인/회원가입 관련
const userRoutes = require("./routes/user"); // 사용자 프로필/설정 관련
const typingRoutes = require("./routes/typing"); // 타이핑 테스트 관련
const aiRoutes = require("./routes/ai"); // AI 기능 관련
const analyticsRoutes = require("./routes/analytics"); // 통계/분석 관련

// Express 앱 인스턴스 생성 및 포트 설정
const app = express();
const PORT = process.env.PORT || 3001; // 환경변수에서 포트를 가져오거나 기본값 3001 사용

// ===================================
// 데이터베이스 연결 시작
// ===================================
connectDB(); // MongoDB 데이터베이스에 연결합니다

// ===================================
// 미들웨어 설정
// ===================================
// 미들웨어란? 모든 HTTP 요청이 들어올 때마다 자동으로 실행되는 함수들입니다

app.use(helmet()); // 보안 헤더 자동 설정 (해킹 방지)
app.use(compression()); // 응답 데이터를 압축해서 전송 속도 향상
app.use(morgan("combined")); // 모든 HTTP 요청을 콘솔에 로그로 기록

// ===================================
// CORS(Cross-Origin Resource Sharing) 설정
// ===================================
// 프론트엔드(React)와 백엔드(Express) 간의 통신을 허용하는 설정입니다
app.use(
  cors({
    // 허용할 프론트엔드 주소 (보통 React 개발서버는 3000번 포트)
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // 쿠키나 인증 정보 포함 요청 허용
  })
);

// ===================================
// 레이트 리미팅 (요청 제한) 설정
// ===================================
// 한 사용자가 너무 많은 요청을 보내는 것을 방지합니다 (DOS 공격 방지)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15분 시간창
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 15분 동안 최대 100번 요청 허용
});
app.use(limiter);

// ===================================
// 요청 데이터 파싱 설정
// ===================================
// 프론트엔드에서 보낸 JSON 데이터를 자동으로 JavaScript 객체로 변환
app.use(express.json({ limit: "10mb" })); // JSON 파싱 (최대 10MB)
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// ===================================
// API 라우트(경로) 연결
// ===================================
// 프론트엔드에서 특정 URL로 요청이 오면 해당하는 라우트 파일로 연결합니다
// 예: POST /api/auth/login 요청 → authRoutes 파일의 login 함수 실행

app.use("/api/auth", authRoutes); // 인증 관련: /api/auth/login, /api/auth/register 등
app.use("/api/user", userRoutes); // 사용자 관련: /api/user/profile, /api/user/statistics 등
app.use("/api/typing", typingRoutes); // 타이핑 관련: /api/typing/test, /api/typing/results 등
app.use("/api/ai", aiRoutes); // AI 관련: /api/ai/generate-text, /api/ai/feedback 등
app.use("/api/analytics", analyticsRoutes); // 분석 관련: /api/analytics/dashboard, /api/analytics/reports 등

// ===================================
// 서버 상태 확인 엔드포인트
// ===================================
// 서버가 정상적으로 동작하는지 확인할 수 있는 간단한 API
// GET /health 요청시 서버 상태 정보를 반환합니다
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK", // 서버 상태
    timestamp: new Date().toISOString(), // 현재 시간
    uptime: process.uptime(), // 서버 가동 시간(초)
  });
});

// ===================================
// 404 에러 핸들러
// ===================================
// 존재하지 않는 API 경로에 접근했을 때 실행되는 함수
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `경로 ${req.originalUrl}을 찾을 수 없습니다.`,
  });
});

// ===================================
// 전역 에러 핸들러
// ===================================
// 서버에서 예상치 못한 오류가 발생했을 때 실행되는 함수
app.use((err, req, res, next) => {
  console.error(err.stack); // 에러 내용을 콘솔에 출력

  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    error: err.message || "서버 내부 오류가 발생했습니다.",
    // 개발 환경에서만 상세한 에러 스택 정보 제공
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ===================================
// 서버 시작
// ===================================
// 설정이 모두 완료된 Express 서버를 지정된 포트에서 실행시킵니다
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 환경: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 CORS 허용 URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});

// 다른 파일에서 이 app을 사용할 수 있도록 내보내기 (주로 테스트용)
module.exports = app;
