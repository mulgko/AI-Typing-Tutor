// ===================================
// 타이핑 테스트 라우트 파일 (typing.js)
// ===================================
// 이 파일은 타이핑 테스트와 관련된 모든 API 엔드포인트를 담고 있습니다.
// 테스트 시작/완료, 결과 저장, 텍스트 조회 등의 기능을 제공합니다.

const express = require("express");
const { body, validationResult, param } = require("express-validator"); // 입력 데이터 검증
const TypingTest = require("../models/TypingTest"); // 타이핑 테스트 모델
const TypingText = require("../models/TypingText"); // 타이핑 텍스트 모델
const User = require("../models/User"); // 사용자 모델
const { authenticate, optionalAuth } = require("../middleware/auth"); // 인증 미들웨어
const aiService = require("../services/aiService"); // AI 분석 서비스

const router = express.Router();

// ===================================
// 타이핑 테스트 시작 API
// ===================================
// POST /api/typing/test/start
// 새로운 타이핑 테스트 세션을 시작합니다
router.post(
  "/test/start",
  authenticate, // 로그인 필수
  [
    // 입력 데이터 검증 규칙들
    body("textId") // 텍스트 ID (선택사항)
      .optional()
      .isMongoId()
      .withMessage("유효하지 않은 텍스트 ID입니다."),
    body("textContent") // 타이핑할 텍스트 내용 (필수)
      .isLength({ min: 10 })
      .withMessage("텍스트는 최소 10자 이상이어야 합니다."),
    body("testMode") // 테스트 모드 (연습/시험/도전)
      .isIn(["practice", "test", "challenge"])
      .withMessage("유효하지 않은 테스트 모드입니다."),
  ],
  async (req, res) => {
    try {
      // 입력 데이터 검증 결과 확인
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "입력값이 올바르지 않습니다.",
          details: errors.array(),
        });
      }

      // 요청에서 필요한 데이터 추출
      const { textId, textContent, testMode = "practice" } = req.body;

      // 새 타이핑 테스트 데이터 구성
      const testData = {
        userId: req.user._id, // 현재 로그인한 사용자 ID
        textContent, // 타이핑할 텍스트
        testMode, // 테스트 모드
        userInput: "", // 사용자 입력 (아직 비어있음)
        startedAt: new Date(), // 테스트 시작 시간
        isCompleted: false, // 완료 여부 (아직 시작 단계)
        results: {
          // 결과 초기값들
          wpm: 0, // Words Per Minute (분당 단어수)
          accuracy: 0, // 정확도
          errors: 0, // 오타 수
          timeElapsed: 0, // 소요 시간
          charactersTyped: 0, // 입력한 글자 수
          wordsTyped: 0, // 입력한 단어 수
        },
      };

      // 특정 텍스트 ID가 제공된 경우 추가
      if (textId) {
        testData.textId = textId;
      }

      // 데이터베이스에 새 테스트 생성 및 저장
      const typingTest = new TypingTest(testData);
      await typingTest.save();

      // 성공 응답 - 프론트엔드에서 테스트를 시작할 수 있는 정보 제공
      res.status(201).json({
        message: "타이핑 테스트가 시작되었습니다.",
        testId: typingTest._id, // 테스트 ID (나중에 완료시 필요)
        test: {
          _id: typingTest._id,
          textContent: typingTest.textContent, // 타이핑할 텍스트
          testMode: typingTest.testMode, // 테스트 모드
          startedAt: typingTest.startedAt, // 시작 시간
        },
      });
    } catch (error) {
      console.error("타이핑 테스트 시작 오류:", error);
      res.status(500).json({
        error: "타이핑 테스트 시작에 실패했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// ===================================
// 타이핑 테스트 완료 API
// ===================================
// POST /api/typing/test/:testId/complete
// 사용자가 타이핑 테스트를 완료했을 때 결과를 저장하고 분석합니다
router.post(
  "/test/:testId/complete",
  authenticate, // 로그인 필수
  [
    param("testId").isMongoId().withMessage("유효하지 않은 테스트 ID입니다."),
    body("userInput")
      .isLength({ min: 1 })
      .withMessage("사용자 입력이 필요합니다."),
    body("wpm").isNumeric().withMessage("WPM은 숫자여야 합니다."),
    body("accuracy")
      .isFloat({ min: 0, max: 100 })
      .withMessage("정확도는 0-100 사이의 값이어야 합니다."),
    body("timeElapsed").isNumeric().withMessage("소요 시간은 숫자여야 합니다."),
    body("keystrokeData")
      .optional()
      .isArray()
      .withMessage("키스트로크 데이터는 배열이어야 합니다."),
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

      const { testId } = req.params;
      const {
        userInput,
        wpm,
        accuracy,
        timeElapsed,
        keystrokeData = [],
      } = req.body;

      const typingTest = await TypingTest.findOne({
        _id: testId,
        userId: req.user._id,
        isCompleted: false,
      });

      if (!typingTest) {
        return res.status(404).json({
          error: "타이핑 테스트를 찾을 수 없습니다.",
          message: "유효하지 않은 테스트 ID이거나 이미 완료된 테스트입니다.",
        });
      }

      // 결과 계산
      const analysisErrors = typingTest.analyzeErrors();
      const wordsTyped = userInput.trim().split(/\s+/).length;
      const charactersTyped = userInput.length;

      // 테스트 결과 업데이트
      typingTest.userInput = userInput;
      typingTest.results = {
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy),
        errors: analysisErrors.length,
        timeElapsed: Math.round(timeElapsed),
        charactersTyped,
        wordsTyped,
      };
      typingTest.keystrokeData = keystrokeData;
      typingTest.isCompleted = true;
      typingTest.completedAt = new Date();

      // 타이핑 패턴 분석
      const typingPattern = typingTest.analyzeTypingPattern();
      if (typingPattern) {
        typingTest.analysis.typingPattern = typingPattern;
      }

      // 에러 분석
      typingTest.analysis.errorAnalysis = {
        mostMissedCharacters: getMostMissedCharacters(analysisErrors),
        errorPositions: analysisErrors.map((e) => e.position),
        commonMistakes: getCommonMistakes(analysisErrors),
      };

      await typingTest.save();

      // 사용자 통계 업데이트
      const user = await User.findById(req.user._id);
      user.updateStatistics(typingTest.results);
      await user.save();

      // 텍스트 통계 업데이트 (textId가 있는 경우)
      if (typingTest.textId) {
        const typingText = await TypingText.findById(typingTest.textId);
        if (typingText) {
          typingText.updateStatistics(typingTest.results);
          await typingText.save();
        }
      }

      // AI 분석 및 피드백 생성
      let aiAnalysis = null;
      try {
        const userHistory = await TypingTest.find({ userId: req.user._id })
          .sort({ createdAt: -1 })
          .limit(10);

        aiAnalysis = await aiService.analyzeTypingPerformance(
          {
            wpm: typingTest.results.wpm,
            accuracy: typingTest.results.accuracy,
            errors: typingTest.results.errors,
            timeElapsed: typingTest.results.timeElapsed,
            textContent: typingTest.textContent,
            userInput: typingTest.userInput,
            keystrokeData: typingTest.keystrokeData,
          },
          userHistory
        );

        if (aiAnalysis.success) {
          typingTest.aiInsights = {
            recommendations: aiAnalysis.recommendations || [],
            nextGoals: aiAnalysis.nextGoals || [],
          };
          await typingTest.save();
        }
      } catch (aiError) {
        console.error("AI 분석 오류:", aiError);
        // AI 분석 실패해도 테스트 완료는 성공으로 처리
      }

      res.json({
        message: "타이핑 테스트가 완료되었습니다.",
        test: typingTest,
        aiAnalysis: aiAnalysis || null,
      });
    } catch (error) {
      console.error("타이핑 테스트 완료 오류:", error);
      res.status(500).json({
        error: "타이핑 테스트 완료에 실패했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// ===================================
// 사용자 타이핑 테스트 기록 조회 API
// ===================================
// GET /api/typing/tests
// 로그인한 사용자의 과거 타이핑 테스트 기록들을 페이지네이션과 함께 조회합니다
router.get("/tests", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, testMode } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id, isCompleted: true };
    if (testMode) {
      filter.testMode = testMode;
    }

    const tests = await TypingTest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("textId", "title metadata")
      .select("-keystrokeData"); // 키스트로크 데이터는 용량이 클 수 있으므로 제외

    const total = await TypingTest.countDocuments(filter);

    res.json({
      tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("타이핑 테스트 기록 조회 오류:", error);
    res.status(500).json({
      error: "타이핑 테스트 기록 조회에 실패했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 특정 타이핑 테스트 상세 조회
router.get(
  "/test/:testId",
  authenticate,
  [param("testId").isMongoId().withMessage("유효하지 않은 테스트 ID입니다.")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "입력값이 올바르지 않습니다.",
          details: errors.array(),
        });
      }

      const { testId } = req.params;

      const test = await TypingTest.findOne({
        _id: testId,
        userId: req.user._id,
      }).populate("textId", "title metadata");

      if (!test) {
        return res.status(404).json({
          error: "타이핑 테스트를 찾을 수 없습니다.",
          message: "유효하지 않은 테스트 ID입니다.",
        });
      }

      res.json({
        message: "타이핑 테스트 상세 정보를 조회했습니다.",
        test,
      });
    } catch (error) {
      console.error("타이핑 테스트 상세 조회 오류:", error);
      res.status(500).json({
        error: "타이핑 테스트 상세 조회에 실패했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// ===================================
// 타이핑 텍스트 목록 조회 API
// ===================================
// GET /api/typing/texts
// 사용할 수 있는 타이핑 텍스트들의 목록을 조회합니다 (로그인 선택사항)
router.get("/texts", optionalAuth, async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isActive: true, isPublic: true };

    if (category) {
      filter["metadata.category"] = category;
    }

    if (difficulty) {
      filter["metadata.difficulty"] = difficulty;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const texts = await TypingText.find(filter)
      .sort({ "statistics.rating": -1, "statistics.timesUsed": -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-content"); // 목록에서는 내용 제외

    const total = await TypingText.countDocuments(filter);

    res.json({
      texts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("타이핑 텍스트 목록 조회 오류:", error);
    res.status(500).json({
      error: "타이핑 텍스트 목록 조회에 실패했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 특정 타이핑 텍스트 조회
router.get(
  "/text/:textId",
  optionalAuth,
  [param("textId").isMongoId().withMessage("유효하지 않은 텍스트 ID입니다.")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "입력값이 올바르지 않습니다.",
          details: errors.array(),
        });
      }

      const { textId } = req.params;

      const text = await TypingText.findOne({
        _id: textId,
        isActive: true,
        isPublic: true,
      });

      if (!text) {
        return res.status(404).json({
          error: "타이핑 텍스트를 찾을 수 없습니다.",
          message: "유효하지 않은 텍스트 ID입니다.",
        });
      }

      res.json({
        message: "타이핑 텍스트를 조회했습니다.",
        text,
      });
    } catch (error) {
      console.error("타이핑 텍스트 조회 오류:", error);
      res.status(500).json({
        error: "타이핑 텍스트 조회에 실패했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// ===================================
// 유틸리티 함수들
// ===================================

// 가장 많이 틀린 글자들을 분석하는 함수
function getMostMissedCharacters(errors) {
  const charCount = {};
  errors.forEach((error) => {
    const char = error.expected;
    charCount[char] = (charCount[char] || 0) + 1;
  });

  return Object.entries(charCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([char]) => char);
}

// 일반적인 타이핑 실수 패턴을 분석하는 함수 (예: 'a'를 's'로 잘못 친다 등)
function getCommonMistakes(errors) {
  const mistakeCount = {};
  errors.forEach((error) => {
    const key = `${error.expected}->${error.actual}`;
    mistakeCount[key] = (mistakeCount[key] || 0) + 1;
  });

  return Object.entries(mistakeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([mistake, count]) => {
      const [from, to] = mistake.split("->");
      return { from, to, count };
    });
}

module.exports = router;
