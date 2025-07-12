// components/sheet/ChartDropdown.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

const ChartDropdown = ({ onChartSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const chartOptions = [
    {
      id: "bar",
      name: "Bar Chart",
      icon: BarChart3,
      description: "Compare data across categories",
    },
    {
      id: "line",
      name: "Line Chart",
      icon: LineChart,
      description: "Show trends over time",
    },
    {
      id: "pie",
      name: "Pie Chart",
      icon: PieChart,
      description: "Show proportions of a whole",
    },
    {
      id: "area",
      name: "Area Chart",
      icon: TrendingUp,
      description: "Show trends with filled areas",
    },
  ];

  const handleChartClick = (chartType) => {
    if (onChartSelect) {
      onChartSelect(chartType);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Chart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        title="Insert Chart"
      >
        <BarChart3 size={16} />
        <span>Chart</span>
        <ChevronDown
          size={14}
          className={`transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              Chart Types
            </div>
            {chartOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleChartClick(option.id)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {option.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartDropdown;
