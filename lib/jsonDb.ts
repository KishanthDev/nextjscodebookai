import fs from "fs";

export function loadJson(file: string) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

export function saveJson(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function isJsonBot(botId: string, BOTS_PATH: string) {
  const bots = loadJson(BOTS_PATH);
  return bots.some((b: any) => b._id === botId);
}
