import "phaser";
import GameScene from "../scenes/GameScene";

export default class Mole extends Phaser.Physics.Arcade.Sprite {
  private health: number = 3;
  private damage: number = 10;
  private isActive: boolean = true;
  private hitCooldown: boolean = false;
  private burrowTimer: Phaser.Time.TimerEvent | null = null;
  private moveSpeed: number = 80;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private target: Phaser.Physics.Arcade.Sprite
  ) {
    super(scene, x, y, "mole");

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 20);
    body.setOffset(2, 2);
    body.setCollideWorldBounds(true);
    body.setBounce(0.5);

    // Set scale for better visibility
    this.setScale(1.5);

    // Add a simple tween for visual feedback
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      repeat: -1,
    });

    // Set up burrow timer (disappear after 5 seconds)
    this.burrowTimer = scene.time.delayedCall(5000, () => this.burrow());
  }

  update(): void {
    if (!this.isActive || !this.body) return;

    // Move towards player
    if (this.scene && this.target) {
      this.scene.physics.moveToObject(this, this.target, this.moveSpeed);

      // Update facing direction
      if (this.body.velocity.x !== 0) {
        this.flipX = this.body.velocity.x > 0;
      }
    }
  }

  public takeDamage(amount: number): void {
    if (this.hitCooldown || !this.isActive) return;

    this.health -= amount;
    this.hitCooldown = true;

    // Flash white to show damage
    this.setTint(0xff0000);

    // Show damage text
    const damageText = this.scene.add
      .text(this.x, this.y - 30, "BARK!", {
        fontSize: "16px",
        color: "#ff0000",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Animate damage text
    this.scene.tweens.add({
      targets: damageText,
      y: this.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy(),
    });

    // Reset tint after delay
    this.scene.time.delayedCall(100, () => {
      if (this.isActive) {
        this.clearTint();
        this.hitCooldown = false;
      }
    });

    // Check if mole is dead
    if (this.health <= 0) {
      this.die();
    }
  }

  public getDamage(): number {
    return this.damage;
  }

  private die(): void {
    if (!this.isActive) return;
    this.isActive = false;

    // Award points for killing mole
    const gameScene = this.scene as GameScene;
    if (gameScene && gameScene.addScore) {
      gameScene.addScore(100, this.x, this.y - 20);
    }

    // Play death particles
    const emitter = this.scene.add.particles(this.x, this.y, "particle", {
      speed: { min: -150, max: 150 },
      scale: { start: 1.5, end: 0 },
      blendMode: Phaser.BlendModes.NORMAL,
      lifespan: 600,
      quantity: 15,
      tint: [0x8b4513, 0x5c4033, 0xa0522d], // Varying shades of brown/dirt
      gravityY: 100, // Make particles fall
    });

    // Destroy after animation
    this.scene.time.delayedCall(600, () => {
      emitter.destroy();
      this.destroy();
    });
  }

  private burrow(): void {
    if (!this.isActive) return;
    this.isActive = false;

    this.play("mole-burrow");
    this.scene.time.delayedCall(400, () => {
      this.destroy();
    });
  }

  destroy(fromScene?: boolean): void {
    if (this.burrowTimer) {
      this.burrowTimer.destroy();
    }
    super.destroy(fromScene);
  }
}
