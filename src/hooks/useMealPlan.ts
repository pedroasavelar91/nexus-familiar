import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
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
    const { family } = useFamily();
    const [weekPlan, setWeekPlan] = useState<DayPlan[]>(generateInitialWeek());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (family?.id) {
            fetchWeeklyPlan();
        } else {
            setWeekPlan(generateInitialWeek());
            setLoading(false);
        }
    }, [family?.id]);

    const fetchWeeklyPlan = async () => {
        if (!family?.id) return;
        try {
            // Fetch plans for the range dates in weekPlan
            const startStr = weekPlan[0].date;
            const endStr = weekPlan[6].date;

            const { data, error } = await supabase
                .from('meal_plans')
                .select('*')
                .eq('family_id', family.id)
                .gte('date', startStr)
                .lte('date', endStr);

            if (error) throw error;

            // Merge DB data into weekPlan structure
            setWeekPlan(prev => prev.map(day => {
                const dbRecord = data.find(r => r.date === day.date);
                if (dbRecord && dbRecord.meals) {
                    const meals = Array.isArray(dbRecord.meals) ? (dbRecord.meals as unknown as Meal[]) : [];
                    return { ...day, meals };
                }
                return day;
            }));

        } catch (error) {
            console.error("Error fetching meal plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const addMeal = async (date: string, meal: Meal) => {
        if (!family?.id) return;

        // Optimistic update
        const previousPlan = [...weekPlan];

        // Find current day's meals
        const dayPlan = weekPlan.find(d => d.date === date);
        if (!dayPlan) return;

        const filteredMeals = dayPlan.meals.filter(m => m.type !== meal.type);
        const newMeals = [...filteredMeals, meal];

        // Update local state
        setWeekPlan((prev) =>
            prev.map((day) => {
                if (day.date === date) {
                    return { ...day, meals: newMeals };
                }
                return day;
            })
        );

        toast({
            title: "🍽️ Refeição planejada!",
            description: meal.name,
        });

        // Sync to DB (Upsert)
        try {
            const { error } = await supabase
                .from('meal_plans')
                .upsert({
                    family_id: family.id,
                    date: date,
                    meals: newMeals as unknown as any // Cast for Json compatibility
                }, { onConflict: 'family_id,date' });

            if (error) throw error;

        } catch (error) {
            console.error("Error saving meal:", error);
            // Revert on error? Or just toast
            toast({ title: "Erro ao salvar", variant: "destructive" });
            setWeekPlan(previousPlan);
        }
    };

    const removeMeal = async (date: string, mealId: string) => {
        if (!family?.id) return;

        const dayPlan = weekPlan.find(d => d.date === date);
        if (!dayPlan) return;

        const newMeals = dayPlan.meals.filter(m => m.id !== mealId);

        setWeekPlan((prev) =>
            prev.map((day) => {
                if (day.date === date) {
                    return { ...day, meals: newMeals };
                }
                return day;
            })
        );

        toast({
            title: "Refeição removida",
        });

        // Sync to DB
        try {
            const { error } = await supabase
                .from('meal_plans')
                .upsert({
                    family_id: family.id,
                    date: date,
                    meals: newMeals as unknown as any // Cast for Json compatibility
                }, { onConflict: 'family_id,date' });

            if (error) throw error;
        } catch (error) {
            console.error("Error removing meal:", error);
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
    };

    return {
        weekPlan,
        addMeal,
        removeMeal,
        loading
    };
}
