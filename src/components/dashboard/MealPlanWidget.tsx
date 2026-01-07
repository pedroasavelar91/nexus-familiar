import { Utensils, Coffee, Sun, Moon, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Meal {
  type: "breakfast" | "lunch" | "dinner";
  name: string;
  hasIngredients: boolean;
}

const todayMeals: Meal[] = [
  { type: "breakfast", name: "Vitamina de Banana com Aveia", hasIngredients: true },
  { type: "lunch", name: "Frango Grelhado com Salada", hasIngredients: true },
  { type: "dinner", name: "Sopa de Legumes", hasIngredients: false },
];

const mealConfig = {
  breakfast: { icon: Coffee, label: "Café da Manhã", time: "07:00", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
  lunch: { icon: Sun, label: "Almoço", time: "12:00", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  dinner: { icon: Moon, label: "Jantar", time: "19:00", color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
};

export function MealPlanWidget() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 col-span-2 lg:col-span-1 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Cardápio de Hoje</h3>
            <p className="text-xs text-muted-foreground">Segunda-feira, 06 Jan</p>
          </div>
        </div>
        <Link to="/alimentacao" className="text-xs text-primary font-medium hover:underline">Planejar</Link>
      </div>

      <div className="space-y-3">
        {todayMeals.map((meal) => {
          const config = mealConfig[meal.type];
          const Icon = config.icon;
          return (
            <div
              key={meal.type}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-medium", config.color)}>
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground/60">{config.time}</span>
                </div>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{meal.name}</p>
              </div>
              <span
                className={cn(
                  "flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium",
                  meal.hasIngredients 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}
              >
                {meal.hasIngredients ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {meal.hasIngredients ? "OK" : "Falta"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
