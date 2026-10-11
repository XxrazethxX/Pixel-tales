# Pixel Tales — The Ashen Company

An original, playable mercenary-company RPG with compact pixel visuals, tactical combat, company survival, research, professions, crafting, and character progression. No borrowed game assets. This is an early browser prototype; it is not yet a native Android app or a complete Wartales-scale game.

## Play

**No installation:** Download the repository ZIP from GitHub's Code menu, extract it completely, and open `index.html` in a JavaScript-enabled browser. Keep `index.html`, `style.css`, and `game.bundle.js` together. The included classic JavaScript bundle works without ES-module imports or remote fonts.

**Development server:** Requires Node.js 18+ and Python 3; no dependencies or secrets.

```sh
npm start
```

Open the server on port 3000. If that port is already in use, reuse the existing server or run `python3 -m http.server 3001` after `npm run build`.

**GitHub Pages:** The included workflow tests, builds, and deploys the game when pushed to `main`. The repository owner must enable **Settings → Pages → Build and deployment → Source: GitHub Actions**. Then rerun **Actions → Test and deploy game** if necessary. The Actions deployment reports the actual playable URL. Viewing `index.html` on github.com shows its source, not the game.

## Free exploration

The map fills the game screen. **Click or tap any ground** to set your own destination; the party walks there with animated companions following the route you actually took. Click again to redirect, use **Stop walking** to halt, or hold **WASD / arrow keys** to steer. There are no preset travel paths or destination buttons. The camera follows the company on narrow screens, keeping sprite proportions intact.

Towns and other sites offer actions only when you are within 28 world pixels. Management menus are overlays opened from the bottom toolbar; opening one pauses walking. Close the panel to return to exploration. You can forage and camp anywhere. Each 160 world pixels walked costs a day and four rations (three with Trailcraft); partial distance carries between destinations. Shallows slow travel. Encounters pause the party for your decision. Saves retain your exact position and distance, and reload safely stopped.

## The living borderlands

The world is now **1536 × 864**: four times the original area, with twelve locations. Emberfall, Whispering Grove, Sunken Chapel, Redstone Quarry, Forgotten Stash, and Broken Crown extend the frontier. Greyhaven and Saltbridge are known initially; other places are discovered within 140 pixels, awarding one knowledge each. Terrain is permanently charted as you walk. Contract destinations remain marked even before discovery.

The small **world navigator** in the top right shows your charted terrain, known landmarks, current viewport, and destination. Click any point there to start a long journey; supplies and encounters still apply. It selects a coordinate, not a predetermined path.

A caravan and two bandit patrols roam independently while exploration is active. They pause during menus, battles, and encounters. Within 48 pixels, buy provisions from the caravan or confront a bandit group. Combat is optional: steer away if the company is unprepared. Patrol victories award 40 crowns, knowledge, salvage, and XP without completing or clearing your contract. Defeated patrols stay defeated after reload.

Research **Watchful eyes** for a 210-pixel discovery radius, **A fair bargain** for cheaper purchases, and **Borderlands charts** (requires Watchful eyes) to reveal landmark locations without exploring their terrain. Hidden stashes offer one-time crowns and medicine. Road events now include wounded travellers, abandoned camps, and storms with different choices and costs.

## Company development and tactical abilities

Every class starts with an active ability. Select a companion, press its ability button, then click an outlined enemy. Press **Basic attack** to cancel aiming. Abilities use the companion's action and shared **valor**, and have a two-round cooldown: use in round one, unavailable in round two, available again in round three. Valor starts at three, caps at five, regenerates one per completed round, and gains one from bracing or an enemy kill.

| Class        | Ability     | Cost    | Effect                                                |
| ------------ | ----------- | ------- | ----------------------------------------------------- |
| Swordswoman  | Cleave      | 2 valor | +2 damage; hits the target and enemies adjacent to it |
| Shieldbearer | Shield bash | 1 valor | +1 damage; stuns the target for its next turn         |
| Archer       | Aimed shot  | 2 valor | +4 damage; reaches five tiles                         |
| Spearman     | Lunge       | 1 valor | +2 damage; reaches three tiles                        |

At level two, spend one training point in **Company → Class abilities & specialization** to choose a permanent branch. This competes with strength and vitality training.

