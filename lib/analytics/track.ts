"use client";

import { createClient } from "@/lib/supabase/client";
import { classifyDevice, classifyBrowser } from "@/lib/analytics/device";

const SESSION_KEY = "ele_sid";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackEvent(input: {
  eventType: "pageview" | "menu_click";
  path: string;
  label?: string;
  href?: string;
}) {
  if (typeof window === "undefined") return;

  const userAgent = navigator.userAgent;
  const supabase = createClient();

  // supabase-js query builders are lazy thenables — the request is only sent
  // once `.then()`/`await` runs, so this `.then()` isn't optional cleanup,
  // it's what actually fires the insert.
  supabase
    .from("analytics_events")
    .insert({
      event_type: input.eventType,
      path: input.path,
      label: input.label ?? null,
      href: input.href ?? null,
      referrer: document.referrer || null,
      device_type: classifyDevice(userAgent),
      browser: classifyBrowser(userAgent),
      session_id: getSessionId(),
      user_agent: userAgent,
    })
    .then(({ error }) => {
      if (error) console.error("[analytics] failed to record event", error);
    });
}
