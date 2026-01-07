import { ShoppingBasket, AlertTriangle, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: "empty" | "low" | "medium" | "full";
}

const lowItems: PantryItem[] = [
  { id: "1", name: "Leite Integral", category: "Laticínios", quantity: "low" },
  { id: "2", name: "Tomate", category: "Frutas e Verduras", quantity: "empty" },
  { id: "3", name: "Detergente", category: "Limpeza", quantity: "low" },
  { id: "4", name: "Ração do Rex", category: "Outros", quantity: "low" },
];

const quantityConfig = {
  empty: { label: "Vazio", color: "bg-rose-500", width: "w-0" },
  low: { label: "Pouco", color: "bg-rose-500", width: "w-1/4" },
  medium: { label: "Médio", color: "bg-amber-500", width: "w-1/2" },
  full: { label: "Cheio", color: "bg-emerald-500", width: "w-full" },
};

export function InventoryAlertWidget() {
  const criticalCount = lowItems.filter((i) => i.quantity === "low" || i.quantity === "empty").length;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 col-span-2 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <ShoppingBasket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Despensa</h3>
            <p className="text-xs text-muted-foreground">
              {criticalCount} itens precisam de reposição
            </p>
          </div>
        </div>
        <Link to="/despensa" className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <ShoppingCart className="w-4 h-4" />
          Lista de Compras
        </Link>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 mb-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{criticalCount} itens</span> em nível crítico
          </p>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-3">
        {lowItems.map((item) => {
          const config = quantityConfig[item.quantity];
          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", config.color, config.width)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
