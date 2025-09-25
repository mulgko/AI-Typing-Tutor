const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { generateToken, authenticate } = require("../middleware/auth");

const router = express.Router();

// 회원가입
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 20 })
      .withMessage("사용자명은 3-20자 사이여야 합니다.")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("사용자명은 영문, 숫자, 언더스코어만 사용할 수 있습니다."),
    body("email")
      .isEmail()
      .withMessage("유효한 이메일 주소를 입력해주세요.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("비밀번호는 최소 6자 이상이어야 합니다.")
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage("비밀번호는 영문과 숫자를 포함해야 합니다."),
    body("firstName")
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage("이름은 1-20자 사이여야 합니다."),
    body("lastName")
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage("성은 1-20자 사이여야 합니다."),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "입력값이 올바르지 않습니다.",
          details: errors.array(),
        });
      }

      const { username, email, password, firstName, lastName } = req.body;

      // 중복 확인
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(409).json({
          error: "이미 존재하는 사용자입니다.",
          message:
            existingUser.email === email
              ? "이미 사용 중인 이메일입니다."
              : "이미 사용 중인 사용자명입니다.",
        });
      }

      // 새 사용자 생성
      const user = new User({
        username,
        email,
        password,
        profile: {
          firstName: firstName || "",
          lastName: lastName || "",
          level: "beginner",
        },
      });

      await user.save();

      // JWT 토큰 생성
      const token = generateToken(user._id);

      res.status(201).json({
        message: "회원가입이 완료되었습니다.",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          statistics: user.statistics,
          preferences: user.preferences,
        },
        token,
      });
    } catch (error) {
      console.error("회원가입 오류:", error);
      res.status(500).json({
        error: "회원가입 중 오류가 발생했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// 로그인
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("유효한 이메일 주소를 입력해주세요.")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("비밀번호를 입력해주세요."),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "입력값이 올바르지 않습니다.",
          details: errors.array(),
        });
      }

      const { email, password } = req.body;

      // 사용자 찾기
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({
          error: "로그인에 실패했습니다.",
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        });
      }

      // 계정 활성화 확인
      if (!user.isActive) {
        return res.status(401).json({
          error: "비활성화된 계정입니다.",
          message: "관리자에게 문의하세요.",
        });
      }

      // 비밀번호 확인
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: "로그인에 실패했습니다.",
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        });
      }

      // 로그인 시간 업데이트
      user.lastLogin = new Date();
      await user.save();

      // JWT 토큰 생성
      const token = generateToken(user._id);

      res.json({
        message: "로그인이 완료되었습니다.",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          statistics: user.statistics,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
        },
        token,
      });
    } catch (error) {
      console.error("로그인 오류:", error);
      res.status(500).json({
        error: "로그인 중 오류가 발생했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// 토큰 검증 및 사용자 정보 반환
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      message: "사용자 정보를 조회했습니다.",
      user: req.user,
    });
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    res.status(500).json({
      error: "사용자 정보 조회 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 비밀번호 변경
router.put(
  "/change-password",
  authenticate,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("현재 비밀번호를 입력해주세요."),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("새 비밀번호는 최소 6자 이상이어야 합니다.")
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage("새 비밀번호는 영문과 숫자를 포함해야 합니다."),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "입력값이 올바르지 않습니다.",
          details: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      // 현재 비밀번호 확인
      const user = await User.findById(req.user._id).select("+password");
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: "현재 비밀번호가 올바르지 않습니다.",
          message: "현재 비밀번호를 다시 확인해주세요.",
        });
      }

      // 새 비밀번호로 업데이트
      user.password = newPassword;
      await user.save();

      res.json({
        message: "비밀번호가 성공적으로 변경되었습니다.",
      });
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      res.status(500).json({
        error: "비밀번호 변경 중 오류가 발생했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// 계정 삭제
router.delete(
  "/delete-account",
  authenticate,
  [
    body("password").notEmpty().withMessage("비밀번호를 입력해주세요."),
    body("confirmation")
      .equals("DELETE_MY_ACCOUNT")
      .withMessage(
        '계정 삭제를 확인하려면 "DELETE_MY_ACCOUNT"를 입력해주세요.'
      ),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "입력값이 올바르지 않습니다.",
          details: errors.array(),
        });
      }

      const { password } = req.body;

      // 비밀번호 확인
      const user = await User.findById(req.user._id).select("+password");
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(400).json({
          error: "비밀번호가 올바르지 않습니다.",
          message: "계정 삭제를 위해 올바른 비밀번호를 입력해주세요.",
        });
      }

      // 계정 비활성화 (완전 삭제 대신)
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      user.username = `deleted_${Date.now()}_${user.username}`;
      await user.save();

      res.json({
        message: "계정이 성공적으로 삭제되었습니다.",
        note: "데이터 복구가 필요한 경우 관리자에게 문의하세요.",
      });
    } catch (error) {
      console.error("계정 삭제 오류:", error);
      res.status(500).json({
        error: "계정 삭제 중 오류가 발생했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// 로그아웃 (클라이언트에서 토큰 삭제)
router.post("/logout", authenticate, async (req, res) => {
  try {
    // 서버에서는 특별한 처리 없이 성공 응답만
    // 실제 로그아웃은 클라이언트에서 토큰을 삭제하는 것으로 처리
    res.json({
      message: "로그아웃이 완료되었습니다.",
    });
  } catch (error) {
    console.error("로그아웃 오류:", error);
    res.status(500).json({
      error: "로그아웃 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

module.exports = router;
