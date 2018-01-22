'use strict';

/**
* Module dependencies
* @private
*/
const log = require('../utils').log;

// Player Object
function Player(name, clientId) 
{
    this.name = name || '';
    this.clientId = clientId || '';
}

// Generate log
Player.prototype.log = function(){
	log('\tPlayer name: ' + this.name + ', id: ' + this.clientId + '\n');
};

// Export
module.exports = Player;