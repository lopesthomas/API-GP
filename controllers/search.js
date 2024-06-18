//const Search = require("../models/Search");
const lbc = require("../leboncoin-api-search/index.ts");
const fs = require("fs");

regions = lbc.REGIONS;
category = lbc.CATEGORY;
//selectLocationDepart = req.query.department;

exports.allSearch = (req, res, next) => {
	if(req.query.department == ""){
		selectLocationDepart = req.query.region;
	} else {
		selectLocationDepart = req.query.department;
	}
	const results = lbc.search(
	{
		category: lbc.CATEGORY.ALL,
		keywords: `${req.query.q}`,
        locations: [`${selectLocationDepart}`],
		limit: Number(req.query.num_ads),
	},
	1,
    console.log("searchSchema"),
	console.log(lbc.REGIONS),
	//console.log(req)
).then((results) => res.status(200).json(results))
.catch((error) => res.status(400).json({ error }))};

exports.allRegions = (req, res, next) => {
	res.json({regions})
}

exports.allCategorys = (req, res, next) => {
	res.json({category})
}

//console.log(searchSchema);