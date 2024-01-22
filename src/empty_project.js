import * as itowns from 'itowns';
import * as THREE from 'three';
import proj4 from 'proj4';

proj4.defs('EPSG:2154','+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');

const extent = new itowns.Extent('EPSG:2154', -10, 10, -10, 10);
const viewerDiv = document.getElementById('viewerDiv');
const view = new itowns.PlanarView(viewerDiv, extent);
const scene = view.scene;

const geometry = new THREE.SphereGeometry( 1, 32, 32 );
const material = new THREE.MeshPhysicalMaterial();
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( - 1, 0, 1 ).normalize();
scene.add( directionalLight );

const light = new THREE.HemisphereLight( 0xffffff, 0x080820, 0.05 );
scene.add( light );

itowns.CameraUtils.animateCameraToLookAtTarget(view, view.camera.camera3D, {
	range : 5,
	tilt: 45,
	heading: -45,
});

scene.updateMatrixWorld(true);
view.tileLayer.visible = false;
// view.tileLayer.opacity = 0.00005;

export default {};

