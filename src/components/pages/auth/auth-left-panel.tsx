import Image from "next/image";
import { Zap, FileText, BarChart2 } from "lucide-react";

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

const AuthLeftPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-10 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-16">
          <Image
            src="/images/brand_logo_lite.png"
            alt="InnoBoon logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          <div className="flex flex-col leading-none">
            <span className="text-white/50 text-xs">InnoBoon</span>
            <span className="text-white font-semibold text-base">Proposal AI</span>
          </div>
        </div>

        <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-4">
          Automated Proposal Generation
        </p>
        <h1 className="text-white text-5xl font-bold leading-tight mb-3">
          Win more deals.
        </h1>
        <h2 className="text-white/80 text-5xl font-light italic leading-tight mb-6">
          Write less.
        </h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-12">
          InnoBoon's Proposal AI turns your brief into a polished, on-brand proposal in under a
          minute — so your team can focus on closing.
        </p>

        <div className="flex flex-col gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-white/50 text-sm">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <div className="bg-white/10 rounded-xl p-6 mb-6">
          <p className="text-white/90 text-sm italic leading-relaxed mb-4">
            &quot;We went from 4 hours per proposal to 18 minutes. Close rate went up 31%.&quot;
          </p>
          <div>
            <p className="text-white text-sm font-semibold">Sarah Chen</p>
            <p className="text-white/50 text-xs">Head of Sales, Meridian Agency</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLeftPanel;
