var players = [];
var oldPlayers = []
oldPlayers[0] = []
var removePlayers = []
var connectEvents = []
var newPlayerIds = []

var scene;
var raycaster;
var objects = []
var map = []
var level = []

var inputEvents = []

var shared = require('./shared.js'); 

const NodePhysijs = require('./main.js');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE, Ammo);

var MainLoop = require('./mainloop.js')
// Physijs.scripts.worker = './js/physijs_worker.js'; 
//consider p2.js for 2d physics and only the 3d model for the drawing
// https://schteppe.github.io/p2.js/demos/concave.html
// https://github.com/schteppe/p2.js

var getCurrentMap = function(){
    // console.log("orientation:")
    // console.log(map[0].locRot)
    var objs = [];
    for(model in map)
        objs.push(map[model].locRot)
    return objs;
}

function stepScene(ms){
    for(player in removePlayers){
        // console.log( "removing " + removePlayers[player])
        removePlayer(removePlayers[player])
    }

    for(input in inputEvents){
        var event = inputEvents[input]
        updatePlayerData(event.id, event.input)
    }
 
    // scene.simulate();
}

var loadWorld = function(){
    // //Setup------------------------------------------
    // scene = new THREE.Scene();
    scene = new Physijs.Scene();

    scene.setGravity(new THREE.Vector3( 0, -30, 0 ));

    map = [
        // 'models/bridge.json', //convex mesh not working yet
        // 'models/leftpart.json',
        // 'models/leftsolidplat.json',
        // 'models/rightdropdown.json',
        // 'models/rightpart.json'
    ]

    // for(model in map){ 
        // var geo = require("../" + map[model])
        var material = new THREE.MeshNormalMaterial();
        var geo = new THREE.CubeGeometry(150, 100, 100);
        // var geo = new THREE.BoxGeometry(150, 100, 100);


        var mesh = new Physijs.BoxMesh(geo, material, 0 );

        // setMesh(mesh, rot, pos, dim)
        // mesh = shared.setMesh(mesh, [0, 0, 0], [-5, -0, -4], [10,3,50])
        mesh = shared.setMesh(mesh, [0, 0, 0], [-5, -3, -4], [20,2,20])

        map.push( mesh ) 
        scene.add( mesh );
    // }

    function calculateIntersects( ){
        // var vector = new THREE.Vector3();
        // vector.set( , , );
        // vector.unproject( camera );

        // raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );

        // var intersects = raycaster.intersectObjects( objects );

        // return intersects;
    }

}; 

var getConnectEvents = function(){
    return connectEvents;
}

var getNewPlayers = function(){
    return newPlayerIds;
}

var setInitialized = function(id){
    var player = playerForId(id)
    player.state.initialized = true
}

var getClientWorld = function(localPlayer){
    var entities = {}
    // entities.otherPlayers = getAllNetPlayers(localPlayer.id)
    entities.localPlayer = getNetPlayer(localPlayer)
    entities.level = getCurrentMap()

    connectEvents.push( {targetId:localPlayer.id, entities: entities})
    newPlayerIds.push( localPlayer.id )
}

var addInputEvent = function(event){
    inputEvents.push(event)
}

var queueDisconnect = function(id){
    // console.log('queueDisconnect')
    // console.log(id)
    removePlayers.push(id)
}


var clearEvents = function(){
    removePlayers.length = 0;
    inputEvents.length = 0;
    connectEvents.length = 0;
    newPlayerIds.length = 0;
}

var getDisconnets = function(){
    return removePlayers
}

var addPlayer = function(id){
    for(player in players){
        console.log("oldplayers " + players[player].id)
    }
    var player = shared.createNewPlayer(id);
    // console.log("New Player Created " + player.id)
    players.push( player );
    scene.add( player.coll ); 
};

var removePlayer = function(id){
    console.log("removePlayer")
    console.log(id)
    var index = getIndex(id);
    if (index > -1) {
        players.splice(index, 1);
    }
};

var updatePlayerData = function(id, input){
    var player = playerForId(id);
    var keyState = input;
    var updated = false;

    //moved these since the other things depend on these
    if (keyState[37] || keyState[65]) {
        // left arrow or 'a' - rotate left
        player.coll.rotation.y += player.state.turnSpeed;
        updated = true;
    }
    if (keyState[39] || keyState[68]) {
        // right arrow or 'd' - rotate right
        player.coll.rotation.y -= player.state.turnSpeed;
        updated = true;
    } 
    if (keyState[38] || keyState[87]) {
        // up arrow or 'w' - move forward
        player.coll.position.x -= player.state.speed * Math.sin(player.coll.rotation.y);
        player.coll.position.z -= player.state.speed * Math.cos(player.coll.rotation.y);
        updated = true;
    }
    if (keyState[40] || keyState[83]) {
        // down arrow or 's' - move backward
        player.coll.position.x += player.state.speed * Math.sin(player.coll.rotation.y);
        player.coll.position.z += player.state.speed * Math.cos(player.coll.rotation.y);
        updated = true;
    }
    if (keyState[81]) {
        // 'q' - strafe left
        player.coll.position.x -= player.state.speed * Math.cos(player.coll.rotation.y);
        player.coll.position.z += player.state.speed * Math.sin(player.coll.rotation.y);
        updated = true;
    }
    if (keyState[69]) {
        // 'e' - strage right
        player.coll.position.x += player.state.speed * Math.cos(player.coll.rotation.y);
        player.coll.position.z -= player.state.speed * Math.sin(player.coll.rotation.y);
        updated = true;
    }

    if(updated){ 
        collToState(player.coll, player.state);
    }

    return player;
};

function collToState(coll, state){
    state.position.x = coll.position.x;
    state.position.y = coll.position.y;
    state.position.z = coll.position.z;
    state.rotation.x = coll.rotation.x;
    state.rotation.y = coll.rotation.y;
    state.rotation.z = coll.rotation.z; 
}

var getIndex = function(id){
    var index
    for (var i = 0; i < players.length; i++){
        if (players[i].id === id){
            index = i
            break;
        }
    }
    return index;
};

var playerForId = function(id){
    var player;
    for (var i = 0; i < players.length; i++){
        if (players[i].id === id){
            player = players[i];
            break;
        }
    }
    return player;
};

var getAllNetPlayers = function(localId){
    var allNetPlayers = []
    for(player in players){
        if(localId){
            if(localId == players[player].id){
                continue;
            }
        }
        allNetPlayers.push(getNetPlayer(players[player]))
        // console.log(players[player].coll.position)
        collToState(players[player].coll, players[player].state)
    }

    return allNetPlayers
}

var getNetPlayer = function(player){
    var netPlayer = {}
    netPlayer.id = player.id;
    netPlayer.state = player.state;
    return netPlayer;
}

module.exports.setInitialized = setInitialized;
module.exports.getNewPlayers = getNewPlayers;
module.exports.getConnectEvents = getConnectEvents;
module.exports.getClientWorld = getClientWorld;
module.exports.getDisconnets = getDisconnets;
module.exports.clearEvents = clearEvents;
module.exports.queueDisconnect = queueDisconnect;
module.exports.addInputEvent = addInputEvent;
module.exports.stepScene = stepScene;
module.exports.getCurrentMap = getCurrentMap;
module.exports.loadWorld = loadWorld;
module.exports.players = players;
module.exports.addPlayer = addPlayer;
module.exports.updatePlayerData = updatePlayerData;
module.exports.playerForId = playerForId;
module.exports.getNetPlayer = getNetPlayer;
module.exports.getAllNetPlayers = getAllNetPlayers;
