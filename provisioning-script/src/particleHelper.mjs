import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const PARTICLE_ACCESS_TOKEN = process.env.PARTICLE_ACCESS_TOKEN
const PARTICLE_PRODUCT_ID = process.env.PARTICLE_PRODUCT_ID
const PARTICLE_LEDGER_NAME = process.env.PARTICLE_LEDGER_NAME

if (!PARTICLE_ACCESS_TOKEN || !PARTICLE_PRODUCT_ID || !PARTICLE_LEDGER_NAME) {
  console.error('Please set PARTICLE_ACCESS_TOKEN, PARTICLE_PRODUCT_ID, and PARTICLE_LEDGER_NAME in your .env file')
  process.exit(1)
}

export async function listDevices () {
  try {
    const response = await axios.get(`https://api.particle.io/v1/products/${PARTICLE_PRODUCT_ID}/devices`, {
      headers: {
        Authorization: `Bearer ${PARTICLE_ACCESS_TOKEN}`
      }
    })
    return response.data.devices.map(device => device.id)
  } catch (error) {
    console.error('Error listing devices:', error)
    throw error
  }
}

export async function listLedgerInstances () {
  try {
    const response = await axios.get(`https://api.particle.io/v1/products/${PARTICLE_PRODUCT_ID}/ledgers/${PARTICLE_LEDGER_NAME}/instances`, {
      headers: {
        Authorization: `Bearer ${PARTICLE_ACCESS_TOKEN}`
      }
    })
    return response.data.instances
  } catch (error) {
    console.error('Error listing ledger instances:', error)
    throw error
  }
}

export async function createLedgerInstance (deviceId, blynkToken) {
  try {
    const headers = {
      headers: {
        Authorization: `Bearer ${PARTICLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
    const data = {
      instance: {
        scope: {
          type: 'device',
          value: deviceId
        },
        name: PARTICLE_LEDGER_NAME,
        data: {
          blynk_token: blynkToken
        }
      }
    }
    const response = await axios.put(
      `https://api.particle.io/v1/products/${PARTICLE_PRODUCT_ID}/ledgers/${PARTICLE_LEDGER_NAME}/instances/${deviceId}`,
      data,
      headers
    )
    return response.data
  } catch (error) {
    console.error('Error creating ledger instance:', error)
    throw error
  }
}
