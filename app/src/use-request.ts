import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

// Reloads on every focus (and when `load` changes, e.g. after switching user) so lists stay fresh across tabs.
export function useRequest<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);

  const run = useCallback(async () => {
    setError(null);
    try {
      setData(await load());
    } catch (loadError) {
      setError(loadError);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );

  async function refresh() {
    setRefreshing(true);
    await run();
    setRefreshing(false);
  }

  function retry() {
    setData(null);
    run();
  }

  return { data, error, refreshing, reload: run, refresh, retry };
}
