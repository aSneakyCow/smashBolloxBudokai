var container, scene, camera, renderer, raycaster, objects = [];
var keyState = {};
var inputUpdate = false;
var sphere;

var player, moveSpeed, turnSpeed, playerId;

var otherPlayers = [];

var loadWorld = function(){

    init();
    animate();
    function init(){

        //Setup------------------------------------------
        container = document.getElementById('container');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 5;
        //camera.lookAt( new THREE.Vector3(0,0,0));

        renderer = new THREE.WebGLRenderer( { alpha: true} );
        renderer.setSize( window.innerWidth, window.innerHeight);

        raycaster = new THREE.Raycaster();
        //Add Objects To the Scene HERE-------------------

        //Sphere------------------
        // var sphere_geometry = new THREE.SphereGeometry(1);
        // var sphere_material = new THREE.MeshNormalMaterial();
        // sphere = new THREE.Mesh( sphere_geometry, sphere_material );

        // scene.add( sphere );
        // objects.push( sphere ); //if you are interested in detecting an intersection with this sphere

        //Events------------------------------------------
        document.addEventListener('click', onMouseClick,    false );
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp,     false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseout', onMouseOut,   false);
        document.addEventListener('keydown', onKeyDown,     true );
        document.addEventListener('keyup', onKeyUp,         false );
        window.addEventListener( 'resize', onWindowResize,  false );

        //Final touches-----------------------------------
        container.appendChild( renderer.domElement );
        document.body.appendChild( container );
    }

    function animate(){
        requestAnimationFrame( animate );
        render();
    }

    function render(){

        if ( player ){

            updateCameraPosition();

            checkKeyStates();

            camera.lookAt( player.coll.position );
            // console.log(player.position)
        }
        //Render Scene---------------------------------------
        renderer.clear();
        renderer.render( scene , camera );
    }

    function onMouseClick(){
        // intersects = calculateIntersects( event );

        // if ( intersects.length > 0 ){
        //     //If object is intersected by mouse pointer, do something
        //     if (intersects[0].object == sphere){
        //         alert("This is a sphere!");
        //     }
        // }
    }

    function onMouseDown(){

    }
    function onMouseUp(){

    }
    function onMouseMove(){

    }
    function onMouseOut(){

    }
    function onKeyDown( event ){
        //event = event || window.event;
        keyState[event.keyCode || event.which] = true;
        inputUpdate = true;
    }

    function onKeyUp( event ){
        //event = event || window.event;
        keyState[event.keyCode || event.which] = false;
        inputUpdate = false;

    }
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }
    function calculateIntersects( event ){
        //Determine objects intersected by raycaster
        event.preventDefault();

        var vector = new THREE.Vector3();
        vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
        vector.unproject( camera );

        raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );

        // var intersects = raycaster.intersectObjects( objects );

        return intersects;
    }
};
 
var createLocalPlayer = function( data ){
    // console.log(data)
    var mesh = createMeshForPlayer( data.state )
    var info = new PlayerState();

    player = { id:data.id, state:info, coll:mesh }

    objects.push( player );
    scene.add( player.coll );

    updateCameraPosition();
    camera.lookAt( player.coll.position );
}

var createPlayer = function(data){
    var mesh = createMeshForPlayer( data.state )
    var newPlayer = { id:data.id, state:data.state, coll:mesh }
    objects.push( newPlayer );
    return newPlayer;
};

var addOtherPlayer = function(data){
    var otherPlayer = createPlayer( data )
    console.log("addOtherPlayer")

    otherPlayers.push( otherPlayer );
    scene.add( otherPlayer.coll );
};

var updateCameraPosition = function(){
    camera.position.z = player.coll.position.z + 0 * Math.cos( player.coll.rotation.y );
    camera.position.x = 10;
    camera.position.y = 3;
};

var updatePlayerPhysics = function(data){
    // console.log("incoming data")
    for(var i = 0; i < otherPlayers.length + 1; i++){
        updateAllPlayers(data[i])
    }

}

var updateAllPlayers = function(data){
    var pos = data.state.position
    var rot = data.state.rotation
    var somePlayer = playerForId(data.id);

    if(data.id == player.id){
        player.coll.position.x = pos.x;
        player.coll.position.y = pos.y;
        player.coll.position.z = pos.z;

        player.coll.rotation.x = rot.x;
        player.coll.rotation.y = rot.y;
        player.coll.rotation.z = rot.z;    
    } else {
        somePlayer.coll.position.x = data.state.position.x;
        somePlayer.coll.position.y = data.state.position.y;
        somePlayer.coll.position.z = data.state.position.z;

        somePlayer.coll.rotation.x = data.state.rotation.x;
        somePlayer.coll.rotation.y = data.state.rotation.y;
        somePlayer.coll.rotation.z = data.state.rotation.z;
    }
};
 
var checkKeyStates = function(){
    if(inputUpdate){    //there's lag on this now, so fix it later
        socket.emit('updatePosition', player.id, keyState);
    } 
};

var removeOtherPlayer = function(id){
    index = getIndex(id)

    scene.remove( otherPlayers[index].coll );
    otherPlayers.splice( index, 1);
};

var getIndex = function(id){
    for (var i = 0; i < otherPlayers.length; i++){
        if (otherPlayers[i].id === id){
            break;
        }
    }
    return i;
};

var playerForId = function(id){
    for (var i = 0; i < otherPlayers.length; i++){
        if (otherPlayers[i].id == id){
            return otherPlayers[i];
        }
    }
};

var getPlayers = function(){
    for (var i = 0; i < otherPlayers.length; i++){
        console.log(otherPlayers[i].state)
    }
};