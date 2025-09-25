const mongoose = require("mongoose");

const typingTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "사용자 ID는 필수입니다."],
  },
  textId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TypingText",
  },
  textContent: {
    type: String,
    required: [true, "타이핑 텍스트는 필수입니다."],
  },
  userInput: {
    type: String,
    required: [true, "사용자 입력은 필수입니다."],
  },
  results: {
    wpm: {
      type: Number,
      required: [true, "WPM은 필수입니다."],
      min: 0,
    },
    accuracy: {
      type: Number,
      required: [true, "정확도는 필수입니다."],
      min: 0,
      max: 100,
    },
    errors: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeElapsed: {
      type: Number,
      required: [true, "소요 시간은 필수입니다."],
      min: 0,
    },
    charactersTyped: {
      type: Number,
      default: 0,
      min: 0,
    },
    wordsTyped: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  analysis: {
    typingPattern: {
      averageKeyInterval: Number, // 평균 키 입력 간격 (ms)
      keySpeedVariation: Number, // 키 속도 변화율
      pauseCount: Number, // 일시정지 횟수
      backspaceCount: Number, // 백스페이스 사용 횟수
    },
    errorAnalysis: {
      mostMissedCharacters: [String],
      errorPositions: [Number],
      commonMistakes: [
        {
          from: String,
          to: String,
          count: Number,
        },
      ],
    },
    difficulty: {
      textComplexity: {
        type: String,
        enum: ["easy", "medium", "hard", "expert"],
      },
      recommendedLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
      },
    },
  },
  aiInsights: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    improvementAreas: [String],
    nextGoals: [
      {
        type: String,
        target: Number,
        timeframe: String,
      },
    ],
  },
  keystrokeData: [
    {
      key: String,
      timestamp: Number,
      correct: Boolean,
      timeSinceLastKey: Number,
    },
  ],
  testMode: {
    type: String,
    enum: ["practice", "test", "challenge"],
    default: "practice",
  },
  tags: [String],
  isCompleted: {
    type: Boolean,
    default: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 인덱스 설정
typingTestSchema.index({ userId: 1, createdAt: -1 });
typingTestSchema.index({ "results.wpm": -1 });
typingTestSchema.index({ "results.accuracy": -1 });
typingTestSchema.index({ testMode: 1 });

// WPM 계산 메서드
typingTestSchema.methods.calculateWPM = function () {
  const words = this.userInput.trim().split(/\s+/).length;
  const minutes = this.results.timeElapsed / 60;
  return Math.round(words / minutes);
};

// 정확도 계산 메서드
typingTestSchema.methods.calculateAccuracy = function () {
  let correctChars = 0;
  const minLength = Math.min(this.userInput.length, this.textContent.length);

  for (let i = 0; i < minLength; i++) {
    if (this.userInput[i] === this.textContent[i]) {
      correctChars++;
    }
  }

  return Math.round((correctChars / this.textContent.length) * 100);
};

// 에러 분석 메서드
typingTestSchema.methods.analyzeErrors = function () {
  const errors = [];
  const minLength = Math.min(this.userInput.length, this.textContent.length);

  for (let i = 0; i < minLength; i++) {
    if (this.userInput[i] !== this.textContent[i]) {
      errors.push({
        position: i,
        expected: this.textContent[i],
        actual: this.userInput[i],
      });
    }
  }

  return errors;
};

// 타이핑 패턴 분석
typingTestSchema.methods.analyzeTypingPattern = function () {
  if (!this.keystrokeData || this.keystrokeData.length === 0) {
    return null;
  }

  const intervals = this.keystrokeData
    .slice(1)
    .map((stroke) => stroke.timeSinceLastKey)
    .filter((interval) => interval > 0);

  const averageInterval =
    intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  const variance =
    intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - averageInterval, 2);
    }, 0) / intervals.length;

  const speedVariation = Math.sqrt(variance) / averageInterval;

  return {
    averageKeyInterval: Math.round(averageInterval),
    keySpeedVariation: Math.round(speedVariation * 100) / 100,
    pauseCount: intervals.filter((interval) => interval > 1000).length,
    backspaceCount: this.keystrokeData.filter(
      (stroke) => stroke.key === "Backspace"
    ).length,
  };
};

// 개선 추천 생성
typingTestSchema.methods.generateRecommendations = function () {
  const recommendations = [];

  if (this.results.accuracy < 90) {
    recommendations.push("정확도 향상을 위해 속도보다는 정확성에 집중하세요.");
  }

  if (this.results.wpm < 30) {
    recommendations.push("기본 자판 연습을 통해 타이핑 속도를 높이세요.");
  }

  if (
    this.analysis.typingPattern &&
    this.analysis.typingPattern.backspaceCount > this.textContent.length * 0.1
  ) {
    recommendations.push(
      "백스페이스 사용을 줄이고 천천히 정확하게 타이핑하세요."
    );
  }

  return recommendations;
};

module.exports = mongoose.model("TypingTest", typingTestSchema);
