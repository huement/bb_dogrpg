import "phaser";
// At the top of Player.ts
import PowerUp from "./PowerUp";
import GameScene from "../scenes/GameScene";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private lastDirection: string = "down";
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private wKey!: Phaser.Input.Keyboard.Key;
  private aKey!: Phaser.Input.Keyboard.Key;
  private sKey!: Phaser.Input.Keyboard.Key;
  private dKey!: Phaser.Input.Keyboard.Key;
  private barkText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "dog");

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // DEPTH: Higher number means "draw on top of the grass"
    this.setDepth(10);

    // VISUALS: Scale up the tiny pixel art
    this.setScale(1); // Adjust this if he looks too big/small
    this.setCollideWorldBounds(true);

    // --- HITBOX TUNING (The "Feet-Only" Fix) ---
    // Assuming your frames are roughly 32x32
    // We make the box short (height: 8) and move it to the bottom (offset Y: 24)
    // This lets the dog's head overlap walls!
    this.setSize(20, 12);
    //this.setOffset(8, 22);

    // Initialize inputs and animations
    this.initInput();
    this.initAnimations();

    // Create bark text (hidden)
    this.barkText = scene.add
      .text(0, 0, "Woof!", {
        fontSize: "16px", // 24px might be too big for retro style
        fontFamily: "monospace",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 4, y: 2 },
      })
      .setVisible(false)
      .setDepth(11); // Ensure text is above player
  }

  // ... (Keep your initAnimations, initInput, handleMovement, handleActions exactly as they are) ...

  public update(): void {
    // 1. Handle Movement & Input
    this.handleMovement();

    // 2. Handle Actions (Dig/Bark)
    this.handleActions();

    // 3. Update UI Elements
    // Move the "Woof" bubble to follow the dog's head
    if (this.barkText && this.barkText.visible) {
      this.barkText.setPosition(this.x - this.barkText.width / 2, this.y - 40);
    }

    // NOTE: Console logs removed to prevent game lag
  }

  private initAnimations(): void {
    const anims = this.scene.anims;

    // Create walk animations
    anims.create({
      key: "walk-up",
      frames: anims.generateFrameNumbers("dog", {
        frames: [0, 4, 8, 12, 16, 20],
      }),
      frameRate: 10,
      repeat: -1,
    });

    anims.create({
      key: "walk-right",
      frames: anims.generateFrameNumbers("dog", {
        frames: [1, 5, 9, 13, 17, 21],
      }),
      frameRate: 10,
      repeat: -1,
    });

    anims.create({
      key: "walk-down",
      frames: anims.generateFrameNumbers("dog", {
        frames: [2, 6, 10, 14, 18, 22],
      }),
      frameRate: 10,
      repeat: -1,
    });

    anims.create({
      key: "walk-left",
      frames: anims.generateFrameNumbers("dog", {
        frames: [3, 7, 11, 15, 19, 23],
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Create idle animations (single frame of each direction)
    anims.create({
      key: "idle-up",
      frames: [{ key: "dog", frame: 0 }],
      frameRate: 10,
    });

    anims.create({
      key: "idle-right",
      frames: [{ key: "dog", frame: 1 }],
      frameRate: 10,
    });

    anims.create({
      key: "idle-down",
      frames: [{ key: "dog", frame: 2 }],
      frameRate: 10,
    });

    anims.create({
      key: "idle-left",
      frames: [{ key: "dog", frame: 3 }],
      frameRate: 10,
    });
  }

  private initInput() {
    // Get keyboard input
    const scene = this.scene;
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.spaceKey = scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

      // Add WASD keys
      this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }
  }

  private handleMovement(): void {
    const speed = 180;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (!body) {
      console.error("Physics body not available");
      return;
    }

    // Log frame information
    // if (this.anims.currentAnim) {
    //   console.log("Current animation:", {
    //     key: this.anims.currentAnim.key,
    //     frame: this.anims.currentFrame,
    //     isPlaying: this.anims.isPlaying,
    //     progress: this.anims.getProgress(),
    //   });
    // }

    // Log input states
    const inputState = {
      left: this.cursors.left?.isDown || this.aKey?.isDown,
      right: this.cursors.right?.isDown || this.dKey?.isDown,
      up: this.cursors.up?.isDown || this.wKey?.isDown,
      down: this.cursors.down?.isDown || this.sKey?.isDown,
      velocity: { x: body.velocity.x, y: body.velocity.y },
    };

    //console.log("Input State:", inputState);

    // Reset velocity
    body.setVelocity(0);

    // Handle horizontal movement
    if (inputState.left) {
      body.setVelocityX(-speed);
      this.lastDirection = "left";
      this.anims.play("walk-left", true);
      console.log("Moving left");
    } else if (inputState.right) {
      body.setVelocityX(speed);
      this.lastDirection = "right";
      this.anims.play("walk-right", true);
      console.log("Moving right");
    }

    // Handle vertical movement
    if (inputState.up) {
      body.setVelocityY(-speed);
      this.lastDirection = "up";
      this.anims.play("walk-up", true);
      console.log("Moving up");
    } else if (inputState.down) {
      body.setVelocityY(speed);
      this.lastDirection = "down";
      this.anims.play("walk-down", true);
      console.log("Moving down");
    }

    // Normalize diagonal movement
    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.velocity.normalize().scale(speed);
    }

    // Play idle animation when not moving
    if (body.velocity.x === 0 && body.velocity.y === 0) {
      const animKey = `walk-${this.lastDirection}`.replace("walk-", "idle-");
      this.anims.play(animKey, true);
      //  console.log("Idle animation:", animKey);
    }
  }

  private handleActions(): void {
    // Handle bark
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // Show bark text
      if (this.barkText) {
        this.barkText.setPosition(this.x, this.y - 40);
        this.barkText.setVisible(true);
        this.barkText.setAlpha(1);

        this.scene.tweens.add({
          targets: this.barkText,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            if (this.barkText) this.barkText.setVisible(false);
          },
        });
      }

      // Trigger the bark effect on power-ups
      this.handleBark();
    }

    // Handle dig
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      // Call the dig method on the GameScene
      const gameScene = this.scene as any;
      if (gameScene.digAtPlayerPosition) {
        gameScene.digAtPlayerPosition();
      }
    }
  }

  // In Player.ts, update the handleBark method
  public handleBark(): void {
    // Show bark text if it doesn't exist
    if (!this.barkText) {
      this.barkText = this.scene.add
        .text(this.x, this.y - 40, "BARK!", {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      // Remove the text after a delay
      this.scene.time.delayedCall(500, () => {
        if (this.barkText) {
          this.barkText.destroy();
          this.barkText = undefined;
        }
      });
    }

    const barkRange = 180; // Slightly larger range for hitting moles

    // Scare away powerups
    const powerups = this.scene.children.list.filter(
      (child) => child instanceof PowerUp
    ) as PowerUp[];

    powerups.forEach((powerup) => {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        powerup.x,
        powerup.y
      );

      if (distance <= barkRange && !powerup.getData("scared")) {
        powerup.runAwayFrom(this);
        // Award points for scaring power-up
        const gameScene = this.scene as GameScene;
        if (gameScene && gameScene.addScore) {
          gameScene.addScore(20, powerup.x, powerup.y - 20);
        }
      }
    });

    // Damage nearby moles
    const gameScene = this.scene as GameScene;
    if (gameScene.moles) {
      gameScene.moles.getChildren().forEach((mole: any) => {
        if (mole.takeDamage && mole.active) {
          const distance = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            mole.x,
            mole.y
          );

          if (distance <= barkRange * 1.2) {
            // Slightly larger range for moles
            mole.takeDamage(1); // Deal 1 damage (moles have 3 health)
          }
        }
      });
    }
  }

  public getLastDirection(): string {
    return this.lastDirection;
  }
}
