// ASYNC/AWAIT VERSION
//
// Same job as callback.ts and promise.ts, written with async/await.
// "await" lets each step read like ordinary top-to-bottom code, and
// errors are handled with a normal try...catch block.

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

// --- Part A: fetch weather, then news, one after another -----------
async function runSequentialExample(): Promise<void> {
  console.log("=== Async/Await Version: sequential (weather -> news) ===\n");

  try {
    const weatherRaw = await httpGet(WEATHER_URL);
    printWeather(weatherRaw);

    const newsRaw = await httpGet(NEWS_URL);
    printNews(newsRaw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Something went wrong (sequential version):", message);
  }
}

// --- Part B: fetch weather and news at the same time with Promise.all
async function runParallelExample(): Promise<void> {
  console.log("\n=== Async/Await Version: Promise.all (parallel) ===\n");

  try {
    const [weatherRaw, newsRaw] = await Promise.all([
      httpGet(WEATHER_URL),
      httpGet(NEWS_URL),
    ]);

    printWeather(weatherRaw);
    printNews(newsRaw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Something went wrong (parallel version):", message);
  }
}

async function main(): Promise<void> {
  await runSequentialExample();
  await runParallelExample();
  console.log("\nDone (async/await version).");
  process.exit(0);
}

main();