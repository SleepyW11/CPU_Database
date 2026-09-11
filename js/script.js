var item_snippet;
var full_snippet;
var data;
var cpuApiUrl = "https://www.techpowerup.com/cpu-specs/api/v1/chips";
var currentPage = 1;
var pageSize = 8;
var filteredRecords = [];

async function fetchResource(url, responseType) {
    var response = await fetch(url);
    if (!response.ok) {
        throw new Error("Unable to load " + url + " (" + response.status + ")");
    }
    return responseType === "json" ? response.json() : response.text();
}

window.addEventListener("DOMContentLoaded", function() {
    initializeTheme();
    loadResources();
    document.querySelectorAll("#search, #brand, #year, #cores, #socket").forEach(function(control) {
        control.addEventListener(control.type === "search" ? "input" : "change", function() {
            currentPage = 1;
            itemReplace();
        });
    });
    document.getElementById("filter-toggle").addEventListener("click", toggleFilterMenu);
    document.getElementById("clear-filters").addEventListener("click", clearFilters);
    document.getElementById("theme").addEventListener("change", changeTheme);
    document.addEventListener("click", closeFilterMenuOnOutsideClick);
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeFilterMenu();
        }
    });
    document.querySelector(".x").addEventListener("click", function() {
        document.querySelector(".full-details").style.display = "none";
        document.querySelector(".main-body").style.display = "block";
    });
});

function initializeTheme() {
    var savedTheme = localStorage.getItem("cpu-db-theme") || "ember";
    applyTheme(savedTheme);
}

function changeTheme(event) {
    applyTheme(event.target.value);
    localStorage.setItem("cpu-db-theme", event.target.value);
}

function applyTheme(theme) {
    var allowedThemes = ["burgundy", "citrus", "ember", "forest", "graphite", "midnight", "ocean", "rosewood"];
    var selectedTheme = allowedThemes.includes(theme) ? theme : "ember";
    document.documentElement.dataset.theme = selectedTheme;
    var themeSelect = document.querySelector("#theme");
    if (themeSelect) themeSelect.value = selectedTheme;
}

async function loadResources() {
    setCatalogueStatus("loading");
    try {
        item_snippet = await fetchResource("snippets/item-snippet.html", "text");
        full_snippet = await fetchResource("snippets/full-item-snippet.html", "text");
        var apiResponse = await fetchResource(cpuApiUrl, "json");
        data = normalizeApiRecords(apiResponse.results);
        populateFilters();
        itemReplace();
    } catch (error) {
        setCatalogueStatus("error");
        console.error(error);
    }
}

function setCatalogueStatus(state) {
    var status = document.querySelector("#catalogue-status");
    if (state === "loading") {
        status.hidden = false;
        status.innerHTML = '<span class="loader-spinner" aria-hidden="true"></span>Loading processor catalogue...';
    } else if (state === "error") {
        status.hidden = false;
        status.innerHTML = "The processor catalogue could not be loaded. Please refresh and try again.";
    } else {
        status.hidden = true;
    }
}

function normalizeApiRecords(records) {
    return records
        .filter(function(entry) {
            return entry.name && entry.manufacturer && entry.released;
        })
        .map(function(cpu) {
            var cacheKb = (cpu.cacheL1Kb || 0) + (cpu.cacheL2Kb || 0) + (cpu.cacheL3Kb || 0);
            return {
                name: cpu.name,
                brand: cpu.manufacturer.toLowerCase(),
                year: Number(cpu.released.slice(0, 4)),
                sourceUrl: cpu.url,
                architecture: {
                    generation: cpu.codename || "Not listed",
                    lithography: cpu.processNm || "Not listed",
                    socket: cpu.socket || "Not listed"
                },
                performance: {
                    base: cpu.baseClockMhz ? (cpu.baseClockMhz / 1000).toFixed(2) : "Not listed",
                    boost: "Not listed",
                    cores: cpu.cores || 0,
                    threads: cpu.threads || 0,
                    tdp: cpu.tdpW || "Not listed",
                    cache: cacheKb ? (cacheKb / 1024).toFixed(1) + "MB" : "Not listed"
                },
                memory: {
                    type: "Not listed",
                    speed: cpu.memSpeedMhz || "Not listed",
                    channels: cpu.memChannels || "Not listed"
                },
                expansion: { pcie: "Not listed" },
                graphics: { integrated: false, model: null },
                features: {
                    multithreading: cpu.threads > cpu.cores,
                    unlocked: false
                }
            };
        });
}

