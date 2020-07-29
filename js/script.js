var item_snippet;
var full_snippet;
var data;
window.addEventListener("DOMContentLoaded", function() {
    ifetch("snippets/item-snippet.html", snippetFetch, false);
    document.getElementById("brand").addEventListener("change", function() {
        ifetch("data/cpu-data.json", itemReplace, true);
    });
    document.getElementById("year").addEventListener("change", function() {
        ifetch("data/cpu-data.json", itemReplace, true);
    });
    document.querySelector(".x").addEventListener("click", function() {
        document.querySelector(".full-details").style.display = "none";
        document.querySelector(".main-body").style.display = "block";
    });
});

function snippetFetch(response) {
    item_snippet = response;
    ifetch("snippets/full-item-snippet.html", fullSnippetFetch, false);
}

function fullSnippetFetch(response) {
    full_snippet = response;
    ifetch("data/cpu-data.json", dataFetch, true);
}

function dataFetch(response) {
    data = response;
    itemReplace()
}

function itemReplace() {
    container = document.querySelector(".item-container");
    select_brand = document.querySelector("#brand");
    select_year = document.querySelector("#year");
    var string;
    container.innerHTML = "";
    for(item in data) {
        if(select_brand.value.includes(data[item]["brand"]) && select_year.value.includes(data[item]["year"])) {
            string = item_snippet;
            string = string.replace("xyzitem00", item);
            string = string.replace("{{name}}", data[item]["name"]);
            string = string.replace("{{base}}", data[item]["base"]);
            string = string.replace("{{boost}}", data[item]["boost"]);
            string = string.replace("{{cores}}", data[item]["cores"]);
            string = string.replace("{{threads}}", data[item]["threads"]);
            string = string.replace("{{litho}}", data[item]["litho"]);
            string = string.replace("{{socket}}", data[item]["socket"]);
            string = string.replace("{{tdp}}", data[item]["tdp"]);
            string = string.replace("{{memtype}}", data[item]["memtype"]);
            string = string.replace("{{memspeed}}", data[item]["memspeed"]);
            string = string.replace("{{memchannels}}", data[item]["memchannels"]);
            string = string.replace("{{pciev}}", data[item]["pciev"]);
            string = string.replace("{{l3c}}", data[item]["l3c"]);
            string = string.replace("{{igpu}}", data[item]["igpu"] || "No");
            string = string.replace("{{igpus}}", data[item]["igpus"] || "");
            string = string.replace("{{year}}", data[item]["year"]);
            container.innerHTML += string
        }
    }
}
function itemReplaceFull(num) {
    container = document.querySelector(".full-details-con");
    var string;
    container.innerHTML = "";
    string = full_snippet;
    string = string.replace("{{name}}", data[num]["name"]);
    string = string.replace("{{base}}", data[num]["base"]);
    string = string.replace("{{boost}}", data[num]["boost"]);
    string = string.replace("{{cores}}", data[num]["cores"]);
    string = string.replace("{{threads}}", data[num]["threads"]);
    string = string.replace("{{litho}}", data[num]["litho"]);
    string = string.replace("{{socket}}", data[num]["socket"]);
    string = string.replace("{{tdp}}", data[num]["tdp"]);
    string = string.replace("{{memtype}}", data[num]["memtype"]);
    string = string.replace("{{memspeed}}", data[num]["memspeed"]);
    string = string.replace("{{memchannels}}", data[num]["memchannels"]);
    string = string.replace("{{pciev}}", data[num]["pciev"]);
    string = string.replace("{{l3c}}", data[num]["l3c"]);
    string = string.replace("{{igpu}}", data[num]["igpu"] || "No");
    string = string.replace("{{igpus}}", data[num]["igpus"] || "");
    string = string.replace("{{year}}", data[num]["year"]);
    container.innerHTML += string;
    document.querySelector(".full-details").style.display = "block";
}