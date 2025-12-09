import "phaser";
import MainMenu from "./scenes/MainMenu";
import PreloaderScene from "./scenes/PreloaderScene";
import GameScene from "./scenes/GameScene";
import UIScene from "./scenes/UIScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloaderScene, MainMenu, GameScene, UIScene],
};

new Phaser.Game(config);
