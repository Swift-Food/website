"use client";

import { useEffect, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

/**
 * One-shot fetch for a dashboard card. Cards load independently so a failing
 * one never blanks the others.
 */
export function useAccountData<T>(
  load: () => Promise<T>,
  fallbackMessage: string
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: "" });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : fallbackMessage,
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // The loader is defined inline by callers; this is a mount-time fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
