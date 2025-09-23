"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Brain,
  Target,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Calendar,
  PlayCircle,
} from "lucide-react";

const personalizedTexts = [
  {
    id: 1,
    title: "자음 집중 연습",
    difficulty: "중급",
    focus: "ㅂ, ㅍ, ㅎ 자음",
    text: "밝은 빛이 비치는 바닷가에서 파도가 부서지며 하얀 포말을 만들어냅니다. 해변에는 많은 사람들이 휴식을 취하고 있습니다.",
    reason:
      "자음 'ㅂ', 'ㅍ', 'ㅎ'에서 자주 실수하는 패턴을 개선하기 위한 맞춤 지문입니다.",
  },
  {
    id: 2,
    title: "띄어쓰기 마스터",
    difficulty: "초급",
    focus: "띄어쓰기 정확성",
    text: "오늘은 날씨가 매우 좋습니다. 파란 하늘에 하얀 구름이 떠 있고, 따뜻한 햇살이 내리쬡니다. 이런 날에는 산책을 하면 좋겠습니다.",
    reason:
      "띄어쓰기 실수를 줄이고 문장 구조 인식 능력을 향상시키기 위한 연습입니다.",
  },
  {
    id: 3,
    title: "속도 향상 챌린지",
    difficulty: "고급",
    focus: "타이핑 속도",
    text: "기술의 발전은 우리 삶을 편리하게 만들었지만, 동시에 새로운 도전과 기회를 제공합니다. 변화하는 세상에 적응하며 성장해야 합니다.",
    reason: "현재 WPM을 기준으로 속도 향상을 위한 고난도 연습 지문입니다.",
  },
];

const learningPlan = [
  {
    week: 1,
    goal: "기초 정확도 향상",
    target: "95% 정확도 달성",
    tasks: [
      "자음 연습 (ㅂ, ㅍ, ㅎ) - 매일 15분",
      "기본 단어 반복 연습",
      "손가락 위치 교정",
    ],
    completed: true,
  },
  {
    week: 2,
    goal: "속도 개선",
    target: "50 WPM 달성",
    tasks: ["문장 단위 연습", "리듬감 향상 훈련", "연속 타이핑 연습"],
    completed: true,
  },
  {
    week: 3,
    goal: "일관성 강화",
    target: "안정적인 성과 유지",
    tasks: [
      "다양한 주제 지문 연습",
      "시간대별 연습 패턴 분석",
      "집중력 향상 훈련",
    ],
    completed: false,
  },
  {
    week: 4,
    goal: "고급 기술 습득",
    target: "60 WPM + 97% 정확도",
    tasks: [
      "복잡한 문장 구조 연습",
      "특수문자 포함 텍스트",
      "실전 타이핑 시뮬레이션",
    ],
    completed: false,
  },
];

const aiInsights = [
  {
    type: "success",
    icon: CheckCircle,
    title: "우수한 학습 패턴",
    message:
      "저녁 시간대(19-20시)에 가장 좋은 성과를 보이고 있습니다. 이 시간을 활용한 집중 연습을 추천합니다.",
  },
  {
    type: "warning",
    icon: AlertCircle,
    title: "주의 필요 영역",
    message:
      "자음 'ㅂ'과 'ㅍ' 구분에서 실수가 많습니다. 해당 자음이 포함된 단어 연습을 늘려보세요.",
  },
  {
    type: "tip",
    icon: Lightbulb,
    title: "AI 학습 팁",
    message:
      "현재 속도보다 정확도에 집중하세요. 정확도가 95% 이상 안정화되면 자연스럽게 속도도 향상됩니다.",
  },
];

export default function Recommendations() {
  const [selectedText, setSelectedText] = useState<number | null>(null);

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-orange-500";
      case "tip":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 border-green-500/20";
      case "warning":
        return "bg-orange-500/10 border-orange-500/20";
      case "tip":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI 맞춤 추천</h1>
        <p className="text-muted-foreground">
          AI가 분석한 당신만의 개인화된 학습 계획과 추천사항
        </p>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiInsights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <Card
              key={index}
              className={`border border-border ${getBgColor(insight.type)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <IconComponent
                    className={`h-5 w-5 mt-0.5 ${getIconColor(insight.type)}`}
                  />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Personalized Practice Texts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI 맞춤 연습 지문
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {personalizedTexts.map((text) => (
            <div
              key={text.id}
              className="border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{text.title}</h4>
                  <Badge
                    variant={
                      text.difficulty === "초급"
                        ? "secondary"
                        : text.difficulty === "중급"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {text.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    {text.focus}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setSelectedText(selectedText === text.id ? null : text.id)
                  }
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  {selectedText === text.id ? "접기" : "연습하기"}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">{text.reason}</p>

              {selectedText === text.id && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="font-mono text-lg leading-relaxed">
                    {text.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Learning Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            4주 학습 계획
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningPlan.map((plan) => (
              <div
                key={plan.week}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        plan.completed
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        plan.week
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{plan.goal}</h4>
                      <p className="text-sm text-muted-foreground">
                        {plan.target}
                      </p>
                    </div>
                  </div>
                  <Badge variant={plan.completed ? "secondary" : "outline"}>
                    {plan.completed ? "완료" : "진행 예정"}
                  </Badge>
                </div>

                <div className="ml-11 space-y-2">
                  {plan.tasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          plan.completed
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span
                        className={
                          plan.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <h4 className="font-semibold">정확도 집중 모드</h4>
              <p className="text-sm text-muted-foreground">
                속도보다 정확성에 집중
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <Zap className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <h4 className="font-semibold">속도 향상 모드</h4>
              <p className="text-sm text-muted-foreground">WPM 향상에 집중</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <h4 className="font-semibold">약점 보완 모드</h4>
              <p className="text-sm text-muted-foreground">
                개인 약점 집중 연습
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
