"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Slider } from "@/app/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";

import { useTheme } from "../contexts/ThemeContext";

import {
  Settings,
  Palette,
  Volume2,
  Keyboard,
  Target,
  Shield,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    soundEnabled: true,
    soundVolume: [70],
    showKeyboard: true,
    showWPM: true,
    showAccuracy: true,
    showTimer: true,
    autoNextText: true,
    notifications: true,
    fontSize: [18],
    practiceTime: "15",
    difficulty: "medium",
    colorBlindMode: false,
    highContrast: false,
  });

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "설정 저장됨",
      description: "변경사항이 적용되었습니다.",
    });
  };

  const resetSettings = () => {
    setSettings({
      soundEnabled: true,
      soundVolume: [70],
      showKeyboard: true,
      showWPM: true,
      showAccuracy: true,
      showTimer: true,
      autoNextText: true,
      notifications: true,
      fontSize: [18],
      practiceTime: "15",
      difficulty: "medium",
      colorBlindMode: false,
      highContrast: false,
    });
    toast({
      title: "설정 초기화",
      description: "모든 설정이 기본값으로 복원되었습니다.",
    });
  };

  const exportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "typing-tutor-settings.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "데이터 내보내기 완료",
      description: "설정 파일이 다운로드되었습니다.",
    });
  };

  const clearData = () => {
    if (
      confirm("모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      localStorage.clear();
      resetSettings();
      toast({
        title: "데이터 삭제 완료",
        description: "모든 사용자 데이터가 삭제되었습니다.",
        variant: "destructive",
      });
    }
  };

  // If not mounted yet, don't render anything to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">설정</h1>
          <p className="text-muted-foreground">
            타이핑 튜터 환경을 개인화하세요
          </p>
        </div>
        <Button variant="outline" onClick={resetSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          초기화
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              외관 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">테마</Label>
              <Select
                value={theme}
                onValueChange={(value) => {
                  if (value !== theme) {
                    toggleTheme();
                  }
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">라이트</SelectItem>
                  <SelectItem value="dark">다크</SelectItem>
                  <SelectItem value="system">시스템</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>폰트 크기: {settings.fontSize[0]}px</Label>
              <Slider
                value={settings.fontSize}
                onValueChange={(value) =>
                  handleSettingChange("fontSize", value)
                }
                max={24}
                min={14}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="colorBlind">색맹 지원 모드</Label>
              <Switch
                id="colorBlind"
                checked={settings.colorBlindMode}
                onCheckedChange={(checked) =>
                  handleSettingChange("colorBlindMode", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="highContrast">고대비 모드</Label>
              <Switch
                id="highContrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) =>
                  handleSettingChange("highContrast", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              사운드 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">사운드 효과</Label>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("soundEnabled", checked)
                }
              />
            </div>

            {settings.soundEnabled && (
              <div className="space-y-2">
                <Label>볼륨: {settings.soundVolume[0]}%</Label>
                <Slider
                  value={settings.soundVolume}
                  onValueChange={(value) =>
                    handleSettingChange("soundVolume", value)
                  }
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">알림</Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("notifications", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              화면 표시 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="showWPM">WPM 표시</Label>
              <Switch
                id="showWPM"
                checked={settings.showWPM}
                onCheckedChange={(checked) =>
                  handleSettingChange("showWPM", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showAccuracy">정확도 표시</Label>
              <Switch
                id="showAccuracy"
                checked={settings.showAccuracy}
                onCheckedChange={(checked) =>
                  handleSettingChange("showAccuracy", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showTimer">타이머 표시</Label>
              <Switch
                id="showTimer"
                checked={settings.showTimer}
                onCheckedChange={(checked) =>
                  handleSettingChange("showTimer", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showKeyboard">가상 키보드</Label>
              <Switch
                id="showKeyboard"
                checked={settings.showKeyboard}
                onCheckedChange={(checked) =>
                  handleSettingChange("showKeyboard", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Practice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              연습 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="difficulty">난이도</Label>
              <Select
                value={settings.difficulty}
                onValueChange={(value) =>
                  handleSettingChange("difficulty", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">쉬움</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="hard">어려움</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="practiceTime">연습 시간 (분)</Label>
              <Select
                value={settings.practiceTime}
                onValueChange={(value) =>
                  handleSettingChange("practiceTime", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5분</SelectItem>
                  <SelectItem value="10">10분</SelectItem>
                  <SelectItem value="15">15분</SelectItem>
                  <SelectItem value="30">30분</SelectItem>
                  <SelectItem value="60">60분</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoNext">자동 다음 지문</Label>
              <Switch
                id="autoNext"
                checked={settings.autoNextText}
                onCheckedChange={(checked) =>
                  handleSettingChange("autoNextText", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            데이터 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              데이터 내보내기
            </Button>

            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              데이터 가져오기
            </Button>

            <Button variant="destructive" onClick={clearData}>
              <Trash2 className="h-4 w-4 mr-2" />
              모든 데이터 삭제
            </Button>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">개인정보 보호</h4>
            <p className="text-sm text-muted-foreground">
              모든 데이터는 브라우저에 로컬로 저장되며, 외부 서버로 전송되지
              않습니다. 언제든지 데이터를 내보내거나 삭제할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>현재 설정 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">테마: {theme}</Badge>
            <Badge variant="secondary">폰트: {settings.fontSize[0]}px</Badge>
            <Badge variant="secondary">난이도: {settings.difficulty}</Badge>
            <Badge variant="secondary">
              연습시간: {settings.practiceTime}분
            </Badge>
            {settings.soundEnabled && (
              <Badge variant="secondary">사운드 ON</Badge>
            )}
            {settings.notifications && (
              <Badge variant="secondary">알림 ON</Badge>
            )}
            {settings.autoNextText && (
              <Badge variant="secondary">자동 진행</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
