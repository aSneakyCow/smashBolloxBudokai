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


    if(world.getDisconnets().length){
        console.log(world.getDisconnets())
        packet.disconnects = disconnects
    }

    if(world.getConnectEvents()){
        connectEvents = world.getConnectEvents()
    }

    for(player in playerStates){
        loop2:
        for(c in connectEvents){
            if(connectEvents[c].targetId == playerStates[player].id){
                packet.newConnection = connectEvents[c].entities
                world.setInitialized(playerStates[player].id)
                break loop2;
            } 
        }

        playerId = playerStates[player].id
        packet.playerStates = playerStates;

        if(packet.newConnection == true || playerStates[player].state.initialized ){
            emitToPlayer(playerId, packet)
        }
    }                   

    world.clearEvents()
}

function emitToPlayer(id, data) {
    io.sockets.connected[id].emit('setClientEntities', 
        {
         playerStates: data.playerStates,
         newConnection: data.newConnection,
         disconnects:   data.disconnects,
        });
}

// Handle connection
io.on('connection', function(socket){
    console.log('a user connected');

    var id = socket.id;
    world.addPlayer(id);

    var player = world.playerForId(id);

    // socket.emit('createPlayer', world.getNetPlayer(player), world.getCurrentMap());

    socket.broadcast.emit('addOtherPlayer', world.getNetPlayer(player));

    socket.on('getEntities', function(){
        world.getClientWorld(player); 
    });

    // socket.on('requestOldPlayers', function(){
    //     for (var i = 0; i < world.players.length; i++){
    //         if (world.players[i].id != id){
    //             console.log("emit addOtherPlayer")
    //             socket.emit('addOtherPlayer', world.getNetPlayer(world.players[i]));
    //         }
    //     }
    // });

    socket.on('updatePosition', function(id, input){
        world.addInputEvent({id: id, input: input})
        // io.emit('updateAllPlayers', netPlayer);                  //all
        // socket.emit('updateAllPlayers', newData);           //only player
        // socket.broadcast.emit('updateAllPlayers', newData); //all other players
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        world.queueDisconnect( player.id );
        //check if there are no more players, then MainLoop.stop()
    });

});

// Handle environment changes
var port = process.env.PORT || 8080;
// var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
 
http.listen( port, /*ip_address,*/ function(){
    console.log( "Listening on server_port " + port );
}); 