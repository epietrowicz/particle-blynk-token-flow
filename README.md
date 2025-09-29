# How to automate device provisioning with Blynk

Blynk is a powerful dashboarding tool that complements the Particle ecosystem perfectly. Blynk makes it easy to deploy a clean UI to interact with your Particle based devices. In this post, we’ll talk about how you can automate the process of connecting Blynk’s device tokens with your Particle modules. 

## Generate Blynk static tokens

First, navigate to your Blynk console and make sure you have a template installed. In this case we’ll be using the default “Connect a Particle device” template provided by Blynk. 

<img width="3022" height="1152" alt="CleanShot_2025-09-26_at_14 53 252x" src="https://github.com/user-attachments/assets/27e127d9-1e00-4af7-8e91-1bf450ba6875" />

Next, navigate to the static tokens section and choose “Generate Static Tokens”. Click “generate multiple”. 

<img width="3016" height="1304" alt="CleanShot_2025-09-26_at_14 55 152x" src="https://github.com/user-attachments/assets/e059b326-0ac9-4a1a-a4c8-3b992eafc52f" />

Select the template of your choice, and define the number of tokens to create. 

<aside>
  💡 We recommend only creating one token per device onboarded in your Particle product. 
</aside>

<img width="954" height="714" alt="CleanShot_2025-09-26_at_14 55 502x" src="https://github.com/user-attachments/assets/7d8a9942-f73c-4e60-ab8f-37237b7c13bf" />

After selecting “Create Tokens”, you’ll be presented with the option to download a .zip file containing the newly created tokens.

<img width="672" height="232" alt="CleanShot_2025-09-26_at_14 56 432x" src="https://github.com/user-attachments/assets/bb12e382-46a1-47f3-98a9-f5cb72e674a2" />

If you missed this pop-up, you can always export the tokens from the expansion button under the filter header.

<img width="1654" height="580" alt="CleanShot_2025-09-26_at_14 57 232x" src="https://github.com/user-attachments/assets/00fdf1f0-7d9b-4be5-9aed-06624ecae936" />

Unzip the tokens and note where you’ve stored them. We’ll need them for a later step.

## Particle Blynk Integration

We’ll need to configure an integration so that messages published by our Particle devices are passed along to our Blynk instance. Still in the Particle console’s product view, navigate to “Cloud Services” and “Integrations”.

<img width="2514" height="1200" alt="CleanShot_2025-09-26_at_15 10 012x" src="https://github.com/user-attachments/assets/477c2593-9990-4911-9239-b22a3017d364" />

Select “add new integration”.

<img width="2896" height="392" alt="CleanShot_2025-09-26_at_15 10 442x" src="https://github.com/user-attachments/assets/e8e45b94-168d-41ce-955e-60425e99952e" />

Choose “Custom webhook”.

<img width="1486" height="882" alt="CleanShot_2025-09-26_at_15 11 412x" src="https://github.com/user-attachments/assets/e4b4a41c-35ac-445e-a821-903692ee008f" />

Change the tab from “Webhook builder” to “Custom template” and paste in the following JSON.

<aside>
  💡 Make sure to use the correct URL for your Blynk instance! This can be found in the Blynk console under your template’s tutorial.
</aside>

<img width="1618" height="1222" alt="CleanShot_2025-09-26_at_15 12 342x" src="https://github.com/user-attachments/assets/dfcd6292-0ee1-432a-b79e-7a1954434ebf" />

```json
{
    "name": "blynk_particle",
    "event": "blynk_https_get",
    "url": "https://ny3.blynk.cloud/external/api/batch/update",
    "requestType": "GET",
    "noDefaults": true,
    "rejectUnauthorized": true,
    "query": 
    {
        "token": "{{t}}",
        "V6": "{{PARTICLE_PUBLISHED_AT}}",
        "V14": "{{v14}}", 
        "V15": "{{v15}}", 
        "V16": "{{v16}}",
        "V17": "{{v17}}"
     }
} 
```

Finally, choose “Enable integration”.

## Create the Cloud to Device Ledger

