# Pixel Tales — The Ashen Company

An original, playable mercenary-company RPG with compact pixel visuals, tactical combat, company survival, staffed camps, regional trade, faction stories, research, professions, crafting, and character progression. No borrowed game assets. This is an early browser prototype; it is not yet a native Android app or a complete Wartales-scale game.

## The visual style

The art uses an original, earthy pixel palette inspired by the compact overworld presentation of Occidental Heroes: olive meadows, stepped tree canopies, warm plaster and timber buildings, and restrained parchment menus. Companions have distinct coats, faces, weapons, and portraits. Covered caravans, market stalls, wells, fences, ruins, mines, riverbanks, and a plank crossing give locations more character. Scenic footpaths do not restrict where you can walk.

![The company exploring the borderlands](docs/screenshots/world.png)

[Village menu preview](docs/screenshots/village.png) · [Tactical battle preview](docs/screenshots/battle.png) · [Regional trade preview](docs/screenshots/trade.png) · [Story choices on mobile](docs/screenshots/story-mobile.png)

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

A caravan, three bandit groups, and two forest wolf packs roam independently while exploration is active. Hostiles approach nearby companions; wolves pursue only within forests. They pause during menus, battles, and encounters. Within 48 pixels, buy provisions from the caravan, attack its guards, or confront a bandit group. Attacking peaceful traders costs 10 morale and up to 5 renown once, and permanently ends trade with that caravan, even after retreat. Winning a caravan raid grants 60 crowns, up to 10 remaining rations, available trade cargo, knowledge, salvage, and XP; it grants no renown. Combat is optional: steer away if the company is unprepared. Patrol victories award 40 crowns, knowledge, salvage, and XP without completing or clearing your contract. Defeated patrols stay defeated after reload. Wolf battles use actual wolf sprites and enemies, awarding six rations, two pelts, one knowledge, two renown, and 20 XP per survivor; they do not drop human equipment. Sell pelts for three crowns each at village markets.

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

At midnight, the company consumes **normally one ration and pays two crowns per living companion**. Cook ranks reduce rations by up to two, Trailcraft reduces them by one, and a cookpot reduces them by one, with a minimum of one ration for a surviving company. Unpaid wages accumulate as debt and lower morale; settle them in Company or Camp. Mercenary recruits demand three crowns and hearty recruits eat one extra ration. Inn prices include actual wages and overdue pay.

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

## Companion character and relationships

Open **Company → Character & bonds** to see traits, personal resolve, daily costs, and relationships. New founders have distinct personalities; existing saves gain their founders’ traits while keeping progress.

| Trait           | Effect                                                                               |
| --------------- | ------------------------------------------------------------------------------------ |
| Resolute        | Lose half as much personal resolve from hardship                                     |
| Steadfast       | Bracing beside a trusted friend protects them from two damage rather than one        |
| Compassionate   | Medicine builds stronger bonds; peaceful caravan attacks cost eight personal resolve |
| Convivial       | Sharing supper grants one extra bond point                                           |
| Tireless        | Gain 1.5 fatigue per awake hour instead of two                                       |
| Mercenary       | Gain one attack, demand three daily crowns, and lose more resolve over unpaid wages  |
| Hearty appetite | This recruit starts with 32 health, but consumes an extra daily ration               |

Taverns offer a standard 60-crown recruit, an 80-crown mercenary swordswoman and Smith, and a 50-crown hardy spearman and Cook. Names vary by village. Review their health, profession, traits, wages, and rations before hiring. Specialist offers disappear permanently once hired. Capacity remains six living companions; replacing someone who died begins with fresh bonds.

Personal **resolve** starts at 65 and ranges from zero to 100. Hunger, overdue pay, prolonged exhaustion, defeat, and starvation deaths reduce it. Fed daily meals, rest, medicine, victory, and camp conversations help rebuild it. Below 25, a disheartened companion loses one attack damage. Resolve is separate from company morale.

Bonds grow from supplied daily meals (+1), fed rests of at least six hours (+2 once per day), shared victories (+3 for conscious survivors), and treatment by a Herbalist (+2, or +3 if compassionate). Levels are **Familiar at 10**, **Trusted at 25**, and **Sworn companions at 50**.

