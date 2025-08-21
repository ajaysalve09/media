// ==========================
// Globals & DOM References
// ==========================
let data = [];

const officialPlanetList = document.getElementById("officialPlanetList");
const moonList           = document.getElementById("moonList");
const detailsPanel       = document.getElementById("details");
const introInfo          = document.getElementById("introInfo");

const searchWrapper = document.querySelector(".search-wrapper");
const searchToggle  = document.getElementById("searchToggle");
// const searchClose   = document.getElementById("searchClose");
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
function createItem(item, clickHandler) {
  const div = document.createElement("div");
  div.className = "item";

  const img = document.createElement("img");
  img.src = item.image || "placeholder.png";
  img.alt = item.name;

  const span = document.createElement("span");
  span.textContent = item.name;

  div.appendChild(img);
  div.appendChild(span);

  div.onclick = () => clickHandler(item, div);

  return div;
}

function renderItems(items) {
  // Reset
  officialPlanetList.innerHTML = "";
  moonList.innerHTML = "";
  detailsPanel.style.display = "none";
  introInfo.style.display = "block";

  items.forEach(item => {
    const itemDiv = createItem(item, (i, div) => handleSelect(i, div));

    switch (item.type) {
      case "official":
        officialPlanetList.appendChild(itemDiv);
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
function handleSelect(item, element) {
  clearSelected(officialPlanetList);
  clearSelected(moonList);

  element.classList.add("selected");

  // Show moons if the item has them
  if (item.moons) renderMoons(item.moons);
  else moonList.style.display = "none";

  showDetails(item);
}

function renderMoons(moons) {
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
    });
    moonList.appendChild(moonDiv);
  });
}

function clearSelected(container) {
  container.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
}

function showDetails(item) {
  introInfo.style.display = "none";
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

function buildTable(dataObj) {
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  for (let key in dataObj) {
    const row = document.createElement("tr");
    row.style.borderBottom = "0.1px solid #2f3e53";

    const keyCell = document.createElement("td");
    keyCell.style.fontWeight = "400";
    keyCell.style.padding = "8px 4px";
    keyCell.style.color = "#007bff";
    keyCell.textContent = key;

    const valCell = document.createElement("td");
    valCell.style.padding = "8px 4px";
    valCell.style.color = "#000";

    const value = dataObj[key];
    if (typeof value === "object" && value !== null) {
      valCell.appendChild(buildTable(value));
    } else {
      valCell.textContent = value;
    }

    row.appendChild(keyCell);
    row.appendChild(valCell);
    table.appendChild(row);
  }

  return table;
}

// ==========================
// Search
// ==========================
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length === 0) {
    renderItems(data);
    moonList.style.display = "none";
    return;
  }

  const filtered = data.filter(item =>
    item.name.toLowerCase().includes(q) ||
    (item.description && item.description.toLowerCase().includes(q))
  );

  renderItems(filtered);
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length === 0) {
    renderItems(data);
    moonList.style.display = "none";
    return;
  }

  const filtered = data.filter(item =>
    item.name.toLowerCase().includes(q) ||
    (item.description && item.description.toLowerCase().includes(q))
  );

  renderItems(filtered);
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

