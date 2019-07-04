const { run, close } = require('./app');

if (process.env.DEBUG_PIPELINE) {
    run();
}

module.exports = { run, close };
