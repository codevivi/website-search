"use strict";
import express from "express";
import { engine } from "express-handlebars";
import { getUsers, getSites, saveSite } from "./src/db.js";
import { protectRoute } from "./src/middleware/protectRoute.js";
import session from "express-session";

const app = express();

app.use(
  session({
    secret: "secret string have it in env vars",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.get("/", (req, res) => {
  res.render("search", { isLoggedIn: req.session.isLoggedIn, message: req.session.message, matchedSites: req.session.matchedSites });
  delete req.session.matchedSites;
  delete req.session.message;
});

app.post("/search", async (req, res) => {
  let search = req.body.search.toLowerCase().trim();
  console.log(search, "search");
  if (!search) {
    req.session.message = "Empty search field";
    return res.redirect("/");
  }
  const sites = await getSites();
  let matchedIdexes = [];
  for (let i = 0; i < sites.length; i++) {
    let site = sites[i];
    console.log(site);
    if (site.name.includes(search)) {
      matchedIdexes.push(i);
      continue;
    }
    if (site.desc.includes(search)) {
      matchedIdexes.push(i);
      continue;
    }
  }
  if (matchedIdexes.length === 0) {
    req.session.message = "Nothing found";
    return res.redirect("/");
  }
  const matchedSites = matchedIdexes.map((ind) => sites[ind]);
  req.session.matchedSites = matchedSites;
  res.redirect("/");
});

app.get("/add-site", protectRoute, (req, res) => {
  res.render("add-site", { isLoggedIn: req.session.isLoggedIn, message: req.session.message });
  delete req.session.message;
});

app.post("/add-site", protectRoute, (req, res) => {
  saveSite(req.body);
  res.redirect("/add-site");
});

app.get("/login", (req, res) => {
  res.render("login", { isLoggedIn: req.session.isLoggedIn, message: req.session.message });
  delete req.session.message;
});

app.post("/login", async (req, res) => {
  let dbUsers = await getUsers();
  let found = dbUsers.find((dbUser) => {
    return req.body.password === dbUser.password && req.body.email === dbUser.email;
  });
  if (found) {
    req.session.isLoggedIn = true;
    req.session.userName = found.name;
    req.session.user = { name: found.name, email: found.email };
    res.redirect("/add-site");
  } else {
    req.session.message = "Wrong login details";
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("server on port 3000");
});
