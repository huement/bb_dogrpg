# DogRPG - A "Vibe Coded" Phaser 3 Project

![DogRPG Banner](https://img.shields.io/badge/Status-Prototype-orange) ![License](https://img.shields.io/badge/License-MIT-blue)

A 2D Retro Dog RPG built using **Phaser 3**, **TypeScript**, and **Vite**. This project was created primarily using the **Windsurf IDE** (and a little help from Cursor) to demonstrate the concept of "Vibe Coding" as a rapid prototyping tool.

Watch the full build video here: **[LINK TO YOUR YOUTUBE VIDEO]**

## 🎮 About the Project

This game serves as a demo for how AI-assisted development ("Vibe Coding") acts as the "3D Printer of Software Development." It's not about producing perfect production code instantly; it's about rapidly printing a prototype that you can sand and finish later.

### Features
* **Player Movement:** WASD movement with retro directional animations.
* **Actions:**
    * **Bark (Space):** Scares away/kills enemies and interacts with objects.
    * **Dig (E):** Changes tile textures and randomly spawns items or enemies.
* **Systems:**
    * Dynamic Health & Stamina bars.
    * Minimap overlay.
    * High Score tracking.
    * Enemy AI (Angry Moles).

## 🛠️ Tech Stack

* [Phaser 3](https://phaser.io/) - A fast, free, and fun open-source HTML5 game framework.
* [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling.
* [TypeScript](https://www.typescriptlang.org/) - For type-safe code and better "sanding."

## 🚀 Getting Started

To run this project locally:

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/DogRPG.git](https://github.com/YOUR_USERNAME/DogRPG.git)
    cd DogRPG
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the dev server:**
    ```bash
    npm run dev
    ```

4.  Open the local link provided in the terminal (usually `http://localhost:5173`).

## 🧠 Key Learnings (The "Vibe Coding" Philosophy)

This project highlights a few key lessons from the AI-assisted build process:

1.  **Sprites are Hard:** AI struggles with sprite sheet slicing. Always dynamically calculate frame dimensions (`width / cols`) rather than hardcoding numbers.
2.  **Asset Loading:** Ensure textures are fully loaded before generating animations to avoid black screen errors.
3.  **The "Sanding" Phase:** AI can "print" the logic (collisions, movement, UI), but you still need to refine the "layer lines" (game feel, texture sizing, and edge cases).

## 🔗 Connect

For more articles, code breakdowns, and thoughts on AI development:
👉 **[Huement.com/blog](https://huement.com/blog)**

---

*Star this repo if you found the video helpful!*