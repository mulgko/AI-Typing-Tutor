"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Badge } from "./components/ui/badge";

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastKeystrokeTime = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTimeElapsed(elapsed);

        const wordsTyped = userInput
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        const currentWpm =
          elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
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
      console.error("Failed to start typing test:", error);
      // 오프라인 모드로 계속 진행
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
      recordKeystroke(newChar, newChar === expectedChar);
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
      let displayChar = char;
      let textClassName = "text-muted-foreground";
      let bgClassName = "";

      // 공백 문자를 시각적으로 표시하기 위해 특별 처리
      if (char === " ") {
        displayChar = "·"; // 중점으로 공백 표시
      }

      if (index < userInput.length) {
        // 사용자가 입력한 글자를 표시
        if (userInput[index] === " ") {
          displayChar = "·"; // 입력된 공백도 중점으로 표시
        } else {
          displayChar = userInput[index];
        }

        if (userInput[index] === char) {
          // 올바른 글자
          textClassName = "text-green-600 dark:text-green-400";
          bgClassName = "bg-green-500/10";
        } else {
          // 틀린 글자
          textClassName = "text-red-600 dark:text-red-400";
          bgClassName = "bg-red-500/20";
        }
      } else if (index === userInput.length && !isCompleted) {
        // 현재 커서 위치
        bgClassName = "bg-blue-500/30 animate-pulse";
        textClassName = "text-foreground";
      }

      return (
        <span
          key={index}
          className={`relative ${bgClassName} ${textClassName} transition-all duration-150 whitespace-pre`}
        >
          {displayChar}
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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI 타이핑 테스트</h1>
        <p className="text-muted-foreground">
          AI가 생성한 맞춤형 지문으로 타이핑 실력을 향상시키세요
        </p>
      </div>

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
            <div className="p-6 bg-muted/50 rounded-lg min-h-[120px] text-xl leading-relaxed font-mono select-none">
              {renderText()}
            </div>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="absolute inset-0 w-full h-full p-6 text-xl leading-relaxed font-mono bg-transparent border-none outline-none resize-none text-transparent caret-transparent"
              style={{ caretColor: "transparent" }}
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

      {/* Performance Badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        {wpm > 40 && <Badge variant="secondary">빠른 타이핑</Badge>}
        {accuracy > 95 && <Badge variant="secondary">높은 정확도</Badge>}
        {errors === 0 && userInput.length > 10 && (
          <Badge variant="secondary">무오타</Badge>
        )}
        {isActive && (
          <Badge variant="outline" className="animate-pulse">
            진행 중
          </Badge>
        )}
        {isCompleted && <Badge variant="default">완료</Badge>}
      </div>
    </div>
  );
}
