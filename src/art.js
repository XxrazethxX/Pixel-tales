// Original, hand-built pixel artwork. All coordinates are logical pixels.
import {
  WORLD,
  places,
  terrainAt,
  campRoles,
  campWorker,
  battleTerrain,
  battlefield,
  equippedItem,
} from "./game.js";
export const artPalette = {
  meadow: "#a3a775",
  grass: "#8c9867",
  light: "#bbc18a",
  earth: "#8c805b",
  outline: "#393b2b",
  water: "#709a98",
  bank: "#c1bb86",
  foliage: "#607b49",
  parchment: "#e2d3a9",
  ink: "#494633",
};
const characterImages = new Map();
const iconImages = new Map();
let landscape;
const pixel = (c, x, y, w, h, color) => {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), w, h);
};
function surface(w, h) {
  const image = document.createElement("canvas");
  image.width = w;
  image.height = h;
  return image;
}
function noise(x, y, seed = 0) {
  let n = Math.imul(x + seed * 97, 374761393) ^ Math.imul(y + 31, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n >>> 0) / 4294967295;
}
function steppedOval(c, x, y, w, h, color) {
  for (let row = 0; row < h; row++) {
    const inset = Math.round(
      ((1 - Math.sqrt(Math.max(0, 1 - (((row + 0.5) / h) * 2 - 1) ** 2))) * w) /
        2,
    );
    pixel(c, x + inset, y + row, w - inset * 2, 1, color);
  }
}
export function drawTree(c, x, y, variant = 0) {
  const pine = variant % 4 === 0;
  steppedOval(c, x - 11, y + 17, 30, 9, "#778453");
  pixel(c, x - 2, y + 1, 5, 21, "#625139");
  pixel(c, x - 1, y + 5, 2, 15, "#9c8452");
  if (pine) {
    for (let row = 0; row < 25; row++) {
      const width = 3 + Math.floor(row / 5) * 6;
      pixel(c, x - Math.floor(width / 2), y - 17 + row, width, 1, "#3e593f");
      pixel(
        c,
        x - Math.floor(width / 2) + 1,
        y - 17 + row,
        Math.ceil(width * 0.48),
        1,
        "#6a8050",
      );
    }
    pixel(c, x - 1, y - 16, 2, 7, "#869760");
  } else {
    steppedOval(c, x - 16, y - 12, 33, 28, "#405b3d");
    steppedOval(c, x - 16, y - 14, 29, 25, "#61794b");
    steppedOval(c, x - 13, y - 16, 24, 20, variant % 3 ? "#7a8e55" : "#899257");
    steppedOval(c, x - 10, y - 14, 10, 7, "#96a46a");
    pixel(c, x - 12, y, 5, 3, "#506b43");
    pixel(c, x + 6, y - 4, 5, 3, "#506b43");
    pixel(c, x - 3, y + 7, 8, 2, "#526b42");
    pixel(c, x - 5, y - 10, 3, 2, "#b0b87d");
  }
}
function rock(c, x, y, size = 1) {
  pixel(c, x - 6 * size, y - 3 * size, 13 * size, 7 * size, "#787963");
  pixel(c, x - 4 * size, y - 6 * size, 9 * size, 8 * size, "#a9a88a");
  pixel(c, x - 3 * size, y - 6 * size, 5 * size, 2 * size, "#cac5a1");
  pixel(c, x + 2 * size, y - 2 * size, 3 * size, 4 * size, "#8f9175");
}
function house(c, x, y, roof = "#8c6045", large = false) {
  const width = large ? 38 : 28;
  pixel(c, x - 2, y + 14, width + 9, 13, "#828455");
  pixel(c, x, y - 8, width, 29, "#655941");
  pixel(c, x + 1, y - 6, width - 2, 24, "#d0be8b");
  pixel(c, x + width - 8, y - 5, 6, 23, "#b2a276");
  pixel(c, x + 3, y - 5, 2, 23, "#7d6545");
  pixel(c, x + width - 7, y - 5, 2, 23, "#7d6545");
  pixel(c, x + 1, y + 6, width - 2, 2, "#937a52");
  pixel(c, x + width / 2 - 3, y + 7, 6, 11, "#554d39");
  pixel(c, x + width / 2 - 2, y + 8, 4, 9, "#78613f");
  pixel(c, x + width / 2 + 1, y + 13, 1, 1, "#dcbe72");
  pixel(c, x + 7, y, 4, 5, "#495346");
  pixel(c, x + 7, y, 3, 2, "#b8bb91");
  pixel(c, x + width - 12, y, 4, 5, "#495346");
  pixel(c, x - 3, y - 13, width + 6, 8, "#523f30");
  for (let row = 0; row < 12; row++) {
    const inset = Math.floor((11 - row) / 3);
    pixel(c, x - 3 + inset, y - 20 + row, width + 6 - inset * 2, 1, roof);
    if (row % 3 === 0)
      pixel(
        c,
        x - 3 + inset,
        y - 20 + row,
        width + 6 - inset * 2,
        1,
        "#ab7c52",
      );
  }
  for (let k = 0; k < width; k += 7)
    pixel(c, x + k, y - 16 + (k % 2) * 3, 1, 4, "#704c36");
  pixel(c, x + width - 8, y - 27, 5, 11, "#8d8a70");
  pixel(c, x + width - 8, y - 27, 6, 2, "#ccc2a0");
  pixel(c, x + width / 2 - 4, y + 19, 8, 2, "#d8cf9c");
}
function fence(c, x, y, width) {
  pixel(c, x, y + 2, width, 2, "#a89a69");
  pixel(c, x, y + 6, width, 2, "#7b7050");
  for (let i = 0; i < width; i += 8) {
    pixel(c, x + i, y, 2, 12, "#675d42");
    pixel(c, x + i, y, 2, 2, "#d1be83");
  }
}
function stall(c, x, y) {
  pixel(c, x, y, 2, 18, "#66543b");
  pixel(c, x + 24, y, 2, 18, "#66543b");
  pixel(c, x - 2, y - 5, 30, 7, "#69513b");
  for (let i = 0; i < 6; i++)
    pixel(c, x - 2 + i * 5, y - 4, 5, 6, i % 2 ? "#ba8458" : "#e1cf94");
  pixel(c, x - 1, y + 11, 29, 7, "#967749");
  pixel(c, x - 1, y + 10, 29, 2, "#c6aa6c");
  pixel(c, x + 3, y + 7, 5, 3, "#a5533c");
  pixel(c, x + 12, y + 8, 4, 2, "#d4bd64");
  pixel(c, x + 19, y + 6, 5, 4, "#6c7b4e");
}
export function drawLandmark(c, p, index = 0) {
  const x = p.x,
    y = p.y;
  if (p.type === "town") {
    steppedOval(c, x - 53, y - 32, 110, 83, "#8d9462");
    steppedOval(c, x - 49, y - 27, 98, 72, "#b5ae7a");
    for (let i = 0; i < 30; i++)
      pixel(
        c,
        x - 43 + ((i * 23) % 86),
        y - 19 + ((i * 17) % 61),
        2,
        1,
        "#c6bd88",
      );
    fence(c, x - 44, y - 30, 84);
    house(c, x - 35, y - 14, index === 6 ? "#8c5340" : "#8c6849");
    house(c, x + 3, y - 9, "#7b7760");
    house(c, x - 17, y + 26, "#986247", true);
    stall(c, x + 25, y + 17);
    pixel(c, x - 47, y + 10, 12, 7, "#777d64");
    pixel(c, x - 45, y + 8, 9, 7, "#b3b496");
    pixel(c, x - 44, y + 9, 6, 4, "#52665f");
    pixel(c, x - 48, y + 4, 2, 14, "#67553c");
    pixel(c, x - 35, y + 4, 2, 14, "#67553c");
    pixel(c, x - 48, y + 2, 15, 3, "#92784e");
    fence(c, x - 43, y + 43, 19);
    fence(c, x + 15, y + 43, 26);
    pixel(c, x + 41, y - 6, 2, 17, "#6f5d3d");
    pixel(c, x + 43, y - 6, 8, 6, "#b79552");
    pixel(c, x + 44, y - 5, 5, 1, "#e1cc8f");
  } else if (p.type === "ruin") {
    steppedOval(c, x - 25, y - 8, 56, 37, "#89906a");
    for (const dx of [-19, 15]) {
      pixel(c, x + dx, y - 24, 10, 40, "#717460");
      pixel(c, x + dx, y - 25, 7, 36, "#aaa990");
      for (let k = 0; k < 5; k++)
        pixel(c, x + dx, y - 21 + k * 7, 7, 1, "#858975");
      pixel(c, x + dx - 1, y - 26, 12, 3, "#c6c3a1");
    }
    pixel(c, x - 18, y - 21, 42, 7, "#858a74");
    pixel(c, x - 16, y - 24, 30, 5, "#b1b19a");
    pixel(c, x - 10, y - 4, 24, 19, "#566550");
    pixel(c, x - 12, y + 13, 29, 3, "#b0af8b");
    rock(c, x - 18, y + 19);
    rock(c, x + 24, y + 10);
    pixel(c, x - 17, y - 9, 5, 3, "#6c8150");
    pixel(c, x - 14, y - 7, 3, 13, "#6c8150");
  } else if (p.type === "mine") {
    for (let i = 3; i >= 0; i--)
      rock(c, x - 19 + i * 11, y - 6 - (i % 2) * 7, 2);
    pixel(c, x - 10, y - 10, 23, 26, "#3f4939");
    pixel(c, x - 14, y - 13, 5, 31, "#816846");
    pixel(c, x + 12, y - 13, 5, 31, "#816846");
    pixel(c, x - 15, y - 15, 33, 5, "#ab8e5b");
    pixel(c, x - 7, y + 12, 2, 18, "#797c66");
    pixel(c, x + 8, y + 12, 2, 18, "#797c66");
    for (let i = 0; i < 4; i++)
      pixel(c, x - 9, y + 14 + i * 5, 21, 2, "#978257");
  } else if (p.type === "cache") {
    pixel(c, x - 12, y - 4, 25, 15, "#594b35");
    pixel(c, x - 11, y - 5, 23, 12, "#9c7547");
    pixel(c, x - 11, y - 7, 23, 5, "#c1a06a");
    pixel(c, x - 8, y - 7, 2, 17, "#e0c48b");
    pixel(c, x + 7, y - 7, 2, 17, "#e0c48b");
    pixel(c, x - 1, y - 3, 4, 5, "#dbc176");
    rock(c, x + 19, y + 4);
  } else {
    drawTree(c, x - 17, y - 12, 2);
    drawTree(c, x + 15, y - 8, 1);
    drawTree(c, x + 1, y + 8, 3);
    pixel(c, x - 5, y + 19, 3, 2, "#ddc289");
    pixel(c, x + 11, y + 19, 3, 2, "#ddc289");
  }
}
export function worldArtwork() {
  if (landscape) return landscape;
  landscape = surface(WORLD.width, WORLD.height);
  const c = landscape.getContext("2d");
  pixel(c, 0, 0, WORLD.width, WORLD.height, artPalette.meadow);
  // Low contrast patches make open land readable without a conspicuous tile grid.
  for (let y = 0; y < WORLD.height; y += 8)
    for (let x = 0; x < WORLD.width; x += 8) {
      const highlands = terrainAt({ x, y }) === "highlands";
      const n = noise(Math.floor(x / 48), Math.floor(y / 48));
      pixel(
        c,
        x,
        y,
        8,
        8,
        highlands
          ? ["#a5a584", "#b0ad89", "#aaa985"][Math.floor(n * 2.99)]
          : ["#a3a775", "#9da370", "#a8ab79"][Math.floor(n * 2.99)],
      );
      if (noise(x, y) > 0.7) {
        pixel(c, x + 2, y + 5, 3, 1, highlands ? "#959779" : "#8c9867");
        pixel(c, x + 3, y + 3, 1, 3, highlands ? "#bdb897" : "#b7bb87");
      }
    }
  // Soft-edged woodland ground, with individual trees layered over it below.
  for (const forest of places.filter((p) => p.type === "forest")) {
    for (let y = forest.y - 82; y < forest.y + 82; y += 4)
      for (let x = forest.x - 92; x < forest.x + 92; x += 4) {
        const d = Math.hypot((x - forest.x) / 92, (y - forest.y) / 82);
        if (d < 0.88 + noise(x, y) * 0.22)
          pixel(c, x, y, 4, 4, noise(x, y, 2) > 0.7 ? "#96a16c" : "#899666");
      }
  }
  // Footpaths are scenery only: travel remains unrestricted.
  function path(points, width, color) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineJoin = "round";
    c.lineCap = "round";
    c.beginPath();
    points.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
    c.stroke();
  }
  const road = [
    { x: 0, y: 320 },
    places[0],
    { x: 310, y: 304 },
    { x: 443, y: 337 },
    { x: 493, y: 337 },
    places[3],
    { x: 780, y: 432 },
    { x: 946, y: 515 },
    places[6],
    { x: 1330, y: 628 },
    { x: 1536, y: 684 },
  ];
  path(road, 11, "#9c9568");
  path(road, 7, "#c6ba85");
  path(road, 2, "#d1c591");
  path([places[0], { x: 255, y: 223 }, places[1]], 5, "#bbb07d");
  path([places[3], { x: 606, y: 242 }, places[5]], 5, "#bbb07d");
  // Raster river follows the same curve as the game's shallow-water terrain.
  for (let y = 0; y < WORLD.height; y++) {
    const x = Math.round(475 + Math.sin(y / 65) * 38);
    pixel(c, x - 18, y, 36, 1, "#8c9c71");
    pixel(c, x - 15, y, 30, 1, artPalette.bank);
    pixel(c, x - 12, y, 25, 1, "#84aaa0");
    pixel(c, x - 9, y, 19, 1, artPalette.water);
    if (y % 17 === 0) pixel(c, x - 3, y, 7, 1, "#a4c0aa");
    if (y % 29 === 0) pixel(c, x + 5, y, 4, 1, "#c2d2b6");
  }
  // A small plank crossing at the western trade road.
  const bridgeX = Math.round(475 + Math.sin(337 / 65) * 38);
  pixel(c, bridgeX - 20, 330, 42, 14, "#695f43");
  for (let x = bridgeX - 19; x < bridgeX + 21; x += 4)
    pixel(c, x, 331, 3, 12, "#b4a477");
  pixel(c, bridgeX - 21, 329, 44, 2, "#d0bb86");
  pixel(c, bridgeX - 21, 343, 44, 2, "#776748");
  for (let i = 0; i < 320; i++) {
    const x = 14 + Math.floor(noise(i, 1) * (WORLD.width - 28));
    const y = 20 + Math.floor(noise(i, 2) * (WORLD.height - 40));
    if (
      Math.abs(x - (475 + Math.sin(y / 65) * 38)) < 28 ||
      places.some((p) => Math.hypot(p.x - x, p.y - y) < 66)
    )
      continue;
    if (terrainAt({ x, y }) === "highlands" || i % 6 === 0)
      rock(c, x, y, i % 7 === 0 ? 2 : 1);
    else if (i % 3 === 0) {
      pixel(c, x, y, 2, 3, "#7a8958");
      pixel(c, x - 1, y - 1, 4, 2, i % 2 ? "#dbc58e" : "#ac8e68");
    } else if (i % 2 === 0) drawTree(c, x, y, i);
  }
  const trees = [];
  for (const forest of places.filter((p) => p.type === "forest"))
    for (let i = 0; i < 24; i++) {
      const x = forest.x + Math.round((noise(i, 5, forest.x) - 0.5) * 210);
      const y = forest.y + Math.round((noise(i, 9, forest.y) - 0.5) * 175);
      if (places.every((p) => Math.hypot(p.x - x, p.y - y) > 49))
        trees.push({ x, y, i });
    }
  trees.sort((a, b) => a.y - b.y).forEach((p) => drawTree(c, p.x, p.y, p.i));
  return landscape;
}
function characterImage(role, coat, step, variant) {
  const key = `${role}:${coat}:${step}:${variant}`;
  if (characterImages.has(key)) return characterImages.get(key);
  const image = surface(26, 34),
    c = image.getContext("2d");
  const skin = ["#d9b486", "#bd946e", "#e2c396", "#c69f78"][variant % 4];
  const hair = ["#6b4c33", "#605c4b", "#927344", "#4b4635"][variant % 4];
  steppedOval(c, 4, 28, 20, 5, "#63724b88");
  pixel(c, 8, 23 + step, 4, 8 - step, "#3e4135");
  pixel(c, 15, 23 - step, 4, 8 + step, "#3e4135");
  pixel(c, 7, 29 + step, 6, 2, "#655440");
  pixel(c, 15, 29 - step, 6, 2, "#655440");
  pixel(c, 6, 13, 16, 12, "#3f4635");
  pixel(c, 7, 13, 14, 11, coat);
  pixel(c, 7, 14, 2, 7, "#d6cd9c77");
  pixel(c, 19, 15, 2, 9, "#36473755");
  pixel(c, 10, 15, 7, 8, coat);
  pixel(c, 9, 23, 10, 2, "#72563c");
  pixel(c, 13, 23, 2, 2, "#d6b574");
  pixel(c, 5, 15, 3, 6, coat);
  pixel(c, 20, 15, 3, 6, coat);
  pixel(c, 5, 21, 3, 3, skin);
  pixel(c, 20, 21, 3, 3, skin);
  pixel(c, 10, 4, 9, 10, "#4b4434");
  pixel(c, 10, 5, 8, 8, skin);
  pixel(c, 16, 8, 2, 5, "#b18a64");
  pixel(c, 11, 9, 1, 1, "#353b32");
  pixel(c, 16, 9, 1, 1, "#353b32");
  pixel(c, 13, 12, 3, 1, "#8d654d");
  pixel(c, 9, 3, 10, 4, hair);
  pixel(c, 9, 7, 2, 3, hair);
  if (role === "Swordswoman") {
    pixel(c, 9, 6, 1, 9, hair);
    pixel(c, 18, 6, 2, 10, hair);
    pixel(c, 23, 12, 2, 13, "#d0d0ad");
    pixel(c, 23, 12, 1, 11, "#f0e2bd");
    pixel(c, 21, 23, 6, 2, "#a99b68");
    pixel(c, 24, 25, 1, 4, "#755a3b");
  }
  if (role === "Shieldbearer") {
    pixel(c, 9, 3, 10, 4, "#83908a");
    pixel(c, 10, 2, 8, 2, "#b9bda1");
    pixel(c, 13, 2, 2, 6, "#d3cda6");
    pixel(c, 2, 15, 8, 12, "#474d3b");
    pixel(c, 3, 16, 6, 9, "#b2955d");
    pixel(c, 4, 17, 1, 7, "#d6b879");
    pixel(c, 3, 20, 6, 2, "#766b49");
    pixel(c, 5, 19, 2, 3, "#c9c8a5");
    pixel(c, 22, 12, 1, 12, "#c9c9a5");
  }
  if (role === "Archer") {
    pixel(c, 8, 3, 12, 4, "#596647");
    pixel(c, 9, 2, 9, 2, "#7c8554");
    for (let i = 0; i < 7; i++) pixel(c, 10 + i, 15 + i, 2, 2, "#b39461");
    pixel(c, 23, 12, 1, 3, "#c49f61");
    pixel(c, 24, 15, 1, 8, "#a6814f");
    pixel(c, 23, 23, 1, 3, "#c49f61");
    pixel(c, 22, 14, 1, 11, "#ded1a7");
    pixel(c, 4, 10, 3, 11, "#725e3e");
    pixel(c, 4, 8, 1, 5, "#dfd5b1");
    pixel(c, 6, 9, 1, 4, "#dfd5b1");
  }
  if (role === "Spearman") {
    pixel(c, 24, 3, 1, 28, "#856a43");
    pixel(c, 23, 2, 3, 5, "#c0c5ac");
    pixel(c, 24, 0, 1, 4, "#dfddbe");
    pixel(c, 10, 3, 9, 3, "#8e9481");
    pixel(c, 11, 2, 7, 2, "#b6b99c");
    pixel(c, 11, 12, 6, 2, "#a57850");
  }
  characterImages.set(key, image);
  return image;
}
export function drawCharacter(c, x, y, coat, step = 0, role = "", variant = 0) {
  c.imageSmoothingEnabled = false;
  c.drawImage(
    characterImage(role, coat, step > 0 ? 1 : step < 0 ? -1 : 0, variant),
    Math.round(x) - 13,
    Math.round(y) - 17,
  );
}
export const partyCoats = [
  "#ad8057",
  "#85948c",
  "#72825a",
  "#a69b71",
  "#968095",
  "#839480",
];
export function portraitArtwork(p) {
  const image = surface(48, 48),
    c = image.getContext("2d");
  pixel(c, 0, 0, 48, 48, "#a7ad83");
  pixel(c, 2, 2, 44, 44, "#757f5b");
  pixel(c, 4, 4, 40, 40, "#b6b38a");
  c.imageSmoothingEnabled = false;
  c.drawImage(
    characterImage(
      p.role,
      p.coat || partyCoats[p.id] || partyCoats[0],
      0,
      p.id,
    ),
    6,
    1,
    39,
    51,
  );
  image.className = "companion-portrait";
  image.setAttribute("aria-hidden", "true");
  return image;
}
export function drawWagon(c, x, y, hostile = false) {
  pixel(c, x - 21, y + 10, 43, 8, "#77835688");
  pixel(c, x - 18, y - 3, 35, 17, "#6c573c");
  pixel(c, x - 17, y - 2, 33, 13, "#ae8e59");
  for (let i = 0; i < 5; i++) pixel(c, x - 17, y + i * 3, 33, 1, "#896d47");
  steppedOval(c, x - 17, y - 18, 34, 26, hostile ? "#a67a5b" : "#d5c697");
  pixel(c, x - 17, y - 3, 34, 4, hostile ? "#88634c" : "#afa177");
  for (const dx of [-11, 9]) {
    pixel(c, x + dx - 3, y + 10, 7, 8, "#454538");
    pixel(c, x + dx - 1, y + 11, 3, 6, "#a39466");
    pixel(c, x + dx - 3, y + 13, 7, 2, "#9d8a5f");
    pixel(c, x + dx, y - 14, 1, 14, "#b7aa7e");
  }
  pixel(c, x + 17, y + 7, 12, 2, "#8b7850");
}
export function drawMapLabel(c, text, x, y, emphasis = false) {
  c.save();
  c.font = emphasis ? "bold 9px monospace" : "10px Georgia";
  c.textAlign = "center";
  c.textBaseline = "middle";
  const width = Math.ceil(c.measureText(text).width) + 12;
  pixel(c, x - width / 2 + 1, y - 6, width, 14, "#42473466");
  pixel(c, x - width / 2, y - 8, width, 14, emphasis ? "#574f37" : "#ded2a4");
  pixel(
    c,
    x - width / 2 + 1,
    y - 7,
    width - 2,
    1,
    emphasis ? "#b9a166" : "#f0e2b6",
  );
  c.fillStyle = emphasis ? "#f0d49b" : "#444731";
  c.fillText(text, Math.round(x), Math.round(y));
  c.restore();
}
const iconPatterns = {
  bow: [
    "......##........",
    ".....#..#.......",
    ".....#...#......",
    ".....#....#.....",
    ".....#....#.....",
    ".....#....#.....",
    ".....#...#......",
    ".....#..#.......",
    "......##........",
  ],
  spear: [
    "..........+.....",
    ".........+++....",
    "........++++....",
    "........+++.....",
    ".......##.......",
    "......##........",
    ".....##.........",
    "....##..........",
    "...##...........",
    "..##............",
  ],
  mace: [
    ".........###....",
    "........#+*+#...",
    "........#***#...",
    ".........###....",
    "........##......",
    ".......##.......",
    "......##........",
    ".....##.........",
    "....##..........",
    "...##...........",
  ],
  crown: [
    "................",
    "..#....#....#...",
    "..##..###..##...",
    "..###.###.###...",
    "...#########....",
    "...#########....",
    "....#######.....",
    "...#########....",
  ],
  food: [
    "......###.......",
    ".....#+++#......",
    "...##+++++##....",
    "..#++*++*+++#...",
    "..#+++++++++#...",
    "..#++*++++++#...",
    "...#########....",
  ],
  knowledge: [
    "..#####.#####...",
    "..#+++#.#+++#...",
    "..#+**#.#**+#...",
    "..#+++#.#+++#...",
    "..#+**#.#**+#...",
    "..#+++#.#+++#...",
    "..#####.#####...",
    ".......#........",
  ],
  sun: [
    ".......#........",
    "...#...#...#....",
    "....#+++++#.....",
    ".....+++++......",
    "..##+++++++##...",
    ".....+++++......",
    "....#+++++#.....",
    "...#...#...#....",
    ".......#........",
  ],
  sword: [
    "..........+.....",
    ".........++.....",
    "........++......",
    ".......++.......",
    "......++........",
    "..#..++.........",
    "...###..........",
    "....##..........",
    "...#..#.........",
    "..#.............",
  ],
  shield: [
    "....######......",
    "...#++++++#.....",
    "...#++**++#.....",
    "...#++**++#.....",
    "...#******#.....",
    "...#++**++#.....",
    "....#++++#......",
    ".....#++#.......",
    "......##........",
  ],
  market: [
    "....########....",
    "...#++**++**#...",
    "..#++**++**++#..",
    "...#........#...",
    "...#.+..*+..#...",
    "...##########...",
    "...#++++++++#...",
    "...##########...",
  ],
  tavern: [
    "....########....",
    "....#++++++###..",
    "....#++++++#..#.",
    "....#+**+++#..#.",
    "....#+**+++###..",
    "....#++++++#....",
    ".....######.....",
  ],
  contract: [
    "....########....",
    "....#++++++#....",
    "....#+****+#....",
    "....#++++++#....",
    "....#+****+#....",
    "....#++++++#....",
    "....#++**++#....",
    "....#++**++#....",
    "....########....",
  ],
  ore: [
    "......####......",
    "....##++++#.....",
    "...#++**+++#....",
    "..#++***++++#...",
    "..#+++++++++#...",
    "...#########....",
  ],
  wood: [
    "...########.....",
    "..#++++++++##...",
    "..#+***+++++##..",
    "..#++*++++++##..",
    "...##########...",
  ],
  herbs: [
    "...##.....##....",
    "...#*#...#*#....",
    "....#*#.#*#.....",
    ".....#*#*#......",
    "...###*#*###....",
    "..#***###***#...",
    "...###.#.###....",
    ".......#........",
  ],
  medicine: [
    "......####......",
    ".....######.....",
    ".....#++++#.....",
    "....#++++++#....",
    "....#++**++#....",
    "....#+****+#....",
    "....#++**++#....",
    "....#++++++#....",
    ".....######.....",
  ],
};
export function pixelIcon(kind, size = 24) {
  if (!iconImages.has(kind)) {
    const source = surface(16, 16),
      c = source.getContext("2d");
    const pattern = iconPatterns[kind] || iconPatterns.contract;
    const colors = { "#": "#675b3c", "+": "#c3a764", "*": "#e6d6a0" };
    const top = Math.floor((16 - pattern.length) / 2);
    pattern.forEach((row, y) =>
      [...row].forEach((v, x) => {
        if (colors[v]) pixel(c, x, y + top, 1, 1, colors[v]);
      }),
    );
    iconImages.set(kind, source);
  }
  const image = surface(16, 16);
  image.getContext("2d").drawImage(iconImages.get(kind), 0, 0);
  image.style.width = `${size}px`;
  image.style.height = `${size}px`;
  image.className = "pixel-icon";
  image.setAttribute("aria-hidden", "true");
  return image;
}
export function venueArtwork(venue) {
  const image = surface(288, 62),
    c = image.getContext("2d");
  pixel(c, 0, 0, 288, 62, "#b4b486");
  for (let x = 0; x < 288; x += 5)
    pixel(c, x, 36 + ((x * 7) % 23), 2, 1, "#9a9e70");
  pixel(c, 0, 47, 288, 8, "#c9bd90");
  drawTree(c, 36, 21, 2);
  drawTree(c, 260, 25, 0);
  house(c, 115, 28, venue === "Blacksmith" ? "#7c7560" : "#946747", true);
  if (venue === "Market") {
    stall(c, 171, 34);
    pixel(c, 177, 54, 8, 5, "#977b50");
  }
  if (venue === "Blacksmith") {
    pixel(c, 177, 39, 20, 6, "#686e60");
    pixel(c, 181, 45, 10, 8, "#4f594c");
    pixel(c, 103, 27, 3, 5, "#d9ab64");
  }
  if (venue === "Tavern") {
    pixel(c, 164, 19, 1, 17, "#70613f");
    pixel(c, 163, 22, 10, 8, "#b79a61");
    pixel(c, 168, 24, 2, 4, "#665537");
  }
  if (venue === "Training") {
    pixel(c, 174, 38, 26, 5, "#796342");
    pixel(c, 177, 43, 3, 10, "#796342");
    pixel(c, 194, 43, 3, 10, "#796342");
    pixel(c, 181, 32, 13, 6, "#e5d8af");
    pixel(c, 187, 32, 1, 6, "#a69773");
    drawCharacter(c, 214, 36, "#69734e", 0, "", 2);
  }
  if (venue === "Contracts") {
    pixel(c, 178, 23, 2, 28, "#796342");
    pixel(c, 193, 23, 2, 28, "#796342");
    pixel(c, 176, 23, 21, 19, "#836b44");
    pixel(c, 179, 26, 6, 10, "#e5d8af");
    pixel(c, 188, 26, 6, 7, "#d1c79b");
  }
  drawCharacter(c, 84, 36, "#a18b60", 0, "", 2);
  image.className = "venue-art";
  image.setAttribute("aria-hidden", "true");
  return image;
}
export function drawBattlefield(c, s) {
  const style = s ? battlefield(s).style : "meadow",
    colors = {
      forest: ["#79885d", "#a8aa7c", "#afb184"],
      ruin: ["#888770", "#a9a48a", "#b8b194"],
      quarry: ["#8b7f64", "#b1a17f", "#bdac88"],
      road: ["#8b8765", "#aea479", "#b8ad82"],
      river: ["#7d927d", "#9aa88c", "#acb398"],
      meadow: ["#879064", "#a8aa7c", "#afb184"],
    }[style];
  pixel(c, 0, 0, 768, 432, colors[0]);
  for (let i = 0; i < 360; i++) {
    const x = Math.floor(noise(i, 8) * 768),
      y = Math.floor(noise(i, 9) * 432);
    pixel(c, x, y, 3, 1, i % 2 ? "#9eaa79" : "#758356");
  }
  for (let y = 0; y < 7; y++)
    for (let x = 0; x < 9; x++) {
      pixel(
        c,
        105 + x * 62,
        y * 60,
        60,
        58,
        (x + y) % 2 ? colors[1] : colors[2],
      );
      pixel(c, 106 + x * 62, 1 + y * 60, 58, 1, "#bdbe8f");
      for (let k = 0; k < 5; k++)
        pixel(
          c,
          110 + x * 62 + ((k * 17) % 48),
          8 + y * 60 + ((k * 13) % 39),
          2,
          1,
          "#969e70",
        );
      pixel(c, 106 + x * 62, 57 + y * 60, 58, 1, "#899568");
    }
  if (s)
    for (const tile of battleTerrain(s)) {
      const x = 105 + tile.x * 62,
        y = tile.y * 60;
      if (tile.blocked) {
        if (tile.kind === "water") {
          pixel(c, x + 2, y + 2, 56, 53, "#708f8b");
          for (let i = 0; i < 4; i++)
            pixel(c, x + 8 + i * 9, y + 12 + i * 8, 16, 2, "#9eb3a1");
        } else if (tile.kind === "log") {
          pixel(c, x + 5, y + 20, 47, 14, "#635c42");
          pixel(c, x + 7, y + 23, 42, 3, "#9b8456");
          pixel(c, x + 4, y + 22, 7, 10, "#bd9d68");
        } else if (tile.kind === "wagon") {
          pixel(c, x + 5, y + 15, 48, 25, "#78664a");
          pixel(c, x + 8, y + 18, 42, 17, "#b4a078");
          pixel(c, x + 5, y + 37, 8, 7, "#48493b");
          pixel(c, x + 43, y + 37, 8, 7, "#48493b");
        } else {
          pixel(c, x + 7, y + 17, 42, 24, "#757767");
          pixel(c, x + 9, y + 15, 39, 6, "#b2b099");
          pixel(c, x + 26, y + 22, 2, 17, "#535d50");
        }
      } else if (tile.kind === "bridge") {
        pixel(c, x + 2, y + 4, 56, 46, "#7b7254");
        for (let i = 0; i < 6; i++) {
          pixel(c, x + 4, y + 7 + i * 7, 52, 5, "#c0ad79");
          pixel(c, x + 7, y + 8 + i * 7, 46, 1, "#d0bd8a");
        }
      } else if (tile.kind === "brush") {
        for (let i = 0; i < 4; i++)
          steppedOval(
            c,
            x + 5 + i * 11,
            y + 29 - (i % 2) * 4,
            17,
            15,
            "#7c8d5b",
          );
      } else if (tile.kind === "rubble") {
        for (let i = 0; i < 3; i++)
          rock(c, x + 15 + i * 13, y + 39 - (i % 2) * 4, i);
      } else {
        steppedOval(c, x + 8, y + 22, 42, 22, "#8d8161");
        pixel(c, x + 17, y + 34, 22, 3, "#a79870");
      }
      c.fillStyle = "#5b5c3e";
      c.font = "8px monospace";
      c.textAlign = "left";
      c.fillText(
        tile.blocked
          ? "BLOCKED"
          : tile.kind === "bridge"
            ? "CROSSING"
            : tile.cover
              ? "COVER 2"
              : "COST 2",
        x + 5,
        y + 54,
      );
    }
  drawTree(c, 41, 50, 0);
  drawTree(c, 65, 94, 2);
  drawTree(c, 36, 337, 1);
  rock(c, 745, 101, 2);
  rock(c, 731, 356, 2);
}

