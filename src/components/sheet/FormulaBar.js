// components/sheet/FormulaBar.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function FormulaBar({
  selectedCell,
  cellContent,
  onFormulaSelect,
  onFormulaCommit,
  isGridReady,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  const functions = [
    { name: "SUM", syntax: "=SUM(", description: "Sum of values" },
    { name: "AVERAGE", syntax: "=AVERAGE(", description: "Average of values" },
    { name: "MIN", syntax: "=MIN(", description: "Minimum value" },
    { name: "MAX", syntax: "=MAX(", description: "Maximum value" },
  ];

  useEffect(() => {
    setInputValue(cellContent || "");
  }, [cellContent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFunctionSelect = (func) => {
    if (selectedCell && onFormulaSelect) {
      onFormulaSelect(selectedCell, func.syntax);
      setShowDropdown(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      if (selectedCell && onFormulaCommit) {
        onFormulaCommit(selectedCell, inputValue);
      }
      e.target.blur();
    }
  };

  // --- THE FIX ---
  // This handler prevents the button from stealing focus from the grid.
  const handleMouseDown = (e) => {
    e.preventDefault();
  };
  // --- END OF FIX ---

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center space-x-2">
        {/* Cell Reference */}
        <div className="flex items-center space-x-2">
          <div className="w-16 px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded text-center font-medium">
            {selectedCell || "A1"}
          </div>

          {/* Function Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onMouseDown={handleMouseDown} // <-- APPLY THE FIX HERE
              onMouseUp={handleMouseDown}
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-1 px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              title="Insert function"
              disabled={!selectedCell || !isGridReady}
            >
              <span>fx</span>
              <ChevronDown size={14} />
            </button>
            {showDropdown && (
              <div
                onMouseDown={handleMouseDown} // <-- APPLY THE FIX HERE
                onMouseUp={handleMouseDown}
                className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-50"
              >
                <div className="py-1">
                  {functions.map((func) => (
                    <button
                      key={func.name}
                      onMouseDown={handleMouseDown} // <-- AND APPLY THE FIX HERE
                      onClick={() => handleFunctionSelect(func)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-800">
                        {func.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {func.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formula Display Area - Now a controlled input */}
        <div className="flex-1">
          <input
            type="text"
            className="w-full px-3 py-1 text-sm bg-white border border-gray-300 rounded font-mono"
            placeholder={
              selectedCell ? "Enter value or formula" : "Select a cell"
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={!selectedCell}
          />
        </div>
      </div>
    </div>
  );
}
