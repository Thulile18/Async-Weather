// PROMISE VERSION
//
// Same job as callback.ts, but the https request is wrapped in a
// Promise instead of taking a callback. This allows .then() chaining,
// .catch() for errors, Promise.all() (both requests at once), and
// Promise.race() (react to whichever finishes first).

/// <reference types="node" />

import https from "https";
import fs from "fs";
import path from "path";

function loadEnvFile(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf-8");
  contents.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
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

function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const statusCode = response.statusCode ?? 0;

        if (statusCode >= 400) {
          reject(new Error(`Request to ${url} failed with status ${statusCode}`));
          return;
        }

        let rawData = "";
        response.on("data", (chunk) => {
          rawData += chunk;
        });
        response.on("end", () => {
          resolve(rawData);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function printWeather(weatherRaw: string): void {
  const weather = JSON.parse(weatherRaw);
  console.log(`Current weather (${weather.name}):`, {
    temperature: weather.main.temp,
    feelsLike: weather.main.feels_like,
    description: weather.weather[0].description,
  });
}

function printNews(newsRaw: string): void {
  const news = JSON.parse(newsRaw);
  console.log("Latest headlines:");
  news.posts.forEach((post: { title: string }, index: number) => {
    console.log(`${index + 1}. ${post.title}`);
  });
}

// --- Part A: chained promises, one after another -------------------
function runChainedExample(): Promise<void> {
  console.log("=== Promise Version: chained (weather -> news) ===\n");

  return httpGet(WEATHER_URL)
    .then((weatherRaw) => {
      printWeather(weatherRaw);
      return httpGet(NEWS_URL); // returning a promise here chains it
    })
    .then((newsRaw) => {
      printNews(newsRaw);
    })
    .catch((error: Error) => {
      console.error("Something went wrong (chained version):", error.message);
    });
}

// --- Part B: Promise.all runs both requests at the same time -------
function runPromiseAllExample(): Promise<void> {
  console.log("\n=== Promise Version: Promise.all (parallel) ===\n");

  return Promise.all([httpGet(WEATHER_URL), httpGet(NEWS_URL)])
    .then(([weatherRaw, newsRaw]) => {
      printWeather(weatherRaw);
      printNews(newsRaw);
    })
    .catch((error: Error) => {
      console.error("Something went wrong (Promise.all version):", error.message);
    });
}

// --- Part C: Promise.race resolves with whichever finishes first ---
function runPromiseRaceExample(): Promise<void> {
  console.log("\n=== Promise Version: Promise.race ===\n");

  return Promise.race([
    httpGet(WEATHER_URL).then(() => "weather"),
    httpGet(NEWS_URL).then(() => "news"),
  ])
    .then((winner) => {
      console.log(`"${winner}" responded first.`);
    })
    .catch((error: Error) => {
      console.error("Something went wrong (Promise.race version):", error.message);
    });
}

runChainedExample()
  .then(runPromiseAllExample)
  .then(runPromiseRaceExample)
  .then(() => {
    console.log("\nDone (promise version).");
    process.exit(0);
  });