let fogImage, fogKey;
export function fogArtwork(charted) {
  const key = charted.join(",");
  if (key === fogKey) return fogImage;
  fogKey = key;
  fogImage = surface(WORLD.width, WORLD.height);
  const c = fogImage.getContext("2d"),
    known = new Set(charted),
    cols = Math.ceil(WORLD.width / 64);
  for (let row = 0; row < Math.ceil(WORLD.height / 64); row++)
    for (let col = 0; col < cols; col++) {
      if (known.has(row * cols + col)) continue;
      const neighbors = [];
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (
            col + dx >= 0 &&
            col + dx < cols &&
            row + dy >= 0 &&
            known.has((row + dy) * cols + col + dx)
          )
            neighbors.push({ x: (col + dx) * 64, y: (row + dy) * 64 });
        }
      if (!neighbors.length) {
        pixel(c, col * 64, row * 64, 64, 64, "#47583f9e");
        continue;
      }
      for (let y = 0; y < 64; y += 4)
        for (let x = 0; x < 64; x += 4) {
          const px = col * 64 + x + 2,
            py = row * 64 + y + 2;
          const distance = Math.min(
            ...neighbors.map((n) =>
              Math.hypot(
                Math.max(n.x - px, 0, px - n.x - 64),
                Math.max(n.y - py, 0, py - n.y - 64),
              ),
            ),
          );
          c.globalAlpha = Math.min(1, distance / 24) * 0.62;
          pixel(c, col * 64 + x, row * 64 + y, 4, 4, "#47583f");
        }
      c.globalAlpha = 1;
    }
  return fogImage;
}

