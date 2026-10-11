# Pixel Tales — The Ashen Company

An original, playable mercenary-company RPG with compact pixel visuals, tactical combat, company survival, research, professions, crafting, and character progression. No borrowed game assets. This is an early browser prototype; it is not yet a native Android app or a complete Wartales-scale game.

## The visual style

The art uses an original, earthy pixel palette inspired by the compact overworld presentation of Occidental Heroes: olive meadows, stepped tree canopies, warm plaster and timber buildings, and restrained parchment menus. Companions have distinct coats, faces, weapons, and portraits. Covered caravans, market stalls, wells, fences, ruins, mines, riverbanks, and a plank crossing give locations more character. Scenic footpaths do not restrict where you can walk.

![The company exploring the borderlands](docs/screenshots/world.png)

[Village menu preview](docs/screenshots/village.png) · [Tactical battle preview](docs/screenshots/battle.png)

All artwork is drawn locally from `src/art.js`, with cached terrain and sprite images. There are no downloaded game assets, external fonts, or network requests required to render it. The world navigator uses the same terrain artwork. Unexplored land fades through a soft pixel edge; combat uses clearer selection outlines, names, and health tracks.

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

Towns and other sites offer actions only when you are within 28 world pixels. Arriving at a village stops the party and opens its places menu: visit the market for supplies, the blacksmith to buy and equip weapons or armor, the tavern to recruit companions, or the contract board for paid work. Available contracts appear only at village boards; your accepted objective remains visible during exploration. Management menus are overlays opened from the bottom toolbar; opening one pauses walking. Close the panel to return to exploration. You can forage and pitch camp anywhere. A full day takes **four minutes of active exploration**, independent of walking distance. Shallows slow travel. Menus, pitched camps, battles, encounters, and hidden browser tabs pause the exploration clock. Foraging and fieldwork advance six in-game hours; construction takes two hours. Saves retain your exact position and time, and reload safely stopped.

## The living borderlands

The world is now **1536 × 864**: four times the original area, with twelve locations. Emberfall, Whispering Grove, Sunken Chapel, Redstone Quarry, Forgotten Stash, and Broken Crown extend the frontier. Greyhaven and Saltbridge are known initially; other places are discovered within 140 pixels, awarding one knowledge each. Terrain is permanently charted as you walk. Contract destinations remain marked even before discovery.

The small **world navigator** in the top right shows your charted terrain, known landmarks, current viewport, and destination. Click any point there to start a long journey; supplies and encounters still apply. It selects a coordinate, not a predetermined path.

A caravan, three bandit groups, and two forest wolf packs roam independently while exploration is active. Hostiles approach nearby companions; wolves pursue only within forests. They pause during menus, battles, and encounters. Within 48 pixels, buy provisions from the caravan, attack its guards, or confront a bandit group. Attacking peaceful traders costs 10 morale and up to 5 renown once, and permanently ends trade with that caravan, even after retreat. Winning a caravan raid grants 60 crowns, 10 rations, knowledge, salvage, and XP; it grants no renown. Combat is optional: steer away if the company is unprepared. Patrol victories award 40 crowns, knowledge, salvage, and XP without completing or clearing your contract. Defeated patrols stay defeated after reload. Wolf battles use actual wolf sprites and enemies, awarding six rations, two pelts, one knowledge, two renown, and 20 XP per survivor; they do not drop human equipment. Sell pelts for three crowns each at village markets.

Research **Watchful eyes** for a 210-pixel discovery radius, **A fair bargain** for cheaper purchases, and **Borderlands charts** (requires Watchful eyes) to reveal landmark locations without exploring their terrain. Hidden stashes offer one-time crowns and medicine. Road events now include wounded travellers, abandoned camps, and storms with different choices and costs.

## Camp, upkeep, and daylight

**Make camp** opens a separate campsite with visible bedrolls, a campfire, supply crates, and companions. Build portable improvements in the Camp menu, use the workshop, forage, or rest until the next 08:00. **View camp** shows the scene; **Break camp** resumes the overworld. Planning costs no time. Improvements travel with the company and persist after saving.

