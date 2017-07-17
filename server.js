var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)

var world = require('./js/server_world');
var MainLoop = require('./js/mainloop.js')
 
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/client/client_world.js', function(req, res){
    res.sendFile(__dirname + '/client/client_world.js');
});

app.get('/js/shared.js', function(req, res){
    res.sendFile(__dirname + '/js/shared.js');
});

app.get('/client/physi.js', function(req, res){
    res.sendFile(__dirname + '/client/physi.js');
}); 
 
app.get('/js/mainloop.js', function(req, res){
    res.sendFile(__dirname + '/js/mainloop.js');
});

//I don't like this setup :<>
world.loadWorld();

MainLoop.setUpdate(update)
    .setDraw(draw)
    .start()

// The amount of time since the last update, in seconds.
function update(delta) { 
    world.stepScene(delta); 
    emitToAll();
}
// How much to interpolate between frames.
function draw(interpolationPercentage) {
}
function end(fps, panic) {
}

function emitToAll() {
    var playerStates = world.getAllNetPlayers()
    var disconnects = world.getDisconnets()
    var connectEvents;
    var playerId;
    var packet = {}
    var newPlayers = world.getNewPlayers()

    if(world.getDisconnets().length){
        console.log("Disconnects:")
        console.log(world.getDisconnets())
        packet.disconnects = disconnects
    }

    if(newPlayers.length){
        packet.newPlayers = newPlayers
    }

    if(world.getConnectEvents()){
        connectEvents = world.getConnectEvents()
    }

    for(player in playerStates){
        loop2:
        for(c in connectEvents){
            if( connectEvents[c].targetId == playerStates[player].id ){
                packet.firstConnection = connectEvents[c].entities
                world.setInitialized(playerStates[player].id)
                break loop2;
            } 
        }

        playerId = playerStates[player].id
        packet.playerStates = playerStates;

        if(packet.firstConnection == true || playerStates[player].state.initialized ){
            emitToPlayer(playerId, packet)
        }
    }                   

    world.clearEvents()
}

function emitToPlayer(id, data) {
    io.sockets.connected[id].emit('setClientEntities', 
        {
         playerStates: data.playerStates,
         firstConnection: data.firstConnection,
         disconnects:   data.disconnects,
         newPlayers:   data.newPlayers,
        });
}

// Handle connection
io.on('connection', function(socket){
    console.log('a user connected');

    var id = socket.id;
    world.addPlayer(id);

    var player = world.playerForId(id);

    // socket.broadcast.emit('addOtherPlayer', world.getNetPlayer(player));

    socket.on('getEntities', function(){
        world.getClientWorld(player); 
    });

    socket.on('updatePosition', function(id, input){
        world.addInputEvent({id: id, input: input}) 
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        world.queueDisconnect( player.id );
    });

});

// Handle environment changes
var port = process.env.PORT || 8080;
 
http.listen( port, /*ip_address,*/ function(){
    console.log( "Listening on server_port " + port );
}); 