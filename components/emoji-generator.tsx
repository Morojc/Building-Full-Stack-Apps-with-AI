"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Download, Heart } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "./skeleton";

type EmojiStatus = {
  imageUrl: string | null;
  isLoading: boolean;
  loadingStep: string;
  isLiked: boolean;
};

const CACHE_KEY = 'cachedEmojis';

export default function EmojiGenerator({ initialEmojis = [] }: { initialEmojis?: string[] }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [emojiStatuses, setEmojiStatuses] = useState<EmojiStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  const defaultPrompts = ["cat", "dog", "bird", "horse", "fish", "rabbit", "elephant", "lion"];

  useEffect(() => {
    loadCachedEmojis();
  }, []);

  const loadCachedEmojis = () => {
    if (typeof window !== 'undefined') {
      const cachedEmojis = localStorage.getItem(CACHE_KEY);
      if (cachedEmojis) {
        setEmojiStatuses(JSON.parse(cachedEmojis));
      } else if (initialEmojis.length > 0) {
        const initialStatuses = initialEmojis.map(url => ({
          imageUrl: url,
          isLoading: false,
          loadingStep: "",
          isLiked: false
        }));
        setEmojiStatuses(initialStatuses);
        localStorage.setItem(CACHE_KEY, JSON.stringify(initialStatuses));
      } else {
        handleGenerateInitial();
      }
    }
  };

  const handleGenerateInitial = async () => {
    setIsGenerating(true);
    setError(null);
    const prompts = defaultPrompts.slice(0, 8);

    try {
      const generatedEmojis = await Promise.all(
        prompts.map(async (prompt) => {
          const data = await generateEmoji(prompt);
          return { imageUrl: data.imageUrl, isLoading: false, loadingStep: "", isLiked: false };
        })
      );

      setEmojiStatuses(generatedEmojis);
      localStorage.setItem(CACHE_KEY, JSON.stringify(generatedEmojis));
    } catch (error) {
      console.error("Error generating initial emojis:", error);
      setError("Error generating initial emojis. Please refresh the page.");
    }
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    const newEmoji: EmojiStatus = { imageUrl: null, isLoading: true, loadingStep: "Generating...", isLiked: false };
    setEmojiStatuses(prev => [newEmoji, ...prev]);

    try {
      const data = await generateEmoji(prompt);
      setEmojiStatuses(prev => [
        { imageUrl: data.imageUrl, isLoading: false, loadingStep: "", isLiked: false },
        ...prev.slice(1)
      ]);
    } catch (error) {
      console.error("Error generating emoji:", error);
      setError("Error generating emoji. Please try again.");
      setEmojiStatuses(prev => prev.slice(1));
    }
    setIsGenerating(false);
  };

  const generateEmoji = async (prompt: string) => {
    const response = await fetch("/api/generate-emoji", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Failed to generate emoji");
    return data;
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emoji-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading emoji:', error);
      // Optionally, you can set an error state here to show a message to the user
    }
  };

  const handleLike = (index: number) => {
    setEmojiStatuses(prev => {
      const newStatuses = [...prev];
      if (index < newStatuses.length) {
        newStatuses[index] = {
          ...newStatuses[index],
          isLiked: !newStatuses[index].isLiked,
        };
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(newStatuses));
      return newStatuses;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter a prompt to generate an emoji"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {emojiStatuses.map((status, index) => (
          <EmojiCard key={index} status={status} index={index} handleDownload={handleDownload} handleLike={handleLike} />
        ))}
      </div>
    </div>
  );
}

function EmojiCard({ status, index, handleDownload, handleLike }: { 
  status: EmojiStatus, 
  index: number, 
  handleDownload: (imageUrl: string, index: number) => void, 
  handleLike: (index: number) => void 
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {status.isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
          <Skeleton className="w-16 h-16 mb-2" />
          <p className="text-xs text-center">{status.loadingStep}</p>
        </div>
      ) : status.imageUrl ? (
        <>
          <div className="relative w-full h-full">
            <Image
              src={status.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="rounded-lg object-cover"
            />
          </div>
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDownload(status.imageUrl!, index);
                }}
              >
                <Download className="h-6 w-6 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLike(index);
                }}
              >
                <Heart className={`h-6 w-6 ${status.isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
