import { readAllTokens } from './csvHelper.mjs'
import { createLedgerInstance, listDevices } from './particleHelper.mjs'

async function main () {
  const allTokens = await readAllTokens()
  const devices = await listDevices()
  let tokenIndex = 0
  for (const deviceId of devices) {
    const blynkToken = allTokens[tokenIndex]['Device Token']
    if (!blynkToken) {
      console.warn(`No Blynk token available for device ${deviceId}, skipping...`)
      continue
    }

    console.log(`Provisioning device ${deviceId} with Blynk token ${blynkToken}`)
    await createLedgerInstance(deviceId, blynkToken)

    tokenIndex++
    if (tokenIndex >= allTokens.length) {
      console.warn('Ran out of Blynk tokens to assign!')
      break
    }
  }
  const remainingTokens = allTokens.length - tokenIndex
  console.log(`Provisioned ${tokenIndex} devices.`)
  console.log(`${remainingTokens} tokens remain unassigned.`)
  console.log('Unprovisioned devices: ', devices)
}

main()
