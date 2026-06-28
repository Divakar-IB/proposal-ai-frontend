import { Sidebar, Header } from "@/components/layout";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
