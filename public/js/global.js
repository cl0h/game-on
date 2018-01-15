/*jslint browser: true */
/*jslint quotmark: false */
'use strict';
var view = {
	chat: {
		$msgBoard: $('#messages')
	}
};

// TODO: Review user journey for notification
/**
 * @note Move to outside $.ready as 
 * this does not require document to be ready
 */

//Browser Desktop Notifications
function notifyMe(msg) {

	if (!('Notification' in window)) {
		alert("Desktop notifications not available in your browser. Try Chrome or Firefox.");
		return false;
	}
	/**
	 * Request permission on page load
	 * @note: This should be outside of function
	 * since it will be only trigger when the 
	 * function is called which could be after
	 * document loaded & avoid attaching multiple time
	 * being called everytime.
	 */
	// TODO: remove outside of function
	document.addEventListener('DOMContentLoaded', function() {
		if (Notification.permission !== 'granted') {
			Notification.requestPermission();
		}
	});

	if (Notification.permission !== 'granted') {
		Notification.requestPermission();

	} else {
		var notification = new Notification('Foosball', {
			icon: '/images/foos.png',
			body: msg,
		});

		notification.onclick = function() {
			console.log("Notification clicked!");
		};
	}

}

function addPlayerCanvas(playerName, num) {

	var strokeArgs = [];
	switch (num) {
		case 1:
			strokeArgs = [40, 120];
			break;
		case 2:
			strokeArgs = [440, 120];
			break;
		case 3:
			strokeArgs = [40, 300];
			break;
		case 4:
			strokeArgs = [440, 300];
			break;
		default:
			throw new Error("Bad Data passed to addPlayerCanvas");
	}
	var canvas = document.getElementById('canvas1');
	var ctx = canvas.getContext('2d');

	ctx.font = "48px Comic Sans MS";
	ctx.strokeStyle = gradient;
	ctx.lineWidth = 3;

	// Create gradient
	var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop("0", "red");
	gradient.addColorStop("0.5", "darkblue");

	ctx.strokeText(playerName, strokeArgs[0], strokeArgs[1]);
}

function clearTable(canvas){
	if(canvas === undefined || canvas.tagName !== 'CANVAS'){
		throw new Error('Canvas required');
	}

	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateTable(players) {

	if (players !== undefined) {
		for (var i = 0; i < players.length; i++) {
			addPlayerCanvas(players[i].name, i + 1);
		}
	}

	if (players !== undefined && players.length === 4) {
		notifyMe("Game On!");
	}
}

$(function() {

	//Socket.IO stuff
	var socket = window.io();


	//Hook up clear table UI buttons to socket events
	$('body').on('click', 'button#clearTable', function() {
		socket.emit('clear_table', {});
	});

	// Hook up add player UI buttons to socket events
	$('body').on('click', 'button#addPlayer', function() {

		var inputname = $('input#name').val().trim();
		if (!inputname) {
			alert("A name is required.");
			return;
		}
		var data = [{
			"name": inputname
		}];
		socket.emit('add_player', data);
		return;
	});

	/**
	 * Hook submit event to chat
	 * Send message to board
	 */
	$('form#chat').on('submit',function() {
		var chatmsg = $('input#name').val() + " said: " + $('#msg').val();
		chatmsg = new Date().toLocaleTimeString() + ' - ' + chatmsg;
		$('#msg').val('');
		socket.emit('chat', chatmsg);
		return false;
	});


	/**
	 * Bind handler for event chat
	 * Add message to message board and scroll down
	 */
	socket.on('chat', function(msg) {
		let $msgBoard = view.chat.$msgBoard || $('#messages');
		$msgBoard.append($('<li>').text(msg));
		$msgBoard.scrollTop($msgBoard.get(0).scrollHeight);
	});

	/**
	 * Bind handler for event start table
	 * Notify user if notification box tick
	 */
	socket.on('start_table', function() {

		if ($('input#notifystart').is(':checked')) {
			notifyMe("New Table");
		}
	});

	/**
	 * Bind handler for event draw table
	 * Update the UI Table
	 */
	socket.on('draw_table', function(data) {
		updateTable(data);
	});

	/**
	 * Bind handler for event update table
	 * Update the UI table and 
	 * notify user on the message board
	 */
	socket.on('update_table', function(data) {

		updateTable(data);
		let litext = (data.length === 0) ? "New table" : "New player joined";
		//litext = litext + " @ " + new Date().toLocaleString();
		litext = new Date().toLocaleTimeString() + " - " + litext;

		view.chat.$msgBoard = view.chat.$msgBoard || $('#messages');
		view.chat.$msgBoard.append($('<li>').text(litext));
	});

	/**
	 * Bind handler for event full table
	 * Send an alert to user table full
	 */
	socket.on('full_table', function() {
		alert("Table is already full. Use the Clear button to start fresh.");
	});

	socket.on('clear_table', function(){
		clearTable(document.getElementById('canvas1'));
	});
});