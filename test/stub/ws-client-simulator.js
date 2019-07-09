/* eslint-disable no-console */
const WebSocket = require('ws');
const { recivedType, sendType } = require('./extras/ws-messages');
const pipelines = require('./extras/pipelines.json');

const ws = new WebSocket('ws://localhost:3060');
const pipeline = pipelines.find(p => p.name === 'simple-flow');

const send = (type, data) => {
    ws.send(JSON.stringify({ type, data }));
};
// eslint-disable-next-line no-shadow
const algorithmRegister = (pipeline) => {
    pipeline.nodes.forEach(node => send(recivedType.ALGORITHM_REGISTER, { name: node.algorithmName }));
};
ws.on('open', () => {
    algorithmRegister(pipeline);
    send(recivedType.PIPELINE_CREATE, { pipeline });
});

ws.on('message', (data) => {
    const _data = JSON.parse(data);
    if (_data.type === sendType.RUN_ALGORTIHM) {
        setTimeout(() => {
            send(recivedType.ALGORTIHM_FINISHED_SUCCESS, { ..._data, result: { a: true, b: 5 } });
        }, 1000);
    }
    if (_data.type === sendType.PIPELINE_CREATED) {
        send(recivedType.PIPELINE_EXECUTE, _data);
    }
    console.log(`recived message TYPE:${_data.type}`);
});