| Improvement    | Initial cost               | Effect                                                            |
| -------------- | -------------------------- | ----------------------------------------------------------------- |
| Sleeping tents | 20 crowns, 6 wood          | +5 rest healing per level; two levels, second costs twice as much |
| Cookpot        | 15 crowns, 3 wood, 2 ore   | Reduce daily rations by one                                       |
| Portable forge | 30 crowns, 4 wood, 6 ore   | Fine gear recipes use one less ore while camping                  |
| Watch post     | 20 crowns, 5 wood, 2 ore   | +40 discovery radius and +1 starting battle valor                 |
| Medicine tent  | 25 crowns, 4 wood, 8 herbs | +6 rest healing; cure injuries when recovery reaches half health  |

At midnight, the company consumes **one ration and pays two crowns per living companion**. Cook ranks reduce rations by up to two, Trailcraft reduces them by one, and a cookpot reduces them by one, with a minimum of one ration for a surviving company. Unpaid wages accumulate as debt and lower morale; settle them in Company or Camp. Inn prices include overdue wages.

Missing food causes increasing health loss each hungry day, starting at three damage and rising to eight. Partial meals reduce damage; a fully supplied daily meal resets hunger. Hungry rest does not heal. Running out of rations allows continued travel so you can seek food, but prolonged starvation kills companions permanently. Warnings show hunger and wage debt.

The visible time scale tracks midnight, dawn, daylight, dusk, and night. The map dims gradually at sunset and brightens at dawn, with warm lanterns and campfire light at night.

![An expanded company camp](docs/screenshots/camp.png)

## Camp duties and fatigue

Camp improvements now support **assigned jobs**. Open **Make camp → Camp duties**, build the required station, and choose a conscious companion. Each companion can hold one duty. Cook, Smith, and Herbalist duties require the matching current profession; anyone can guard. Changing to an incompatible profession clears the assignment. Duties persist after packing up or reloading, and assigned companions appear at their stations in the campsite.

| Duty        | Station        | Effect                                                                                                                               |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Camp cook   | Cookpot        | Save one additional ration per daily meal while camping; gain Cook practice after a fed rest                                         |
| Camp smith  | Portable forge | Fine recipes use one extra ore less while camping; a fed rest converts one wood into two ore plus Smith rank and grants two practice |
| Camp medic  | Medicine tent  | A fed rest uses two herbs to restore four extra health plus two per Herbalist rank to everyone and grants practice                   |
| Night guard | Watch post     | A fed rest prepares one extra valor for the next battle, consumed when that battle starts                                            |

Rest jobs need **at least six hours and a fed company**, and run at most once per day. Missing inputs skip the corresponding job without charging materials. Guard preparation caps at one and stacks with the watch post up to the five-valor maximum.

Companions gain **two fatigue per awake hour**, including exploration, foraging, fieldwork, and construction. At **50 fatigue**, attacks lose one damage; at **80**, attacks lose two and movement loses one tile. Fatigue caps at 100. Company shows each companion's fatigue and current penalty; exhausted companies also show an overworld warning. Menus and battles pause fatigue with the clock.

Fed camp rests recover five fatigue per hour for resting companions and three for companions on duty. Hungry rests recover only one per hour and produce no job rewards. Inn beds reset fatigue for living companions. You can leave a duty vacant when its worker needs a better rest.

## Positioning and enemy tactics

**Melee flanking** adds two damage when a living ally stands directly opposite you across the target. It works for basic attacks and class abilities in melee, and enemy melee fighters can flank your companions too. Bows do not receive the bonus. Bracing and armor still reduce incoming damage.

Wolves can move **two tiles per enemy turn**, prefer reachable wounded companions, and deal one extra damage when another living wolf is adjacent to their victim. Rooting prevents their rush; stunning skips their turn. Bandit melee fighters advance and exploit flanking, while archers retreat from adjacent threats and shoot from range. Enemy hover text and the combat instructions describe these behaviors.

## Village services and company standing

