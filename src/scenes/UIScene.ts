import "phaser";

export default class UIScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private staminaText!: Phaser.GameObjects.Text;
  private gameScene!: Phaser.Scene;

  constructor() {
    super({ key: "UI" });
  }

  create() {
    // Get reference to GameScene
    this.gameScene = this.scene.get("GameScene");

    // Create health bar
    this.healthBar = this.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(10, 10, 200, 20);

    // Create health text
    this.healthText = this.add.text(15, 12, "Health: 100%", {
      font: "12px Arial",
      color: "#000000",
    });

    // Create stamina bar
    this.staminaBar = this.add.graphics();
    this.staminaBar.fillStyle(0x0000ff, 1);
    this.staminaBar.fillRect(10, 40, 200, 20);

    // Create stamina text
    this.staminaText = this.add.text(15, 42, "Stamina: 100%", {
      font: "12px Arial",
      color: "#ffffff",
    });
  }

  update() {
    // Update health and stamina from GameScene's player
    if (this.gameScene && this.gameScene.data) {
      const health = this.gameScene.data.get("health") || 100;
      const stamina = this.gameScene.data.get("stamina") || 100;

      // Update health bar
      this.healthBar.clear();
      this.healthBar.fillStyle(0x333333, 1);
      this.healthBar.fillRect(10, 10, 200, 20);
      this.healthBar.fillStyle(0x00ff00, 1);
      this.healthBar.fillRect(10, 10, 200 * (health / 100), 20);
      this.healthText.setText(`Health: ${Math.round(health)}%`);

      // Update stamina bar
      this.staminaBar.clear();
      this.staminaBar.fillStyle(0x333333, 1);
      this.staminaBar.fillRect(10, 40, 200, 20);
      this.staminaBar.fillStyle(0x0000ff, 1);
      this.staminaBar.fillRect(10, 40, 200 * (stamina / 100), 20);
      this.staminaText.setText(`Stamina: ${Math.round(stamina)}%`);
    }
  }
}