function populateFilters() {
    var brands = uniqueValues(data, function(cpu) { return cpu.brand; });
    var years = uniqueValues(data, function(cpu) { return cpu.year; });
    var sockets = uniqueValues(data, function(cpu) { return cpu.architecture.socket; });
    var coreCounts = uniqueValues(data, function(cpu) { return cpu.performance.cores; }).sort(function(a, b) { return a - b; });

    populateSelect("brand", brands, function(value) { return value.toUpperCase(); });
    populateSelect("year", years.sort(function(a, b) { return a - b; }), String);
    populateSelect("socket", sockets, String);
    populateSelect("cores", coreCounts, function(value) { return value + "+ cores"; });
}

function uniqueValues(records, selector) {
    return Array.from(new Set(records.map(selector)));
}

function populateSelect(id, values, labelFormatter) {
    var select = document.querySelector("#" + id);
    var defaultOption = select.options[0];
    select.innerHTML = "";
    select.appendChild(defaultOption);
    values.forEach(function(value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = labelFormatter(value);
        select.appendChild(option);
    });
}

function itemReplace() {
    if (!data) return;
    container = document.querySelector(".item-container");
    var search = document.querySelector("#search").value.trim().toLowerCase();
    var brand = document.querySelector("#brand").value;
    var year = document.querySelector("#year").value;
    var minimumCores = Number(document.querySelector("#cores").value);
    var socket = document.querySelector("#socket").value;
    var string;
    container.innerHTML = "";
    filteredRecords = [];
    for(item in data) {
        var cpu = data[item];
        var searchableText = (cpu.name + " " + cpu.architecture.generation).toLowerCase();
        if((!search || searchableText.includes(search)) &&
            (brand === "all" || cpu.brand === brand) &&
            (year === "all" || String(cpu.year) === year) &&
            cpu.performance.cores >= minimumCores &&
            (socket === "all" || cpu.architecture.socket === socket)) {
            filteredRecords.push({ cpu: cpu, index: item });
        }
    }
    var pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
    currentPage = Math.min(currentPage, pageCount);
    var pageStart = (currentPage - 1) * pageSize;
    filteredRecords.slice(pageStart, pageStart + pageSize).forEach(function(record) {
            var cpu = record.cpu;
            var item = record.index;
            string = item_snippet;
            string = string.replace("xyzitem00", item);
            string = string.replace("{{name}}", data[item]["name"]);
            string = string.replace("{{base}}", data[item].performance.base);
            string = string.replace("{{boost}}", data[item].performance.boost);
            string = string.replace("{{cores}}", data[item].performance.cores);
            string = string.replace("{{threads}}", data[item].performance.threads);
            string = string.replace("{{l3c}}", data[item].performance.cache);
            string = string.replace("{{tdp}}", data[item].performance.tdp);
            string = string.replace("{{litho}}", data[item].architecture.lithography);
            string = string.replace("{{socket}}", data[item].architecture.socket);
            string = string.replace("{{memtype}}", data[item].memory.type);
            string = string.replace("{{memspeed}}", data[item].memory.speed);
            string = string.replace("{{memchannels}}", data[item].memory.channels);
            string = string.replace("{{pciev}}", data[item].expansion.pcie);
            string = string.replace("{{igpu}}", data[item].graphics.integrated ? "Yes" : "No");
            string = string.replace("{{igpus}}", data[item].graphics.model || "");
            string = string.replace("{{year}}", data[item]["year"]);
            container.innerHTML += string;
    });
    setCatalogueStatus("ready");
    document.querySelector("#result-count").textContent = filteredRecords.length + (filteredRecords.length === 1 ? " result" : " results");
    renderPagination(pageCount);
    updateFilterCount();
}

