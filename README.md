# Pixel Tales

An original mercenary-company RPG prototype: compact pixel visuals, resource-driven travel, contracts, tactical battles, knowledge research, and character training. Inspired by the genre and the requested references; no borrowed game assets.

Requires Python 3 and Node.js 18+ for tests. No package installation required.

```sh
npm start
npm test
```

Open the server on port 3000. Accept a contract in town, click its destination, and engage raiders. Select a companion and click a tile to move (up to two Manhattan steps) or an enemy to attack. A character gets one action each round. Swords and shields reach one tile, spears two, bows four. End the round for enemy actions. Camp to heal; forage or purchase supplies to keep travelling. Spend battle knowledge on research and level-up points on strength. Progress saves in browser local storage.

This is a first playable slice, not a complete Wartales-scale game. Recruitment, inventories, armor, professions, crafting, skill trees, terrain obstacles, diplomacy, permadeath, procedural encounters, and a dedicated Android build are future work. Morale is tracked but has no combat modifier yet. Fallen companions recover through camping; defeat rescues the company at a cost. No backend, accounts, or secrets are required.
