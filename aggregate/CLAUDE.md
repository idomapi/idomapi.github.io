# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript application using the GovMap API to display map data and aggregate statistics. The app shows a cellular antenna layer on a map (70% width) and displays aggregated data grouped by company in a table (30% width) with optional spatial filtering.

## Development

Serve the application locally:
```bash
npx http-server -p 8000
```

Access at http://localhost:8000

## GovMap API Integration

- **Token (PROD)**: `8afbb7f6-f247-4b73-9366-635aaa7c9b1f` (idoz production, layer_234365)
- **Token (DEV)**: `8c430f7f-1e21-4434-b256-c5e91fac4005` (dev environment, layer_160238)
- **Current config**: Uses DEV token and layer by default
- **Promise handling**: ALWAYS use `.then()`, `.progress()`, and `.finally()` with GovMap functions. NEVER use `async`/`await`.

### Key GovMap patterns

Map initialization:
```javascript
govmap.createMap('map', {
    token: API_TOKEN,
    visibleLayers: [LAYER_NAME],
    onLoad: () => {
        // Register event listeners here
    }
});
```

Event handling:
```javascript
govmap.onEvent(govmap.events.EXTENT_CHANGE).progress(handlerFunction);
```

Aggregation with spatial filtering:
```javascript
govmap.aggregate({
    apiKey: API_TOKEN,
    source: { 
        layer: LAYER_NAME,
        srid: 2039  // ITM coordinates
    },
    operation: { type: 'count' },
    grouping: { group_by: 'company' },
    filter: {
        view_mode: govmap.aggViewMode.Extent,  // or govmap.aggViewMode.Global
        bbox: [minX, minY, maxX, maxY]  // ITM coordinates, only used with Extent mode
    },
    output: { include_percentage: true, limit: 100 }
}).then(function(result) {
    // Handle result
}).catch(function(error) {
    // Handle error
});
```

Response structure uses `count` field (not `value`) for grouped results:
```javascript
{ company: 'Name', count: 2954, percentage: 35.1 }
```

## Code Structure

- **index.html**: Main HTML structure with map and content containers, Hebrew language support, spatial analysis toggle
- **app.js**: Map initialization, EXTENT_CHANGE event handling with debouncing (500ms), aggregate API calls with spatial/global modes, table rendering, CSV export
- **style.css**: 70/30 split layout, RTL support, table styling with sum row, Excel export button styling

## Features

### Spatial Analysis Toggle (ניתוח מרחבי)
- **Default**: OFF (global aggregation across entire layer)
- **When OFF**: Shows all data without spatial filtering
- **When ON**: Filters data by visible map extent (bbox), updates automatically on map pan/zoom with 500ms debounce
- Toggle state controls whether EXTENT_CHANGE events trigger data fetching

### Data Display
- Table shows company name, count, percentage
- Sum row displays total count with 100.0% (not summed rounded values to avoid 99.9% issues)
- "מספר תוצאות" shows row count (number of companies), not total record count

### Excel Export
- Green Excel-style button with document icon
- Exports to CSV with Hebrew BOM (﻿) for proper Excel encoding
- Includes all data rows plus sum row with 100.0%
- Filename format: `aggregate_data_YYYY-MM-DD.csv`

## Spatial Filtering Implementation

The app uses the GovMap aggregate API's spatial filtering capability:
- **SRID 2039** (ITM) for bbox coordinates
- **view_mode**: `govmap.aggViewMode.Extent` (spatial) or `govmap.aggViewMode.Global` (no filter)
- **Event**: `EXTENT_CHANGE` provides bbox automatically on map load and pan/zoom
- **Debouncing**: 500ms delay prevents excessive API calls during map interaction
