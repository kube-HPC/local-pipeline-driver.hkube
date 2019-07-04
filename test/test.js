const pipelines = require('./mocks/pipelines');
const TaskRunner = require('../lib/tasks/task-runner');
const bootstrap = require('../bootstrap');

describe('pipeline tests', () => {
    it('simple-run', () => {
        bootstrap.init();
        const taskRunner = new TaskRunner();
        const pipeline = pipelines.find(p => p.name === 'simple-flow');
        taskRunner.start(pipeline);
    });
});
