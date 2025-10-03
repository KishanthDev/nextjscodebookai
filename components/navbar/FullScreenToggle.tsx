"use client";
import React, { useState, useEffect } from "react";
import { Maximize, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FullScreenToggle = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <Button
      variant="outline"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
      className="flex items-center gap-2 rounded-lg px-2 py-2 font-medium text-primary transition-all"
    >
      {isFullscreen ? <Minimize2 size={18} /> : <Maximize size={18} />}
    </Button>
  );
};

export default FullScreenToggle;