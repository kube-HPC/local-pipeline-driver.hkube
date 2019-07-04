const bootstrap = require('./bootstrap');
const taskrunner = require('./lib/tasks/task-runner');
const wsCommunicator = require('./lib/communicator/ws-communicator');

const run = port => bootstrap.init(port);
const close = async () => {
    const err = await wsCommunicator.close();
    await taskrunner.stop();
    return err;
};
module.exports = { run, close };
