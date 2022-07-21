// via a query on lara2 rds instance on 7/21/2002 

const oldLaraFirestoreInfo = require("./prod-firestore.json")
const nameToIdMap = {}

oldLaraFirestoreInfo.forEach(item => {
	// skip duplicate unused glossary
	if (item.ID !== "vV8w6LCdk7Os0gM1h86l") {
		if (nameToIdMap[item.Data.name]) {
			console.error("DUPLICATE NAME:", item.Data.name)
		} else {
			nameToIdMap[item.Data.name] = item.ID
		}
	}
})

newLara2Glossaries = [
	{
		"id" : 1,
		"name" : "First Test Glossary"
	},
	{
		"id" : 2,
		"name" : "Kiley's Glossary (5\/2)"
	},
	{
		"id" : 3,
		"name" : "STEM Pig Latin"
	},
	{
		"id" : 4,
		"name" : "PC2- Hawaii"
	},
	{
		"id" : 8,
		"name" : "Gas Laws 2020"
	},
	{
		"id" : 9,
		"name" : "Test Glossary"
	},
	{
		"id" : 10,
		"name" : "Wild Blueberries Lesson 1 Glossary"
	},
	{
		"id" : 11,
		"name" : "Wild Blueberries Lesson 2 Glossary"
	},
	{
		"id" : 12,
		"name" : "Wild Blueberries Lesson 3 Glossary"
	},
	{
		"id" : 13,
		"name" : "Lake Ice-Out Lesson 1 Glossary"
	},
	{
		"id" : 14,
		"name" : "Lake Ice-Out Lesson 2 Glossary"
	},
	{
		"id" : 15,
		"name" : "Lake Ice-Out Lesson 3 Glossary"
	},
	{
		"id" : 16,
		"name" : "The Shape of Change Lesson 1 Glossary"
	},
	{
		"id" : 17,
		"name" : "The Shape of Change Lesson 2 Glossary"
	},
	{
		"id" : 18,
		"name" : "Ticks & Lyme Disease Lesson 1 Glossary"
	},
	{
		"id" : 19,
		"name" : "Ticks & Lyme Disease Lesson 2 Glossary"
	},
	{
		"id" : 20,
		"name" : "Ticks & Lyme Disease Lesson 3 Glossary"
	},
	{
		"id" : 21,
		"name" : "Ticks & Lyme Disease Lesson 4 Glossary"
	},
	{
		"id" : 22,
		"name" : "Lobster & Black Sea Bass Lesson 1 Glossary"
	},
	{
		"id" : 23,
		"name" : "Lobster & Black Sea Bass Lesson 2 Glossary"
	},
	{
		"id" : 24,
		"name" : "Lobster & Black Sea Bass Lesson 3 Glossary"
	},
	{
		"id" : 25,
		"name" : "Diffusion, osmosis, and active transport"
	},
	{
		"id" : 26,
		"name" : "Bug Test Activity Glossary"
	},
	{
		"id" : 27,
		"name" : "Kiley's Sample Glossary"
	},
	{
		"id" : 28,
		"name" : "V2PluginTestGlossary"
	},
	{
		"id" : 29,
		"name" : "ER Glossary"
	},
	{
		"id" : 30,
		"name" : "test glossary"
	},
	{
		"id" : 31,
		"name" : "Test"
	},
	{
		"id" : 32,
		"name" : "DNA to Proteins"
	},
	{
		"id" : 33,
		"name" : "Test Glossary 1"
	},
	{
		"id" : 34,
		"name" : "TestGlossaryPlugin"
	},
	{
		"id" : 35,
		"name" : "heat and temperature"
	},
	{
		"id" : 36,
		"name" : "PC Lesson 1 MA"
	},
	{
		"id" : 37,
		"name" : "PrecipitatingChange-AK-NE"
	},
	{
		"id" : 39,
		"name" : "WATERS"
	},
	{
		"id" : 40,
		"name" : "Yupik"
	},
	{
		"id" : 41,
		"name" : "Coastal Erosion Glossary"
	},
	{
		"id" : 42,
		"name" : "pj test"
	}
]


const notFound = []
newLara2Glossaries.forEach(item => {
	if (nameToIdMap[item.name]) {
		console.log(`UPDATE glossaries SET legacy_glossary_resource_id = '${nameToIdMap[item.name]}' WHERE id = ${item.id}; -- ${item.name}`)
	} else {
		notFound.push(item)
	}
})

console.error("\nGLOSSARIES NOT FOUND IN OLD GLOSSARY IMPORT:\n")
notFound.forEach(item => console.log(item.name))


