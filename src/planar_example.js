import * as itowns from 'itowns';
import * as THREE from 'three';
import proj4 from 'proj4';

proj4.defs('EPSG:3946', '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

const extent = new itowns.Extent(
    'EPSG:3946',
    1837816.94334, 1847692.32501,
    5170036.4587, 5178412.82698);

const centerMap = new itowns.Coordinates('EPSG:3946', 1840839, 5172718, 0);

const viewerDiv = document.getElementById('viewerDiv');
const view = new itowns.PlanarView(viewerDiv, extent, {
    placement: {
        coord: centerMap,
        heading: 45,
        range: 1800,
        tilt: 30,
    }
});
const scene = view.scene;

const wmsImagerySource = new itowns.WMSSource({
    url: 'https://imagerie.data.grandlyon.com/wms/grandlyon',
    networkOptions: { crossOrigin: 'anonymous' },
    version: '1.3.0',
    name: 'ortho_latest',
    crs: 'EPSG:3946',
    extent: extent,
    format: 'image/jpeg',
});

const wmsImageryLayer = new itowns.ColorLayer('wms_imagery', {
    transparent: false,
    source: wmsImagerySource,
});

view.addLayer(wmsImageryLayer);

// Add a WMS elevation source
const wmsElevationSource = new itowns.WMSSource({
    extent: extent,
    url: 'https://imagerie.data.grandlyon.com/wms/grandlyon',
    name: 'MNT2018_Altitude_2m',
    crs: 'EPSG:3946',
    width: 256,
    format: 'image/jpeg',
});

// Add a WMS elevation layer
const wmsElevationLayer = new itowns.ElevationLayer('wms_elevation', {
    useColorTextureElevation: true,
    colorTextureElevationMinZ: 144,
    colorTextureElevationMaxZ: 622,
    source: wmsElevationSource,
});

view.addLayer(wmsElevationLayer);

let tile;

function altitudeLine(properties, coordinates) {
    let result;
    let z = 0;
    if (coordinates) {
        result = itowns.DEMUtils.getTerrainObjectAt(view.tileLayer, coordinates, 0, tile);
        if (!result) {
            result = itowns.DEMUtils.getTerrainObjectAt(view.tileLayer, coordinates, 0);
        }
        if (result) {
            tile = [result.tile];
            z = result.coord.z;
        }
        return z + 5;
    }
}

function acceptFeatureBus(properties) {
    return properties.sens === "Aller";
}

const lyonTclBusSource = new itowns.WFSSource({
    url: "https://data.grandlyon.com/geoserver/sytral/ows?",
    protocol: 'wfs',
    version: '2.0.0',
    id: 'tcl_bus',
    typeName: "tcl_sytral.tcllignebus_2_0_0",
    crs: 'EPSG:3946',
    extent: {
        west: 1822174.60,
        east: 1868247.07,
        south: 5138876.75,
        north: 5205890.19,
    },
    format: 'application/json',
});

const colorsLine = new Map();

const colorLine = (properties) => {
    const line = properties.ligne;
    let color = colorsLine.get(line);
    if (color === undefined) {
        color = new THREE.Color(0xffffff * Math.random());
        colorsLine.set(line, color);
    }
    return colorsLine.get(line);
}

const lyonTclBusLayer = new itowns.FeatureGeometryLayer('lyon_tcl_bus', {
    filter: acceptFeatureBus,
    source: lyonTclBusSource,
    zoom: { min: 1 },
    style: {
        stroke: {
            base_altitude: altitudeLine,
            color: colorLine,
            width: 5,
        }
    }
});

const orange = new THREE.Color(0xffa400);
const blue = new THREE.Color(0x47edff);
const black = new THREE.Color(0x000000);
const red = new THREE.Color(0xff0000);
const color = new THREE.Color();

function colorBuildings(properties, ctx) {
    if (properties.usage_1 === 'Résidentiel') {
        color.set(0xFDFDFF);
    } else if (properties.usage_1 === 'Annexe') {
        color.set(0xC6C5B9);
    } else if (properties.usage_1 === 'Commercial et services') {
        color.set(0x62929E);
    } else if (properties.usage_1 === 'Religieux') {
        color.set(0x393D3F);
    } else if (properties.usage_1 === 'Sportif') {
        color.set(0x546A7B);
    } else {
        color.set(0x555555);
    }

    return color;
}


function extrudeBuildings(properties) {
    return properties.hauteur;
}

function altitudeBuildings(properties) {
    return properties.altitude_minimale_sol;
}

function acceptFeature(properties) {
    return !!properties.hauteur;
}

const wfsBuildingSource = new itowns.WFSSource({
    url: 'https://wxs.ign.fr/topographie/geoportail/wfs?',
    version: '2.0.0',
    typeName: 'BDTOPO_V3:batiment',
    crs: 'EPSG:4326',
    ipr: 'IGN',
    format: 'application/json',
    extent: {
        west: 4.568,
        east: 5.18,
        south: 45.437,
        north: 46.03,
    },
});

const wfsBuildingLayer = new itowns.FeatureGeometryLayer('wfsBuilding', {
    batchId: function (property, featureId) { return featureId; },
    filter: acceptFeature,
    crs: 'EPSG:3946',
    source: wfsBuildingSource,
    zoom: { min: 4 },

    style: {
        fill: {
            color: colorBuildings,
            base_altitude: altitudeBuildings,
            extrusion_height: extrudeBuildings,
        }
    }
});

view.addLayer(wfsBuildingLayer);

const wfsCartoSource = new itowns.WFSSource({
    url: 'https://wxs.ign.fr/cartovecto/geoportail/wfs?',
    version: '2.0.0',
    typeName: 'BDCARTO_BDD_WLD_WGS84G:zone_habitat_mairie',
    crs: 'EPSG:3946',
    ipr: 'IGN',
    format: 'application/json',
});

const wfsCartoStyle = {
    zoom: { min: 0, max: 20 },
    text: {
        field: '{toponyme}',
        color: (p) => {
            switch (p.importance) {
                case 'Quartier de ville':
                    return 'Cornsilk';
                case 'Hameau':
                    return 'WhiteSmoke';
                case 'Chef-lieu de commune':
                default:
                    return 'white';
            }
        },
        transform: 'uppercase',
        size: (p) => {
            switch (p.importance) {
                case 'Quartier de ville':
                    return 11;
                case 'Hameau':
                    return 13;
                case 'Chef-lieu de commune':
                default:
                    return 15;
            }
        },
        haloColor: 'rgba(20,20,20, 0.8)',
        haloWidth: 3,
    },
};

const wfsCartoLayer = new itowns.LabelLayer('wfsCarto', {
    source: wfsCartoSource,
    style: wfsCartoStyle,
});

view.addLayer(wfsCartoLayer);

view.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, function m() {
    view.addLayer(lyonTclBusLayer);
});

export default {};

