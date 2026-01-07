import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { PantryItem } from "./usePantry";

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
    const [items, setItems] = useState<ShoppingItem[]>(() => {
        const saved = localStorage.getItem("nexus_shopping_list");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("nexus_shopping_list", JSON.stringify(items));
    }, [items]);

    const addItem = (item: Omit<ShoppingItem, "id" | "completed">) => {
        const newItem = { ...item, id: crypto.randomUUID(), completed: false };
        setItems((prev) => [newItem, ...prev]);
        return newItem;
    };

    const toggleComplete = (id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    const deleteItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const clearCompleted = () => {
        setItems((prev) => prev.filter((i) => !i.completed));
    };

    const importFromPantry = (pantryItems: PantryItem[]) => {
        const lowStockItems = pantryItems.filter(
            (item) => item.currentAmount < item.idealAmount
        );

        let addedCount = 0;

        setItems((prev) => {
            const newItems = [...prev];

            lowStockItems.forEach((pantryItem) => {
                // Check if already in list (incomplete)
                const exists = newItems.find(
                    (i) => i.pantryItemId === pantryItem.id && !i.completed
                );

                if (!exists) {
                    newItems.push({
                        id: crypto.randomUUID(),
                        name: pantryItem.name,
                        category: pantryItem.category,
                        quantity: pantryItem.idealAmount - pantryItem.currentAmount,
                        unit: pantryItem.unit,
                        completed: false,
                        pantryItemId: pantryItem.id,
                    });
                    addedCount++;
                }
            });

            return newItems;
        });

        if (addedCount > 0) {
            toast({
                title: "Lista atualizada",
                description: `${addedCount} itens importados da despensa.`,
            });
        } else {
            toast({
                title: "Tudo em ordem",
                description: "Não há itens com estoque baixo para importar.",
            });
        }
    };

    return {
        items,
        addItem,
        toggleComplete,
        deleteItem,
        clearCompleted,
        importFromPantry,
    };
}
