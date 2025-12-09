import "phaser";

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super("PreloaderScene");
  }

  preload() {
    // Show loading progress
    const progress = this.add.graphics();
    const loadingText = this.add
      .text(400, 250, "Loading...", {
        font: "24px Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    this.load.on("progress", (value: number) => {
      progress.clear();
      progress.fillStyle(0xffffff, 1);
      progress.fillRect(
        20,
        this.cameras.main.height - 30,
        (this.cameras.main.width - 40) * value,
        10
      );
    });

    // Add error handling for failed loads
    this.load.on("loaderror", (file: any) => {
      console.error("Failed to load:", file.key);
      if (file.key === "dog") {
        console.error("Dog spritesheet failed to load!");
        // Show error on screen
        this.add
          .text(400, 300, "ERROR: Failed to load dog spritesheet!", {
            font: "24px Arial",
            color: "#ff0000",
          })
          .setOrigin(0.5, 0.5);
      }
    });

    // Load grass texture
    this.load.image("grass", "/assets/grass.png");

    // Load the dog spritesheet image first to get dimensions
    this.load.image("dog-image", "/assets/spritesheet.png");

    this.load.image("powerup", "assets/powerup.png");

    // Create a simple white pixel for particles
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture("particle", 4, 4);

    // Create a simple mole sprite
    const moleSize = 24;
    const moleTexture = this.textures.createCanvas("mole", moleSize, moleSize);
    const ctx = moleTexture.getContext();

    // Draw a simple mole (brown circle with eyes)
    ctx.fillStyle = "#8B4513"; // Brown
    ctx.beginPath();
    ctx.arc(moleSize / 2, moleSize / 2, moleSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = "#000";
    ctx.fillRect(moleSize / 3, moleSize / 3, 4, 4);
    ctx.fillRect((moleSize / 3) * 2, moleSize / 3, 4, 4);

    // Draw angry eyebrows
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(moleSize / 4, moleSize / 4);
    ctx.lineTo(moleSize / 2, moleSize / 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((moleSize / 4) * 3, moleSize / 4);
    ctx.lineTo(moleSize / 2, moleSize / 3);
    ctx.stroke();

    // Refresh the texture
    moleTexture.refresh();
    graphics.destroy();

    this.load.on("complete", () => {
      console.log("All assets loaded, starting game...");
      progress.destroy();
      loadingText.destroy();
    });
  }

  create() {
    // Create a simple tileset with two colors (green and brown)
    const tileSize = 32;
    const tileColors = [0x00aa00, 0x8b4513]; // Green and brown

    // Create a canvas for the tileset
    const canvas = document.createElement("canvas");
    canvas.width = tileSize * tileColors.length;
    canvas.height = tileSize;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Draw each tile with a different color
      tileColors.forEach((color, index) => {
        ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
        ctx.fillRect(index * tileSize, 0, tileSize, tileSize);
      });

      // Add the tileset to the texture manager
      this.textures.addCanvas("tileset", canvas);
    } else {
      console.error(
        "Could not create tileset: Canvas 2D context not available"
      );
    }

    // Get the loaded image to calculate frame dimensions
    if (!this.textures.exists("dog-image")) {
      console.error("Dog image not found in PreloaderScene create()!");
      this.add
        .text(400, 300, "ERROR: Dog image not loaded!", {
          font: "24px Arial",
          color: "#ff0000",
        })
        .setOrigin(0.5, 0.5);
      return;
    }

    const imageTexture = this.textures.get("dog-image");
    const source = imageTexture.getSourceImage() as HTMLImageElement;

    // Calculate frame dimensions: 4 columns, 6 rows
    const frameWidth = Math.floor(source.width / 4);
    const frameHeight = Math.floor(source.height / 6);

    console.log("Spritesheet dimensions:", {
      imageWidth: source.width,
      imageHeight: source.height,
      frameWidth,
      frameHeight,
    });

    // Remove the temporary image texture
    this.textures.remove("dog-image");

    // Use the loader to load the spritesheet with correct dimensions
    // We need to reload it, so we'll use a callback approach
    this.load.spritesheet("dog", "/assets/spritesheet.png", {
      frameWidth: frameWidth,
      frameHeight: frameHeight,
    });

    // Start loading and wait for it to complete
    this.load.once("complete", () => {
      // Verify the spritesheet was created
      if (!this.textures.exists("dog")) {
        console.error("Failed to create dog spritesheet!");
        this.add
          .text(400, 300, "ERROR: Failed to create spritesheet!", {
            font: "24px Arial",
            color: "#ff0000",
          })
          .setOrigin(0.5, 0.5);
        return;
      }

      // Log texture info for debugging
      // const texture = this.textures.get("dog");
      // const frameNames = texture.getFrameNames();
      // const firstFrameName = frameNames[0];
      // // Access frames collection - Phaser stores frames as an object keyed by frame name/index
      // const frames = texture.frames as Record<
      //   string | number,
      //   Phaser.Textures.Frame
      // >;
      // const firstFrameData = firstFrameName ? frames[firstFrameName] : null;

      // console.log("PreloaderScene - Texture info:", {
      //   key: texture.key,
      //   width: source.width,
      //   height: source.height,
      //   frameCount: texture.frameTotal,
      //   frameSize: firstFrameData
      //     ? {
      //         width: firstFrameData.width,
      //         height: firstFrameData.height,
      //       }
      //     : { width: frameWidth, height: frameHeight },
      // });

      // Start the game scene
      this.scene.start("GameScene");
    });

    // Start the loader
    this.load.start();
  }
}
