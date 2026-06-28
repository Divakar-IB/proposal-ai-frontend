import AuthLeftPanel from "@/components/pages/auth/auth-left-panel";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <AuthLeftPanel />
      <div className="flex flex-1 items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
