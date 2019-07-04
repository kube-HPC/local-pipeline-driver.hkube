const EventEmitter = require('events');
const { NodeStates } = require('@hkube/dag');
const wsCommunicator = require('../communicator/ws-communicator');
const { recivedType } = require('../consts/ws-messages');
const Events = require('../consts/Events');
// const isEqual = require("lodash.isequal");

class StateManager extends EventEmitter {
    constructor() {
        super();
        this._subscribe();
        this.batchAwaitForResults = new Map();
    }

    _subscribe() {
        wsCommunicator.on(recivedType.PIPELINE_EXECUTE, data => this.startPipeline(data));
        wsCommunicator.on(recivedType.ALGORTIHM_FINISHED_SUCCESS, data => this.handleAlgorithmResult(data, recivedType.ALGORTIHM_FINISHED_SUCCESS));
        wsCommunicator.on(recivedType.ALGORTIHM_FINISHED_FAILED, data => this.handleAlgorithmResult(data, recivedType.ALGORTIHM_FINISHED_FAILED));
        // this._etcd.jobs.tasks.on("change", data => {
        //   this.emit(`task-${data.status}`, data);
        // });
        // this._etcd.jobs.state.on("change", data => {
        //   this.emit(`job-${data.state}`, data);
        // });
        // this._etcd.drivers.on("change", data => {
        //   this.emit(data.status.command, data);
        // });
    }

    async startPipeline(data) {
        this.emit(Events.JOBS.START, data);
    }

    async runAlgorithm(job) {
        // vrerify that the algorithm is already registered
        if (job.data.tasks.length === 1) {
            const input = { ...job.data, input: job.data.tasks[0].input, status: NodeStates.ACTIVE, taskId: job.data.tasks[0].taskId, startTime: Date.now() };
            this.emit(Events.TASKS.ACTIVE, input);
            wsCommunicator.runAlgorithm(job.data.algorithmName, input);
        }
        else {
            // eslint-disable-next-line no-restricted-syntax
            for (const task of job.data.tasks) {
                const jobBuild = { ...job.data, input: task.input, status: NodeStates.ACTIVE, taskId: task.taskId, startTime: Date.now() };
                this.emit(Events.TASKS.ACTIVE, jobBuild);
                wsCommunicator.runAlgorithm(jobBuild.algorithmName, jobBuild);
                // eslint-disable-next-line no-await-in-loop
                await this._runningJobInBatch(task.taskId);
            }
        }
    }

    isCompletedState() {
        return false;
    }

    async _runningJobInBatch(taskId) {
        return new Promise((resolve, reject) => {
            this.batchAwaitForResults.set(taskId, { resolve, reject });
        });
    }

    handleAlgorithmResult(job, type) {
        const taskIdPromise = this.batchAwaitForResults.get(job.data.taskId);
        if (taskIdPromise) {
            taskIdPromise.resolve({ ...job.data, result: job.result });
            this.batchAwaitForResults.delete(job.data.taskId);
        }
        if (type === recivedType.ALGORTIHM_FINISHED_SUCCESS) {
            this.emit(Events.TASKS.SUCCEED, { ...job.data, status: NodeStates.SUCCEED, result: job.result, taskId: job.data.taskId, endTime: Date.now() });
        }
        else {
            this.emit(Events.TASKS.FAILED, { ...job.data, status: NodeStates.FAILED, taskId: job.data.taskId, endTime: Date.now() });
        }
    }

    async setJobResults() {
        return null;
    }

    // eslint-disable-next-line no-empty-function
    async setJobStatus() {

    }

    getJobStatus() {
        return null;
    }

    // async tasksList(options) { }

    // // getExecution(options) {}

    // setExecution(options) { }

    watchTasks() { }

    unWatchTasks() { }

    deleteTasksList() { }

    // stopJob(options) { }

    // watchJobState(options) { }

    unWatchJobState() { }

    // _watchDrivers() { }
}

module.exports = StateManager;
