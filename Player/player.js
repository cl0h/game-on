// Player/player.js

'use strict';
// Player Object
function Player(name, clientId) 
{
    this.name = name || '';
    this.clientId = clientId || '';
}

// Generate log
Player.prototype.log = function(){
	console.log("\tPlayer name: " + this.name + ", id: " + this.clientId + "\n");
}

// Export
module.exports = Player;