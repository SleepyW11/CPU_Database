var item_snippet;
window.addEventListener("DOMContentLoaded", function() {
    ifetch("snippets/item-snippet.html", snippetFetch, false);
    document.getElementById("brand").addEventListener("change", function() {
        ifetch("data/cpu-data.json", itemReplace, true);
    });
    document.getElementById("year").addEventListener("change", function() {
        ifetch("data/cpu-data.json", itemReplace, true);
    });
});

function snippetFetch(response) {
    item_snippet = response;
    ifetch("data/cpu-data.json", itemReplace, true);
}

function itemReplace(response) {
    container = document.querySelector(".item-container");
    select_brand = document.querySelector("#brand");
    select_year = document.querySelector("#year");
    var string;
    container.innerHTML = "";
    for(item in response) {
        if(select_brand.value.includes(response[item]["brand"]) && select_year.value.includes(response[item]["year"])) {
            string = item_snippet;
            console.log(item);
            string = string.replace("{{name}}", response[item]["name"]);
            string = string.replace("{{base}}", response[item]["base"]);
            string = string.replace("{{boost}}", response[item]["boost"]);
            string = string.replace("{{cores}}", response[item]["cores"]);
            string = string.replace("{{threads}}", response[item]["threads"]);
            string = string.replace("{{litho}}", response[item]["litho"]);
            string = string.replace("{{socket}}", response[item]["socket"]);
            string = string.replace("{{tdp}}", response[item]["tdp"]);
            string = string.replace("{{memtype}}", response[item]["memtype"]);
            string = string.replace("{{memspeed}}", response[item]["memspeed"]);
            string = string.replace("{{memchannels}}", response[item]["memchannels"]);
            string = string.replace("{{pciev}}", response[item]["pciev"]);
            string = string.replace("{{l3c}}", response[item]["l3c"]);
            string = string.replace("{{igpu}}", response[item]["igpu"] || "No");
            string = string.replace("{{igpus}}", response[item]["igpus"] || "");
            string = string.replace("{{year}}", response[item]["year"]);
            container.innerHTML += string
        }
    }
}