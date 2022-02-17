var config = require("./config");

var auth = null;
var selected_version = "1.8.9";

page("init");

function btnaction() {
  if (auth == null) {
    login();
  } else {
    launch(selected_version);
  }
}

function login(type) {
  ipcRenderer.send("login_new", {
    visible: type ?? "select_account",
  });
}

ipcRenderer.on("login_update", (event, arg) => {
  page("init");
  $("#progress")
    .width(arg.percent + "%")
    .parent()
    .clearQueue()
    .slideDown();
  $("#status").text(arg.data);
  $("#launch-btn").addClass("loading").prop("disabled", true).text("Loading");
  $("#launch-info").slideUp();
});

ipcRenderer.on("login_result", (event, arg) => {
  auth = arg;

  selected_version = config.get("version_number", "1.8.9");
  $("#launch-version").text(selected_version);
  $("#launch-playername").text(config.get("profile").name);

  $("#launch-btn").removeClass("loading").prop("disabled", false).text("Play!");
  $("#status").text("");
  $("#progress").width("0%").parent().clearQueue().slideUp();

  $("#launch-info").clearQueue().slideDown();

  autoLaunchHandler();
});

function launch(version) {
  config.set("version_number", version ?? "1.8.9");

  $("#launch-version").text(version);
  ipcRenderer.send("launch", {
    auth: auth,
    version: {
      number: version,
      type: config.get("version_type", "release"),
    },
  });
  $("#launch-btn").addClass("loading").prop("disabled", true).text("Launching");
}

ipcRenderer.on("launch_msg", (event, arg) => {
  $("#status").text(arg.replaceAll("[MCLC]: ", ""));
  console.log(arg);

  if (
    arg.toLowerCase().includes("downloaded") ||
    arg.toLowerCase().includes("collected")
  ) {
    $("#progress").parent().clearQueue().slideUp();
  }
});

ipcRenderer.on("launch_progress", (event, arg) => {
  $("#status").text("Downloading " + arg.type);
  $("#progress")
    .width((100 * arg.task) / arg.total + "%")
    .parent()
    .clearQueue()
    .slideDown();
});

function autoLaunchHandler() {
  console.log("auto launch handling in progress");
  var args = ipcRenderer.sendSync("get_args");
  console.log("Args:", args);

  if (args[1] == undefined) {
    console.info("Skipping auto launch");
    return;
  } else {
    args[1] = args[1].toLowerCase();
  }

  if (args[1].includes("skiplauncher://launch/")) {
    console.info("Proceeding to auto launch");
    launch(args[1].replace("skiplauncher://launch/", ""));
  } else {
    console.warn("No auto launch action fitting");
  }
}

function select_version() {
  $("#temp-version").val(selected_version);
  page("version");
}

var currentPage = "init";
function page(id) {
  if (currentPage == id) {
    return;
  }
  $(".wrapper").clearQueue().fadeOut();
  $("#page-" + id)
    .delay(450)
    .fadeIn();
  currentPage = id;
}

function acceptVersion() {
  selected_version = $("#temp-version").val();
  $("#launch-version").text(selected_version);
  config.set("version_number", selected_version ?? "1.8.9");
  page("init");
}

function logout() {
  page("none");
  setTimeout(() => {
    ipcRenderer.send("logout");
  }, 450);
}
