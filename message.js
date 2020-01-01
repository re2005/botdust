const exec = require('child_process').exec;
const WebSocket = require('ws');
const fetch = require('node-fetch');

const wsUri = 'ws://localhost:8280/';
const websocket = new WebSocket(wsUri);
websocket.onopen = () => console.log('OPEN');
websocket.onclose = () => console.log('CLOSED');
websocket.onerror = (e) => console.log('ERROR', e);
websocket.onmessage = (m) => onMessage(m);

const config = process.argv.slice(2);
console.log('Bot is set for user:', config[0]);

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
    const command = `curl -X POST -d '{"global_id":"` + sender + `","data":{"type":"text", "message":` + message + `}}' localhost:8180/message/send/v1`;
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
    if (data.type === 'private_message') {
        const sender = data.payload.sender.glob_id.replace('master$', '');
        const authorIsMe = config[0] === sender;
        if (!authorIsMe) {
            const joke = await getJoke();
            sendMessage(sender, joke);
        }
    }
}
