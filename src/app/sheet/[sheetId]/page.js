// app/sheet/[sheetId]/page.js
"use client";

import React, { useState, useEffect, use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RevoGrid } from "@revolist/react-datagrid";
import { updateAndRecalculate } from "@/redux/slice/sheetSlice";
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
    });
  }
  return columns;
};

export default function SheetPage({ params }) {
  const dispatch = useDispatch();
  const rows = useSelector(selectGridRows);
  const columns = selectGridColumns();
  const cells = useSelector((state) => state.sheet.cells);
  const isLoading = useSelector((state) => state.sheet.isLoading);

  const [selectedCell, setSelectedCell] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [sheetId, setSheetId] = useState(null);
  // Added state for tracking editing cell and pending value
  const [currentEditingCell, setCurrentEditingCell] = useState(null);
  const [pendingEditValue, setPendingEditValue] = useState(null);

  const useParams = use(params);

  // Fix: Use useEffect to handle sheetId from params
  useEffect(() => {
    if (useParams?.sheetId) {
      setSheetId(useParams?.sheetId);
    }
  }, [useParams?.sheetId]);

  const storageHook = usePersistentStorage(sheetId);
  // useFormulaCalculation();

  useEffect(() => {
    if (storageHook?.isLoaded && sheetId) {
      console.log("Storage loaded for sheet:", sheetId);
      console.log("Current cells:", Object.keys(cells).length);

      const sampleCells = Object.entries(cells)
        .filter(([, cell]) => cell.value !== "")
        .slice(0, 5);
      console.log("Sample cells with data:", sampleCells);
    }
  }, [storageHook?.isLoaded, sheetId, cells]);

  const handleAfterEdit = (e) => {
    console.log("afteredit event triggered:", e);
    const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
    const inputValue = e.detail.val;
    console.log(`After edit cell ${address} with value:`, inputValue);
    dispatch(updateAndRecalculate({ address, inputValue }));
    // Clear editing state after saving
    setCurrentEditingCell(null);
    setPendingEditValue(null);
  };

  const handleBeforeEdit = (e) => {
    console.log("beforeedit event triggered:", e);
    const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
    const currentValue = e.detail.val;
    console.log(
      `Before edit cell ${address} with current value:`,
      currentValue
    );
  };

  const handleBeforeEditStart = (e) => {
    console.log("beforeeditstart event triggered:", e);
    const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
    console.log(`Edit started for cell ${address}`);
    setCurrentEditingCell(address);
    setPendingEditValue(e.detail.val);
  };

  const handleBeforeCellFocus = (e) => {
    console.log("beforecellfocus event triggered:", e);
    const newAddress = `${e.detail.prop}${e.detail.rowIndex + 1}`;
    setSelectedCell(newAddress);

    // If we have a cell being edited and we're moving to a different cell
    if (
      currentEditingCell &&
      pendingEditValue !== null &&
      newAddress !== currentEditingCell
    ) {
      console.log(
        `Auto-saving cell ${currentEditingCell} with value:`,
        pendingEditValue
      );
      dispatch(
        updateAndRecalculate({
          address: currentEditingCell,
          inputValue: pendingEditValue,
        })
      );
      // Clear editing state
      setCurrentEditingCell(null);
      setPendingEditValue(null);
    }
  };

  const handleCellEditInit = (e) => {
    console.log("celleditinit event triggered:", e);
    const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
    console.log(`Cell edit init for ${address}`);
    setCurrentEditingCell(address);
    setPendingEditValue(e.detail.val);
  };

  const handleCellEditApply = (e) => {
    console.log("celleditapply event triggered:", e);
    const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
    console.log(`Cell edit apply for ${address} with value:`, e.detail.val);
    // Update the pending value as user types
    setPendingEditValue(e.detail.val);
  };

  const handleCloseEdit = (e) => {
    console.log("closeedit event triggered:", e);
    // If we have pending changes, save them
    if (currentEditingCell && pendingEditValue !== null) {
      console.log(
        `Auto-saving on close edit for cell ${currentEditingCell} with value:`,
        pendingEditValue
      );
      dispatch(
        updateAndRecalculate({
          address: currentEditingCell,
          inputValue: pendingEditValue,
        })
      );
    }
    // Clear editing state
    setCurrentEditingCell(null);
    setPendingEditValue(null);
  };

  const handleFormulaBarChange = (value) => {
    console.log("Formula bar change:", value);
    if (selectedCell) {
      console.log(`Updating ${selectedCell} via formula bar:`, value);
      dispatch(
        updateAndRecalculate({ address: selectedCell, inputValue: value })
      );
    }
  };

  const getCurrentCellValue = () => {
    if (!selectedCell) return "";
    const cell = cells[selectedCell];
    return cell?.formula || cell?.value || "";
  };

  const handleSave = () => {
    if (storageHook?.saveNow) {
      console.log("Manual save triggered");
      storageHook.saveNow();
    }
  };

  if (sheetId && !storageHook?.isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sheet {sheetId}...</p>
          {storageHook?.loadingError && (
            <p className="text-red-500 mt-2">
              Error: {storageHook.loadingError}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!sheetId) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600">Error: No sheet ID provided</p>
        </div>
      </div>
    );
  }

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
                Sheet {sheetId}
              </h1>
              {storageHook?.isLoaded && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  Loaded
                </span>
              )}
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
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded"
            >
              Save
            </button>
          </div>
        </div>

        {showFileMenu && <FileMenu onClose={() => setShowFileMenu(false)} />}
        <Toolbar />
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
            onAfteredit={handleAfterEdit}
            onBeforeedit={handleBeforeEdit}
            onBeforeeditstart={handleBeforeEditStart}
            onBeforecellfocus={handleBeforeCellFocus}
            onCelleditinit={handleCellEditInit}
            onCelleditapply={handleCellEditApply}
            onCloseedit={handleCloseEdit}
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
              "--revogrid-cell-padding": "4px 8px",
              height: "100%",
              fontFamily: "arial, sans-serif",
              fontSize: "13px",
            }}
          />
        </div>

        {/* Sheet Tabs */}
        <SheetTabs currentSheetId={sheetId} />
      </div>
    </div>
  );
}
