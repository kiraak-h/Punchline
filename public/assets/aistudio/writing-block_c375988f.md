# PROJECT PUNCHLINE
## Game Design Document (GDD) — Version 1.0

**Project status:** Pre-production  
**Product type:** Single-player HTML5 browser puzzle game  
**Genre:** Cartoon comedy / interactive visual logic  
**Audience:** Global  
**Visual direction:** 2D cartoon, expressive characters, internet-culture humor  
**Initial content target:** 100 handcrafted campaign levels  
**Working codename:** Project Punchline  
**Commercial title:** To be decided and trademark/domain checked

---

# PART 1 — PRODUCT VISION

## 1.1 Core concept

Project Punchline is an original cartoon puzzle game in which players repair absurd situations by applying one of three reality-changing tools.

Each level presents an animated cartoon scene containing a problem.

Players inspect the scene, choose an appropriate tool, apply one patch and run the scene to discover the result.

The goal is not to react quickly. The goal is to understand the situation and make the right decision.

### Core gameplay promise

**One ridiculous situation. One clever fix. One unexpected punchline.**

The player should understand the objective within a few seconds and enjoy watching the consequence of their decision.

## 1.2 Product pillars

1. **Instant understanding:** No complicated instructions or long tutorials.
2. **Consistent gameplay:** The same three tools work throughout the entire campaign.
3. **Comedic presentation:** Funny characters, surprising situations and entertaining outcomes.
4. **Fair logic:** Every puzzle has a predetermined, testable solution.
5. **Replayability:** Campaign progression, personal records and daily challenges.

## 1.3 Intended player experience

The player should feel:

- Curious when viewing a strange situation.
- Confident about experimenting.
- Satisfied when identifying the correct solution.
- Amused by the animated outcome.
- Motivated to attempt another puzzle.
- Interested in sharing a particularly funny level.

## 1.4 Target audience

Primary audience:
- Casual browser gamers.
- Teenagers and adults.
- Players who enjoy humorous puzzle games.
- Players who share short gaming clips.
- Players looking for quick entertainment.

The game should remain family-friendly, even when it uses internet-culture humor.

Avoid graphic violence, hate-based humor, sexual content and jokes targeting protected groups.

---

# PART 2 — ORIGINAL GAMEPLAY MECHANICS

## 2.1 The three reality patches

The entire game uses three tools.

### TOOL A — SWAP

**Purpose:** Exchange the positions of two compatible objects.

How it works:
1. Select SWAP.
2. Select the first highlighted object.
3. Select the second compatible object.
4. The two objects exchange their designated positions.
5. Their individual identity, appearance and attached properties remain with them.

Examples:
- Exchange two directional signs.
- Exchange two delivery packages.
- Exchange two chairs.
- Exchange two floor tiles.

Rules:
- Only compatible, highlighted objects can be swapped.
- The game cannot move an object to arbitrary coordinates.
- Object properties travel with the object.
- Both objects must occupy valid destination slots.
- Swapping is one patch operation, even though it requires selecting two objects.

### TOOL B — FREEZE

**Purpose:** Stop one object's movement or active behaviour.

How it works:
1. Select FREEZE.
2. Select a highlighted active object.
3. The object becomes frozen.
4. Start the simulation.
5. The object remains frozen throughout that level's run.

Examples:
- Stop a fan and its airflow.
- Stop a moving character.
- Stop a runaway shopping cart.
- Stop a scripted hazard.

Rules:
- Freeze affects the selected object's authored movement and active output.
- Freeze does not freeze the entire scene.
- A frozen object cannot perform its normal scripted action during the run.
- Frozen objects remain visually recognizable.
- Static objects are not valid freeze targets.

### TOOL C — RESIZE

**Purpose:** Change the size of one object.

How it works:
1. Select RESIZE.
2. Select a highlighted object.
3. Choose SMALL or LARGE.
4. The object changes size.
5. Start the simulation.

Standard design values:

| Size option | Scale |
|---|---:|
| Small | 0.6× |
| Large | 1.6× |

The scale modifies the object's visible dimensions and relevant collision or coverage boundaries.

It does not randomly change movement speed, identity or behaviour.

Examples:
- Shrink an oversized coffee mug.
- Enlarge an umbrella.
- Enlarge a step stool.

Each level defines which size options are available and what effect they have.

## 2.2 One-patch rule

Every campaign puzzle must be solvable with exactly one patch operation.

A patch operation means:

