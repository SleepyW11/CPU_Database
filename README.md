# CPU Database

A responsive CPU catalogue for browsing processor specifications, comparing core configurations, and exploring platform compatibility.

## Features

- Live processor data loaded from the [TechPowerUp CPU database API](https://www.techpowerup.com/cpu-specs/api/v1/chips)
- Search by processor name or architecture generation
- Dynamic filters for brand, release year, core count, and socket
- Paginated results for large API responses
- Detailed processor popup with architecture, performance, memory, and platform information
- Eight color themes, including light and dark palettes, with the selection saved locally
- Responsive layout for desktop and mobile screens
- Loading and error states while remote data is fetched

## Getting Started

The application is a static frontend. Run it through a local web server so the Fetch API can load the HTML snippets and remote data correctly.

For example, with VS Code Live Server or Five Server, open:

```text
index.html
```

## Project Structure

```text
index.html                   Page structure and controls
css/styles.css               Themes, visual design, and responsive layout
js/script.js                 API loading, filtering, pagination, and popup behavior
snippets/item-snippet.html   Processor catalogue card template
snippets/full-item-snippet.html
							 Full processor details template
```

## Data Source

Processor records are fetched at runtime from TechPowerUp. The application normalizes desktop API records released from 2022 onward for its cards and details view, and labels unavailable API fields as `Not listed` rather than filling them with estimates.

## Deployment

[View the deployed CPU Database](https://sleepyw11.github.io/CPU_Database)