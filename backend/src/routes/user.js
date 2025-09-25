const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const TypingTest = require("../models/TypingTest");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// 사용자 프로필 조회
router.get("/profile", authenticate, async (req, res) => {
  try {
    res.json({
      message: "사용자 프로필을 조회했습니다.",
      user: req.user,
    });
  } catch (error) {
    console.error("프로필 조회 오류:", error);
    res.status(500).json({
      error: "프로필 조회 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 사용자 프로필 업데이트
router.put(
  "/profile",
  authenticate,
  [
    body("profile.firstName")
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage("이름은 1-20자 사이여야 합니다."),
    body("profile.lastName")
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage("성은 1-20자 사이여야 합니다."),
    body("profile.level")
      .optional()
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("유효하지 않은 레벨입니다."),
    body("profile.goal.targetWPM")
      .optional()
      .isInt({ min: 20, max: 120 })
      .withMessage("목표 WPM은 20-120 사이의 값이어야 합니다."),
    body("profile.goal.targetAccuracy")
      .optional()
      .isInt({ min: 80, max: 100 })
      .withMessage("목표 정확도는 80-100 사이의 값이어야 합니다."),
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

      const { profile, preferences } = req.body;

      const user = await User.findById(req.user._id);

      // 프로필 업데이트
      if (profile) {
        if (profile.firstName !== undefined)
          user.profile.firstName = profile.firstName;
        if (profile.lastName !== undefined)
          user.profile.lastName = profile.lastName;
        if (profile.level !== undefined) user.profile.level = profile.level;
        if (profile.avatar !== undefined) user.profile.avatar = profile.avatar;

        if (profile.goal) {
          if (profile.goal.targetWPM !== undefined)
            user.profile.goal.targetWPM = profile.goal.targetWPM;
          if (profile.goal.targetAccuracy !== undefined)
            user.profile.goal.targetAccuracy = profile.goal.targetAccuracy;
        }
      }

      // 환경설정 업데이트
      if (preferences) {
        if (preferences.theme !== undefined)
          user.preferences.theme = preferences.theme;
        if (preferences.language !== undefined)
          user.preferences.language = preferences.language;

        if (preferences.notifications) {
          if (preferences.notifications.email !== undefined) {
            user.preferences.notifications.email =
              preferences.notifications.email;
          }
          if (preferences.notifications.reminders !== undefined) {
            user.preferences.notifications.reminders =
              preferences.notifications.reminders;
          }
        }

        if (preferences.typingSettings) {
          if (preferences.typingSettings.showKeyboard !== undefined) {
            user.preferences.typingSettings.showKeyboard =
              preferences.typingSettings.showKeyboard;
          }
          if (preferences.typingSettings.playSounds !== undefined) {
            user.preferences.typingSettings.playSounds =
              preferences.typingSettings.playSounds;
          }
          if (preferences.typingSettings.highlightErrors !== undefined) {
            user.preferences.typingSettings.highlightErrors =
              preferences.typingSettings.highlightErrors;
          }
        }
      }

      await user.save();

      res.json({
        message: "프로필이 성공적으로 업데이트되었습니다.",
        user,
      });
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      res.status(500).json({
        error: "프로필 업데이트 중 오류가 발생했습니다.",
        message: "잠시 후 다시 시도해주세요.",
      });
    }
  }
);

// 사용자 통계 조회
router.get("/statistics", authenticate, async (req, res) => {
  try {
    const { period = "all" } = req.query;

    // 기본 통계
    const baseStats = {
      total: req.user.statistics,
      profile: {
        level: req.user.profile.level,
        goals: req.user.profile.goal,
      },
    };

    // 기간별 상세 통계 계산
    let startDate = new Date(0); // 전체 기간
    const now = new Date();

    switch (period) {
      case "week":
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodTests = await TypingTest.find({
      userId: req.user._id,
      isCompleted: true,
      createdAt: { $gte: startDate, $lte: now },
    }).sort({ createdAt: 1 });

    const periodStats = this.calculatePeriodStatistics(periodTests);
    const progressData = this.calculateProgressData(periodTests);
    const weaknessAnalysis = this.analyzeWeaknesses(periodTests);

    res.json({
      message: "사용자 통계를 조회했습니다.",
      statistics: {
        base: baseStats,
        period: {
          range: period,
          startDate,
          endDate: now,
          stats: periodStats,
          progress: progressData,
          analysis: weaknessAnalysis,
        },
      },
    });
  } catch (error) {
    console.error("통계 조회 오류:", error);
    res.status(500).json({
      error: "통계 조회 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 레벨업 확인 및 처리
router.post("/check-levelup", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const currentLevel = user.profile.level;
    const stats = user.statistics;

    let newLevel = currentLevel;
    let leveledUp = false;
    let requirements = {};

    // 레벨업 조건 확인
    switch (currentLevel) {
      case "beginner":
        requirements = { wpm: 30, accuracy: 85, tests: 10 };
        if (
          stats.averageWPM >= 30 &&
          stats.averageAccuracy >= 85 &&
          stats.totalTests >= 10
        ) {
          newLevel = "intermediate";
          leveledUp = true;
        }
        break;
      case "intermediate":
        requirements = { wpm: 50, accuracy: 90, tests: 25 };
        if (
          stats.averageWPM >= 50 &&
          stats.averageAccuracy >= 90 &&
          stats.totalTests >= 25
        ) {
          newLevel = "advanced";
          leveledUp = true;
        }
        break;
      case "advanced":
        requirements = { wpm: 70, accuracy: 95, tests: 50 };
        if (
          stats.averageWPM >= 70 &&
          stats.averageAccuracy >= 95 &&
          stats.totalTests >= 50
        ) {
          newLevel = "expert";
          leveledUp = true;
        }
        break;
      case "expert":
        requirements = { wpm: 90, accuracy: 98, tests: 100 };
        // Expert는 최고 레벨이므로 레벨업 없음
        break;
    }

    if (leveledUp) {
      user.profile.level = newLevel;
      await user.save();
    }

    // 다음 레벨 요구사항 계산
    let nextLevelRequirements = null;
    switch (newLevel) {
      case "beginner":
        nextLevelRequirements = { wpm: 30, accuracy: 85, tests: 10 };
        break;
      case "intermediate":
        nextLevelRequirements = { wpm: 50, accuracy: 90, tests: 25 };
        break;
      case "advanced":
        nextLevelRequirements = { wpm: 70, accuracy: 95, tests: 50 };
        break;
      case "expert":
        nextLevelRequirements = { wpm: 90, accuracy: 98, tests: 100 };
        break;
    }

    res.json({
      message: leveledUp
        ? "축하합니다! 레벨업하셨습니다!"
        : "레벨업 조건을 확인했습니다.",
      leveledUp,
      oldLevel: currentLevel,
      newLevel,
      currentStats: {
        wpm: stats.averageWPM,
        accuracy: stats.averageAccuracy,
        tests: stats.totalTests,
      },
      requirements: nextLevelRequirements,
      progress: nextLevelRequirements
        ? {
            wpm: Math.min(
              100,
              (stats.averageWPM / nextLevelRequirements.wpm) * 100
            ),
            accuracy: Math.min(
              100,
              (stats.averageAccuracy / nextLevelRequirements.accuracy) * 100
            ),
            tests: Math.min(
              100,
              (stats.totalTests / nextLevelRequirements.tests) * 100
            ),
          }
        : null,
    });
  } catch (error) {
    console.error("레벨업 확인 오류:", error);
    res.status(500).json({
      error: "레벨업 확인 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 도전과제 조회
router.get("/achievements", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const stats = user.statistics;

    const achievements = [
      {
        id: "first_test",
        title: "첫 걸음",
        description: "첫 번째 타이핑 테스트 완료",
        completed: stats.totalTests >= 1,
        progress: Math.min(100, (stats.totalTests / 1) * 100),
      },
      {
        id: "speed_demon",
        title: "속도광",
        description: "WPM 60 달성",
        completed: stats.bestWPM >= 60,
        progress: Math.min(100, (stats.bestWPM / 60) * 100),
      },
      {
        id: "accuracy_master",
        title: "정확도 마스터",
        description: "정확도 98% 달성",
        completed: stats.bestAccuracy >= 98,
        progress: Math.min(100, (stats.bestAccuracy / 98) * 100),
      },
      {
        id: "consistent_learner",
        title: "꾸준한 학습자",
        description: "7일 연속 연습",
        completed: stats.streak.longest >= 7,
        progress: Math.min(100, (stats.streak.longest / 7) * 100),
      },
      {
        id: "marathon_runner",
        title: "마라토너",
        description: "총 1000분 연습",
        completed: stats.totalTimeSpent >= 60000, // 1000분 = 60000초
        progress: Math.min(100, (stats.totalTimeSpent / 60000) * 100),
      },
      {
        id: "test_master",
        title: "테스트 마스터",
        description: "100회 테스트 완료",
        completed: stats.totalTests >= 100,
        progress: Math.min(100, (stats.totalTests / 100) * 100),
      },
    ];

    const completedCount = achievements.filter((a) => a.completed).length;
    const totalCount = achievements.length;

    res.json({
      message: "도전과제를 조회했습니다.",
      achievements,
      summary: {
        completed: completedCount,
        total: totalCount,
        percentage: Math.round((completedCount / totalCount) * 100),
      },
    });
  } catch (error) {
    console.error("도전과제 조회 오류:", error);
    res.status(500).json({
      error: "도전과제 조회 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 사용자 순위 조회
router.get("/leaderboard", authenticate, async (req, res) => {
  try {
    const { category = "wpm", period = "all", limit = 10 } = req.query;

    let sortField;
    switch (category) {
      case "wpm":
        sortField = "statistics.bestWPM";
        break;
      case "accuracy":
        sortField = "statistics.bestAccuracy";
        break;
      case "tests":
        sortField = "statistics.totalTests";
        break;
      case "time":
        sortField = "statistics.totalTimeSpent";
        break;
      default:
        sortField = "statistics.bestWPM";
    }

    const leaderboard = await User.find({ isActive: true })
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .select("username profile.level statistics createdAt");

    // 현재 사용자 순위 찾기
    const userRank =
      (await User.countDocuments({
        isActive: true,
        [sortField]: {
          $gt: req.user.statistics[
            category === "wpm"
              ? "bestWPM"
              : category === "accuracy"
              ? "bestAccuracy"
              : category === "tests"
              ? "totalTests"
              : "totalTimeSpent"
          ],
        },
      })) + 1;

    res.json({
      message: "순위표를 조회했습니다.",
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        level: user.profile.level,
        value:
          user.statistics[
            category === "wpm"
              ? "bestWPM"
              : category === "accuracy"
              ? "bestAccuracy"
              : category === "tests"
              ? "totalTests"
              : "totalTimeSpent"
          ],
        joinDate: user.createdAt,
      })),
      userRank,
      category,
      period,
    });
  } catch (error) {
    console.error("순위 조회 오류:", error);
    res.status(500).json({
      error: "순위 조회 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 유틸리티 함수들
function calculatePeriodStatistics(tests) {
  if (tests.length === 0) {
    return {
      totalTests: 0,
      averageWPM: 0,
      averageAccuracy: 0,
      bestWPM: 0,
      bestAccuracy: 0,
      totalTime: 0,
      improvement: { wpm: 0, accuracy: 0 },
    };
  }

  const totalTests = tests.length;
  const averageWPM = Math.round(
    tests.reduce((sum, test) => sum + test.results.wpm, 0) / totalTests
  );
  const averageAccuracy = Math.round(
    tests.reduce((sum, test) => sum + test.results.accuracy, 0) / totalTests
  );
  const bestWPM = Math.max(...tests.map((test) => test.results.wpm));
  const bestAccuracy = Math.max(...tests.map((test) => test.results.accuracy));
  const totalTime = tests.reduce(
    (sum, test) => sum + test.results.timeElapsed,
    0
  );

  // 개선도 계산 (첫 번째 절반 vs 두 번째 절반)
  let improvement = { wpm: 0, accuracy: 0 };
  if (tests.length >= 4) {
    const firstHalf = tests.slice(0, Math.floor(tests.length / 2));
    const secondHalf = tests.slice(Math.floor(tests.length / 2));

    const firstHalfWPM =
      firstHalf.reduce((sum, test) => sum + test.results.wpm, 0) /
      firstHalf.length;
    const secondHalfWPM =
      secondHalf.reduce((sum, test) => sum + test.results.wpm, 0) /
      secondHalf.length;

    const firstHalfAccuracy =
      firstHalf.reduce((sum, test) => sum + test.results.accuracy, 0) /
      firstHalf.length;
    const secondHalfAccuracy =
      secondHalf.reduce((sum, test) => sum + test.results.accuracy, 0) /
      secondHalf.length;

    improvement = {
      wpm: Math.round(secondHalfWPM - firstHalfWPM),
      accuracy: Math.round(secondHalfAccuracy - firstHalfAccuracy),
    };
  }

  return {
    totalTests,
    averageWPM,
    averageAccuracy,
    bestWPM,
    bestAccuracy,
    totalTime,
    improvement,
  };
}

function calculateProgressData(tests) {
  if (tests.length === 0) return [];

  // 일별 진행 상황 계산
  const dailyData = {};
  tests.forEach((test) => {
    const date = test.createdAt.toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = { tests: [], wpm: 0, accuracy: 0 };
    }
    dailyData[date].tests.push(test);
  });

  return Object.keys(dailyData)
    .map((date) => {
      const dayTests = dailyData[date].tests;
      return {
        date,
        wpm: Math.round(
          dayTests.reduce((sum, test) => sum + test.results.wpm, 0) /
            dayTests.length
        ),
        accuracy: Math.round(
          dayTests.reduce((sum, test) => sum + test.results.accuracy, 0) /
            dayTests.length
        ),
        tests: dayTests.length,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function analyzeWeaknesses(tests) {
  if (tests.length === 0) return {};

  const analysis = {
    consistencyIssues: false,
    speedIssues: false,
    accuracyIssues: false,
    recommendations: [],
  };

  const avgWPM =
    tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;
  const avgAccuracy =
    tests.reduce((sum, test) => sum + test.results.accuracy, 0) / tests.length;

  // WPM 변동성 확인
  const wpmVariance =
    tests.reduce((sum, test) => Math.pow(test.results.wpm - avgWPM, 2), 0) /
    tests.length;
  if (Math.sqrt(wpmVariance) > avgWPM * 0.3) {
    analysis.consistencyIssues = true;
    analysis.recommendations.push(
      "타이핑 속도의 일관성을 높이는 연습이 필요합니다."
    );
  }

  if (avgWPM < 40) {
    analysis.speedIssues = true;
    analysis.recommendations.push(
      "기본적인 타이핑 속도 향상 연습이 필요합니다."
    );
  }

  if (avgAccuracy < 90) {
    analysis.accuracyIssues = true;
    analysis.recommendations.push(
      "정확도 향상을 위한 집중적인 연습이 필요합니다."
    );
  }

  return analysis;
}

module.exports = router;
