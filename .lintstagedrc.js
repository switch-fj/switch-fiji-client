const path = require("path");

const APPS = ["finance", "client", "engineer"];
const ROOT = __dirname;

const q = (f) => `"${f}"`;

function eslintForFiles(files) {
  // Group files by their app so each uses the right local eslint binary
  const byApp = {};

  for (const file of files) {
    const app = APPS.find((a) => file.includes(`/apps/${a}/`));
    if (app) {
      (byApp[app] = byApp[app] ?? []).push(file);
    }
  }

  return Object.entries(byApp).map(([app, appFiles]) => {
    const appDir = path.join(ROOT, "apps", app);
    const bin = path.join(appDir, "node_modules/.bin/eslint");
    return `cd ${q(appDir)} && ${q(bin)} --fix ${appFiles.map(q).join(" ")}`;
  });
}

module.exports = {
  "*.{ts,tsx}": (files) => [
    ...eslintForFiles(files),
    `prettier --write ${files.map(q).join(" ")}`,
  ],
  "*.{json,md}": (files) => `prettier --write ${files.map(q).join(" ")}`,
};
