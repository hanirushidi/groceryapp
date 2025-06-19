"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import toast from "react-hot-toast";

function parseHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
  };
}

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { access_token, refresh_token } = parseHash(window.location.hash);
    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            toast.error("Auth failed: " + error.message);
            router.push("/auth");
          } else {
            toast.success("Logged in!");
            router.push("/dashboard");
          }
        });
    } else {
      router.push("/auth");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Finishing sign in...</div>
    </main>
  );
} 