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
    <div className="max-w-sm mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? "Login" : "Sign Up"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
} 