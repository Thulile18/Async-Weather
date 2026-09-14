# Async Weather & News Dashboard

A Node.js + TypeScript command-line project that fetches live weather
and news headlines using three different styles of asynchronous
JavaScript: **callbacks**, **promises**, and **async/await**. All
requests use Node's built-in `https` module directly.

This project's `package.json` and `tsconfig.json` were provided as a
starting point and are left untouched. No new npm packages were added.

## APIs used

- **Weather**: [OpenWeatherMap](https://openweathermap.org/api) current
  weather API. Requires a free API key.
- **News**: [DummyJSON Posts API](https://dummyjson.com/posts) — free,
  no API key required.

No data is hardcoded — every weather value and every headline comes
from a live network request each time you run a script.

## Setup

1. Install dependencies (already listed in the provided `package.json`):
   ```
   npm install
   ```
2. Get a free API key from
   [OpenWeatherMap](https://home.openweathermap.org/api_keys).
3. Create a file called `.env` in the project root (next to
   `package.json`) with this line:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your real key. This file is
   excluded by `.gitignore` and is never committed.

   No extra package (like `dotenv`) was needed for this — each script
   reads and parses the `.env` file itself using Node's built-in `fs`
   module, since the provided `package.json` was left untouched.

## Usage

Because `package.json`'s scripts are provided as-is, each version is
run directly with `tsx` instead of an `npm run` script:

```
npx tsx src/callback.ts
npx tsx src/promise.ts
npx tsx src/async.ts
```

Each script prints its own labelled section to the console so the
output of each async style is easy to compare.

## Project structure

```
src/
  callback.ts   -> weather + news fetched with nested error-first callbacks
  promise.ts    -> weather + news fetched with .then()/.catch(), Promise.all, Promise.race
  async.ts      -> weather + news fetched with async/await and try...catch
```

Each file is fully self-contained — every version has its own copy of
the `httpGet` request helper and `.env` reader, written in that
file's own style. This keeps each version independent and easy to
read on its own.

A `/// <reference types="node" />` line appears at the top of each
file. This is needed because the provided `tsconfig.json` doesn't list
`"types": ["node"]` explicitly, and the TypeScript version installed
(7.0.2) requires Node's types to be referenced directly in files that
use them. Adding this reference avoids needing to edit `tsconfig.json`.

## Sample console output

Actual output will vary since it comes from a live request, but the
shape looks like this:

**`npm run callback`**
```
=== Callback Version ===
Current weather (Pietermaritzburg): {
  temperature: 26.84,
  feelsLike: 26.89,
  description: 'scattered clouds'
}
Latest headlines:
1. His mother had always taught him
2. He was an expert but not in a discipline
3. Dave watched as the forest burned up on the hill.
4. All he wanted was a candy bar.
5. Hopes and dreams were dashed that day.
Done (callback version).
```

**`npm run promise`**
```
=== Promise Version: chained (weather -> news) ===
Current weather (Pietermaritzburg): {
temperature: 26.84,
feelsLike: 26.89,
description: 'scattered clouds'
}
Latest headlines:

	1.	His mother had always taught him
	2.	He was an expert but not in a discipline
	3.	Dave watched as the forest burned up on the hill.
	4.	All he wanted was a candy bar.
	5.	Hopes and dreams were dashed that day.
=== Promise Version: Promise.all (parallel) ===
Current weather (Pietermaritzburg): {
temperature: 26.84,
feelsLike: 26.89,
description: 'scattered clouds'
}
Latest headlines:

	1.	His mother had always taught him
	2.	He was an expert but not in a discipline
	3.	Dave watched as the forest burned up on the hill.
	4.	All he wanted was a candy bar.
	5.	Hopes and dreams were dashed that day.
=== Promise Version: Promise.race ===
"weather" responded first.
Done (promise version).
```

**`npm run async`**
```
=== Async/Await Version: sequential (weather -> news) ===
Current weather (Pietermaritzburg): {
  temperature: 26.84,
  feelsLike: 26.89,
  description: 'scattered clouds'
}
Latest headlines:
1. His mother had always taught him
2. He was an expert but not in a discipline
3. Dave watched as the forest burned up on the hill.
4. All he wanted was a candy bar.
5. Hopes and dreams were dashed that day.
=== Async/Await Version: Promise.all (parallel) ===
Current weather (Pietermaritzburg): {
  temperature: 26.84,
  feelsLike: 26.89,
  description: 'scattered clouds'
}
Latest headlines:
1. His mother had always taught him
2. He was an expert but not in a discipline
3. Dave watched as the forest burned up on the hill.
4. All he wanted was a candy bar.
5. Hopes and dreams were dashed that day.
Done (async/await version).
```

## Error handling

All three versions handle errors consistently:

- **Callback version**: follows the error-first pattern
  (`callback(error, data)`); errors are checked and logged before any
  further steps run.
- **Promise version**: errors are caught with `.catch()`.
- **Async/await version**: errors are caught with `try...catch`.

In every case, a failed request is reported with a clear message
instead of the program crashing or hanging.

## Learning outcomes

1. Understanding the practical differences between callbacks,
   promises, and async/await for handling asynchronous code in
   Node.js.
2. Using Node's built-in `https` module directly to make GET requests
   without any external HTTP library.
3. Recognising and demonstrating "callback hell" — why nesting
   dependent asynchronous steps becomes hard to read, and how promises
   and async/await address that.
4. Using `Promise.all()` to run independent requests in parallel
   instead of one after another.
5. Using `Promise.race()` to react to whichever of several requests
   finishes first.
6. Handling errors consistently across three different asynchronous
   styles (error-first callbacks, `.catch()`, and `try...catch`).
7. Working within a fixed project configuration without needing to
   add new dependencies (reading `.env` by hand with `fs` instead of
   installing `dotenv`).
