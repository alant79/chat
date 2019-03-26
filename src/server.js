const WebSocket = require('ws');
const server = new WebSocket.Server({port:3000});
var usersMap =new Map();
var mesagesList = [];

server.on('connection', ws => {

    ws.on('message', message => {
        const str = JSON.parse(message);

        if (str.type == 'LOGIN') {
           const pair = {
               name:  str.value,
               photo:  ''              
           }
           usersMap.set(str.login, pair);
           //отправим все фото вновь присоединенному пользователю
           for (var key of usersMap.keys()) {
                ws.send(JSON.stringify({type: 'UPDATEPHOTO', login: key, value: usersMap.get(key).photo}));
            } 
           //отправим все сообщения вновь присоединенному пользователю
           for(let i=0; i<mesagesList.length; i++) {
                ws.send(mesagesList[i]);
            }
           
        }
        else if (str.type == 'LOGOUT') {
            usersMap.delete(str.login)
        }

        else if (str.type == 'MESSAGE') {
            mesagesList.push(message);
        }
        
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                if ((str.type == 'LOGIN')||(str.type == 'LOGOUT')) {
                    sendUsers(client);
                }
                else if (str.type == 'MESSAGE') {
                    client.send(message);
                }
                else if (str.type == 'ADDPHOTO') {
                    const pair = {
                        name:  usersMap.get(str.login).name,
                        photo:  str.value             
                    }
                    usersMap.set(str.login, pair);
                    client.send(JSON.stringify({type: 'UPDATEPHOTO', login: str.login, value: str.value}));
                }

            }
        })
    })
});

function sendUsers(client) {
    let names = [];
    for (var value of usersMap.values()) {
       names.push({user:value.name});
    } 
    client.send(JSON.stringify({type: 'USERS', login: 'Server', value: names}));
}

