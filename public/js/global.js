$(function () {
	
		//Socket.IO stuff
		var socket = io();
		$('form').submit(function()
		{
			var chatmsg = $('input#name').val() + " said: " + $('#msg').val();
			chatmsg = new Date().toLocaleTimeString() + " - " + chatmsg;
			socket.emit('chat', chatmsg);
			$('#msg').val('');
			return false;
		});
		
		socket.on('chat', function(msg)
		{
			$('#messages').append($('<li>').text(msg));
			$('#messages').scrollTop($('#messages')[0].scrollHeight) ;
			//drawTable(data);
		});

		socket.on('startTable', function(data)
		{
			if($('input#notifystart').is(':checked'))notifyMe("New Table");
		});
		
		socket.on('drawTable', function(data)
		{
			updateTable(data);
		});
		
		socket.on('updateTable', function(data)
		{
			updateTable(data);
			if(data.length === 0)
			{
				var litext = "New table";
			}
			else
			{
				
				var litext = "New player joined";
			}
			//litext = litext + " @ " + new Date().toLocaleString();
			litext = new Date().toLocaleTimeString() + " - " + litext;
			$('#messages').append($('<li>').text(litext));
		});
		
		socket.on('fullTable', function(data){
			alert("Table is already full. Use the Clear button to start fresh.")
		});
		
		
		//Hook up UI buttons to socket events
		var clearButton = $("#clearTable");
		clearButton.click(clearTable);
		
		
		function clearTable()
		{
			socket.emit('clearTable');
		}
		
		var addPlayerButton = $("#addPlayer");
		addPlayerButton.click(addPlayer);
		
		function addPlayer()
		{
			var inputname = $('input#name').val() + "";
			if(inputname=="") 
			{
				alert(inputname + " is not a valid name");
				return;
			}
			var data = [{"name":inputname}];
			socket.emit('addPlayer', data );
		}
		
		function updateTable(players)
		{

		//Canvas Stuff
		var canvas = $("#canvas1")[0]
		var ctx = canvas.getContext('2d');
		
			//Draw Table
			var tablebg = new Image();
			tablebg.onload = function() {
				drawImage(tablebg);
			};
			tablebg.src = '/images/foostable.png';
			
			if(players != undefined && players.length === 4 ) notifyMe("Game On!");
			
			function drawImage(img) 
			{
				var destX = 0;
				var destY = 0;
				var destWidth = 800;
				var destHeight = 400;
				
				ctx.drawImage(img, destX, destY, destWidth, destHeight);
				
				
				if(players != undefined)
				{
					//drawGridLines();
					
					for (var i = 0; i < players.length; i++)
						addPlayerCanvas(players[i].name, i+1);
				}
			}
			
			function drawGridLines()
			{
				ctx.fillStyle = 'red';
				ctx.strokeStyle = 'yellow';
				ctx.lineWidth=5;
				
				ctx.beginPath();
				ctx.moveTo(0,200);
				ctx.lineTo(800,200);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.moveTo(400,0);
				ctx.lineTo(400,400);
				ctx.stroke();
			}
		}
		
		function addPlayerCanvas(playerName, num)
		{
			
			var strokeArgs = [];
			switch(num) {
				case 1:
				strokeArgs = [40,120];
				break;
				case 2:
				strokeArgs = [440,120];
				break;
				case 3:
				strokeArgs = [40,300];
				break;
				case 4:
				strokeArgs = [440,300];
				break;
				default:
				strokeArgs = ["Bad Data passed to addPlayerCanvas",100,200];
			}
			
			var canvas = $("#canvas1")[0]
			var ctx = canvas.getContext('2d');

			ctx.font="48px Comic Sans MS";
			// Create gradient
			var gradient=ctx.createLinearGradient(0,0,0,canvas.height);
			gradient.addColorStop("0","red");
			gradient.addColorStop("0.5","darkblue");
			
			ctx.strokeStyle=gradient;
			ctx.lineWidth=3;	
			
			ctx.strokeText(playerName,strokeArgs[0],strokeArgs[1]);
		}

		//Browser Desktop Notifications
		function notifyMe(msg) 
		{
			if (!Notification) 
			{
				alert('Desktop notifications not available in your browser. Try Chrome or Firefox.'); 
				return;
			}		
			
		// request permission on page load
		document.addEventListener('DOMContentLoaded', function () {
			if (Notification.permission !== "granted")
				Notification.requestPermission();
		});


		if (Notification.permission !== "granted")
			Notification.requestPermission();
		else {
			var notification = new Notification('Foosball', {
				icon: '/images/foos.png',
				body: msg,
			});

			notification.onclick = function () {
				console.log("Notification clicked!");      
			};
		}
	}
});