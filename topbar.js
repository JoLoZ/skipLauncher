const $ = require("jquery");
const { ipcRenderer } = require("electron");

$("body").prepend(`<div class="topbar">
    <div class="item close" onclick="top_close();" id="topbar-close">&times</div>
</div>`);

function top_close(){
    ipcRenderer.send("quit")    
}