const WebSocket = require("ws");
const EventEmitter = require("events");
const { sendType, recivedType } = require("../consts/ws-messages");
class wsCommunicator extends EventEmitter {
  constructor() {
    super();
    //this._port = process.env.PORT || 3060;
    this.wss = null;
    this.algorithmRegister = {};
    this.currentPipeline = null;
    //this.init();
  }
  init(port = 3060) {
    this.wss = new WebSocket.Server({ port: port });
    this._eventRegister();
    this.stateHandler = {
      [recivedType.PIPELINE_CREATE]: (ws, data) => {
        this.currentPipeline = { ws: ws, data: data.pipeline };
        this._send(this.currentPipeline.ws, sendType.PIPELINE_CREATED, null);
      },
      [recivedType.PIPELINE_EXECUTE]: (ws, data) => {
        this._send(this.currentPipeline.ws, sendType.PIPELINE_EXECUTED, null);
        this.emit(recivedType.PIPELINE_EXECUTE, { job: this.currentPipeline.data });
      },
      [recivedType.ALGORITHM_REGISTER]: (ws, data) => {
        this.algorithmRegister[data.name] = { ws, data };
        this._send(this.algorithmRegister[data.name].ws, sendType.ALGORITHM_REGISTERED, null);
      },
      [recivedType.ALGORTIHM_FINISHED_SUCCESS]: (ws, data) => this.emit(recivedType.ALGORTIHM_FINISHED_SUCCESS, data),
      [recivedType.ALGORTIHM_FINISHED_FAILED]: (ws, data) => this.emit(recivedType.ALGORTIHM_FINISHED_SUCCESS, data)
    };
    // this.on(sendType.RUN_ALGORTIHM, (name, data) => this.onRunAlgorithm(name, data));
  }
  close() {
    return new Promise((resolve, reject) => {
      this.wss.close(err => resolve(err));
    });
  }
  _send(ws, type, data) {
    console.log(`message sent- ${type} `);
    ws.send(JSON.stringify({ type, data }));
  }
  runAlgorithm(name, data) {
    this._send(this.algorithmRegister[name].ws, sendType.RUN_ALGORTIHM, data);
  }
  _eventRegister() {
    this.wss.on("connection", ws => {
      ws.on("message", message => {
        const _message = JSON.parse(message);
        console.log(`message recived- ${_message.type} with name ${_message.data.name}`);
        this.stateHandler[_message.type](ws, _message.data);
      });
    });
  }
}

module.exports = new wsCommunicator();
