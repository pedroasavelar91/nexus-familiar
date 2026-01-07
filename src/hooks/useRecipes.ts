import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFamily } from "./useFamily";
import { useToast } from "./use-toast";

export interface Ingredient {
    id: string;
    name: string;
    amount: number;
    unit: string;
}

export interface Recipe {
    id: string;
    name: string;
    prepTime: string;
    servings: number;
    difficulty: "easy" | "medium" | "hard";
    ingredients: Ingredient[];
    instructions?: string;
    image?: string;
}

const INITIAL_RECIPES: Recipe[] = [
    {
        id: "1",
        name: "Frango Xadrez",
        prepTime: "40 min",
        servings: 4,
        difficulty: "medium",
        ingredients: [
            { id: "1", name: "Peito de Frango", amount: 500, unit: "g" },
            { id: "2", name: "Pimentão", amount: 2, unit: "un" },
            { id: "3", name: "Amendoim", amount: 100, unit: "g" }
        ]
    },
    {
        id: "2",
        name: "Lasanha de Carne",
        prepTime: "1h 30min",
        servings: 6,
        difficulty: "hard",
        ingredients: [
            { id: "1", name: "Carne Moída", amount: 500, unit: "g" },
            { id: "2", name: "Massa de Lasanha", amount: 1, unit: "pacote" },
            { id: "3", name: "Queijo Mussarela", amount: 300, unit: "g" }
        ]
    },
];

export function useRecipes() {
    const { toast } = useToast();
    const { user } = useAuth(); // Assuming useAuth is available in this scope or imported
    const { family } = useFamily(); // Assuming useFamily is available
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (family?.id) {
            fetchRecipes();
        } else {
            setRecipes([]);
            setLoading(false);
        }
    }, [family?.id]);

    const fetchRecipes = async () => {
        if (!family?.id) return;
        try {
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .eq('family_id', family.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map DB structure to frontend structure
            const mappedRecipes: Recipe[] = data.map(r => ({
                id: r.id,
                name: r.name,
                prepTime: r.prep_time || "",
                servings: r.servings || 2,
                difficulty: (r.difficulty as "easy" | "medium" | "hard") || "medium",
                ingredients: Array.isArray(r.ingredients)
                    ? (r.ingredients as unknown as Ingredient[])
                    : [],
                instructions: r.instructions || undefined,
                image: r.image_url || undefined
            }));

            setRecipes(mappedRecipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            toast({
                title: "Erro ao carregar receitas",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const addRecipe = async (recipe: Omit<Recipe, "id">) => {
        if (!user || !family) {
            toast({ title: "Erro", description: "Você precisa estar em uma família.", variant: "destructive" });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('recipes')
                .insert({
                    family_id: family.id,
                    name: recipe.name,
                    prep_time: recipe.prepTime,
                    servings: recipe.servings,
                    difficulty: recipe.difficulty,
                    ingredients: recipe.ingredients as unknown as any, // Cast to any to satisfy Json type
                    instructions: recipe.instructions,
                    image_url: recipe.image,
                    created_by: user.id
                })
                .select()
                .single();

            if (error) throw error;

            const newRecipe: Recipe = {
                id: data.id,
                name: data.name,
                prepTime: data.prep_time || "",
                servings: data.servings || 2,
                difficulty: (data.difficulty as "easy" | "medium" | "hard") || "medium",
                ingredients: Array.isArray(data.ingredients)
                    ? (data.ingredients as unknown as Ingredient[])
                    : [],
                instructions: data.instructions || undefined,
                image: data.image_url || undefined
            };

            setRecipes((prev) => [newRecipe, ...prev]);
            toast({
                title: "👨‍🍳 Receita adicionada!",
                description: recipe.name,
            });
        } catch (error) {
            console.error("Error adding recipe:", error);
            toast({ title: "Erro ao salvar receita", variant: "destructive" });
        }
    };

    const deleteRecipe = async (id: string) => {
        try {
            const { error } = await supabase.from('recipes').delete().eq('id', id);
            if (error) throw error;
            setRecipes((prev) => prev.filter((item) => item.id !== id));
            toast({
                title: "Receita removida",
            });
        } catch (error) {
            console.error("Error deleting recipe:", error);
            toast({ title: "Erro ao remover receita", variant: "destructive" });
        }
    };

    return {
        recipes,
        addRecipe,
        deleteRecipe,
        loading
    };
}
