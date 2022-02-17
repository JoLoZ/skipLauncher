const path = require("path");

var JSONStore = require("json-store");
var db = JSONStore(path.join(process.env.CONFIG_PATH, "config.json"));

exports.get = (key, defaultValue) => {
  console.log("[CONFIG] Read config from key", key);
  var output = db.get(key);
  if(output == undefined && defaultValue != undefined){
      console.log("[CONFIG] Key", key, "not found. Setting default value", defaultValue);
      db.set(key, defaultValue);
      output = defaultValue;
  }
  return output;
};
exports.set = (key, value) => {
  console.log("[CONFIG] Set config at", key, "to", value);
  return db.set(key, value);
};
