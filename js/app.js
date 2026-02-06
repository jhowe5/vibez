// ── Fallback data for file:// protocol ──────────────────
const FALLBACK_PLACES = [
  { id: "kingston-2020", name: "Kingston", lat: 44.2312, lng: -76.486, date: "2020-01-01", color: "#ff6b6b", notes: "Birthplace" },
  { id: "ottawa-2020", name: "Ottawa", lat: 45.4215, lng: -75.6972, date: "2020-01-01", color: "#ffe66d", notes: "Home" },
  { id: "rockport-2020", name: "Rockport, ON", lat: 44.3812, lng: -75.9371, date: "2020-01-01", color: "#a78bfa", notes: "First visit outside hospital" },
  { id: "toronto-2021", name: "Toronto", lat: 43.6532, lng: -79.3832, date: "2021-01-01", color: "#4ecdc4", notes: "Visit grandparents" },
  { id: "halifax-2021", name: "Halifax", lat: 44.6488, lng: -63.5752, date: "2021-01-01", color: "#f97316", notes: "First flight" },
  { id: "naples-fl-2022", name: "Naples, Florida", lat: 26.142, lng: -81.7948, date: "2022-01-01", color: "#06b6d4", notes: "First cousin trip" },
  { id: "princeton-2022", name: "Princeton, New Jersey", lat: 40.3573, lng: -74.6672, date: "2022-01-01", color: "#c084fc", notes: "Big cousin party" },
  { id: "cetara-2022", name: "Cetara, Italy", lat: 40.6489, lng: 14.6989, date: "2022-01-01", color: "#ec4899", notes: "Italy trip" },
  { id: "monopoli-2022", name: "Monopoli, Italy", lat: 40.9511, lng: 17.29, date: "2022-01-01", color: "#8b5cf6", notes: "Italy trip" },
  { id: "tuscany-2022", name: "Tuscany, Italy", lat: 43.7696, lng: 11.2558, date: "2022-01-01", color: "#f59e0b", notes: "Italy trip" },
  { id: "la-fortuna-2022", name: "La Fortuna, Costa Rica", lat: 10.4719, lng: -84.6425, date: "2022-01-01", color: "#10b981", notes: "Big family trip" },
  { id: "merida-2023", name: "M\u00e9rida, Mexico", lat: 20.9674, lng: -89.5926, date: "2023-01-01", color: "#ef4444", notes: "Home away from home" },
  { id: "montreal-2023", name: "Montreal", lat: 45.5017, lng: -73.5673, date: "2023-01-01", color: "#3b82f6", notes: "Biodome" },
  { id: "cayman-islands-2024", name: "Cayman Islands", lat: 19.2869, lng: -81.3674, date: "2024-01-01", color: "#14b8a6", notes: "Cousin adventure" },
  { id: "capmany-2024", name: "Capmany, Spain", lat: 42.3553, lng: 2.9483, date: "2024-01-01", color: "#f472b6", notes: "Trip with bebi and grandparents" },
  { id: "perpignan-2024", name: "Perpignan, France", lat: 42.6986, lng: 2.8956, date: "2024-01-01", color: "#a3e635", notes: "More with bebi and grandparents" },
  { id: "cefalu-2024", name: "Cefal\u00f9, Sicily", lat: 38.0388, lng: 14.0225, date: "2024-01-01", color: "#fb923c", notes: "Fun in the sun with grandparents" },
  { id: "barcelona-2024", name: "Barcelona, Spain", lat: 41.3874, lng: 2.1686, date: "2024-01-01", color: "#e879f9", notes: "Tapas and coffee" },
  { id: "quebec-city-2025", name: "Quebec City", lat: 46.8139, lng: -71.208, date: "2025-01-01", color: "#38bdf8", notes: "Avec bebi" },
  { id: "turks-and-caicos-2025", name: "Turks and Caicos", lat: 21.7734, lng: -72.2057, date: "2025-01-01", color: "#fbbf24", notes: "New Year's Eve with cousins" }
];

