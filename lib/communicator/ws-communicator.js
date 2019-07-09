const WebSocket = require('ws');
const EventEmitter = require('events');
const logger = require('@hkube/logger');
const prettyJson = require('prettyjson');
const { sendType, recivedType } = require('../consts/ws-messages');

const component = 'ws-communicator';

let log;
class wsCommunicator extends EventEmitter {
    constructor() {
        super();
        // this._port = process.env.PORT || 3060;
        this.wss = null;
        this.algorithmRegister = {};
        this.currentPipeline = null;
        // this.init();
    }

    init(port = 3060) {
        if (!log) {
            log = logger.GetLogFromContainer();
        }
        this.wss = new WebSocket.Server({ port });
        this._eventRegister();
        this.stateHandler = {
            [recivedType.PIPELINE_CREATE]: (ws, data) => {
                this.currentPipeline = { ws, data: data.pipeline };
                this._send(this.currentPipeline.ws, sendType.PIPELINE_CREATED, null);
                //   log.info(`a pipeline created with name ${data.pipeline.name}`.yellow, { component });
                // log.info(`============ a pipeline created with name ${data.pipeline.name} ===============`.green, { component });
                log.info(`============ a pipeline created with name ${data.pipeline.name} ===============\n${prettyJson.render(data.pipeline)}`.green, { component });
            },
            [recivedType.PIPELINE_EXECUTE]: () => {
                this._send(this.currentPipeline.ws, sendType.PIPELINE_EXECUTED, null);
                this.emit(recivedType.PIPELINE_EXECUTE, { job: this.currentPipeline.data });
                // log.info(`pipeline ${this.currentPipeline.data.name} start running`.yellow, { component });
            },
            [recivedType.ALGORITHM_REGISTER]: (ws, data) => {
                this.algorithmRegister[data.name] = { ws, data };
                this._send(this.algorithmRegister[data.name].ws, sendType.ALGORITHM_REGISTERED, null);
                log.info(`New algorithm with name ${data.name} registerd`.yellow, { component });
            },
            [recivedType.ALGORTIHM_FINISHED_SUCCESS]: (ws, data) => {
                log.info(`============ algortihm  ${data.data.algorithmName}  finished successfuly with result ===============\n${prettyJson.render(data.result)}`.green, { component });
                this.emit(recivedType.ALGORTIHM_FINISHED_SUCCESS, data);
            },
            [recivedType.ALGORTIHM_FINISHED_FAILED]: (ws, data) => {
                log.info(`============ algortihm  ${data.data.algorithmName}  faild to finish  =============== with error \n${prettyJson.render(data.result)}`.red, { component });
                this.emit(recivedType.ALGORTIHM_FINISHED_SUCCESS, data);
            }
        };
        // this.on(sendType.RUN_ALGORTIHM, (name, data) => this.onRunAlgorithm(name, data));
    }

    close() {
        return new Promise((resolve) => {
            this.wss.close(err => resolve(err));
        });
    }

    _send(ws, type, data) {
        log.debug(`message sent-  - ${type}`, { component });
        ws.send(JSON.stringify({ type, data }));
    }

    runAlgorithm(name, data) {
        this._send(this.algorithmRegister[name].ws, sendType.RUN_ALGORTIHM, data);
    }

    _eventRegister() {
        this.wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                const _message = JSON.parse(message);
                log.debug(`message recived- ${_message.type} with name ${_message.data.name}`, { component });
                this.stateHandler[_message.type](ws, _message.data);
            });
        });
    }
}

// eslint-disable-next-line new-cap
module.exports = new wsCommunicator();
