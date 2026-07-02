import { HelpCircle } from "lucide-react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Sidebar, Header } from "@/components/layout";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-background p-8">{children}</main>
        </div>
        <button className="fixed bottom-6 right-6 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity z-50">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </NuqsAdapter>
  );
};

export default DashboardLayout;