- One Resize action on one object.
- One Freeze action on one object.
- One Swap action between two objects.

Do not allow players to combine multiple tools to bypass the designed puzzle.

Players may undo a patch before running the scene.

If an attempt fails, the level resets and the player can try again without losing campaign progress.

## 2.3 Standard gameplay sequence

Every level follows the same structure:

**OBSERVE → SELECT → PATCH → RUN → REVEAL**

1. Observe the cartoon situation.
2. Read the objective.
3. Select an appropriate tool.
4. Apply the patch.
5. Press RUN.
6. Watch the deterministic animation.
7. Receive a success or failure result.

The preview animation can be replayed before a patch is applied.

## 2.4 Deterministic game behaviour

This is a critical design requirement.

The game should not use uncontrolled physics or random events to determine puzzle outcomes.

Every scene should have:
- An authored initial state.
- Defined object positions.
- Defined movement paths.
- Defined interaction rules.
- Defined event timings.
- Defined success conditions.
- Defined failure conditions.

The same level with the same patch must always produce the same outcome.

The game may use lightweight animations to create the appearance of a living cartoon world, but puzzle logic must remain predictable.

This makes the game easier to understand, test, balance and expand.

## 2.5 Failure and retry

Failure should be funny rather than frustrating.

Examples:
- The raccoon accidentally destroys the office presentation.
- The pigeon activates every alarm in the building.
- The delivery robot ends up in the wrong building.
- The CEO gets stuck behind a doorway.

After failure:
- Show a short failure animation.
- Display RETRY and HINT.
- Reset the scene to its original state.
- Preserve campaign progress.

Do not use lives or energy systems in the initial game.

## 2.6 Hint system

Use three hint stages:

**Hint 1 — Direction**

A brief clue about what is wrong.

**Hint 2 — Object**

Highlight the relevant object or pair.

**Hint 3 — Solution**

Reveal the correct tool and action.

Hints should not force the player to watch advertisements.

---

# PART 3 — ORIGINALITY AND COMPETITOR DIFFERENTIATION

## 3.1 Competitor research

The following games demonstrate existing market overlap.

| Competitor | Existing mechanic | Our differentiation |
|---|---|---|
| Brain Test | Trick questions and unexpected solutions | Consistent object-system rules |
| DOP Noob | Cartoon scenes and drawing-based solutions | Three fixed reality-patching tools |
| Brainrot Puzzle | Meme-inspired image puzzles | Animated cause-and-effect comedy |
| Resizer | Changing object sizes to solve obstacles | Size is one component of a larger repair system |
| Size It Up | Swap and resize picture pieces | Animated cartoon situations rather than image reconstruction |
| Sling | Physics prediction and daily challenges | Authored comedy scenarios and object manipulation |
| Sandboxels | Interactive physics experimentation | Structured objectives and one-patch solutions |

These titles show that individual mechanics and visual approaches already exist. The game must not claim that swapping, freezing, resizing or cartoon riddles are individually unprecedented.

## 3.2 Our differentiation

The intended identity is:

**A cartoon system-repair puzzle game.**

The player is effectively a debugger for an absurd cartoon universe.

The differentiating elements are:

1. A consistent set of three object-changing verbs.
2. One-patch constraints for every level.
3. Animated scenes rather than static picture riddles.
4. Deterministic cause-and-effect outcomes.
5. A recurring original cast.
6. Funny failure and success animations.
7. Short, spoiler-free challenge sharing.

## 3.3 Originality requirements

Do not copy:
- Existing game characters.
- Existing level layouts.
- Existing puzzle solutions.
- Copyrighted meme images.
- Famous characters from entertainment franchises.
- Existing game logos or distinctive interfaces.

Create original characters and original scenarios.

Internet-culture references should inspire the humour but should not depend on copying a specific viral image or character.

## 3.4 Originality test

Before accepting a new level, ask:

- Does the level require reasoning rather than guessing?
- Is the correct action supported by visible clues?
- Is the solution different from the last few levels?
- Is there a funny result?
- Could this level be mistaken for an existing puzzle?
- Does it use the three tools in a coherent and understandable way?

If the level feels like a simple reskin of an existing game, redesign it.

---

# PART 4 — ORIGINAL CHARACTER BIBLE

Four recurring characters provide the personality of the game.

## 4.1 Raccoon Manager

Role: Main troublemaker.

Personality:
- Overconfident.
- Easily distracted.
- Thinks he is the smartest person in the room.
- Often causes the problem himself.

