const packageJson = require(process.cwd() + "/package.json");
const config = (module.exports = {});

config.serviceName = packageJson.name;
config.version = packageJson.version;

config.jobs = {
  consumer: {
    maxStalledCount: 3
  }
};

config.timeouts = {
  inactivePaused: process.env.INACTIVE_PAUSED_TIMEOUT_MS || 30 * 1000
};

config.fs = {
  baseDirectory: process.env.BASE_FS_ADAPTER_DIRECTORY || "/var/tmp/fs/storage"
};

config.storageAdapters = {
  fs: {
    connection: config.fs,
    moduleName: process.env.STORAGE_MODULE || "@hkube/fs-adapter"
  }
};
