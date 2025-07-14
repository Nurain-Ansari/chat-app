Here’s a complete **`README.md`** and **`.vscode/settings.json`** setup for your Express + TypeScript + ESLint + Prettier project using **ESLint Flat Config** (`eslint.config.mjs`).

---

## ✅ `README.md`

```markdown
# Event Backend

This is a backend setup for an event registration form using Express, TypeScript, ESLint (with flat config), and Prettier.

---

## 🔧 Tech Stack

- [x] Node.js + Express
- [x] TypeScript
- [x] ESLint (Flat Config – ESLint v9+)
- [x] Prettier
- [x] ts-node-dev (for live development)

---

## 📁 Project Structure
```

event-backend/
│
├── src/
│ ├── routes/
│ ├── controllers/
│ ├── server.ts
│ └── app.ts
│
├── .vscode/
│ └── settings.json
├── eslint.config.mjs
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md

````

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
````

### 2. Run Dev Server

```bash
npm run dev
```

### 3. Lint the Code

```bash
npm run lint
```

### 4. Format with Prettier

```bash
npm run format
```

---

## ✅ VS Code Setup

To ensure ESLint + Prettier works correctly in **VS Code**, update `.vscode/settings.json` like this:

```json
{
  "eslint.experimental.useFlatConfig": true,
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "eslint.validate": ["typescript"],
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

> 💡 Make sure you have the following VS Code extensions installed:
>
> - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
> - [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---

## 📦 Scripts

```json
"scripts": {
  "dev": "ts-node-dev --respawn src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "lint": "eslint . --ext .ts",
  "format": "prettier --write ."
}
```

---

## 🌐 License

This project is open-source and free to use.

````

---

## 📁 `.vscode/settings.json`

```json
{
  "eslint.experimental.useFlatConfig": true,
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "eslint.validate": ["typescript"],
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
````

---
