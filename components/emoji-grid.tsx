"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Heart } from "lucide-react";

const mockEmojis = [
  "/man-emoji.png",
  "/lion-emoji.png",
  "/dog-emoji.png",
  "/old-man-emoji.png",
];

export default function EmojiGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
      {mockEmojis.map((emoji, index) => (
        <div
          key={index}
          className="relative"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Image
            src={emoji}
            alt=""
            width={128}
            height={128}
            className="rounded-lg"
          />
          {hoveredIndex === index && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button className="p-2 bg-white rounded-full shadow-md">
                <Download size={16} />
              </button>
              <button className="p-2 bg-white rounded-full shadow-md">
                <Heart size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
