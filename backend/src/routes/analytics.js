const express = require("express");
const { body, validationResult } = require("express-validator");
const TypingTest = require("../models/TypingTest");
const TypingText = require("../models/TypingText");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// 대시보드 종합 분석
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const { period = "month" } = req.query;

    // 기간 계산
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

    // 병렬로 모든 데이터 조회
    const [
      recentTests,
      userStats,
      progressData,
      performanceTrends,
      weaknessAnalysis,
      goalProgress,
    ] = await Promise.all([
      // 최근 테스트들
      TypingTest.find({
        userId: req.user._id,
        isCompleted: true,
        createdAt: { $gte: startDate, $lte: now },
      })
        .sort({ createdAt: -1 })
        .limit(20),

      // 사용자 통계
      User.findById(req.user._id).select("statistics profile"),

      // 진행 데이터
      this.getProgressData(req.user._id, startDate, now),

      // 성능 트렌드
      this.getPerformanceTrends(req.user._id, startDate, now),

      // 약점 분석
      this.getWeaknessAnalysis(req.user._id, startDate, now),

      // 목표 진행률
      this.getGoalProgress(req.user._id),
    ]);

    const dashboard = {
      period: {
        start: startDate,
        end: now,
        label: period,
      },
      summary: {
        totalTests: recentTests.length,
        averageWPM:
          recentTests.length > 0
            ? Math.round(
                recentTests.reduce((sum, test) => sum + test.results.wpm, 0) /
                  recentTests.length
              )
            : 0,
        averageAccuracy:
          recentTests.length > 0
            ? Math.round(
                recentTests.reduce(
                  (sum, test) => sum + test.results.accuracy,
                  0
                ) / recentTests.length
              )
            : 0,
        totalTime: recentTests.reduce(
          (sum, test) => sum + test.results.timeElapsed,
          0
        ),
        bestWPM:
          recentTests.length > 0
            ? Math.max(...recentTests.map((test) => test.results.wpm))
            : 0,
        bestAccuracy:
          recentTests.length > 0
            ? Math.max(...recentTests.map((test) => test.results.accuracy))
            : 0,
      },
      progress: progressData,
      trends: performanceTrends,
      weaknesses: weaknessAnalysis,
      goals: goalProgress,
      recentTests: recentTests.slice(0, 5).map((test) => ({
        _id: test._id,
        wpm: test.results.wpm,
        accuracy: test.results.accuracy,
        timeElapsed: test.results.timeElapsed,
        createdAt: test.createdAt,
        testMode: test.testMode,
      })),
    };

    res.json({
      message: "대시보드 데이터를 조회했습니다.",
      dashboard,
    });
  } catch (error) {
    console.error("대시보드 조회 오류:", error);
    res.status(500).json({
      error: "대시보드 데이터 조회 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 상세 성능 분석
router.get("/performance", authenticate, async (req, res) => {
  try {
    const {
      period = "month",
      category = "all",
      granularity = "daily",
    } = req.query;

    // 기간 계산
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

    const filter = {
      userId: req.user._id,
      isCompleted: true,
      createdAt: { $gte: startDate, $lte: now },
    };

    if (category !== "all") {
      filter.testMode = category;
    }

    const tests = await TypingTest.find(filter).sort({ createdAt: 1 });

    // 세분화된 분석
    const analysis = {
      timeSeries: this.createTimeSeries(tests, granularity),
      distributionAnalysis: this.analyzeDistribution(tests),
      correlationAnalysis: this.analyzeCorrelations(tests),
      improvementMetrics: this.calculateImprovementMetrics(tests),
      consistencyMetrics: this.calculateConsistencyMetrics(tests),
      difficultyAnalysis: this.analyzeDifficultyImpact(tests),
      errorPatterns: this.analyzeErrorPatterns(tests),
    };

    res.json({
      message: "상세 성능 분석을 완료했습니다.",
      period: { start: startDate, end: now, label: period },
      category,
      granularity,
      analysis,
      metadata: {
        totalTests: tests.length,
        averageTestsPerDay:
          tests.length /
          Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))),
      },
    });
  } catch (error) {
    console.error("성능 분석 오류:", error);
    res.status(500).json({
      error: "성능 분석 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 학습 패턴 분석
router.get("/learning-patterns", authenticate, async (req, res) => {
  try {
    const tests = await TypingTest.find({
      userId: req.user._id,
      isCompleted: true,
    }).sort({ createdAt: 1 });

    if (tests.length < 5) {
      return res.status(400).json({
        error: "분석에 필요한 데이터가 부족합니다.",
        message: "최소 5회 이상의 테스트 기록이 필요합니다.",
      });
    }

    const patterns = {
      practiceFrequency: this.analyzePracticeFrequency(tests),
      optimalTime: this.findOptimalPracticeTime(tests),
      sessionLength: this.analyzeSessionLength(tests),
      difficultyProgression: this.analyzeDifficultyProgression(tests),
      learningVelocity: this.calculateLearningVelocity(tests),
      plateauDetection: this.detectPlateaus(tests),
      motivationFactors: this.analyzeMotivationFactors(tests),
      recommendations: this.generateLearningRecommendations(tests),
    };

    res.json({
      message: "학습 패턴 분석을 완료했습니다.",
      patterns,
      insights: this.generateLearningInsights(patterns),
    });
  } catch (error) {
    console.error("학습 패턴 분석 오류:", error);
    res.status(500).json({
      error: "학습 패턴 분석 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 예측 분석
router.get("/predictions", authenticate, async (req, res) => {
  try {
    const { targetWPM, targetAccuracy, timeframe = 30 } = req.query;

    const tests = await TypingTest.find({
      userId: req.user._id,
      isCompleted: true,
    }).sort({ createdAt: 1 });

    if (tests.length < 10) {
      return res.status(400).json({
        error: "예측에 필요한 데이터가 부족합니다.",
        message: "최소 10회 이상의 테스트 기록이 필요합니다.",
      });
    }

    const predictions = {
      wpmProgression: this.predictWPMProgression(tests, parseInt(timeframe)),
      accuracyProgression: this.predictAccuracyProgression(
        tests,
        parseInt(timeframe)
      ),
      goalAchievement: this.predictGoalAchievement(tests, {
        wpm: parseInt(targetWPM),
        accuracy: parseInt(targetAccuracy),
        timeframe: parseInt(timeframe),
      }),
      improvementRate: this.calculateImprovementRate(tests),
      confidenceInterval: this.calculateConfidenceInterval(tests),
      requiredPractice: this.estimateRequiredPractice(tests, {
        wpm: parseInt(targetWPM),
        accuracy: parseInt(targetAccuracy),
      }),
    };

    res.json({
      message: "예측 분석을 완료했습니다.",
      predictions,
      assumptions: {
        basedOnTests: tests.length,
        timeframe: `${timeframe}일`,
        currentPerformance: {
          wpm: tests[tests.length - 1].results.wpm,
          accuracy: tests[tests.length - 1].results.accuracy,
        },
      },
    });
  } catch (error) {
    console.error("예측 분석 오류:", error);
    res.status(500).json({
      error: "예측 분석 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 비교 분석
router.get("/compare", authenticate, async (req, res) => {
  try {
    const {
      compareWith = "users", // 'users', 'self', 'level'
      period = "month",
      metric = "wpm",
    } = req.query;

    const userTests = await TypingTest.find({
      userId: req.user._id,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    let comparison = {};

    switch (compareWith) {
      case "users":
        comparison = await this.compareWithUsers(req.user, userTests, metric);
        break;
      case "self":
        comparison = await this.compareWithSelf(userTests, period, metric);
        break;
      case "level":
        comparison = await this.compareWithLevel(
          req.user.profile.level,
          userTests,
          metric
        );
        break;
    }

    res.json({
      message: "비교 분석을 완료했습니다.",
      comparison,
      metadata: {
        compareWith,
        period,
        metric,
        userLevel: req.user.profile.level,
        testsAnalyzed: userTests.length,
      },
    });
  } catch (error) {
    console.error("비교 분석 오류:", error);
    res.status(500).json({
      error: "비교 분석 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 맞춤형 추천
router.get("/recommendations", authenticate, async (req, res) => {
  try {
    const userTests = await TypingTest.find({
      userId: req.user._id,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const user = await User.findById(req.user._id);

    const recommendations = {
      practiceSchedule: this.recommendPracticeSchedule(userTests, user),
      difficultyLevel: this.recommendDifficultyLevel(userTests, user),
      focusAreas: this.recommendFocusAreas(userTests),
      textTypes: this.recommendTextTypes(userTests),
      sessionDuration: this.recommendSessionDuration(userTests),
      goals: this.recommendGoals(userTests, user),
      techniques: this.recommendTechniques(userTests),
    };

    res.json({
      message: "맞춤형 추천을 생성했습니다.",
      recommendations,
      basedOn: {
        testsAnalyzed: userTests.length,
        userLevel: user.profile.level,
        currentStats: user.statistics,
      },
    });
  } catch (error) {
    console.error("추천 생성 오류:", error);
    res.status(500).json({
      error: "추천 생성 중 오류가 발생했습니다.",
      message: "잠시 후 다시 시도해주세요.",
    });
  }
});

// 유틸리티 함수들 (일부만 구현, 실제로는 모든 함수를 구현해야 함)
async function getProgressData(userId, startDate, endDate) {
  const tests = await TypingTest.find({
    userId,
    isCompleted: true,
    createdAt: { $gte: startDate, $lte: endDate },
  }).sort({ createdAt: 1 });

  const dailyData = {};
  tests.forEach((test) => {
    const date = test.createdAt.toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = { wpm: [], accuracy: [], count: 0 };
    }
    dailyData[date].wpm.push(test.results.wpm);
    dailyData[date].accuracy.push(test.results.accuracy);
    dailyData[date].count++;
  });

  return Object.keys(dailyData)
    .map((date) => ({
      date,
      wpm: Math.round(
        dailyData[date].wpm.reduce((a, b) => a + b, 0) /
          dailyData[date].wpm.length
      ),
      accuracy: Math.round(
        dailyData[date].accuracy.reduce((a, b) => a + b, 0) /
          dailyData[date].accuracy.length
      ),
      tests: dailyData[date].count,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function getPerformanceTrends(userId, startDate, endDate) {
  const tests = await TypingTest.find({
    userId,
    isCompleted: true,
    createdAt: { $gte: startDate, $lte: endDate },
  }).sort({ createdAt: 1 });

  if (tests.length < 2) return { wpm: 0, accuracy: 0 };

  const firstQuarter = tests.slice(0, Math.floor(tests.length / 4)) || [
    tests[0],
  ];
  const lastQuarter = tests.slice(-Math.floor(tests.length / 4)) || [
    tests[tests.length - 1],
  ];

  const firstAvgWPM =
    firstQuarter.reduce((sum, test) => sum + test.results.wpm, 0) /
    firstQuarter.length;
  const lastAvgWPM =
    lastQuarter.reduce((sum, test) => sum + test.results.wpm, 0) /
    lastQuarter.length;

  const firstAvgAccuracy =
    firstQuarter.reduce((sum, test) => sum + test.results.accuracy, 0) /
    firstQuarter.length;
  const lastAvgAccuracy =
    lastQuarter.reduce((sum, test) => sum + test.results.accuracy, 0) /
    lastQuarter.length;

  return {
    wpm: Math.round(lastAvgWPM - firstAvgWPM),
    accuracy: Math.round(lastAvgAccuracy - firstAvgAccuracy),
    trend:
      lastAvgWPM > firstAvgWPM
        ? "improving"
        : lastAvgWPM < firstAvgWPM
        ? "declining"
        : "stable",
  };
}

async function getWeaknessAnalysis(userId, startDate, endDate) {
  const tests = await TypingTest.find({
    userId,
    isCompleted: true,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const analysis = {
    lowAccuracyTests: tests.filter((test) => test.results.accuracy < 90).length,
    slowSpeedTests: tests.filter((test) => test.results.wpm < 30).length,
    inconsistentPerformance: false,
    commonErrors: [],
  };

  // 성능 일관성 확인
  if (tests.length > 5) {
    const wpmStdDev = this.calculateStandardDeviation(
      tests.map((t) => t.results.wpm)
    );
    const avgWPM =
      tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;
    analysis.inconsistentPerformance = wpmStdDev / avgWPM > 0.3;
  }

  return analysis;
}

async function getGoalProgress(userId) {
  const user = await User.findById(userId);
  const stats = user.statistics;
  const goals = user.profile.goal;

  return {
    wpm: {
      current: stats.averageWPM,
      target: goals.targetWPM,
      progress: Math.min(100, (stats.averageWPM / goals.targetWPM) * 100),
    },
    accuracy: {
      current: stats.averageAccuracy,
      target: goals.targetAccuracy,
      progress: Math.min(
        100,
        (stats.averageAccuracy / goals.targetAccuracy) * 100
      ),
    },
  };
}

function calculateStandardDeviation(values) {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  return Math.sqrt(avgSquaredDiff);
}

module.exports = router;
