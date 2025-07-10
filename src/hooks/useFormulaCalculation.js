// hooks/useFormulaCalculation.js
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { applyCalculations } from "@/redux/slice/sheetSlice";
import { formulaService } from "@/lib/formulaService";

export function useFormulaCalculation() {
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.sheet.cells);

  useEffect(() => {
    // This effect runs every time any cell changes
    const allFormulas = Object.entries(cells)
      .filter(([, cell]) => cell.formula)
      .map(([address, cell]) => ({ address, formula: cell.formula }));

    // 1. Rebuild the dependency graph every time (simple for MVP)
    allFormulas.forEach(({ address, formula }) => {
      formulaService.registerFormula(address, formula);
    });

    // 2. Calculate the values for all formulas and identify what has changed
    const updates = {};
    allFormulas.forEach(({ address, formula }) => {
      const result = formulaService.calculate(address, formula, cells);
      const currentCell = cells[address];

      // --- FIX: START ---
      // Only include the update if the calculated value is different from the current one.
      // This prevents an infinite loop where the hook re-calculates the same values
      // and dispatches an action, which re-triggers the hook.
      if (
        currentCell &&
        (currentCell.value !== result.value ||
          currentCell.display !== result.display)
      ) {
        updates[address] = { value: result.value, display: result.display };
      }
      // --- FIX: END ---
    });

    // 3. Dispatch one single action to update ONLY the calculated cells that have changed
    if (Object.keys(updates).length > 0) {
      dispatch(applyCalculations(updates));
    }
  }, [cells, dispatch]); // Dependency array is key!
}
