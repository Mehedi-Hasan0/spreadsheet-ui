"use client";

import { HyperFormula } from "hyperformula";

class FormulaService {
  constructor() {
    this.hf = null;
    this.sheetId = "Sheet1";
  }

  initialize(gridData) {
    this.hf = HyperFormula.buildFromArray(gridData, {
      licenseKey: "gpl-v3",
    });
  }

  async registerFormula(address, formula) {
    if (!this.hf) return;

    const { row, col } = this.addressToIndex(address);

    try {
      if (formula && formula.startsWith("=")) {
        this.hf.setCellContents({ sheet: 0, row, col }, [[formula]]);
      } else {
        this.hf.setCellContents({ sheet: 0, row, col }, [[formula || ""]]);
      }
    } catch (error) {
      console.error("HyperFormula error:", error);
    }
  }

  async calculate(address, formula, allCells) {
    if (!this.hf) return { value: "", display: "" };

    const { row, col } = this.addressToIndex(address);

    try {
      if (formula && formula.startsWith("=")) {
        this.hf.setCellContents({ sheet: 0, row, col }, [[formula]]);
      }

      const value = this.hf.getCellValue({ sheet: 0, row, col });
      return {
        value,
        display: value !== null ? String(value) : "",
      };
    } catch (error) {
      console.error("HyperFormula calculation error:", error);
      return { value: "#ERROR!", display: "#ERROR!" };
    }
  }

  getDependents(changedAddress) {
    if (!this.hf) return [];

    const { row, col } = this.addressToIndex(changedAddress);
    const dependents = new Set();
    const vertex = this.hf.addressMapping.getCell({ sheet: 0, row, col });

    if (vertex) {
      this.hf.graph.getDependentsOf(vertex).forEach((dep) => {
        const address = this.indexToAddress(dep.row, dep.col);
        dependents.add(address);
      });
    }

    return Array.from(dependents);
  }

  addressToIndex(address) {
    const match = address.match(/([A-Z]+)(\d+)/);
    if (!match) return { row: 0, col: 0 };

    const colStr = match[1];
    const row = parseInt(match[2], 10) - 1;

    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 65);
    }

    return { row, col };
  }

  indexToAddress(row, col) {
    let colStr = "";
    let c = col;

    while (c >= 0) {
      colStr = String.fromCharCode(65 + (c % 26)) + colStr;
      c = Math.floor(c / 26) - 1;
    }

    return `${colStr}${row + 1}`;
  }
}

export const formulaService = new FormulaService();
