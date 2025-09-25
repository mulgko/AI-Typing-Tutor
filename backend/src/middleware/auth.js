const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// JWT 토큰 검증 미들웨어
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "액세스 토큰이 필요합니다.",
        message: "Authorization 헤더에 Bearer 토큰을 포함해주세요.",
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "유효하지 않은 토큰입니다.",
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: "비활성화된 계정입니다.",
        message: "관리자에게 문의하세요.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
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

    console.error("인증 오류:", error);
    res.status(500).json({
      error: "인증 처리 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
};

// 선택적 인증 (토큰이 있으면 인증, 없으면 통과)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // 선택적 인증이므로 오류가 있어도 통과
    next();
  }
};

// 권한 확인 미들웨어
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "인증이 필요합니다.",
        message: "로그인 후 이용해주세요.",
      });
    }

    if (!roles.includes(req.user.subscriptionPlan)) {
      return res.status(403).json({
        error: "권한이 부족합니다.",
        message: `이 기능은 ${roles.join(", ")} 사용자만 이용할 수 있습니다.`,
      });
    }

    next();
  };
};

// 본인 확인 미들웨어
const checkOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;

  if (!req.user) {
    return res.status(401).json({
      error: "인증이 필요합니다.",
      message: "로그인 후 이용해주세요.",
    });
  }

  if (req.user._id.toString() !== resourceUserId) {
    return res.status(403).json({
      error: "권한이 부족합니다.",
      message: "본인의 데이터만 접근할 수 있습니다.",
    });
  }

  next();
};

module.exports = {
  generateToken,
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership,
};
