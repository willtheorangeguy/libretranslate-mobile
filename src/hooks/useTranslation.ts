import { useCallback, useEffect, useRef, useState } from 'react';
import { getClient, LibreTranslateError } from '../services/LibreTranslateClient';
import { TranslationResponse } from '../types';

/** Invalidates pending work immediately when input, languages or server change. */
export function useTranslation(
  text: string,
  source: string,
  target: string,
  enabled: boolean,
  serverIdentity: unknown,
) {
  const [result, setResult] = useState<{
    response: TranslationResponse;
    text: string;
    source: string;
    target: string;
    server: unknown;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const invalidate = useCallback(() => {
    generation.current += 1;
    abort.current?.abort();
  }, []);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    if (retryAt <= Date.now()) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (retryAt <= Date.now()) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);

  useEffect(() => {
    invalidate();
    const id = generation.current;
    const client = getClient();
    setResult(null);
    setError(null);
    setLoading(false);
    setRetryAt(client.retryAt);
    if (!enabled || !text.trim() || !target) return;
    const controller = new AbortController();
    abort.current = controller;
    const timer = setTimeout(async () => {
      if (id !== generation.current) return;
      setLoading(true);
      try {
        const response = await client.translate(text, source, target, controller.signal);
        if (id === generation.current)
          setResult({ response, text, source, target, server: serverIdentity });
      } catch (reason) {
        if (id === generation.current) {
          setError(reason instanceof Error ? reason.message : 'Translation failed.');
          if (reason instanceof LibreTranslateError && reason.retryAt) setRetryAt(reason.retryAt);
        }
      } finally {
        if (id === generation.current) {
          setLoading(false);
          setRetryAt(client.retryAt);
          setNow(Date.now());
        }
      }
    }, Math.max(500, client.retryAt - Date.now()));
    return () => {
      clearTimeout(timer);
      invalidate();
    };
  }, [text, source, target, enabled, serverIdentity, attempt, invalidate]);

  const currentResult =
    enabled &&
    result?.text === text &&
    result.source === source &&
    result.target === target &&
    result.server === serverIdentity
      ? result.response
      : null;
  return {
    result: currentResult,
    loading,
    error,
    retry,
    invalidate,
    cooldown: Math.max(0, Math.ceil((retryAt - now) / 1000)),
  };
}
