"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Measure, don't guess (docs/EXPERIENCE_REVIEW.md §7). In development,
 * metrics log to the console. In production they beacon to /api/vitals,
 * which logs them for the deployment's log drain. Wire a real store there
 * when one exists.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[vitals] ${metric.name}: ${Math.round(metric.value)} (${metric.rating ?? "n/a"})`,
      );
      return;
    }
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", body);
    } else {
      fetch("/api/vitals", { body, method: "POST", keepalive: true });
    }
  });
  return null;
}
