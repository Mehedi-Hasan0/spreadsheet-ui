// app/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Download,
  Trash2,
  Edit3,
  Copy,
  Star,
  StarOff,
  Grid3x3,
  Clock,
  SortAsc,
  SortDesc,
  Filter,
  Eye,
  Share2,
} from "lucide-react";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const [sheets, setSheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("lastModified");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = () => {
    const savedSheets = [];
    const favorites = JSON.parse(
      localStorage.getItem("sheet-favorites") || "[]"
    );

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("sheet-data-")) {
        const sheetId = key.replace("sheet-data-", "");
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          const metadata = JSON.parse(
            localStorage.getItem(`sheet-meta-${sheetId}`) || "{}"
          );

          const cellCount = Object.keys(data.cells || {}).filter(
            (cellKey) =>
              data.cells[cellKey]?.value && data.cells[cellKey].value !== ""
          ).length;

          savedSheets.push({
            id: sheetId,
            name: metadata.name || `Sheet ${sheetId}`,
            lastModified: new Date(metadata.lastModified || Date.now()),
            createdAt: new Date(metadata.createdAt || Date.now()),
            cellCount,
            isFavorite: favorites.includes(sheetId),
            description: metadata.description || "",
            tags: metadata.tags || [],
            size: JSON.stringify(data).length, // Approximate size in bytes
            owner: metadata.owner || "You",
            shared: metadata.shared || false,
          });
        } catch (error) {
          console.error(`Error loading sheet ${sheetId}:`, error);
        }
      }
    }

    setSheets(savedSheets);
  };

  const createNewSheet = () => {
    const newId = Date.now().toString();
    const metadata = {
      name: `Untitled Sheet`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      description: "",
      tags: [],
      owner: "You",
      shared: false,
    };

    localStorage.setItem(`sheet-meta-${newId}`, JSON.stringify(metadata));
    router.push(`/sheet/${newId}`);
  };

  const createFromTemplate = (templateType) => {
    const templates = {
      budget: {
        name: "Monthly Budget",
        description: "Personal budget tracker",
        tags: ["finance", "budget"],
      },
      inventory: {
        name: "Inventory Tracker",
        description: "Track your inventory items",
        tags: ["business", "inventory"],
      },
      schedule: {
        name: "Project Schedule",
        description: "Project timeline and tasks",
        tags: ["project", "schedule"],
      },
    };

    const template = templates[templateType];
    if (template) {
      const newId = Date.now().toString();
      const metadata = {
        ...template,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        owner: "You",
        shared: false,
      };

      localStorage.setItem(`sheet-meta-${newId}`, JSON.stringify(metadata));
      router.push(`/sheet/${newId}`);
    }
  };

  const openSheet = (sheetId) => {
    router.push(`/sheet/${sheetId}`);
  };

  const deleteSheet = (sheetId, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this sheet?")) {
      localStorage.removeItem(`sheet-data-${sheetId}`);
      localStorage.removeItem(`sheet-meta-${sheetId}`);

      // Remove from favorites
      const favorites = JSON.parse(
        localStorage.getItem("sheet-favorites") || "[]"
      );
      const updatedFavorites = favorites.filter((id) => id !== sheetId);
      localStorage.setItem("sheet-favorites", JSON.stringify(updatedFavorites));

      loadSheets();
    }
  };

  const duplicateSheet = (sheetId, e) => {
    e.stopPropagation();
    const originalData = localStorage.getItem(`sheet-data-${sheetId}`);
    const originalMeta = localStorage.getItem(`sheet-meta-${sheetId}`);

    if (originalData && originalMeta) {
      const newId = Date.now().toString();
      const metadata = JSON.parse(originalMeta);
      const newMetadata = {
        ...metadata,
        name: `${metadata.name} (Copy)`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      localStorage.setItem(`sheet-data-${newId}`, originalData);
      localStorage.setItem(`sheet-meta-${newId}`, JSON.stringify(newMetadata));
      loadSheets();
    }
  };

  const toggleFavorite = (sheetId, e) => {
    e.stopPropagation();
    const favorites = JSON.parse(
      localStorage.getItem("sheet-favorites") || "[]"
    );

    if (favorites.includes(sheetId)) {
      const updatedFavorites = favorites.filter((id) => id !== sheetId);
      localStorage.setItem("sheet-favorites", JSON.stringify(updatedFavorites));
    } else {
      favorites.push(sheetId);
      localStorage.setItem("sheet-favorites", JSON.stringify(favorites));
    }

    loadSheets();
  };

  const renameSheet = (sheetId, newName, e) => {
    e.stopPropagation();
    const metadata = JSON.parse(
      localStorage.getItem(`sheet-meta-${sheetId}`) || "{}"
    );
    metadata.name = newName;
    metadata.lastModified = new Date().toISOString();
    localStorage.setItem(`sheet-meta-${sheetId}`, JSON.stringify(metadata));
    loadSheets();
  };

  const exportSheet = (sheetId, format, e) => {
    e.stopPropagation();
    const data = localStorage.getItem(`sheet-data-${sheetId}`);
    const metadata = JSON.parse(
      localStorage.getItem(`sheet-meta-${sheetId}`) || "{}"
    );

    if (data) {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${metadata.name || `Sheet-${sheetId}`}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedSheets.length} sheets?`
      )
    ) {
      selectedSheets.forEach((sheetId) => {
        localStorage.removeItem(`sheet-data-${sheetId}`);
        localStorage.removeItem(`sheet-meta-${sheetId}`);
      });
      setSelectedSheets([]);
      setShowBulkActions(false);
      loadSheets();
    }
  };

  const filteredAndSortedSheets = sheets
    .filter((sheet) => {
      const matchesSearch =
        sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "lastModified" || sortBy === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sheets
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sheets.length} spreadsheet{sheets.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />

              <button
                onClick={createNewSheet}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                New Sheet
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Templates
                </button>

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                    <div className="py-1">
                      <button
                        onClick={() => createFromTemplate("budget")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Monthly Budget
                      </button>
                      <button
                        onClick={() => createFromTemplate("inventory")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Inventory Tracker
                      </button>
                      <button
                        onClick={() => createFromTemplate("schedule")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Project Schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              placeholder="Search sheets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Bulk Actions */}
            {selectedSheets.length > 0 && (
              <div className="flex items-center space-x-2 mr-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSheets.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            >
              <option value="lastModified">Last Modified</option>
              <option value="name">Name</option>
              <option value="createdAt">Created</option>
              <option value="size">Size</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              {sortOrder === "asc" ? (
                <SortAsc size={16} />
              ) : (
                <SortDesc size={16} />
              )}
            </button>

            {/* View Mode */}
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <Grid3x3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sheets Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredAndSortedSheets.length === 0 ? (
          <div className="text-center py-12">
            <FileText
              size={48}
              className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No sheets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Create your first spreadsheet to get started."}
            </p>
            <button
              onClick={createNewSheet}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              New Sheet
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-2"
            }
          >
            {filteredAndSortedSheets.map((sheet) => (
              <div
                key={sheet.id}
                onClick={() => openSheet(sheet.id)}
                className={`
                  ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer p-4"
                      : "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer p-4 flex items-center justify-between"
                  }
                `}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                          <FileText
                            size={16}
                            className="text-green-600 dark:text-green-400"
                          />
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(sheet.id, e)}
                          className="text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                        >
                          {sheet.isFavorite ? (
                            <Star
                              size={16}
                              className="text-yellow-500 dark:text-yellow-400"
                              fill="currentColor"
                            />
                          ) : (
                            <StarOff size={16} />
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add dropdown menu logic here
                          }}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {sheet.name}
                      </h3>
                      {sheet.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {sheet.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {formatDate(sheet.lastModified)}
                      </div>
                      <div>{sheet.cellCount} cells</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => duplicateSheet(sheet.id, e)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => exportSheet(sheet.id, "json", e)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => deleteSheet(sheet.id, e)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatFileSize(sheet.size)}
                      </span>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedSheets.includes(sheet.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSheets([...selectedSheets, sheet.id]);
                          } else {
                            setSelectedSheets(
                              selectedSheets.filter((id) => id !== sheet.id)
                            );
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                          <FileText
                            size={16}
                            className="text-green-600 dark:text-green-400"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {sheet.name}
                          </h3>
                          {sheet.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {sheet.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {formatDate(sheet.lastModified)}
                      </div>
                      <div>{sheet.cellCount} cells</div>
                      <div>{formatFileSize(sheet.size)}</div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => toggleFavorite(sheet.id, e)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                        >
                          {sheet.isFavorite ? (
                            <Star
                              size={14}
                              className="text-yellow-500 dark:text-yellow-400"
                              fill="currentColor"
                            />
                          ) : (
                            <StarOff size={14} />
                          )}
                        </button>
                        <button
                          onClick={(e) => duplicateSheet(sheet.id, e)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => exportSheet(sheet.id, "json", e)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => deleteSheet(sheet.id, e)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
