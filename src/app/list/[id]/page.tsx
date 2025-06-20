"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import toast from "react-hot-toast";

// Color palette from Design.json
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

type GroceryItem = {
  id: string;
  text: string;
  completed: boolean;
  created_by: string;
  list_id: string;
  created_at: string;
  optimistic?: boolean;
  note?: string;
};
type Suggestion = string;

export default function ListPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [listNote, setListNote] = useState("");
  const [listNoteLoading, setListNoteLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth");
      }
    });
  }, [router]);

  // Fetch items
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("grocery_items")
        .select("*")
        .eq("list_id", id)
        .order("created_at", { ascending: true });
      if (error) toast.error(error.message);
      setItems(data || []);
      setLoading(false);
    };
    fetchItems();
  }, [id]);

  // Fetch popular items for suggestions
  useEffect(() => {
    const fetchPopularItems = async () => {
      const { data, error } = await supabase.rpc('popular_grocery_items');
      if (!error && data) {
        setSuggestions((data as { text: string }[]).map((d) => d.text));
      }
    };
    fetchPopularItems();
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`grocery_items_list_${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grocery_items', filter: `list_id=eq.${id}` },
        payload => {
          const user = (payload.new && (payload.new as GroceryItem).created_by) || (payload.old && (payload.old as GroceryItem).created_by) || "Someone";
          if (payload.eventType === 'INSERT') {
            setItems(prev => [...prev, payload.new as GroceryItem]);
            toast.success(`${user} added ${(payload.new as GroceryItem).text}`);
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(item => item.id === (payload.new as GroceryItem).id ? payload.new as GroceryItem : item));
            toast.success(`${user} edited ${(payload.new as GroceryItem).text}`);
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== (payload.old as GroceryItem).id));
            toast(`${user} deleted ${(payload.old as GroceryItem).text}`, { icon: '🗑️' });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Fetch list note
  useEffect(() => {
    if (!id) return;
    const fetchListNote = async () => {
      setListNoteLoading(true);
      const { data, error } = await supabase
        .from("grocery_lists")
        .select("note")
        .eq("id", id)
        .single();
      if (!error && data) setListNote(data.note || "");
      setListNoteLoading(false);
    };
    fetchListNote();
  }, [id]);

  // Update list note
  const handleListNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setListNote(e.target.value);
    await supabase.from("grocery_lists").update({ note: e.target.value }).eq("id", id);
  };

  // Add item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const session = (await supabase.auth.getSession()).data.session;
    const userId = session?.user?.id || null;
    // Optimistic UI: add a temp item (not sent to DB)
    setItems(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        text: newItem,
        completed: false,
        created_by: userId as string || "",
        list_id: id as string,
        created_at: new Date().toISOString(),
        optimistic: true,
      } as GroceryItem,
    ]);
    setNewItem("");
    inputRef.current?.focus();
    // Send text, list_id, and created_by to DB
    const { error } = await supabase.from("grocery_items").insert([{ text: newItem, list_id: id, created_by: userId }]);
    if (error) toast.error(error.message);
  };

  // Toggle complete
  const handleToggle = async (item: GroceryItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i));
    const { error } = await supabase.from("grocery_items").update({ completed: !item.completed }).eq("id", item.id);
    if (error) toast.error(error.message);
  };

  // Edit item
  const handleEdit = async (item: GroceryItem, newText: string) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, text: newText } : i));
    const { error } = await supabase.from("grocery_items").update({ text: newText }).eq("id", item.id);
    if (error) toast.error(error.message);
  };

  // Delete item
  const handleDelete = async (item: GroceryItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    const { error } = await supabase.from("grocery_items").delete().eq("id", item.id);
    if (error) toast.error(error.message);
  };

  // Share link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("List URL copied!");
  };

  return (
    <main className="min-h-screen bg-[#FFF0E6] pb-16">
      {/* List Notes Section */}
      <section className="max-w-2xl mx-auto mt-8 mb-4 px-4">
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <label className="block text-lg font-semibold mb-2 text-[#212529]">Shared Notes</label>
          <textarea
            className="w-full min-h-[64px] rounded-lg border border-[#E9ECEF] px-4 py-2 text-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#6B8068] transition resize-vertical"
            placeholder="Add notes for your list (e.g., Don't forget coupons, or special instructions)"
            value={listNote}
            onChange={handleListNoteChange}
            disabled={listNoteLoading}
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </section>

      {/* Hero Card */}
      <section className="max-w-2xl mx-auto mt-8 mb-8 p-8 rounded-2xl shadow-lg flex flex-col items-center relative overflow-hidden" style={{ background: COLORS.darkGreen }}>
        {/* Illustration placeholder */}
        <div className="absolute right-6 top-6 w-24 h-24 bg-[#FFB366] rounded-full opacity-30 blur-2xl" />
        <div className="absolute left-6 bottom-6 w-16 h-16 bg-[#FF8C42] rounded-full opacity-20 blur-2xl" />
        <h1 className="text-4xl font-bold text-white mb-2 font-display">Your Grocery List</h1>
        <p className="text-lg text-white/90 mb-4">Collaborate and shop smarter together!</p>
        <button
          onClick={handleShare}
          className="bg-[#FF8C42] text-white font-semibold px-6 py-2 rounded-full shadow hover:bg-[#FFB366] transition mb-2"
        >
          Share List
        </button>
      </section>

      {/* Add Item Bar */}
      <section className="max-w-2xl mx-auto mb-8 px-4">
        <form onSubmit={handleAddItem} className="flex gap-3 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Add a new item..."
            className="flex-1 px-5 py-3 rounded-xl border border-[#E9ECEF] bg-white text-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#6B8068] transition"
            value={newItem}
            onChange={e => {
              setNewItem(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(newItem.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            style={{ fontFamily: 'Inter, sans-serif' }}
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-[#6B8068] text-white px-6 py-3 rounded-xl font-semibold text-lg shadow hover:bg-[#4A5D52] transition"
          >
            Add
          </button>
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 top-14 w-full bg-white border border-[#E9ECEF] rounded-xl shadow z-10 max-h-48 overflow-y-auto">
              {suggestions
                .filter(s => s.toLowerCase().includes(newItem.toLowerCase()) && s.toLowerCase() !== newItem.toLowerCase())
                .slice(0, 5)
                .map(s => (
                  <li
                    key={s}
                    className="px-5 py-2 cursor-pointer hover:bg-[#F8F9FA] text-[#212529] text-lg"
                    onMouseDown={() => {
                      setNewItem(s);
                      setShowSuggestions(false);
                      inputRef.current?.focus();
                    }}
                  >
                    {s}
                  </li>
                ))}
            </ul>
          )}
        </form>
      </section>

      {/* Grocery Items List */}
      <section className="max-w-2xl mx-auto px-4">
        {loading ? (
          <div className="text-center text-[#6C757D] py-12 text-lg">Loading...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-[#FFB366] flex items-center justify-center text-4xl">🥕</div>
            <div className="text-xl font-semibold mb-2" style={{ color: COLORS.textPrimary }}>Your list is empty!</div>
            <div className="text-[#6C757D] mb-4">Add your first item to get started.</div>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map(item => (
              <GroceryItemComponent
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function GroceryItemComponent({ item, onToggle, onEdit, onDelete }: { item: GroceryItem; onToggle: (item: GroceryItem) => void; onEdit: (item: GroceryItem, newText: string) => void; onDelete: (item: GroceryItem) => void; }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [note, setNote] = useState(item.note || "");
  const [noteLoading, setNoteLoading] = useState(false);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    if (editText !== item.text) onEdit(item, editText);
  };

  // Update note in Supabase
  const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    setNoteLoading(true);
    await supabase.from("grocery_items").update({ note: e.target.value }).eq("id", item.id);
    setNoteLoading(false);
  };

  return (
    <li className="flex flex-col gap-2 bg-white rounded-xl shadow p-4 group transition hover:shadow-lg">
      <div className="flex items-center gap-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => onToggle(item)}
            className="w-5 h-5 accent-[#6B8068] rounded-full border-2 border-[#E9ECEF] mr-3 transition"
          />
        </label>
        {editing ? (
          <form onSubmit={handleEditSubmit} className="flex-1 flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-[#E9ECEF] rounded-lg text-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#6B8068]"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              autoFocus
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <button type="submit" className="text-[#6B8068] font-semibold px-3 py-2 rounded-lg hover:bg-[#F8F9FA] transition">Save</button>
          </form>
        ) : (
          <span
            className={`flex-1 text-lg ${item.completed ? "line-through text-[#6C757D]" : "text-[#212529]"} cursor-pointer`}
            onDoubleClick={() => setEditing(true)}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {item.text}
          </span>
        )}
        <button
          className="text-[#E85A2B] hover:bg-[#FFF0E6] rounded-full p-2 ml-2 transition opacity-0 group-hover:opacity-100"
          onClick={() => onDelete(item)}
          title="Delete"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#E85A2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      {/* Item Note */}
      <textarea
        className="w-full min-h-[32px] rounded-lg border border-[#E9ECEF] px-3 py-2 text-base text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#6B8068] transition resize-vertical"
        placeholder="Add a note (e.g., Get lactose-free)"
        value={note}
        onChange={handleNoteChange}
        disabled={noteLoading}
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
    </li>
  );
} 