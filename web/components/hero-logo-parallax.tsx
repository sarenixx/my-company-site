"use client";

import { useEffect } from "react";

export function HeroLogoParallax() {
  useEffect(() => {
    const heroBackgroundLogo = document.querySelector<HTMLElement>(".mockup-hero-background-logo");
    if (!heroBackgroundLogo) return;

    let ticking = false;

    const applyParallax = () => {
      const scrollY = window.scrollY;
      const scale = Math.max(1, 2 - scrollY * 0.002);
      const shiftY = scrollY * 0.4;

      heroBackgroundLogo.style.setProperty("--hero-logo-shift-y", `${shiftY.toFixed(2)}px`);
      heroBackgroundLogo.style.setProperty("--hero-logo-scale", scale.toFixed(3));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(applyParallax);
    };

    applyParallax();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      heroBackgroundLogo.style.removeProperty("--hero-logo-shift-y");
      heroBackgroundLogo.style.removeProperty("--hero-logo-scale");
    };
  }, []);

  return null;
}

