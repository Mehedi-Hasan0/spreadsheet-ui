// lib/formulaService.js

import FormulaParser from "fast-formula-parser";

/**
 * A service class to handle all spreadsheet formula logic.
 * It manages the dependency graph and uses fast-formula-parser for calculations.
 *
 * This service is designed as a singleton instance.
 */
class FormulaService {
  constructor() {
    // Create a new instance of FormulaParser directly
    this.parser = new FormulaParser();

    /**
     * The core dependency graph.
     * Maps a cell address to a list of other cells that depend on it.
     * Example: { A1: ['C1', 'D1'], B1: ['C1'] }
     * This means: "When A1's value changes, C1 and D1 must be recalculated."
     * This structure is optimized for finding dependents quickly after a cell is updated.
     */
    this.dependencyGraph = {};
  }

  /**
   * Parses a formula to find its precedents (the cells it depends on).
   * @param {string} formula - The formula string (e.g., "=A1+B5").
   * @returns {string[]} An array of cell addresses (e.g., ['A1', 'B5']).
   */
  _getPrecedents(formula) {
    // We must remove the leading '=' for the parser to work correctly.
    try {
      // getVariables() is a helper from fast-formula-parser that extracts all cell references.
      const precedents = this.parser.parse(formula.substring(1)).getVariables();
      // Using a Set to ensure we only have unique precedents.
      return [...new Set(precedents)];
    } catch (error) {
      // If the formula is invalid (e.g., "=A1+"), return an empty array.
      console.error("Error parsing precedents for formula:", formula, error);
      return [];
    }
  }

  /**
   * Updates the dependency graph for a given cell's formula.
   * This should be called every time a cell's formula is set or changed.
   * @param {string} address - The address of the cell with the formula (e.g., "C1").
   * @param {string} formula - The new formula for that cell (e.g., "=A1+B1").
   */
  registerFormula(address, formula) {
    // Step 1: Remove any old dependencies for this cell.
    // This is crucial if a formula is changed (e.g., from "=A1" to "=B2").
    // We iterate through the whole graph to find and remove `address` from any dependency list.
    Object.keys(this.dependencyGraph).forEach((precedent) => {
      this.dependencyGraph[precedent] = this.dependencyGraph[precedent].filter(
        (dependent) => dependent !== address
      );
    });

    // Step 2: Add the new dependencies.
    const precedents = this._getPrecedents(formula);
    precedents.forEach((precedent) => {
      if (!this.dependencyGraph[precedent]) {
        // If this is the first time this precedent is referenced, create an array for it.
        this.dependencyGraph[precedent] = [];
      }
      // Add `address` to the list of cells that depend on `precedent`.
      this.dependencyGraph[precedent].push(address);
    });
  }

  /**
   * Calculates the result of a single formula.
   * @param {string} address - The address of the cell to calculate (used for error reporting).
   * @param {string} formula - The formula to execute.
   * @param {object} allCells - The entire `cells` object from the state, used to look up values.
   * @returns {{ value: any, display: string }} An object with the calculated value and its string representation.
   */
  calculate(address, formula, allCells) {
    // The context object tells fast-formula-parser how to resolve cell references.
    const context = {
      // This function is called by the parser whenever it encounters a variable like 'A1'.
      getVariable: (variableAddress) => {
        const cell = allCells[variableAddress];
        if (!cell) {
          // If the cell doesn't exist, treat it as 0.
          return 0;
        }
        // Use the calculated `value` property, not the display string.
        // Return 0 for non-numeric or empty values to prevent calculation errors.
        return typeof cell.value === "number" ? cell.value : 0;
      },
      // You can add more context here, like custom functions, in the future.
    };

    // Use fast-formula-parser to execute the calculation.
    const result = this.parser.parse(formula.substring(1), context);

    // Handle potential errors from the parser.
    if (result.error) {
      console.warn(`Formula error in cell ${address}:`, result.error);
      return { value: result.error, display: result.error }; // e.g., #NAME?, #DIV/0!
    }

    // Return the successful result.
    return { value: result.result, display: String(result.result) };
  }
}

/**
 * We export a single instance of the service (singleton pattern)
 * so that the entire application shares the same dependency graph and parser instance.
 */
export const formulaService = new FormulaService();
