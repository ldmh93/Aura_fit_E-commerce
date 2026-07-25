"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils";

export function ImageGallery({
  images,
  video,
  name,
}: {
  images: string[];
  video: string | null;
  name: string;
}) {
  const slides = images.length ? images : [""];
  const [index, setIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Miniaturas */}
      <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
        {slides.map((image, i) => (
          <button
            key={`${image}-${i}`}
            type="button"
            onClick={() => {
              setIndex(i);
              setShowVideo(false);
            }}
            aria-label={`Ver imagen ${i + 1} de ${name}`}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-all md:h-24 md:w-20",
              index === i && !showVideo
                ? "border-aura"
                : "border-white/10 opacity-60 hover:opacity-100",
            )}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}

        {video ? (
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            aria-label={`Ver video de ${name}`}
            className={cn(
              "relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-[10px] uppercase tracking-widest transition-all md:h-24 md:w-20",
              showVideo
                ? "border-aura text-aura"
                : "border-white/10 text-mist hover:text-white",
            )}
          >
            Video
          </button>
        ) : null}
      </div>

      {/* Principal */}
      <div className="relative aspect-4/5 flex-1 overflow-hidden rounded-2xl border border-white/8 bg-graphite">
        {showVideo && video ? (
          <video
            src={video}
            controls
            playsInline
            muted
            preload="none"
            poster={slides[0]}
            className="h-full w-full object-cover"
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={slides[index] ?? ""}
                alt={`${name} — vista ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
