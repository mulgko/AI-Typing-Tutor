"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { RotateCcw, Zap, Target, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sampleTexts = [
  "인공지능 기술의 발전으로 우리의 일상생활이 크게 변화하고 있습니다. 스마트폰부터 자동차까지 다양한 분야에서 AI가 활용되고 있으며, 앞으로도 더욱 발전할 것으로 예상됩니다.",
  "타이핑 실력 향상을 위해서는 꾸준한 연습이 필요합니다. 정확성을 먼저 기르고, 그 다음에 속도를 높이는 것이 효과적인 학습 방법입니다.",
  "웹 개발에서 사용자 경험은 매우 중요한 요소입니다. 직관적인 인터페이스와 빠른 응답 속도를 통해 사용자 만족도를 높일 수 있습니다.",
  "기후 변화는 전 세계가 직면한 가장 심각한 문제 중 하나입니다. 지속 가능한 발전을 위해 재생 에너지 사용을 늘리고 탄소 배출을 줄여야 합니다.",
  "독서는 지식을 넓히고 상상력을 기르는 가장 좋은 방법입니다. 다양한 장르의 책을 읽으며 새로운 세계를 경험할 수 있습니다.",
  "건강한 생활을 위해서는 규칙적인 운동과 균형 잡힌 식단이 필수입니다. 충분한 수면과 스트레스 관리도 중요한 요소입니다.",
  "디지털 시대에 개인정보 보호는 매우 중요한 이슈가 되었습니다. 안전한 비밀번호 사용과 개인정보 공유에 주의해야 합니다.",
  "교육의 목적은 단순히 지식을 전달하는 것이 아니라 창의적 사고력을 기르는 것입니다. 학생들이 스스로 생각하고 문제를 해결할 수 있도록 도와야 합니다.",
  "음악은 감정을 표현하고 사람들을 하나로 연결하는 강력한 매체입니다. 다양한 문화의 음악을 통해 세계를 이해할 수 있습니다.",
  "과학 기술의 발전은 인류의 삶을 풍요롭게 만들었습니다. 하지만 기술의 올바른 사용과 윤리적 고려가 필요합니다.",
];

export default function TypingTest() {
  const [currentText, setCurrentText] = useState(sampleTexts[0]);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  const handleInputChange = (value: string) => {
    if (!isActive && value.length > 0) {
      setIsActive(true);
      setStartTime(Date.now());
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

      toast({
        title: "테스트 완료!",
        description: `WPM: ${wpm}, 정확도: ${finalAccuracy}%`,
      });

      // 3초 후 자동으로 새 지문 생성
      setTimeout(() => {
        const availableTexts = sampleTexts.filter(
          (text) => text !== currentText
        );
        const randomText =
          availableTexts[Math.floor(Math.random() * availableTexts.length)];
        setCurrentText(randomText);
        setUserInput("");
        setIsCompleted(false);
        setStartTime(null);
        setTimeElapsed(0);
        setWpm(0);
        setAccuracy(100);
        setErrors(0);

        toast({
          title: "새로운 지문 준비 완료",
          description: "계속해서 타이핑 연습을 진행하세요!",
        });
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
    // Simulate AI text generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const randomText =
      sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setCurrentText(randomText);
    setIsGenerating(false);
    resetTest();
    toast({
      title: "새로운 지문 생성 완료",
      description: "AI가 당신의 실력에 맞는 맞춤 지문을 생성했습니다.",
    });
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
              <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full" />
              <p className="text-sm text-blue-600 dark:text-blue-400">
                AI가 실시간으로 당신의 타이핑 패턴을 분석하고 있습니다...
              </p>
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
