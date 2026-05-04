# MenuAR — SaaS Dine-in Platform

MenuAR is a premium, multi-tenant dine-in ordering platform that combines digital menus with Augmented Reality (AR) dish visualization and a Gemini-powered AI menu assistant.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **AI**: Google Gemini API (Gemini 2.0 Flash)
- **AR**: Google `<model-viewer>` (WebXR, Scene Viewer, Quick Look)
- **Icons**: Lucide React
- **PWA**: manifest.json + Service Worker

## Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd MenuAR
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase and Gemini API credentials.

4. **Run development server**:
   ```bash
   npm run dev
   ```

## Supabase Setup
- Create a new Supabase project.
- Execute the schema migration found in `supabase/migrations` (or refer to the provided SQL structure).
- Enable **Realtime** on the `orders` table.
- Set up **RLS Policies** for `restaurants`, `categories`, `menu_items`, `tables`, `orders`, and `order_items`.

## Onboarding a New Restaurant
1. Log in to the **Super Admin Panel** at `/superadmin/restaurants`.
2. Add a new restaurant name and slug.
3. The new restaurant admin will see a guided onboarding flow on their first login to set up their menu and tables.

## Adding 3D Models
- When adding a menu item, provide a URL to a `.glb` file in the `ar_model_url` field.
- If no model is provided, the platform automatically falls back to the dish's 2D image in the AR preview screen.

## Environment Variables
| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key |
| `VITE_GEMINI_API_KEY` | Your Google AI Studio API key |

## Deployment
Recommended: **Vercel**
1. Push your code to GitHub.
2. Connect the repository to Vercel.
3. Add the environment variables from your `.env` to the Vercel project settings.
4. Deploy!
