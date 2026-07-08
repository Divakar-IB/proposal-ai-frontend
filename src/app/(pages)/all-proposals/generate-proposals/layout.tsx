import { ProposalContextPanel } from "@/components/pages/generate-proposals";
import { Breadcrumb } from "@/components/shared";

const ProposalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-[calc(100vh-5rem)] -m-8 -mt-4 overflow-auto">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-10 bg-background px-6 py-4">
          <Breadcrumb
            items={[
              { label: "All Proposals", href: "/all-proposals" },
              { label: "Generate Proposal" },
            ]}
          />
        </div>
        <div className="flex-1 px-6">{children}</div>
      </div>

      <div className="sticky top-0 self-start h-[calc(100vh-5rem)]">
        <ProposalContextPanel />
      </div>
    </div>
  );
};

export default ProposalLayout;
