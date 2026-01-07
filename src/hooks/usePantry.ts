import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFamily } from "./useFamily";
import { toast } from "@/hooks/use-toast";

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  currentAmount: number;
  idealAmount: number;
  unit: string;
  expirationDate?: string;
}

const INITIAL_ITEMS: PantryItem[] = [
  { id: "1", name: "Leite Integral", category: "dairy", currentAmount: 1, idealAmount: 4, unit: "L", expirationDate: "2024-01-15" },
  { id: "2", name: "Queijo Mussarela", category: "dairy", currentAmount: 250, idealAmount: 500, unit: "g" },
  { id: "3", name: "Iogurte Natural", category: "dairy", currentAmount: 6, idealAmount: 6, unit: "un" },
  { id: "4", name: "Banana", category: "fruits", currentAmount: 6, idealAmount: 12, unit: "un" },
  { id: "5", name: "Maçã", category: "fruits", currentAmount: 2, idealAmount: 8, unit: "un" },
  { id: "6", name: "Tomate", category: "fruits", currentAmount: 0, idealAmount: 6, unit: "un" },
  { id: "7", name: "Frango", category: "proteins", currentAmount: 500, idealAmount: 1000, unit: "g" },
  { id: "8", name: "Carne Moída", category: "proteins", currentAmount: 250, idealAmount: 1000, unit: "g" },
  { id: "9", name: "Arroz", category: "grains", currentAmount: 4, idealAmount: 5, unit: "kg" },
  { id: "10", name: "Feijão", category: "grains", currentAmount: 500, idealAmount: 1000, unit: "g" },
  { id: "11", name: "Macarrão", category: "grains", currentAmount: 3, idealAmount: 3, unit: "pct" },
  { id: "12", name: "Detergente", category: "cleaning", currentAmount: 1, idealAmount: 4, unit: "un" },
  { id: "13", name: "Sabão em Pó", category: "cleaning", currentAmount: 500, idealAmount: 1000, unit: "g" },
  { id: "14", name: "Ração do Rex", category: "others", currentAmount: 2, idealAmount: 8, unit: "kg" },
];

export function usePantry() {
  const { user } = useAuth();
  const { family } = useFamily();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (family?.id) {
      fetchPantry();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [family?.id]);

  const fetchPantry = async () => {
    if (!family?.id) return;
    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('family_id', family.id)
        .order('name');

      if (error) throw error;

      const mappedItems: PantryItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        currentAmount: item.current_amount,
        idealAmount: item.ideal_amount,
        unit: item.unit,
        expirationDate: item.expiration_date || undefined
      }));

      setItems(mappedItems);
    } catch (error) {
      console.error("Error fetching pantry:", error);
      toast({ title: "Erro ao carregar despensa", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<PantryItem, "id">) => {
    if (!family?.id) return;

    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({
          family_id: family.id,
          name: item.name,
          category: item.category,
          current_amount: item.currentAmount,
          ideal_amount: item.idealAmount,
          unit: item.unit,
          expiration_date: item.expirationDate
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: PantryItem = {
        id: data.id,
        name: data.name,
        category: data.category,
        currentAmount: data.current_amount,
        idealAmount: data.ideal_amount,
        unit: data.unit,
        expirationDate: data.expiration_date
      };

      setItems((prev) => [newItem, ...prev]);
      toast({
        title: "📦 Item adicionado!",
        description: `${item.name} foi adicionado à despensa.`,
      });
    } catch (error) {
      console.error("Error adding pantry item:", error);
      toast({ title: "Erro ao salvar item", variant: "destructive" });
    }
  };

  const updateItem = async (id: string, updates: Partial<PantryItem>) => {
    try {
      // Map frontend updates to DB columns
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
      if (updates.idealAmount !== undefined) dbUpdates.ideal_amount = updates.idealAmount;
      if (updates.unit) dbUpdates.unit = updates.unit;
      if (updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate;

      const { error } = await supabase
        .from('pantry_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    } catch (error) {
      console.error("Error updating pantry item:", error);
      toast({ title: "Erro ao atualizar item", variant: "destructive" });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const item = items.find((i) => i.id === id);
      const { error } = await supabase.from('pantry_items').delete().eq('id', id);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({
        title: "Item removido",
        description: item?.name,
      });
    } catch (error) {
      console.error("Error deleting pantry item:", error);
      toast({ title: "Erro ao remover item", variant: "destructive" });
    }
  };

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    loading
  };
}
