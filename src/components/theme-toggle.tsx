"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const MARKETING_PATHS = new Set(["/", "/pricing", "/waitlist"]);

type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "ferro-theme";
const CHANGE_EVENT = "ferro-theme-change";
const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = {
  system: "Auto",
  light: "Light",
  dark: "Dark",
};

function readTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function getServerTheme(): Theme {
  return "system";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function ThemeToggle() {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribe, readTheme, getServerTheme);

  useEffect(() => {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  if (MARKETING_PATHS.has(pathname)) return null;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${LABEL[theme]}. Click to change.`}
      className="fixed bottom-4 right-4 z-50 rounded-[9px] border border-line bg-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-paper/70 backdrop-blur transition hover:border-amber-text hover:text-amber-text"
    >
      {LABEL[theme]}
    </button>
  );
}
