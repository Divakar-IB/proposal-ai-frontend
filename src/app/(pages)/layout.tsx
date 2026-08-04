import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Sidebar, Header, HelpPanel } from "@/components/layout";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-background p-8 pt-4">{children}</main>
        </div>
        <HelpPanel />
      </div>
    </NuqsAdapter>
  );
};

export default DashboardLayout;
