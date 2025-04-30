const queryString   = window.location.search;
const urlParams     = new URLSearchParams(queryString);

const qMeeting      = urlParams.get('meeting');
const qAuto         = String(urlParams.get('auto')).toLowerCase() === "true";
const qLogo         = urlParams.get('logo');

if(qLogo){
    document.getElementById("logo").src = qLogo;
}

var token = Cookies.get("access_token");
var webexSite = Cookies.get("webex_site");
console.log("Token:", token);
console.log("webexSite:", webexSite);

function customLog(msg, args){
    let logName = "custom-log:"
    if(args){
        console.log(logName+ msg, args);  
    } else {
        console.log(logName, msg);
    }
}

function isNumber(string) {
    return /^[0-9]*$/.test(string);
}