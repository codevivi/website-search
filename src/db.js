import { writeFile, mkdir, readFile } from "node:fs/promises";
const DB_PATH = new URL("./../database/", import.meta.url).pathname;
const DB_NAME = "database.json";
const DB = DB_PATH + "/" + DB_NAME;
const DEFAULT_DATA = { sites: [], users: [{ name: "admin", email: "admin@admin.com", password: "1234" }] };

export const saveSite = async function (site) {
  let data = await getData();
  data.sites.push(site);
  await resaveData(data);
};

export const getSites = async function () {
  let data = await getData();
  return data.sites;
};
export const getUsers = async function () {
  let data = await getData();
  return data.users;
};
async function getData() {
  try {
    let data = await readFile(DB, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return DEFAULT_DATA; //if file empty or not created
  }
}
async function writeData(data) {
  await mkdir(DB_PATH, { recursive: true });
  await writeFile(DB, data);
}
async function resaveData(data) {
  return await writeData(JSON.stringify(data));
}
