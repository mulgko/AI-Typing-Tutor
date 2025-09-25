// ===================================
// 데이터베이스 연결 설정 파일 (database.js)
// ===================================
// 이 파일은 MongoDB 데이터베이스와의 연결을 담당합니다.
// 사용자 정보, 타이핑 테스트 결과 등 모든 데이터가 MongoDB에 저장됩니다.

const mongoose = require("mongoose"); // MongoDB와 연결하기 위한 라이브러리

// ===================================
// 데이터베이스 연결 함수
// ===================================
// 비동기 함수로 MongoDB에 연결을 시도합니다
const connectDB = async () => {
  try {
    // MongoDB 연결 시도
    // process.env.MONGODB_URI는 .env 파일에 설정된 데이터베이스 주소입니다
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true, // 새로운 URL 파서 사용 (권장사항)
      useUnifiedTopology: true, // 새로운 연결 관리 엔진 사용 (권장사항)
    });

    console.log(`📦 MongoDB 연결됨: ${conn.connection.host}`);

    // ===================================
    // 데이터베이스 연결 상태 모니터링
    // ===================================
    // 연결 중에 오류가 발생했을 때 처리하는 이벤트 리스너
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB 연결 오류:", err);
    });

    // 연결이 끊어졌을 때 알림을 주는 이벤트 리스너
    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB 연결이 끊어졌습니다.");
    });

    // ===================================
    // 앱 종료 시 연결 정리
    // ===================================
    // 서버가 종료될 때 (Ctrl+C 등) 데이터베이스 연결도 깔끔하게 종료
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("📦 MongoDB 연결이 종료되었습니다.");
      process.exit(0); // 프로세스 정상 종료
    });
  } catch (error) {
    // 연결에 실패했을 때 에러 메시지 출력 후 프로세스 종료
    console.error("❌ MongoDB 연결 실패:", error.message);
    process.exit(1); // 프로세스 비정상 종료
  }
};

// 다른 파일에서 이 함수를 사용할 수 있도록 내보내기
module.exports = connectDB;
