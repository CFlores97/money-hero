const DATA_SYNC_EVENT = "moneyhero:data-sync";

export function emitDataSync() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(DATA_SYNC_EVENT));
}

export function subscribeToDataSync(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => listener();
  window.addEventListener(DATA_SYNC_EVENT, handler);

  return () => {
    window.removeEventListener(DATA_SYNC_EVENT, handler);
  };
}
