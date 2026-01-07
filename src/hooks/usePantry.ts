import { useState, useEffect } from "react";
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
  const [items, setItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem("nexus_pantry_items");
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem("nexus_pantry_items", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<PantryItem, "id">) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setItems((prev) => [newItem, ...prev]);
    toast({
      title: "📦 Item adicionado!",
      description: `${item.name} foi adicionado à despensa.`,
    });
  };

  const updateItem = (id: string, updates: Partial<PantryItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({
      title: "Item removido",
      description: item?.name,
    });
  };

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
  };
}
