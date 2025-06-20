"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let result;
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }
    console.log("Auth result:", result);
    if (result.error) {
      setError(result.error.message);
    } else if (result.data?.session) {
      router.push("/dashboard");
    } else if (isLogin) {
      setError("Login failed. Please check your credentials or confirm your email.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper to parse hash fragment for access_token and refresh_token
    function parseHash(hash: string) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      return {
        access_token: params.get("access_token") || "",
        refresh_token: params.get("refresh_token") || "",
      };
    }

    const { access_token, refresh_token } = parseHash(window.location.hash);
    console.log("Parsed tokens:", { access_token, refresh_token });
    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ error }) => {
          console.log("Set session result:", error);
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
    <div className="relative max-w-md mx-auto mt-20 p-0 rounded-2xl shadow-lg overflow-hidden" style={{ background: '#FFF0E6', borderRadius: '24px' }}>
      {/* Organic shapes and illustration */}
      <div className="absolute right-6 top-6 w-24 h-24 bg-[#FFB366] rounded-full opacity-30 blur-2xl z-0" />
      <div className="absolute left-6 bottom-6 w-16 h-16 bg-[#FF8C42] rounded-full opacity-20 blur-2xl z-0" />
      <div className="relative z-10 p-10 flex flex-col items-center">
        {/* Title and subtitle */}
        <h2 className="text-3xl font-bold mb-2 text-[#4A5D52] font-display">{isLogin ? "Welcome Back!" : "Create Your Account"}</h2>
        <p className="text-lg text-[#4A5D52]/80 mb-6 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
          {isLogin ? "Log in to collaborate on grocery lists with friends and family." : "Sign up to start sharing and organizing your groceries effortlessly."}
        </p>
        {/* Tabs */}
        <div className="flex justify-center mb-8 w-full">
          <button
            className={`flex-1 py-2 rounded-full font-semibold transition text-lg ${isLogin ? 'bg-[#FFF0E6] text-[#4A5D52] shadow' : 'bg-transparent text-[#6C757D]'}`}
            style={{ border: isLogin ? '2px solid #6B8068' : '2px solid transparent', marginRight: '8px' }}
            onClick={() => setIsLogin(true)}
            type="button"
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-full font-semibold transition text-lg ${!isLogin ? 'bg-[#FFF0E6] text-[#4A5D52] shadow' : 'bg-transparent text-[#6C757D]'}`}
            style={{ border: !isLogin ? '2px solid #6B8068' : '2px solid transparent', marginLeft: '8px' }}
            onClick={() => setIsLogin(false)}
            type="button"
          >
            Sign Up
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-5 py-3 rounded-xl border border-[#E9ECEF] bg-white text-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#6B8068] transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-5 py-3 rounded-xl border border-[#E9ECEF] bg-white text-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#6B8068] transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          {error && <div className="text-[#DC3545] text-sm font-medium">{error}</div>}
          <button
            type="submit"
            className="w-full bg-[#6B8068] text-white py-3 rounded-xl font-semibold text-lg shadow hover:bg-[#4A5D52] transition"
            disabled={loading}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        {/* Toggle link */}
        <div className="mt-6 text-center">
          <button
            className="text-[#FF8C42] hover:underline text-base font-medium"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
} 