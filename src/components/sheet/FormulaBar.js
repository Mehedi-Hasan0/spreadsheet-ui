// components/sheet/FormulaBar.js - Improved version
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const functions = [
    { name: "SUM", syntax: "=SUM(", description: "Sum of values" },
    { name: "AVERAGE", syntax: "=AVERAGE(", description: "Average of values" },
    { name: "MIN", syntax: "=MIN(", description: "Minimum value" },
    { name: "MAX", syntax: "=MAX(", description: "Maximum value" },
    { name: "COUNT", syntax: "=COUNT(", description: "Count of values" },
    { name: "IF", syntax: "=IF(", description: "Conditional function" },
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

  const handleFunctionSelect = useCallback(
    (func) => {
      console.log("Function selected:", func);

      if (!selectedCell) {
        console.error("No cell selected");
        return;
      }

      if (!isGridReady) {
        console.error("Grid is not ready");
        return;
      }

      if (onFormulaSelect) {
        console.log("Calling onFormulaSelect with:", selectedCell, func.syntax);
        onFormulaSelect(selectedCell, func.syntax);
      }

      setShowDropdown(false);
      setIsEditing(true);

      // Focus back to input after formula selection
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.value = func.syntax;
          // Position cursor at the end
          inputRef.current.setSelectionRange(
            func.syntax.length,
            func.syntax.length
          );
        }
      }, 100);
    },
    [selectedCell, isGridReady, onFormulaSelect]
  );

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsEditing(true);
  }, []);

  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (selectedCell && onFormulaCommit) {
          console.log("Committing formula:", selectedCell, inputValue);
          onFormulaCommit(selectedCell, inputValue);
        }
        setIsEditing(false);
        e.target.blur();
      } else if (e.key === "Escape") {
        // Reset to original value
        setInputValue(cellContent || "");
        setIsEditing(false);
        e.target.blur();
      }
    },
    [selectedCell, inputValue, cellContent, onFormulaCommit]
  );

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    if (isEditing && selectedCell && onFormulaCommit) {
      console.log("Committing formula on blur:", selectedCell, inputValue);
      onFormulaCommit(selectedCell, inputValue);
    }
    setIsEditing(false);
  }, [isEditing, selectedCell, inputValue, onFormulaCommit]);

  // Prevent mouse events from causing focus issues
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleButtonClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowDropdown(!showDropdown);
    },
    [showDropdown]
  );

  const handleDropdownClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

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
              type="button"
              onMouseDown={handleMouseDown}
              onClick={handleButtonClick}
              className="flex items-center space-x-1 px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Insert function"
              disabled={!selectedCell || !isGridReady}
            >
              <span>fx</span>
              <ChevronDown size={14} />
            </button>

            {showDropdown && (
              <div
                onMouseDown={handleDropdownClick}
                className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                <div className="py-1">
                  {functions.map((func) => (
                    <button
                      key={func.name}
                      type="button"
                      onMouseDown={handleMouseDown}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFunctionSelect(func);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
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

        {/* Formula Input */}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-1 text-sm bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              selectedCell ? "Enter value or formula" : "Select a cell"
            }
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={!selectedCell}
          />
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {isEditing && <span className="text-blue-500">●</span>}
          {!isGridReady && (
            <span className="text-orange-500">Grid loading...</span>
          )}
          {isGridReady && selectedCell && (
            <span className="text-green-500">Ready</span>
          )}
        </div>
      </div>
    </div>
  );
}
