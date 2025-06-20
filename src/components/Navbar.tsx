"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  // Hide navbar on /auth
  if (pathname === "/auth") return null;

  return (
    <nav className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur shadow-sm border-b border-[#E9ECEF]">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo / App Name */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}> 
          <span className="text-2xl font-bold text-[#4A5D52]">🥦 GroShare</span>
        </div>
        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <button
            className="text-[#6B8068] font-semibold hover:text-[#FF8C42] transition text-lg"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="text-[#6B8068] font-semibold hover:text-[#FF8C42] transition text-lg"
            onClick={() => router.push("/recipes")}
          >
            Recipes
          </button>
          <button
            className="text-[#6B8068] font-semibold hover:text-[#FF8C42] transition text-lg"
            onClick={() => router.push("/markets")}
          >
            Markets
          </button>
        </div>
        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-[#212529] text-sm bg-[#F8F9FA] px-3 py-1 rounded-full font-medium">{userEmail}</span>
          )}
          <button
            className="bg-[#FF8C42] text-white px-4 py-1 rounded-full font-semibold shadow hover:bg-[#FFB366] transition text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
} 