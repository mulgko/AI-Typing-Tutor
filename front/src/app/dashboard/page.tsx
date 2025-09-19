"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  Brain,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const performanceData = [
  { date: "1/1", wpm: 25, accuracy: 85 },
  { date: "1/2", wpm: 28, accuracy: 88 },
  { date: "1/3", wpm: 32, accuracy: 90 },
  { date: "1/4", wpm: 35, accuracy: 92 },
  { date: "1/5", wpm: 38, accuracy: 94 },
  { date: "1/6", wpm: 42, accuracy: 96 },
  { date: "1/7", wpm: 45, accuracy: 95 },
];

const errorAnalysis = [
  { character: "ㅂ", errors: 12 },
  { character: "ㅍ", errors: 8 },
  { character: "ㅎ", errors: 6 },
  { character: "ㅊ", errors: 5 },
  { character: "ㅋ", errors: 4 },
];

const recentSessions = [
  { date: "2024-01-07", wpm: 45, accuracy: 95, duration: "5분" },
  { date: "2024-01-06", wpm: 42, accuracy: 96, duration: "8분" },
  { date: "2024-01-05", wpm: 38, accuracy: 94, duration: "6분" },
  { date: "2024-01-04", wpm: 35, accuracy: 92, duration: "7분" },
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  const currentLevel = "intermediate";
  const levelProgress = 75;
  const totalPracticeTime = 240; // minutes
  const averageWpm = 42;
  const averageAccuracy = 94;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">학습 대시보드</h1>
          <p className="text-muted-foreground">
            당신의 타이핑 실력 향상 현황을 확인하세요
          </p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === "7d" ? "7일" : range === "30d" ? "30일" : "90일"}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{averageWpm}</p>
              <p className="text-xs text-muted-foreground">평균 WPM</p>
              <Badge variant="secondary" className="mt-1">
                +12% 향상
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{averageAccuracy}%</p>
              <p className="text-xs text-muted-foreground">평균 정확도</p>
              <Badge variant="secondary" className="mt-1">
                +5% 향상
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {Math.floor(totalPracticeTime / 60)}h {totalPracticeTime % 60}m
              </p>
              <p className="text-xs text-muted-foreground">총 연습 시간</p>
              <Badge variant="secondary" className="mt-1">
                이번 주
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Award className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-lg font-bold capitalize">{currentLevel}</p>
              <p className="text-xs text-muted-foreground">현재 레벨</p>
              <Progress value={levelProgress} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            성과 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="wpm"
                stroke="#3b82f6"
                strokeWidth={2}
                name="WPM"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                name="정확도 (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              오타 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={errorAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="character" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errors" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <Brain className="h-4 w-4 inline mr-1" />
                AI 추천: 'ㅂ'과 'ㅍ' 자음 연습에 집중하세요. 맞춤형 연습 지문을
                생성해드릴게요!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              최근 세션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{session.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{session.wpm} WPM</p>
                    <p className="text-sm text-muted-foreground">
                      {session.accuracy}% 정확도
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            성취 배지
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="p-2">
              <Award className="h-4 w-4 mr-1" />첫 40 WPM 달성
            </Badge>
            <Badge variant="secondary" className="p-2">
              <Target className="h-4 w-4 mr-1" />
              95% 정확도 달성
            </Badge>
            <Badge variant="secondary" className="p-2">
              <Clock className="h-4 w-4 mr-1" />
              7일 연속 연습
            </Badge>
            <Badge variant="outline" className="p-2 opacity-50">
              <TrendingUp className="h-4 w-4 mr-1" />
              50 WPM 달성 (진행 중)
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
