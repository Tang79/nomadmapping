/* Nomad Mapping - Leaflet Map Engine */

document.addEventListener('DOMContentLoaded', () => {
  initHeroMap();
  initDemoLabMap();
});

let heroMap, demoMap;
let heroTileLayer, demoTileLayer;
let tracksGroup, heatGroup;
let demoContourGroup;

// Tile Layer URLs
const tiles = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
};

const tileAttribution = {
  dark: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
  topo: 'Map data &copy; OpenStreetMap, SRTM | Map style &copy; OpenTopoMap'
};

/* --- 1. HERO MAP INITIALIZATION --- */
function initHeroMap() {
  const heroContainer = document.getElementById('hero-map');
  if (!heroContainer) return;

  // Center around Hood River / Columbia River Gorge
  heroMap = L.map('hero-map', {
    center: [45.71, -121.51],
    zoom: 11,
    zoomControl: false,
    attributionControl: false
  });

  // Base Tile Layer
  heroTileLayer = L.tileLayer(tiles.dark, {
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(heroMap);

  // Layer Groups
  tracksGroup = L.layerGroup().addTo(heroMap);
  heatGroup = L.layerGroup().addTo(heroMap);

  // Add Sample Race Tracks Polylines
  const trackCoords = [
    [45.710, -121.510],
    [45.720, -121.530],
    [45.740, -121.520],
    [45.750, -121.490],
    [45.735, -121.470],
    [45.710, -121.510]
  ];

  const raceTrack = L.polyline(trackCoords, {
    color: '#FF5A1F',
    weight: 4,
    opacity: 0.9,
    dashArray: '8, 8'
  });
  
  tracksGroup.addLayer(raceTrack);

  // Add Sample Spatial Data Markers
  const samplePoints = [
    { lat: 45.712, lng: -121.512, title: "Hood River Headquarters", type: "Main Office & Cartography Studio" },
    { lat: 45.742, lng: -121.522, title: "Master Gardener Project Site", type: "Precision Agriculture Layout" },
    { lat: 45.725, lng: -121.485, title: "Columbia Gorge Survey Point", type: "Terrain Elevation Audit" }
  ];

  samplePoints.forEach(pt => {
    const icon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#FF5A1F; width:16px; height:16px; border-radius:50%; border:3px solid #0A2540; box-shadow:0 0 10px #FF5A1F;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = L.marker([pt.lat, pt.lng], { icon: icon });
    marker.bindPopup(`
      <div style="font-family:'Inter',sans-serif; padding:4px;">
        <h4 style="margin:0 0 4px 0; color:#0A2540; font-family:'Roboto',sans-serif;">${pt.title}</h4>
        <p style="margin:0; font-size:0.85rem; color:#475569;">${pt.type}</p>
      </div>
    `);
    tracksGroup.addLayer(marker);
  });

  // Sample Heat Circle
  const heatCircle = L.circle([45.73, -121.50], {
    color: '#FF5A1F',
    fillColor: '#FF5A1F',
    fillOpacity: 0.2,
    radius: 2500
  });
  heatGroup.addLayer(heatCircle);

  // Hero Base Layer Controls
  const layerBtns = document.querySelectorAll('.widget-layer-btn[data-basemap]');
  layerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      layerBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const style = e.target.getAttribute('data-basemap');
      heroMap.removeLayer(heroTileLayer);
      heroTileLayer = L.tileLayer(tiles[style], { maxZoom: 18 }).addTo(heroMap);
    });
  });

  // Hero Toggle Buttons
  const toggleTracksBtn = document.getElementById('toggle-tracks-btn');
  if (toggleTracksBtn) {
    toggleTracksBtn.addEventListener('click', function() {
      if (heroMap.hasLayer(tracksGroup)) {
        heroMap.removeLayer(tracksGroup);
        this.classList.remove('active');
      } else {
        heroMap.addLayer(tracksGroup);
        this.classList.add('active');
      }
    });
  }

  const toggleHeatBtn = document.getElementById('toggle-heat-btn');
  if (toggleHeatBtn) {
    toggleHeatBtn.addEventListener('click', function() {
      if (heroMap.hasLayer(heatGroup)) {
        heroMap.removeLayer(heatGroup);
        this.classList.remove('active');
      } else {
        heroMap.addLayer(heatGroup);
        this.classList.add('active');
      }
    });
  }
}

