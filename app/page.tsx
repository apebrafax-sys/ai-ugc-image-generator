"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, Download, Copy, RefreshCw, Clock, Image as ImageIcon, 
  Trash2, ArrowRight 
} from "lucide-react";
import { toast } from "sonner";

interface GeneratedImage {
  url: string;
  prompt: string;
  mode: string;
  aspectRatio: string;
  timestamp: string;
}

const MODES = [
  { 
    id: "product-real", 
    label: "Product in Real Life", 
    icon: "📦",
    desc: "Product placed naturally in real environments" 
  },
  { 
    id: "lifestyle-model", 
    label: "Lifestyle / Model", 
    icon: "👤",
    desc: "Real people using products in daily life" 
  },
  { 
    id: "food-ugc", 
    label: "Food & Beverage", 
    icon: "🍜",
    desc: "Appetizing food shots with natural styling" 
  },
  { 
    id: "fashion-ootd", 
    label: "Fashion OOTD", 
    icon: "👗",
    desc: "Outfit of the day, street & casual style" 
  },
  { 
    id: "interior-ugc", 
    label: "Interior & Space", 
    icon: "🏠",
    desc: "Cozy, lived-in interior photography" 
  },
  { 
    id: "pov-handheld", 
    label: "POV / Handheld", 
    icon: "✋",
    desc: "First-person perspective shots" 
  },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
];

