// ===================================
// 사용자 모델 파일 (User.js)
// ===================================
// 이 파일은 사용자 데이터의 구조를 정의합니다.
// 회원가입/로그인한 사용자의 모든 정보가 이 구조에 따라 데이터베이스에 저장됩니다.

const mongoose = require("mongoose"); // MongoDB ODM 라이브러리
const bcrypt = require("bcrypt"); // 비밀번호 암호화를 위한 라이브러리

// ===================================
// 사용자 데이터 스키마 정의
// ===================================
// 스키마란? 데이터베이스에 저장될 데이터의 형태와 규칙을 정의하는 것입니다
const userSchema = new mongoose.Schema({
  // ===================================
  // 기본 계정 정보
  // ===================================
  username: {
    type: String, // 데이터 타입: 문자열
    required: [true, "사용자명은 필수입니다."], // 필수 항목 (회원가입시 반드시 입력)
    unique: true, // 중복 불허 (같은 사용자명 2개 계정 불가)
    trim: true, // 앞뒤 공백 자동 제거
    minlength: [3, "사용자명은 최소 3자 이상이어야 합니다."], // 최소 길이 제한
    maxlength: [20, "사용자명은 최대 20자까지 가능합니다."], // 최대 길이 제한
  },
  email: {
    type: String, // 데이터 타입: 문자열
    required: [true, "이메일은 필수입니다."], // 필수 항목
    unique: true, // 중복 불허 (한 이메일로 하나의 계정만 가능)
    lowercase: true, // 자동으로 소문자 변환
    match: [
      // 정규표현식으로 이메일 형식 검증
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "유효한 이메일 주소를 입력해주세요.",
    ],
  },
  password: {
    type: String, // 데이터 타입: 문자열
    required: [true, "비밀번호는 필수입니다."], // 필수 항목
    minlength: [6, "비밀번호는 최소 6자 이상이어야 합니다."], // 최소 길이 제한
    // 참고: 실제로는 bcrypt로 암호화된 상태로 저장됩니다
  },
  // ===================================
  // 사용자 프로필 정보
  // ===================================
  profile: {
    firstName: String, // 이름 (선택사항)
    lastName: String, // 성 (선택사항)
    avatar: String, // 프로필 이미지 URL (선택사항)
    level: {
      // 현재 타이핑 실력 레벨
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"], // 4단계 레벨만 허용
      default: "beginner", // 신규 가입시 기본값
    },
    goal: {
      // 사용자가 설정한 목표
      targetWPM: {
        // 목표 타이핑 속도 (분당 단어수)
        type: Number,
        default: 40, // 기본 목표: 40 WPM
      },
      targetAccuracy: {
        // 목표 정확도 (%)
        type: Number,
        default: 95, // 기본 목표: 95% 정확도
      },
    },
  },
  // ===================================
  // 사용자 타이핑 통계 정보
  // ===================================
  statistics: {
    totalTests: {
      // 총 완료한 테스트 횟수
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      // 총 연습 시간
      type: Number,
      default: 0, // 초 단위로 저장
    },
    bestWPM: {
      // 역대 최고 타이핑 속도
      type: Number,
      default: 0,
    },
    bestAccuracy: {
      // 역대 최고 정확도
      type: Number,
      default: 0,
    },
    averageWPM: {
      // 평균 타이핑 속도
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      // 평균 정확도
      type: Number,
      default: 0,
    },
    streak: {
      // 연속 연습 기록
      current: {
        // 현재 연속 연습 일수
        type: Number,
        default: 0,
      },
      longest: {
        // 역대 최장 연속 연습 일수
        type: Number,
        default: 0,
      },
      lastTestDate: Date, // 마지막 테스트 날짜
    },
  },
  // ===================================
  // 사용자 환경설정
  // ===================================
  preferences: {
    theme: {
      // 화면 테마 설정
      type: String,
      enum: ["light", "dark", "system"], // 밝음/어둠/시스템 설정 따름
      default: "system", // 기본값: 시스템 설정 따름
    },
    language: {
      // 사용 언어
      type: String,
      default: "ko", // 기본값: 한국어
    },
    notifications: {
      // 알림 설정
      email: {
        // 이메일 알림 허용 여부
        type: Boolean,
        default: true,
      },
      reminders: {
        // 연습 리마인더 허용 여부
        type: Boolean,
        default: true,
      },
    },
    typingSettings: {
      // 타이핑 연습 관련 설정
      showKeyboard: {
        // 화면 키보드 표시 여부
        type: Boolean,
        default: true,
      },
      playSounds: {
        // 타이핑 소리 재생 여부
        type: Boolean,
        default: false,
      },
      highlightErrors: {
        // 오타 강조 표시 여부
        type: Boolean,
        default: true,
      },
    },
  },
  // ===================================
  // 계정 관리 정보
  // ===================================
  subscriptionPlan: {
    // 구독 요금제
    type: String,
    enum: ["free", "premium", "enterprise"], // 무료/프리미엄/기업용
    default: "free", // 기본값: 무료 계정
  },
  isActive: {
    // 계정 활성화 상태
    type: Boolean,
    default: true, // 기본값: 활성화됨
  },
  lastLogin: Date, // 마지막 로그인 시간
  createdAt: {
    // 계정 생성 시간
    type: Date,
    default: Date.now, // 기본값: 현재 시간
  },
  updatedAt: {
    // 마지막 수정 시간
    type: Date,
    default: Date.now, // 기본값: 현재 시간
  },
});

