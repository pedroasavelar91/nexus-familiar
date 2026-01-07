import { useState } from "react";
import {
  Utensils, ChefHat, Plus, Calendar,
  Coffee, Sun, Moon, BookOpen,
  ShoppingCart, Check, X, Loader2,
  Clock, Flame, Users, Trash2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRecipes, Recipe, Ingredient } from "@/hooks/useRecipes";
import { useMealPlan, Meal } from "@/hooks/useMealPlan";
import { usePantry } from "@/hooks/usePantry";

const mealConfig = {
  breakfast: { label: "Café", icon: Coffee, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
  lunch: { label: "Almoço", icon: Sun, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  dinner: { label: "Jantar", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
};

const difficultyConfig = {
  easy: { label: "Fácil", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  medium: { label: "Médio", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  hard: { label: "Difícil", color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
};

const Alimentacao = () => {
  const { toast } = useToast();
  const { recipes, addRecipe, deleteRecipe } = useRecipes();
  const { weekPlan, addMeal, removeMeal } = useMealPlan();
  const { items: pantryItems } = usePantry();

  const [activeTab, setActiveTab] = useState<"cardapio" | "receitas">("cardapio");
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // --- Logic for Ingredient Checking ---
  const checkIngredients = (ingredients?: Ingredient[]) => {
    if (!ingredients || ingredients.length === 0) return { hasAll: true, missing: [] };

    const missing: string[] = [];
    ingredients.forEach(ing => {
      // Simple check: name match and quantity (if possible, but name match is safer for now)
      const inPantry = pantryItems.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(p.name.toLowerCase()));

      if (!inPantry) {
        missing.push(`${ing.name} (Sem estoque)`);
      } else if (inPantry.currentAmount < ing.amount) {
        // Naive unit check - assuming units roughly match or user manages it
        missing.push(`${ing.name} (Insuficiente: tem ${inPantry.currentAmount})`);
      }
    });

    return { hasAll: missing.length === 0, missing };
  };

  // --- New Meal State ---
  const [newMeal, setNewMeal] = useState<{
    dayDate: string;
    type: "breakfast" | "lunch" | "dinner";
    mode: "recipe" | "manual";
    recipeId: string;
    manualName: string;
    manualIngredients: Ingredient[];
  }>({
    dayDate: weekPlan[0]?.date || "",
    type: "lunch",
    mode: "recipe",
    recipeId: "",
    manualName: "",
    manualIngredients: [],
  });

  const [tempIngredient, setTempIngredient] = useState<Ingredient>({ id: "", name: "", amount: 0, unit: "un" });

  const addManualIngredient = () => {
    if (!tempIngredient.name) return;
    setNewMeal(prev => ({
      ...prev,
      manualIngredients: [...prev.manualIngredients, { ...tempIngredient, id: crypto.randomUUID() }]
    }));
    setTempIngredient({ id: "", name: "", amount: 0, unit: "un" });
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    let mealName = "";
    let mealIngredients: Ingredient[] = [];
    let recipeId = undefined;

    if (newMeal.mode === "recipe") {
      const recipe = recipes.find(r => r.id === newMeal.recipeId);
      if (!recipe) { setSubmitting(false); return; }
      mealName = recipe.name;
      mealIngredients = recipe.ingredients;
      recipeId = recipe.id;
    } else {
      if (!newMeal.manualName) { setSubmitting(false); return; }
      mealName = newMeal.manualName;
      mealIngredients = newMeal.manualIngredients;
    }

    const meal: Meal = {
      id: crypto.randomUUID(),
      type: newMeal.type,
      name: mealName,
      ingredients: mealIngredients,
      recipeId: recipeId
    };

    addMeal(newMeal.dayDate, meal);
    setMealDialogOpen(false);
    setSubmitting(false);
    setNewMeal(prev => ({ ...prev, manualName: "", manualIngredients: [], recipeId: "" }));
  };

  // --- New Recipe State ---
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe> & { ingredients: Ingredient[] }>({
    name: "",
    prepTime: "",
    servings: 4,
    difficulty: "medium",
    ingredients: [],
  });

  const [recipeTempIng, setRecipeTempIng] = useState<Ingredient>({ id: "", name: "", amount: 0, unit: "un" });

  const addRecipeIngredient = () => {
    if (!recipeTempIng.name) return;
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...recipeTempIng, id: crypto.randomUUID() }]
    }));
    setRecipeTempIng({ id: "", name: "", amount: 0, unit: "un" });
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipe.name) return;
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const recipe: Recipe = {
      id: crypto.randomUUID(),
      name: newRecipe.name!,
      prepTime: newRecipe.prepTime || "30 min",
      servings: newRecipe.servings || 4,
      difficulty: newRecipe.difficulty || "medium",
      ingredients: newRecipe.ingredients,
    };

    addRecipe(recipe);
    setRecipeDialogOpen(false);
    setSubmitting(false);
    setNewRecipe({ name: "", prepTime: "", servings: 4, difficulty: "medium", ingredients: [] });
  };

  // Stats
  const totalMeals = weekPlan.reduce((acc, day) => acc + day.meals.length, 0);
  const mealsWithIssues = weekPlan.reduce((acc, day) => acc + day.meals.filter(m => !checkIngredients(m.ingredients).hasAll).length, 0);
  const readyMeals = totalMeals - mealsWithIssues;

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 dark:from-orange-500 dark:via-amber-600 dark:to-yellow-600">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                  Alimentação
                </h1>
                <p className="text-white/80 text-sm">Cardápio e receitas da família</p>
              </div>
            </div>

            <Button
              onClick={() => activeTab === "cardapio" ? setMealDialogOpen(true) : setRecipeDialogOpen(true)}
              className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {activeTab === "cardapio" ? "Adicionar Refeição" : "Nova Receita"}
              </span>
            </Button>
          </div>

          {/* Stats Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{totalMeals}</p>
                <p className="text-white/60 text-xs">Refeições</p>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{readyMeals}</p>
                <p className="text-white/60 text-xs">Prontas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{mealsWithIssues}</p>
                <p className="text-white/60 text-xs">Faltando</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "cardapio", label: "Cardápio", icon: Calendar },
            { id: "receitas", label: "Receitas", icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "cardapio" && (
          <div className="space-y-4">
            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {weekPlan.map((day, index) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDayIndex(index)}
                  className={cn(
                    "flex flex-col items-center min-w-[60px] px-3 py-2 rounded-xl transition-all",
                    selectedDayIndex === index
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-card border border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-xs opacity-70">{day.shortName}</span>
                  <span className="font-semibold">{day.date.split("-")[2]}</span>
                </button>
              ))}
            </div>

            {/* Selected Day Meals */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-display font-semibold text-foreground">
                  {weekPlan[selectedDayIndex]?.dayName}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {weekPlan[selectedDayIndex]?.meals.map((meal) => {
                  const config = mealConfig[meal.type];
                  const { hasAll, missing } = checkIngredients(meal.ingredients);

                  return (
                    <div
                      key={meal.id}
                      className={cn(
                        "p-4 transition-all hover:bg-muted/50",
                        !hasAll && "bg-rose-50/50 dark:bg-rose-950/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                          <config.icon className={cn("w-5 h-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
                          </div>
                          <p className="font-medium text-foreground truncate">{meal.name}</p>
                          {missing.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {missing.map((issue, idx) => (
                                <span key={idx} className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/40 px-1.5 py-0.5 rounded-md">
                                  {issue}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                            hasAll
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          )}>
                            {hasAll ? (
                              <>
                                <Check className="w-3 h-3" />
                                OK
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" />
                                Falta
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeMeal(weekPlan[selectedDayIndex].date, meal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {weekPlan[selectedDayIndex]?.meals.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Nenhuma refeição planejada para este dia.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "receitas" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => {
                const { hasAll, missing } = checkIngredients(recipe.ingredients);
                return (
                  <div
                    key={recipe.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group flex flex-col"
                  >
                    <div className="h-32 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center relative">
                      <ChefHat className="w-12 h-12 text-orange-300 dark:text-orange-700" />
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                        className="absolute top-2 right-2 p-2 bg-white/50 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                        {hasAll ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <Check className="w-3 h-3" />
                            OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                            <X className="w-3 h-3" />
                            Falta
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {recipe.prepTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {recipe.servings}
                        </span>
                      </div>

                      {missing.length > 0 && (
                        <div className="mb-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 p-2 rounded">
                          <span className="font-medium block mb-1">Faltando:</span>
                          {missing.slice(0, 2).map((m, i) => <div key={i}>{m}</div>)}
                          {missing.length > 2 && <div>+ {missing.length - 2} itens...</div>}
                        </div>
                      )}

                      <div className="mt-auto flex justify-between items-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                          difficultyConfig[recipe.difficulty].bg,
                          difficultyConfig[recipe.difficulty].color
                        )}>
                          <Flame className="w-3 h-3" />
                          {difficultyConfig[recipe.difficulty].label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Planejar Refeição</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMeal} className="space-y-5 mt-4">
            {/* Form Content */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dia</Label>
                <Select
                  value={newMeal.dayDate}
                  onValueChange={(v) => setNewMeal({ ...newMeal, dayDate: v })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weekPlan.map(day => (
                      <SelectItem key={day.date} value={day.date}>{day.dayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newMeal.type}
                  onValueChange={(value: any) => setNewMeal({ ...newMeal, type: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(mealConfig).map(([key, conf]) => (
                      <SelectItem key={key} value={key}>{conf.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t text-sm">
              <Label>Origem</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newMeal.mode === "recipe" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setNewMeal({ ...newMeal, mode: "recipe" })}
                >
                  Usar Receita
                </Button>
                <Button
                  type="button"
                  variant={newMeal.mode === "manual" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setNewMeal({ ...newMeal, mode: "manual" })}
                >
                  Manual
                </Button>
              </div>
            </div>

            {newMeal.mode === "recipe" ? (
              <div className="space-y-2">
                <Label>Escolher Receita</Label>
                <Select
                  value={newMeal.recipeId}
                  onValueChange={(value) => setNewMeal({ ...newMeal, recipeId: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Prato</Label>
                  <Input
                    value={newMeal.manualName}
                    onChange={e => setNewMeal({ ...newMeal, manualName: e.target.value })}
                    placeholder="Ex: Sanduíche"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2 bg-muted/30 p-3 rounded-xl">
                  <Label>Ingredientes (Opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome"
                      value={tempIngredient.name}
                      onChange={e => setTempIngredient({ ...tempIngredient, name: e.target.value })}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Qtd"
                      value={tempIngredient.amount || ""}
                      onChange={e => setTempIngredient({ ...tempIngredient, amount: Number(e.target.value) })}
                      className="w-20 h-9"
                    />
                    <Button type="button" size="sm" onClick={addManualIngredient}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-1 mt-2">
                    {newMeal.manualIngredients.map((ing, idx) => (
                      <div key={idx} className="text-xs flex justify-between bg-background p-2 rounded border">
                        <span>{ing.amount} {ing.unit} {ing.name}</span>
                        <button type="button" onClick={() => setNewMeal(p => ({ ...p, manualIngredients: p.manualIngredients.filter((_, i) => i !== idx) }))}>
                          <X className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Agendar Refeição"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Nova Receita</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRecipe} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipeName">Nome da Receita</Label>
              <Input
                id="recipeName"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                placeholder="Ex: Frango Xadrez"
                className="h-12 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prepTime">Tempo</Label>
                <Input
                  id="prepTime"
                  value={newRecipe.prepTime}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: e.target.value })}
                  placeholder="Ex: 40 min"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Porções</Label>
                <Input
                  id="servings"
                  type="number"
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: Number(e.target.value) })}
                  placeholder="4"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2 bg-muted/30 p-4 rounded-xl">
              <Label className="mb-2 block">Ingredientes</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Nome (Ex: Ovo)"
                  value={recipeTempIng.name}
                  onChange={e => setRecipeTempIng({ ...recipeTempIng, name: e.target.value })}
                  className="flex-1 h-10"
                />
                <Input
                  type="number"
                  placeholder="Qtd"
                  value={recipeTempIng.amount || ""}
                  onChange={e => setRecipeTempIng({ ...recipeTempIng, amount: Number(e.target.value) })}
                  className="w-20 h-10"
                />
                <Input
                  placeholder="Un"
                  value={recipeTempIng.unit}
                  onChange={e => setRecipeTempIng({ ...recipeTempIng, unit: e.target.value })}
                  className="w-16 h-10"
                />
              </div>
              <Button type="button" onClick={addRecipeIngredient} className="w-full mb-3" variant="secondary" size="sm">
                Adicionar Ingrediente
              </Button>

              <div className="space-y-1">
                {newRecipe.ingredients.length === 0 && <p className="text-xs text-muted-foreground text-center">Nenhum ingrediente adicionado</p>}
                {newRecipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background p-2 rounded-lg border text-sm">
                    <span>{ing.amount} {ing.unit} <b>{ing.name}</b></span>
                    <button type="button" onClick={() => setNewRecipe(p => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }))}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setNewRecipe({ ...newRecipe, difficulty: diff })}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-sm font-medium",
                      newRecipe.difficulty === diff
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {difficultyConfig[diff].label}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Receita"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alimentacao;
