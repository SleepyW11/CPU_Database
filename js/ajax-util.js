var rval;
function ifetch(url, func, isj) {
    req = new XMLHttpRequest();
    var rval;
    req.onreadystatechange = function() {
        handler(req, func, isj)
    }
    req.open("GET", url, true);
    req.send(null);
}

function handler(req, func, isj) {
    if(req.readyState == 4 && req.status == 200) {
        if (isj) {
            func(JSON.parse(req.response));
        }
        else {
            func(req.response);
        }
    }
}