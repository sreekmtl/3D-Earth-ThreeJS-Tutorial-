import * as THREE from 'three';

/*** 
 * This js file loads the DEM and landsat image
 * Both the images are now loaded as png files from assets folder. But it can be also loaded from any map servers as WMS layers or as tiff files using TiffLoader addon of ThreeJS
 ***/

let bbox=[76.8485369367407429,9.7317189673059890,77.1207264675680193,10.1515915309470532] //bbox of part of idukki district


//adjusting the phistart and thetastart with respect to the lat-long system
//This is because longitude starts at an offset of 180 degs wrt phistart of ThreeJS spheregeometry and latitude has an offset of -90degs
var ps=180+parseFloat(bbox[0]) //phistart (ps)
var ts=90-parseFloat(bbox[3]) //thetastart (ts)

//function to check and remove negative value from bbox values
//This is to avoid neg lengths while substracting coordinates
function checkNeg(n){
    if(n<0){
        n=0-n;
    }
    return n;
}

for(let i=0;i<bbox.length;i++){
    bbox[i]=checkNeg(bbox[i]);
}

var pl= bbox[0]-bbox[2]; //philength (pl)
var tl= bbox[1]-bbox[3]; //thetalength (tl)

pl=checkNeg(pl);
tl=checkNeg(tl);

//converting pl and tl to radians
ps= ps*(Math.PI/180);
ts= ts*(Math.PI/180);
pl= pl*(Math.PI/180);
tl= tl*(Math.PI/180);

export function overlay(){

    const geometry= new THREE.SphereGeometry(6378,64,64,ps,pl,ts,tl);
    const textureimg= new THREE.TextureLoader().load('assets/l8idk22_crop.png'); //loading overlay image as wms layer
    const distext= new THREE.TextureLoader().load('assets/dem_crop.png');  //loading dem as wms layer


    //adding the textures to material
    var material= new THREE.MeshPhongMaterial({ map:textureimg,transparent:true,displacementMap:distext,displacementScale:1});

    //creating mesh (from material and geometry)
    var overlaymesh= new THREE.Mesh(geometry, material);


    return overlaymesh;
    
}