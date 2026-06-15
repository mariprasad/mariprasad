"use client";

// The live "right now in Bengaluru" line under the hero name: current IST time
// plus current temperature and a weather emoji. Weather comes from Open-Meteo
// (no API key); everything is gated to the client to avoid a hydration mismatch.
import { useEffect, useState } from "react";
import { PROFILE } from "@/data/profile";

// WMO weather code → emoji. See https://open-meteo.com/en/docs (weather_code).
function weatherEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";          // clear
  if (code === 1 || code === 2) return isDay ? "⛅" : "☁️"; // mainly clear / partly cloudy
  if (code === 3) return "☁️";                          // overcast
  if (code >= 45 && code <= 48) return "🌫️";            // fog
  if (code >= 51 && code <= 57) return "🌦️";            // drizzle
  if (code >= 61 && code <= 67) return "🌧️";            // rain
  if (code >= 71 && code <= 77) return "🌨️";            // snow
  if (code >= 80 && code <= 82) return "🌦️";            // rain showers
  if (code >= 85 && code <= 86) return "🌨️";            // snow showers
  if (code >= 95) return "⛈️";                          // thunderstorm
  return "🌡️";
}

function istTime(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PROFILE.timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

type Weather = { temp: number; emoji: string };

export default function LocalConditions() {
  const [time, setTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

  // Live IST clock — ticks the displayed minute over.
  useEffect(() => {
    setTime(istTime());
    const id = setInterval(() => setTime(istTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Current conditions, refreshed every 10 minutes.
  useEffect(() => {
    const { lat, lon } = PROFILE.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=${encodeURIComponent(PROFILE.timezone)}`;
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const { current } = await res.json();
        if (active && current) {
          setWeather({
            temp: Math.round(current.temperature_2m),
            emoji: weatherEmoji(current.weather_code, current.is_day === 1),
          });
        }
      } catch {
        /* offline / blocked — fall back to just the time */
      }
    };
    load();
    const id = setInterval(load, 600_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // First paint (and SSR) shows just the location; the rest fills in on mount.
  if (!time) return null;

  return (
    <>
      · {time} IST
      {weather && (
        <>
          {" "}· {weather.temp}°C {weather.emoji}
        </>
      )}
    </>
  );
}
