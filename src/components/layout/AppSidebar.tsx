import { Home, Wallet, ShoppingBasket, ShoppingCart, CheckSquare, Utensils, Heart, Users, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Wallet, label: "Finanças", path: "/financas" },
  { icon: ShoppingBasket, label: "Despensa", path: "/despensa" },
  { icon: ShoppingCart, label: "Lista", path: "/lista-compras" },
  { icon: CheckSquare, label: "Tarefas", path: "/tarefas" },
  { icon: Utensils, label: "Alimentação", path: "/alimentacao" },
  { icon: Heart, label: "Saúde", path: "/saude" },
  { icon: Users, label: "Membros", path: "/membros" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-productivity flex items-center justify-center flex-shrink-0">
            <span className="text-sidebar-primary-foreground font-display font-bold text-lg">N</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display font-bold text-sidebar-foreground text-lg leading-tight">
                Nexus Familiar
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "drop-shadow-sm")} />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <NavLink
          to="/configuracoes"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Configurações</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/50 transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
