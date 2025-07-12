// app/sheet/[sheetId]/page.js
"use client";

import React, { useState, useEffect, use, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RevoGrid } from "@revolist/react-datagrid";
import { updateAndRecalculate } from "@/redux/slice/sheetSlice";
import { usePersistentStorage } from "@/hooks/usePersistentStorage";
import { useFormulaCalculation } from "@/hooks/useFormulaCalculation";
import Toolbar from "@/components/sheet/Toolbar";
import FormulaBar from "@/components/sheet/FormulaBar";
import FileMenu from "@/components/sheet/FileMenu";
import SheetTabs from "@/components/sheet/SheetTabs";
import ChartOverlay from "@/components/sheet/ChartOverlay";
import { formulaService } from "@/lib/formulaService";

// Selectors remain the same...
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

  const [selectedCell, setSelectedCell] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [sheetId, setSheetId] = useState(null);
  const [isGridReady, setIsGridReady] = useState(false);

  // Chart state
  const [charts, setCharts] = useState([]);

  const gridRef = useRef(null);
  const gridContainerRef = useRef(null);
  const initialSetupDone = useRef(false);
  const useParams = use(params);

  useEffect(() => {
    if (useParams?.sheetId) {
      setSheetId(useParams?.sheetId);
    }
  }, [useParams?.sheetId]);

  const storageHook = usePersistentStorage(sheetId);

  useEffect(() => {
    if (storageHook?.isLoaded && sheetId) {
      console.log("Storage loaded for sheet:", sheetId);
    }
  }, [storageHook?.isLoaded, sheetId]);

  useEffect(() => {
    if (rows.length > 0 && !initialSetupDone.current) {
      const gridData = rows.map((row) =>
        columns.map((col) => row[col.prop] || "")
      );

      formulaService.initialize(gridData);
      initialSetupDone.current = true;
      setIsGridReady(true);
    }
  }, [rows, columns]);

  // Create default chart data
  const createDefaultChartData = (chartType) => {
    const defaultData = {
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          label: "Sample Data",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    return defaultData;
  };

  // Handle chart creation
  const handleChartCreate = useCallback(
    (chartType) => {
      const newChart = {
        id: Date.now(),
        type: chartType,
        title: `${
          chartType.charAt(0).toUpperCase() + chartType.slice(1)
        } Chart`,
        data: createDefaultChartData(chartType),
        position: {
          top: 50 + charts.length * 30, // Offset each new chart
          left: 50 + charts.length * 30,
        },
        size: {
          width: 400,
          height: 300,
        },
      };

      setCharts((prevCharts) => [...prevCharts, newChart]);
      console.log(`Created ${chartType} chart`);
    },
    [charts.length]
  );

  // Handle chart position update
  const handleChartPositionUpdate = useCallback((chartId, newPosition) => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.id === chartId ? { ...chart, position: newPosition } : chart
      )
    );
  }, []);

  // Handle chart close
  const handleChartClose = useCallback((chartId) => {
    setCharts((prevCharts) =>
      prevCharts.filter((chart) => chart.id !== chartId)
    );
  }, []);

  // Existing event handlers remain the same...
  const handleAfterEdit = useCallback(
    (e) => {
      const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
      const inputValue = e.detail.val;
      dispatch(updateAndRecalculate({ address, inputValue }));
    },
    [dispatch]
  );

  const handleBeforeEdit = useCallback((e) => {
    //
  }, []);

  const handleCellFocus = useCallback((e) => {
    if (e.detail && e.detail.prop && e.detail.rowIndex !== undefined) {
      const address = `${e.detail.prop}${e.detail.rowIndex + 1}`;
      setSelectedCell(address);
    }
  }, []);

  const handleFormulaSelect = useCallback(
    (cellAddress, formula) => {
      if (!isGridReady || !gridRef.current?.nativeElement) {
        console.error(
          "Grid is not ready or its reference is not available to start editing."
        );
        return;
      }

      const match = cellAddress.match(/([A-Z]+)(\d+)/);
      if (!match) return;

      const prop = match[1];
      const rowIndex = parseInt(match[2], 10) - 1;

      gridRef.current.nativeElement.setEdit(rowIndex, prop, formula);
    },
    [isGridReady]
  );

  const handleFormulaCommit = useCallback(
    (address, value) => {
      if (address) {
        dispatch(updateAndRecalculate({ address, inputValue: value }));
      }
    },
    [dispatch]
  );

  const handleSave = useCallback(() => {
    if (storageHook?.saveNow) {
      storageHook.saveNow();
    }
  }, [storageHook]);

  const handleGridReady = useCallback(() => {
    if (initialSetupDone.current) {
      return;
    }
    console.log("Grid is now ready (onAfterrender fired).");
    setIsGridReady(true);

    if (!selectedCell) {
      setSelectedCell("A1");
    }
    initialSetupDone.current = true;
  }, [selectedCell]);

  const selectedCellContent = cells[selectedCell]?.value || "";

  // Loading states
  if (sheetId && !storageHook?.isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading sheet...</p>
        </div>
      </div>
    );
  }

  if (!sheetId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid sheet ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
            >
              File
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
            >
              Save
            </button>
          </div>

          {showFileMenu && (
            <FileMenu
              onClose={() => setShowFileMenu(false)}
              onSave={handleSave}
              sheetId={sheetId}
            />
          )}
        </div>

        <Toolbar onChartCreate={handleChartCreate} />
        <FormulaBar
          selectedCell={selectedCell}
          cellContent={selectedCellContent}
          onFormulaSelect={handleFormulaSelect}
          onFormulaCommit={handleFormulaCommit}
          isGridReady={isGridReady}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div
          ref={gridContainerRef}
          className="flex-1 bg-white relative overflow-hidden"
        >
          <RevoGrid
            ref={gridRef}
            theme="material"
            source={rows}
            columns={columns}
            onAfteredit={handleAfterEdit}
            onBeforeedit={handleBeforeEdit}
            onBeforecellfocus={handleCellFocus}
            onAfterrender={handleGridReady}
            range={true}
            rowHeaders={true}
            columnHeaders={true}
            style={{
              height: "100%",
            }}
          />

          {/* Chart Overlays */}
          {charts.map((chart) => (
            <ChartOverlay
              key={chart.id}
              chart={chart}
              onClose={() => handleChartClose(chart.id)}
              onUpdatePosition={handleChartPositionUpdate}
            />
          ))}
        </div>

        <SheetTabs currentSheetId={sheetId} />
      </div>
    </div>
  );
}
