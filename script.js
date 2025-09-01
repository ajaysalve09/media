<<<<<<< HEAD
=======
// ==========================
// Globals & DOM References
// ==========================
let data = [];

const officialPlanetList = document.getElementById("officialPlanetList");
const moonList           = document.getElementById("moonList");
const introInfo          = document.getElementById("introInfo");

const searchInput   = document.getElementById("search");
const shareBtn      = document.getElementById("shareBtn");
const menuBtn       = document.querySelector(".menu-btn");
const sideMenu      = document.querySelector(".side-menu");
const overlay       = document.getElementById("overlay");

// ==========================
// Utility: Get Query Parameter
// ==========================
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// ==========================
// Load Data
// ==========================
async function loadData() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error("Could not load data.json");
    data = await res.json();

    const planetName = getQueryParam("planet");
    if (planetName) {
      // We're on a planet page
      const planet = data.find(p => p.name === planetName);
      if (planet) showPlanetPage(planet);
      else console.error("Planet not found");
    } else {
      // We're on the main page
      renderItems(data);
    }

  } catch (err) {
    console.error(err);
    officialPlanetList.innerHTML = "<p style='color:red;'>Error loading data.</p>";
  }
}

// ==========================
// Create & Render Items
// ==========================
function createItem(item, clickHandler, query = "") {
  const div = document.createElement("div");
  div.className = "item";

  const img = document.createElement("img");
  img.src = item.image || "placeholder.png";
  img.alt = item.name;

  const span = document.createElement("span");
  if (query && item.name.toLowerCase().includes(query.toLowerCase())) {
    const regex = new RegExp(`(${query})`, "gi");
    span.innerHTML = item.name.replace(regex, "<mark>$1</mark>");
  } else {
    span.textContent = item.name;
  }

  div.appendChild(img);
  div.appendChild(span);

  // Redirect to page
  div.onclick = () => {
    if (item.url) {
      window.location.href = `${item.url}?planet=${encodeURIComponent(item.name)}`;
    }
  };

  return div;
}

function renderItems(items, query = "") {
  officialPlanetList.innerHTML = "";
  moonList.innerHTML = "";

  items.forEach(item => {
    const div = createItem(item, null, query);
    if (item.type === "official") officialPlanetList.appendChild(div);
    else if (item.type === "moon") {
      moonList.appendChild(div);
      moonList.style.display = "flex";
    }
  });
}

// ==========================
// Planet Page Rendering
// ==========================
function showPlanetPage(planet) {
  document.getElementById("detailName").innerText = planet.name;
  document.getElementById("detailImage").src = planet.image || "";
  document.getElementById("detailImage").alt = planet.name;
  document.getElementById("detailIntro").innerText = planet.description || "";

  const detailSections = document.getElementById("detailSections");
  detailSections.innerHTML = "";

  if (planet.sections) {
    for (const [title, contentData] of Object.entries(planet.sections)) {
      const section = document.createElement("div");
      section.className = "section";

      const header = document.createElement("div");
      header.className = "section-header";
      header.textContent = title;

      const content = document.createElement("div");
      content.className = "section-content";
      content.appendChild(buildTable(contentData));

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

  // Render moons
  if (planet.moons && planet.moons.length > 0) {
    const moonContainer = document.getElementById("moonList");
    moonContainer.innerHTML = "";
    planet.moons.forEach(moon => {
      const div = document.createElement("div");
      div.className = "item";
      div.textContent = moon.name;
      div.onclick = () => {
        if (moon.url) window.location.href = moon.url + `?moon=${encodeURIComponent(moon.name)}`;
      };
      moonContainer.appendChild(div);
    });
    moonContainer.style.display = "flex";
  }
}

// ==========================
// Build Table (Recursive)
// ==========================
function buildTable(data) {
  if (data == null) return document.createDocumentFragment();

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    const p = document.createElement("p");
    p.textContent = data;
    return p;
  }

  if (Array.isArray(data)) {
    const ul = document.createElement("ul");
    data.forEach(v => {
      const li = document.createElement("li");
      if (typeof v === "object") li.appendChild(buildTable(v));
      else li.textContent = v;
      ul.appendChild(li);
    });
    return ul;
  }

  if (typeof data === "object") {
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    Object.keys(data).forEach(key => {
      const row = document.createElement("tr");
      const keyCell = document.createElement("td");
      keyCell.style.fontWeight = "500";
      keyCell.style.color = "#007bff";
      keyCell.textContent = key;

      const valCell = document.createElement("td");
      valCell.appendChild(buildTable(data[key]));

      row.appendChild(keyCell);
      row.appendChild(valCell);
      table.appendChild(row);
    });

    return table;
  }

  const p = document.createElement("p");
  p.textContent = String(data);
  return p;
}

// ==========================
// Search
// ==========================
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    renderItems(data);
    return;
  }

  const results = [];
  data.forEach(item => {
    const matchPlanet = item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
    const matchedMoons = (item.moons || []).filter(m => m.name.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q)));
    if (matchPlanet) results.push(item);
    else if (matchedMoons.length) results.push({...item, moons: matchedMoons});
  });

  renderItems(results, q);
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
        url: window.location.href
      });
    } catch (err) {
      console.error(err);
    }
  } else alert("Your browser does not support Web Share API.");
});

// ==========================
// Side Menu & Dropdown
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

document.querySelectorAll(".dropdown-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const dropdown = btn.parentElement;
    const content = dropdown.querySelector(".dropdown-content");

    if (dropdown.classList.contains("active")) {
      content.style.maxHeight = 0; // close
      dropdown.classList.remove("active");
    } else {
      content.style.maxHeight = content.scrollHeight + "px"; // open dynamically
      dropdown.classList.add("active");
    }
  });
});

// ==========================
// Initialize
// ==========================
loadData();
>>>>>>> 34d4f700f498e2cf0b6754df1fc0dec455ed78bf
