// ==========================
// Globals & DOM References
// ==========================
let data = [];

let lastSearchQuery = "";
let lastSearchResults = [];

const officialPlanetList = document.getElementById("officialPlanetList");
const moonList           = document.getElementById("moonList");
const detailsPanel       = document.getElementById("details");
const introInfo          = document.getElementById("introInfo");

const searchWrapper = document.querySelector(".search-wrapper");
const searchToggle  = document.getElementById("searchToggle");
const searchInput   = document.getElementById("search");

const shareBtn   = document.getElementById("shareBtn");
const menuBtn    = document.querySelector(".menu-btn");
const sideMenu   = document.querySelector(".side-menu");
const overlay    = document.getElementById("overlay");

// ==========================
// Data Loading
// ==========================
async function loadData() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error("Could not load data.json");

    data = await res.json();
    renderItems(data);
  } catch (err) {
    console.error(err);
    officialPlanetList.innerHTML = "<p style='color:red;'>Error loading data.</p>";
  }
}

// ==========================
// Rendering Helpers
// ==========================
function createItem(item, clickHandler, query = "") {
  const div = document.createElement("div");
  div.className = "item";

  const img = document.createElement("img");
  img.src = item.image || "placeholder.png";
  img.alt = item.name;

  const span = document.createElement("span");

  // Highlight matches in name
  if (query && item.name.toLowerCase().includes(query.toLowerCase())) {
    const regex = new RegExp(`(${query})`, "gi");
    span.innerHTML = item.name.replace(regex, "<mark>$1</mark>");
  } else {
    span.textContent = item.name;
  }

  div.appendChild(img);
  div.appendChild(span);

  div.onclick = () => clickHandler(item, div);

  return div;
}


function renderItems(items, query = "", fromSearch = false) {
  // Reset
  officialPlanetList.innerHTML = "";
  moonList.innerHTML = "";
  detailsPanel.style.display = "none";
  introInfo.style.display = "block";

  items.forEach(item => {
    const itemDiv = createItem(item, (i, div) => handleSelect(i, div, query), query);

    switch (item.type) {
      case "official":
        officialPlanetList.appendChild(itemDiv);

        // ✅ If this render came from search, always show moons
        if (fromSearch && item.moons && item.moons.length > 0) {
          renderMoons(item.moons, query);
        }
        break;

      case "moon":
        moonList.appendChild(itemDiv);
        moonList.style.display = "flex";
        break;

      default:
        console.warn("Unknown type:", item.type, item.name);
    }
  });
}


// ==========================
// Selection & Details
// ==========================
function handleSelect(item, element, query = "") {
  clearSelected(officialPlanetList);
  clearSelected(moonList);

  element.classList.add("selected");

  if (item.moons) renderMoons(item.moons, query);
  else moonList.style.display = "none";

  showDetails(item);
}

function renderMoons(moons, query = "") {
  moonList.innerHTML = "";
  if (!moons || moons.length === 0) {
    moonList.style.display = "none";
    return;
  }
  moonList.style.display = "flex";

  moons.forEach(moon => {
    const moonDiv = createItem(moon, (m, div) => {
      clearSelected(moonList);
      div.classList.add("selected");
      showDetails(m);
    }, query); 
    moonList.appendChild(moonDiv);
  });
}

function clearSelected(container) {
  container.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
}

const backBtn = document.getElementById("backBtn");
backBtn.addEventListener("click", () => {
  detailsPanel.style.display = "none";   // hide details
  introInfo.style.display = "block";     // show intro again
  officialPlanetList.style.display = "flex"; // show planets
  // moons only visible if previously selected
  if (moonList.children.length > 0) {
    moonList.style.display = "flex";
  }
});


function showDetails(item) {
  // Hide intro + lists
  introInfo.style.display = "none";
  officialPlanetList.style.display = "none";
  moonList.style.display = "none";

  // Show details
  detailsPanel.style.display = "block";

  // Header
  let title = item.name;
  if (item.moons && item.moons.length > 0) {
    title += ` (Moons: ${item.moons.length})`;
  }
  document.getElementById("detailName").innerText = title;
  document.getElementById("detailImage").src = item.image || "";
  document.getElementById("detailImage").alt = item.name;
  document.getElementById("detailIntro").innerText = item.description || "";

  // Sections
  const detailSections = document.getElementById("detailSections");
  detailSections.innerHTML = "";

  if (!item.sections) return;

  for (const [sectionTitle, sectionData] of Object.entries(item.sections)) {
    const section = document.createElement("div");
    section.className = "section";

    const header = document.createElement("div");
    header.className = "section-header";
    header.textContent = sectionTitle;

    const content = document.createElement("div");
    content.className = "section-content";

    const table = buildTable(sectionData);
    content.appendChild(table);

    header.onclick = () => {
      header.classList.toggle("open");
      content.classList.toggle("open");
      content.style.maxHeight = content.classList.contains("open") ? content.scrollHeight + "px" : null;
    };

    section.appendChild(header);
    section.appendChild(content);
    detailSections.appendChild(section);
  }
}