/* --- 2. INTERACTIVE DEMO LAB MAP INITIALIZATION --- */
function initDemoLabMap() {
  const demoContainer = document.getElementById('demo-lab-map');
  if (!demoContainer) return;

  demoMap = L.map('demo-lab-map', {
    center: [45.71, -121.51],
    zoom: 12
  });

  demoTileLayer = L.tileLayer(tiles.dark, {
    maxZoom: 18,
    attribution: '&copy; CARTO'
  }).addTo(demoMap);

  demoContourGroup = L.layerGroup().addTo(demoMap);
  renderDemoContours(1250, 0.8);

  // Map Click Listener to Update Spatial Query Inspector
  demoMap.on('click', (e) => {
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);

    const coordsEl = document.getElementById('query-coords');
    const statusEl = document.getElementById('query-status');

    if (coordsEl) coordsEl.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Center Coords: ${lat}° N, ${lng}° W`;
    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--accent-orange)"></i> Spatial Query Executed: Point inside Hood River Basin GIS Index.`;

    L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <div style="font-family:'Inter',sans-serif; color:#0A2540;">
          <strong>Point Inspection</strong><br>
          Lat: ${lat}, Lng: ${lng}<br>
          <span style="font-size:0.8rem; color:#FF5A1F;">PostGIS Query Response: OK</span>
        </div>
      `)
      .openOn(demoMap);
  });

  // Slider Listeners
  const opacityRange = document.getElementById('opacity-range');
  const opacityVal = document.getElementById('opacity-val');
  const elevationRange = document.getElementById('elevation-range');
  const elevationVal = document.getElementById('elevation-val');

  if (opacityRange) {
    opacityRange.addEventListener('input', (e) => {
      const opacity = e.target.value / 100;
      if (opacityVal) opacityVal.textContent = `${e.target.value}%`;
      const elev = elevationRange ? elevationRange.value : 1250;
      renderDemoContours(elev, opacity);
    });
  }

  if (elevationRange) {
    elevationRange.addEventListener('input', (e) => {
      const elev = e.target.value;
      if (elevationVal) elevationVal.textContent = `${elev} m`;
      const opacity = opacityRange ? opacityRange.value / 100 : 0.8;
      renderDemoContours(elev, opacity);
    });
  }

  // Reset Demo Button
  const resetBtn = document.getElementById('reset-demo-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (opacityRange) opacityRange.value = 80;
      if (opacityVal) opacityVal.textContent = '80%';
      if (elevationRange) elevationRange.value = 1250;
      if (elevationVal) elevationVal.textContent = '1,250 m';
      renderDemoContours(1250, 0.8);
      demoMap.setView([45.71, -121.51], 12);
    });
  }

  // Demo Tab Switching
  const demoTabs = document.querySelectorAll('.demo-tab-btn');
  demoTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      demoTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const tabName = e.target.getAttribute('data-tab');
      
      if (tabName === 'ndvi') {
        renderDemoNDVI();
      } else if (tabName === 'elevation') {
        renderDemoContours(1500, 0.85);
      } else {
        renderDemoSuitability();
      }
    });
  });
}

function renderDemoContours(elevation, opacity) {
  if (!demoContourGroup) return;
  demoContourGroup.clearLayers();

  // Draw Dynamic Contour Circles representing elevation levels
  const radius = Math.max(500, elevation * 1.5);
  
  const circle1 = L.circle([45.71, -121.51], {
    color: '#FF5A1F',
    fillColor: '#FF5A1F',
    fillOpacity: opacity * 0.3,
    radius: radius,
    weight: 2
  });

  const circle2 = L.circle([45.72, -121.49], {
    color: '#10B981',
    fillColor: '#10B981',
    fillOpacity: opacity * 0.25,
    radius: radius * 0.7,
    weight: 2
  });

  demoContourGroup.addLayer(circle1);
  demoContourGroup.addLayer(circle2);
}

function renderDemoNDVI() {
  if (!demoContourGroup) return;
  demoContourGroup.clearLayers();

  const ndviPolygon = L.polygon([
    [45.70, -121.53],
    [45.73, -121.54],
    [45.74, -121.49],
    [45.71, -121.47]
  ], {
    color: '#10B981',
    fillColor: '#10B981',
    fillOpacity: 0.45,
    weight: 2
  });

  ndviPolygon.bindTooltip("NDVI Healthy Vegetation Index: 0.78 (High Yield Crop Canopy)", { permanent: false });
  demoContourGroup.addLayer(ndviPolygon);
}

function renderDemoSuitability() {
  if (!demoContourGroup) return;
  demoContourGroup.clearLayers();

  const sitePoly = L.polygon([
    [45.715, -121.52],
    [45.725, -121.52],
    [45.725, -121.50],
    [45.715, -121.50]
  ], {
    color: '#FF5A1F',
    fillColor: '#FF5A1F',
    fillOpacity: 0.4,
    weight: 2,
    dashArray: '6, 6'
  });

  sitePoly.bindTooltip("Site Suitability Score: 94/100 (Optimal Zoning & Slope)", { permanent: true });
  demoContourGroup.addLayer(sitePoly);
}
