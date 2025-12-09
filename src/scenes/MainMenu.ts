import "phaser";

export default class MainMenu extends Phaser.Scene {
  private dogTints: number[] = [0xffffff, 0x8b4513, 0x808080, 0xffd700]; // White, Brown, Gray, Gold
  private currentTintIndex: number = 0;
  private dogSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: "MainMenu" });
  }

  create() {
    // Add title
    this.add
      .text(this.cameras.main.width / 2, 100, "DOG RPG", {
        font: "48px Arial",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Add subtitle
    this.add
      .text(this.cameras.main.width / 2, 160, "Select Your Dog", {
        font: "24px Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Add dog sprite
    this.dogSprite = this.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "dog"
    );
    this.dogSprite.setScale(2);
    this.dogSprite.setTint(this.dogTints[this.currentTintIndex]);

    // Add clickable text to change dog color
    const changeColorText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 100,
        "Change Color",
        {
          font: "20px Arial",
          color: "#ffff00",
          backgroundColor: "#333333",
          padding: { x: 10, y: 5 },
        }
      )
      .setOrigin(0.5)
      .setInteractive();

    // Add start game button
    const startButton = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 100,
        "Start Game",
        {
          font: "24px Arial",
          color: "#ffffff",
          backgroundColor: "#4CAF50",
          padding: { x: 20, y: 10 },
        }
      )
      .setOrigin(0.5)
      .setInteractive();

    // Add interactivity
    changeColorText.on("pointerdown", () => {
      this.currentTintIndex =
        (this.currentTintIndex + 1) % this.dogTints.length;
      this.dogSprite.setTint(this.dogTints[this.currentTintIndex]);
    });

    startButton.on("pointerdown", () => {
      this.scene.start("GameScene", {
        dogTint: this.dogTints[this.currentTintIndex],
      });
    });

    // Add hover effects
    [changeColorText, startButton].forEach((button) => {
      button.on("pointerover", () => {
        button.setScale(1.1);
        this.game.canvas.style.cursor = "pointer";
      });

      button.on("pointerout", () => {
        button.setScale(1);
        this.game.canvas.style.cursor = "default";
      });
    });
  }
}
