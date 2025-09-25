const mongoose = require("mongoose");

const typingTextSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "텍스트 제목은 필수입니다."],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "텍스트 내용은 필수입니다."],
    minlength: [50, "텍스트는 최소 50자 이상이어야 합니다."],
    maxlength: [2000, "텍스트는 최대 2000자까지 가능합니다."],
  },
  metadata: {
    category: {
      type: String,
      enum: [
        "기술",
        "문학",
        "뉴스",
        "일반",
        "교육",
        "비즈니스",
        "과학",
        "역사",
        "예술",
      ],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      required: true,
    },
    language: {
      type: String,
      default: "ko",
    },
    estimatedWPM: {
      type: Number,
      min: 20,
      max: 120,
    },
    characterCount: {
      type: Number,
      required: true,
    },
    wordCount: {
      type: Number,
      required: true,
    },
  },
  statistics: {
    timesUsed: {
      type: Number,
      default: 0,
    },
    averageWPM: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  features: {
    hasNumbers: {
      type: Boolean,
      default: false,
    },
    hasPunctuation: {
      type: Boolean,
      default: false,
    },
    hasSpecialChars: {
      type: Boolean,
      default: false,
    },
    hasUppercase: {
      type: Boolean,
      default: false,
    },
  },
  source: {
    type: {
      type: String,
      enum: ["user_generated", "ai_generated", "imported", "curated"],
      default: "curated",
    },
    author: String,
    url: String,
    aiModel: String,
    prompt: String,
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 인덱스 설정
typingTextSchema.index({ "metadata.category": 1, "metadata.difficulty": 1 });
typingTextSchema.index({ "statistics.rating": -1 });
typingTextSchema.index({ tags: 1 });
typingTextSchema.index({ isActive: 1, isPublic: 1 });

// 자동 메타데이터 계산
typingTextSchema.pre("save", function (next) {
  // 글자 수와 단어 수 자동 계산
  this.metadata.characterCount = this.content.length;
  this.metadata.wordCount = this.content.trim().split(/\s+/).length;

  // 텍스트 특성 분석
  this.features.hasNumbers = /\d/.test(this.content);
  this.features.hasPunctuation = /[.,!?;:]/.test(this.content);
  this.features.hasSpecialChars = /[^\w\s.,!?;:ㄱ-ㅣ가-힣]/.test(this.content);
  this.features.hasUppercase = /[A-Z]/.test(this.content);

  // 업데이트 시간 갱신
  this.updatedAt = Date.now();

  next();
});

// 난이도 자동 계산 메서드
typingTextSchema.methods.calculateDifficulty = function () {
  let score = 0;

  // 문장 길이 기반
  if (this.metadata.wordCount > 100) score += 2;
  else if (this.metadata.wordCount > 50) score += 1;

  // 특수 문자 기반
  if (this.features.hasSpecialChars) score += 2;
  if (this.features.hasPunctuation) score += 1;
  if (this.features.hasNumbers) score += 1;
  if (this.features.hasUppercase) score += 1;

  // 복잡한 단어 비율
  const complexWords = this.content
    .split(/\s+/)
    .filter((word) => word.length > 7).length;
  const complexRatio = complexWords / this.metadata.wordCount;
  if (complexRatio > 0.3) score += 2;
  else if (complexRatio > 0.15) score += 1;

  // 점수에 따른 난이도 결정
  if (score <= 2) return "beginner";
  if (score <= 4) return "intermediate";
  if (score <= 6) return "advanced";
  return "expert";
};

// 통계 업데이트 메서드
typingTextSchema.methods.updateStatistics = function (testResult) {
  this.statistics.timesUsed += 1;

  // 평균 WPM 계산
  const totalWPM =
    this.statistics.averageWPM * (this.statistics.timesUsed - 1) +
    testResult.wpm;
  this.statistics.averageWPM = Math.round(totalWPM / this.statistics.timesUsed);

  // 평균 정확도 계산
  const totalAccuracy =
    this.statistics.averageAccuracy * (this.statistics.timesUsed - 1) +
    testResult.accuracy;
  this.statistics.averageAccuracy = Math.round(
    totalAccuracy / this.statistics.timesUsed
  );
};

// 유사한 텍스트 찾기
typingTextSchema.statics.findSimilar = function (textId, limit = 5) {
  return this.aggregate([
    { $match: { _id: { $ne: textId }, isActive: true, isPublic: true } },
    { $sample: { size: limit } },
  ]);
};

// 난이도별 텍스트 찾기
typingTextSchema.statics.findByDifficulty = function (difficulty, limit = 10) {
  return this.find({
    "metadata.difficulty": difficulty,
    isActive: true,
    isPublic: true,
  })
    .sort({ "statistics.rating": -1, "statistics.timesUsed": -1 })
    .limit(limit);
};

// 인기 텍스트 찾기
typingTextSchema.statics.findPopular = function (limit = 10) {
  return this.find({ isActive: true, isPublic: true })
    .sort({ "statistics.timesUsed": -1, "statistics.rating": -1 })
    .limit(limit);
};

module.exports = mongoose.model("TypingText", typingTextSchema);
