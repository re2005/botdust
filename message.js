const exec = require('child_process').exec;
const WebSocket = require('ws');
const fetch = require('node-fetch');

const wsUri = 'ws://host.docker.internal:8280/';
const websocket = new WebSocket(wsUri);
websocket.onopen = () => console.log('OPEN');
websocket.onclose = () => console.log('CLOSED');
websocket.onerror = (e) => console.log('ERROR', e);

let userId;

exec('curl host.docker.internal:8180/identity/get/v1', function (error, response) {
    if (error !== null) {
        console.log('exec error: ' + error);
    }
    userId = JSON.parse(response).result.global_id;
    console.log('Bot is set for user: ' + userId);
    websocket.onmessage = (m) => onMessage(m);
});


/**
 *
 * @returns {Promise<string>}
 */
async function getJoke() {
    try {
        const resp = await fetch('https://geek-jokes.sameerkumar.website/api');
        return await resp.json();
    } catch (e) {
        console.log(e);
    }
}


/**
 *
 * @param sender String
 * @param message String
 * @return void
 */
function sendMessage(sender, message) {
    message = message.replace(/'/g, '').replace(/Chuck Norris/g, sender.replace(/@.*$/, '').toUpperCase());
    const command = `curl -X POST -d '{"global_id":"` + sender + `","data":{"type":"text", "message":"` + message + `"}}' host.docker.internal:8180/message/send/v1`;
    console.log(command);
    exec(command, function (error) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

/**
 *
 * @param m
 * @returns {Promise<void>}
 */
async function onMessage(m) {
    const data = JSON.parse(m.data);
    if (data.type === 'stream_message') {
        const sender = data.payload.sender.glob_id.replace('master$', '');
        const authorIsMe = userId === sender;
        if (!authorIsMe) {
            const joke = await getJoke();
            sendMessage(sender, joke);
        }
    }
}