Visual characteristics:
- Grey and charcoal fur.
- Large expressive eyes.
- Small office tie.
- Exaggerated reactions.
- Distinctive striped tail.

## 4.2 NPC Pigeon

Role: The unpredictable character.

Personality:
- Randomly appears in important situations.
- Repeats the wrong behaviour.
- Mistakes everything for food.
- Never understands instructions.

Visual characteristics:
- Round body.
- Large head.
- Tiny legs.
- Expressive eyebrows.
- Distinctive walking animation.

## 4.3 Toaster CEO

Role: Corporate authority figure.

Personality:
- Serious about absolutely everything.
- Believes the office is a global enterprise.
- Gets angry over insignificant issues.
- Always speaks like an executive.

Visual characteristics:
- Metallic toaster body.
- Cartoon eyes.
- Small executive tie.
- Toast popping out during emotional reactions.

## 4.4 Goblin Intern

Role: Source of secondary chaos.

Personality:
- Tries to help but makes everything worse.
- Misunderstands normal instructions.
- Is frequently surprised by his own actions.

Visual characteristics:
- Small body.
- Oversized head.
- Large hands.
- Exaggerated facial reactions.

Characters must remain visually consistent throughout the campaign.

---

# PART 5 — VISUAL ART DIRECTION

## 5.1 Overall style

2D cartoon illustration with polished animation.

The desired look combines:
- Modern casual-game artwork.
- Exaggerated comic expressions.
- Colourful environments.
- Chunky, readable objects.
- Smooth animation.
- Funny visual storytelling.

Avoid:
- Photorealism.
- Generic AI-generated artwork.
- Excessively complex backgrounds.
- Pixel-art presentation.
- Flat, lifeless icons.
- Unrelated art styles between levels.

## 5.2 Suggested colour palette

| Purpose | Colour |
|---|---|
| Primary ink | Deep charcoal #292833 |
| Background | Warm cream #FFF2DC |
| Primary coral | #FF6B70 |
| Electric cyan | #54C8D8 |
| Lemon yellow | #FFD65A |
| Leaf green | #83D49B |
| Purple accent | #8665BB |
| Success | #48B985 |
| Failure | #ED6666 |

Use these as starting colours, not unchangeable rules.

## 5.3 Animation direction

Every character should support:
- Idle animation.
- Walking.
- Reaction.
- Surprise.
- Failure.
- Victory.

Important animation principles:
- Anticipation before important actions.
- Squash and stretch.
- Exaggerated facial expressions.
- Clear object movement.
- Satisfying patch application.
- Short celebratory animation after success.

Animations must communicate what happened, not merely decorate the screen.

## 5.4 Interface design

The interface should contain:

- Game title.
- Level indicator.
- Scene objective.
- Cartoon scene.
- Three tool buttons.
- Run button.
- Undo button.
- Hint button.
- Sound control.
- Level progress.

Keep the active gameplay area central.

The game must be designed for touch as well as mouse input.

## 5.5 Responsive design

Desktop:
- Landscape scene.
- Controls arranged around or below the scene.
- Full readable cartoon composition.

Mobile:
- Portrait-friendly layout.
- Main scene remains large.
- Tool buttons placed in easy thumb reach.
- No unwanted browser scrolling while using the game.
- Touch target sizes of approximately 44 CSS pixels or more.

Each level must have a responsive scene layout so important objects never become too small or cropped.

## 5.6 Audio

Original audio assets only.

Sound categories:
- Tool-selection effects.
- Patch application.
- Object interaction.
- Successful puzzle.
- Failed puzzle.
- Character reaction.
- Level completion.

Provide independent music and sound toggles.

Support reduced motion and silent play.

---

# PART 6 — FIRST TEN FULLY SPECIFIED PUZZLES

These are the initial campaign levels.

All dimensions are conceptual design units. They are intended to establish precise game behaviour, not production artwork measurements.

## LEVEL 01 — COFFEE CLEARANCE

**Chapter:** Office Onboarding  
**Difficulty:** 1/10  
**Introduced tool:** RESIZE  
**Expected solve time:** 10–20 seconds

### Scene

A small delivery robot carries a giant coffee mug towards the Toaster CEO's office.

The office doorway is too narrow for the mug.

### Goal

Deliver the coffee to the CEO without spilling it.

### Objects and dimensions

- Robot follows a fixed horizontal delivery path.
- Door clearance: 72 units.
- Coffee mug standard width: 108 units.
- Coffee mug Small width: approximately 65 units.
- Coffee mug Large width: approximately 173 units.

