import { overlay } from './landcanvas.js';

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


function main(){

  const defaultCordinates= [77.1025, 9.9189]; //Default location for this project(Cordinates of Idukki, Kerala, India)
  let earthRadius= 6378; //radius of sphere1(Earth)
  
  //setting up earth(globe)
  const mainSphere= new THREE.SphereGeometry(earthRadius,64,64); //creating geometry
  const textureimg= new THREE.TextureLoader().load('textures/earth.jpg');
  const texturebump= new THREE.TextureLoader().load('textures/bump.jpg');
  const texturespec= new THREE.TextureLoader().load('textures/spec.jpg')
  var material= new THREE.MeshPhongMaterial({ map:textureimg, bumpMap:texturebump, specularMap:texturespec }); //creating material& adding texture
 

  var earthmesh= new THREE.Mesh(mainSphere, material); //adding geometry and material to mesh
    
  // Setup renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('viz').appendChild(renderer.domElement);

  //function to convert lat long to cartesian cordinates
  function degToCart(cordinates){
    const degrees = {
      azimuth: 90+cordinates[0],   // angle around the vertical axis (0 to 360)
      inclination: 90-cordinates[1] // angle above the horizontal plane (0 to 180)
    };
    const azimuth = THREE.MathUtils.degToRad(degrees.azimuth);
    const inclination = THREE.MathUtils.degToRad(degrees.inclination);
    
    // Create a spherical coordinate
    const spherical = new THREE.Spherical(earthRadius, inclination, azimuth);
    
    // Create a vector representing the Cartesian coordinates
    const cartesian = new THREE.Vector3().setFromSpherical(spherical);

    return cartesian;

  }

  //function to convert cartesian cordinates to lat long
  function cartToDeg(cartcords){
    var sphericalcords= new THREE.Spherical(earthRadius).setFromVector3(cartcords);
    var lt= 90-THREE.MathUtils.radToDeg(sphericalcords.phi);
    var lg= -(90-THREE.MathUtils.radToDeg(sphericalcords.theta));
    let degcord=[lt,lg];

    return degcord;
  }

  let xyz= degToCart(defaultCordinates);
  let cx=xyz.x;
  let cy=xyz.y;
  let cz=xyz.z;

  // Setup scene
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xbbbbbb));
  scene.add(new THREE.DirectionalLight(0xffffff, 0.6));
  
  scene.add(overlay());
  
  scene.add(earthmesh);

  var displayElement = document.getElementById('displayText');
  var cordElement= document.getElementById('cordText');
  cordElement.textContent= defaultCordinates[0]+ ", "+defaultCordinates[1]


  // Setup camera
  const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,1,20000);
  //camera.position.set(1425,cy,-6160); //use cx,cy,cz for exact location. This is for demo
  
  //camera.lookAt(0,0,0);
  camera.updateProjectionMatrix();
  
  //creating camera moving animation to the target area
  const startPosition= new THREE.Vector3(1425,9000,-6160);//1425,9000,-6160
  const endPosition= new THREE.Vector3(1417.72,1105.789,-6136); //1425,cy,-6160
  const animDuration=5;

  const mixer= new THREE.AnimationMixer(camera);
  const track= new THREE.VectorKeyframeTrack('.position',[0,animDuration],[startPosition.x, startPosition.y, startPosition.z,
                            endPosition.x, endPosition.y, endPosition.z]);

  const clip= new THREE.AnimationClip('CameraAnimation', animDuration,[track]);
  const action= mixer.clipAction(clip);

  action.setLoop(THREE.LoopOnce);
  action.clampWhenFinished=true;
  action.play();


  //finding coordinates on right mouse click
  const raycaster= new THREE.Raycaster();
  var mouse= new THREE.Vector2;

  function onMouseClick(event){
    event.preventDefault();
    mouse.x=(event.clientX/window.innerWidth)*2-1;
    mouse.y=-(event.clientY/window.innerHeight)*2+1;

    raycaster.setFromCamera(mouse,camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
  
    if (intersects.length > 0) {
      // Get the first intersected object and its position
      var intersectedObject = intersects[0].object;
      var intersectedPoint = intersects[0].point;

      let degcord= cartToDeg(intersectedPoint);
      cordElement.textContent=degcord[0]+", "+degcord[1];

    }
  }

  window.addEventListener('contextmenu', onMouseClick,true);

  // Add camera controls
  var controls= new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,0);
  controls.minDistance=6385;
  controls.maxDistance=40000;
  controls.enableDamping=true;
  controls.dampingFactor=0.05;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  };

 

  //function to adjust orbital controls speed based on camera z-distance
  function controlSpeed(){
    controls.zoomSpeed= (controls.getDistance()-6378)*0.0001;
    controls.rotateSpeed= (controls.getDistance()-6378)*0.0001;
  
  }
  

  // Kick-off renderer
  (function animate() { // IIFE
    
    mixer.update(0.025);
    camera.updateProjectionMatrix();
    controlSpeed();
    controls.update();
    displayElement.textContent =controls.getDistance()-6378+" KMs";
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

    }
    main();
