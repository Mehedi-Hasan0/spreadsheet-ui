// hooks/useFormulaCalculation.js
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { applyCalculations } from "@/redux/slice/sheetSlice";
import { formulaService } from "@/lib/formulaService";

export function useFormulaCalculation() {
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.sheet.cells);

  useEffect(() => {
    const allFormulas = Object.entries(cells)
      .filter(([, cell]) => cell.formula)
      .map(([address, cell]) => ({ address, formula: cell.formula }));

    console.log("Formulas to process:", allFormulas); // Add log

    allFormulas.forEach(({ address, formula }) => {
      formulaService.registerFormula(address, formula);
    });

    const updates = {};
    allFormulas.forEach(({ address, formula }) => {
      const result = formulaService.calculate(address, formula, cells);
      const currentCell = cells[address];

      console.log(`Processing ${address}:`, { result, currentCell }); // Add log

      if (
        currentCell &&
        (currentCell.value !== result.value ||
          currentCell.display !== result.display)
      ) {
        updates[address] = { value: result.value, display: result.display };
      }
    });

    console.log("Updates to dispatch:", updates); // Add log

    if (Object.keys(updates).length > 0) {
      dispatch(applyCalculations(updates));
    }
  }, [cells, dispatch]); // Dependency array is key!
}