| Class        | Branch one                               | Branch two                                          |
| ------------ | ---------------------------------------- | --------------------------------------------------- |
| Swordswoman  | Duelist: +2 attack                       | Reaver: cleave causes two turns of bleeding         |
| Shieldbearer | Bulwark: bracing shields adjacent allies | Stalwart: shield bash stuns for two turns           |
| Archer       | Marksman: +1 basic and skill range       | Trapper: aimed shots prevent movement for two turns |
| Spearman     | Skirmisher: move three tiles             | Bloodletter: lunge causes two turns of bleeding     |

Bleeding deals two damage per enemy turn, ignoring armor. Rooted enemies can still attack if in range. Enemy archers shoot from four tiles and retreat from adjacent companions; brutes deal more damage and have armor. Hover over an enemy to inspect health, armor, range, and status.

Each profession ranks up at **3, 8, and 15 practice**: Apprentice, Journeyman, and Master. The best conscious worker supplies the company bonus. Switch professions with the Company dropdown; experience in each profession is retained independently.

| Profession | Practice sources                                                  | Rank benefits                                                                                              |
| ---------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Smith      | Crafting weapons and armor                                        | Reduce ore costs by one per rank, minimum one                                                              |
| Miner      | Exploring and working mines                                       | +2 ore per rank when exploring or working                                                                  |
| Herbalist  | Exploring forests, fieldwork, foraging, making and using medicine | Better herb yields, +3 medicine healing and +2 camp healing per rank; two medicine per craft at Journeyman |
| Cook       | Camping and cooking provisions                                    | Lower camp food costs (minimum two), better camp morale, +2 crafted rations per rank                       |

Near a mine or forest, **Work mine / Gather herbs** is repeatable: it costs two rations and a day and awards two practice to the worker. Exploring remains a one-time reward. Crafting medicine requires a conscious Herbalist; cooking requires a Cook; weapon and armor work requires a Smith.

## Your first expedition

1. Open **Contracts** in Greyhaven and accept _Wolves in human clothing_.
2. Close the panel and click toward **Pinewatch** on the map. You can take any route and stop anywhere along the way.
3. **Explore** to collect knowledge, ore, wood, and herbs, then **Engage raiders**.
4. Select a companion using their button or sprite. Outlined green tiles are movement options; outlined red enemies are attack targets. Each companion can move up to two Manhattan tiles **and** attack once per round. Bows reach four tiles, spears two, other weapons one. **Brace** trades your attack for damage reduction. End the round for enemy actions.
5. Victory awards crowns, knowledge, salvage, and XP. Train leveled companions in **Company**, unlock permanent upgrades in **Research**, and equip crafted weapons and armor in **Workshop**.
6. Return to town for the **Town** market and recruit up to six companions. Buy medicine, heal injured allies, or camp to restore health and morale. Camp costs up to four rations (less with a skilled Cook) and two crowns per companion.
7. Walk to Iron Hollow and the Watchtower, take additional contracts, and respond to roadside choices. Delivery contracts offer a noncombat source of income and knowledge.

Morale at 85+ grants +1 attack. Injuries impose −1 attack. Armor absorbs damage. Profession practice now unlocks ranks and company bonuses. Explorable sites have one-time rewards. Contracts are repeatable. Defeat rescues the company in Greyhaven at a cost; there is no permadeath yet.

Progress automatically saves in browser local storage. **New company** asks before replacing it. Version-one through version-four saves migrate; invalid saves fall back to a fresh company. Browser storage is specific to your browser and origin; moving from a local file to a hosted site does not transfer progress.

## Validate and develop

```sh
npm test
npm run build
```

Edit `src/game.js` (rules) and `src/app.js` (UI), then rebuild. Commit the generated `game.bundle.js` so downloaded copies run immediately. The build uses only Node's standard library.

A browser-driven smoke test also exercises combat victory, research, crafting, recruitment, delivery, reload persistence, a 390px mobile layout, caravan trading, navigator travel, discovery beyond the original map, aimed shots, specializations, profession reassignment, and fieldwork. With a running server and Playwright Core installed in a temporary directory:

```sh
npm install --prefix /tmp/pixel-browser --cache /tmp/pixel-npm-cache playwright-core
PLAYWRIGHT_MODULE=/tmp/pixel-browser/node_modules/playwright-core/index.mjs node scripts/browser-smoke.mjs
```

It uses `/usr/bin/chromium` by default; override `CHROMIUM_PATH` or `GAME_URL` as needed. Desktop and mobile screenshots are written under `/tmp`.

Next development areas: advanced skill tiers, impassable terrain and pathfinding, varied enemy behaviors, equipment inventories, regional factions, procedural encounters, and Android packaging.
