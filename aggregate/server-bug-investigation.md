# Server Bug Investigation - Spatial Filtering 500 Error

## Date
2026-05-28

## Symptom
When spatial filtering is enabled in the aggregate application (toggle button "סינון מרחבי" set to ON), the GovMap aggregate API returns **500 Internal Server Error**.

## Application Behavior
- **Default state**: Toggle is ON by default
- **Expected behavior**: When toggle is ON, aggregate results should filter by the visible map extent (bbox)
- **Actual behavior**: 500 error occurs, preventing any results from displaying
- **Workaround**: Currently operating with bbox filtering disabled (using `view_mode: 'global'` only)

## Request Structure
The client sends a properly formatted request according to the API specification:

```javascript
{
  source: {
    layer: 'layer_234365',
    srid: 2039  // ITM coordinates
  },
  operation: {
    type: 'count'
  },
  grouping: {
    group_by: 'company'
  },
  filter: {
    view_mode: 'extent',  // Using govmap.aggViewMode.Extent enum
    bbox: [177371, 651528, 197306, 669248]  // [minX, minY, maxX, maxY] in ITM
  },
  output: {
    include_percentage: true,
    limit: 100
  }
}
```

## Server-Side Code Analysis

### Where Builder (geospatial-aggregation service)
File: `C:\dev\govmap-cloud\apps\app-services\geospatial-aggregation\src\app\aggregate\where-builder.ts`

Lines 114-147 show the bbox filtering logic:

```typescript
// Bounding box filter — skipped when view_mode=global
if (request.filter?.bbox && request.filter?.view_mode !== 'global') {
  const [minX, minY, maxX, maxY, inputSrid, storageSrid] = [
    ...request.filter.bbox,
    request.source.srid ?? WGS84_SRID,
    layerInfo.srid,
  ].map((value) => Number(value));
  
  const geomColumn = `t."${layerInfo.geomColumn}"`;

  if (inputSrid === storageSrid) {
    clauses.push(
      `ST_Intersects(${geomColumn}, ST_MakeEnvelope(`
      + `$${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, ${storageSrid}))`
    );
    params.push(minX, minY, maxX, maxY);
    idx += 4;
  } else {
    clauses.push(
      `ST_Intersects(${geomColumn}, ST_Transform(ST_MakeEnvelope(`
      + `$${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, ${inputSrid}), ${storageSrid}))`
    );
    params.push(minX, minY, maxX, maxY);
    idx += 4;
  }
}
```

**Key points:**
- Bbox filtering uses PostGIS `ST_Intersects` with `ST_MakeEnvelope`
- SRID transformation applied when input SRID differs from storage SRID
- Uses `layerInfo.geomColumn` to identify the geometry column

## Investigation Findings

1. ✅ **Request structure is correct** - Matches API contract with proper enum values
2. ✅ **SRID handling is correct** - Client sends ITM (2039), server transforms if needed
3. ✅ **View mode logic is correct** - Server code properly skips bbox when view_mode='global'
4. ❓ **Geometry column reference** - Potential issue with `layerInfo.geomColumn` value or column existence

## Suspected Root Cause

The 500 error likely occurs in the SQL execution when:
- The geometry column name (`layerInfo.geomColumn`) is incorrect or missing in `layer_234365`
- The geometry column data is corrupted or in an unexpected format
- The SRID stored in `layers_definition` doesn't match the actual geometry column SRID

## Related Context

**From previous session notes:**
> "Pending tasks related to testing the geometry column fixes after rebuilding the geospatial-aggregation service"

This suggests there were known issues with geometry column handling that required a service rebuild.

## Recommendations for Further Investigation

1. **Verify geometry column name**: Check `layers_definition.geomColumn` for `layer_234365`
   ```sql
   SELECT id, "tableName", "geomColumn", srid 
   FROM layers_definition 
   WHERE id = 'layer_234365';
   ```

2. **Verify geometry data**: Check if the geometry column exists and contains valid data
   ```sql
   SELECT "geomColumn_name", ST_SRID("geomColumn_name"), ST_IsValid("geomColumn_name")
   FROM table_234365
   LIMIT 5;
   ```

3. **Check server logs**: Review the geospatial-aggregation service logs for the exact SQL error and stack trace

4. **Test with different layers**: Try bbox filtering with other layers to determine if it's layer-specific or a general issue

## Current Workaround

The application operates without spatial filtering by:
- Using `view_mode: 'global'` which bypasses bbox filtering entirely
- Showing all companies across the entire dataset
- No filtering by visible map extent

## Status

**UNRESOLVED** - The root cause of the 500 error has not been definitively identified. The application works with global mode but spatial filtering remains broken.
