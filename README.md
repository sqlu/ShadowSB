# ShadowSB

![Language](https://img.shields.io/badge/TypeScript-5.7%2B-blue)
![Discord.js](https://img.shields.io/badge/discord.js-v14.17-green)

## 🚀 Introduction

A powerful and feature-rich Discord selfbot designed for slash command support. Built using **TypeScript**, **discord.js**, and **discord.js-selfbot-v13**, this selfbot is perfect for power users who want to automate tasks and enhance their Discord experience.

> **⚠️ Note:** Selfbots violate Discord's Terms of Service. Use this tool responsibly and at your own risk.

---

## ✨ Features

- **Full Slash Command Integration**: Execute powerful and customizable commands with ease.
- **High Performance**: Optimized for speed and reliability.
- **Customizable**: Easy to modify and expand with new commands.
- **Modern Tech Stack**: Written in TypeScript, powered by discord.js and discord.js-selfbot-v13.
- **Rich Documentation**: Code is clean and well-documented for easy understanding.

---

## 📋 Requirements

- Node.js v16.6.0 or higher
- npm or yarn
- A Discord bot
- Basic knowledge of JavaScript/TypeScript

---

## 🛠️ Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/uhq/shadowsb.git
   cd zsb
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   # or
   bun install # recommended
   ```

3. Set up your environment variables:

   Edit the `.env.exemple` file in the root directory and your config needs:

4. Start the selfbot:

   ```bash
   npm run start
   # or
   pnpm start
   # or
   yarn start
   # or
   bun start
   ```

---

## 📖 Usage

- Use `/` commands in Discord to execute the selfbot’s features.
- Add new commands by editing the `src/master/commands` directory.

---

## 📂 Project Structure

```
.
├── prisma              # Prisma ORM setup
├── src
│   ├── interaction
│   │   ├── events          # Manage users and client events
│   │   ├── commands        # Manage command interactions
│   ├── structure
│   │   ├── fonctions       # Core functions for the bot
│   │   ├── handler         # Command and event handlers
│   │   ├── util            # Utility functions
│   │   ├── index.ts        # Bot initialization logic
│   └── main.ts           # Main entry point for the bot
├── .env                # Environment variables
├── package.json        # Node.js dependencies
└── tsconfig.json       # TypeScript configuration
```

---
## ⚠️ Disclaimer

This project is for educational purposes only. Selfbots are against Discord’s Terms of Service, and using them may result in your account being banned. Use this software at your own risk.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🌟 Acknowledgments

- [discord.js](https://discord.js.org/)
- [discord.js-selfbot-v13](https://github.com/aiko-chan-ai/discord.js-selfbot-v13)

---

## 📞 Contact

If you have any questions, feel free to reach out:

- GitHub: [111tokyo](https://github.com/111tokyo), [Snayzou](https://github.com/sqlu)
- Discord: `111tokyo`, `early.lover`
