// ===================================
// 인증 미들웨어 파일 (auth.js)
// ===================================
// 이 파일은 사용자 로그인/인증과 관련된 모든 기능을 담고 있습니다.
// JWT 토큰을 생성하고 검증하여 사용자의 신원을 확인합니다.

const jwt = require("jsonwebtoken"); // JWT 토큰 생성/검증 라이브러리
const User = require("../models/User"); // 사용자 모델

// ===================================
// JWT 토큰 생성 함수
// ===================================
// 사용자가 로그인할 때 신원확인용 토큰을 만들어 줍니다
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // 토큰에 포함될 데이터 (사용자 ID)
    process.env.JWT_SECRET, // 토큰 암호화에 사용할 비밀키 (.env 파일에 저장)
    { expiresIn: "7d" } // 토큰 유효기간 (7일)
  );
};

// ===================================
// JWT 토큰 검증 미들웨어
// ===================================
// 로그인이 필요한 API에 접근할 때 사용자의 토큰을 검증합니다
const authenticate = async (req, res, next) => {
  try {
    // HTTP 요청 헤더에서 Authorization 정보 가져오기
    const authHeader = req.header("Authorization");

    // 토큰이 없거나 형식이 잘못된 경우
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "액세스 토큰이 필요합니다.",
        message: "Authorization 헤더에 Bearer 토큰을 포함해주세요.",
      });
    }

    // "Bearer " 부분을 제거하고 실제 토큰만 추출
    const token = authHeader.substring(7);

    // 토큰 검증 및 사용자 ID 추출
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 추출한 사용자 ID로 데이터베이스에서 사용자 정보 조회 (비밀번호 제외)
    const user = await User.findById(decoded.userId).select("-password");

    // 사용자가 존재하지 않는 경우
    if (!user) {
      return res.status(401).json({
        error: "유효하지 않은 토큰입니다.",
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 계정이 비활성화된 경우
    if (!user.isActive) {
      return res.status(401).json({
        error: "비활성화된 계정입니다.",
        message: "관리자에게 문의하세요.",
      });
    }

    // 검증 성공 - 요청 객체에 사용자 정보 추가하고 다음 단계로 진행
    req.user = user;
    next();
  } catch (error) {
    // JWT 관련 에러 처리
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "유효하지 않은 토큰입니다.",
        message: "토큰 형식이 올바르지 않습니다.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "만료된 토큰입니다.",
        message: "다시 로그인해주세요.",
      });
    }

    // 기타 서버 에러
    console.error("인증 오류:", error);
    res.status(500).json({
      error: "인증 처리 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
};

// ===================================
// 선택적 인증 미들웨어
// ===================================
// 토큰이 있으면 인증하고, 없으면 그냥 통과시킵니다 (로그인 선택사항인 API용)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    // 토큰이 없으면 인증 없이 그냥 통과
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    // 토큰이 있으면 검증 시도
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    // 유효한 사용자이면 요청에 사용자 정보 추가
    if (user && user.isActive) {
      req.user = user;
    }

    next(); // 성공/실패 상관없이 다음 단계로 진행
  } catch (error) {
    // 선택적 인증이므로 토큰 에러가 있어도 그냥 통과
    next();
  }
};

// ===================================
// 권한 확인 미들웨어 (구독 플랜 기반)
// ===================================
// 특정 구독 플랜 사용자만 이용할 수 있는 기능에 사용합니다
const authorize = (...roles) => {
  return (req, res, next) => {
    // 먼저 로그인이 되어있는지 확인
    if (!req.user) {
      return res.status(401).json({
        error: "인증이 필요합니다.",
        message: "로그인 후 이용해주세요.",
      });
    }

    // 사용자의 구독 플랜이 허용된 플랜 목록에 포함되는지 확인
    if (!roles.includes(req.user.subscriptionPlan)) {
      return res.status(403).json({
        error: "권한이 부족합니다.",
        message: `이 기능은 ${roles.join(", ")} 사용자만 이용할 수 있습니다.`,
      });
    }

    // 권한 확인 완료 - 다음 단계로 진행
    next();
  };
};

// ===================================
// 본인 확인 미들웨어
// ===================================
// 자신의 데이터만 접근할 수 있도록 하는 보안 장치입니다
const checkOwnership = (req, res, next) => {
  // URL 파라미터나 요청 본문에서 사용자 ID 추출
  const resourceUserId = req.params.userId || req.body.userId;

  // 로그인 확인
  if (!req.user) {
    return res.status(401).json({
      error: "인증이 필요합니다.",
      message: "로그인 후 이용해주세요.",
    });
  }

  // 요청하는 사용자 ID와 로그인한 사용자 ID가 일치하는지 확인
  if (req.user._id.toString() !== resourceUserId) {
    return res.status(403).json({
      error: "권한이 부족합니다.",
      message: "본인의 데이터만 접근할 수 있습니다.",
    });
  }

  // 본인 확인 완료 - 다음 단계로 진행
  next();
};

// ===================================
// 다른 파일에서 사용할 수 있도록 내보내기
// ===================================
module.exports = {
  generateToken, // 토큰 생성
  authenticate, // 필수 인증
  optionalAuth, // 선택적 인증
  authorize, // 권한 확인 (구독 플랜 기반)
  checkOwnership, // 본인 확인
};
