// components/sheet/FormulaBar.js
"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function FormulaBar({ selectedCell, value, onChange }) {
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = () => {
    onChange(inputValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center space-x-2">
        {/* Cell Reference */}
        <div className="flex items-center space-x-2">
          <div className="w-16 px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded text-center font-medium">
            {selectedCell || "A1"}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded text-red-500"
                title="Cancel"
              >
                <XCircle size={16} />
              </button>
              <button
                onClick={handleSubmit}
                className="p-1 hover:bg-gray-100 rounded text-green-500"
                title="Confirm"
              >
                <CheckCircle size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Formula Input */}
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsEditing(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsEditing(true)}
            placeholder="Enter formula or value..."
            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: "13px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