### Available action

Resize the coffee mug.

### Intended solution

1. Select RESIZE.
2. Select the coffee mug.
3. Choose SMALL.
4. Press RUN.
5. Robot moves through the doorway.
6. Coffee arrives safely.

### Success condition

Robot reaches the delivery zone, and the mug remains upright.

### Failure condition

With the normal-sized mug, the doorway collision stops the robot and causes the coffee to spill.

### Success animation

The CEO drinks the coffee and gives a serious thumbs-up.

### Hint

"The robot isn't too wide. Look at what it's carrying."

### Learning objective

Teach the Resize tool and the relationship between object dimensions and environmental clearance.

---

## LEVEL 02 — PIGEON PROTOCOL

**Chapter:** Office Onboarding  
**Difficulty:** 1/10  
**Introduced tool:** FREEZE  
**Expected solve time:** 10–20 seconds

### Scene

The Toaster CEO is presenting important company results.

A pigeon is perched near a red emergency alarm switch.

The pigeon begins flying towards the switch during the scene.

### Goal

Complete the presentation without activating the alarm.

### Objects and behaviour

- Pigeon begins at a safe perch.
- Alarm switch is located along the pigeon's scripted flight path.
- The pigeon reaches the trigger area after approximately 3 seconds.
- The alarm activates if the pigeon touches the switch.

### Available action

Freeze the pigeon.

### Intended solution

1. Select FREEZE.
2. Select the pigeon.
3. Press RUN.
4. Pigeon remains frozen at its starting position.
5. The alarm remains untouched.
6. The presentation finishes.

### Success condition

The presentation completes without the alarm activating.

### Failure condition

The pigeon reaches the switch and activates the alarm.

### Success animation

The CEO gives the pigeon a tiny employee award for doing absolutely nothing.

### Hint

"The problem is not the alarm. It is the bird."

### Learning objective

Introduce Freeze and demonstrate that stopping an active object can change the outcome of a scene.

---

## LEVEL 03 — WRONG WAY WI-FI

**Chapter:** Office Onboarding  
**Difficulty:** 2/10  
**Introduced tool:** SWAP  
**Expected solve time:** 15–25 seconds

### Scene

A delivery robot must reach its charging station.

At a route junction, two directional sign panels are positioned incorrectly.

### Goal

Guide the delivery robot to the charging station rather than the recycling bin.

### Objects and behaviour

- Robot begins at the entrance to a two-route junction.
- Active route socket currently contains a sign pointing towards the recycling bin.
- Spare route socket contains the sign pointing towards the charging station.
- The robot follows the direction indicated by the sign in the active socket.

### Available action

Swap the two directional signs.

### Intended solution

1. Select SWAP.
2. Select the sign at the active route socket.
3. Select the charging-station sign in the spare socket.
4. Press RUN.
5. The charging sign is now at the active junction.
6. The robot follows the correct route.

### Success condition

Robot reaches the charging station.

### Failure condition

Robot follows the wrong arrow and ends at the recycling bin.

### Success animation

Robot charges itself and displays a smug little smile.

### Hint

"The correct sign is already there. Just not in the right place."

### Learning objective

Teach Swap and introduce compatible object pairs.

---

## LEVEL 04 — THE LAST COPY

**Chapter:** Office Mayhem  
**Difficulty:** 2/10  
**Expected solve time:** 15–25 seconds

### Scene

The Raccoon Manager has left the only copy of an important company contract on his desk.

An office fan is blowing the document towards a shredder.

### Goal

Save the contract before it enters the shredder.

### Objects and behaviour

- Fan rotates continuously.
- Fan produces a scripted airflow effect.
- The paper gradually moves across the desk.
- The shredder is active at the end of the desk.
- Paper enters the shredder if the fan remains active.

### Available action

Freeze the fan.

### Intended solution

1. Select FREEZE.
2. Select the fan.
3. Press RUN.
4. The fan stops rotating and its airflow stops.
5. The paper remains on the desk.

### Success condition

The contract remains outside the shredder until the manager retrieves it.

### Failure condition

Paper reaches the shredder.

### Success animation

Raccoon grabs the contract and hugs it dramatically.

### Hint

"Stop the force moving the paper, not the paper itself."

### Learning objective

Explain that Freeze can disable an object's active output as well as movement.

---

## LEVEL 05 — TWO UNDER ONE UMBRELLA

