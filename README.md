# AI UGC Image Generator

A beautiful, production-ready web application that generates **realistic User-Generated Content (UGC) style images** using AI (Flux via Replicate).

Perfect for:
- E-commerce product photos
- Social media content (Instagram, TikTok, Shopee, etc.)
- Marketing & advertising
- Authentic lifestyle imagery

## Features

- **6 UGC Modes**: Product in Real Life, Lifestyle/Model, Food, Fashion OOTD, Interior, POV/Handheld
- **Real AI Generation** using black-forest-labs/flux-dev
- **Prompt Enhancement** helper
- **Multiple aspect ratios** (Square, Landscape, Portrait, etc.)
- **Generation History** with localStorage (regenerate or reuse prompts)
- **Download** generated images
- **Modern dark UI** optimized for AI tools
- Fully responsive

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Replicate API Token
Create a `.env.local` file:

```env
REPLICATE_API_TOKEN=your_replicate_token_here
```

Get your free token at: https://replicate.com/account/api-tokens

### 3. Run locally
```bash
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Vercel (Recommended)

The easiest way:

1. Push this project to GitHub
2. Import the repository on [Vercel](https://vercel.com/new)
3. Add the `REPLICATE_API_TOKEN` environment variable in Vercel dashboard
4. Deploy

Or use the connected AI builder tool to deploy directly.

## Environment Variables

| Variable                | Required | Description                          |
|-------------------------|----------|--------------------------------------|
| `REPLICATE_API_TOKEN`   | Yes      | Your Replicate API key               |

## Tech Stack

- Next.js 15 + TypeScript
- Tailwind CSS
- Replicate JS SDK
- Sonner (toast notifications)
- Lucide icons

## Notes

- Generation uses **Flux Dev** model (high quality)
- Limited to 1-2 images per generation for speed and cost control
- All generations are saved locally in your browser history
- For production use, consider upgrading Replicate plan

---

Built with ❤️ using the AI Web App Builder skill. Ready to use and customize!