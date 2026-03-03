const fs = require("fs");
const path = require("path");

const pkgPath = path.resolve(__dirname, "../package.json");
const appJsonPath = path.resolve(__dirname, "../app.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

const version = pkg.version;

appJson.expo.version = version;
appJson.expo.ios.buildNumber = version;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n");

console.log(`Synced app.json version to ${version}`);
