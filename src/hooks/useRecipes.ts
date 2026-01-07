import { useState, useEffect } from "react";
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
    const [recipes, setRecipes] = useState<Recipe[]>(() => {
        const saved = localStorage.getItem("nexus_recipes");
        return saved ? JSON.parse(saved) : INITIAL_RECIPES;
    });

    useEffect(() => {
        localStorage.setItem("nexus_recipes", JSON.stringify(recipes));
    }, [recipes]);

    const addRecipe = (recipe: Recipe) => {
        setRecipes((prev) => [recipe, ...prev]);
        toast({
            title: "👨‍🍳 Receita adicionada!",
            description: recipe.name,
        });
    };

    const deleteRecipe = (id: string) => {
        setRecipes((prev) => prev.filter((item) => item.id !== id));
        toast({
            title: "Receita removida",
        });
    };

    return {
        recipes,
        addRecipe,
        deleteRecipe,
    };
}