export function drawWolf(c, x, y, step = 0) {
  x = Math.round(x);
  y = Math.round(y);
  steppedOval(c, x - 14, y + 10, 30, 6, "#58634877");
  pixel(c, x - 11, y - 3, 20, 12, "#494e40");
  pixel(c, x - 10, y - 5, 18, 12, "#939588");
  pixel(c, x - 9, y - 5, 16, 3, "#b5b5a0");
  pixel(c, x - 13, y - 6, 5, 4, "#838777");
  pixel(c, x - 16, y - 9, 4, 3, "#a7aa93");
  for (const dx of [-9, 3]) {
    pixel(c, x + dx, y + 5, 3, 8 + step, "#626957");
    pixel(c, x + dx + 4, y + 5, 3, 7 - step, "#929582");
    pixel(c, x + dx - 1, y + 12 + step, 4, 2, "#414e3e");
  }
  pixel(c, x + 6, y - 10, 9, 10, "#b0b09a");
  pixel(c, x + 7, y - 14, 3, 7, "#747b69");
  pixel(c, x + 12, y - 12, 3, 4, "#757b68");
  pixel(c, x + 12, y - 4, 8, 5, "#c5c2a9");
  pixel(c, x + 19, y - 4, 2, 3, "#384b3d");
  pixel(c, x + 13, y - 7, 1, 1, "#352f26");
  pixel(c, x + 10, y - 1, 3, 4, "#808773");
}
function lanternGlow(c, x, y, radius, strength = 0.2) {
  for (let i = 4; i >= 1; i--) {
    c.fillStyle = `rgba(238,185,90,${strength / 5})`;
    c.beginPath();
    c.arc(x, y, (radius * i) / 4, 0, Math.PI * 2);
    c.fill();
  }
}
export function drawLighting(c, s, width, height) {
  const hour = s.timeOfDay;
  const night =
    hour < 5 || hour >= 20
      ? 0.5
      : hour < 8
        ? ((8 - hour) / 3) * 0.5
        : hour >= 17
          ? ((hour - 17) / 3) * 0.5
          : 0;
  if (night <= 0) return;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = `rgba(21,34,57,${night})`;
  c.fillRect(0, 0, width, height);
  c.restore();
  if (s.battle) return;
  if (s.campOpen) {
    lanternGlow(c, 325, 250, 86, night * 0.8);
    return;
  }
  for (const [i, p] of places.entries()) {
    if (p.type !== "town" || !s.discovered.includes(i)) continue;
    lanternGlow(c, p.x + 5, p.y + 8, 42, night * 0.6);
    pixel(c, p.x - 28, p.y - 14, 3, 3, "#e4bb76");
    pixel(c, p.x + 10, p.y - 9, 3, 3, "#e4bb76");
  }
  lanternGlow(c, s.position.x, s.position.y, 24, night * 0.35);
}
let campGround;
export function drawCampScene(c, s) {
  if (!campGround) {
    campGround = surface(768, 432);
    const g = campGround.getContext("2d");
    pixel(g, 0, 0, 768, 432, "#8d9b6e");
    steppedOval(g, 126, 54, 446, 352, "#a5a579");
    steppedOval(g, 156, 82, 396, 288, "#b7b080");
    for (let i = 0; i < 600; i++) {
      const x = Math.floor(noise(i, 7) * 768),
        y = Math.floor(noise(i, 8) * 432);
      pixel(g, x, y, 2, 1, i % 2 ? "#c0bc8e" : "#8d9869");
    }
    const trees = [];
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(noise(i, 9) * 768),
        y = Math.floor(noise(i, 10) * 432);
      if (Math.hypot((x - 335) / 245, (y - 225) / 180) > 1.02)
        trees.push({ x, y, i });
    }
    trees.sort((a, b) => a.y - b.y).forEach((p) => drawTree(g, p.x, p.y, p.i));
    for (let i = 0; i < 8; i++) rock(g, 230 + i * 27, 353 + (i % 2) * 5);
  }
  c.imageSmoothingEnabled = false;
  c.drawImage(campGround, 0, 0);
  const tents = s.campUpgrades.tents || 0;
  function tent(x, y, color = "#b8b088", medical = false) {
    pixel(c, x - 5, y + 14, 54, 9, "#899065");
    for (let row = 0; row < 29; row++) {
      const half = Math.floor(row * 0.8);
      pixel(c, x + 20 - half, y - 16 + row, half * 2 + 1, 1, color);
      pixel(c, x + 20, y - 16 + row, Math.max(1, half), 1, "#938b65");
    }
    pixel(c, x + 16, y + 1, 10, 15, "#5b5f44");
    pixel(c, x + 20, y - 17, 2, 33, "#807449");
    pixel(c, x - 4, y + 13, 3, 7, "#75663f");
    pixel(c, x + 44, y + 13, 3, 7, "#75663f");
    if (medical) {
      pixel(c, x + 10, y - 4, 12, 3, "#a3644d");
      pixel(c, x + 14, y - 8, 4, 11, "#a3644d");
    }
  }
  if (tents) {
    tent(172, 123);
    tent(222, 151, "#b3a678");
    if (tents > 1) {
      tent(170, 173, "#a9936a");
      tent(223, 111, "#b4ac82");
    }
  } else
    for (let i = 0; i < 4; i++) {
      pixel(
        c,
        171 + (i % 2) * 31,
        118 + Math.floor(i / 2) * 32,
        20,
        26,
        "#7b815c",
      );
      pixel(
        c,
        173 + (i % 2) * 31,
        121 + Math.floor(i / 2) * 32,
        16,
        20,
        "#b4a578",
      );
      pixel(
        c,
        173 + (i % 2) * 31,
        120 + Math.floor(i / 2) * 32,
        16,
        5,
        "#dbcc98",
      );
    }
  drawMapLabel(c, tents ? `Sleeping tents · ${tents}/2` : "Bedrolls", 205, 94);
  // Supplies and a portable cart are present before the first upgrade.
  drawWagon(c, 393, 329);
  for (let i = 0; i < 3; i++) {
    pixel(c, 187 + i * 19, 275, 16, 13, "#917348");
    pixel(c, 188 + i * 19, 276, 14, 3, "#b79a60");
    pixel(c, 190 + i * 19, 276, 2, 12, "#6c6240");
  }
  drawMapLabel(c, "Company stores", 213, 300);
  if (s.campUpgrades.forge) {
    pixel(c, 435, 276, 45, 18, "#8a8b6c");
    pixel(c, 441, 277, 33, 10, "#515b47");
    pixel(c, 449, 282, 12, 4, "#d28d50");
    pixel(c, 453, 296, 6, 14, "#655c3f");
    pixel(c, 443, 293, 27, 5, "#747b68");
    pixel(c, 443, 292, 27, 2, "#b3b79c");
    drawMapLabel(c, "Portable forge", 459, 325);
  }
  if (s.campUpgrades.watchpost) {
    fence(c, 460, 118, 39);
    pixel(c, 470, 88, 3, 32, "#796846");
    pixel(c, 473, 89, 15, 10, "#b7a16e");
    pixel(c, 475, 91, 10, 2, "#d7c58b");

    drawMapLabel(c, "Watch post", 478, 153);
  }
  if (s.campUpgrades.infirmary) {
    tent(463, 213, "#d3cab0", true);
    drawMapLabel(c, "Medicine tent", 484, 247);
  }
  steppedOval(c, 309, 240, 32, 16, "#747b5b");
  for (let i = 0; i < 6; i++) rock(c, 314 + i * 4, 248 + (i % 2) * 7);
  pixel(c, 313, 250, 23, 4, "#705739");
  pixel(c, 321, 239, 5, 18, "#805e3c");
  if (s.campUpgrades.cookpot) {
    pixel(c, 313, 224, 2, 22, "#514e39");
    pixel(c, 335, 224, 2, 22, "#514e39");
    pixel(c, 313, 224, 24, 2, "#716a4f");
    pixel(c, 324, 226, 1, 8, "#55563c");
    steppedOval(c, 318, 232, 15, 10, "#535b4e");
    pixel(c, 319, 233, 12, 2, "#9b9f82");
  }
  const stations = {
    cook: { x: 344, y: 244 },
    smith: { x: 428, y: 290 },
    medic: { x: 463, y: 229 },
    guard: { x: 460, y: 111 },
  };
  s.party
    .filter((p) => !p.dead)
    .forEach((p, i) => {
      const duty = campRoles.find(
        (role) => campWorker(s, role.id)?.id === p.id,
      );
      const point = duty
        ? stations[duty.id]
        : { x: 286 + (i % 3) * 32, y: 280 + Math.floor(i / 3) * 30 };
      drawCharacter(
        c,
        point.x,
        point.y,
        p.coat || partyCoats[p.id],
        0,
        p.role,
        p.id,
      );
      drawLoadout(c, s, p, point.x, point.y);
      if (duty)
        drawMapLabel(
          c,
          p.name,
          point.x - (duty.id === "medic" ? 40 : 0),
          point.y + 20,
        );
    });
  drawLighting(c, s, c.canvas.width, c.canvas.height);
  // The campfire remains bright after the night overlay.
  pixel(c, 319, 240, 11, 13, "#c8773d");
  pixel(c, 322, 236, 6, 15, "#e5aa54");
  pixel(c, 324, 241, 3, 10, "#f1d389");
}

export function drawLoadout(c, s, p, x, y) {
  if (equippedItem(s, p, "helmet")) {
    pixel(c, x - 4, y - 15, 9, 5, "#87918b");
    pixel(c, x - 5, y - 11, 11, 2, "#bdc0a0");
  }
  if (equippedItem(s, p, "shield")) {
    pixel(c, x - 12, y + 1, 8, 11, "#565e50");
    pixel(c, x - 11, y + 2, 6, 8, "#ac9971");
    pixel(c, x - 9, y + 5, 2, 2, "#c9c5a3");
  }
  if (equippedItem(s, p, "weapon")?.twoHanded) {
    pixel(c, x + 10, y - 14, 2, 24, "#c5c9ac");
    pixel(c, x + 7, y + 4, 8, 2, "#7b6844");
  }
}
