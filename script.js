// Avalorn Card Catalog: расширенный фильтр с поддержкой Stars и Card Type

let allCards = [];
let selectedClan = null;
let selectedRace = null;
let selectedClass = null;
let selectedSun = null;
let selectedStar = null;
let selectedType = null;

const RACES = [
  "demon", "antherian", "amphibis", "avianites", "dragon",
  "undead", "nyths", "beast", "mech", "ocean"
];

const CLASSES = [
  "warrior", "hunter", "peasant", "mage", "scholar",
  "berserk", "priest", "assassin", "pirate"
];

const TYPES = ["creature", "spell", "instant", "attachment"];

const PATH_CLANS = "images/Clans/";
const PATH_ICONS = "images/ClansIcons/";
const PATH_RACES = "images/Race/";
const PATH_CLASSES = "images/ClassIcon/";

document.addEventListener("DOMContentLoaded", () => {
  fetch('data/avalorn_cards.json')
    .then(res => res.json())
    .then(data => {
      allCards = data;

      // Проверка структуры данных
      allCards.forEach(card => {
        if (!Array.isArray(card.cardType)) {
          console.warn(`Card "${card.name}" is missing 'cardType' or it's not an array`, card);
          card.cardType = []; // подстраховка
        }
      });

      renderResetButton();
      renderAllFilters();
      updateDisplay();
    });
});

function renderResetButton() {
  const resetContainer = document.createElement('div');
  resetContainer.id = "reset-container";
  document.body.appendChild(resetContainer);

  const resetBtn = document.createElement("button");
  resetBtn.id = "reset-btn";
  resetBtn.textContent = "⟳ Сбросить фильтры";
  resetBtn.onclick = () => {
    selectedClan = null;
    selectedRace = null;
    selectedClass = null;
    selectedSun = null;
    selectedStar = null;
    selectedType = null;
    renderAllFilters();
    updateDisplay();
  };
  resetContainer.appendChild(resetBtn);
}

function renderAllFilters() {
  renderClanButtons();
  renderRaceButtons();
  renderClassButtons();
  renderSunButtons();
  renderStarButtons();
  //renderTypeButtons();
}

function applyFilters() {
  return allCards.filter(card => {
    if (selectedClan && card.clan !== selectedClan) return false;
    if (selectedRace && !card.race.includes(selectedRace)) return false;
    if (selectedClass && !card.class.includes(selectedClass)) return false;
    if (selectedSun !== null && card.sun !== selectedSun) return false;
    if (selectedStar !== null && card.star !== selectedStar) return false;
    if (selectedType && (!card.cardType || !card.cardType.includes(selectedType))) return false;
    return true;
  });
}

function updateDisplay() {
  const hasAnyFilter = selectedClan || selectedRace || selectedClass || selectedSun !== null || selectedStar !== null || selectedType;

  if (!hasAnyFilter) {
    renderCards([]); // не показываем карты
    const title = document.querySelector('#card-view h2');
    title.textContent = "Выберите фильтры для отображения карт";
    return;
  }

  const filteredCards = applyFilters();
  renderCards(filteredCards);
  updateAvailableFilters(filteredCards);
}