**Chapter:** Office Mayhem  
**Difficulty:** 2/10  
**Expected solve time:** 15–25 seconds

### Scene

The Raccoon Manager is walking to a taxi with the Goblin Intern.

It starts raining.

Their umbrella is too small to cover both characters.

### Goal

Get both characters to the taxi without getting wet.

### Objects and dimensions

- Existing umbrella coverage width: 70 units.
- Required coverage width: 92 units.
- Large umbrella coverage width: approximately 112 units.
- Both characters follow one fixed walking path.
- Rain falls within a defined exposure zone.

### Available action

Resize the umbrella.

### Intended solution

1. Select RESIZE.
2. Select the umbrella.
3. Choose LARGE.
4. Press RUN.
5. Umbrella expands.
6. Both characters reach the taxi protected from the rain.

### Success condition

Both characters finish the crossing without entering the rain exposure state.

### Failure condition

One or both characters become wet.

### Success animation

The Raccoon Manager opens the car door and the intern is revealed to be completely dry, while Raccoon himself looks ridiculous in his oversized suit.

### Hint

"Two passengers. One umbrella. Check the coverage."

### Learning objective

Demonstrate how resizing changes an object's coverage boundaries.

---

## LEVEL 06 — PARCEL IDENTITY CRISIS

**Chapter:** Delivery Disasters  
**Difficulty:** 3/10  
**Expected solve time:** 20–30 seconds

### Scene

Two delivery parcels are waiting on a conveyor system.

One contains a pizza for the café.

The other contains a cactus for the plant shop.

The packages have been placed on the wrong conveyor lanes.

### Goal

Deliver both packages to their correct destinations.

### Objects and behaviour

- Lane A leads to Café.
- Lane B leads to Plant Shop.
- Pizza package is initially in Lane B.
- Cactus package is initially in Lane A.
- Package identity and destination labels travel with their respective package.

### Available action

Swap the two parcels.

### Intended solution

1. Select SWAP.
2. Select the pizza parcel.
3. Select the cactus parcel.
4. Press RUN.
5. Pizza follows Lane A.
6. Cactus follows Lane B.

### Success condition

Both packages reach their matching destinations.

### Failure condition

At least one package reaches the incorrect destination.

### Success animation

The café owner happily receives the pizza. The plant-shop owner receives the cactus wearing a tiny ribbon.

### Hint

"The conveyor routes are correct. The cargo isn't."

### Learning objective

Show that Swap moves objects while preserving their identities and attached properties.

---

## LEVEL 07 — CART BEFORE HORSE

**Chapter:** Delivery Disasters  
**Difficulty:** 3/10  
**Expected solve time:** 15–25 seconds

### Scene

A shopping cart has started rolling down a supermarket ramp.

A large cake display is directly in its path.

### Goal

Prevent the shopping cart from destroying the cake display.

### Objects and behaviour

- Shopping cart starts at the top of the ramp.
- Cart follows a predetermined movement path.
- Cart reaches the display after approximately 4 seconds.
- Cake display occupies the danger zone.
- Cashier approaches the cart's starting position.

### Available action

Freeze the cart.

### Intended solution

1. Select FREEZE.
2. Select the shopping cart.
3. Press RUN.
4. Cart remains at its starting location.
5. Cashier reaches it and secures it.

### Success condition

Cart does not collide with the cake display.

### Failure condition

Cart reaches the cake display.

### Success animation

Cashier looks at the perfectly safe cakes. Raccoon celebrates as though he saved the entire supermarket.

### Hint

"Something is moving where it shouldn't."

### Learning objective

Introduce moving hazards and static safe outcomes.

---

## LEVEL 08 — CATWALK EMERGENCY

**Chapter:** Delivery Disasters  
**Difficulty:** 3/10  
**Expected solve time:** 20–30 seconds

### Scene

A cat needs to press an elevator control button before the elevator doors close.

The available step stool is too short.

### Goal

Help the cat reach the elevator button.

### Objects and dimensions

- Cat's standing reach above its support surface: 42 units.
- Standard stool height: 35 units.
- Button height: 92 units above floor level.
- Large stool height: 56 units.

Combined reach:

- Standard: 42 + 35 = 77 units.
- Large: 42 + 56 = 98 units.

### Available action

Resize the stool.

### Intended solution

1. Select RESIZE.
2. Select the stool.
3. Choose LARGE.
4. Press RUN.
5. Cat climbs the stool.
6. Cat reaches and presses the button.

