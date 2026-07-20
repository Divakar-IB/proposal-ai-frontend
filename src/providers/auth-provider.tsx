"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";

interface AuthUser {
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const getInitialUser = (): AuthUser | null => {
  const role = authService.getRole();
  if (!role) return null;
  return { role };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  // const router = useRouter();
  
  // useEffect(() => {
  //   if (!authService.isAuthenticated()) {
  //     router.replace("/auth/login");
  //   }
  // }, [router]);

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role ?? null,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
