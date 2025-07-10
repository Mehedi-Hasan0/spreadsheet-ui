// components/StoreProvider.js
"use client";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

export function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