/*

RESULTS:

UPDATE glossaries SET legacy_glossary_resource_id = 'NciBizL2HUI7qiv3XdAB' WHERE id = 8; -- Gas Laws 2020
UPDATE glossaries SET legacy_glossary_resource_id = 'OsuYZYOHoZKMVXMV2ijr' WHERE id = 9; -- Test Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'aSkyVRFkmrnVDqIbxyIN' WHERE id = 10; -- Wild Blueberries Lesson 1 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'lVXWBw9Wa1mTBkIlExXs' WHERE id = 11; -- Wild Blueberries Lesson 2 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'fl8EYoUvUH5GX6D9qVik' WHERE id = 12; -- Wild Blueberries Lesson 3 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'WKGIe87AR1lBp56SmakN' WHERE id = 13; -- Lake Ice-Out Lesson 1 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'ldArmSwDXRWM1viTO1c7' WHERE id = 14; -- Lake Ice-Out Lesson 2 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = '7WaEBOXFakRRoXOUDnDk' WHERE id = 15; -- Lake Ice-Out Lesson 3 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = '8smLeISuOtZ7ICCDgxGt' WHERE id = 16; -- The Shape of Change Lesson 1 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'Mk3yfHrJbBRGDxNnGIS8' WHERE id = 17; -- The Shape of Change Lesson 2 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'cIjkFpLdV0bMLgHHHiem' WHERE id = 18; -- Ticks & Lyme Disease Lesson 1 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'SKFnWkgfxXcTJaugMng4' WHERE id = 19; -- Ticks & Lyme Disease Lesson 2 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'JaN86XReZl45mvcliiMY' WHERE id = 20; -- Ticks & Lyme Disease Lesson 3 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'bfR5f6egaMAKaTHWXY0x' WHERE id = 21; -- Ticks & Lyme Disease Lesson 4 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'yBtnXkC6fIfXZ61zAjUg' WHERE id = 22; -- Lobster & Black Sea Bass Lesson 1 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'wCUHdGfa7JnCuaWRujzF' WHERE id = 23; -- Lobster & Black Sea Bass Lesson 2 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = '1VKwXksQNLj7JBjRzbNe' WHERE id = 24; -- Lobster & Black Sea Bass Lesson 3 Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'CBpP9TUgUGuUdDhliQNn' WHERE id = 25; -- Diffusion, osmosis, and active transport
UPDATE glossaries SET legacy_glossary_resource_id = 'LvcQrzVvnl1Bm8sRKtHw' WHERE id = 26; -- Bug Test Activity Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'uGyUKyevEzJldnyYx4I0' WHERE id = 27; -- Kiley's Sample Glossary
UPDATE glossaries SET legacy_glossary_resource_id = '3Bn1CgFVH2oIpjV6242q' WHERE id = 28; -- V2PluginTestGlossary
UPDATE glossaries SET legacy_glossary_resource_id = 'zE3QYVz8xJxomOQVvEbc' WHERE id = 29; -- ER Glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'D9afwcpQ834e3XvKoak3' WHERE id = 30; -- test glossary
UPDATE glossaries SET legacy_glossary_resource_id = 'FLC50FXJVHBLjSMBkQks' WHERE id = 31; -- Test
UPDATE glossaries SET legacy_glossary_resource_id = 'hcV6fLyzTbRtB4KYFhxE' WHERE id = 32; -- DNA to Proteins
UPDATE glossaries SET legacy_glossary_resource_id = 'iWA7lhVgJX2ZyLoG7HXa' WHERE id = 33; -- Test Glossary 1
UPDATE glossaries SET legacy_glossary_resource_id = 'H7yFsp4riXPRT8bRXd2J' WHERE id = 34; -- TestGlossaryPlugin
UPDATE glossaries SET legacy_glossary_resource_id = 'Laz2d1NFDQTQ5uxvSNQd' WHERE id = 35; -- heat and temperature
UPDATE glossaries SET legacy_glossary_resource_id = '862154P6gx3V6oKtJRZw' WHERE id = 36; -- PC Lesson 1 MA
UPDATE glossaries SET legacy_glossary_resource_id = 'upZ83jqTZAZuoQqRAfAb' WHERE id = 37; -- PrecipitatingChange-AK-NE
UPDATE glossaries SET legacy_glossary_resource_id = 'oRKDulC2nuAoBjeIaAIh' WHERE id = 39; -- WATERS

GLOSSARIES NOT FOUND IN OLD GLOSSARY IMPORT:

First Test Glossary
Kiley's Glossary (5/2)
STEM Pig Latin
PC2- Hawaii
Yupik
Coastal Erosion Glossary
pj test

*/