const express = require("express");
const { body, validationResult, param } = require("express-validator");
const TypingTest = require("../models/TypingTest");
const TypingText = require("../models/TypingText");
const User = require("../models/User");
const { authenticate, optionalAuth } = require("../middleware/auth");
const aiService = require("../services/aiService");

const router = express.Router();

// 타이핑 테스트 시작
router.post(
  "/test/start",
  authenticate,
  [
    body("textId")
      .optional()
      .isMongoId()
      .withMessage("유효하지 않은 텍스트 ID입니다."),
    body("textContent")
      .isLength({ min: 10 })
      .withMessage("텍스트는 최소 10자 이상이어야 합니다."),
    body("testMode")
      .isIn(["practice", "test", "challenge"])
      .withMessage("유효하지 않은 테스트 모드입니다."),
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

      const { textId, textContent, testMode = "practice" } = req.body;

      const testData = {
        userId: req.user._id,
        textContent,
        testMode,
        userInput: "",
        startedAt: new Date(),
        isCompleted: false,
        results: {
          wpm: 0,
          accuracy: 0,
          errors: 0,
          timeElapsed: 0,
          charactersTyped: 0,
          wordsTyped: 0,
        },
      };

      if (textId) {
        testData.textId = textId;
      }

      const typingTest = new TypingTest(testData);
      await typingTest.save();

      res.status(201).json({
        message: "타이핑 테스트가 시작되었습니다.",
        testId: typingTest._id,
        test: {
          _id: typingTest._id,
          textContent: typingTest.textContent,
          testMode: typingTest.testMode,
          startedAt: typingTest.startedAt,
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

// 타이핑 테스트 완료 및 결과 저장
router.post(
  "/test/:testId/complete",
  authenticate,
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
      const errors = typingTest.analyzeErrors();
      const wordsTyped = userInput.trim().split(/\s+/).length;
      const charactersTyped = userInput.length;

      // 테스트 결과 업데이트
      typingTest.userInput = userInput;
      typingTest.results = {
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy),
        errors: errors.length,
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
        mostMissedCharacters: this.getMostMissedCharacters(errors),
        errorPositions: errors.map((e) => e.position),
        commonMistakes: this.getCommonMistakes(errors),
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

// 사용자의 타이핑 테스트 기록 조회
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

// 타이핑 텍스트 목록 조회
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

// 유틸리티 함수들
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