function renderPagination(pageCount) {
    var pagination = document.querySelector("#pagination");
    pagination.innerHTML = "";
    if (pageCount <= 1) return;
    var previous = createPageButton("Previous", currentPage - 1, currentPage === 1);
    pagination.appendChild(previous);
    for (var page = 1; page <= pageCount; page++) {
        var button = createPageButton(String(page), page, false);
        if (page === currentPage) button.setAttribute("aria-current", "page");
        pagination.appendChild(button);
    }
    pagination.appendChild(createPageButton("Next", currentPage + 1, currentPage === pageCount));
}

function createPageButton(label, page, disabled) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", function() {
        currentPage = page;
        itemReplace();
        document.querySelector(".main-body").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return button;
}

function toggleFilterMenu(event) {
    event.stopPropagation();
    var menu = document.querySelector("#filter-menu");
    var isOpen = !menu.hidden;
    menu.hidden = isOpen;
    document.querySelector("#filter-toggle").setAttribute("aria-expanded", String(!isOpen));
}

function closeFilterMenu() {
    document.querySelector("#filter-menu").hidden = true;
    document.querySelector("#filter-toggle").setAttribute("aria-expanded", "false");
}

function closeFilterMenuOnOutsideClick(event) {
    if (!event.target.closest(".filter-popover-wrap")) {
        closeFilterMenu();
    }
}

function clearFilters() {
    currentPage = 1;
    document.querySelector("#search").value = "";
    document.querySelector("#brand").value = "all";
    document.querySelector("#year").value = "all";
    document.querySelector("#cores").value = "0";
    document.querySelector("#socket").value = "all";
    itemReplace();
}

function updateFilterCount() {
    var activeFilters = 0;
    ["brand", "year", "cores", "socket"].forEach(function(id) {
        var control = document.querySelector("#" + id);
        var defaultValue = id === "cores" ? "0" : "all";
        if (control.value !== defaultValue) activeFilters++;
    });
    document.querySelector("#filter-count").textContent = activeFilters;
}
function itemReplaceFull(num) {
    container = document.querySelector(".full-details-con");
    var string;
    container.innerHTML = "";
    string = full_snippet;
    string = string.replace("{{name}}", data[num]["name"]);
    string = string.replace("{{generation}}", data[num].architecture.generation);
    string = string.replace("{{base}}", data[num].performance.base);
    string = string.replace("{{boost}}", data[num].performance.boost);
    string = string.replace("{{cores}}", data[num].performance.cores);
    string = string.replace("{{threads}}", data[num].performance.threads);
    string = string.replace("{{l3c}}", data[num].performance.cache);
    string = string.replace("{{tdp}}", data[num].performance.tdp);
    string = string.replace("{{litho}}", data[num].architecture.lithography);
    string = string.replace("{{socket}}", data[num].architecture.socket);
    string = string.replace("{{memtype}}", data[num].memory.type);
    string = string.replace("{{memspeed}}", data[num].memory.speed);
    string = string.replace("{{memchannels}}", data[num].memory.channels);
    string = string.replace("{{pciev}}", data[num].expansion.pcie);
    string = string.replace("{{igpu}}", data[num].graphics.integrated ? "Yes" : "No");
    string = string.replace("{{igpus}}", data[num].graphics.model || "");
    string = string.replace("{{multithreading}}", data[num].features.multithreading ? "Yes" : "No");
    string = string.replace("{{unlocked}}", data[num].features.unlocked ? "Yes" : "No");
    string = string.replace("{{year}}", data[num]["year"]);
    container.innerHTML += string;
    document.querySelector(".full-details").style.display = "flex";
}