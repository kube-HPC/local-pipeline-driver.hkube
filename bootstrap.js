/* eslint-disable no-console */
const configIt = require('@hkube/config');
const Logger = require('@hkube/logger');
const taskRunner = require('./lib/tasks/task-runner');
const component = require('./lib/consts/componentNames').MAIN;
const wsCommunictor = require('./lib/communicator/ws-communicator');

let log;
const logger = {
    transport: {
        console: true,
        logstash: false,
        fluentd: false,
        file: false
    },
    extraDetails: false,
    isDefault: true,
    verbosityLevel: 2
};


const modules = [taskRunner];

class Bootstrap {
    async init(port = process.env.PORT) {
        try {
            this._handleErrors();
            log = new Logger('local-pipeline-driver', logger);
            wsCommunictor.init(port);
            //    console.log('adasada');
            log.info(`running application with env: ${configIt.env()}, node: ${process.versions.node}`, { component });
            await Promise.all(modules.map(m => m.init()));
        }
        catch (error) {
            this._onInitFailed(error);
        }
    }

    _onInitFailed(error) {
        if (log) {
            log.error(error.message, { component }, error);
            log.error(error);
        }
        else {
            // eslint-disable-next-line no-console
            console.error(error.message);
            // eslint-disable-next-line no-console
            console.error(error);
        }
        process.exit(1);
    }

    _handleErrors() {
        process.on('exit', (code) => {
            log.info(`exit code ${code}`, { component });
        });
        process.on('SIGINT', () => {
            log.info('SIGINT', { component });
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            log.info('SIGTERM', { component });
            process.exit(0);
        });
        process.on('unhandledRejection', (error) => {
            log.error(`unhandledRejection: ${error.message}`, { component }, error);
            process.exit(1);
        });
        process.on('uncaughtException', (error) => {
            log.error(`uncaughtException: ${error.message}`, { component }, error);
            log.error(error);
            console.error(error);
            process.exit(1);
        });
    }
}

module.exports = new Bootstrap();
