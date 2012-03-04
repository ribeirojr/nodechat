var app = require('http').createServer(handler),
    sys  = require('util'),
    fs   = require('fs'),
    io   = require('socket.io').listen(app);

app.listen(4000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}



var users = [];

io.sockets.on('connection', function (socket) {
 
	socket.emit('welcome', 'welcome, enter username!!!');

	var username;

	socket.on('message', function(data){

		if (!username) {
			
		      username = {name: data, socket: socket };
		      socket.emit('message','Welcome, ' + username.name + '!');
			  
			  users.push(username);
				
			  UserListUpdate();
		      return;
		}
		
		if(data[0] === "/"){
			
			var dataReceived = data.split(' ');
			var command = dataReceived[0];

			switch(command){
				
				case 'help':
					socket.emit('message', '/pvt USERNAME MESSAGE for private messages');
					break;

				case 'pvt':
					var receiver = dataReceived[1];

					var messageSent = false;
					if(receiver.length > 1)

						receiver = receiver.substring(1, receiver.length);

						var recepient = FindUserByName(receiver);

						if(recepient != null){
							recepient.socket.emit('message', 'mensagem privada de ' + username.name + ': ' + data);
							socket.emit('message', 'voce enviou a mensagem privada para ' + recepient.name + ':' + data);
						}
						else{
							socket.emit('message', 'user not found');	
						}

					return;		
					break;
					
				default:
					socket.emit('message', 'command not found use /HELP to find out available commands');
					break;
			}
		} 
		    		
	    socket.emit('message', data);
	    socket.broadcast.emit('message', username.name + ' sent: ' + data);	
	});
	
	socket.on('disconnect', function(){
		
		socket.broadcast.emit('message', username.name + ' deu o vazarios!!!!');
		var pos = users.indexOf(username);
		if(pos >= 0){
			users.splice(pos, 1);
		}
		
		UserListUpdate();	
	});
	
	var FindUserByName = function(_username){
		
		  for(i = 0; i < users.length; i++){

			if(users[i].name == _username){

				return users[i];
			}
		}
	};
	
	var UserListUpdate = function(){
		
			var UserNameList = '';
			
			users.forEach(function(user){
				UserNameList = '<li>' + user.name + '</li>' + UserNameList;
			});

			socket.emit('currentUsers', UserNameList);
		    socket.broadcast.emit('currentUsers', UserNameList);		
	};
	
	
 });