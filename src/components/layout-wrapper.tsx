"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Chatbot from "@/components/chatbot";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-x-hidden">
      {/* Background Flickering Grid */}
      <div className="absolute inset-0 top-0 left-0 right-0 h-[100px] overflow-hidden z-0 pointer-events-none">
        <FlickeringGrid
          className="h-full w-full"
          squareSize={2}
          gridGap={2}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>

      {/* Main Content Pane */}
      <div
        className={`transition-all duration-500 ease-in-out z-10 ${
          isChatOpen 
            ? "w-full md:w-1/2" 
            : "w-full"
        }`}
      >
        <div className="relative max-w-2xl py-12 pb-24 sm:py-24 px-6 mx-auto">
          {children}
        </div>
      </div>

      {/* Navigation Dock */}
      <Navbar isChatOpen={isChatOpen} />

      {/* Chatbot Interface */}
      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
}
