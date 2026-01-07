import { useState } from "react";
import {
  ShoppingBasket, Plus, Search, Loader2,
  AlertTriangle, Milk, Apple, Beef, Coffee,
  Sparkles, Package, ShoppingCart, Trash2,
  Check
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { usePantry, PantryItem } from "@/hooks/usePantry";
import { useShoppingList } from "@/hooks/useShoppingList";

interface Category {
  id: string;
  name: string;
  icon: typeof Milk;
  color: string;
  bgColor: string;
}

const categories: Category[] = [
  { id: "dairy", name: "Laticínios", icon: Milk, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "fruits", name: "Frutas e Verduras", icon: Apple, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" },
  { id: "proteins", name: "Carnes e Proteínas", icon: Beef, color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" },
  { id: "grains", name: "Grãos e Cereais", icon: Coffee, color: "text-amber-500", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "cleaning", name: "Limpeza", icon: Sparkles, color: "text-cyan-500", bgColor: "bg-cyan-100 dark:bg-cyan-900/30" },
  { id: "others", name: "Outros", icon: Package, color: "text-slate-500", bgColor: "bg-slate-100 dark:bg-slate-900/30" },
];

const units = [
  { value: "L", label: "Litros (L)" },
  { value: "kg", label: "Quilogramas (kg)" },
  { value: "g", label: "Gramas (g)" },
  { value: "un", label: "Unidades (un)" },
  { value: "pct", label: "Pacotes (pct)" },
  { value: "cx", label: "Caixas (cx)" },
  { value: "ml", label: "Mililitros (ml)" },
];

const ITEMS_PER_PAGE = 20;

const getQuantityStatus = (current: number, ideal: number) => {
  const percent = ideal > 0 ? (current / ideal) * 100 : 0;
  if (percent <= 0) return { label: "Vazio", color: "bg-rose-500", textColor: "text-rose-600", status: "empty" };
  if (percent <= 25) return { label: "Baixo", color: "bg-rose-500", textColor: "text-rose-600", status: "low" };
  if (percent <= 50) return { label: "Médio", color: "bg-amber-500", textColor: "text-amber-600", status: "medium" };
  return { label: "OK", color: "bg-emerald-500", textColor: "text-emerald-600", status: "full" };
};

const Despensa = () => {
  const { toast } = useToast();
  const { items, addItem, updateItem, deleteItem } = usePantry();
  const { addItem: addToShoppingListStore } = useShoppingList();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "grains",
    currentAmount: "",
    idealAmount: "",
    unit: "un",
  });

  const lowItems = items.filter(i => {
    const status = getQuantityStatus(i.currentAmount, i.idealAmount);
    return status.status === "low" || status.status === "empty";
  });
  const totalItems = items.length;
  const fullItems = items.filter(i => getQuantityStatus(i.currentAmount, i.idealAmount).status === "full").length;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  const getCategoryIcon = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[5];
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.idealAmount) return;

    setSubmitting(true);
    // Simulate slight delay for effect
    await new Promise(resolve => setTimeout(resolve, 500));

    addItem({
      name: newItem.name,
      category: newItem.category,
      currentAmount: parseFloat(newItem.currentAmount) || 0,
      idealAmount: parseFloat(newItem.idealAmount),
      unit: newItem.unit,
    });

    setNewItem({ name: "", category: "grains", currentAmount: "", idealAmount: "", unit: "un" });
    setDialogOpen(false);
    setSubmitting(false);
  };

  const handleAddToShoppingList = (item: PantryItem) => {
    const needed = Math.max(0, item.idealAmount - item.currentAmount);
    addToShoppingListStore({
      name: item.name,
      category: item.category,
      quantity: needed,
      unit: item.unit,
      pantryItemId: item.id
    });
    toast({
      title: "🛒 Adicionado à lista!",
      description: `${item.name}: ${needed} ${item.unit}`,
    });
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 dark:from-amber-500 dark:via-orange-600 dark:to-red-600">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShoppingBasket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                  Despensa
                </h1>
                <p className="text-white/80 text-sm">Controle de alimentos e itens</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Adicionar Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Nome do Item</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ex: Leite Integral"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <cat.icon className={cn("w-4 h-4", cat.color)} />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Select
                        value={newItem.unit}
                        onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentAmount">Quantidade Atual</Label>
                      <Input
                        id="currentAmount"
                        type="number"
                        step="0.1"
                        min="0"
                        value={newItem.currentAmount}
                        onChange={(e) => setNewItem({ ...newItem, currentAmount: e.target.value })}
                        placeholder="0"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idealAmount">Quantidade Ideal</Label>
                      <Input
                        id="idealAmount"
                        type="number"
                        step="0.1"
                        min="0"
                        value={newItem.idealAmount}
                        onChange={(e) => setNewItem({ ...newItem, idealAmount: e.target.value })}
                        placeholder="Ex: 5"
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Adicionar Item"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{totalItems}</p>
                <p className="text-white/60 text-xs">Total</p>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{fullItems}</p>
                <p className="text-white/60 text-xs">Completos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{lowItems.length}</p>
                <p className="text-white/60 text-xs">Baixo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-4">
        {/* Alert Banner */}
        {lowItems.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {lowItems.length} {lowItems.length === 1 ? "item precisa" : "itens precisam"} de reposição
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lowItems.slice(0, 3).map(i => i.name).join(", ")}
                    {lowItems.length > 3 && ` e mais ${lowItems.length - 3}`}
                  </p>
                </div>
              </div>
              <a href="/lista-compras" className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-2">
                <ShoppingCart className="w-4 h-4" />
                Lista de Compras
              </a>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar na despensa..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-12 h-12 rounded-xl"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => {
              setActiveCategory(null);
              setCurrentPage(1);
            }}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              !activeCategory
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            )}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(activeCategory === cat.id ? null : cat.id);
                setCurrentPage(1);
              }}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedItems.map((item) => {
            const category = getCategoryIcon(item.category);
            const status = getQuantityStatus(item.currentAmount, item.idealAmount);
            const percent = item.idealAmount > 0 ? Math.min((item.currentAmount / item.idealAmount) * 100, 100) : 0;

            return (
              <div
                key={item.id}
                className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", category.bgColor)}>
                    <category.icon className={cn("w-5 h-5", category.color)} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(status.status === "low" || status.status === "empty") && (
                      <button
                        onClick={() => handleAddToShoppingList(item)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Adicionar à lista de compras"
                      >
                        <ShoppingCart className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{category.name}</p>

                {/* Amount Display */}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-lg font-bold text-foreground">{item.currentAmount}</span>
                  <span className="text-sm text-muted-foreground">/ {item.idealAmount} {item.unit}</span>
                </div>

                {/* Quantity Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={cn("text-xs font-medium", status.textColor)}>
                      {status.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{percent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", status.color)}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {/* Quick amount buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => updateItem(item.id, { currentAmount: Math.max(0, item.currentAmount - 1) })}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium text-foreground">{item.currentAmount} {item.unit}</span>
                    <button
                      onClick={() => updateItem(item.id, { currentAmount: item.currentAmount + 1 })}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <PaginationPrevious className="pl-0" />
                  </Button>
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <PaginationNext className="pr-0" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {paginatedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <ShoppingBasket className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Nenhum item encontrado</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Tente buscar por outro termo" : "Adicione itens à sua despensa"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Despensa;
