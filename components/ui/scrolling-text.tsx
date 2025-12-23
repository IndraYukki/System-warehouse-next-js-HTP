"use client";

import { useEffect, useRef } from "react";

interface ScrollingTextProps {
  text: string;
}

export function ScrollingText({ text }: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;

    // Duplikasi konten agar efek berjalan terus menerus
    content.innerHTML = text + " " + text;

    let animationFrameId: number;
    let position = container.offsetWidth;

    
    const animate = () => {
      // Pindahkan teks ke kiri
      position -= 0.5; // Kecepatan sedang agar mudah dibaca
      
      // Jika teks telah bergerak melewati layar, ulangi dari kanan
      if (position < -content.offsetWidth / 2) {
        position = container.offsetWidth;
      }
      
      content.style.transform = `translateX(${position}px)`;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full overflow-hidden h-8"
    >
      <div
        ref={contentRef}
        className="absolute top-0 h-full flex items-center text-blue-600 font-bold whitespace-nowrap"
        style={{ position: 'absolute' }}
      />
    </div>
  );
}