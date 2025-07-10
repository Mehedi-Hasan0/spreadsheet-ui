// hooks/usePersistentStorage.js
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadSheetState } from "@/redux/slice/sheetSlice";

export function usePersistentStorage(sheetId) {
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.sheet.cells);
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = `sheet-data-${sheetId}`;

  // 1. Load data from localStorage on initial mount
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      dispatch(loadSheetState(JSON.parse(savedData)));
    }
    setIsLoaded(true);
  }, [dispatch, storageKey]);

  // 2. Save data to localStorage whenever `cells` state changes
  useEffect(() => {
    // Only save after initial data has been loaded to prevent overwriting
    if (isLoaded) {
      localStorage.setItem(storageKey, JSON.stringify({ cells }));
    }
  }, [cells, isLoaded, storageKey]);
}
