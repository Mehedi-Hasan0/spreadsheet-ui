// app/sheet/[sheetId]/page.js
"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RevoGrid } from "@revolist/react-datagrid";
import { updateCellFromInput } from "@/redux/slice/sheetSlice";
import { usePersistentStorage } from "@/hooks/usePersistentStorage";
import { useFormulaCalculation } from "@/hooks/useFormulaCalculation";
import Toolbar from "@/components/sheet/Toolbar";
import FormulaBar from "@/components/sheet/FormulaBar";
import FileMenu from "@/components/sheet/FileMenu";
import SheetTabs from "@/components/sheet/SheetTabs";

// Simple selectors to format data for RevoGrid
const selectGridRows = (state) => {
  const rows = [];
  for (let r = 0; r < 25; r++) {
    // Increased rows for better experience
    const rowData = {};
    for (let c = 0; c < 26; c++) {
      const colName = String.fromCharCode(65 + c);
      rowData[colName] = state.sheet.cells[`${colName}${r + 1}`]?.display || "";
    }
    rows.push(rowData);
  }
  return rows;
};

const selectGridColumns = () => {
  const columns = [];
  for (let c = 0; c < 26; c++) {
    const colName = String.fromCharCode(65 + c);
    columns.push({
      prop: colName,
      name: colName,
      size: 100,
      sortable: false,
      cellTemplate: (h, { model }) => {
        return h(
          "div",
          {
            style: {
              padding: "4px 8px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              fontSize: "13px",
              fontFamily: "arial, sans-serif",
            },
          },
          model[colName]
        );
      },
    });
  }
  return columns;
};

export default function SheetPage({ params }) {
  const dispatch = useDispatch();
  const rows = useSelector(selectGridRows);
  const columns = selectGridColumns();
  const cells = useSelector((state) => state.sheet.cells);

  const [selectedCell, setSelectedCell] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(false);

  // Activate our custom hooks
  usePersistentStorage(params.sheetId);
  useFormulaCalculation();

  const handleAfterEdit = (e) => {
    const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
    const inputValue = e.detail.val;
    dispatch(updateCellFromInput({ address, inputValue }));
  };

  const handleCellClick = (e) => {
    const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
    setSelectedCell(address);
  };

  const handleFormulaBarChange = (value) => {
    if (selectedCell) {
      dispatch(
        updateCellFromInput({ address: selectedCell, inputValue: value })
      );
    }
  };

  const getCurrentCellValue = () => {
    if (!selectedCell) return "";
    const cell = cells[selectedCell];
    return cell?.formula || cell?.value || "";
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-medium text-gray-800">
                Sheet {params.sheetId}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              File
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              Edit
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              View
            </button>
          </div>
        </div>

        {/* File Menu */}
        {showFileMenu && <FileMenu onClose={() => setShowFileMenu(false)} />}

        {/* Toolbar */}
        <Toolbar />

        {/* Formula Bar */}
        <FormulaBar
          selectedCell={selectedCell}
          value={getCurrentCellValue()}
          onChange={handleFormulaBarChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Grid Container */}
        <div className="flex-1 bg-white">
          <RevoGrid
            theme="material"
            source={rows}
            columns={columns}
            onAfterEdit={handleAfterEdit}
            onCellClick={handleCellClick}
            range={true}
            rowHeaders={true}
            columnHeaders={true}
            style={{
              "--revogrid-border-color": "#e0e0e0",
              "--revogrid-header-background": "#f8f9fa",
              "--revogrid-header-text-color": "#5f6368",
              "--revogrid-cell-background": "#ffffff",
              "--revogrid-cell-text-color": "#202124",
              "--revogrid-selection-border-color": "#1a73e8",
              "--revogrid-selection-background": "rgba(26, 115, 232, 0.1)",
              height: "100%",
              fontFamily: "arial, sans-serif",
              fontSize: "13px",
            }}
          />
        </div>

        {/* Sheet Tabs */}
        <SheetTabs currentSheetId={params.sheetId} />
      </div>
    </div>
  );
}
