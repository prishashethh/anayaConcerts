# Anaya's Concerts

A private concert diary: a photo collage of every show, a pop-up card for each one, Beli-style rankings, countdowns and a yearly recap.

Built with React + Vite, hosted on GitHub Pages, with Supabase for the database, photo storage and login.

## One-time setup

### 1. Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste everything in [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up" (so nobody else can make an account).
4. **Authentication → Users → Add user → Create new user**: enter Anaya's email and a password, and tick "Auto confirm user".
5. **Project Settings → API**: copy the **Project URL** and the **anon / publishable key**.

### 2. Run it locally
```bash
cp .env.example .env.local   # then paste the URL and key into .env.local
npm install
npm run dev
```

### 3. Deploy to GitHub Pages
1. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
2. **Settings → Pages → Source: GitHub Actions**.
3. Push to `main`. The site is published at `https://<your-username>.github.io/anayaConcerts/`.

The Supabase key in the built site is meant to be public. The data is protected by the login plus the row-level security rules in `schema.sql`.

## Notes
- Photos are resized in the browser before upload (a full-size copy and a thumbnail), so the free 1 GB of storage goes a long way.
- iPhone HEIC photos only work in Safari. In other browsers, export them as JPEG first.
- Song links open a Spotify search for that song.
