import Phaser from "phaser";
import Player from "../objects/Player";
import PowerUp from "../objects/PowerUp";
import Mole from "../objects/Mole";

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private background!: Phaser.GameObjects.TileSprite;
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private minimapCamera!: Phaser.Cameras.Scene2D.Camera;
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  public powerUps!: Phaser.Physics.Arcade.Group;
  public moles!: Phaser.Physics.Arcade.Group;
  private lastDamageTime: number = 0;
  private damageCooldown: number = 1000; // 1 second cooldown between damage
  private minimapGraphics!: Phaser.GameObjects.Graphics;
  private tileSize: number = 32;
  private mapWidth: number = 2000;
  private mapHeight: number = 2000;
  private stamina: number = 100;
  private health: number = 100;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private highScore: number = 0;
  private highScoreText!: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  create(data?: { dogTint?: number }): void {
    // Set up world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // Initialize scene data
    this.data.set("health", 100);
    this.data.set("stamina", 100);

    // Start UI scene
    this.scene.launch("UI");

    // Create background with grass texture (tiled)
    this.background = this.add
      .tileSprite(0, 0, this.mapWidth, this.mapHeight, "grass")
      .setOrigin(0, 0)
      .setDepth(-2);

    // Create a blank tilemap for diggable ground layer
    this.tilemap = this.make.tilemap({
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
      width: Math.ceil(this.mapWidth / this.tileSize),
      height: Math.ceil(this.mapHeight / this.tileSize),
    });

    // Create a tileset with grass and dirt tiles
    // We'll create a simple colored tileset for the diggable layer
    const tileColors = [0x00aa00, 0x8b4513]; // Green (grass) and Brown (dirt)
    const canvas = document.createElement("canvas");
    canvas.width = this.tileSize * tileColors.length;
    canvas.height = this.tileSize;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Draw each tile with a different color
      tileColors.forEach((color, index) => {
        ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
        ctx.fillRect(index * this.tileSize, 0, this.tileSize, this.tileSize);
      });

      // Add the tileset to the texture manager
      this.textures.addCanvas("ground-tileset", canvas);
    }

    // Add the tileset to the map
    this.tileset = this.tilemap.addTilesetImage(
      "ground-tileset",
      "ground-tileset",
      this.tileSize,
      this.tileSize
    ) as Phaser.Tilemaps.Tileset;

    if (!this.tileset) {
      console.error("Failed to create tileset");
      return;
    }

    // Create a blank layer for the diggable ground (initially all transparent/empty)
    this.groundLayer = this.tilemap.createBlankLayer(
      "ground",
      this.tileset,
      0,
      0,
      Math.ceil(this.mapWidth / this.tileSize),
      Math.ceil(this.mapHeight / this.tileSize)
    ) as Phaser.Tilemaps.TilemapLayer;

    // Initially, no tiles are placed (transparent, showing the grass background)
    // When player digs, we'll place dirt tiles

    // Make sure the ground layer is rendered above the background but below player
    this.groundLayer.setDepth(-1);

    // Create player with optional tint from MainMenu
    this.player = new Player(this, 400, 300);
    if (data?.dogTint) {
      this.player.setTint(data.dogTint);
    }

    // Add debug graphics to show hitbox
    this.debugGraphics = this.add.graphics().setAlpha(0.75);

    // Set up main camera
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.camera.startFollow(this.player);

    // Create minimap camera
    this.minimapCamera = this.cameras.add(10, 10, 200, 150, false, "minimap");
    this.minimapCamera.setZoom(0.1);
    this.minimapCamera.setBackgroundColor(0x002244);
    this.minimapCamera.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.minimapCamera.startFollow(this.player);
    this.minimapCamera.setScroll(100, 75); // Center on player

    // Create minimap graphics
    this.minimapGraphics = this.add.graphics();
    this.minimapGraphics.setScrollFactor(0);

    // Create power-ups group
    this.powerUps = this.physics.add.group({
      classType: PowerUp,
      runChildUpdate: true,
    });
    this.spawnPowerUps(10);

    // Create moles group
    this.moles = this.physics.add.group({
      runChildUpdate: true,
    });

    // Player-mole collision
    this.physics.add.overlap(
      this.player,
      this.moles,
      (playerObj, moleObj) => {
        const player = playerObj as Phaser.Physics.Arcade.Sprite;
        const mole = moleObj as Mole;

        // Check if we can take damage (cooldown)
        const now = this.time.now;
        if (now - this.lastDamageTime < this.damageCooldown) return;

        // Apply damage to player
        const currentHealth = this.data.get("health") || 100;
        const newHealth = Math.max(0, currentHealth - mole.getDamage());
        this.data.set("health", newHealth);
        this.lastDamageTime = now;

        // Visual feedback
        player.setTint(0xff0000);
        this.time.delayedCall(200, () => player.clearTint());

        // Camera shake
        this.cameras.main.shake(100, 0.01);

        // Check for game over
        if (newHealth <= 0) {
          this.gameOver();
        }
      },
      undefined,
      this
    );

    // Collide player with power-ups with type-safe callback
    this.physics.add.overlap(
      this.player,
      this.powerUps,
      (
        object1:
          | Phaser.Types.Physics.Arcade.GameObjectWithBody
          | Phaser.Tilemaps.Tile,
        object2:
          | Phaser.Types.Physics.Arcade.GameObjectWithBody
          | Phaser.Tilemaps.Tile
      ) => {
        // Skip if either object is a tile
        if (
          object1 instanceof Phaser.Tilemaps.Tile ||
          object2 instanceof Phaser.Tilemaps.Tile
        ) {
          return;
        }

        const player = object1 as Phaser.Physics.Arcade.Sprite;
        const powerUp = object2 as PowerUp;

        // Check if player has a body before proceeding
        if (!player.body) {
          return;
        }

        // Check if the item is currently "spawning" (immune to pickup)
        if (powerUp.getData("isSpawning")) {
          return;
        }

        // Now we can safely call collectPowerUp
        this.collectPowerUp(player, powerUp);
      },
      undefined,
      this
    );

    // Add WASD to the existing cursor keys
    if (this.input.keyboard) {
      this.input.keyboard.addKeys("W,A,S,D");
    }

    // Debug text to show controls
    this.add
      .text(10, 10, "WASD: Move\nSpace: Bark\nE: Dig", {
        font: "16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
      })
      .setScrollFactor(0);

    // Score display in top-right corner
    this.scoreText = this.add
      .text(this.cameras.main.width - 10, 10, "Score: 0", {
        font: "24px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    // In create(), after creating scoreText:
    this.highScore = parseInt(
      localStorage.getItem("dogRPGHighScore") || "0",
      10
    );
    this.highScoreText = this.add
      .text(this.cameras.main.width - 10, 50, `High Score: ${this.highScore}`, {
        fontSize: "18px",
        color: "#ffcc00",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    // Add debug text
    // this.debugText = this.add
    //   .text(10, 70, "", {
    //     font: "16px Arial",
    //     color: "#ffffff",
    //     backgroundColor: "#000000",
    //     padding: { x: 5, y: 2 },
    //   })
    //   .setScrollFactor(0);
  }

  digAtPlayerPosition(): void {
    if (!this.player || !this.groundLayer) {
      return;
    }

    // Get the direction the player is facing
    const direction = (this.player as any).getLastDirection
      ? (this.player as any).getLastDirection()
      : "down";

    // Calculate offset based on direction (small offset for front paws)
    const offsetDistance = this.tileSize * 0.35;
    let digX = this.player.x;
    let digY = this.player.y;

    // Offset the dig position based on direction
    switch (direction) {
      case "up":
        digY -= offsetDistance;
        break;
      case "down":
        digY += offsetDistance;
        break;
      case "left":
        digX -= offsetDistance;
        break;
      case "right":
        digX += offsetDistance;
        break;
    }

    // Get player's tile position at the offset location (front paws)
    const tileX = Math.floor(digX / this.tileSize);
    const tileY = Math.floor(digY / this.tileSize);

    // Check bounds
    if (
      tileX < 0 ||
      tileX >= this.groundLayer.width ||
      tileY < 0 ||
      tileY >= this.groundLayer.height
    ) {
      return;
    }

    // Get the current tile
    const currentTile = this.groundLayer.getTileAt(tileX, tileY);

    // Only dig if there is NO tile there yet (or if it's not already dirt/index 1)
    if (!currentTile || currentTile.index !== 1) {
      const tile = this.groundLayer.putTileAt(1, tileX, tileY);

      if (tile) {
        tile.tint = 0x8b4513;
        tile.setAlpha(0.8);

        // Award points for digging
        this.addScore(
          10,
          tile.pixelX + this.tileSize / 2,
          tile.pixelY + this.tileSize / 2
        );

        // --- 1. VISUAL JUICE: Camera Shake & Particles ---

        // Shake the camera (Intensity: 0.005, Duration: 50ms)
        this.camera.shake(50, 0.005);

        // Spawn dirt particles
        // We use the existing "particle" texture you used in collectPowerUp
        const emitter = this.add.particles(
          tile.getCenterX(),
          tile.getCenterY(),
          "particle",
          {
            lifespan: 600,
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            gravityY: 200, // Make them fall down
            tint: [0x8b4513, 0x5c4033, 0xa0522d], // Varying shades of brown
            quantity: 6,
            blendMode: "NORMAL",
          }
        );

        // Clean up the emitter after a short time
        this.time.delayedCall(600, () => emitter.destroy());

        // --- 2. GAMBLING: The Loot Table ---

        const roll = Phaser.Math.Between(1, 100);

        // 15% Chance: TRAP (Angry Mole)
        if (roll <= 20) {
          this.spawnAngryMole(tile.getCenterX(), tile.getCenterY());
        }
        // 10% Chance: PowerUp (Green)
        else if (roll <= 15) {
          this.spawnLoot(tile.getCenterX(), tile.getCenterY(), "powerup");
        }
        // 20% Chance: Bone/Treasure (White)
        else if (roll <= 35) {
          this.spawnLoot(tile.getCenterX(), tile.getCenterY(), "bone");
        }
        // Remaining 65%: Just dirt (No item)
      }
    }
  }

  // --- HELPER 1: Spawning Items ---
  private spawnLoot(x: number, y: number, type: string): void {
    // Add a small random offset so items don't stack perfectly
    const spawnX = x + Phaser.Math.Between(-5, 5);
    const spawnY = y + Phaser.Math.Between(-5, 5);

    const item = new PowerUp(this, spawnX, spawnY, "powerup");

    // Customize based on what we dug up
    if (type === "bone") {
      item.setTint(0xffffff); // White for bone
      // You can add logic here later to make this give score instead of health
    } else {
      item.setTint(0x00ff00); // Green for standard powerup
    }

    this.physics.add.existing(item);
    this.powerUps.add(item);

    // --- FIX: PREVENT INSTANT PICKUP ---

    // Set a flag that prevents the overlap function from working
    item.setData("isSpawning", true);

    // Give it a "Pop" velocity (Upwards and slightly random side-to-side)
    // This makes it look like it's flying out of the hole
    item.setVelocity(Phaser.Math.Between(-50, 50), -150);

    // After 600ms (0.6 seconds), remove the flag so it can be collected
    this.time.delayedCall(600, () => {
      item.setData("isSpawning", false);
    });
  }

  // --- HELPER 2: Spawning The Trap ---
  private spawnAngryMole(x: number, y: number): void {
    try {
      // Create a new mole enemy
      const mole = new Mole(this, x, y, this.player);
      this.moles.add(mole);

      // Add collision with player
      this.physics.add.collider(this.player, mole);

      // Add particle effect when mole appears (burst upward and outward)
      const emitter = this.add.particles(x, y, "particle", {
        speed: { min: 80, max: 150 },
        scale: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.NORMAL,
        lifespan: 800,
        quantity: 12,
        tint: [0x8b4513, 0x5c4033, 0xa0522d, 0x654321], // Varying shades of brown/dirt
        angle: { min: 250, max: 290 }, // Burst upward (270 is up)
        gravityY: 50, // Slight gravity to make them fall
      });

      // Clean up particles after they've finished
      this.time.delayedCall(800, () => {
        emitter.destroy();
      });

      console.log("Mole spawned at", x, y);
    } catch (error) {
      console.error("Error spawning mole:", error);
    }
  }

  private gameOver(): void {
    // Stop all game elements
    this.physics.pause();
    this.scene.pause();

    // Show game over text
    const gameOverText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "GAME OVER\nClick to restart",
        {
          font: "48px Arial",
          color: "#ff0000",
          align: "center",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: { x: 20, y: 10 },
        }
      )
      .setOrigin(0.5);

    // Make text clickable to restart
    gameOverText.setInteractive();
    gameOverText.on("pointerdown", () => {
      this.scene.restart();
    });

    // Also allow space/enter to restart
    if (this.input.keyboard) {
      this.input.keyboard.once("keydown", (event: KeyboardEvent) => {
        if (event.code === "Space" || event.code === "Enter") {
          this.scene.restart();
        }
      });
    }
  }

  // Also update the spawnPowerUps method to ensure physics is added:
  private spawnPowerUps(count: number): void {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(100, this.mapWidth - 100);
      const y = Phaser.Math.Between(100, this.mapHeight - 100);
      const powerUp = new PowerUp(this, x, y, "powerup");
      this.physics.add.existing(powerUp); // Add to physics world
      this.powerUps.add(powerUp);
    }
  }

  private collectPowerUp(
    _player: Phaser.Physics.Arcade.Sprite,
    powerUp: PowerUp
  ): void {
    // Award points for collecting power-up
    // Update the collectPowerUp call to pass position
    this.addScore(50, powerUp.x, powerUp.y - 20);

    // Destroy the power-up
    powerUp.destroy();

    // Create a particle emitter at the powerup's position
    const emitter = this.add.particles(0, 0, "particle", {
      x: powerUp.x,
      y: powerUp.y,
      speed: { min: -100, max: 100 },
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
      lifespan: 500,
      quantity: 10,
    });

    // Remove the emitter after particles are gone
    this.time.delayedCall(500, () => {
      emitter.destroy();
    });
  }

  public addScore(points: number, x?: number, y?: number): void {
    this.score += points;
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);

      // Check and update high score
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.highScoreText.setText(`High Score: ${this.highScore}`);
        localStorage.setItem("dogRPGHighScore", this.highScore.toString());

        // Visual feedback for new high score
        if (points > 0) {
          // Only show for positive score changes
          this.highScoreText.setColor("#00ff00");
          this.time.delayedCall(1000, () => {
            if (this.highScoreText) {
              this.highScoreText.setColor("#ffcc00");
            }
          });
        }
      }
    }

    // Create floating score text
    if (x !== undefined && y !== undefined) {
      const scoreText = this.add
        .text(x, y, `+${points}`, {
          fontSize: "16px",
          color: "#ffff00",
          fontFamily: "Arial",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5);

      // Animate the score text
      this.tweens.add({
        targets: scoreText,
        y: y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => scoreText.destroy(),
      });
    }
  }

  update(): void {
    // Update player
    if (this.player) {
      this.player.update();

      // Update stamina based on movement
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const velocity = body.velocity;
      const isMoving = velocity && (velocity.x !== 0 || velocity.y !== 0);

      if (isMoving) {
        this.stamina = Phaser.Math.Clamp(this.stamina - 0.5, 0, 100);
      } else {
        this.stamina = Phaser.Math.Clamp(this.stamina + 1, 0, 100);
      }

      // Update scene data for UI
      this.data.set("stamina", this.stamina);
      this.data.set("health", this.health);

      // Draw debug graphics
      if (this.debugGraphics) {
        this.debugGraphics.clear();

        // Draw a green box around the sprite (smaller, tighter fit)
        // Use about 60% of the display size to show the actual visible sprite area
        const boxWidth = this.player.displayWidth;
        const boxHeight = this.player.displayHeight;
        this.debugGraphics.lineStyle(2, 0x00ff00);
        this.debugGraphics.strokeRect(
          this.player.x - boxWidth / 2,
          this.player.y - boxHeight / 2,
          boxWidth,
          boxHeight
        );

        // Draw dig position (front paws)
        const direction = (this.player as any).getLastDirection
          ? (this.player as any).getLastDirection()
          : "down";
        const offsetDistance = this.tileSize * 0.35;
        let digX = this.player.x;
        let digY = this.player.y;

        switch (direction) {
          case "up":
            digY -= offsetDistance;
            break;
          case "down":
            digY += offsetDistance;
            break;
          case "left":
            digX -= offsetDistance;
            break;
          case "right":
            digX += offsetDistance;
            break;
        }

        // Draw dig position marker
        this.debugGraphics.lineStyle(2, 0xff0000);
        this.debugGraphics.strokeCircle(digX, digY, 5);
      }
    }

    // Update background position (parallax effect)
    if (this.background && this.camera) {
      this.background.tilePositionX = this.camera.scrollX;
      this.background.tilePositionY = this.camera.scrollY;
    }

    // Update minimap
    if (this.minimapGraphics) {
      this.minimapGraphics.clear();

      // Draw player on minimap
      this.minimapGraphics.fillStyle(0x00ff00, 1);
      const playerPos = this.minimapCamera.getWorldPoint(
        this.player.x,
        this.player.y
      );
      this.minimapGraphics.fillRect(playerPos.x - 3, playerPos.y - 3, 6, 6);

      // Draw power-ups on minimap
      this.powerUps
        .getChildren()
        .forEach((powerUp: Phaser.GameObjects.GameObject) => {
          if (powerUp instanceof PowerUp) {
            const powerUpPos = this.minimapCamera.getWorldPoint(
              powerUp.x,
              powerUp.y
            );
            this.minimapGraphics.fillStyle(0xffffff, 1);
            this.minimapGraphics.fillRect(
              powerUpPos.x - 2,
              powerUpPos.y - 2,
              4,
              4
            );
          }
        });
    }
  }
}
