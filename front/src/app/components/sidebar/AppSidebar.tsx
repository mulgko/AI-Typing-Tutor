"use client";

import { useState } from "react";
import {
  Keyboard,
  BarChart3,
  Settings,
  Trophy,
  Brain,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { useTheme } from "../../contexts/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    title: "타이핑 테스트",
    url: "/",
    icon: Keyboard,
  },
  {
    title: "대시보드",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "성과 분석",
    url: "/analytics",
    icon: Trophy,
  },
  {
    title: "AI 추천",
    url: "/recommendations",
    icon: Brain,
  },
  {
    title: "설정",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user] = useState({
    name: "김타이핑",
    email: "typing@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  });

  const handleToggleTheme = () => {
    toggleTheme();
    toast({
      title: `${theme === "light" ? "다크" : "라이트"} 모드로 변경되었습니다`,
      description: "화면 테마가 변경되었습니다.",
    });
  };

  return (
    <div className="flex flex-col w-64 h-screen bg-background border-r border-border">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Keyboard className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-foreground">
              AI 타이핑 튜터
            </div>
            <div className="text-xs text-muted-foreground">개인화 학습</div>
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            메뉴
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
              김
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-md shadow-lg py-1">
              <button
                onClick={() => {
                  handleToggleTheme();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {theme === "dark" ? "라이트 모드" : "다크 모드"}
              </button>
              <Link
                href="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Settings className="h-4 w-4" />
                설정
              </Link>
              <div className="border-t border-border my-1"></div>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