While still in the Particle Console, let’s create the [Cloud to Device](https://docs.particle.io/getting-started/logic-ledger/ledger/) (device scoped) Ledger for our product. This Ledger type will be modifiable in the cloud and will sync to the device whenever an update is made. Each device in the product class will have its own Ledger instance. 

In your product view, navigate to “Cloud services” and choose “Go to Ledger →”.

<img width="2386" height="1120" alt="CleanShot_2025-09-29_at_12 31 452x" src="https://github.com/user-attachments/assets/43405e13-9df2-4e0c-85f0-042e03f3a961" />

Select “Create new Ledger” and choose “Cloud to Device Ledger”.

<img width="1796" height="714" alt="CleanShot_2025-09-29_at_12 33 172x" src="https://github.com/user-attachments/assets/94976b00-1d1e-47db-b317-ddb5132671e2" />

Give your Ledger a name, we’ll use “blynk-tokens-c2d” in this example. Select the “Device” scope in the drop down. Then save your changes. Make note of your Ledger name, we’ll need it in a later step.

<img width="1618" height="848" alt="CleanShot_2025-09-29_at_12 34 432x" src="https://github.com/user-attachments/assets/2debd0e2-e774-4aec-bc04-fdb649d12ac1" />

## Particle access token

In order to work with the data in our Particle account programmatically, we’ll need an [access token](https://docs.particle.io/reference/cloud-apis/access-tokens/). To generate a new token, run the following command in your terminal (or command line):

```bash
particle token create
```

The CLI tool will prompt you to log in and will return a UUID with an expiration data. Save this for the next step and note the expiration date. You should create a fresh token at this time.

If you don’t have the Particle CLI installed, you can follow [the installation instructions](https://docs.particle.io/getting-started/developer-tools/cli/) to get started. 

## Generate Ledger instances

With the integration configured, we need some way for our Particle devices to receive our Blynk device tokens that we exported in the first step. We’ll do this using [cloud to device, device scoped Ledgers](https://docs.particle.io/getting-started/logic-ledger/ledger/#cloud-to-device-ledger-console).

To take this a step further, we’ll run a simple Javascript script to automate the creation of these Ledgers using the Particle API key that we created in the previous step. Make sure to have [Node.js](https://nodejs.org/en/download) installed for this process. 

Clone the script’s repository somewhere on your computer:

```bash
git clone <script_repo>
```

Open the `provisioning-script` folder from this repository in a code editor of your choice. In this case, we’ll use VSCode. In the root of the project, create a new `.env` file and paste in the following:

```
PARTICLE_ACCESS_TOKEN="your_access_token"
PARTICLE_PRODUCT_ID="your_product_slug"
PARTICLE_LEDGER_NAME="your_ledger_name"
```

This gives the script permission to perform operations on your behalf in the Particle environment.

Next, in the `tokens` folder, add the `.csv` file containing the list of Blynk device tokens that you downloaded in the first step. 

<img width="2140" height="650" alt="CleanShot_2025-09-26_at_15 25 092x" src="https://github.com/user-attachments/assets/29d68a65-31b8-4ffa-b0e3-c5f85e623b69" />

To run the script, open a new terminal window and execute the following:

```bash
npm run start
```

In the terminal output, you should see a confirmation that your Ledgers were updated:

<img width="1722" height="366" alt="CleanShot_2025-09-29_at_15 36 532x" src="https://github.com/user-attachments/assets/4c19dd6a-c56e-48de-b094-7787260d3b8e" />

## Particle firmware

Finally, you’re ready to flash firmware to your device! Navigate to the [firmware source](https://github.com/epietrowicz/particle-blynk-token-flow/tree/main/particle-firmware) in the [project repository](https://github.com/epietrowicz/particle-blynk-token-flow). Clone and flash the source code. 

The firmware remains mostly unchanged from the example code [provided by Blynk](https://blynk.io/blueprints/connect-particle-hardware-to-blynk), except for the Ledger syncing logic shown below.

<aside>
  💡 Make sure to update the Ledger’s name to reflect your configuration
</aside>

```cpp
  // Ledger setup and initialization
  Ledger ledger = Particle.ledger("blynk-tokens-c2d");
  ledger.onSync(onLedgerSync);
  onLedgerSync(ledger, nullptr);
```

From the Particle console, trigger the `blynk_led` function with a payload of “on”. This will tell the device to make a request back to the Blynk cloud via webhook integration. 

<img width="612" height="360" alt="CleanShot_2025-09-29_at_15 57 322x" src="https://github.com/user-attachments/assets/deb248a1-611a-41f1-9ba0-7cf9ee5dfd0d" />

<img width="820" height="814" alt="CleanShot_2025-09-29_at_15 35 202x" src="https://github.com/user-attachments/assets/4f031141-5eed-4f9c-8c1c-2953daf167b1" />

## Activate the device via Blynk app

Finally, you’re ready to activate your device using the Blynk mobile app. In the Blynk app, scan the QR code associated with each device token and accept the prompts. This will enable your device to start streaming data into your Blynk account.

<img width="1179" height="2556" alt="image" src="https://github.com/user-attachments/assets/555d1880-8094-4b8e-b871-40e7d031be3b" />
