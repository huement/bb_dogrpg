# prompt one

I want to build a 2D Retro Dog RPG using Phaser 3.

Please initialize a new Vite project with TypeScript in the current directory (folder name: DogRPG). Use the vanilla-ts template.

Install Phaser version 3.80.1 via npm.

Clean up the default Vite boilerplate: Remove the Vite logo, default CSS resets, and any unnecessary imports in src/main.ts and index.html.

Set up a basic Phaser Game configuration in src/main.ts:
- Resolution: 800x600
- Physics: Arcade with gravity disabled (set gravity.y = 0)
- Scenes: Preload an empty PreloaderScene and GameScene for now
- Background color: #000000
- Ensure the game scales to fit the window while maintaining aspect ratio (use Phaser.Scale.FIT)

Create folder structure: src/scenes, src/objects, src/utils.

Run all necessary terminal commands (e.g., npm init vite@latest, npm install phaser, npm run dev) and confirm the dev server starts without errors.

After setup, open a blank black screen in the browser preview to verify. If there's an error, reference the terminal output and suggest fixes.

# Prompt Two

The Vite + Phaser project is running correctly.

I have replaced all individual images with a single sprite sheet located at /public/assets/spritesheet.png.
It is a 4 columns × 6 rows grid (24 frames total). Frames are arranged vertically:

Column 1 → Up
Column 2 → Right  
Column 3 → Down  
Column 4 → Left

Each animation uses 6 frames, so the exact frame indices are:

Walk Up:    0, 4, 8, 12, 16, 20
Walk Right: 1, 5, 9, 13, 17, 21
Walk Down:  2, 6, 10, 14, 18, 22
Walk Left:  3, 7, 11, 15, 19, 23

Please do the following:

1. PreloaderScene (src/scenes/PreloaderScene.ts)
   - Only load the sprite sheet: this.load.spritesheet('dog', '/assets/spritesheet.png', { frameWidth: 0, frameHeight: 0 });
   - Automatically calculate frameWidth = image width / 4 and frameHeight = image height / 6 (use this.textures.get('dog').getSourceImage().width and .height so it works even if the sheet size changes later).
   - On complete → start 'GameScene'

2. Player class (src/objects/Player.ts)
   - Extend Phaser.Physics.Arcade.Sprite and load the 'dog' spritesheet.
   - In the constructor (or a new initAnimations() method):
     • Create the four walk animations exactly with the frame lists above.
     • frameRate: 10, repeat: -1 for all.
     • Example:
       scene.anims.create({ key: 'walk-up', frames: scene.anims.generateFrameNumbers('dog', { frames: [0,4,8,12,16,20] }), frameRate: 10, repeat: -1 });

   - Scale the sprite to 3× (this.setScale(3))
   - Adjust the body size/offset so the collision box matches the dog’s feet (not the transparent space):
     this.setSize(14, 10);          // tighten hitbox width/height
     this.setOffset(9, 20);         // adjust these numbers after visual testing – center the feet

   - In update():
     • Handle WASD movement (velocity 180)
     • Play correct animation based on last direction (stop when idle)
     • Space → bark (temporary “Woof!” text that fades)
     • E → dig (log “Digging…” for now)

3. GameScene (src/scenes/GameScene.ts)
   - Replace the old single-image player with the new animated Player class.
   - Background: still use grass.png as tileSprite (or a solid color if you removed it).
   - Camera follow + world bounds 2000×2000 as before.

4. Remove any old individual image loading code (dog.png, etc.).

After implementation, the dog must be clearly visible at 3× scale, walk with correct directional animations, and have a tight collision box around its feet. Test all four directions + idle state.



# Prompt Three

The core movement and assets are working: Dog moves with WASD, barks on Space, digs on E, camera follows on a tiled grass world.

Now add RPG features:

1. UI Overlay (src/scenes/UIScene.ts):
   - Extend Phaser.Scene, set as overlay (scene key 'UI', run parallel to GameScene via this.scene.launch('UI') in GameScene).
   - In create(): Add retro-style Health Bar (green rectangle, 200x20 at top-left 10,10; use Phaser.GameObjects.Graphics).
   - Add Stamina Bar below it (blue, drains by 1% per frame when moving, regenerates 2% when idle; tie to player's velocity).
   - Update bars in update() by accessing GameScene data (use this.scene.getScene('GameScene').player).

2. Minimap:
   - In GameScene create(): Add a minimap camera (this.cameras.add(600, 450, 200, 150) zoomed out to 0.2 scale).
   - Set it to follow the player but ignore UI elements (use ignore() on UI objects if needed).
   - Render world and player as small dots or scaled sprites.

3. Power-Ups:
   - Create src/objects/PowerUp.ts extending Phaser.Physics.Arcade.Sprite (e.g., for bone).
   - In GameScene create(): Spawn 10 bones randomly within world bounds (use Phaser.Math.Between for positions).
   - In update(): Check overlap with player (this.physics.overlap(player, bonesGroup, collectBone)).
   - On collect: Destroy bone, console.log("Bone collected!"), restore stamina to full (access via scene communication).
   - Placeholder sound: Use Phaser.Sound if available, or just log.

4. Main Menu (src/scenes/MainMenu.ts):
   - Extend Phaser.Scene.
   - In create(): Add text "Select Dog" (centered, retro font if possible via WebFont or default).
   - For selection: Display dog sprite with tint options (e.g., click to cycle tints: white, brown via 0xFFFFFF, 0x8B4513).
   - On select (pointerdown): Start GameScene with chosen tint applied to player.
   - Update main.ts to start with MainMenu.

Ensure modularity: Use events or scene data for inter-scene communication (e.g., this.events.emit('staminaUpdate')).
Test: Menu loads first, select starts game with UI/minimap/power-ups. If black screen or errors, use @Terminal to fix.