const deep = require("deep-get-set");
const flatten = require("flat");
const clone = require("clone");
class DataExtractor {
  extract(input, storage) {
    const result = clone(input);
    const flatObj = flatten(input);

    Object.entries(flatObj).map(async ([objectPath, value]) => {
      if (typeof value === "string" && value.startsWith("$$")) {
        const key = value.substring(2);
        const link = storage[key];
        let data = null;
        if (Array.isArray(link.storageInfo)) {
          data = link.storageInfo;
          if (link.path) {
            data = data.map(d => deep(d, link.path));
          }
        } else {
          data = 3;
          if (link.path) {
            data = deep(data, link.path);
          }
          if (Number.isInteger(link.index)) {
            data = data[link.index];
          }
        }
        deep(result, objectPath, data);
      }
    });

    return result;
  }
  replaceFlowInput(pipeline) {
    console.log("");
  }
}

module.exports = new DataExtractor();
