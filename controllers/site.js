const Search = require("../models/Search");
const site = require("../index.html");
const fs = require("fs");

exports.allSite = (req, res, next) => {

    res.set('Content-Type', 'text/html');
    res.send(Buffer.from("<!DOCTYPE html><html lang=`en`><head> <meta charset=`UTF-8`> <meta name=`viewport` content=`width=device-width, initial-scale=1.0`> <title>Annonces</title><meta http-equiv='Content-Security-Policy' content='default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://platform.linkedin.com '></head><body> <h1>Annonces</h1> <div> <label for=`search`>Rechercher des annonces :</label> <input type=`text` id=`search` name=`search`> <button onclick=`searchAds()`>Rechercher</button> </div> <div id=`ads-container`></div> <script src='scriptsite.js'> </script></body></html>"));
//     const textSite = toString(site)
//     console.log(site)
//     .then((textSite) => res.status(200).json(textSite))
// .catch((error) => res.status(400).json({ error }))
};

//console.log(searchSchema);