"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Wrap a server action with loading/error state and a toast on failure.
 *
 * `fn` resolves to the action's result so callers can react to it directly
 * instead of threading everything through an effect on `data`.
 */
const useFetch = (cb, { showErrorToast = true } = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const response = await cb(...args);
        setData(response);
        return response;
      } catch (err) {
        setError(err);
        if (showErrorToast) {
          toast.error(err?.message || "Something went wrong");
        }
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [cb, showErrorToast]
  );

  return { data, loading, error, fn, setData };
};

export default useFetch;
