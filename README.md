# WoodWing Assets TypeScript Client

This library provides a fully-typed TypeScript interface for interacting with the [WoodWing Assets Server](https://www.woodwing.com/products/woodwing-assets), including asset management, metadata updates, history, authentication key management, and administrative operations such as webhook registration.

---

## 🚀 Features

- 🔐 Full authentication using session token and CSRF handling  
- 📁 Asset and folder operations (create, move, copy, delete)  
- 📝 Metadata updates (bulk and single asset)  
- 📤 File upload/download  
- 📜 Asset history tracking  
- 📦 Collection and relation management  
- 📡 Webhook management via Admin API  
- 🔔 Optional local webhook listener with signature validation  

---

## 📦 Installation

```bash
npm install woodwing-assets
```

---

## 🛠 Configuration

All server communication requires valid credentials and server information.

You can provide these via environment variables or directly in your code.

### .env (optional)

```dotenv
ASSETS_SERVER_URL=https://assets.server
ASSETS_USERNAME=testuser
ASSETS_PASSWORD=testpass
ASSETS_REJECT_UNAUTHORIZED=false
ASSETS_TOKEN_VALIDITY=30
```

### Example

```ts
import { AssetsServer } from './AssetsServer';
import dotenv from 'dotenv';

dotenv.config();

const client = new AssetsServer({
  serverUrl: process.env.ASSETS_SERVER_URL!,
  username: process.env.ASSETS_USERNAME!,
  password: process.env.ASSETS_PASSWORD!,
  rejectUnauthorized: process.env.ASSETS_REJECT_UNAUTHORIZED === 'true',
  tokenValidityInMinutes: parseInt(process.env.ASSETS_TOKEN_VALIDITY || '30')
});
```

---

## 📚 Usage Examples

### Upload a File

```ts
import fs from 'fs';

const fileStream = fs.createReadStream('./image.jpg');
const result = await client.create(fileStream, {
  folderPath: '/Test',
  filename: 'image.jpg'
});
```

### Update Metadata

```ts
await client.update(assetId, null, {
  description: 'New description'
});
```

### Search

```ts
const response = await client.search('filename:image.jpg');
console.log(response.totalHits);
```

### Create Webhook

```ts
await admin.createWebhook({
  enabled: true,
  name: 'Webhook Test',
  url: 'https://my.public.url/webhook',
  eventTypes: ['asset_create'],
  metadataToReturn: ['folderPath'],
  changedMetadataToReturn: ['description'],
  foldersAndQuery: {
    folders: ['/Test'],
    query: '',
    enableWildcardSelection: true
  },
  triggerMetadataFields: []
});
```

---

## 🔊 Webhook Listener (Optional)

You can instantiate a local listener to receive webhook events using:

```ts
const listener = new AssetsWebhook({
  port: 8080,
  bindTo: '0.0.0.0',
  secretToken: 'provided-by-assets-server'
});

listener.listen(
  (data) => {
    console.log('Webhook payload received:', data);
  },
  (error) => {
    console.error('Webhook error:', error);
  }
);
```

---


## 📁 Project Structure

```
src/
├── interfaces/              # Typed interfaces
├── AssetsServer.ts          # Main client
├── AssetsServerAdmin.ts     # Admin API client
├── AssetsWebhook.ts         # Webhook listener
├── WebhookConfig.ts         # Webhook listener config
└── AssetsConfig.ts          # Auth + base configuration
```

---

## 📌 Notes

- Assets Server must be configured to allow your webhook URLs (check firewall or network restrictions)
- Webhook signature is validated using HMAC with `secretToken`
- Most `POST` payloads are sent as either JSON or `multipart/form-data`, as required by the API

---

## 🔐 License

This project is licensed under the [MIT License](./LICENSE) © 2025 Luis Ferreira.