Each village has four local contracts. Greyhaven introduces mercenary work around Pinewatch and Old Barrow; Saltbridge sends you to the chapel and eastern forests; Emberfall offers quarry and frontier jobs. Available offers remain exclusive to village boards. Existing accepted contracts continue to work after updating.

Company standing advances at **5 renown** (Proven company), **15** (Veterans), and **30** (Famed company). Boards show each job’s requirement and lock acceptance until you qualify. Combat contracts have real difficulty and reward differences:

| Difficulty | Enemies | Extra health / damage per enemy | Knowledge | XP per survivor | Renown |
| ---------- | ------- | ------------------------------- | --------- | --------------- | ------ |
| Standard   | 3       | None                            | 2         | 35              | 5      |
| Dangerous  | 4       | +4 / +1                         | 3         | 45              | 10     |
| Elite      | 5       | +8 / +2                         | 4         | 55              | 15     |

Each combat victory also grants 2–4 ore and wood according to difficulty. Patrols and caravan raids retain their existing rewards. Peaceful caravan attacks reduce renown, which can close access to advanced work until you rebuild your standing.

At the **Market square**, sell spare ore (2 crowns each), wood or herbs (1), and medicine (4), individually or as a whole stack. Purchase prices exceed resale prices. At **The Crooked Lantern**, resting costs **6 crowns per companion**, including beds, meals, and wages, plus any overdue wages. It takes one day, uses no rations, restores living companions to full health, cures injuries, and adds 15 morale up to 100. Recruitment remains a separate service.

## Equipment and battle loot

Open **Equipment** from the bottom toolbar to manage your company’s named weapons and armor. Each victory over human enemies adds one item to company stores: Standard encounters and patrols drop Common gear, Dangerous contracts drop Fine gear, and Elite contracts drop Rare gear. Loot stays unequipped until you assign it.

| Quality | Weapon bonus | Armor bonus | How to acquire                                         |
| ------- | ------------ | ----------- | ------------------------------------------------------ |
| Common  | +2 attack    | +1 armor    | Standard fights or village blacksmiths                 |
| Fine    | +3 attack    | +2 armor    | Dangerous fights, blacksmiths at 5 renown, or crafting |
| Rare    | +4 attack    | +3 armor    | Elite contracts                                        |

Swords fit swordswomen, maces fit shieldbearers, bows fit archers, and spears fit spearmen. Armor fits everyone. Each companion wears one weapon and one armor item. Equipping a replacement returns the previous item to company stores; transferring an item removes it from its previous wearer. Comparison text shows the change for your selected companion. Gear bonuses add to permanent workshop improvements, research, and talents, and equipped armor actually reduces incoming damage.

Buy gear at a village **Blacksmith**, then assign it in Equipment. While in a village, unequipped gear can be sold from the inventory for 40% of its normal price. Equipped gear must be removed before selling. Barter research discounts purchases. Rare equipment is not sold by shops.

Research **Armorer’s craft** (5 knowledge, requires Tempered steel) to unlock five Fine recipes in **Workshop**. Weapons use 5 ore and 2 wood; armor uses 6 ore and 1 wood. Each Smith rank reduces ore cost by one, and crafting grants two Smith practice. Gear cannot be changed, bought, sold, or crafted during combat or roadside encounters.

[Equipment inventory preview](docs/screenshots/equipment.png)

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
| Cook       | Camping and cooking provisions                                    | Lower daily food costs (minimum one), better camp morale, +2 crafted rations per rank                      |

Near a mine or forest, **Work mine / Gather herbs** is repeatable: it costs two rations and six hours and awards two practice to the worker. Exploring remains a one-time reward. Crafting medicine requires a conscious Herbalist; cooking requires a Cook; weapon and armor work requires a Smith.

## Your first expedition

