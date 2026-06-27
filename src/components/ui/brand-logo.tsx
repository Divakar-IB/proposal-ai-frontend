import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  theme?: "light" | "dark";
  className?: string;
}

const BrandLogo = ({ theme = "light", className }: BrandLogoProps) => {
  const logoSrc =
    theme === "dark"
      ? "/images/brand_logo_lite.png"
      : "/images/brand_logo_dark.png";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image src={logoSrc} alt="Proposal AI" width={32} height={32} className="rounded-md" />
      <span
        className={cn(
          "text-2xl font-semibold bg-clip-text text-transparent bg-linear-to-r font-mono",
          theme === "dark"
            ? "from-blue-300 via-indigo-200 to-white"
            : "from-primary via-blue-800 to-blue-700"
        )}
      >
        Proposal AI
      </span>
    </div>
  );
};

export { BrandLogo };