At **Make camp → Supper & stories**, select two companions to spend two rations and two hours together, once per day for the company. They gain four bond points and eight resolve each; a convivial participant adds one bond point. Self-targeting, unconscious participants, and insufficient food are blocked.

In battle, standing next to a conscious trusted friend grants **+1 attack**, provided the attacker is not disheartened. A trusted friend who braces beside you protects you from one damage, or two if steadfast. These bonuses do not stack with additional friends, and support disappears when a friend falls or moves away. Relationships also make starvation bereavement more painful.

[Recruitment preview](docs/screenshots/recruitment.png)

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

At the **Market square**, sell spare ore (2 crowns each), wood or herbs (1), and medicine (4), individually or as a whole stack. Purchase prices exceed resale prices. At **The Crooked Lantern**, resting costs **4 crowns for beds plus each companion’s daily wage**, including beds, meals, and wages, plus any overdue wages. It takes one day, uses no rations, restores living companions to full health, cures injuries, and adds 15 morale up to 100. Recruitment remains a separate service.

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

## Cover, movement, and disengagement

Brush and rubble provide **2 cover against ranged attacks**, for either side. Mud costs **2 movement points**; units cannot walk through occupied tiles. Put melee companions on opposite sides of an enemy for **+2 flanking damage**. Leaving an adjacent melee enemy triggers its disengagement attack, at most once per round. Archers retreating from your companions face the same rule. **Disengage** spends your action and one valor to permit a safe move; a Scout hood makes the first disengagement of a battle free. You cannot attack afterward.

Wolves rush reachable wounded companions, move farther, and gain pack damage when hunting together. Bandit archers maintain distance, while their melee allies close in. Cover, shields, bracing, fatigue, resolve, and trusted companions all affect the outcome.

## Regional trade and caravan cargo

Visit a village's **Market square → Regional trade** to buy and sell grain, cloth, salt, and iron. Trade cargo has **20 total slots**, separate from rations and crafting materials. Greyhaven has cheap grain, Saltbridge cheap salt, and Emberfall cheap iron. Supply prices also vary by village. Stock is finite, and regional shortages raise the price of a requested good. Each shortage has eight units of demand; supplying the last unit grants League reputation once. Bulk sales price each unit separately as demand runs out. Stock and shortages refresh every three days.

Friendly caravans offer **View caravan cargo** when nearby. Their cargo and food stocks are finite and persist in saves. Raiding a caravan costs **12 League and 6 Warden reputation**, in addition to morale and renown penalties and compassionate companions' reactions. Victories take its remaining food and as much actual cargo as your company can carry; raiding does not create unlimited provisions.

## Equipment that changes tactics

Each companion has separate **weapon, armor, shield, and helmet** slots in **Equipment**. Shields cannot be used by archers or alongside two-handed weapons. Equipping a two-handed weapon returns a worn shield to stores. Equipment belongs to one companion at a time; death returns it to stores. Armor from the three defensive slots adds together.

| Uncommon equipment  | Fighting style                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Executioner's blade | Two-handed; basic attacks sweep an adjacent second enemy for half attack power before armor. |
| Long pike           | Two-handed; one extra tile of basic and skill reach.                                         |
| Barbed spear        | Basic hits inflict two turns of bleeding.                                                    |
| Duelist sabre       | Bracing retaliates against melee hits while the wearer survives.                             |
| Sentinel shield     | Bracing reduces incoming damage by two more points.                                          |
| Scout hood          | First disengagement each battle costs no valor.                                              |
| Captain's helm      | Bracing generates two valor instead of one.                                                  |

Fine gear can be bought at five renown or with ten Warden reputation. Research the armorer's craft and assign a Smith to craft fine equipment; a staffed camp forge reduces its ore cost further. Ordinary round shields, iron caps, and iron greatswords are also available.

## Regional stories and factions

Regional stories are accepted **only at village contract boards**, using the same active-contract slot as ordinary work. Investigate the marked site, choose a branch, complete any required battle, and return to the issuing village for the final reward. Peaceful choices have real resource or reputation requirements. Completed choices remain visible in **Company**, and rewards cannot be claimed twice.

