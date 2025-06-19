"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRecipes, addRecipe, updateRecipe, deleteRecipe } from "../../lib/recipes";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import { Fragment } from "react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", ingredients: "", instructions: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [addingToList, setAddingToList] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth");
      } else {
        setUserId(session.user.id);
        fetchRecipes(session.user.id);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const fetchLists = async () => {
      const { data, error } = await supabase
        .from("grocery_lists")
        .select("id, name");
      if (!error && data) setLists(data);
    };
    fetchLists();
  }, [userId]);

  const fetchRecipes = async (uid: string) => {
    setLoading(true);
    try {
      const data = await getRecipes(uid);
      setRecipes(data || []);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.ingredients.trim() || !form.instructions.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      if (editingId) {
        await updateRecipe(editingId, form);
        toast.success("Recipe updated");
      } else {
        await addRecipe({ ...form, user_id: userId! });
        toast.success("Recipe added");
      }
      setForm({ title: "", ingredients: "", instructions: "" });
      setShowForm(false);
      setEditingId(null);
      fetchRecipes(userId!);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEdit = (recipe: any) => {
    setForm({ title: recipe.title, ingredients: recipe.ingredients, instructions: recipe.instructions });
    setEditingId(recipe.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    try {
      await deleteRecipe(id);
      toast.success("Recipe deleted");
      fetchRecipes(userId!);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openListModal = (recipe: any) => {
    setSelectedRecipe(recipe);
    setShowListModal(true);
    setSelectedListId("");
    setNewListName("");
  };

  const handleAddToList = async () => {
    if (!selectedRecipe) return;
    setAddingToList(true);
    let listId = selectedListId;
    try {
      // Create new list if needed
      if (!listId && newListName.trim()) {
        const { data, error } = await supabase
          .from("grocery_lists")
          .insert([{ name: newListName }])
          .select()
          .single();
        if (error) throw error;
        listId = data.id;
        setLists(prev => [...prev, data]);
      }
      if (!listId) {
        toast.error("Please select or create a list");
        setAddingToList(false);
        return;
      }
      // Add each ingredient as a grocery item
      const ingredients = selectedRecipe.ingredients.split("\n").map((i: string) => i.trim()).filter(Boolean);
      if (ingredients.length === 0) {
        toast.error("No ingredients to add");
        setAddingToList(false);
        return;
      }
      const session = (await supabase.auth.getSession()).data.session;
      const userId = session?.user?.id || null;
      const { error } = await supabase.from("grocery_items").insert(
        ingredients.map((text: string) => ({ text, list_id: listId, created_by: userId }))
      );
      if (error) throw error;
      toast.success("Ingredients added to grocery list!");
      setShowListModal(false);
      setSelectedRecipe(null);
      router.push(`/list/${listId}`);
    } catch (e: any) {
      toast.error(e.message);
    }
    setAddingToList(false);
  };

  return (
    <main className="min-h-screen bg-[#FFF0E6] pb-16">
      <section className="max-w-3xl mx-auto mt-8 mb-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#4A5D52]">Your Recipes</h1>
          <button
            className="bg-[#FF8C42] text-white font-semibold px-4 py-2 rounded-full shadow hover:bg-[#FFB366] transition"
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: "", ingredients: "", instructions: "" }); }}
          >
            {showForm ? "Cancel" : "Add Recipe"}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleAddOrUpdate} className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2 text-[#212529]">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-[#E9ECEF] px-4 py-2 text-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#6B8068]"
                placeholder="Recipe title"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2 text-[#212529]">Ingredients</label>
              <textarea
                name="ingredients"
                value={form.ingredients}
                onChange={handleFormChange}
                className="w-full min-h-[64px] rounded-lg border border-[#E9ECEF] px-4 py-2 text-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#6B8068]"
                placeholder="One per line, e.g. 2 eggs\n1 cup milk"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2 text-[#212529]">Instructions</label>
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleFormChange}
                className="w-full min-h-[64px] rounded-lg border border-[#E9ECEF] px-4 py-2 text-lg text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#6B8068]"
                placeholder="Step-by-step instructions"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#4A5D52] text-white font-semibold px-6 py-2 rounded-full shadow hover:bg-[#6B8068] transition"
            >
              {editingId ? "Update Recipe" : "Add Recipe"}
            </button>
          </form>
        )}
        {loading ? (
          <div className="text-center text-[#6C757D] py-12">Loading recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center text-[#6C757D] py-12">No recipes yet. Add your first recipe!</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-[#4A5D52] mb-2">{recipe.title}</h2>
                <div className="mb-2">
                  <span className="font-semibold text-[#6C757D]">Ingredients:</span>
                  <ul className="list-disc ml-6 text-[#212529]">
                    {recipe.ingredients.split("\n").map((ing: string, idx: number) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <span className="font-semibold text-[#6C757D]">Instructions:</span>
                  <div className="whitespace-pre-line text-[#212529]">{recipe.instructions}</div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    className="bg-[#FF8C42] text-white px-4 py-1 rounded-full hover:bg-[#FFB366] transition text-sm"
                    onClick={() => openListModal(recipe)}
                  >
                    Add ingredients to grocery list
                  </button>
                  <button
                    className="bg-[#6B8068] text-white px-4 py-1 rounded-full hover:bg-[#8FA085] transition text-sm"
                    onClick={() => handleEdit(recipe)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-[#E4572E] text-white px-4 py-1 rounded-full hover:bg-[#FF8C42] transition text-sm"
                    onClick={() => handleDelete(recipe.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* List Selection Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-2xl text-[#6C757D] hover:text-[#FF8C42]"
              onClick={() => setShowListModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#4A5D52]">Add ingredients to grocery list</h2>
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-[#212529]">Choose a list</label>
              <select
                className="w-full rounded-lg border border-[#E9ECEF] px-4 py-2 text-lg text-[#212529] mb-2"
                value={selectedListId}
                onChange={e => { setSelectedListId(e.target.value); setNewListName(""); }}
              >
                <option value="">-- Select a list --</option>
                {lists.map(list => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>
              <div className="text-center text-[#6C757D] my-2">or</div>
              <input
                type="text"
                className="w-full rounded-lg border border-[#E9ECEF] px-4 py-2 text-lg text-[#212529]"
                placeholder="New list name"
                value={newListName}
                onChange={e => { setNewListName(e.target.value); setSelectedListId(""); }}
              />
            </div>
            <button
              className="bg-[#FF8C42] text-white font-semibold px-6 py-2 rounded-full shadow hover:bg-[#FFB366] transition w-full"
              onClick={handleAddToList}
              disabled={addingToList}
            >
              {addingToList ? "Adding..." : "Add Ingredients"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
} 