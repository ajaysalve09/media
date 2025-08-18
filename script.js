let data = [];
const planetList = document.getElementById('planetList');
const moonList = document.getElementById('moonList');
const detailsPanel = document.getElementById('details');
const introInfo = document.getElementById('introInfo');

const searchWrapper = document.querySelector('.search-wrapper');
const searchToggle = document.getElementById('searchToggle');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('search');

// Load JSON Data
async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error("Could not load data.json");
    data = await res.json();
    loadPlanets(data);
  } catch (err) {
    console.error(err);
    planetList.innerHTML = "<p style='color:red;'>Error loading planet data.</p>";
  }
}

// Display planet list
function loadPlanets(planets) {
  planetList.innerHTML = "";
  moonList.innerHTML = "";
  detailsPanel.style.display = 'none';
  introInfo.style.display = 'block';

  planets.forEach((planet, index) => {
    const pDiv = document.createElement('div');
    pDiv.className = 'planet';
    pDiv.innerText = planet.name;
    pDiv.onclick = () => selectPlanet(index);
    planetList.appendChild(pDiv);
  });
}

// Handle planet click
function selectPlanet(index) {
  clearSelected(planetList);
  const planetDivs = planetList.querySelectorAll('.planet');
  planetDivs[index].classList.add('selected');

  loadMoons(data[index].moons);
  showDetails(data[index]);
}

// Load moons for selected planet
function loadMoons(moons) {
  moonList.innerHTML = "";
  if (!moons || moons.length === 0) {
    moonList.style.display = 'none';
    return;
  }
  moonList.style.display = 'flex';

  moons.forEach((moon) => {
    const mDiv = document.createElement('div');
    mDiv.className = 'moon';
    mDiv.innerText = moon.name;
    mDiv.onclick = () => {
      clearSelected(moonList);
      mDiv.classList.add('selected');
      showDetails(moon);
    };
    moonList.appendChild(mDiv);
  });
}

// Remove selection highlight
function clearSelected(container) {
  container.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
}

// Show details panel
function showDetails(item) {
  introInfo.style.display = 'none';
  detailsPanel.style.display = 'block';

  let nameText = item.name;
  if (item.moons && item.moons.length > 0) {
    nameText += ` (Moons: ${item.moons.length})`;
  }
  document.getElementById('detailName').innerText = nameText;
  document.getElementById('detailImage').src = item.image || '';
  document.getElementById('detailImage').alt = item.name;
  document.getElementById('detailIntro').innerText = item.description || '';

  const detailSections = document.getElementById('detailSections');
  detailSections.innerHTML = '';

  if (item.sections) {
    for (const [sectionTitle, sectionData] of Object.entries(item.sections)) {
      const section = document.createElement('div');
      section.className = 'section';

      const header = document.createElement('div');
      header.className = 'section-header';
      header.textContent = sectionTitle;

      const content = document.createElement('div');
      content.className = 'section-content';

      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';

      for (let key in sectionData) {
        const row = document.createElement('tr');
        row.style.borderBottom = '0.1px solid #2f3e53';

        const keyCell = document.createElement('td');
        keyCell.style.fontWeight = '400';
        keyCell.style.padding = '8px 4px';
        keyCell.style.color = '#007bff';
        keyCell.textContent = key;

        const valCell = document.createElement('td');
        valCell.style.padding = '8px 4px';
        valCell.style.color = '#000';

        const value = sectionData[key];

        if (typeof value === 'object' && value !== null) {
          const nestedTable = document.createElement('table');
          nestedTable.style.width = '100%';
          nestedTable.style.borderCollapse = 'collapse';

          for (let subKey in value) {
            const nestedRow = document.createElement('tr');
            nestedRow.style.borderBottom = '0.1px solid #aaa';

            const nestedKeyCell = document.createElement('td');
            nestedKeyCell.style.fontWeight = '400';
            nestedKeyCell.style.padding = '4px 6px';
            nestedKeyCell.style.color = '#007bff';
            nestedKeyCell.textContent = subKey;

            const nestedValCell = document.createElement('td');
            nestedValCell.style.padding = '4px 6px';
            nestedValCell.style.color = '#000';
            nestedValCell.textContent = value[subKey];

            nestedRow.appendChild(nestedKeyCell);
            nestedRow.appendChild(nestedValCell);
            nestedTable.appendChild(nestedRow);
          }

          valCell.appendChild(nestedTable);
        } else {
          valCell.textContent = value;
        }

        row.appendChild(keyCell);
        row.appendChild(valCell);
        table.appendChild(row);
      }

      content.appendChild(table);

      header.onclick = () => {
        header.classList.toggle('open');
        if (content.classList.contains('open')) {
          content.style.maxHeight = null;
          content.classList.remove('open');
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
          content.classList.add('open');
        }
      };

      section.appendChild(header);
      section.appendChild(content);
      detailSections.appendChild(section);
    }
  }
}

// Search functionality
searchToggle.addEventListener('click', () => {
  searchWrapper.classList.add('expanded');
  searchInput.focus();
});

searchClose.addEventListener('click', () => {
  searchWrapper.classList.remove('expanded');
  searchInput.value = '';
  loadPlanets(data); // Reset to all planets
  moonList.style.display = 'none';
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length === 0) {
    loadPlanets(data);
    moonList.style.display = 'none';
    return;
  }

  const filteredPlanets = data.filter(planet =>
    planet.name.toLowerCase().includes(q) ||
    (planet.description && planet.description.toLowerCase().includes(q))
  );

  loadPlanets(filteredPlanets);

  // Show matching moons
  moonList.innerHTML = '';
  moonList.style.display = 'flex';
  let foundAnyMoon = false;

  data.forEach(planet => {
    if (planet.moons) {
      const matchingMoons = planet.moons.filter(moon =>
        moon.name.toLowerCase().includes(q) ||
        (moon.description && moon.description.toLowerCase().includes(q))
      );

      matchingMoons.forEach(moon => {
        foundAnyMoon = true;
        const mDiv = document.createElement('div');
        mDiv.className = 'moon';
        mDiv.innerText = `${moon.name} (${planet.name})`;
        mDiv.onclick = () => {
          clearSelected(moonList);
          mDiv.classList.add('selected');
          showDetails(moon);
        };
        moonList.appendChild(mDiv);
      });
    }
  });

  if (!foundAnyMoon) {
    moonList.style.display = 'none';
  }
});

loadData();
