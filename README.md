# Client Finder

Client Finder is a full-stack SaaS-style lead discovery platform for freelance developers, web designers, and agencies. It helps users find local businesses that need a modern website, score each opportunity, save promising leads, view them on a map, and prepare outreach faster.

The app uses real Google Maps business data through SerpAPI, stores qualified leads in MongoDB, and includes an optional WhatsApp Web outreach bot for controlled lead follow-up.

## Features

- JWT-based signup and login
- Protected lead discovery dashboard
- Live Google Maps search through SerpAPI
- Business type and country filters
- Automatic lead qualification for businesses with no website and valid phone numbers
- Opportunity score, website analysis, and generated pitch message for every lead
- Saved leads pipeline
- Business detail pages
- Interactive map view with Leaflet and OpenStreetMap
- Public leads endpoint for automation
- Optional WhatsApp outreach bot with QR login, send delays, phone validation, and CSV logs

## Tech Stack

**Frontend:** React, Vite, React Router, Tailwind CSS, Axios, Framer Motion, Lucide React, React Leaflet  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, SerpAPI  
**Automation:** Puppeteer, WhatsApp Web, libphonenumber-js

## Project Structure

```text
Clientfinder/
  client/          React frontend
  server/          Express API and MongoDB models
  whatsapp-bot/    Optional WhatsApp outreach automation
```

## How It Works

1. Users create an account or log in.
2. The dashboard searches Google Maps data by business type and country.
3. The backend filters and stores qualified leads in MongoDB.
4. Each lead receives an opportunity score, website analysis, and outreach pitch.
5. Users can save leads, open full business details, or inspect locations on the map.
6. The optional WhatsApp bot can fetch backend leads and send controlled outreach messages.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB local instance or MongoDB Atlas URI
- SerpAPI API key

### Installation

```bash
git clone <your-repository-url>
cd Clientfinder

npm install
npm install --prefix client
npm install --prefix server
npm install --prefix whatsapp-bot
```

### Environment Setup

Create the frontend env file:

```bash
cp client/.env.example client/.env
```

Create the backend env file:

```bash
cp server/.env.example server/.env
```

For Windows PowerShell:

```powershell
Copy-Item client\.env.example client\.env
Copy-Item server\.env.example server\.env
```

Update `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Update `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb-connection-string/client-finder-map
JWT_SECRET=replace-with-a-secure-secret
SERP_API_KEY=your-serpapi-key
```

### Run Locally

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

Optional seed data:

```bash
npm run seed --prefix server
```

## Available Scripts

```bash
npm run dev              # Run frontend and backend together
npm run client:dev       # Run frontend only
npm run server:dev       # Run backend only
npm run build --prefix client
npm run start --prefix server
```

## Main Routes

### Frontend

```text
/             Landing page
/signup       Create account
/login        Login
/dashboard    Lead discovery dashboard
/map          Map view
/saved        Saved leads
/business/:id Business details
```

### Backend API

```http
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me
GET    /api/users/saved
GET    /api/business/search?query=restaurants&country=USA&page=0&limit=12
GET    /api/businesses
GET    /api/business/:id
POST   /api/business/:id/save
DELETE /api/business/:id/save
GET    /api/leads
```

Protected endpoints require:

```text
Authorization: Bearer <token>
```

## WhatsApp Bot

The `whatsapp-bot` folder contains an optional Puppeteer bot that fetches leads from:

```http
GET /api/leads
```

Run it after starting the backend:

```bash
npm run start --prefix whatsapp-bot
```

Optional filters:

```env
BOT_LEADS_QUERY=restaurants
BOT_LEADS_COUNTRY=USA
BOT_LEADS_PAGE=0
BOT_LEADS_LIMIT=25
```

The bot opens WhatsApp Web, waits for QR login, validates phone numbers, sends messages with delays, and writes results to `whatsapp-bot/logs.csv`.

Use this responsibly and follow WhatsApp policies, local communication laws, and opt-out requests.

## Deployment Notes

- Build the frontend with `npm run build --prefix client`.
- Deploy `client/dist` to Vercel, Netlify, Cloudflare Pages, or another static host.
- Deploy the server to Render, Railway, Fly.io, DigitalOcean, or a VPS.
- Use MongoDB Atlas for production.
- Set a strong `JWT_SECRET`.
- Never commit real `.env` files.
- Restrict CORS to your production frontend domain before going live.

## License

This project does not currently define an open-source license. Add one before public distribution.