function renderCards(cards) {
  const cardsContainer = document.getElementById('cards');
  const title = document.querySelector('#card-view h2');
  title.textContent = "Найдено карт: " + cards.length;
  cardsContainer.innerHTML = '';

  cards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
    <img src="${PATH_CLANS}${encodeURIComponent(card.name)}.jpg" alt="${card.name}" />
    <div>${card.name}</div>
  `;
    cardsContainer.appendChild(div);
  });
  attachZoomEvents();
}

function updateAvailableFilters(filteredCards) {
  const clans = new Set(filteredCards.map(c => c.clan));
  const races = new Set(filteredCards.flatMap(c => c.race));
  const classes = new Set(filteredCards.flatMap(c => c.class));
  const suns = new Set(filteredCards.map(c => c.sun));
  const stars = new Set(filteredCards.map(c => c.star));
  const types = new Set(filteredCards.flatMap(c => c.cardType));

  document.querySelectorAll('[data-filter-type]').forEach(el => {
    const type = el.dataset.filterType;
    const value = el.dataset.value;
    let visible = false;

    if (type === 'clan') visible = clans.has(value);
    else if (type === 'race') visible = races.has(value);
    else if (type === 'class') visible = classes.has(value);
    else if (type === 'sun') visible = suns.has(+value);
    else if (type === 'star') visible = stars.has(+value);
    else if (type === 'type') visible = selectedType === null || types.has(value);

    el.style.display = visible ? 'inline-block' : 'none';
  });
}

// function renderClanButtons() {
//   const container = document.getElementById("sidebar-left");
//   container.innerHTML = "";
//   const clans = [...new Set(allCards.map(c => c.clan))].sort();

//   clans.forEach(clan => {
//     const img = document.createElement("img");
//     img.src = `${PATH_ICONS}${encodeURIComponent(clan)}.png`;
//     img.alt = clan;
//     img.title = clan;
//     img.dataset.filterType = "clan";
//     img.dataset.value = clan;
//     img.onclick = () => {
//       selectedClan = selectedClan === clan ? null : clan;
//       updateDisplay();
//     };
//     container.appendChild(img);
//   });
// }
function renderClanButtons() {
  const container = document.getElementById("sidebar-left");
  container.innerHTML = "";

  // Добавляем строку поиска
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Поиск клана...";
  searchInput.id = "clan-search";
  searchInput.style.marginBottom = "10px";
  searchInput.style.width = "100%";
  searchInput.style.padding = "5px";
  searchInput.style.borderRadius = "4px";
  searchInput.style.border = "1px solid #888";
  searchInput.style.background = "#1e1e1e";
  searchInput.style.color = "white";

  container.appendChild(searchInput);

  const clans = [...new Set(allCards.map(c => c.clan))].sort();

  // Функция рендера списка кланов по фильтру
  function renderFilteredClans(filter = "") {
    // Удаляем старые иконки
    const existingIcons = container.querySelectorAll(".clan-icon");
    existingIcons.forEach(el => el.remove());

    clans
      .filter(clan => clan.toLowerCase().includes(filter.toLowerCase()))
      .forEach(clan => {
        const img = document.createElement("img");
        img.src = `${PATH_ICONS}${encodeURIComponent(clan)}.png`;
        img.alt = clan;
        img.title = clan;
        img.classList.add("clan-icon");
        img.dataset.filterType = "clan";
        img.dataset.value = clan;
        img.onclick = () => {
          selectedClan = selectedClan === clan ? null : clan;
          updateDisplay();
        };
        container.appendChild(img);
      });
  }

  // Изначально показываем всё
  renderFilteredClans();

  // Поиск по мере ввода
  searchInput.addEventListener("input", () => {
    renderFilteredClans(searchInput.value);
  });
}

function renderRaceButtons() {
  const container = document.getElementById("race-filter");
  container.innerHTML = "";
  RACES.forEach(r => {
    const img = document.createElement("img");
    img.src = `${PATH_RACES}${r}.png`;
    img.alt = r;
    img.title = r;
    img.dataset.filterType = "race";
    img.dataset.value = r;
    img.onclick = () => {
      selectedRace = selectedRace === r ? null : r;
      updateDisplay();
    };
    container.appendChild(img);
  });
}

function renderClassButtons() {
  const container = document.getElementById("class-filter");
  container.innerHTML = "";
  CLASSES.forEach(c => {
    const img = document.createElement("img");
    img.src = `${PATH_CLASSES}${c}.png`;
    img.alt = c;
    img.title = c;
    img.dataset.filterType = "class";
    img.dataset.value = c;
    img.onclick = () => {
      selectedClass = selectedClass === c ? null : c;
      updateDisplay();
    };
    container.appendChild(img);
  });
}

function renderSunButtons() {
  const container = document.getElementById("sun-buttons");
  container.innerHTML = "";
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.dataset.filterType = "sun";
    btn.dataset.value = i;
    btn.onclick = () => {
      selectedSun = selectedSun === i ? null : i;
      updateDisplay();
    };
    container.appendChild(btn);
  }
}

function renderStarButtons() {
  const container = document.getElementById("star-buttons");
  container.innerHTML = "";
  for (let i = 0; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.dataset.filterType = "star";
    btn.dataset.value = i;
    btn.classList.toggle("selected", selectedStar === i);
    btn.onclick = () => {
      selectedStar = selectedStar === i ? null : i;
      renderStarButtons();
      updateDisplay();
    };
    container.appendChild(btn);
   }
   }
 // Создаём элемент увеличения
const zoomPreview = document.createElement('img');
zoomPreview.id = 'zoom-preview';
document.body.appendChild(zoomPreview);

let zoomTimeout;

// Добавляем события на каждую карту после рендера
function attachZoomEvents() {
  document.querySelectorAll('.card img').forEach(img => {
    // Десктоп
   img.addEventListener('mousedown', (e) => {
  zoomTimeout = setTimeout(() => {
    zoomPreview.src = img.src;
    zoomPreview.style.display = 'block';
    // позиционирование больше не нужно
  }, 300);
});

    // img.addEventListener('mousemove', updateZoomPosition);

    img.addEventListener('mouseup', () => {
      clearTimeout(zoomTimeout);
      zoomPreview.style.display = 'none';
    });

    img.addEventListener('mouseleave', () => {
      clearTimeout(zoomTimeout);
      zoomPreview.style.display = 'none';
    });

    // Мобильные устройства
    img.addEventListener('touchstart', (e) => {
      e.preventDefault();
      zoomTimeout = setTimeout(() => {
        zoomPreview.src = img.src;
        zoomPreview.style.display = 'block';
        updateZoomPosition(e.touches[0]);
      }, 400);
    });

    // img.addEventListener('touchmove', (e) => {
    //   updateZoomPosition(e.touches[0]);
    // });

    img.addEventListener('touchend', () => {
      clearTimeout(zoomTimeout);
      zoomPreview.style.display = 'none';
    });

    img.addEventListener('touchcancel', () => {
      clearTimeout(zoomTimeout);
      zoomPreview.style.display = 'none';
    });
  });
}

function updateZoomPosition(e) {
  const zoomWidth = 300;
  const zoomHeight = 400;
  const padding = 20;

  const x = Math.min(e.pageX + padding, window.innerWidth - zoomWidth - padding);
  const y = Math.min(e.pageY + padding, window.innerHeight - zoomHeight - padding);

  zoomPreview.style.left = `${x}px`;
  zoomPreview.style.top = `${y}px`;
}
    