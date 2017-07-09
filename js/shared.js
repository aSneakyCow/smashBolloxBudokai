//basically need the same code for client and server

if (typeof module !== "undefined" && module.exports) {
	// console.log("creating THREE")
    var NodePhysijs = require('./main.js');
    var THREE = NodePhysijs.THREE;
    var Ammo = NodePhysijs.Ammo;
    var Physijs = NodePhysijs.Physijs(THREE, Ammo);
 
    console.log("Including Three!!")
} else {
	console.log("THREE already defined")
}

// var loader = new THREE.JSONLoader();

var loadLevelFromUrl = function(data){
    for(model in data){
        var material = new THREE.MeshNormalMaterial();
        var mesh = new Three.Mesh( obj, material );
        scene.add( mesh );
    }
} 

var loadLevel = function(data){
    // console.log(data)
    for(model in data){
            var pos = data[model].pos;
            var rot = data[model].rot;
            var dim = data[model].dim;
            var geo = new THREE.CubeGeometry(dim[0], dim[1], dim[2]);
            // var geo = new THREE.BoxGeometry(dim[0], dim[1], dim[2]);
            var material = new THREE.MeshNormalMaterial();
            var level = new THREE.Mesh( geo, material );

            //will need to change this to a physi mesh when doing prediction
            level = setMesh(level, rot, pos, dim)
            scene.add( level );
    }  
}

function setPlayerMesh(player){
	var r = {x:{},y:{},z:{}}
	var p = {x:{},y:{},z:{}}
    
	if(player){
		p.x = player.position.x
		p.y = 3
        p.z = player.position.y

		r.x = player.rotation.x
		r.y = player.rotation.y
		r.z = player.rotation.z
	} else {
		p.x = 0
		p.y = 3
		p.z = 0

		r.x = 0
		r.y = 0
		r.z = 0
	}

    var material = new THREE.MeshNormalMaterial();
    var cube_geometry = new THREE.CubeGeometry(1, 2, 1);
    // var cube_geometry = new THREE.BoxGeometry(1, 2, 1);
    mesh = new Physijs.BoxMesh(cube_geometry, material, 5);


    mesh = setMesh( mesh, [r.x, r.y, r.z], [p.x, p.y, p.z] );

    return mesh;
}

function setMesh(mesh, rot, pos, dim){
    mesh.position.x = pos[0]
    mesh.position.y = pos[1]
    mesh.position.z = pos[2]
    mesh.rotation.x = rot[0]
    mesh.rotation.y = rot[1]
    mesh.rotation.z = rot[2]
    mesh.locRot = {rot: rot, pos:pos, dim:dim}
    return mesh;
}

function PlayerState(){
    this.position = {};
    this.rotation = {};
    this.position.x = 0;
    this.position.y = 3;
    this.position.z = 0;
    this.rotation.x = 0;
    this.rotation.y = 0;
    this.rotation.z = 0;
    this.sizeX = .25;
    this.sizeY = .25;
    this.sizeZ = 1;
    this.speed = 0.1;
    this.turnSpeed = 0.03;
}

function createMeshForPlayer(player){
	var mesh = setPlayerMesh(player);
	return mesh;
}

function createNewPlayer(id){
	var mesh = setPlayerMesh();
    var info = new PlayerState();
    return {id: id, state: info, coll: mesh}
}

if (typeof module !== "undefined" && module.exports) {
	// module.exports.createMeshForPlayer = createMeshForPlayer
    module.exports.setMesh = setMesh
    module.exports.loadLevelFromUrl = loadLevel
	module.exports.loadLevelFromUrl = loadLevelFromUrl
	module.exports.createNewPlayer = createNewPlayer
}



