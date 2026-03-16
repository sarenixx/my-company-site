"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SCALE_FACTORS = {
  K: 1_000,
  M: 1_000_000,
  B: 1_000_000_000,
  T: 1_000_000_000_000,
} as const;

type ParsedValue = {
  prefix: string;
  target: number;
  suffix: string;
  decimalPlaces: number;
  scaleSymbol: keyof typeof SCALE_FACTORS | null;
  scaleFactor: number;
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
  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue)) return null;

  const decimalPlaces = normalized.includes(".") ? normalized.split(".")[1].length : 0;
  const leadingSpaceCount = suffix.length - suffix.trimStart().length;
  const leadingSuffix = suffix.slice(0, leadingSpaceCount);
  const suffixWithoutLeadingSpace = suffix.slice(leadingSpaceCount);
  const scaleCandidate = suffixWithoutLeadingSpace.charAt(0).toUpperCase() as keyof typeof SCALE_FACTORS;
  const hasScaleSymbol = Object.prototype.hasOwnProperty.call(SCALE_FACTORS, scaleCandidate);
  const scaleSymbol = hasScaleSymbol ? scaleCandidate : null;
  const scaleFactor = scaleSymbol ? SCALE_FACTORS[scaleSymbol] : 1;
  const suffixWithoutScale =
    scaleSymbol && suffixWithoutLeadingSpace.length > 0
      ? `${leadingSuffix}${suffixWithoutLeadingSpace.slice(1)}`
      : suffix;

  return {
    prefix,
    target: numericValue * scaleFactor,
    suffix: suffixWithoutScale,
    decimalPlaces,
    scaleSymbol,
    scaleFactor,
  };
}

function formatValue(parsed: ParsedValue, nextValue: number): string {
  if (parsed.scaleSymbol && parsed.scaleFactor > 1) {
    if (parsed.decimalPlaces === 0) {
      const rounded = Math.round(nextValue).toLocaleString("en-US");
      return `${parsed.prefix}${rounded}${parsed.suffix}`;
    }

    const scaledValue = nextValue / parsed.scaleFactor;
    const rounded = scaledValue.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: parsed.decimalPlaces,
    });

    return `${parsed.prefix}${rounded}${parsed.scaleSymbol}${parsed.suffix}`;
  }

  const rounded = parsed.decimalPlaces > 0
    ? nextValue.toFixed(parsed.decimalPlaces)
    : Math.round(nextValue).toLocaleString("en-US");

  return `${parsed.prefix}${rounded}${parsed.suffix}`;
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export function StatCountUp({ value, durationMs = 3300, delayMs = 0 }: StatCountUpProps) {
  const parsed = useMemo(() => parseNumericValue(value), [value]);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const lastRenderedRef = useRef<string>("");
  const [displayValue, setDisplayValue] = useState(() =>
    parsed ? formatValue(parsed, 0) : value,
  );

  useEffect(() => {
    const nextValue = parsed ? formatValue(parsed, 0) : value;
    lastRenderedRef.current = nextValue;
    startedRef.current = false;
    const frameId = window.requestAnimationFrame(() => {
      setDisplayValue(nextValue);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [parsed, value]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !parsed) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const frameId = window.requestAnimationFrame(() => {
        setDisplayValue(value);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    if (delayMs < 0 || durationMs <= 0) {
      const frameId = window.requestAnimationFrame(() => {
        setDisplayValue(value);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(progress);
      const nextValue = parsed.target * eased;
      const formatted = progress >= 1 ? value : formatValue(parsed, nextValue);

      if (formatted !== lastRenderedRef.current) {
        lastRenderedRef.current = formatted;
        setDisplayValue(formatted);
      }

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
