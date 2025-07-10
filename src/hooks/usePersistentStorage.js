// hooks/usePersistentStorage.js
import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadSheetState } from "@/redux/slice/sheetSlice";

// Storage service following SoC pattern
class SheetStorageService {
  static getStorageKey(sheetId) {
    return `sheet-data-${sheetId}`;
  }

  static getMetaKey(sheetId) {
    return `sheet-meta-${sheetId}`;
  }

  static loadSheetData(sheetId) {
    try {
      const storageKey = this.getStorageKey(sheetId);
      const savedData = localStorage.getItem(storageKey);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error("Failed to load sheet data:", error);
      return null;
    }
  }

  static saveSheetData(sheetId, data) {
    try {
      const storageKey = this.getStorageKey(sheetId);
      const metaKey = this.getMetaKey(sheetId);

      // Save sheet data
      localStorage.setItem(storageKey, JSON.stringify(data));

      // Update metadata
      const metadata = this.getMetadata(sheetId);
      metadata.lastModified = new Date().toISOString();
      localStorage.setItem(metaKey, JSON.stringify(metadata));

      return true;
    } catch (error) {
      console.error("Failed to save sheet data:", error);
      return false;
    }
  }

  static getMetadata(sheetId) {
    try {
      const metaKey = this.getMetaKey(sheetId);
      const metadata = localStorage.getItem(metaKey);
      return metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      console.error("Failed to get metadata:", error);
      return {};
    }
  }

  static clearSheetData(sheetId) {
    try {
      const storageKey = this.getStorageKey(sheetId);
      const metaKey = this.getMetaKey(sheetId);
      localStorage.removeItem(storageKey);
      localStorage.removeItem(metaKey);
      return true;
    } catch (error) {
      console.error("Failed to clear sheet data:", error);
      return false;
    }
  }
}

// Debounce utility for efficient saving
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

export function usePersistentStorage(sheetId) {
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.sheet.cells);
  const sheets = useSelector((state) => state.sheet.sheets);
  const activeSheetId = useSelector((state) => state.sheet.activeSheetId);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const lastSavedData = useRef(null);
  const skipNextSave = useRef(false);

  // Load sheet data when sheetId becomes available
  useEffect(() => {
    if (!sheetId || isInitialized) return;

    const loadData = async () => {
      try {
        console.log(`Loading sheet data for: ${sheetId}`);
        const savedData = SheetStorageService.loadSheetData(sheetId);

        if (savedData) {
          console.log(`Found saved data for sheet ${sheetId}:`, savedData);

          // Skip the next save operation since we're loading data
          skipNextSave.current = true;

          // Load the data into Redux store
          dispatch(loadSheetState(savedData));

          // Store the loaded data reference
          lastSavedData.current = JSON.stringify(savedData);

          console.log(`Successfully loaded sheet ${sheetId}`);
        } else {
          console.log(
            `No saved data found for sheet ${sheetId}, using default state`
          );

          // Create initial metadata for new sheets
          const metadata = {
            name: `Sheet ${sheetId}`,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            description: "",
            tags: [],
            owner: "You",
            shared: false,
          };

          localStorage.setItem(
            `sheet-meta-${sheetId}`,
            JSON.stringify(metadata)
          );
        }

        setIsLoaded(true);
        setIsInitialized(true);
        setLoadingError(null);
      } catch (error) {
        console.error("Error loading sheet data:", error);
        setLoadingError(error.message);
        setIsLoaded(true);
        setIsInitialized(true);
      }
    };

    loadData();
  }, [sheetId, dispatch, isInitialized]);

  // Efficient save function with change detection
  const saveData = useCallback(
    (currentCells, currentSheets, currentActiveSheetId) => {
      if (!sheetId || !isLoaded) return;

      // Skip save if we just loaded data
      if (skipNextSave.current) {
        skipNextSave.current = false;
        return;
      }

      const dataToSave = {
        cells: currentCells,
        sheets: currentSheets,
        activeSheetId: currentActiveSheetId,
      };

      const serializedData = JSON.stringify(dataToSave);

      // Only save if data has actually changed
      if (lastSavedData.current !== serializedData) {
        console.log(`Saving sheet ${sheetId} data...`);
        const success = SheetStorageService.saveSheetData(sheetId, dataToSave);

        if (success) {
          lastSavedData.current = serializedData;
          console.log(`Sheet ${sheetId} saved successfully`);
        } else {
          console.error(`Failed to save sheet ${sheetId}`);
        }
      }
    },
    [sheetId, isLoaded]
  );

  // Debounced save to prevent excessive localStorage writes
  const debouncedSave = useDebounce(saveData, 500);

  // Save data whenever cells, sheets, or activeSheetId changes
  useEffect(() => {
    if (isLoaded && sheetId && isInitialized) {
      debouncedSave(cells, sheets, activeSheetId);
    }
  }, [
    cells,
    sheets,
    activeSheetId,
    debouncedSave,
    isLoaded,
    sheetId,
    isInitialized,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current);
      }
    };
  }, []);

  // Manual save function for explicit saves
  const saveNow = useCallback(() => {
    if (sheetId && isLoaded) {
      saveData(cells, sheets, activeSheetId);
    }
  }, [sheetId, isLoaded, saveData, cells, sheets, activeSheetId]);

  // Return storage utilities for manual operations
  return {
    isLoaded: isLoaded && isInitialized,
    loadingError,
    saveNow,
    clearData: () => SheetStorageService.clearSheetData(sheetId),
    getMetadata: () => SheetStorageService.getMetadata(sheetId),
  };
}
