const https = require("https")

const env = process.argv[2]

if (!["prod", "dev"].includes(env)) {
  console.log("Usage: create-glossaries.js <prod|dev>")
  process.exit(1)
}

const mysql = require(`./${env}-mysql.json`)
const firestore = require(`./${env}-firestore.json`)
const userMap =  require(`./${env}-user-map.json`)

const httpsGet = url => {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
};

const firestoreMap = firestore.reduce((acc, curr) => {
  const owner = curr.Data.accessRules.find(rule => rule.role === "owner").userId
  acc[curr.ID] = {
    name: curr.Data.name,
    description: curr.Data.description,
    owner,
  }
  return acc
}, {})

const glossaries = {}

const getGlossaryInfo = async (row) => {
  const authorData = JSON.parse(row.author_data)
  if (authorData) {
    const {glossaryResourceId, s3Url} = authorData
    if (glossaryResourceId) {
      const {name, owner} = firestoreMap[glossaryResourceId]
      const contents = JSON.stringify(JSON.parse(await httpsGet(s3Url)))
      glossaries[glossaryResourceId] = {glossaryResourceId, s3Url, json: contents, name, owner, ownerInfo: userMap[owner]}
    }
  }
}

const sqlEscape = str => str.replace(/'/g, "''")

const outputSQL = (glossaries) => {
  const lines = [];
  const names = [];
  Object.values(glossaries).forEach(glossary => {
    const {glossaryResourceId, name, json, ownerInfo} = glossary
    names.push(name)
    lines.push(`-- creating glossary ${glossaryResourceId} for "${name}"`)
    lines.push(`INSERT INTO glossaries (user_id, name, json, created_at, updated_at) VALUES (${ownerInfo.lara2UserId}, '${sqlEscape(name)}', '${sqlEscape(json)}', now(), now());`)
  })
  process.stdout.write("SET NAMES 'utf8mb4';\nSET CHARACTER SET utf8mb4;\n\n")
  process.stdout.write(lines.join("\n"))

  process.stdout.write("\n\nSELECT id, name FROM glossaries WHERE name IN ('" + names.map(sqlEscape).join("', '") + "');\n")
}

const getAllGlossaries = async () => {
  for (const row of mysql) {
    await getGlossaryInfo(row)
  }
}

getAllGlossaries().then(() => outputSQL(glossaries))

// mysql.forEach( async (row) => {
//   await getGlossaryInfo(row)
// })