export default function UGCImageGenerator() {
  const [selectedMode, setSelectedMode] = useState("product-real");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numOutputs, setNumOutputs] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ugc-history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    }
  }, []);

  const saveToHistory = (images: string[], prompt: string, mode: string, aspect: string) => {
    const newEntries: GeneratedImage[] = images.map(url => ({
      url,
      prompt,
      mode,
      aspectRatio: aspect,
      timestamp: new Date().toISOString(),
    }));

    const updated = [...newEntries, ...history].slice(0, 24); // Keep last 24
    setHistory(updated);
    localStorage.setItem("ugc-history", JSON.stringify(updated));
  };

  const enhancePrompt = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }

    const enhancements = [
      "highly detailed, natural lighting, authentic atmosphere",
      "shot on iPhone, realistic textures, candid moment",
      "soft natural light, lived-in feel, relatable composition",
      "cinematic color grading, sharp focus, premium quality",
    ];
    
    const randomEnhance = enhancements[Math.floor(Math.random() * enhancements.length)];
    const enhanced = `${prompt.trim()}, ${randomEnhance}`;
    
    setPrompt(enhanced);
    toast.success("Prompt enhanced with UGC style details");
  };

  const generateImages = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe what you want to generate");
      return;
    }

    setIsGenerating(true);
    setCurrentImages([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode: selectedMode,
          aspectRatio,
          numOutputs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      if (data.images && data.images.length > 0) {
        setCurrentImages(data.images);
        setCurrentPrompt(data.enhancedPrompt || prompt);

        // Save to history
        saveToHistory(data.images, prompt, selectedMode, aspectRatio);

        toast.success(`Generated ${data.images.length} UGC-style image${data.images.length > 1 ? "s" : ""}!`);
      } else {
        throw new Error("No images returned");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate. Please check your API key in Vercel settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `ugc-${selectedMode}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard");
  };

  const regenerate = (item: GeneratedImage) => {
    setPrompt(item.prompt);
    setSelectedMode(item.mode);
    setAspectRatio(item.aspectRatio);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Prompt loaded. Click Generate to create new variations.");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("ugc-history");
    toast.success("History cleared");
  };

  const useFromHistory = (item: GeneratedImage) => {
    setPrompt(item.prompt);
    setSelectedMode(item.mode);
    setAspectRatio(item.aspectRatio);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentMode = MODES.find(m => m.id === selectedMode)!;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-xl tracking-tight">UGC AI Studio</h1>
              <p className="text-[10px] text-zinc-500 -mt-1">Realistic User-Generated Content</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="px-3 py-1.5 rounded-full bg-zinc-900 text-zinc-400 text-xs flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Powered by Flux
            </div>
            <a 
              href="https://vercel.com" 
              target="_blank"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              Deployed on Vercel <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 text-xs mb-4 border border-zinc-800">
            <span className="text-violet-400">NEW</span> 
            <span className="text-zinc-400">Authentic UGC images in seconds</span>
          </div>
          <h2 className="text-5xl font-semibold tracking-tighter mb-3">
            Generate Realistic<br />UGC Images with AI
          </h2>
          <p className="text-xl text-zinc-400 max-w-md mx-auto">
            Create authentic user-generated content style photos for social media, 
            e-commerce, and marketing.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Mode Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Choose UGC Mode</h3>
                  <p className="text-sm text-zinc-500">Select the style that fits your content</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`mode-card p-4 rounded-2xl border text-left transition-all ${
                      selectedMode === mode.id 
                        ? "active border-violet-500 bg-zinc-900" 
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="font-medium text-sm mb-1">{mode.label}</div>
                    <div className="text-[11px] text-zinc-500 line-clamp-2">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="glass rounded-3xl p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="font-semibold">Describe your UGC image</label>
                  <p className="text-xs text-zinc-500">Be specific about product, scene, mood, or style</p>
                </div>
                <button
                  onClick={enhancePrompt}
                  disabled={!prompt.trim()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Enhance Prompt
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: A white skincare bottle on a wooden bathroom counter with natural morning light, soft shadows, minimalist aesthetic..."
                className="w-full h-28 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:border-violet-500/50 placeholder:text-zinc-600"
              />

              {/* Settings Row */}
              <div className="flex flex-wrap gap-4 mt-5">
                <div className="flex-1 min-w-[160px]">
                  <label className="text-xs text-zinc-500 block mb-1.5">Aspect Ratio</label>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
                  >
                    {ASPECT_RATIOS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="text-xs text-zinc-500 block mb-1.5">Images</label>
                  <select 
                    value={numOutputs} 
                    onChange={(e) => setNumOutputs(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
                  >
                    <option value={1}>1 image</option>
                    <option value={2}>2 images</option>
                  </select>
                </div>

                <div className="flex-1 flex items-end">
                  <button
                    onClick={generateImages}
                    disabled={isGenerating || !prompt.trim()}
                    className="generate-button w-full flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-medium text-white disabled:opacity-70"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Generate UGC Images
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Current Results */}
            {currentImages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Generated Results
                  </h3>
                  <button 
                    onClick={() => copyPrompt(currentPrompt)}
                    className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy enhanced prompt
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentImages.map((url, index) => (
                    <div key={index} className="group relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900">
                      <img 
                        src={url} 
                        alt={`UGC generation ${index + 1}`}
                        className="w-full aspect-square object-cover image-result"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex gap-2">
                        <button
                          onClick={() => downloadImage(url, index)}
                          className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-sm font-medium py-2.5 rounded-2xl hover:bg-zinc-200 active:scale-[0.985] transition-all"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                        <button
                          onClick={() => copyPrompt(currentPrompt)}
                          className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all flex items-center"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-center text-zinc-500 mt-3">
                  Images are generated with Flux • Results may vary
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - History */}
          <div className="lg:col-span-5">
            <div className="glass rounded-3xl border border-zinc-800 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <h3 className="font-semibold">Generation History</h3>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                    <ImageIcon className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500">Your generated images will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-auto pr-1 custom-scroll">
                  {history.map((item, index) => {
                    const modeInfo = MODES.find(m => m.id === item.mode);
                    return (
                      <div 
                        key={index} 
                        className="history-item flex gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 cursor-pointer group"
                        onClick={() => useFromHistory(item)}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {modeInfo?.label.split(" ")[0]}
                            </span>
                            <span className="text-[10px] text-zinc-500">{item.aspectRatio}</span>
                          </div>
                          <p className="text-xs text-zinc-300 line-clamp-2 leading-snug mb-2">
                            {item.prompt}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); regenerate(item); }}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-violet-600/80 flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" /> Regenerate
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-xs text-zinc-500 space-y-1">
          <p>
            Add your <span className="font-mono text-violet-400">REPLICATE_API_TOKEN</span> in Vercel Project Settings → Environment Variables
          </p>
          <p>Images are generated using black-forest-labs/flux-dev via Replicate • Free tier available</p>
        </div>
      </div>
    </div>
  );
}
