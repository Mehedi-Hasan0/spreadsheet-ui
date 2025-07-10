// components/sheet/FileMenu.js
"use client";

import React from "react";
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Share,
  Settings,
} from "lucide-react";

export default function FileMenu({ onClose }) {
  const handleMenuClick = (action) => {
    console.log(`File action: ${action}`);
    // Add your file handling logic here
    onClose();
  };

  const menuItems = [
    {
      icon: FileText,
      label: "New",
      shortcut: "Ctrl+N",
      action: "new",
    },
    {
      icon: FolderOpen,
      label: "Open",
      shortcut: "Ctrl+O",
      action: "open",
    },
    {
      icon: Save,
      label: "Save",
      shortcut: "Ctrl+S",
      action: "save",
    },
    {
      icon: Copy,
      label: "Make a copy",
      action: "copy",
    },
    { type: "divider" },
    {
      icon: Download,
      label: "Download as Excel",
      action: "download-excel",
    },
    {
      icon: Download,
      label: "Download as CSV",
      action: "download-csv",
    },
    {
      icon: Upload,
      label: "Import",
      action: "import",
    },
    { type: "divider" },
    {
      icon: Share,
      label: "Share",
      action: "share",
    },
    {
      icon: Settings,
      label: "Settings",
      action: "settings",
    },
    { type: "divider" },
    {
      icon: Trash2,
      label: "Delete",
      action: "delete",
      className: "text-red-600 hover:bg-red-50",
    },
  ];

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
      <div className="py-2">
        {menuItems.map((item, index) => {
          if (item.type === "divider") {
            return (
              <div key={index} className="border-t border-gray-200 my-2"></div>
            );
          }

          const Icon = item.icon;

          return (
            <button
              key={index}
              onClick={() => handleMenuClick(item.action)}
              className={`
                w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between
                ${item.className || "text-gray-700"}
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-xs text-gray-400">{item.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
