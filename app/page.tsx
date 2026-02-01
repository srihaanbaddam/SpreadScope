"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Homepage } from "@/components/homepage";
import { SplashScreen } from "@/components/splash-screen";

export default function Page() {
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("spreadscope-splash-seen");
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("spreadscope-splash-seen", "true");
    setShowSplash(false);
  };

  if (showSplash === null) {
    return null;
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div
        style={{
          opacity: showSplash ? 0 : 1,
          transition: "opacity 0.5s ease-out",
        }}
      >
        <Navigation />
        <Homepage />
      </div>
    </>
  );
}
