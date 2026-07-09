async function getStaticMap({
    bbox = '192405.42,676108.89,192484.07,676205.11',
    gushNum = 6433,
    parcelNum = 668,
    token = '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
    margin = 40,
    width = 1200,
    height = 800
} = {}) {
    const [minx, miny, maxx, maxy] = bbox.split(',').map(Number);
    const expandedBbox = `${minx - margin},${miny - margin},${maxx + margin},${maxy + margin}`;

    const sld = `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
 xmlns="http://www.opengis.net/sld"
 xmlns:ogc="http://www.opengis.net/ogc">

 <NamedLayer>
  <Name>parcel_all</Name>

  <UserStyle>
   <FeatureTypeStyle>

    <Rule>
      <PolygonSymbolizer>
        <Fill>
          <CssParameter name="fill">#000000</CssParameter>
          <CssParameter name="fill-opacity">0.0</CssParameter>
        </Fill>
        <Stroke>
          <CssParameter name="stroke">#2a63ff</CssParameter>
          <CssParameter name="stroke-width">2</CssParameter>
        </Stroke>
      </PolygonSymbolizer>
    </Rule>

    <Rule>
      <ogc:Filter>
        <ogc:And>

          <ogc:PropertyIsEqualTo>
            <ogc:PropertyName>gush_num</ogc:PropertyName>
            <ogc:Literal>${gushNum}</ogc:Literal>
          </ogc:PropertyIsEqualTo>

          <ogc:PropertyIsEqualTo>
            <ogc:PropertyName>parcel</ogc:PropertyName>
            <ogc:Literal>${parcelNum}</ogc:Literal>
          </ogc:PropertyIsEqualTo>

        </ogc:And>
      </ogc:Filter>

      <PolygonSymbolizer>
        <Fill>
          <CssParameter name="fill">#000000</CssParameter>
          <CssParameter name="fill-opacity">0.0</CssParameter>
        </Fill>
        <Stroke>
          <CssParameter name="stroke">#2d5bd1</CssParameter>
          <CssParameter name="stroke-width">6</CssParameter>
        </Stroke>
      </PolygonSymbolizer>

    </Rule>

   </FeatureTypeStyle>
  </UserStyle>

 </NamedLayer>

 <NamedLayer>
   <Name>sub_gush_all</Name>
 </NamedLayer>

</StyledLayerDescriptor>`;

    const formData = new URLSearchParams();

    formData.append('bbox', expandedBbox);
    formData.append('sld', sld);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('bgMapId', 0);
    formData.append('scaleline', true);
    formData.append('axis', true);
    formData.append('axisProjection', 'EPSG:2039');

    try {
        const response = await fetch(
            'https://www.govmap.gov.il/api/static-map/getMap',
            {
                method: 'POST',
                headers: {
                    'x-api-token': token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const parcelMap = document.getElementById('parcelMap');

        if (parcelMap) {
            if (parcelMap.src.startsWith('blob:')) {
                URL.revokeObjectURL(parcelMap.src);
            }

            parcelMap.src = imageUrl;
        }

        return imageUrl;
    } catch (error) {
        console.error('Error fetching static map:', error);
    }
}
