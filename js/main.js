
let CAMERA_ROTATION_RADIUS = 9; // make const after testing
let SHADOW_CAMERA_SIZE = 10;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  90,
  4/3,
  0.1,
  1000
);
camera.position.y = 1.8;
camera.position.z = 9;
camera.lookAt(0,0,0);
let renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById("le-canvas"), 
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.ma

function CreateCube() {
  let geometry = new THREE.BoxGeometry(1,1,1);
  let material = new THREE.MeshStandardMaterial( {color: 0xffffff } );
  material.roughness = 1.0;
  material.metalness = 0.0;
  let cube = new THREE.Mesh( geometry, material );
  cube.castShadow = true;
  return cube;
}

function CreatePlane(width, height) {
  let geometry = new THREE.PlaneGeometry(width, height);
  let material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });
  material.roughness = 1.0;
  material.metalness = 0.0;
  let plane = new THREE.Mesh( geometry, material );
  plane.rotation.x = Math.PI / 2;
  plane.position.y = -0.5;
  plane.receiveShadow = true;
  return plane;
}

function CreatePointLight(color, geometry) {
  let light = new THREE.PointLight( 0xffff00, 0.75, 0, 2);
  let lightsource_material = new THREE.MeshBasicMaterial({color: color});
  light.add(new THREE.Mesh(geometry, lightsource_material));
  light.position.set(1.5, 1, 1.5);
  light.castShadow = true;
  light.shadow.mapSize.width = 512;  // default
  light.shadow.mapSize.height = 512; // default
  light.shadow.camera.near = 0.5;       // default
  light.shadow.camera.far = 500;      // default
  return light;
}

amb_light = new THREE.AmbientLight(0xffffff);
amb_light.intensity = 0.1;
scene.add(amb_light);

dir_light = new THREE.DirectionalLight( 0x26cdc0, 0.6 );
dir_light.position.set( -1, 1.75, 1 );
dir_light.position.multiplyScalar( 30 );
dir_light.castShadow = true;
// dir_light.shadow.camera.near = 0.5;
// dir_light.shadow.camera.far = 10000;
dir_light.shadow.camera.top = SHADOW_CAMERA_SIZE;
dir_light.shadow.camera.bottom = -SHADOW_CAMERA_SIZE;
dir_light.shadow.camera.left = -SHADOW_CAMERA_SIZE;
dir_light.shadow.camera.right = SHADOW_CAMERA_SIZE;
dir_light.shadow.mapSize.width = 1024;
dir_light.shadow.mapSize.height = 1024;
// dir_light.shadow.ca
scene.add( dir_light );

let manager = new THREE.LoadingManager();
manager.onProgress = function(item, loaded, total) {
  console.log(item, loaded, total);
};

let onProgress = function(xhr) {
  if (xhr.lengthComputable) {
    let percentComplete = xhr.loaded / xhr.total * 100;
    console.log(Math.round(percentComplete, 2) + "% downloaded");
  }
};

let onError = function(xhr) {};

let loader = new THREE.OBJLoader(manager);

let clock = new THREE.Clock();
function UpdateScene() {
  let time = Date.now() * 0.0005;
  let delta = clock.getDelta();
  camera.position.x = Math.sin(time) * CAMERA_ROTATION_RADIUS;
  camera.position.z = Math.cos(time) * CAMERA_ROTATION_RADIUS;
  camera.lookAt(0,0,0);
}

let last_loaded_meshame = false;

function LoadMesh(meshname) {
  let path = "models/" + meshname + "/" + meshname + ".obj";
    loader.load(path, (object) => {
      if (last_loaded_meshame) {
        let previous_object = scene.getObjectByName(last_loaded_meshame);
        scene.remove(previous_object);
      }
      last_loaded_meshame = meshname;
      object.name = meshname;
      for (let i=0; i<object.children.length; i++) {
        let material = new THREE.MeshStandardMaterial( {color: 0xffffff } );
        material.metalness = 0.0;
        object.children[i].material = material;
        object.children[i].receiveShadow = true;
        object.children[i].castShadow = true;
      }
      scene.add(object);
  }, onProgress, onError);
}

let animate = function() {
  requestAnimationFrame(animate);
  UpdateScene();
  renderer.render( scene, camera );
};

animate();
