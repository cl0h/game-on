'use strict';

/**
 * Dependencies
 * @private
 */
const express = require("express");
const path = require("path");
const log = require('./utils').log;
const iohandler = require('./components/iohandler');
const Table = require('./Table/index');

/**
 * Constances
 * @private
 */
const PORT = process.env.PORT || 3000;

/**
 * Init variable
 * @private
 */
var app = express();
var http = require("http").Server(app);
var table = new Table();
iohandler(http, table);

//Routing
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
	log("Serving index page");
	res.sendFile(__dirname + "/index.html");
});

http.listen(PORT, function() {
	log("App started");
	log("listening on *: " + PORT);
	if(process.send){
		process.send("listening");
	}
});


/**
 * If call from another module
 * e.g.: Test module
 */
if (module.parent) {
	module.exports.server = http;
}