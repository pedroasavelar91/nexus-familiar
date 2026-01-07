import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { PantryItem } from "./usePantry";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFamily } from "./useFamily";

export interface ShoppingItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    completed: boolean;
    pantryItemId?: string;
}

export function useShoppingList() {
    const { user } = useAuth();
    const { family } = useFamily();
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (family?.id) {
            fetchList();
        } else {
            setItems([]);
            setLoading(false);
        }
    }, [family?.id]);

    const fetchList = async () => {
        if (!family?.id) return;
        try {
            const { data, error } = await supabase
                .from('shopping_items')
                .select('*')
                .eq('family_id', family.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedItems: ShoppingItem[] = data.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                completed: item.completed,
                pantryItemId: item.pantry_item_id || undefined
            }));

            setItems(mappedItems);
        } catch (error) {
            console.error("Error fetching shopping list:", error);
            toast({ title: "Erro ao carregar lista", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (item: Omit<ShoppingItem, "id" | "completed">) => {
        if (!family?.id) return;

        try {
            const { data, error } = await supabase
                .from('shopping_items')
                .insert({
                    family_id: family.id,
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    unit: item.unit,
                    completed: false,
                    pantry_item_id: item.pantryItemId
                })
                .select()
                .single();

            if (error) throw error;

            const newItem: ShoppingItem = {
                id: data.id,
                name: data.name,
                category: data.category,
                quantity: data.quantity,
                unit: data.unit,
                completed: data.completed,
                pantryItemId: data.pantry_item_id || undefined
            };

            setItems((prev) => [newItem, ...prev]);
            return newItem;
        } catch (error) {
            console.error("Error adding shopping item:", error);
            toast({ title: "Erro ao adicionar item", variant: "destructive" });
        }
    };

    const toggleComplete = async (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        // Optimistic update
        setItems((prev) =>
            prev.map((i) =>
                i.id === id ? { ...i, completed: !i.completed } : i
            )
        );

        try {
            const { error } = await supabase
                .from('shopping_items')
                .update({ completed: !item.completed })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error("Error toggling complete:", error);
            toast({ title: "Erro ao atualizar item", variant: "destructive" });
            // Revert optimistic update
            setItems((prev) =>
                prev.map((i) =>
                    i.id === id ? { ...i, completed: item.completed } : i
                )
            );
        }
    };

    const deleteItem = async (id: string) => {
        // Optimistic update
        const previousItems = [...items];
        setItems((prev) => prev.filter((i) => i.id !== id));

        try {
            const { error } = await supabase
                .from('shopping_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting item:", error);
            toast({ title: "Erro ao remover item", variant: "destructive" });
            setItems(previousItems);
        }
    };

    const clearCompleted = async () => {
        if (!family?.id) return;

        // Optimistic update
        const previousItems = [...items];
        setItems((prev) => prev.filter((i) => !i.completed));

        try {
            const { error } = await supabase
                .from('shopping_items')
                .delete()
                .eq('family_id', family.id)
                .eq('completed', true);

            if (error) throw error;
        } catch (error) {
            console.error("Error clearing completed items:", error);
            toast({ title: "Erro ao limpar itens", variant: "destructive" });
            setItems(previousItems);
        }
    };

    const importFromPantry = async (pantryItems: PantryItem[]) => {
        if (!family?.id) return;

        const lowStockItems = pantryItems.filter(
            (item) => item.currentAmount < item.idealAmount
        );

        if (lowStockItems.length === 0) {
            toast({
                title: "Tudo em ordem",
                description: "Não há itens com estoque baixo para importar.",
            });
            return;
        }

        const itemsToInsert = lowStockItems
            .filter(pantryItem => !items.some(i => i.pantryItemId === pantryItem.id && !i.completed))
            .map(pantryItem => ({
                family_id: family.id,
                name: pantryItem.name,
                category: pantryItem.category,
                quantity: pantryItem.idealAmount - pantryItem.currentAmount,
                unit: pantryItem.unit,
                completed: false,
                pantry_item_id: pantryItem.id
            }));

        if (itemsToInsert.length === 0) {
            toast({
                title: "Lista atualizada",
                description: "Todos os itens com estoque baixo já estão na lista.",
            });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('shopping_items')
                .insert(itemsToInsert as any) // Type assertion due to complexity of array insertion types
                .select();

            if (error) throw error;

            const newItems: ShoppingItem[] = data.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                completed: item.completed,
                pantryItemId: item.pantry_item_id || undefined
            }));

            setItems(prev => [...prev, ...newItems]);
            toast({
                title: "Lista atualizada",
                description: `${newItems.length} itens importados da despensa.`,
            });

        } catch (error) {
            console.error("Error importing items:", error);
            toast({ title: "Erro ao importar itens", variant: "destructive" });
        }
    };

    return {
        items,
        addItem,
        toggleComplete,
        deleteItem,
        clearCompleted,
        importFromPantry,
        loading
    };
}