### Success condition

The elevator stop button is pressed before the doors close.

### Failure condition

The cat cannot reach the button.

### Success animation

The elevator stops. The cat looks at the camera like a professional rescue worker.

### Hint

"The cat can reach it, but needs a better platform."

### Learning objective

Introduce size-dependent reach and environmental interactions.

---

## LEVEL 09 — BOARDROOM MUSICAL CHAIRS

**Chapter:** Office Mayhem  
**Difficulty:** 4/10  
**Expected solve time:** 25–35 seconds

### Scene

The Raccoon Manager and NPC Pigeon are arriving at a company meeting.

Each character has an assigned colour-coded seat.

Unfortunately, the chairs have been installed at the opposite positions.

### Goal

Make sure each character sits in the correct chair.

### Objects and behaviour

- Red seating socket belongs to Raccoon.
- Blue seating socket belongs to Pigeon.
- Chair A is marked for Raccoon but occupies the blue socket.
- Chair B is marked for Pigeon but occupies the red socket.
- Both characters follow scripted routes to their respective seating sockets.

### Available action

Swap the chairs.

### Intended solution

1. Select SWAP.
2. Select the Raccoon chair.
3. Select the Pigeon chair.
4. Press RUN.
5. The chairs exchange positions.
6. Both characters sit in the correct seats.

### Success condition

Both characters sit in their assigned chairs.

### Failure condition

At least one character reaches the wrong chair.

### Success animation

Toaster CEO begins the meeting. Raccoon immediately falls asleep.

### Hint

"The people are going to the correct seats. Look at the furniture."

### Learning objective

Reinforce Swap without making the player manipulate characters directly.

---

## LEVEL 10 — THE RED-CARPET INCIDENT

**Chapter:** Office Mayhem  
**Difficulty:** 4/10  
**Expected solve time:** 25–40 seconds

### Scene

Raccoon is walking onto a stage for the company launch.

A banana-peel floor tile is occupying the main walking path.

A red-carpet floor tile is stored in a separate floor socket.

### Goal

Help Raccoon reach the stage without slipping.

### Objects and behaviour

- Raccoon follows a fixed path to the podium.
- The route contains the banana-peel floor tile.
- The red-carpet tile occupies a separate compatible floor socket.
- Both tiles have identical dimensions and can exchange positions.
- Raccoon slips if he steps onto the banana-peel tile.

### Available action

Swap the two floor tiles.

### Intended solution

1. Select SWAP.
2. Select the banana-peel tile.
3. Select the red-carpet tile.
4. Press RUN.
5. The tiles exchange positions.
6. Raccoon walks across the red carpet and reaches the podium.

### Success condition

Raccoon reaches the podium without slipping.

### Failure condition

Raccoon slips on the banana peel.

### Success animation

Raccoon reaches the microphone, clears his throat and immediately forgets his speech.

### Hint

"The route is fine. The floor isn't."

### Learning objective

Combine visual inspection, position-based logic and the comedic result.

---

# PART 7 — INITIAL 100-LEVEL CAMPAIGN PLAN

Total target: 100 original, handcrafted levels.

## CHAPTER 1 — THE FIRST FIX
Levels 1–10

Purpose:
- Introduce the three tools.
- Establish the one-patch rule.
- Teach object selection.
- Establish the characters.

## CHAPTER 2 — OFFICE MELTDOWN
Levels 11–25

New scenarios:
- Meeting-room problems.
- Office machines.
- Desks and furniture.
- Deliveries.
- Employee misunderstandings.

Design focus:
- More complex relationships between two objects.
- Better use of Swap and Freeze.
- First misleading but fair clues.

## CHAPTER 3 — DELIVERY DISASTERS
Levels 26–40

New scenarios:
- Conveyor systems.
- Delivery robots.
- Multiple route markers.
- Package sorting.
- Moving obstacles.

Design focus:
- More complex routes.
- Correct object selection.
- Preserving object identity.

## CHAPTER 4 — WEATHER AND WILDLIFE
Levels 41–55

New scenarios:
- Wind machines.
- Rain protection.
- Animal behaviour.
- Moving hazards.
- Environmental interactions.

Design focus:
- Freeze interactions.
- Coverage.
- Timing and motion understanding.

## CHAPTER 5 — SIZE MATTERS
Levels 56–70

New scenarios:
- Small and large doors.
- Narrow platforms.
- Oversized objects.
- Reach-based scenarios.
- Space and coverage constraints.

