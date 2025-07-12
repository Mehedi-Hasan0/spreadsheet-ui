// components/sheet/ChartOverlay.js
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Move, RotateCcw } from "lucide-react";

const ChartOverlay = ({
  chart,
  onClose,
  onMove,
  onResize,
  onUpdatePosition,
}) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const dragRef = useRef(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({
    top: chart.position?.top || 100,
    left: chart.position?.left || 100,
  });

  // Get RevoGrid container bounds
  const getGridBounds = useCallback(() => {
    // Find the RevoGrid container
    const gridContainer = document.querySelector("revo-grid");
    if (gridContainer) {
      const rect = gridContainer.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    }

    // Fallback to a reasonable default if grid not found
    return {
      top: 100,
      left: 0,
      right: window.innerWidth - 100,
      bottom: window.innerHeight - 100,
      width: window.innerWidth - 100,
      height: window.innerHeight - 200,
    };
  }, []);

  // Constrain position within grid bounds
  const constrainPosition = useCallback(
    (newPosition, chartSize) => {
      const bounds = getGridBounds();
      const chartWidth = chartSize?.width || chart.size?.width || 400;
      const chartHeight = chartSize?.height || chart.size?.height || 300;

      const constrainedPosition = {
        top: Math.max(
          0,
          Math.min(newPosition.top, bounds.height - chartHeight)
        ),
        left: Math.max(
          0,
          Math.min(newPosition.left, bounds.width - chartWidth)
        ),
      };

      return constrainedPosition;
    },
    [chart.size, getGridBounds]
  );

  // Handle mouse down on drag handle
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest(".chart-drag-handle")) {
      const rect = overlayRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      e.preventDefault();
    }
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const bounds = getGridBounds();
      const newPosition = {
        top: e.clientY - bounds.top - dragStart.y,
        left: e.clientX - bounds.left - dragStart.x,
      };

      const constrainedPosition = constrainPosition(newPosition, chart.size);
      setPosition(constrainedPosition);

      e.preventDefault();
    },
    [isDragging, dragStart, constrainPosition, chart.size, getGridBounds]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // Notify parent component of position change
      if (onUpdatePosition) {
        onUpdatePosition(chart.id, position);
      }
    }
  }, [isDragging, position, chart.id, onUpdatePosition]);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Initialize chart
  useEffect(() => {
    if (!canvasRef.current) return;

    const initChart = async () => {
      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);

      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create new chart
      chartInstanceRef.current = new Chart(canvasRef.current, {
        type: chart.type,
        data: chart.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: chart.title || "Sample Chart",
            },
          },
          scales:
            chart.type !== "pie"
              ? {
                  y: {
                    beginAtZero: true,
                  },
                }
              : {},
        },
      });
    };

    initChart();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chart]);

  // Update position when chart prop changes
  useEffect(() => {
    if (chart.position) {
      setPosition({
        top: chart.position.top,
        left: chart.position.left,
      });
    }
  }, [chart.position]);

  return (
    <div
      ref={overlayRef}
      className="absolute bg-white border border-gray-300 rounded-lg shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        width: chart.size?.width || 400,
        height: chart.size?.height || 300,
        zIndex: 1000,
        minWidth: 300,
        minHeight: 200,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Chart Header with Drag Handle */}
      <div className="chart-drag-handle flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-grab hover:bg-gray-100 active:cursor-grabbing">
        <div className="flex items-center gap-2 pointer-events-none">
          <Move size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {chart.title || "Chart"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded pointer-events-auto"
          title="Close Chart"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Chart Content */}
      <div className="p-4" style={{ height: "calc(100% - 50px)" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Resize Handle */}
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-300 cursor-se-resize opacity-50 hover:opacity-100">
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default ChartOverlay;
