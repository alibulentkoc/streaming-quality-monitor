# Streaming Quality Monitor

A single-page web tool for logging streaming problems and watching connection latency over time.
It is one self-contained HTML file. It has no build step, no dependencies, and no server code.

## Features

- Log an incident with one click. The Digital Match and Remote Desktop buttons log a typed incident.
  Add incident logs one without a type.
- Each incident stores its timestamp and a snapshot of the most recent ping result.
- Ping test every 30 seconds, shown as a log and as a latency chart (ms over time).
- Cumulative incident chart on a real date and time axis.
- Data is kept in the browser and restored on page load.
- Save JSON and Load JSON to back up or move data between browsers.
- Light and dark theme. Works offline except for the ping test itself.

## Running it

Pick one:

1. **Open the file.** Double-click `index.html`. Everything works except the automatic
   load of `incidents.json` described below.
2. **Local web server.** In the project folder run `python -m http.server 8000`,
   then open http://localhost:8000.
3. **GitHub Pages.** In the repository go to Settings, then Pages. Under "Build and deployment",
   choose "Deploy from a branch", select `main` and `/ (root)`, and save.
   The site appears at https://alibulentkoc.github.io/streaming-quality-monitor/.

## Install and offline use

The app is a Progressive Web App (PWA).

- `manifest.webmanifest` gives the app name, colors, and start page.
- `sw.js` is a service worker. It keeps a copy of the app so it opens without a connection.
  It always tries the network first, so a new version shows on the next load.
- The ping test and `incidents.json` always go to the network and are never cached.
  Offline, ping results show as failed, which is the correct reading.
- The service worker runs only over http(s), such as GitHub Pages or a local server.
  It does not run when `index.html` is opened as a file.
- Icons are in `icons/` (192x192 and 512x512 PNG). Chrome offers "Install" over https or localhost.

## How data is stored

All records live in the browser's localStorage under the key `sqm-incidents`.
There is no remote database.

- Data stays in one browser profile on one computer, at one web address.
  Another computer, browser, or profile starts empty.
- Clearing site data deletes the records. Keep a JSON backup.
- Open only one tab at a time. Each tab writes its whole copy back, so two tabs can
  overwrite each other.
- The ping history keeps the newest 200 results (about 100 minutes). Incidents are not capped.
- Ping values are HTTP round trips, because browsers cannot send ICMP pings.
  Expect them to be higher than the `ping` command shows.

## Save JSON and Load JSON

**Save JSON** downloads `incidents.json` with all incidents and the ping log:

```json
{
  "version": 1,
  "incidents": [
    { "time": "2026-11-01T02:10:03.114Z",
      "type": "Remote Desktop",
      "ping": { "time": "2026-11-01T02:09:50.104Z", "ms": 55 } }
  ],
  "pings": [
    { "time": "2026-11-01T02:09:50.104Z", "ms": 55 },
    { "time": "2026-11-01T02:09:20.001Z", "ms": null, "reason": "timeout" }
  ]
}
```

Times are UTC (ISO 8601) and are shown in local time.

**Load JSON** merges a file into the current data. It never deletes records.
Incidents and pings are matched by their `time` value, and duplicates are skipped.

When the page is served from a web server, it also merges an `incidents.json` placed next to
`index.html` on page load. That file is listed in `.gitignore` so personal data is not published
by accident.

## Project status

Early prototype. Planned next: speed measurements on the same time axis.