// ===================================
// 데이터 저장 전 자동 처리 함수들 (미들웨어)
// ===================================

// 비밀번호 해싱 미들웨어
// 사용자가 회원가입하거나 비밀번호를 변경할 때 자동으로 암호화합니다
userSchema.pre("save", async function (next) {
  // 비밀번호가 수정되지 않았다면 암호화할 필요 없음
  if (!this.isModified("password")) return next();

  try {
    // 비밀번호 해싱 (bcrypt 사용)
    const salt = await bcrypt.genSalt(12); // 솔트 생성 (보안 강화)
    this.password = await bcrypt.hash(this.password, salt); // 비밀번호 암호화
    next(); // 다음 단계로 진행
  } catch (error) {
    next(error); // 에러 발생시 저장 중단
  }
});

// 업데이트 시간 자동 갱신 미들웨어
// 사용자 정보가 변경될 때마다 자동으로 수정 시간을 현재 시간으로 업데이트
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// ===================================
// 사용자 모델 메서드들
// ===================================

// 비밀번호 비교 메서드
// 로그인할 때 입력한 비밀번호가 저장된 암호화된 비밀번호와 일치하는지 확인
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 사용자 통계 업데이트 메서드
// 타이핑 테스트를 완료할 때마다 호출되어 사용자의 전체 통계를 업데이트합니다
userSchema.methods.updateStatistics = function (testResult) {
  // 총 테스트 수 증가
  this.statistics.totalTests += 1;

  // 총 연습 시간 누적 (초 단위)
  this.statistics.totalTimeSpent += testResult.timeElapsed;

  // 최고 기록 갱신 확인
  if (testResult.wpm > this.statistics.bestWPM) {
    this.statistics.bestWPM = testResult.wpm; // 새로운 최고 속도 기록
  }

  if (testResult.accuracy > this.statistics.bestAccuracy) {
    this.statistics.bestAccuracy = testResult.accuracy; // 새로운 최고 정확도 기록
  }

  // 평균 WPM 다시 계산 (기존 평균 * 기존 횟수 + 새 결과) / 새로운 총 횟수
  this.statistics.averageWPM = Math.round(
    (this.statistics.averageWPM * (this.statistics.totalTests - 1) +
      testResult.wpm) /
      this.statistics.totalTests
  );

  // 평균 정확도 다시 계산
  this.statistics.averageAccuracy = Math.round(
    (this.statistics.averageAccuracy * (this.statistics.totalTests - 1) +
      testResult.accuracy) /
      this.statistics.totalTests
  );

  // 연속 연습 기록 업데이트
  this.updateStreak();
};

// 연속 연습 기록 업데이트 메서드
// 매일 연속으로 연습했는지 확인하고 연속 기록을 관리합니다
userSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastTest = this.statistics.streak.lastTestDate;

  if (!lastTest) {
    // 첫 번째 테스트인 경우
    this.statistics.streak.current = 1;
  } else {
    // 마지막 테스트와 오늘 사이의 일수 계산
    const diffTime = Math.abs(today - lastTest);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // 하루 연속으로 연습한 경우 - 연속 기록 증가
      this.statistics.streak.current += 1;
    } else if (diffDays > 1) {
      // 하루 이상 쉰 경우 - 연속 기록 리셋
      this.statistics.streak.current = 1;
    }
    // diffDays === 0 (같은 날)인 경우는 연속 기록 변화 없음
  }

  // 최장 연속 기록 갱신 확인
  if (this.statistics.streak.current > this.statistics.streak.longest) {
    this.statistics.streak.longest = this.statistics.streak.current;
  }

  // 마지막 테스트 날짜 업데이트
  this.statistics.streak.lastTestDate = today;
};

// JSON 변환 시 비밀번호 제외
// 프론트엔드로 사용자 정보를 보낼 때 비밀번호는 절대 포함되지 않도록 합니다
userSchema.methods.toJSON = function () {
  const user = this.toObject(); // MongoDB 객체를 일반 JavaScript 객체로 변환
  delete user.password; // 비밀번호 필드 삭제
  return user;
};

// ===================================
// 모델 생성 및 내보내기
// ===================================
// 정의한 스키마를 바탕으로 실제 User 모델을 생성합니다
module.exports = mongoose.model("User", userSchema);