Design focus:
- Resize-based geometry.
- Environmental fit.
- Size-dependent access.

## CHAPTER 6 — PUBLIC CHAOS
Levels 71–85

New scenarios:
- Shopping centres.
- Airports.
- Restaurants.
- Public events.
- Cartoon transport systems.

Design focus:
- Multiple actors.
- Larger cause-and-effect chains.
- More complex target identification.

## CHAPTER 7 — FINAL PATCH DEPLOYMENT
Levels 86–100

New scenarios:
- Corporate launch disaster.
- Multiple scripted behaviours.
- Difficult object relationships.
- Advanced route problems.
- Elaborate comedic situations.

Design focus:
- Expert-level combinations of object relationships.
- No new tool types required.
- One-patch rule remains intact.
- Final level provides a memorable comedic conclusion.

## 7.1 Content-quality requirement

All 100 levels must be hand-authored.

Do not use AI to automatically generate and publish puzzles without human verification.

Every level must pass:
1. Solution verification.
2. Failure-state verification.
3. Difficulty review.
4. Mobile readability review.
5. Independent playtesting.

The first ten levels are specified in this document. The other 90 are a production roadmap and still require detailed authorship and validation.

---

# PART 8 — LEVEL DESIGN AND QUALITY CONTROL

Every level must have a complete design record.

Required level information:

- Unique level ID.
- Level title.
- Chapter.
- Difficulty.
- Opening scene.
- Goal.
- Object list.
- Object positions.
- Object properties.
- Movement scripts.
- Eligible patch tools.
- Eligible targets.
- Intended solution.
- Success condition.
- Failure condition.
- Success animation.
- Failure animation.
- First hint.
- Second hint.
- Third hint.
- Desktop layout.
- Mobile layout.
- Test cases.

## 8.1 Puzzle fairness

Players must be able to discover the solution through observation.

Rules:
- No hidden solutions.
- No arbitrary guessing.
- No accidental success.
- No invisible interaction hotspots.
- No multiple contradictory answers.
- No unexplained changes in tool behaviour.
- No misleading instructions.

## 8.2 Puzzle verification

For every level, verify every possible eligible tool-action combination.

Expected outcome:
- Exactly one intended patch operation solves the level.
- Invalid patch operations produce deterministic failure or an explicitly valid alternate solution only if intentionally designed.
- Every failure can be retried.
- Every hint provides useful information.
- The win condition is measurable.

Use human reviewers to verify that the puzzle makes sense, not just that the test system accepts the answer.

---

# PART 9 — PLAYER PROGRESSION AND RETENTION

## 9.1 Campaign progression

Players unlock levels sequentially.

No account is needed to play.

Save progress locally on the player's device.

## 9.2 Completion medals

Use three medals:

- Gold: First-attempt solution without a hint.
- Silver: Solved after retrying.
- Bronze: Solved after using a solution hint.

Do not punish players by removing access to completed content.

## 9.3 Daily challenge

Introduce a shared global daily puzzle after the basic campaign experience has been validated.

All players receive the same authored challenge for the UTC calendar day.

Display:
- Today's challenge.
- Completion status.
- Solve count or result.
- Streak.
- Spoiler-free sharing result.

Do not reveal the actual solution in the share image.

## 9.4 Social sharing

Create a simple results card.

Example:

PROJECT PUNCHLINE  
DAILY CHALLENGE #024

FIXED: 4/5  
MEDAL: GOLD  
MY RESULT: 00:42

CAN YOU FIX IT BETTER?

[Challenge URL]

Use a unique URL or challenge identifier to send new players directly to the relevant puzzle.

---

# PART 10 — VALIDATION PROTOTYPE PLAN

No full production development should begin before this phase is completed.

## STAGE A — Concept validation

Deliverables:
- Game concept presentation.
- Three-tool interaction diagrams.
- Four original character concepts.
- Ten puzzle storyboards.
- Five-level clickable interaction mockup.

The mockup is for testing comprehension and visual clarity, not measuring true gameplay enjoyment.

Test approximately 10–15 people.

Questions:
- Do they understand the game objective?
- Can they identify what each tool does?
- Does the one-patch system make sense?
- Are the scenes funny?
- Do they want to try another level?

## STAGE B — Gameplay prototype

This is a later implementation stage, not work to begin during this pre-production phase.

Prototype scope:
- Five complete levels.
- All three tools.
- Original placeholder character animations.
- Desktop and mobile controls.
- Deterministic scene simulation.
- Success and failure sequences.
- Retry and hint system.

