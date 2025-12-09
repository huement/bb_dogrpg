import "phaser";

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private background: Phaser.GameObjects.Graphics;
  private floatTween: Phaser.Tweens.Tween | null = null; // Can be null now

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setDrag(50);
    body.setCollideWorldBounds(true);

    // Visual setup
    this.setScale(0.5);
    this.setName("powerup");
    this.setDisplaySize(32, 32);

    // Background setup
    this.background = scene.add.graphics();
    this.background.fillStyle(0x4a90e2, 0.8);
    const bgSize = 40;
    this.background.fillRoundedRect(
      -bgSize / 2,
      -bgSize / 2,
      bgSize,
      bgSize,
      8
    );
    this.scene.add.existing(this.background);
    this.background.setPosition(x, y);
    this.background.setDepth(-1);

    // --- CHANGE 1: START FLOATING VIA HELPER ---
    this.startFloating();

    // Rotation animation (this one is fine to keep running)
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: "linear",
    });
  }

  // --- CHANGE 2: NEW HELPER FUNCTION ---
  // We use this to start a fresh animation relative to WHEREVER we are now
  private startFloating(): void {
    // Safety check: if a tween already exists, stop it first
    if (this.floatTween) {
      this.floatTween.stop();
    }

    this.floatTween = this.scene.tweens.add({
      targets: [this, this.background],
      y: "+=10", // Move 10 pixels down from CURRENT position
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "sine.inout",
    });
  }

  setPosition(x?: number, y?: number, z?: number, w?: number): this {
    super.setPosition(x, y, z, w);
    if (this.background && x !== undefined && y !== undefined) {
      this.background.setPosition(x, y);
    }
    return this;
  }

  public runAwayFrom(
    player: Phaser.Physics.Arcade.Sprite,
    speed: number = 100
  ): void {
    if (!this.body) return;

    // --- CHANGE 3: DESTROY THE OLD TWEEN ---
    // Instead of pausing, we completely stop/remove the tween so it forgets the old position
    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = null;
    }

    // Physics movement logic
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed;
      this.setVelocity(vx, vy);
    }

    this.setData("scared", true);

    this.scene.time.delayedCall(1000, () => {
      // Check if the powerup still exists and has a body before accessing it
      if (!this.body || !this.active) {
        return;
      }

      this.setData("scared", false);
      this.setVelocity(0, 0);

      // --- CHANGE 4: RESTART FLOATING AT NEW SPOT ---
      // Now that we have stopped at a new position, start a fresh tween here
      this.startFloating();
    });
  }

  destroy(fromScene?: boolean): void {
    if (this.background) {
      this.background.destroy();
    }
    // Clean up tween if it exists
    if (this.floatTween) {
      this.floatTween.stop();
    }
    super.destroy(fromScene);
  }
}
