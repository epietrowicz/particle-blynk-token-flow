import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

function csvFiles () {
  const tokensDir = path.join(process.cwd(), 'tokens')
  const files = fs.readdirSync(tokensDir)

  const csvFiles = files
    .filter(file => file.toLowerCase().endsWith('.csv'))
    .map(file => path.join(tokensDir, file))
  return csvFiles
}

function readCsv (filePath) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

export async function exportRemainingTokens (filePath, numToRemove) {
// read the file
  const csvData = fs.readFileSync(filePath, 'utf-8')

  // split into lines
  const lines = csvData.trim().split('\n')

  const [header, ...rows] = lines
  const newRows = rows.slice(numToRemove)
  const newCsv = [header, ...newRows].join('\n')

//   fs.writeFileSync(filePath, newCsv)
}

export async function readAllTokens () {
  const files = csvFiles()
  let allTokens = []
  for (const file of files) {
    console.log(`Processing file: ${file}`)
    const records = await readCsv(file)
    allTokens = [...allTokens, ...records]
  }
  return allTokens
}
