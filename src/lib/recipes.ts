import { supabase } from './supabaseClient';

// Get all recipes for a user
export async function getRecipes(userId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Get a single recipe by id
export async function getRecipe(id: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Add a new recipe
export async function addRecipe(recipe: {
  user_id: string;
  title: string;
  ingredients: string;
  instructions: string;
}) {
  const { data, error } = await supabase
    .from('recipes')
    .insert([recipe])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update a recipe
export async function updateRecipe(id: string, updates: {
  title?: string;
  ingredients?: string;
  instructions?: string;
}) {
  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete a recipe
export async function deleteRecipe(id: string) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
} 