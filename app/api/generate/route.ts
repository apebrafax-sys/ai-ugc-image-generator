import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, mode, aspectRatio, numOutputs } = await request.json();

    if (!prompt || !mode) {
      return NextResponse.json(
        { error: "Prompt and mode are required" },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured. Please add it in Vercel environment variables." },
        { status: 500 }
      );
    }

    // Build a strong UGC-style prompt
    const systemPrompt = getSystemPrompt(mode);
    const fullPrompt = `${systemPrompt}. ${prompt}. Realistic photo, natural lighting, authentic user-generated content style, shot on phone or casual camera, high detail, cinematic composition`;

    // Aspect ratio to dimensions
    const { width, height } = getDimensions(aspectRatio);

    const output = await replicate.run(
      "black-forest-labs/flux-dev",
      {
        input: {
          prompt: fullPrompt,
          num_outputs: Math.min(Math.max(numOutputs || 1, 1), 2), // Limit to 2 for speed & cost
          aspect_ratio: aspectRatio || "1:1",
          output_format: "png",
          output_quality: 90,
          prompt_upsampling: true,
        },
      }
    );

    // Replicate returns array of File or URLs
    const images = Array.isArray(output) 
      ? output.map((img: any) => img.url || img) 
      : [output];

    return NextResponse.json({ 
      success: true, 
      images,
      enhancedPrompt: fullPrompt 
    });

  } catch (error: any) {
    console.error("Generation error:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate image. Please try again.",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

function getSystemPrompt(mode: string): string {
  const prompts: Record<string, string> = {
    "product-real": "Authentic product photography in real life setting, natural environment, casual lifestyle shot, product placed naturally, soft natural lighting, realistic textures, shot on iPhone or casual camera",
    "lifestyle-model": "Real person using the product in daily life, natural pose, candid moment, authentic lifestyle photography, natural skin tones, casual clothing, real environment, user-generated content style",
    "food-ugc": "Appetizing food photography, home cooked or cafe style, natural plating, warm lighting, shot from natural angle, realistic food styling, cozy atmosphere, user generated content vibe",
    "fashion-ootd": "Fashion outfit of the day photography, person wearing clothes naturally, street style or home setting, natural pose, authentic fashion photography, good lighting, realistic fabric texture",
    "interior-ugc": "Cozy interior photography, natural home or cafe space, warm ambient lighting, realistic furniture and decor, lived-in feel, shot on phone, authentic user generated content",
    "pov-handheld": "First person POV shot, hands holding or interacting with product, natural hand position, realistic perspective, casual phone photography style, authentic and relatable"
  };

  return prompts[mode] || prompts["product-real"];
}

function getDimensions(aspectRatio: string): { width: number; height: number } {
  const ratios: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1344, height: 768 },
    "9:16": { width: 768, height: 1344 },
    "4:3": { width: 1152, height: 896 },
    "3:4": { width: 896, height: 1152 },
  };
  return ratios[aspectRatio] || { width: 1024, height: 1024 };
}
