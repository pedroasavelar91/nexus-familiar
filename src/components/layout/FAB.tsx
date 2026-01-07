import { Plus, X, Wallet, ShoppingCart, CheckSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const quickActions = [
  { icon: Wallet, label: "Adicionar Gasto", color: "bg-accent" },
  { icon: CheckSquare, label: "Nova Tarefa", color: "bg-primary" },
  { icon: ShoppingCart, label: "Lista de Compras", color: "bg-inventory" },
];

export function FAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-50 flex flex-col-reverse items-end gap-3">
      {/* Quick Action Buttons */}
      {quickActions.map((action, index) => (
        <button
          key={action.label}
          className={cn(
            "flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl text-white shadow-lg transition-all duration-300",
            action.color,
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          )}
          style={{ transitionDelay: isOpen ? `${index * 50}ms` : "0ms" }}
          onClick={() => setIsOpen(false)}
        >
          <action.icon className="w-5 h-5" />
          <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
        </button>
      ))}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300",
          isOpen
            ? "bg-foreground text-background rotate-45"
            : "bg-primary text-primary-foreground hover:scale-105"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