// ── State ───────────────────────────────────────────────
let places = [];
let globe;
let autoRotate = true;
let rotationSpeed = 0.3;
let selectedPlace = null;

// ── Load Data ───────────────────────────────────────────
async function loadPlaces() {
  try {
    const res = await fetch('data/places.json');
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.places;
  } catch (e) {
    console.warn('Could not fetch places.json, using fallback data.', e);
    return FALLBACK_PLACES;
  }
}

// ── Format Date ─────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ── Popup ───────────────────────────────────────────────
const popupCard = document.getElementById('popup-card');
const popupName = document.getElementById('popup-name');
const popupDate = document.getElementById('popup-date');
const popupNotes = document.getElementById('popup-notes');
const closeBtn = document.getElementById('popup-close');

function showPopup(place) {
  selectedPlace = place;
  popupCard.style.setProperty('--accent', place.color);
  popupName.textContent = place.name;
  popupName.style.color = place.color;
  popupDate.textContent = formatDate(place.date);
  popupNotes.textContent = place.notes;

  // Force reflow before adding class for animation
  popupCard.classList.remove('visible');
  void popupCard.offsetWidth;
  popupCard.classList.add('visible');
}

function hidePopup() {
  popupCard.classList.remove('visible');
  selectedPlace = null;
}

closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  hidePopup();
  resumeRotation();
});

// ── Rotation Control ────────────────────────────────────
function pauseRotation() {
  autoRotate = false;
}

function resumeRotation() {
  autoRotate = true;
}

// ── Build Globe ─────────────────────────────────────────
async function init() {
  places = await loadPlaces();

  const container = document.getElementById('globe-container');

  globe = Globe()(container)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#3a86ff')
    .atmosphereAltitude(0.2)
    // Points layer (pins)
    .pointsData(places)
    .pointLat('lat')
    .pointLng('lng')
    .pointColor('color')
    .pointAltitude(0.01)
    .pointRadius(0.45)
    .pointsMerge(false)
    .pointLabel(d => `<div class="globe-label">${d.name}</div>`)
    // Rings layer (pulsing)
    .ringsData(places)
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(d => [d.color])
    .ringMaxRadius(3)
    .ringPropagationSpeed(1.5)
    .ringRepeatPeriod(1400)
    // Click handler for points
    .onPointClick(handlePinClick)
    // Click handler for globe surface
    .onGlobeClick(handleGlobeClick);

  // Sizing
  handleResize();
  window.addEventListener('resize', handleResize);

  // Initial view — slight tilt
  globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

  // Auto-rotation loop
  requestAnimationFrame(animateRotation);

  // Pause rotation on user drag
  const controls = globe.controls();
  controls.addEventListener('start', pauseRotation);
  controls.addEventListener('end', () => {
    // Resume after a short delay so it doesn't fight the user
    if (!selectedPlace) {
      setTimeout(resumeRotation, 2000);
    }
  });
}

// ── Click Handlers ──────────────────────────────────────
function handlePinClick(place) {
  if (!place) return;
  pauseRotation();
  const currentAlt = globe.pointOfView().altitude;
  globe.pointOfView({ lat: place.lat, lng: place.lng, altitude: currentAlt }, 1000);
  setTimeout(() => showPopup(place), 400);
}

function handleGlobeClick() {
  if (selectedPlace) {
    hidePopup();
    setTimeout(resumeRotation, 600);
  }
}

// ── Auto-Rotation ───────────────────────────────────────
function animateRotation() {
  if (autoRotate && globe) {
    const pov = globe.pointOfView();
    globe.pointOfView({ lng: pov.lng + rotationSpeed * 0.1 });
  }
  requestAnimationFrame(animateRotation);
}

// ── Resize ──────────────────────────────────────────────
function handleResize() {
  if (globe) {
    globe.width(window.innerWidth);
    globe.height(window.innerHeight);
  }
}

// ── Start ───────────────────────────────────────────────
init();
