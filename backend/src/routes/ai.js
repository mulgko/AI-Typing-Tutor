const express = require("express");
const { body, validationResult } = require("express-validator");
const TypingText = require("../models/TypingText");
const TypingTest = require("../models/TypingTest");
const { authenticate } = require("../middleware/auth");
const aiService = require("../services/aiService");

const router = express.Router();

// AI 텍스트 생성
router.post(
  "/generate-text",
  authenticate,
  [
    body("difficulty")
      .optional()
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("유효하지 않은 난이도입니다."),
    body("category")
      .optional()
      .isIn([
        "기술",
        "문학",
        "뉴스",
        "일반",
        "교육",
        "비즈니스",
        "과학",
        "역사",
        "예술",
      ])
      .withMessage("유효하지 않은 카테고리입니다."),
    body("length")
      .optional()
      .isIn(["short", "medium", "long"])
      .withMessage("유효하지 않은 길이입니다."),
    body("focusAreas")
      .optional()
      .isArray()
      .withMessage("포커스 영역은 배열이어야 합니다."),
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

      const {
        difficulty = "intermediate",
        category = "일반",
        length = "medium",
        focusAreas = [],
      } = req.body;

      // 사용자 레벨 가져오기
      const userLevel = req.user.profile.level || "intermediate";

      const result = await aiService.generateTypingText({
        difficulty,
        category,
        length,
        userLevel,
        focusAreas,
      });

      if (!result.success) {
        return res.status(500).json({
          error: "AI 텍스트 생성에 실패했습니다.",
          message: result.error,
          details: result.details,
        });
      }

      // 생성된 텍스트를 데이터베이스에 저장
      const typingText = new TypingText({
        title: `AI 생성 텍스트 - ${category}`,
        content: result.content,
        metadata: {
          category,
          difficulty,
          language: "ko",
        },
        source: {
          type: "ai_generated",
          aiModel: result.metadata.model,
          prompt: `난이도: ${difficulty}, 카테고리: ${category}, 길이: ${length}`,
        },
        tags: ["ai-generated", category.toLowerCase(), difficulty],
        createdBy: req.user._id,
        isPublic: false, // 처음에는 비공개로 생성
      });

      await typingText.save();

      res.status(201).json({
        message: "AI 텍스트가 성공적으로 생성되었습니다.",
        text: {
          _id: typingText._id,
          title: typingText.title,
          content: typingText.content,
          metadata: typingText.metadata,
          source: typingText.source,
        },
        aiMetadata: result.metadata,
      });
    } catch (error) {
      console.error("AI 텍스트 생성 오류:", error);
      res.status(500).json({
        error: "AI 텍스트 생성 중 오류가 발생했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// 사용자 맞춤형 텍스트 추천
router.get("/recommend-texts", authenticate, async (req, res) => {
  try {
    // 사용자의 최근 테스트 기록 가져오기
    const recentTests = await TypingTest.find({
      userId: req.user._id,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const recommendations = await aiService.recommendTexts(
      req.user.profile,
      recentTests
    );

    // 추천된 설정으로 실제 텍스트 검색
    const recommendedTexts = await Promise.all(
      recommendations.map(async (rec) => {
        const texts = await TypingText.findByDifficulty(rec.difficulty, 3);
        return {
          type: rec.type,
          recommendation: rec,
          texts: texts.slice(0, 3),
        };
      })
    );

    res.json({
      message: "맞춤형 텍스트 추천을 생성했습니다.",
      recommendations: recommendedTexts,
      userProfile: {
        level: req.user.profile.level,
        averageWPM: req.user.statistics.averageWPM,
        averageAccuracy: req.user.statistics.averageAccuracy,
      },
    });
  } catch (error) {
    console.error("텍스트 추천 오류:", error);
    res.status(500).json({
      error: "텍스트 추천 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 타이핑 성과 AI 분석
router.post(
  "/analyze-performance",
  authenticate,
  [
    body("period")
      .optional()
      .isIn(["week", "month", "quarter", "year"])
      .withMessage("유효하지 않은 기간입니다."),
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

      const { period = "month" } = req.body;

      // 기간에 따른 날짜 계산
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // 해당 기간의 테스트 기록 가져오기
      const tests = await TypingTest.find({
        userId: req.user._id,
        isCompleted: true,
        createdAt: { $gte: startDate, $lte: now },
      }).sort({ createdAt: 1 });

      if (tests.length === 0) {
        return res.status(404).json({
          error: "분석할 데이터가 없습니다.",
          message: `${period} 기간 동안의 타이핑 테스트 기록이 없습니다.`,
        });
      }

      // 기본 통계 계산
      const analysis = {
        period,
        totalTests: tests.length,
        averageWPM: Math.round(
          tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length
        ),
        averageAccuracy: Math.round(
          tests.reduce((sum, test) => sum + test.results.accuracy, 0) /
            tests.length
        ),
        bestWPM: Math.max(...tests.map((test) => test.results.wpm)),
        bestAccuracy: Math.max(...tests.map((test) => test.results.accuracy)),
        totalTimeSpent: Math.round(
          tests.reduce((sum, test) => sum + test.results.timeElapsed, 0)
        ),
        improvementTrend: this.calculateImprovementTrend(tests),
        weeklyProgress: this.calculateWeeklyProgress(tests),
        commonErrors: this.analyzeCommonErrors(tests),
        strengthsAndWeaknesses: this.analyzeStrengthsAndWeaknesses(tests),
      };

      // AI 기반 상세 분석 (최근 테스트만 사용)
      const recentTest = tests[tests.length - 1];
      const aiAnalysis = await aiService.analyzeTypingPerformance(
        {
          wpm: recentTest.results.wpm,
          accuracy: recentTest.results.accuracy,
          errors: recentTest.results.errors,
          timeElapsed: recentTest.results.timeElapsed,
          textContent: recentTest.textContent,
          userInput: recentTest.userInput,
          keystrokeData: recentTest.keystrokeData,
        },
        tests
      );

      res.json({
        message: "타이핑 성과 분석이 완료되었습니다.",
        analysis,
        aiInsights: aiAnalysis.success ? aiAnalysis : null,
        recommendations: this.generatePeriodRecommendations(analysis, tests),
      });
    } catch (error) {
      console.error("성과 분석 오류:", error);
      res.status(500).json({
        error: "성과 분석 중 오류가 발생했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// 개인화된 학습 계획 생성
router.post(
  "/generate-study-plan",
  authenticate,
  [
    body("targetWPM")
      .optional()
      .isInt({ min: 20, max: 120 })
      .withMessage("목표 WPM은 20-120 사이의 값이어야 합니다."),
    body("targetAccuracy")
      .optional()
      .isInt({ min: 80, max: 100 })
      .withMessage("목표 정확도는 80-100 사이의 값이어야 합니다."),
    body("dailyMinutes")
      .optional()
      .isInt({ min: 5, max: 120 })
      .withMessage("일일 연습 시간은 5-120분 사이여야 합니다."),
    body("weeks")
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage("계획 기간은 1-12주 사이여야 합니다."),
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

      const {
        targetWPM = req.user.profile.goal.targetWPM || 50,
        targetAccuracy = req.user.profile.goal.targetAccuracy || 95,
        dailyMinutes = 15,
        weeks = 4,
      } = req.body;

      // 현재 사용자 실력 분석
      const currentStats = req.user.statistics;
      const recentTests = await TypingTest.find({
        userId: req.user._id,
        isCompleted: true,
      })
        .sort({ createdAt: -1 })
        .limit(10);

      // 학습 계획 생성
      const studyPlan = {
        duration: `${weeks}주`,
        dailyTime: `${dailyMinutes}분`,
        currentLevel: {
          wpm: currentStats.averageWPM,
          accuracy: currentStats.averageAccuracy,
          level: req.user.profile.level,
        },
        goals: {
          wpm: targetWPM,
          accuracy: targetAccuracy,
        },
        weeklyPlan: [],
        recommendedTexts: [],
        milestones: [],
      };

      // 주별 계획 생성
      for (let week = 1; week <= weeks; week++) {
        const weeklyWPMGoal = Math.round(
          currentStats.averageWPM +
            ((targetWPM - currentStats.averageWPM) * week) / weeks
        );
        const weeklyAccuracyGoal = Math.round(
          currentStats.averageAccuracy +
            ((targetAccuracy - currentStats.averageAccuracy) * week) / weeks
        );

        studyPlan.weeklyPlan.push({
          week,
          focus: this.getWeeklyFocus(week, weeks, currentStats, {
            targetWPM,
            targetAccuracy,
          }),
          goals: {
            wpm: weeklyWPMGoal,
            accuracy: weeklyAccuracyGoal,
          },
          dailyTasks: this.generateDailyTasks(week, dailyMinutes, currentStats),
          practiceTexts: await this.getWeeklyTexts(
            week,
            req.user.profile.level
          ),
        });
      }

      // 마일스톤 설정
      studyPlan.milestones = this.generateMilestones(weeks, currentStats, {
        targetWPM,
        targetAccuracy,
      });

      res.json({
        message: "개인화된 학습 계획이 생성되었습니다.",
        studyPlan,
        estimatedProgress: {
          wpmImprovement: targetWPM - currentStats.averageWPM,
          accuracyImprovement: targetAccuracy - currentStats.averageAccuracy,
          totalPracticeHours: (weeks * 7 * dailyMinutes) / 60,
        },
      });
    } catch (error) {
      console.error("학습 계획 생성 오류:", error);
      res.status(500).json({
        error: "학습 계획 생성 중 오류가 발생했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// 유틸리티 함수들
function calculateImprovementTrend(tests) {
  if (tests.length < 2) return { wpm: 0, accuracy: 0 };

  const firstHalf = tests.slice(0, Math.floor(tests.length / 2));
  const secondHalf = tests.slice(Math.floor(tests.length / 2));

  const firstHalfAvgWPM =
    firstHalf.reduce((sum, test) => sum + test.results.wpm, 0) /
    firstHalf.length;
  const secondHalfAvgWPM =
    secondHalf.reduce((sum, test) => sum + test.results.wpm, 0) /
    secondHalf.length;

  const firstHalfAvgAccuracy =
    firstHalf.reduce((sum, test) => sum + test.results.accuracy, 0) /
    firstHalf.length;
  const secondHalfAvgAccuracy =
    secondHalf.reduce((sum, test) => sum + test.results.accuracy, 0) /
    secondHalf.length;

  return {
    wpm: Math.round(secondHalfAvgWPM - firstHalfAvgWPM),
    accuracy: Math.round(secondHalfAvgAccuracy - firstHalfAvgAccuracy),
  };
}

function calculateWeeklyProgress(tests) {
  // 주별 진행 상황 계산 로직
  const weekly = {};
  tests.forEach((test) => {
    const week = this.getWeekKey(test.createdAt);
    if (!weekly[week]) {
      weekly[week] = { tests: [], wpm: 0, accuracy: 0 };
    }
    weekly[week].tests.push(test);
  });

  Object.keys(weekly).forEach((week) => {
    const weekTests = weekly[week].tests;
    weekly[week].wpm = Math.round(
      weekTests.reduce((sum, test) => sum + test.results.wpm, 0) /
        weekTests.length
    );
    weekly[week].accuracy = Math.round(
      weekTests.reduce((sum, test) => sum + test.results.accuracy, 0) /
        weekTests.length
    );
    weekly[week].count = weekTests.length;
  });

  return weekly;
}

function analyzeCommonErrors(tests) {
  // 공통 오류 분석 로직
  const errorTypes = {
    speed: 0,
    accuracy: 0,
    consistency: 0,
  };

  tests.forEach((test) => {
    if (test.results.wpm < 30) errorTypes.speed++;
    if (test.results.accuracy < 90) errorTypes.accuracy++;
    if (
      test.analysis &&
      test.analysis.typingPattern &&
      test.analysis.typingPattern.keySpeedVariation > 0.5
    ) {
      errorTypes.consistency++;
    }
  });

  return errorTypes;
}

function analyzeStrengthsAndWeaknesses(tests) {
  const analysis = {
    strengths: [],
    weaknesses: [],
  };

  const avgWPM =
    tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;
  const avgAccuracy =
    tests.reduce((sum, test) => sum + test.results.accuracy, 0) / tests.length;

  if (avgWPM > 50) analysis.strengths.push("빠른 타이핑 속도");
  if (avgAccuracy > 95) analysis.strengths.push("높은 정확도");

  if (avgWPM < 30) analysis.weaknesses.push("타이핑 속도 개선 필요");
  if (avgAccuracy < 90) analysis.weaknesses.push("정확도 개선 필요");

  return analysis;
}

function generatePeriodRecommendations(analysis, tests) {
  const recommendations = [];

  if (analysis.averageWPM < 40) {
    recommendations.push("기본 자판 연습을 통해 타이핑 속도를 향상시키세요.");
  }

  if (analysis.averageAccuracy < 90) {
    recommendations.push("속도보다는 정확성에 집중하여 연습하세요.");
  }

  if (analysis.improvementTrend.wpm < 0) {
    recommendations.push("꾸준한 연습을 통해 실력 저하를 방지하세요.");
  }

  return recommendations;
}

function getWeeklyFocus(week, totalWeeks, currentStats, goals) {
  if (week <= totalWeeks / 3) return "accuracy";
  if (week <= (totalWeeks * 2) / 3) return "speed";
  return "consistency";
}

function generateDailyTasks(week, dailyMinutes, currentStats) {
  const tasks = [];

  if (currentStats.averageAccuracy < 90) {
    tasks.push(`정확성 연습 (${Math.round(dailyMinutes * 0.6)}분)`);
    tasks.push(`속도 연습 (${Math.round(dailyMinutes * 0.4)}분)`);
  } else {
    tasks.push(`속도 연습 (${Math.round(dailyMinutes * 0.6)}분)`);
    tasks.push(`복합 연습 (${Math.round(dailyMinutes * 0.4)}분)`);
  }

  return tasks;
}

async function getWeeklyTexts(week, userLevel) {
  try {
    return await TypingText.findByDifficulty(userLevel, 3);
  } catch (error) {
    return [];
  }
}

function generateMilestones(weeks, currentStats, goals) {
  const milestones = [];

  for (let i = 1; i <= weeks; i += Math.ceil(weeks / 4)) {
    const progressRatio = i / weeks;
    milestones.push({
      week: i,
      description: `${i}주차 목표 달성`,
      wpmGoal: Math.round(
        currentStats.averageWPM +
          (goals.targetWPM - currentStats.averageWPM) * progressRatio
      ),
      accuracyGoal: Math.round(
        currentStats.averageAccuracy +
          (goals.targetAccuracy - currentStats.averageAccuracy) * progressRatio
      ),
    });
  }

  return milestones;
}

function getWeekKey(date) {
  const year = date.getFullYear();
  const week = Math.ceil(
    (date.getDate() + new Date(year, date.getMonth(), 1).getDay()) / 7
  );
  return `${year}-${date.getMonth() + 1}-W${week}`;
}

module.exports = router;
