"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const browserSnapshot = () => true;
const serverSnapshot = () => false;

/** Keeps the server and hydration render consistent before exposing browser storage. */
export function useBrowserReady() {
  return useSyncExternalStore(subscribe, browserSnapshot, serverSnapshot);
}
