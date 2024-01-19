import * as itowns from 'itowns';

const placement = {
    coord: new itowns.Coordinates('EPSG:4326', 2.351323, 48.856712),
    range: 250000,
}

const viewerDiv = document.getElementById('viewerDiv');
const view = new itowns.GlobeView(viewerDiv, placement);


function addColorLayerFromConfig(config) {
    const layer = new itowns.ColorLayer('ortho', config);
    view.addLayer(layer);
}

function createWMTSSourceFromConfig(config) {
    config.source = new itowns.WMTSSource(config.source);
    return config;
}

itowns.Fetcher.json('Layers/Ortho.json').then(createWMTSSourceFromConfig).then(addColorLayerFromConfig);

export default placement;