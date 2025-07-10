// redux/slice/sheetSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Define initial state for a 25x26 grid (increased from 5x26)
const initialCells = {};
for (let r = 0; r < 25; r++) {
  for (let c = 0; c < 26; c++) {
    const col = String.fromCharCode(65 + c);
    initialCells[`${col}${r + 1}`] = {
      value: "",
      formula: null,
      display: "",
      format: {
        bold: false,
        italic: false,
        underline: false,
        textColor: "#000000",
        backgroundColor: "#ffffff",
        fontSize: 13,
        fontFamily: "arial",
        alignment: "left",
        numberFormat: "general",
      },
    };
  }
}

const initialState = {
  cells: initialCells,
  selectedCell: null,
  selectedRange: null,
  sheets: [
    { id: "1", name: "Sheet1", active: true },
    { id: "2", name: "Sheet2", active: false },
    { id: "3", name: "Sheet3", active: false },
  ],
  activeSheetId: "1",
};

const sheetSlice = createSlice({
  name: "sheet",
  initialState,
  reducers: {
    // Main action for updating cells from user input
    updateCellFromInput: (state, action) => {
      const { address, inputValue } = action.payload;
      const cell = state.cells[address];

      if (!cell) return;

      // Determine if it's a formula or a direct value
      if (inputValue.startsWith("=")) {
        cell.formula = inputValue;
        // The value/display will be updated by the calculation step
      } else {
        cell.formula = null;
        // Attempt to convert to a number, otherwise keep as string
        const numValue = parseFloat(inputValue);
        cell.value = isNaN(numValue) ? inputValue : numValue;
        cell.display = String(cell.value);
      }
    },

    // Apply calculated formula results
    applyCalculations: (state, action) => {
      const updates = action.payload;
      for (const address in updates) {
        if (state.cells[address]) {
          state.cells[address].value = updates[address].value;
          state.cells[address].display = updates[address].display;
        }
      }
    },

    // Load sheet state from storage
    loadSheetState: (state, action) => {
      const loadedState = action.payload;
      state.cells = { ...state.cells, ...loadedState.cells };
      if (loadedState.sheets) {
        state.sheets = loadedState.sheets;
      }
      if (loadedState.activeSheetId) {
        state.activeSheetId = loadedState.activeSheetId;
      }
    },

    // Update cell formatting
    updateCellFormat: (state, action) => {
      const { address, format } = action.payload;
      if (state.cells[address]) {
        state.cells[address].format = {
          ...state.cells[address].format,
          ...format,
        };
      }
    },

    // Update multiple cells formatting (for range selection)
    updateRangeFormat: (state, action) => {
      const { addresses, format } = action.payload;
      addresses.forEach((address) => {
        if (state.cells[address]) {
          state.cells[address].format = {
            ...state.cells[address].format,
            ...format,
          };
        }
      });
    },

    // Set selected cell
    setSelectedCell: (state, action) => {
      state.selectedCell = action.payload;
    },

    // Set selected range
    setSelectedRange: (state, action) => {
      state.selectedRange = action.payload;
    },

    // Add new sheet
    addSheet: (state, action) => {
      const { id, name } = action.payload;
      state.sheets.push({
        id,
        name,
        active: false,
      });
    },

    // Set active sheet
    setActiveSheet: (state, action) => {
      const sheetId = action.payload;
      state.sheets.forEach((sheet) => {
        sheet.active = sheet.id === sheetId;
      });
      state.activeSheetId = sheetId;
    },

    // Rename sheet
    renameSheet: (state, action) => {
      const { id, name } = action.payload;
      const sheet = state.sheets.find((s) => s.id === id);
      if (sheet) {
        sheet.name = name;
      }
    },

    // Delete sheet
    deleteSheet: (state, action) => {
      const sheetId = action.payload;
      state.sheets = state.sheets.filter((s) => s.id !== sheetId);

      // If the active sheet was deleted, set the first sheet as active
      if (state.activeSheetId === sheetId && state.sheets.length > 0) {
        state.activeSheetId = state.sheets[0].id;
        state.sheets[0].active = true;
      }
    },

    // Clear sheet data
    clearSheet: (state) => {
      Object.keys(state.cells).forEach((address) => {
        state.cells[address] = {
          value: "",
          formula: null,
          display: "",
          format: {
            bold: false,
            italic: false,
            underline: false,
            textColor: "#000000",
            backgroundColor: "#ffffff",
            fontSize: 13,
            fontFamily: "arial",
            alignment: "left",
            numberFormat: "general",
          },
        };
      });
    },
  },
});

export const {
  updateCellFromInput,
  applyCalculations,
  loadSheetState,
  updateCellFormat,
  updateRangeFormat,
  setSelectedCell,
  setSelectedRange,
  addSheet,
  setActiveSheet,
  renameSheet,
  deleteSheet,
  clearSheet,
} = sheetSlice.actions;

export default sheetSlice.reducer;
