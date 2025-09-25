const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "사용자명은 필수입니다."],
    unique: true,
    trim: true,
    minlength: [3, "사용자명은 최소 3자 이상이어야 합니다."],
    maxlength: [20, "사용자명은 최대 20자까지 가능합니다."],
  },
  email: {
    type: String,
    required: [true, "이메일은 필수입니다."],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "유효한 이메일 주소를 입력해주세요.",
    ],
  },
  password: {
    type: String,
    required: [true, "비밀번호는 필수입니다."],
    minlength: [6, "비밀번호는 최소 6자 이상이어야 합니다."],
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
    goal: {
      targetWPM: {
        type: Number,
        default: 40,
      },
      targetAccuracy: {
        type: Number,
        default: 95,
      },
    },
  },
  statistics: {
    totalTests: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0, // 초 단위
    },
    bestWPM: {
      type: Number,
      default: 0,
    },
    bestAccuracy: {
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
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastTestDate: Date,
    },
  },
  preferences: {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: {
      type: String,
      default: "ko",
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      reminders: {
        type: Boolean,
        default: true,
      },
    },
    typingSettings: {
      showKeyboard: {
        type: Boolean,
        default: true,
      },
      playSounds: {
        type: Boolean,
        default: false,
      },
      highlightErrors: {
        type: Boolean,
        default: true,
      },
    },
  },
  subscriptionPlan: {
    type: String,
    enum: ["free", "premium", "enterprise"],
    default: "free",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 비밀번호 해싱 미들웨어
userSchema.pre("save", async function (next) {
  // 비밀번호가 수정되지 않았다면 다음으로
  if (!this.isModified("password")) return next();

  try {
    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 업데이트 시간 자동 갱신
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 사용자 통계 업데이트 메서드
userSchema.methods.updateStatistics = function (testResult) {
  this.statistics.totalTests += 1;
  this.statistics.totalTimeSpent += testResult.timeElapsed;

  if (testResult.wpm > this.statistics.bestWPM) {
    this.statistics.bestWPM = testResult.wpm;
  }

  if (testResult.accuracy > this.statistics.bestAccuracy) {
    this.statistics.bestAccuracy = testResult.accuracy;
  }

  // 평균 계산
  this.statistics.averageWPM = Math.round(
    (this.statistics.averageWPM * (this.statistics.totalTests - 1) +
      testResult.wpm) /
      this.statistics.totalTests
  );

  this.statistics.averageAccuracy = Math.round(
    (this.statistics.averageAccuracy * (this.statistics.totalTests - 1) +
      testResult.accuracy) /
      this.statistics.totalTests
  );

  // 연속 기록 업데이트
  this.updateStreak();
};

// 연속 기록 업데이트
userSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastTest = this.statistics.streak.lastTestDate;

  if (!lastTest) {
    this.statistics.streak.current = 1;
  } else {
    const diffTime = Math.abs(today - lastTest);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.statistics.streak.current += 1;
    } else if (diffDays > 1) {
      this.statistics.streak.current = 1;
    }
  }

  if (this.statistics.streak.current > this.statistics.streak.longest) {
    this.statistics.streak.longest = this.statistics.streak.current;
  }

  this.statistics.streak.lastTestDate = today;
};

// JSON 변환 시 비밀번호 제외
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
