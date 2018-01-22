// Table/table.js

// Generate a table object
'use strict';

/**
 * Module Dependencies
 * @private
 */
const log = require('../utils').log;

// Construtor
function Table() {
    this.players = [];
    this.MAX_PLAYERS = 4;
    this.full = false;
}

// Add player to list
// @params  any     Any type of player
Table.prototype.addPlayer = function(player) {
    if (this.full === true) {
        return;
    }
    this.players.push(player);
    if (this.players.length === this.MAX_PLAYERS) {
        this.full = true;
    }
};

// Log player
Table.prototype.logPlayers = function() {
    log("Table Players: \n");
    for (var i = 0; i < this.players.length; i++) {
        this.players[i].log();
    }
};

// Clear players list
Table.prototype.clear = function() {
    log("Clearing table with Players: \n" + this.logPlayers());
    this.players = [];
    this.full = false;
};

// Get number of current players
Table.prototype.getLength = function() {
    return this.players.length;
};

module.exports = Table;