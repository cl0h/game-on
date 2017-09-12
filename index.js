var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");
var io = require("socket.io")(http);

console.log("App started");
//Routing

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) 
{
	console.log("Serving index page");
    res.sendFile(__dirname + "/index.html");
});

//Event handlers

io.on("connection", function (socket) 
{

    console.log("Connected. ID: " + socket.id);
	io.emit("drawTable",table.players);

    socket.on("disconnect", function () 
	{
        console.log("Disconnected ID: " + socket.id);
    });

    socket.on("chat", function (msg) 
	{
        console.log("message: " + msg);
        
		//FUTURE: Persistent names - Check cookie for name using socket.request
		
		io.emit("chat", msg);
		console.log("chat msg sent.");
		
    });
	
	socket.on("clearTable", function () 
	{
        console.log("Clear sent by: " + socket.id);
		table.clear();
		io.emit("updateTable",table.players);
		console.log("update table sent");
	});
	
	socket.on("addPlayer", function (data) 
	{
		console.log("Add received from: " + socket.id + ". Data: " + JSON.stringify(data));
		
		if(table.full)
		{
			console.log("Table is full");
			io.sockets.connected[socket.id].emit("fullTable");
			console.log("Full table sent to " + socket.id);
			return;
		}
		table.addPlayer(new Player(data[0].name,socket.id));
		console.log("Player added. Sending Update Table event");
		io.emit("updateTable",table.players);
		
		 if (table.getLength() == 1 )
		 {	
			console.log("Broadcast new table event");
			socket.broadcast.emit('startTable');
			console.log("sent.");
			return;
		 }
	});
});

var table = new Table();

http.listen(3000, function () 
{
    console.log("listening on *:3000");
});


//Objects

function Table() {
    this.players = [];
	this.MAX_PLAYERS = 4;
    this.full = false;

    this.addPlayer = function (player) 
	{
        if(this.full=== true) return;
		this.players.push(player);
        if (this.players.length === this.MAX_PLAYERS) this.full = true;
    }

    this.logPlayers = function () 
	{
        console.log("Table Players: \n");
		var i;
        for (i = 0; i < this.players.length; i++) 
		{
            this.players[i].log();
        }
    }
	
	this.clear = function ()
    {
        console.log("Clearing table with Players: \n" + this.logPlayers());
        this.players = new Array();
        this.full = false;
    }
	this.getLength = function ()
	{
		return this.players.length;
	}
}

function Player(name, clientId) 
{
    this.name = name;
    this.clientId = clientId;
    this.log = function () {
        console.log("\tPlayer name: " + name + ", id: " + clientId + "\n");
    }
}