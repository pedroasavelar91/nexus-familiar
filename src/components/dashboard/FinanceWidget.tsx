import { ArrowUpRight, ArrowDownRight, CalendarClock, CreditCard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { useBills } from "@/hooks/useBills";

const statusConfig = {
  pending: { class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Pendente" },
  paid: { class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Pago" },
  overdue: { class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", label: "Atrasado" },
};

export function FinanceWidget() {
  const currentDate = new Date();
  const { transactions } = useTransactions(currentDate.getMonth(), currentDate.getFullYear());
  const { bills } = useBills(currentDate.getMonth(), currentDate.getFullYear());

  const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses; // Simplified balance relative to month, or fetch global if desired. Mock implies global but month is safer start.

  // Filter bills for upcoming (status pending, sorted by date - hook already sorts by date but we might want only pending for "upcoming")
  const upcomingBills = bills
    .filter(b => b.status === "pending" || b.status === "overdue")
    .slice(0, 3); // Top 3

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 col-span-2 lg:col-span-1 animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Finanças</h3>
            <p className="text-xs text-muted-foreground">{capitalize(monthName)}</p>
          </div>
        </div>
        <Link to="/financas" className="text-xs text-primary font-medium hover:underline">Ver tudo</Link>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 mb-5 border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <p className="text-xs text-muted-foreground">Saldo do Mês</p>
        </div>
        <p className="font-display text-2xl font-bold text-foreground">
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-xs text-muted-foreground">
              +R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-xs text-muted-foreground">
              -R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Bills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Próximos Vencimentos
          </span>
        </div>
        <div className="space-y-2">
          {upcomingBills.length === 0 ? (
            <p className="text-xs text-muted-foreground pl-1">Nenhuma conta pendente.</p>
          ) : (
            upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{bill.description}</span>
                    <span className="text-xs text-muted-foreground">{new Date(bill.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    R$ {bill.amount.toFixed(2).replace('.', ',')}
                  </span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusConfig[bill.status].class)}>
                    {statusConfig[bill.status].label}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
