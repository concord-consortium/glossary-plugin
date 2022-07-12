const env = process.argv[2]

if (!["prod", "dev"].includes(env)) {
  console.log("Usage: join-glossary-data.js <prod|dev>")
  process.exit(1)
}

const mysql = require(`./${env}-mysql.json`)
const firestore = require(`./${env}-firestore.json`)

const owners = new Set()

const firestoreMap = firestore.reduce((acc, curr) => {
  const owner = curr.Data.accessRules.find(rule => rule.role === "owner").userId
  acc[curr.ID] = {
    name: curr.Data.name,
    description: curr.Data.description,
    owner,
  }
  owners.add(owner)
  return acc
}, {})

const glossaries = {}
const activities = {}

mysql.forEach(row => {
  const authorData = JSON.parse(row.author_data)
  if (authorData) {
    const {glossaryResourceId, s3Url} = authorData
    if (glossaryResourceId) {
      glossaries[glossaryResourceId] = glossaries[glossaryResourceId] || {glossaryResourceId, s3Url, firestore: firestoreMap[glossaryResourceId], activities: []}
      glossaries[glossaryResourceId].activities.push(row.name)
      activities[row.name] = {
        email: row.email,
        glossary: glossaries[glossaryResourceId]
      }
    }
  }
})

// console.log(firestoreMap)
console.log("*** GLOSSARIES ***\n\n")
console.log(glossaries)
console.log("\n\n*** ACTIVITIES ***\n\n")
console.log(JSON.stringify(activities, null ,2))
console.log("\n\n*** OWNERS ***\n\n")
console.log(JSON.stringify([...owners], null ,2))