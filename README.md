# Student Consultancy Safety

A MERN starter for finding verified consultancies, study-abroad information, scam reporting, reviews, and administration.

## Start

1. Copy `.env.example` to `server/.env` and set the values.
2. Run `npm install` from this folder.
3. Run `npm run dev`.

The client runs on `http://localhost:5173`; the API runs on `http://localhost:5001/api`.

## Add demo consultancy data

Run this from the project folder:

```bash
npm run seed --workspace=server
```

It adds five sample consultancies to MongoDB. It is safe to run repeatedly: listings are updated by name rather than duplicated.

It also creates a verified local admin account for development: `admin@safestudy.local` with password `Admin123!`. Change this password or remove the account before deployment.

## Add a page yourself

1. Add a page component in `client/src/routes/pages.tsx`, for example `export function Contact() { return <h1>Contact</h1>; }`.
2. Import it in `client/src/App.tsx` and add a route such as `<Route path="/contact" element={<Contact/>}/>`.
3. Add a navigation link in `client/src/layouts/AppLayout.tsx`: `<Link to="/contact">Contact</Link>`.

## Add data yourself

For quick test data, open MongoDB Compass, choose `student-consultancy-safety`, then the collection such as `consultancies`, and use **Add Data → Insert Document**. A consultancy needs at least `name` and `city`; see `server/src/scripts/seed.ts` for a complete example.

For real application data, create it through the API. The admin listing endpoint is `POST /api/consultancies` and accepts name, city, services, destinations, description, contact, and verification status. It requires an authenticated admin account.

## Structure

- `client/src/features` contains domain modules: authentication, consultancies, content, reports, reviews, dashboard, and admin.
- `server/src` contains Express routes, MongoDB models, controllers, and auth middleware.

## Local SMTP OTP

The API sends OTP emails through a local SMTP server. The default settings use `127.0.0.1:1025`, which works with Mailpit or MailHog without a username or password. Start one of those tools, then open its mailbox UI; Mailpit normally uses `http://localhost:8025`.

The settings live in `server/.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_FROM`.

## MongoDB storage

Backend data is stored in the local MongoDB database named `student-consultancy-safety`, configured by `MONGODB_URI` in `server/.env` (default: `mongodb://127.0.0.1:27017/student-consultancy-safety`). MongoDB creates the collections automatically when data is first saved: `users`, `consultancies`, `reports`, `reviews`, and `contents`.

## Deploy the API to Render

The repository includes `render.yaml` for a Render Blueprint deployment.

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Render, choose **New → Blueprint** and connect the repository.
3. Render will ask for `MONGODB_URI`, `CLIENT_URL`, and the SMTP settings. Use a MongoDB Atlas connection string for `MONGODB_URI`; set `CLIENT_URL` to the deployed frontend origin without a trailing slash.
4. Deploy the Blueprint. Render generates `JWT_SECRET`, builds the server workspace, and starts `server/dist/index.js`.
5. Verify `https://YOUR-SERVICE.onrender.com/api/health`, then set the frontend variable `VITE_API_URL=https://YOUR-SERVICE.onrender.com/api` and rebuild the frontend.

Do not add `.env` files, database credentials, SMTP passwords, or JWT secrets to Git.
