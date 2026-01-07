import { Utensils, Coffee, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useMealPlan } from "@/hooks/useMealPlan";

const mealConfig = {
  breakfast: { icon: Coffee, label: "Café da Manhã", time: "07:00", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
  lunch: { icon: Sun, label: "Almoço", time: "12:00", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  dinner: { icon: Moon, label: "Jantar", time: "19:00", color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
};

export function MealPlanWidget() {
  const { weekPlan, loading } = useMealPlan();

  const today = new Date().toISOString().split('T')[0];
  const todayDayName = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });
  const todayPlan = weekPlan.find(d => d.date === today);

  // Sort meals by order: breakfast, lunch, dinner
  const order = { breakfast: 1, lunch: 2, dinner: 3 };
  const todayMeals = todayPlan?.meals?.sort((a, b) => order[a.type] - order[b.type]) || [];

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 col-span-2 lg:col-span-1 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Cardápio de Hoje</h3>
            <p className="text-xs text-muted-foreground capitalize">{todayDayName}</p>
          </div>
        </div>
        <Link to="/alimentacao" className="text-xs text-primary font-medium hover:underline">Planejar</Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-center text-muted-foreground">Carregando...</p>
        ) : todayMeals.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-4">Nenhuma refeição planejada</p>
        ) : (
          todayMeals.map((meal, index) => {
            const config = mealConfig[meal.type] || mealConfig.lunch;
            const Icon = config.icon;
            return (
              <div
                key={`${meal.type}-${index}`}
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
