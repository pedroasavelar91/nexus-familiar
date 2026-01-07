import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { Recipe, Ingredient } from "./useRecipes";

export interface Meal {
    id: string;
    type: "breakfast" | "lunch" | "dinner";
    name: string;
    recipeId?: string; // Link to a recipe
    ingredients?: Ingredient[]; // For custom meals
}

export interface DayPlan {
    date: string;
    dayName: string; // Segunda, Terça...
    shortName: string; // Seg, Ter...
    meals: Meal[];
}

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const shortNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const generateInitialWeek = (): DayPlan[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start on Monday

    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayName = dayNames[date.getDay()];
        const shortName = shortNames[date.getDay()];
        return {
            date: date.toISOString().split("T")[0],
            dayName,
            shortName,
            meals: [],
        };
    });
};

export function useMealPlan() {
    const { toast } = useToast();
    const [weekPlan, setWeekPlan] = useState<DayPlan[]>(() => {
        const saved = localStorage.getItem("nexus_meal_plan");
        if (saved) return JSON.parse(saved);
        return generateInitialWeek();
    });

    useEffect(() => {
        localStorage.setItem("nexus_meal_plan", JSON.stringify(weekPlan));
    }, [weekPlan]);

    const addMeal = (date: string, meal: Meal) => {
        setWeekPlan((prev) =>
            prev.map((day) => {
                if (day.date === date) {
                    // Replace existing meal of same type if exists, or add new
                    const filteredMeals = day.meals.filter(m => m.type !== meal.type);
                    return { ...day, meals: [...filteredMeals, meal] };
                }
                return day;
            })
        );
        toast({
            title: "🍽️ Refeição planejada!",
            description: meal.name,
        });
    };

    const removeMeal = (date: string, mealId: string) => {
        setWeekPlan((prev) =>
            prev.map((day) => {
                if (day.date === date) {
                    return { ...day, meals: day.meals.filter(m => m.id !== mealId) };
                }
                return day;
            })
        );
        toast({
            title: "Refeição removida",
        });
    };

    return {
        weekPlan,
        addMeal,
        removeMeal,
    };
}
