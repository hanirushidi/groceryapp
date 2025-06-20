"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const COLORS = {
  darkGreen: "#4A5D52",
  mediumGreen: "#6B8068",
  lightGreen: "#8FA085",
  warmOrange: "#FF8C42",
  peachBackground: "#FFF0E6",
  white: "#FFFFFF",
  lightGray: "#F8F9FA",
  mediumGray: "#E9ECEF",
  darkGray: "#6C757D",
  priceOrange: "#FF6B35",
  textPrimary: "#212529",
  textSecondary: "#6C757D",
};

type GroceryList = {
  id: string;
  name: string;
  created_at: string;
};

export default function DashboardPage() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth");
      }
    });
  }, [router]);

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("grocery_lists")
        .select("id, name, created_at");
      if (error) toast.error(error.message);
      setLists(data || []);
      setLoading(false);
    };
    fetchLists();
  }, []);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const { data, error } = await supabase
      .from("grocery_lists")
      .insert([{ name: newListName }])
      .select();
    if (error) {
      toast.error(error.message);
    } else {
      setLists([...(lists || []), ...(data || [])]);
      setNewListName("");
      toast.success("List created!");
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm("Delete this list? This cannot be undone.")) return;
    const { error } = await supabase.from("grocery_lists").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      setLists(prev => prev.filter(list => list.id !== id));
      toast.success("List deleted!");
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF0E6] pb-16">
      {/* Hero Card */}
      <section className="max-w-2xl mx-auto mt-8 mb-8 p-8 rounded-2xl shadow-lg flex flex-col items-center relative overflow-hidden" style={{ background: COLORS.darkGreen }}>
        <div className="absolute right-6 top-6 w-24 h-24 bg-[#FFB366] rounded-full opacity-30 blur-2xl" />
        <div className="absolute left-6 bottom-6 w-16 h-16 bg-[#FF8C42] rounded-full opacity-20 blur-2xl" />
        <h1 className="text-4xl font-bold text-white mb-2 font-display">Your Grocery Lists</h1>
        <p className="text-lg text-white/90 mb-4">Create, share, and collaborate on your grocery lists!</p>
      </section>
      {/* Add List Bar */}
      <section className="max-w-2xl mx-auto mb-8 px-4">
        <form onSubmit={handleCreateList} className="flex gap-3">
          <input
            type="text"
            placeholder="New list name"
            className="flex-1 px-5 py-3 rounded-xl border border-[#E9ECEF] bg-white text-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#6B8068] transition"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            type="submit"
            className="bg-[#6B8068] text-white px-6 py-3 rounded-xl font-semibold text-lg shadow hover:bg-[#4A5D52] transition"
          >
            Add List
          </button>
        </form>
      </section>
      {/* Lists */}
      <section className="max-w-2xl mx-auto px-4">
        {loading ? (
          <div className="text-center text-[#6C757D] py-12 text-lg">Loading...</div>
        ) : lists.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-[#FFB366] flex items-center justify-center text-4xl">📝</div>
            <div className="text-xl font-semibold mb-2" style={{ color: COLORS.textPrimary }}>No lists yet!</div>
            <div className="text-[#6C757D] mb-4">Create your first grocery list above.</div>
          </div>
        ) : (
          <ul className="space-y-4">
            {lists.map(list => (
              <li key={list.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow group transition hover:shadow-lg">
                <span className="font-medium text-lg text-[#212529]">{list.name}</span>
                <div className="flex gap-2">
                  <button
                    className="bg-[#FF8C42] text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-[#FFB366] transition text-sm"
                    onClick={() => router.push(`/list/${list.id}`)}
                  >
                    Open
                  </button>
                  <button
                    className="bg-red-100 text-red-600 px-3 py-2 rounded-full font-semibold shadow hover:bg-red-200 transition text-sm flex items-center"
                    title="Delete list"
                    onClick={() => handleDeleteList(list.id)}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#E85A2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
} 