function buildTable(data) {
  if (data == null) return document.createDocumentFragment();

  const makeP = (text) => {
    const p = document.createElement("p");
    p.textContent = String(text);
    p.style.margin = "0"; 
    p.style.padding = "0"; 
    return p;
  };

  const t = typeof data;
  if (t === "string" || t === "number" || t === "boolean") {
    return makeP(data);
  }

  if (Array.isArray(data)) {
    const ul = document.createElement("ul");
    ul.style.margin = "0";
    data.forEach((v) => {
      const li = document.createElement("li");
      if (v !== null && typeof v === "object") {
        li.appendChild(buildTable(v));
      } else {
        li.textContent = String(v);
      }
      ul.appendChild(li);
    });
    return ul;
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);

    const allNumeric = keys.length > 0 && keys.every((k) => /^\d+$/.test(k));
    if (allNumeric) {
      const joined = keys.sort((a, b) => a - b).map((k) => data[k]).join("");
      return makeP(joined);
    }

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    keys.forEach((key) => {
      const value = data[key];
      if (value === undefined) return;

      const row = document.createElement("tr");

      const keyCell = document.createElement("td");
      keyCell.style.fontWeight = "500";
      keyCell.style.color = "#007bff";
      keyCell.style.verticalAlign = "top";
      keyCell.textContent = key;

      const valCell = document.createElement("td");
      valCell.style.color = "#000";

      valCell.appendChild(buildTable(value));

      row.appendChild(keyCell);
      row.appendChild(valCell);
      table.appendChild(row);
    });

    return table;
  }

  return makeP(String(data));
}

// ==========================
// Search
// ==========================
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();

  if (q.length === 0) {
    renderItems(data);
    officialPlanetList.style.display = "flex";  // ✅ show planets again
    moonList.style.display = "none";            // moons hidden by default
    detailsPanel.style.display = "none";        // ✅ hide details if search cleared
    return;
  }

  let results = [];

  data.forEach(item => {
    const matchPlanet =
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q));

    const matchedMoons = (item.moons || []).filter(moon =>
      moon.name.toLowerCase().includes(q) ||
      (moon.description && moon.description.toLowerCase().includes(q))
    );

    if (matchPlanet) {
      results.push(item);
    } else if (matchedMoons.length > 0) {
      results.push({
        ...item,
        moons: matchedMoons
      });
    }
  });

  // ✅ Ensure lists are visible while searching
  detailsPanel.style.display = "none";
  officialPlanetList.style.display = "flex";
  moonList.style.display = "flex";

  renderItems(results, q, true);
});


// ==========================
// Share Button
// ==========================
shareBtn.addEventListener("click", async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Space Explorar",
        text: "Take a tour in space with Space Explorar",
        url: window.location.href,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  } else {
    alert("Your browser does not support the Web Share API.");
  }
});

// ==========================
// Side Menu
// ==========================
menuBtn.addEventListener("click", () => {
  sideMenu.style.left = "0";
  overlay.classList.add("active");
  document.body.classList.add("no-scroll");
});

overlay.addEventListener("click", () => {
  sideMenu.style.left = "-260px";
  overlay.classList.remove("active");
  document.body.classList.remove("no-scroll");
});

// ==========================
// Init
// ==========================
loadData();


// Function to remove highlight (<mark>) only from clicked item
function removeHighlightOnClick(container) {
  container.addEventListener("click", function (e) {
    const mark = e.target.closest("mark");
    if (mark) {
      // unwrap <mark> and keep its text
      const textNode = document.createTextNode(mark.textContent);
      mark.replaceWith(textNode);
    }
  });
}

// Apply to your lists
removeHighlightOnClick(document.getElementById("officialPlanetList"));
removeHighlightOnClick(document.getElementById("dwarfPlanetList"));
removeHighlightOnClick(document.getElementById("moonList"));