1. Choose **Visit Contract board** in Greyhaven’s arrival menu and accept _Wolves in human clothing_.
2. Close the panel and click toward **Pinewatch** on the map. You can take any route and stop anywhere along the way.
3. **Explore** to collect knowledge, ore, wood, and herbs, then **Engage raiders**.
4. Select a companion using their button or sprite. Outlined green tiles are movement options; outlined red enemies are attack targets. Each companion can move up to two Manhattan tiles **and** attack once per round. Bows reach four tiles, spears two, other weapons one. **Brace** trades your attack for damage reduction. End the round for enemy actions.
5. Victory awards crowns, knowledge, salvage, and XP. Train leveled companions in **Company**, unlock permanent upgrades in **Research**, make permanent improvements in **Workshop**, and assign battle loot in **Equipment**.
6. Return to a village, visit its **Market square** for supplies and its **Crooked Lantern** tavern to recruit up to six companions. Buy medicine, heal injured allies, or camp to restore health and morale. Use **Make camp** to open the camp, build improvements, and rest until the next 08:00. Daily upkeep applies at midnight.
7. Walk to Iron Hollow and the Watchtower, take additional contracts, and respond to roadside choices. Delivery contracts offer a noncombat source of income and knowledge.

Morale at 85+ grants +1 attack. Injuries impose −1 attack. Armor absorbs damage. Profession practice now unlocks ranks and company bonuses. Explorable sites have one-time rewards. Contracts are repeatable. Defeat rescues the company in Greyhaven at a cost; starvation deaths are permanent and cannot be reversed by medicine or resting. Fallen companions leave company equipment in stores and can be replaced at taverns while survivors remain. If everyone starves, start a new company.

Progress automatically saves in browser local storage. **New company** asks before replacing it. Version-one through version-eight saves migrate, preserving permanent equipment improvements; invalid saves fall back to a fresh company. Browser storage is specific to your browser and origin; moving from a local file to a hosted site does not transfer progress.

## Validate and develop

```sh
npm test
npm run build
```

Edit `src/game.js` (rules), `src/art.js` (pixel artwork), `src/app.js` (UI), and `style.css` (interface), then rebuild. Commit the generated `game.bundle.js` so downloaded copies run immediately. The build uses only Node's standard library.

A browser-driven smoke test also exercises combat victory, research, crafting, recruitment, delivery, reload persistence, a 390px mobile layout, village arrival menus, gear purchases, caravan trading and attacks, navigator travel, discovery beyond the original map, aimed shots, specializations, profession reassignment, and fieldwork. With a running server and Playwright Core installed in a temporary directory:

```sh
npm install --prefix /tmp/pixel-browser --cache /tmp/pixel-npm-cache playwright-core
PLAYWRIGHT_MODULE=/tmp/pixel-browser/node_modules/playwright-core/index.mjs node scripts/browser-smoke.mjs
PLAYWRIGHT_MODULE=/tmp/pixel-browser/node_modules/playwright-core/index.mjs node scripts/village-smoke.mjs
PLAYWRIGHT_MODULE=/tmp/pixel-browser/node_modules/playwright-core/index.mjs node scripts/equipment-smoke.mjs
PLAYWRIGHT_MODULE=/tmp/pixel-browser/node_modules/playwright-core/index.mjs node scripts/survival-smoke.mjs
PLAYWRIGHT_MODULE=/tmp/pixel-browser/node_modules/playwright-core/index.mjs node scripts/camp-jobs-smoke.mjs
```

It uses `/usr/bin/chromium` by default; override `CHROMIUM_PATH` or `GAME_URL` as needed. Desktop and mobile screenshots are written under `/tmp`. The village smoke test checks regional offers, renown locks and unlocks, resale, inn recovery, save persistence, and dangerous encounters. The equipment smoke test covers purchases, class restrictions, assignment and transfer, resale, research and crafting, combat restrictions, reloads, mobile layout, and new-company reset.

The survival smoke test covers camp construction and recovery, saved improvements, mobile camp controls, daylight brightness, starvation warnings and permanent deaths, and wolf combat.

The camp jobs smoke test checks duty restrictions, saved assignments, resource production and costs, ration savings, profession practice, fatigue recovery and battle penalties, guard readiness, staffed campsite artwork, and mobile controls.

Next planned additions: companion traits and relationships, regional trading goods and shortages, more equipment types and perks, and faction stories with consequences for player choices. Further development includes terrain cover and disengagement attacks, advanced skill tiers, impassable terrain and pathfinding, durability, procedural encounters, and Android packaging.
