import { useContext } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { StoreContext } from "./style-sheet";

export function useColorScheme() {
  const store = useContext(StoreContext);

  const colorScheme = useSyncExternalStore(
    store.subscribeColorScheme,
    store.getColorScheme
  );

  return {
    colorScheme,
    setColorScheme: store.setColorScheme,
    toggleColorScheme: store.toggleColorScheme,
  };
}
