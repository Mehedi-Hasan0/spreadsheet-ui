// components/ui/ThemeToggle.js
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("Current theme:", theme);
  }, [theme]);
  
  if (!mounted) {
    return (
      <button className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        <div className="w-4 h-4" />
      </button>
    );
  }

  const themes = [
    { name: "light", icon: Sun, label: "Light" },
    { name: "dark", icon: Moon, label: "Dark" },
    { name: "system", icon: Monitor, label: "System" },
  ];

  const currentTheme = themes.find((t) => t.name === theme);
  const CurrentIcon = currentTheme?.icon || Sun;


  return (
    <div className="relative">
      <button
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.name === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].name);
        }}
        className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title={`Current theme: ${currentTheme?.label}. Click to cycle themes.`}
      >
        <CurrentIcon size={16} className="text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
}
