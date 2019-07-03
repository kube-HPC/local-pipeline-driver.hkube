const inputs = require("./const/inputs");
const relations = require("./const/relations");
const parser = require("./input-parser");

module.exports = {
  parser,
  consts: {
    inputs,
    relations
  }
};