Do not build the complete website or monetization at this stage.

## STAGE C — External playtesting

Recruit approximately 40–60 players from different countries.

Include:
- Desktop players.
- Android browser players.
- iPhone browser players.
- Casual puzzle enthusiasts.
- Players unfamiliar with this genre.

Do not explain the solutions during the first test.

### Proposed acceptance metrics

| Metric | Internal target |
|---|---:|
| Understand the first level unaided | 80%+ |
| Complete the first five levels | 70%+ |
| Want to attempt another puzzle | 70%+ |
| Daily return rate | 25%+ |
| Seven-day return rate | 10%+ |
| Share result | 5%+ |

These are proposed testing criteria, not verified industry benchmarks.

Interpret small-sample retention results cautiously.

### Additional qualitative measurements

Ask players:
- Which level was most enjoyable?
- Which level felt unfair?
- Did you understand why your solution failed?
- Did the animations make you laugh?
- Did the same tool feel repetitive?
- Would you share a challenge with a friend?

Record actual player behaviour rather than relying entirely on survey responses.

## STAGE D — Go/no-go decision

Proceed when:
- The three tools are understood.
- The first five levels are enjoyable.
- Players can solve puzzles through observation.
- Failed attempts do not produce frustration.
- Players want to continue.
- The cartoon presentation feels cohesive.

Revise when:
- Players repeatedly misunderstand object selection.
- A puzzle requires guessing.
- The same action becomes repetitive.
- Players skip the success animations.
- Players do not understand the outcome.

Stop or substantially redesign the concept if players find the core mechanic uninteresting even after onboarding and clarity improvements.

---

# PART 11 — FUTURE MONETIZATION DESIGN

Do not include advertisements in the concept-testing mockup.

After gameplay has been validated, consider:

### Advertising
- Display advertisements outside the active scene.
- Interstitial ads at natural session breaks.
- Optional rewarded videos for additional hints.

### Cosmetic purchases
- Alternative character costumes.
- Character reaction packs.
- Background themes.
- Sound effects and visual themes.

### Premium option
- Optional ad-free experience.
- Additional customization.
- Convenience features.

All paid features must remain optional.

Do not make monetization dependent on gambling, staking or cash-prize mechanics.

Ensure the advertising and privacy design meets the relevant requirements for all launch territories.

---

# PART 12 — TECHNICAL AND PERFORMANCE REQUIREMENTS FOR FUTURE PRODUCTION

These are product constraints, not coding instructions.

- Instant browser access.
- Desktop and mobile browser compatibility.
- No mandatory account.
- Lightweight 2D assets.
- Deterministic puzzle simulation.
- Local save functionality.
- Responsive controls.
- Fast loading.
- Accessibility controls.
- Original art and audio.
- No external image dependencies during gameplay.

Suggested initial web performance goals:
- Initial asset delivery target: 5 MB or less.
- Total initial game package target: 8 MB or less.
- Representative-device startup target: under 3 seconds on a reasonable connection.
- Smooth animation on commonly used mobile devices.
- No gameplay failure in browsers with restricted storage.

These are internal targets, not guarantees.

Build with the constraints of major browser game platforms in mind, without making any specific platform's SDK a mandatory dependency of the core game.

---

# PART 13 — PRE-PRODUCTION DELIVERABLES AND APPROVAL CHECKLIST

Before any production coding is authorized, complete:

[ ] Final commercial title research  
[ ] Domain availability research  
[ ] Trademark preliminary search  
[ ] Final core mechanic rules  
[ ] Ten detailed puzzle designs  
[ ] Remaining 90 level outlines and content requirements  
[ ] Four character design sheets  
[ ] Environment and object art direction  
[ ] User interface wireframes  
[ ] Visual interaction storyboard  
[ ] Five-level clickable concept mockup  
[ ] Player testing plan  
[ ] Puzzle fairness checklist  
[ ] Originality review  
[ ] Go/no-go assessment  

## Final creative direction

Project Punchline should be recognizable within seconds.

Players should see a ridiculous cartoon situation, understand the problem, choose a reality patch, run the scene and enjoy the punchline.

It must feel like one coherent original game, not a collection of unrelated meme puzzles.

**Primary development principle: Make the first ten levels exceptionally good before expanding the remaining 90.**

**Production status: NOT AUTHORIZED.**

This document establishes the design direction. Full coding, website development and production asset creation require a separate approval after concept validation.