- **Greyhaven: Salt on the road.** Recover cargo for the League, feed refugees, or seize their shipment.
- **Saltbridge: Whispering Grove oath.** After the road story and five renown, defend the Freefolk in battle or back the timber merchants.
- **Emberfall: Claim to the Broken Crown.** After the grove story and fifteen renown, support the Wardens or Freefolk, or broker peace if both trust you.

The **Caravan League**, **Border Wardens**, and **Grove Freefolk** remember these choices. Reputation ranges from −30 to +30. At ten League reputation purchases are cheaper; at −10 they become more expensive. Ten Warden reputation unlocks fine equipment without the renown requirement. Ten Freefolk reputation adds two rations to foraging. Ordinary deliveries, bandit victories, wolf hunts, and relieved shortages also build relevant standings. Company shows the current standing, benefits, and accepted or completed stories without offering new contracts outside villages.

## Your first expedition

1. Choose **Visit Contract board** in Greyhaven’s arrival menu and accept _Wolves in human clothing_.
2. Close the panel and click toward **Pinewatch** on the map. You can take any route and stop anywhere along the way.
3. **Explore** to collect knowledge, ore, wood, and herbs, then **Engage raiders**.
4. Select a companion using their button or sprite. Outlined green tiles are movement options; outlined red enemies are attack targets. Each companion can move up to two movement points along unoccupied tiles **and** attack once per round. Bows reach four tiles, spears two, other weapons one. **Brace** trades your attack for damage reduction. End the round for enemy actions.
5. Victory awards crowns, knowledge, salvage, and XP. Train leveled companions in **Company**, unlock permanent upgrades in **Research**, make permanent improvements in **Workshop**, and assign battle loot in **Equipment**.
6. Return to a village, visit its **Market square** for supplies and its **Crooked Lantern** tavern to recruit up to six companions. Buy medicine, heal injured allies, or camp to restore health and morale. Use **Make camp** to open the camp, build improvements, and rest until the next 08:00. Daily upkeep applies at midnight.
7. Walk to Iron Hollow and the Watchtower, take additional contracts, and respond to roadside choices. Delivery contracts offer a noncombat source of income and knowledge.

Morale at 85+ grants +1 attack. Injuries impose −1 attack. Armor absorbs damage. Profession practice now unlocks ranks and company bonuses. Explorable sites have one-time rewards. Contracts are repeatable. Defeat rescues the company in Greyhaven at a cost; starvation deaths are permanent and cannot be reversed by medicine or resting. Fallen companions leave company equipment in stores and can be replaced at taverns while survivors remain. If everyone starves, start a new company.

Progress automatically saves in browser local storage. **New company** asks before replacing it. Version-one through version-ten saves migrate, preserving permanent equipment improvements; invalid saves fall back to a fresh company. Browser storage is specific to your browser and origin; moving from a local file to a hosted site does not transfer progress.

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
PLAYWRIGHT_MODULE=/tmp/pixel-browser/node_modules/playwright-core/index.mjs node scripts/companions-smoke.mjs
PLAYWRIGHT_MODULE=/tmp/pixel-browser/node_modules/playwright-core/index.mjs node scripts/complete-systems-smoke.mjs
```

It uses `/usr/bin/chromium` by default; override `CHROMIUM_PATH` or `GAME_URL` as needed. Desktop and mobile screenshots are written under `/tmp`. The village smoke test checks regional offers, renown locks and unlocks, resale, inn recovery, save persistence, and dangerous encounters. The equipment smoke test covers purchases, class restrictions, assignment and transfer, resale, research and crafting, combat restrictions, reloads, mobile layout, and new-company reset.

The survival smoke test covers camp construction and recovery, saved improvements, mobile camp controls, daylight brightness, starvation warnings and permanent deaths, and wolf combat.

The camp jobs smoke test checks duty restrictions, saved assignments, resource production and costs, ration savings, profession practice, fatigue recovery and battle penalties, guard readiness, staffed campsite artwork, and mobile controls.

The companion smoke test covers trait previews and hiring, daily costs, capacity, character and bond displays, camp conversations, persistence, trusted battle support, low-resolve warnings, and mobile layout.

The complete-systems smoke test checks regional stock depletion, trading routes and shortages, four equipment slots, shield/two-handed restrictions, branching story choices and rewards, faction battles, free disengagement, save persistence, and mobile menus.

Further development includes advanced skill tiers, durability, procedural encounters, and Android packaging.
