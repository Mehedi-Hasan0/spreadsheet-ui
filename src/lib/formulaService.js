import { Parser } from "hot-formula-parser";

class FormulaService {
  constructor() {
    this.parser = new Parser(); // This is the main parser for CALCULATIONS
    this.dependencyGraph = {}; // Key: Precedent (A1), Value: Array of Dependents [C1, D2]
    this.reverseDependencyGraph = {}; // Key: Dependent (C1), Value: Array of Precedents [A1, B1]

    // Note: The 'callVariable' hook is no longer needed on the main parser instance
  }

  /**
   * Finds all cell references (precedents) in a formula string.
   * Uses a temporary, isolated parser instance to avoid state conflicts.
   * @param {string} formula - e.g., "=A1+B2"
   * @returns {Promise<string[]>} - e.g., ['A1', 'B2']
   */
  async _getPrecedents(formula) {
    if (!formula || !formula.startsWith("=")) {
      return [];
    }

    // Create a temporary, isolated parser JUST for finding variables.
    const precedentParser = new Parser();
    const variables = new Set();

    precedentParser.on("callVariable", (name, done) => {
      variables.add(name);
      done(); // We don't need a value, just to capture the name
    });

    try {
      // We parse only to trigger the 'callVariable' hook. The result is ignored.
      precedentParser.parse(formula.substring(1));
      return Array.from(variables);
    } catch (error) {
      // This can happen with invalid formulas like "=A1++B2"
      console.error("Error parsing precedents for formula:", formula, error);
      return [];
    }
  }

  /**
   * Updates the dependency graphs for a given cell and its formula.
   * @param {string} address - The address of the cell being updated (e.g., "C1")
   * @param {string} formula - The new formula (e.g., "=A1+B1") or an empty string to clear.
   */
  async registerFormula(address, formula) {
    // 1. Clear old dependencies for this cell
    const oldPrecedents = this.reverseDependencyGraph[address] || [];
    oldPrecedents.forEach((precedent) => {
      if (this.dependencyGraph[precedent]) {
        this.dependencyGraph[precedent] = this.dependencyGraph[
          precedent
        ].filter((dep) => dep !== address);
      }
    });

    // 2. If the formula is cleared, we're done.
    if (!formula || !formula.startsWith("=")) {
      this.reverseDependencyGraph[address] = [];
      return;
    }

    // 3. Get new precedents from the new formula
    const newPrecedents = await this._getPrecedents(formula);

    // 4. Update both graphs
    newPrecedents.forEach((precedent) => {
      if (!this.dependencyGraph[precedent]) {
        this.dependencyGraph[precedent] = [];
      }
      if (!this.dependencyGraph[precedent].includes(address)) {
        this.dependencyGraph[precedent].push(address);
      }
    });
    this.reverseDependencyGraph[address] = newPrecedents;
  }

  // Optimized: Returns dependents as an array (This function is correct as is)
  getDependents(changedAddress) {
    const dependents = new Set();
    const queue = [changedAddress];
    const visited = new Set(); // No need to pre-add changedAddress here

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      const directDeps = this.dependencyGraph[current] || [];
      for (const dep of directDeps) {
        dependents.add(dep);
        queue.push(dep);
      }
    }
    return Array.from(dependents);
  }

  async calculate(address, formula, allCells) {
    try {
      const getVariable = (variableAddress, done) => {
        const cell = allCells[variableAddress];
        let value = 0; // Default to 0

        if (cell) {
          if (typeof cell.value === "number") {
            value = cell.value;
          } else if (
            cell.value !== null &&
            cell.value !== "" &&
            !isNaN(Number(cell.value))
          ) {
            value = Number(cell.value);
          }
        }

        console.log(
          `[formulaService] getVariable for ${variableAddress} resolved to: ${value}`
        );
        done(value);
      };

      // Use the main, clean parser instance for calculation.
      // The parser will call getVariable internally.
      const result = this.parser.parse(formula.substring(1), {
        onVariable: getVariable,
      });

      console.log(`[formulaService] Parser result for ${address}:, result`);

      if (result.error) {
        console.error(
          `[formulaService] Parser error for ${address}:,
          result.error`
        );
        return { value: result.error, display: result.error };
      }
      return { value: result.result, display: String(result.result) };
    } catch (error) {
      console.error(
       ` Error calculating formula ${formula} for ${address},
        error`
      );
      return { value: "#ERROR!", display: "#ERROR!" };
    }
  }
}

export const formulaService = new FormulaService();