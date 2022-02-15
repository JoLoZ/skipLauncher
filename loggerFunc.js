exports.format = function (level, date, message) {
  var output =
    date.toLocaleTimeString() +
    " [" +
    level +
    "]" +
    message.replaceAll("[" + date.toLocaleTimeString() + "] ", "").replaceAll("[MCLC]: ", "[LAUNCH] ");
  console.log(output);
  return output;
};
