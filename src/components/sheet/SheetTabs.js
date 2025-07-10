// components/sheet/SheetTabs.js
"use client";

import React, { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SheetTabs({ currentSheetId }) {
  const router = useRouter();
  const [sheets, setSheets] = useState([
    { id: "1", name: "Sheet1" },
    { id: "2", name: "Sheet2" },
    { id: "3", name: "Sheet3" },
  ]);

  const handleTabClick = (sheetId) => {
    router.push(`/sheet/${sheetId}`);
  };

  const handleAddSheet = () => {
    const newId = (sheets.length + 1).toString();
    const newSheet = { id: newId, name: `Sheet${newId}` };
    setSheets([...sheets, newSheet]);
    router.push(`/sheet/${newId}`);
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-1">
        {/* Sheet Tabs */}
        <div className="flex items-center space-x-1">
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => handleTabClick(sheet.id)}
              className={`
                px-3 py-1 text-sm rounded-t-lg border-b-2 transition-colors
                ${
                  currentSheetId === sheet.id
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                    : "hover:bg-gray-50 border-transparent text-gray-600"
                }
              `}
            >
              {sheet.name}
            </button>
          ))}
        </div>

        {/* Add Sheet Button */}
        <button
          onClick={handleAddSheet}
          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          title="Add sheet"
        >
          <Plus size={16} />
        </button>

        {/* More Options */}
        <button
          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          title="More options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
