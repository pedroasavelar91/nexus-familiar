import { Home, Wallet, ShoppingBasket, ShoppingCart, CheckSquare, Heart, Utensils, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Wallet, label: "Finanças", path: "/financas" },
  { icon: ShoppingBasket, label: "Despensa", path: "/despensa" },
  { icon: ShoppingCart, label: "Lista", path: "/lista-compras" },
  { icon: CheckSquare, label: "Tarefas", path: "/tarefas" },
  { icon: Utensils, label: "Cardápio", path: "/alimentacao" },
  { icon: Heart, label: "Saúde", path: "/saude" },
  { icon: Settings, label: "Config", path: "/configuracoes" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50 pb-safe">
      <div className="flex items-center gap-1 py-1.5 px-2 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-all duration-200 min-w-[56px] flex-shrink-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  isActive && "bg-primary/10"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive && "drop-shadow-sm")} />
              </div>
              <span className={cn("text-[9px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
