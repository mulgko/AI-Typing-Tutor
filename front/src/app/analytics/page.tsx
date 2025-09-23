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
import { Progress } from "@/app/components/ui/progress";
import {
  TrendingUp,
  Target,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  AlertTriangle,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const performanceData = [
  { date: "1/1", wpm: 25, accuracy: 85, time: 300 },
  { date: "1/2", wpm: 28, accuracy: 88, time: 420 },
  { date: "1/3", wpm: 32, accuracy: 90, time: 380 },
  { date: "1/4", wpm: 35, accuracy: 92, time: 450 },
  { date: "1/5", wpm: 38, accuracy: 94, time: 520 },
  { date: "1/6", wpm: 42, accuracy: 96, time: 480 },
  { date: "1/7", wpm: 45, accuracy: 95, time: 600 },
];

const hourlyData = [
  { hour: "09:00", sessions: 3, avgWpm: 42 },
  { hour: "10:00", sessions: 5, avgWpm: 38 },
  { hour: "11:00", sessions: 2, avgWpm: 45 },
  { hour: "14:00", sessions: 4, avgWpm: 40 },
  { hour: "15:00", sessions: 6, avgWpm: 43 },
  { hour: "16:00", sessions: 3, avgWpm: 41 },
  { hour: "19:00", sessions: 7, avgWpm: 46 },
  { hour: "20:00", sessions: 8, avgWpm: 44 },
];

const errorTypeData = [
  { type: "자음 오타", count: 45, color: "#ef4444" },
  { type: "모음 오타", count: 32, color: "#f97316" },
  { type: "띄어쓰기", count: 28, color: "#eab308" },
  { type: "특수문자", count: 15, color: "#22c55e" },
];

const skillRadarData = [
  { skill: "속도", current: 75, target: 90 },
  { skill: "정확도", current: 85, target: 95 },
  { skill: "일관성", current: 70, target: 85 },
  { skill: "리듬감", current: 65, target: 80 },
  { skill: "집중력", current: 80, target: 90 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">성과 분석</h1>
          <p className="text-muted-foreground">
            상세한 타이핑 성과 분석 및 개선점을 확인하세요
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">+18%</p>
              <p className="text-xs text-muted-foreground">WPM 향상률</p>
              <Badge variant="secondary" className="mt-1">
                지난 주 대비
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">94.2%</p>
              <p className="text-xs text-muted-foreground">평균 정확도</p>
              <Badge variant="secondary" className="mt-1">
                +2.1% 향상
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">4.2h</p>
              <p className="text-xs text-muted-foreground">총 연습 시간</p>
              <Badge variant="secondary" className="mt-1">
                이번 주
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-muted-foreground">일관성 점수</p>
              <Badge variant="secondary" className="mt-1">
                안정적
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              성과 추이 분석
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

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              시간대별 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#8884d8" name="세션 수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              오타 유형 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {errorTypeData.map((error, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: error.color }}
                    />
                    <span className="font-medium">{error.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {error.count}회
                    </span>
                    <Progress
                      value={(error.count / 120) * 100}
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              종합 실력 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="현재 실력"
                  dataKey="current"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="목표"
                  dataKey="target"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            상세 분석 리포트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                강점
              </h4>
              <ul className="text-sm space-y-1">
                <li>• 꾸준한 WPM 향상 (주간 +18%)</li>
                <li>• 높은 정확도 유지 (94% 이상)</li>
                <li>• 저녁 시간대 최고 성과</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">
                개선점
              </h4>
              <ul className="text-sm space-y-1">
                <li>• 자음 오타 빈도 높음 (45회)</li>
                <li>• 일관성 점수 향상 필요</li>
                <li>• 오전 시간대 성과 개선</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
