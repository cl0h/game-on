'use strict';
// Module handle input/output

/**
 * Module dependencies
 * @private
 */
const IO = require('socket.io');
const Player = require('../Player/index');
const log = require('../utils').log;
const SharedEnum = require('../public/js/sharedenum');

/**
 * Events Enum
 * @type {string}
 * @private
 */
const TableEventType = SharedEnum.TableEventType;
const ChatEventType = SharedEnum.ChatEventType;

module.exports = function(server, table) {

	var io = IO(server);

	//Event handlers
	io.on('connection', function(socket) {
		socket.on('disconnect', function() {
			log('Disconnected ID: ' + socket.id);
		});

		socket.on(ChatEventType.CHAT, function(msg) {
			log('message: ' + msg);

			//FUTURE: Persistent names - Check cookie for name using socket.request

			io.emit(ChatEventType.CHAT, msg);
			log('chat msg sent.');

		});

		socket.on(TableEventType.CLEAR_TABLE, function() {
			log('Clear sent by: ' + socket.id);
			table.clear();
			io.emit('update_table', table.players);
			log('update table sent');
		});

		socket.on(TableEventType.ADD_PLAYER, function(data) {
			
			log('Add received from: ' + socket.id + '. Data: ' + JSON.stringify(data));
			if (table.full) {
				log('Table is full');
				io.sockets.connected[socket.id].emit(TableEventType.FULL_TABLE);
				log('Full table sent to ' + socket.id);
				return;
			}

			table.addPlayer(new Player(data[0].name, socket.id));
			log('Player added. Sending Update Table event');
			io.emit(TableEventType.UPDATE_TABLE, table.players);
			if (table.getLength() === 1) {
				log('Broadcast new table event');
				socket.broadcast.emit(TableEventType.START_TABLE);
				log('New table event sent.');
				return;
			}

		});

		log('Connected. ID: ' + socket.id);
		io.emit(TableEventType.DRAW_TABLE, table.players);
	});
};