"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ParsedValue = {
  prefix: string;
  target: number;
  suffix: string;
  decimalPlaces: number;
};

type StatCountUpProps = {
  value: string;
  durationMs?: number;
  delayMs?: number;
};

function parseNumericValue(raw: string): ParsedValue | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([^0-9+\-]*)([+\-]?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;

  const [, prefix, numericPart, suffix] = match;
  const normalized = numericPart.replace(/,/g, "");
  const target = Number(normalized);
  if (!Number.isFinite(target)) return null;

  const decimalPlaces = normalized.includes(".") ? normalized.split(".")[1].length : 0;

  return {
    prefix,
    target,
    suffix,
    decimalPlaces,
  };
}

function formatValue(parsed: ParsedValue, nextValue: number): string {
  const rounded =
    parsed.decimalPlaces > 0
      ? nextValue.toFixed(parsed.decimalPlaces)
      : Math.round(nextValue).toLocaleString("en-US");

  return `${parsed.prefix}${rounded}${parsed.suffix}`;
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export function StatCountUp({ value, durationMs = 1300, delayMs = 0 }: StatCountUpProps) {
  const parsed = useMemo(() => parseNumericValue(value), [value]);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState(() =>
    parsed ? formatValue(parsed, 0) : value,
  );

  useEffect(() => {
    setDisplayValue(parsed ? formatValue(parsed, 0) : value);
    startedRef.current = false;
  }, [parsed, value]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !parsed) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(progress);
      const nextValue = parsed.target * eased;
      setDisplayValue(progress >= 1 ? value : formatValue(parsed, nextValue));

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(tick);
      }
    };

    const startAnimation = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      timeoutRef.current = window.setTimeout(() => {
        animationRef.current = window.requestAnimationFrame(tick);
      }, delayMs);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          startAnimation();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [delayMs, durationMs, parsed, value]);

  return <span ref={elementRef}>{displayValue}</span>;
}
