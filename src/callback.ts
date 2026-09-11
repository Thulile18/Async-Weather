// CALLBACK VERSION
//
// Fetches weather, then news, using Node's built-in "https" module and
// old-school error-first callbacks. Fetching the news depends on the
// weather request finishing first, so the news request is written
// INSIDE the weather callback. That nesting is exactly what is meant
// by "callback hell".

/// <reference types="node" />

import https from "https";
import fs from "fs";
import path from "path";

// A tiny, dependency-free .env reader. This project's package.json is
// locked and can't have new packages (like "dotenv") added to it, so
// this reads and parses a ".env" file by hand using only Node's
// built-in "fs" module.
function loadEnvFile(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf-8");
  contents.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return; // skip blank lines and comments
    }
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      return;
    }
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = "Johannesburg";
const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
  CITY
)}&units=metric&appid=${API_KEY}`;
const NEWS_URL = "https://dummyjson.com/posts?limit=5";

if (!API_KEY) {
  console.error(
    "Missing OPENWEATHER_API_KEY. Create a .env file with OPENWEATHER_API_KEY=your_key_here"
  );
  process.exit(1);
}

// Wraps https.get() in the standard error-first callback pattern:
// callback(error, data).
function httpGet(
  url: string,
  callback: (error: Error | null, data?: string) => void
): void {
  https
    .get(url, (response) => {
      const statusCode = response.statusCode ?? 0;

      if (statusCode >= 400) {
        callback(new Error(`Request to ${url} failed with status ${statusCode}`));
        return;
      }

      let rawData = "";
      response.on("data", (chunk) => {
        rawData += chunk;
      });
      response.on("end", () => {
        callback(null, rawData);
      });
    })
    .on("error", (error) => {
      callback(error);
    });
}

console.log("=== Callback Version ===\n");

// STEP 1: fetch the weather.
httpGet(WEATHER_URL, (weatherError, weatherRaw) => {
  if (weatherError || !weatherRaw) {
    console.error("Error fetching weather:", weatherError?.message);
    process.exit(1);
  }

  const weather = JSON.parse(weatherRaw!);
  console.log(`Current weather (${weather.name}):`, {
    temperature: weather.main.temp,
    feelsLike: weather.main.feels_like,
    description: weather.weather[0].description,
  });

  // STEP 2: fetch the news, nested inside the weather callback above.
  // This nesting is the "callback hell" pattern the brief describes.
  httpGet(NEWS_URL, (newsError, newsRaw) => {
    if (newsError || !newsRaw) {
      console.error("Error fetching news:", newsError?.message);
      process.exit(1);
    }

    const news = JSON.parse(newsRaw!);
    console.log("\nLatest headlines:");
    news.posts.forEach((post: { title: string }, index: number) => {
      console.log(`${index + 1}. ${post.title}`);
    });

    console.log("\nDone (callback version).");
    process.exit(0);
  });
});