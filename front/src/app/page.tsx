"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";

import {
  RotateCcw,
  Zap,
  Target,
  Clock,
  AlertCircle,
  Brain,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { typingApi, aiApi } from "@/lib/api";
import { VirtualKeyboard } from "./components/ui/virtualKeyboard";
import { useNextKey } from "@/app/hooks/useNextKey";
import { getKeyForChar } from "@/app/lib/hangul";

// 기본 샘플 텍스트 (AI 생성이 실패할 경우 fallback)
const sampleTexts = [
  "인공지능 기술의 발전으로 우리의 일상생활이 크게 변화하고 있습니다. 스마트폰부터 자동차까지 다양한 분야에서 AI가 활용되고 있으며, 앞으로도 더욱 발전할 것으로 예상됩니다.",
  "타이핑 실력 향상을 위해서는 꾸준한 연습이 필요합니다. 정확성을 먼저 기르고, 그 다음에 속도를 높이는 것이 효과적인 학습 방법입니다.",
  "웹 개발에서 사용자 경험은 매우 중요한 요소입니다. 직관적인 인터페이스와 빠른 응답 속도를 통해 사용자 만족도를 높일 수 있습니다.",
  "기후 변화는 전 세계가 직면한 가장 심각한 문제 중 하나입니다. 지속 가능한 발전을 위해 재생 에너지 사용을 늘리고 탄소 배출을 줄여야 합니다.",
  "독서는 지식을 넓히고 상상력을 기르는 가장 좋은 방법입니다. 다양한 장르의 책을 읽으며 새로운 세계를 경험할 수 있습니다.",
];

export default function TypingTest() {
  const [currentText, setCurrentText] = useState(sampleTexts[0]);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [keystrokeData, setKeystrokeData] = useState<
    Array<{
      key: string;
      timestamp: number;
      correct: boolean;
      timeSinceLastKey: number;
    }>
  >([]);
  const [aiInsights, setAiInsights] = useState<{
    recommendations: string[];
    feedback?: string;
  } | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastKeystrokeTime = useRef<number>(0);
  const { toast } = useToast();

  // Calculate next key for virtual keyboard highlighting
  const nextKey = useNextKey(currentText, userInput);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTimeElapsed(elapsed);

        // WPM 계산: 표준 타이핑 테스트 공식 사용
        // 타이핑한 문자 수를 5로 나눈 값(평균 단어 길이)을 분당으로 계산
        // 이 방법은 연속 공백에 영향받지 않고 정확한 WPM 제공
        const charactersTyped = userInput.length;
        const words = charactersTyped / 5; // 표준: 5글자 = 1단어
        const minutes = elapsed / 60;
        const currentWpm = minutes > 0 ? Math.round(words / minutes) : 0;
        setWpm(currentWpm);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime, userInput]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentText]);

  // Keyboard event listener for visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Visual feedback for key press
      const key = e.key.toLowerCase();
      setPressedKey(key);

      // Clear after animation duration
      setTimeout(() => setPressedKey(null), 150);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 타이핑 테스트 시작
  const startTypingTest = async () => {
    try {
      const response = await typingApi.startTest({
        textId: currentTextId || undefined,
        textContent: currentText,
        testMode: "practice",
      });

      setCurrentTestId(response.testId);
      setKeystrokeData([]);
      setAiInsights(null);
      lastKeystrokeTime.current = 0;
    } catch (error) {
      // 백엔드가 실행되지 않을 때 오프라인 모드로 조용히 전환
      setCurrentTestId(null);
      setKeystrokeData([]);
      setAiInsights(null);
      lastKeystrokeTime.current = 0;
    }
  };

  // 키스트로크 기록
  const recordKeystroke = (key: string, correct: boolean) => {
    const now = Date.now();
    const timeSinceLastKey =
      lastKeystrokeTime.current > 0 ? now - lastKeystrokeTime.current : 0;

    const keystroke = {
      key,
      timestamp: now,
      correct,
      timeSinceLastKey,
    };

    setKeystrokeData((prev) => [...prev, keystroke]);
    lastKeystrokeTime.current = now;
  };

  const handleInputChange = async (value: string) => {
    // 첫 글자 입력 시 테스트 시작
    if (!isActive && value.length > 0) {
      setIsActive(true);
      setStartTime(Date.now());
      await startTypingTest();
    }

    // 키스트로크 기록 (마지막 입력 문자)
    if (value.length > userInput.length) {
      const newChar = value[value.length - 1];
      const expectedChar = currentText[value.length - 1];
      const isCorrect = newChar === expectedChar;
      recordKeystroke(newChar, isCorrect);

      // Error visualization
      if (!isCorrect) {
        const errorKeyName = getKeyForChar(expectedChar);
        setErrorKey(errorKeyName);
        setTimeout(() => setErrorKey(null), 500);
      }
    } else if (value.length < userInput.length) {
      // 백스페이스
      recordKeystroke("Backspace", false);
    }

    setUserInput(value);

    // Calculate accuracy and errors
    let correctChars = 0;
    let totalErrors = 0;

    const minLength = Math.min(value.length, currentText.length);

    for (let i = 0; i < minLength; i++) {
      if (value[i] === currentText[i]) {
        correctChars++;
      } else {
        totalErrors++;
      }
    }

    const currentAccuracy =
      value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100;
    setAccuracy(currentAccuracy);
    setErrors(totalErrors);

    // Check if test is complete
    if (value.length >= currentText.length) {
      const finalAccuracy = Math.round(
        (correctChars / currentText.length) * 100
      );
      setIsActive(false);
      setIsCompleted(true);

      // 백엔드에 테스트 완료 데이터 전송
      if (currentTestId) {
        try {
          const response = await typingApi.completeTest(currentTestId, {
            userInput: value,
            wpm,
            accuracy: finalAccuracy,
            timeElapsed,
            keystrokeData,
          });

          // AI 분석 결과 표시
          if (response.aiAnalysis?.success && response.test.aiInsights) {
            setAiInsights({
              recommendations: response.test.aiInsights.recommendations || [],
              feedback: response.aiAnalysis.feedback,
            });
          }

          toast({
            title: "테스트 완료!",
            description: `WPM: ${wpm}, 정확도: ${finalAccuracy}%`,
          });
        } catch (error) {
          console.error("Failed to complete test:", error);
          toast({
            title: "테스트 완료!",
            description: `WPM: ${wpm}, 정확도: ${finalAccuracy}% (오프라인 모드)`,
          });
        }
      }

      // 3초 후 자동으로 새 지문 생성
      setTimeout(async () => {
        await generateNewText();
      }, 3000);
    }
  };

  const resetTest = () => {
    setUserInput("");
    setIsActive(false);
    setIsCompleted(false);
    setStartTime(null);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const generateNewText = async () => {
    setIsGenerating(true);

    try {
      // AI를 사용하여 새로운 텍스트 생성
      const response = await aiApi.generateText({
        difficulty: "intermediate", // 추후 사용자 레벨에 따라 동적으로 설정
        category: "일반",
        length: "medium",
        focusAreas: [],
      });

      setCurrentText(response.text.content);
      setCurrentTextId(response.text._id);
      resetTest();

      toast({
        title: "새로운 지문 생성 완료",
        description: "AI가 당신의 실력에 맞는 맞춤 지문을 생성했습니다.",
      });
    } catch (error) {
      console.error("Failed to generate AI text:", error);

      // Fallback: 샘플 텍스트 사용
      const availableTexts = sampleTexts.filter((text) => text !== currentText);
      const randomText =
        availableTexts[Math.floor(Math.random() * availableTexts.length)];
      setCurrentText(randomText);
      setCurrentTextId(null);
      resetTest();

      toast({
        title: "새로운 지문 준비 완료",
        description: "샘플 지문으로 계속 연습할 수 있습니다.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderText = () => {
    return currentText.split("").map((char, index) => {
      // ✅ 항상 원본 텍스트를 표시 (레이아웃 보존)
      const displayChar = char;
      let textClassName = "text-muted-foreground";
      let bgClassName = "";
      const isSpace = char === " ";

      // 현재 타이핑 중인 글자의 사용자 입력
      let typingHint = null;

      if (index < userInput.length - 1) {
        // 완료된 글자들 - 원본 유지 + 정답/오답 판정
        const inputChar = userInput[index];

        if (inputChar === char) {
          // 올바른 글자
          textClassName = "text-green-600 dark:text-green-400";
          bgClassName = "bg-green-500/10";
        } else {
          // 틀린 글자
          textClassName = "text-red-600 dark:text-red-400";
          bgClassName = "bg-red-500/20";
        }
      } else if (index === userInput.length - 1 && !isCompleted) {
        // 현재 타이핑 중인 글자 - 판정 없이 위쪽에 힌트 표시
        const inputChar = userInput[index];
        textClassName = "text-blue-600 dark:text-blue-400 font-semibold";
        bgClassName = "bg-blue-500/20";

        // 한글 조합 과정을 위쪽에 작게 표시
        if (inputChar !== char) {
          typingHint = (
            <span className="absolute -top-6 left-0 text-xs bg-blue-600 text-white px-2 py-1 rounded shadow-lg z-10">
              {inputChar}
            </span>
          );
        }
      } else if (index === userInput.length && !isCompleted) {
        // 다음 입력 위치 (커서)
        bgClassName = "bg-blue-500/30 animate-pulse";
        textClassName = "text-foreground";
      }

      // 공백 문자 표시
      const spaceStyle = isSpace
        ? "inline-block min-w-[0.5em] border-b-2 border-dotted border-muted-foreground/30"
        : "";

      return (
        <span
          key={index}
          className={`relative ${bgClassName} ${textClassName} ${spaceStyle} transition-all duration-150`}
        >
          {displayChar}
          {typingHint}
          {index === userInput.length && !isCompleted && (
            <span className="absolute top-0 left-0 w-0.5 h-full bg-blue-500 animate-pulse" />
          )}
        </span>
      );
    });
  };

  const progress = (userInput.length / currentText.length) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      {/* <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI 타이핑 테스트</h1>
        <p className="text-muted-foreground">
          AI가 생성한 맞춤형 지문으로 타이핑 실력을 향상시키세요
        </p>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Zap className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{wpm}</p>
              <p className="text-xs text-muted-foreground">WPM</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Target className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">정확도</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{Math.round(timeElapsed)}</p>
              <p className="text-xs text-muted-foreground">초</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{errors}</p>
              <p className="text-xs text-muted-foreground">오타</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Typing Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>타이핑 지문</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateNewText}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    AI 생성 중...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />새 지문 생성
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={resetTest}>
                <RotateCcw className="h-4 w-4 mr-2" />
                다시 시작
              </Button>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text Display with Overlay Input */}
          <div className="relative">
            <div
              className="p-6 bg-muted/50 rounded-lg min-h-[120px] text-xl leading-relaxed font-mono select-none break-words"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {renderText()}
            </div>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="absolute inset-0 w-full h-full p-6 text-xl leading-relaxed font-mono bg-transparent border-none outline-none resize-none text-transparent caret-transparent break-words"
              style={{ caretColor: "transparent", whiteSpace: 'pre-wrap' }}
              placeholder=""
              disabled={isCompleted}
              autoFocus
            />
          </div>

          {/* AI Feedback */}
          {isActive && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
              <p className="text-sm text-blue-600 dark:text-blue-400">
                AI가 실시간으로 당신의 타이핑 패턴을 분석하고 있습니다...
              </p>
            </div>
          )}

          {/* AI 분석 결과 */}
          {aiInsights && (
            <div className="space-y-3">
              {aiInsights.feedback && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <h4 className="font-semibold text-green-700 dark:text-green-400">
                      AI 분석 결과
                    </h4>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-300 whitespace-pre-wrap">
                    {aiInsights.feedback}
                  </div>
                </div>
              )}

              {aiInsights.recommendations.length > 0 && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-orange-500" />
                    <h4 className="font-semibold text-orange-700 dark:text-orange-400">
                      개선 추천
                    </h4>
                  </div>
                  <ul className="text-sm text-orange-600 dark:text-orange-300 space-y-1">
                    {aiInsights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Virtual Keyboard */}
      <div className="w-full">
        <VirtualKeyboard
          nextChar={nextKey}
          pressedKey={pressedKey}
          errorKey={errorKey}
          showNextKeyHighlight={true}
          showFingerGuide={true}
          showKeyPressAnimation={true}
          showErrorVisualization={true}
        />
      </div>
    </div>
  );
}
