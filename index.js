'use strict';

// Dependencies
var express = require("express");
var path = require("path");

var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

const Table = require('./Table/index');
const Player = require('./Player/index');

function log(msg){
	// If module has parent, testing
	if(!module.parent){
		console.log(msg);
	}
}
log("App started");

//Routing
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) 
{
	log("Serving index page");
	res.sendFile(__dirname + "/index.html");
});

//Event handlers
io.on("connection", function (socket) 
{

	log("Connected. ID: " + socket.id);
	io.emit("drawTable",table.players);

	socket.on("disconnect", function () 
	{
		log("Disconnected ID: " + socket.id);
	});

	socket.on("chat", function (msg) 
	{
		log("message: " + msg);

		//FUTURE: Persistent names - Check cookie for name using socket.request
		
		io.emit("chat", msg);
		log("chat msg sent.");
		
	});
	
	socket.on("clearTable", function () 
	{
		log("Clear sent by: " + socket.id);
		table.clear();
		io.emit("updateTable",table.players);
		log("update table sent");
	});
	
	socket.on("addPlayer", function (data) 
	{
		log("Add received from: " + socket.id + ". Data: " + JSON.stringify(data));
		
		if(table.full)
		{
			log("Table is full");
			io.sockets.connected[socket.id].emit("fullTable");
			log("Full table sent to " + socket.id);
			return;
		}
		table.addPlayer(new Player(data[0].name,socket.id));
		log("Player added. Sending Update Table event");
		io.emit("updateTable",table.players);
		
		if (table.getLength() == 1 )
		{	
			log("Broadcast new table event");
			socket.broadcast.emit('startTable');
			log("sent.");
			return;
		}
	});
});

var table = new Table();

http.listen(3000, function () 
{
	log("listening on *: 3000");
});
