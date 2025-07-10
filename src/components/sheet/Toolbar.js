// components/sheet/Toolbar.js
"use client";

import React from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
  Percent,
  DollarSign,
  Hash,
} from "lucide-react";

export default function Toolbar() {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center space-x-1">
        {/* Font and Size */}
        <select className="px-2 py-1 text-sm border border-gray-300 rounded bg-white">
          <option>Arial</option>
          <option>Helvetica</option>
          <option>Times New Roman</option>
          <option>Courier New</option>
        </select>

        <select className="px-2 py-1 text-sm border border-gray-300 rounded bg-white ml-2">
          <option>10</option>
          <option>11</option>
          <option>12</option>
          <option>14</option>
          <option>16</option>
          <option>18</option>
          <option>20</option>
          <option>24</option>
        </select>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Formatting */}
        <button className="p-1 hover:bg-gray-100 rounded">
          <Bold size={16} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Italic size={16} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Underline size={16} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Text Color */}
        <button className="p-1 hover:bg-gray-100 rounded flex items-center">
          <Type size={16} />
          <div className="w-4 h-1 bg-black ml-1"></div>
        </button>

        {/* Fill Color */}
        <button className="p-1 hover:bg-gray-100 rounded">
          <Palette size={16} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Alignment */}
        <button className="p-1 hover:bg-gray-100 rounded">
          <AlignLeft size={16} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <AlignCenter size={16} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <AlignRight size={16} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Number Formatting */}
        <button className="p-1 hover:bg-gray-100 rounded" title="Number">
          <Hash size={16} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Currency">
          <DollarSign size={16} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Percentage">
          <Percent size={16} />
        </button>
      </div>
    </div>
  );
}
