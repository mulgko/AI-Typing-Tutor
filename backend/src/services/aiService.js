const OpenAI = require("openai");

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * AI를 사용하여 맞춤형 타이핑 텍스트 생성
   */
  async generateTypingText(options = {}) {
    const {
      difficulty = "intermediate",
      category = "일반",
      length = "medium",
      userLevel = "intermediate",
      focusAreas = [],
    } = options;

    let lengthDescription;
    switch (length) {
      case "short":
        lengthDescription = "50-100자 정도의 짧은";
        break;
      case "medium":
        lengthDescription = "100-200자 정도의 중간";
        break;
      case "long":
        lengthDescription = "200-300자 정도의 긴";
        break;
      default:
        lengthDescription = "100-200자 정도의";
    }

    let difficultyDescription;
    switch (difficulty) {
      case "beginner":
        difficultyDescription =
          "초보자를 위한 간단하고 기본적인 단어들로 구성된";
        break;
      case "intermediate":
        difficultyDescription = "중급자를 위한 적당한 난이도의";
        break;
      case "advanced":
        difficultyDescription =
          "고급자를 위한 복잡한 문장과 전문 용어가 포함된";
        break;
      case "expert":
        difficultyDescription =
          "전문가를 위한 매우 어려운 문장과 특수 문자가 포함된";
        break;
      default:
        difficultyDescription = "적당한 난이도의";
    }

    let focusDescription = "";
    if (focusAreas.includes("numbers")) {
      focusDescription += " 숫자가 자연스럽게 포함된";
    }
    if (focusAreas.includes("punctuation")) {
      focusDescription += " 구두점이 많이 사용된";
    }
    if (focusAreas.includes("specialChars")) {
      focusDescription += " 특수문자가 포함된";
    }

    const prompt = `
한국어로 타이핑 연습을 위한 ${lengthDescription} ${difficultyDescription}${focusDescription} 텍스트를 생성해주세요.

주제: ${category}
사용자 레벨: ${userLevel}

요구사항:
1. 자연스럽고 의미있는 문장이어야 합니다.
2. 한국어 맞춤법과 문법이 정확해야 합니다.
3. 타이핑 연습에 적합한 내용이어야 합니다.
4. 교육적이거나 흥미로운 내용이면 좋습니다.
5. 제목 없이 본문만 작성해주세요.
6. 문장은 완결되어야 합니다.

텍스트:`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "당신은 타이핑 연습용 텍스트를 생성하는 전문가입니다. 사용자의 레벨과 요구사항에 맞는 적절한 난이도의 한국어 텍스트를 생성합니다.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const generatedText = completion.choices[0].message.content.trim();

      return {
        success: true,
        content: generatedText,
        metadata: {
          difficulty,
          category,
          length,
          generatedAt: new Date(),
          model: "gpt-3.5-turbo",
        },
      };
    } catch (error) {
      console.error("AI 텍스트 생성 오류:", error);
      return {
        success: false,
        error: "AI 텍스트 생성에 실패했습니다.",
        details: error.message,
      };
    }
  }

  /**
   * 타이핑 테스트 결과 분석 및 피드백 생성
   */
  async analyzeTypingPerformance(testResult, userHistory = []) {
    const {
      wpm,
      accuracy,
      errors,
      timeElapsed,
      textContent,
      userInput,
      keystrokeData,
    } = testResult;

    // 기본 분석
    const analysis = this.performBasicAnalysis(testResult);

    // AI 피드백 생성
    const aiPrompt = `
타이핑 테스트 결과를 분석하여 맞춤형 피드백을 제공해주세요.

테스트 결과:
- WPM (분당 타수): ${wpm}
- 정확도: ${accuracy}%
- 오타 수: ${errors}
- 소요 시간: ${Math.round(timeElapsed)}초
- 텍스트 길이: ${textContent.length}자

성능 분석:
- 평균 키 입력 간격: ${analysis.averageKeyInterval}ms
- 백스페이스 사용 횟수: ${analysis.backspaceCount}
- 일시정지 횟수: ${analysis.pauseCount}

사용자 기록 (최근 ${userHistory.length}회):
${userHistory
  .slice(-5)
  .map(
    (test, idx) =>
      `${idx + 1}. WPM: ${test.results.wpm}, 정확도: ${test.results.accuracy}%`
  )
  .join("\n")}

다음 형식으로 응답해주세요:

**강점:**
- (구체적인 강점 2-3개)

**개선점:**
- (구체적인 개선점 2-3개)

**추천사항:**
- (실용적인 조언 2-3개)

**다음 목표:**
- (달성 가능한 목표 1-2개)
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "당신은 타이핑 실력 향상을 돕는 전문 강사입니다. 사용자의 타이핑 테스트 결과를 분석하여 건설적이고 격려적인 피드백을 제공합니다.",
          },
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const feedback = completion.choices[0].message.content.trim();

      return {
        success: true,
        feedback,
        analysis,
        recommendations: this.generateRecommendations(analysis, testResult),
        nextGoals: this.suggestNextGoals(testResult, userHistory),
      };
    } catch (error) {
      console.error("AI 분석 오류:", error);
      return {
        success: false,
        error: "AI 분석에 실패했습니다.",
        analysis,
        recommendations: this.generateRecommendations(analysis, testResult),
        nextGoals: this.suggestNextGoals(testResult, userHistory),
      };
    }
  }

  /**
   * 기본 타이핑 패턴 분석
   */
  performBasicAnalysis(testResult) {
    const { keystrokeData, userInput, textContent } = testResult;

    let averageKeyInterval = 0;
    let backspaceCount = 0;
    let pauseCount = 0;
    let errorPositions = [];

    if (keystrokeData && keystrokeData.length > 0) {
      const intervals = keystrokeData
        .slice(1)
        .map((stroke) => stroke.timeSinceLastKey)
        .filter((interval) => interval > 0);

      averageKeyInterval =
        intervals.length > 0
          ? Math.round(
              intervals.reduce((sum, interval) => sum + interval, 0) /
                intervals.length
            )
          : 0;

      backspaceCount = keystrokeData.filter(
        (stroke) => stroke.key === "Backspace"
      ).length;
      pauseCount = intervals.filter((interval) => interval > 1000).length;
    }

    // 오타 위치 분석
    const minLength = Math.min(userInput.length, textContent.length);
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] !== textContent[i]) {
        errorPositions.push(i);
      }
    }

    return {
      averageKeyInterval,
      backspaceCount,
      pauseCount,
      errorPositions,
      totalKeystrokes: keystrokeData ? keystrokeData.length : 0,
    };
  }

  /**
   * 기본 추천사항 생성
   */
  generateRecommendations(analysis, testResult) {
    const recommendations = [];

    if (testResult.accuracy < 90) {
      recommendations.push(
        "정확도 향상을 위해 속도보다는 정확성에 집중하세요."
      );
    }

    if (testResult.wpm < 30) {
      recommendations.push("기본 자판 연습을 통해 타이핑 속도를 높이세요.");
    }

    if (analysis.backspaceCount > testResult.textContent.length * 0.1) {
      recommendations.push(
        "백스페이스 사용을 줄이고 천천히 정확하게 타이핑하세요."
      );
    }

    if (analysis.pauseCount > 5) {
      recommendations.push("일관된 타이핑 리듬을 유지하는 연습을 해보세요.");
    }

    if (testResult.wpm > 60 && testResult.accuracy > 95) {
      recommendations.push(
        "훌륭한 실력입니다! 더 어려운 텍스트에 도전해보세요."
      );
    }

    return recommendations;
  }

  /**
   * 다음 목표 제안
   */
  suggestNextGoals(testResult, userHistory) {
    const goals = [];

    // WPM 목표
    if (testResult.wpm < 40) {
      goals.push({
        type: "wpm",
        target: Math.min(testResult.wpm + 5, 40),
        timeframe: "1주일",
      });
    } else if (testResult.wpm < 60) {
      goals.push({
        type: "wpm",
        target: testResult.wpm + 3,
        timeframe: "2주일",
      });
    }

    // 정확도 목표
    if (testResult.accuracy < 95) {
      goals.push({
        type: "accuracy",
        target: Math.min(testResult.accuracy + 2, 95),
        timeframe: "1주일",
      });
    }

    return goals;
  }

  /**
   * 사용자 맞춤 텍스트 추천
   */
  async recommendTexts(userProfile, recentTests = []) {
    // 사용자의 약점 분석
    const weakAreas = this.analyzeWeakAreas(recentTests);

    const recommendations = [];

    // 속도 향상이 필요한 경우
    if (weakAreas.needsSpeedImprovement) {
      recommendations.push({
        type: "speed_focus",
        difficulty: "beginner",
        category: "일반",
        focusAreas: [],
      });
    }

    // 정확도 향상이 필요한 경우
    if (weakAreas.needsAccuracyImprovement) {
      recommendations.push({
        type: "accuracy_focus",
        difficulty: userProfile.level,
        category: "기술",
        focusAreas: weakAreas.problemChars,
      });
    }

    // 특정 문자 연습이 필요한 경우
    if (weakAreas.needsSpecialCharPractice) {
      recommendations.push({
        type: "special_chars",
        difficulty: userProfile.level,
        category: "기술",
        focusAreas: ["punctuation", "specialChars"],
      });
    }

    return recommendations;
  }

  /**
   * 약점 영역 분석
   */
  analyzeWeakAreas(recentTests) {
    if (recentTests.length === 0) {
      return {
        needsSpeedImprovement: true,
        needsAccuracyImprovement: false,
        needsSpecialCharPractice: false,
        problemChars: [],
      };
    }

    const avgWPM =
      recentTests.reduce((sum, test) => sum + test.results.wpm, 0) /
      recentTests.length;
    const avgAccuracy =
      recentTests.reduce((sum, test) => sum + test.results.accuracy, 0) /
      recentTests.length;

    return {
      needsSpeedImprovement: avgWPM < 40,
      needsAccuracyImprovement: avgAccuracy < 90,
      needsSpecialCharPractice: avgAccuracy < 85,
      problemChars: [],
    };
  }
}

module.exports = new AIService();
