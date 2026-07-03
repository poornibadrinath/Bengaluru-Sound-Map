mapboxgl.accessToken =
  "pk.eyJ1IjoicG9vcm5pLWJhZHJpbmF0aCIsImEiOiJjbXI0eWp2YmkwZXNhMzlzanl0Mno0N2F5In0.aiVbq7DU4mJuNLsxexX9iQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/poorni-badrinath/cmpsobtqk002p01qzdx1k46cj",
  center: [77.5946, 12.9716],
  zoom: 11
});

const safeThoughts = ["downcase", ["to-string", ["get", "thoughts"]]];
const safeSense = ["downcase", ["to-string", ["get", "sense"]]];

const moodAudio = {
  calm: "audio/calm.m4a",
  alive: "audio/alive.m4a",
  vibrant: "audio/vibrant.m4a",
  chaotic: "audio/chaotic.m4a",
  frantic: "audio/frantic.m4a"
};

let currentAudio = null;

function playThoughtSound(thought) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const src = moodAudio[thought];
  if (!src) return;

  currentAudio = new Audio(src);
  currentAudio.volume = 0.65;
  currentAudio.loop = false;

  currentAudio.play().catch((err) => {
    console.log("Audio playback blocked or failed:", err);
  });
}

map.on("load", () => {
  map.addSource("bangalore-senses", {
    type: "vector",
    url: "mapbox://poorni-badrinath.cmpssyw8v028s1nogyngeuznx-4276j"
  });

  map.addLayer({
    id: "score-heat",
    type: "heatmap",
    source: "bangalore-senses",
    "source-layer": "bengalurusenses",
    maxzoom: 15,
    slot: "top",
    paint: {
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["to-number", ["get", "score"], 20],
        20, 0.1,
        40, 0.35,
        60, 0.6,
        80, 0.85,
        92, 1
      ],

      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        9, 1,
        12, 2.5,
        15, 4
      ],

      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        9, 35,
        11, 70,
        13, 130,
        15, 220
      ],

      "heatmap-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 0.7,
        12, 0.6,
        14, 0.45,
        16, 0.3
      ],

      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(0,0,0,0)",
        0.15, "#ff0000",
        0.3, "#ff6600",
        0.45, "#ffff00",
        0.6, "#7fff00",
        0.75, "#00ff99",
        0.9, "#00d4ff",
        1, "#ff00ff"
      ]
    }
  });

  map.addLayer({
    id: "place-halo",
    type: "circle",
    source: "bangalore-senses",
    "source-layer": "bengalurusenses",
    minzoom: 10,
    slot: "top",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 8,
        12, 16,
        14, 32,
        16, 64
      ],

      "circle-color": [
        "match",
        safeThoughts,
        "calm", "#3fa7d6",
        "vibrant", "#d30c7b",
        "alive", "#00916e",
        "chaotic", "#f17641",
        "frantic", "#fa003f",
        "#ffffff"
      ],

      "circle-opacity": 0.25,
      "circle-blur": 1
    }
  });

  map.addLayer({
    id: "place",
    type: "circle",
    source: "bangalore-senses",
    "source-layer": "bengalurusenses",
    minzoom: 10,
    slot: "top",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],

        10,
        [
          "match",
          safeSense,
          "blast", 3,
          "layered", 2.5,
          "bleh", 2,
          2.5
        ],

        11,
        [
          "match",
          safeSense,
          "blast", 4,
          "layered", 3,
          "bleh", 2.5,
          3
        ],

        13,
        [
          "match",
          safeSense,
          "blast", 8,
          "layered", 6,
          "bleh", 4,
          5
        ],

        16,
        [
          "match",
          safeSense,
          "blast", 24,
          "layered", 18,
          "bleh", 10,
          14
        ]
      ],

      "circle-color": [
        "match",
        safeThoughts,
        "calm", "#3fa7d6",
        "vibrant", "#d30c7b",
        "alive", "#00916e",
        "chaotic", "#f17641",
        "frantic", "#fa003f",
        "#ffffff"
      ],

      "circle-emissive-strength": 2,
      "circle-opacity": 1,
      "circle-blur": 0,

      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-opacity": 0.85
    }
  });

  map.on("click", "place", (e) => {
    if (!e.features || !e.features.length) return;

    const p = e.features[0].properties;

    const thought = String(p.thoughts || "default").toLowerCase();
    const sense = String(p.sense || "layered").toLowerCase();

    playThoughtSound(thought);

    new mapboxgl.Popup({
      closeButton: false,
      offset: 16,
      className: `popup-${thought} popup-${sense}`
    })
      .setLngLat(e.lngLat)
      .setHTML(`
        <div class="popup-name">${p.name}</div>
        <div class="popup-score">score ${p.score}</div>
      `)
      .addTo(map);
  });

  map.on("mouseenter", "place", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "place", () => {
    map.getCanvas().style.cursor = "";
  });
});
