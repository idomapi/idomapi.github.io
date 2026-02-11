async function initGovMap() {
    govmap.createMap('map', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["layer_153830", 'layer_154112'],
        visibleLayers: ["layer_153830", 'layer_154112'],
        showXY: true,
        isEmbeddedToggle: false,
        background: 40,
        layersMode: 1,
        center: { x: 179479, y: 663973 },
        level: 10,
    });
}