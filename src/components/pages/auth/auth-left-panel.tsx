"use client";

import Image from "next/image";
import { Zap, FileText, BarChart2 } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Zap,
    title: "Generate in seconds",
    description: "AI drafts full proposals from a single brief",
  },
  {
    icon: FileText,
    title: "On-brand, every time",
    description: "Your tone, structure, and pricing — locked in",
  },
  {
    icon: BarChart2,
    title: "Track what closes",
    description: "Know which proposals convert and why",
  },
];

const EASE = [0.25, 0.1, 0.25, 1] as const;
const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

const AuthLeftPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-10 relative overflow-hidden">
      {/* Static dot grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Animated glow blobs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, 24, 0], y: [0, -32, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"
        animate={{ x: [0, -20, 0], y: [0, 28, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Main content */}
      <div className="relative z-10">
        {/* Logo */}
        <motion.div className="flex items-center gap-3 mb-16" {...fadeUp(0)}>
          <Image
            src="/images/brand_logo_lite.png"
            alt="InnoBoon logo"
            width={32}
            height={32}
            className="rounded-md"
            style={{ height: "auto" }}
          />
          <div className="flex flex-col leading-none">
            <span className="text-white/50 text-xs">InnoBoon</span>
            <span className="text-white font-semibold text-base">Proposal AI</span>
          </div>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-4"
          {...fadeUp(0.15)}
        >
          Automated Proposal Generation
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="text-white text-5xl font-bold leading-tight mb-3"
          {...fadeUp(0.25)}
        >
          Win more deals.
        </motion.h1>
        <motion.h2
          className="text-white/80 text-5xl font-light italic leading-tight mb-6"
          {...fadeUp(0.35)}
        >
          Write less.
        </motion.h2>

        {/* Body */}
        <motion.p
          className="text-white/60 text-sm leading-relaxed max-w-sm mb-12"
          {...fadeUp(0.45)}
        >
          {"InnoBoon's"} Proposal AI turns your brief into a polished, on-brand
          proposal in under a minute — so your team can focus on closing.
        </motion.p>

        {/* Features */}
        <div className="flex flex-col gap-6">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              className="flex items-start gap-4"
              {...fadeUp(0.55 + i * 0.1)}
            >
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-white/50 text-sm">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <motion.div className="relative z-10" {...fadeUp(0.9)}>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
          <p className="text-white/90 text-sm italic leading-relaxed mb-4">
            &quot;We went from 4 hours per proposal to 18 minutes. Close rate went up 31%.&quot;
          </p>
          <div>
            <p className="text-white text-sm font-semibold">InnoBoon Technologies</p>
            <p className="text-white/50 text-xs">innoboon.com</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLeftPanel;
