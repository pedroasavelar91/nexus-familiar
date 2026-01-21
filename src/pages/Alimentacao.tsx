import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChefHat,
  UtensilsCrossed,
  Plus,
  Search,
  Clock,
  Users,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  ArrowRight,
  X,
  Flame,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRecipes } from "@/hooks/useRecipes";
import { useMealPlan } from "@/hooks/useMealPlan";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFamily } from "@/hooks/useFamily";
import { PaginationControl } from "@/components/PaginationControl";

interface MealType {
  id: string;
  label: string;
  icon: typeof UtensilsCrossed;
  color: string;
  bgColor: string;
}

const mealTypes: MealType[] = [
  { id: "breakfast", label: "Café da Manhã", icon: UtensilsCrossed, color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  { id: "lunch", label: "Almoço", icon: ChefHat, color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" },
  { id: "snack", label: "Lanche", icon: UtensilsCrossed, color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  { id: "dinner", label: "Jantar", icon: UtensilsCrossed, color: "text-indigo-500", bgColor: "bg-indigo-100 dark:bg-indigo-900/30" },
];

const RECIPES_PER_PAGE = 12;

const Alimentacao = () => {
  // Date state defined first to pass to useMealPlan
  const [date, setDate] = useState<Date>(new Date());

  const { recipes, addRecipe, deleteRecipe } = useRecipes();
  const { weekPlan, addMeal, removeMeal } = useMealPlan(date);
  const { isAdmin } = useFamily();

  const [activeTab, setActiveTab] = useState("planning");
  const [searchTerm, setSearchTerm] = useState("");
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // New Recipe State
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    prepTime: "",
    servings: "",
    category: "lunch",
    ingredients: "",
    instructions: ""
  });

  // New Meal State
  const [newMeal, setNewMeal] = useState({
    type: "lunch",
    recipeId: "",
    date: new Date(),
    notes: ""
  });

  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipe.title) return;

    setSubmitting(true);
    await addRecipe({
      title: newRecipe.title,
      description: newRecipe.description,
      prep_time: parseInt(newRecipe.prepTime) || 0,
      servings: parseInt(newRecipe.servings) || 0,
      category: newRecipe.category,
      ingredients: newRecipe.ingredients.split('\n').filter(i => i.trim()),
      instructions: newRecipe.instructions.split('\n').filter(i => i.trim()),
      is_public: true
    });

    setRecipeDialogOpen(false);
    setNewRecipe({
      title: "",
      description: "",
      prepTime: "",
      servings: "",
      category: "lunch",
      ingredients: "",
      instructions: ""
    });
    setSubmitting(false);
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.recipeId) return;

    const recipe = recipes.find(r => r.id === newMeal.recipeId);
    if (!recipe) return;

    await addMeal(format(newMeal.date, 'yyyy-MM-dd'), {
      id: crypto.randomUUID(),
      name: recipe.title,
      type: newMeal.type as "breakfast" | "lunch" | "dinner",
      recipeId: recipe.id,
      notes: newMeal.notes
    });

    setMealDialogOpen(false);
    setNewMeal(prev => ({ ...prev, recipeId: "", notes: "" }));
  };

  const getMealsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayPlan = weekPlan.find(p => p.date === dayStr);
    return dayPlan ? dayPlan.meals : [];
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                  Alimentação
                </h1>
                <p className="text-white/80 text-sm">Planejamento e receitas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white/10 p-1 rounded-xl backdrop-blur-sm">
                <TabsList className="bg-transparent border-0">
                  <TabsTrigger value="planning" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                    Planejamento
                  </TabsTrigger>
                  <TabsTrigger value="recipes" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                    Receitas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto -mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="planning" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            {/* Week Navigation */}
            <div className="bg-card rounded-3xl border border-border p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {format(weekStart, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, -7))} className="h-8 w-8 rounded-full">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, 7))} className="h-8 w-8 rounded-full">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {weekDays.map((day) => {
                  const isSelected = isSameDay(day, date);
                  const isToday = isSameDay(day, new Date());

                  const mealsCount = getMealsForDay(day).length;

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setDate(day)}
                      className={cn(
                        "flex flex-col items-center justify-center py-3 rounded-2xl transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                          : "hover:bg-muted text-muted-foreground",
                        isToday && !isSelected && "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <span className="text-xs font-medium uppercase mb-1">
                        {format(day, "EEE", { locale: ptBR })}
                      </span>
                      <span className={cn("text-lg font-bold", isSelected ? "text-primary-foreground" : "text-foreground")}>
                        {format(day, "d")}
                      </span>
                      {mealsCount > 0 && (
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1",
                          isSelected ? "bg-white/50" : "bg-primary"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Plan */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">
                  {isSameDay(date, new Date()) ? "Hoje" : format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setNewMeal(prev => ({ ...prev, date: date }))}
                          className="rounded-full gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Refeição
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar ao Planejamento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddMeal} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Tipo de Refeição</Label>
                            <Select
                              value={newMeal.type}
                              onValueChange={(val) => setNewMeal({ ...newMeal, type: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {mealTypes.map(type => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Receita</Label>
                            <Select
                              value={newMeal.recipeId}
                              onValueChange={(val) => setNewMeal({ ...newMeal, recipeId: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma receita" />
                              </SelectTrigger>
                              <SelectContent>
                                {recipes.map(recipe => (
                                  <SelectItem key={recipe.id} value={recipe.id}>
                                    {recipe.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mealNotes">Observações (Opcional)</Label>
                            <Input
                              id="mealNotes"
                              value={newMeal.notes}
                              onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                              placeholder="Ex: Sem cebola para as crianças"
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Adicionar
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                  {isAdmin && (
                    <Button variant="outline" className="rounded-full gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Gerar Sugestões
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mealTypes.map((type) => {
                  const meals = getMealsForDay(date).filter(m => m.type === type.id);

                  return (
                    <div key={type.id} className="bg-card rounded-2xl border border-border p-4 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", type.bgColor)}>
                          <type.icon className={cn("w-5 h-5", type.color)} />
                        </div>
                        <h4 className="font-semibold">{type.label}</h4>
                      </div>

                      <div className="flex-1 space-y-3">
                        {meals.length > 0 ? (
                          meals.map((meal) => {
                            const recipe = recipes.find(r => r.id === meal.recipeId); // Using meal.recipeId
                            if (!recipe) return null;

                            return (
                              <div key={meal.id} className="group bg-muted/50 rounded-xl p-3 hover:bg-muted transition-colors relative">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <p className="font-medium text-sm">{recipe.title}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {recipe.prepTime}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {recipe.servings}
                                      </span>
                                    </div>
                                    {meal.notes && (
                                      <p className="text-xs text-muted-foreground mt-1 italic">
                                        Note: {meal.notes}
                                      </p>
                                    )}
                                  </div>
                                  {isAdmin && (
                                    <button
                                      onClick={() => removeMeal(format(date, 'yyyy-MM-dd'), meal.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-background rounded-lg text-muted-foreground hover:text-destructive transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-muted rounded-xl">
                            <UtensilsCrossed className="w-8 h-8 text-muted-foreground/20 mb-2" />
                            <p className="text-sm text-muted-foreground">Nada planejado</p>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setNewMeal(prev => ({ ...prev, type: type.id, date: date }));
                                  setMealDialogOpen(true);
                                }}
                                className="mt-2 text-xs"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Adicionar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar receitas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 h-12 rounded-xl"
                />
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" className="h-12 rounded-xl px-4 gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtros</span>
                  </Button>
                  <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-12 rounded-xl px-6 gap-2 bg-primary hover:bg-primary/90">
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Nova Receita</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Nova Receita</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddRecipe} className="space-y-6 mt-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Nome da Receita</Label>
                            <Input
                              id="title"
                              value={newRecipe.title}
                              onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                              placeholder="Ex: Lasanha Bolonhesa"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="prepTime">Tempo (min)</Label>
                              <Input
                                id="prepTime"
                                type="number"
                                value={newRecipe.prepTime}
                                onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: e.target.value })}
                                placeholder="45"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="servings">Porções</Label>
                              <Input
                                id="servings"
                                type="number"
                                value={newRecipe.servings}
                                onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                                placeholder="4"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select
                              value={newRecipe.category}
                              onValueChange={(val) => setNewRecipe({ ...newRecipe, category: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {mealTypes.map(type => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input
                              id="description"
                              value={newRecipe.description}
                              onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                              placeholder="Uma breve descrição do prato..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ingredients">Ingredientes (um por linha)</Label>
                            <textarea
                              id="ingredients"
                              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={newRecipe.ingredients}
                              onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                              placeholder="- 500g de carne moída&#10;- 1 cebola picada..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="instructions">Modo de Preparo (um passo por linha)</Label>
                            <textarea
                              id="instructions"
                              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={newRecipe.instructions}
                              onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                              placeholder="1. Refogue a cebola&#10;2. Adicione a carne..."
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-12">
                          Salvar Receita
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedRecipes.map((recipe) => (
                <div key={recipe.id} className="group bg-card rounded-3xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <ChefHat className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecipe(recipe.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-sm">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                          {mealTypes.find(t => t.id === recipe.category)?.label || "Geral"}
                        </span>
                        <h3 className="font-bold text-lg leading-tight mb-1">{recipe.title}</h3>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                      {recipe.description || "Sem descrição definida."}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {recipe.prepTime}
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                        <Users className="w-3.5 h-3.5" />
                        {recipe.servings} porções
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border bg-muted/30">
                    <Button variant="ghost" className="w-full justify-between group-hover:text-primary transition-colors font-medium">
                      Ver detalhes
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Alimentacao;
