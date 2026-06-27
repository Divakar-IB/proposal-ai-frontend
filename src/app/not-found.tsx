import Link from "next/link";
import { ArrowLeft, FileX } from "lucide-react";
import { Button } from "@/components/ui";
import { BrandLogo } from "@/components/ui";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #142e7a 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-8 py-6">
        <BrandLogo theme="light" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <FileX className="w-8 h-8 text-primary" />
        </div>

        <p className="text-8xl font-bold bg-linear-to-r from-primary via-blue-600 to-indigo-400 bg-clip-text text-transparent leading-none mb-4">
          404
        </p>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-8">
          The page you're looking for doesn't exist or has been moved. Check the
          URL or head back to your workspace.
        </p>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/all-proposals">
              <ArrowLeft className="w-4 h-4" />
              Back to workspace
            </Link>
          </Button>
          <Button asChild>
            <Link href="/all-proposals">Go to proposals</Link>
          </Button>
        </div>
      </div>

      <div className="relative z-10 px-8 py-6 text-center">
        <p className="text-xs text-muted-foreground/60">
          InnoBoon Technologies · Proposal AI
        </p>
      </div>
    </div>
  );
};

export default NotFound;
