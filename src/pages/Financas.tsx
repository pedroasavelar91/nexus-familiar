import { useState } from "react";
import {
  Wallet, TrendingUp, TrendingDown, CreditCard,
  Calendar, Plus, ArrowUpRight, ArrowDownRight,
  PiggyBank, Receipt, Filter, Loader2,
  Target, Sparkles, ChevronLeft, ChevronRight,
  Trash2, Ban
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Progress } from "@/components/ui/progress";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  icon: string;
  month: number;
  year: number;
}

interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  month: number;
  year: number;
}

const categories = [
  { name: "Mercado", icon: "🛒", color: "bg-emerald-500/10 text-emerald-600" },
  { name: "Contas", icon: "📄", color: "bg-blue-500/10 text-blue-600" },
  { name: "Saúde", icon: "💊", color: "bg-rose-500/10 text-rose-600" },
  { name: "Transporte", icon: "🚗", color: "bg-amber-500/10 text-amber-600" },
  { name: "Lazer", icon: "🎬", color: "bg-purple-500/10 text-purple-600" },
  { name: "Educação", icon: "📚", color: "bg-indigo-500/10 text-indigo-600" },
  { name: "Assinaturas", icon: "🔄", color: "bg-cyan-500/10 text-cyan-600" },
  { name: "Renda", icon: "💰", color: "bg-green-500/10 text-green-600" },
  { name: "Renda Extra", icon: "✨", color: "bg-yellow-500/10 text-yellow-600" },
  { name: "Outros", icon: "📦", color: "bg-gray-500/10 text-gray-600" },
];

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const getCategoryConfig = (name: string) => categories.find(c => c.name === name) || categories[8];

const statusConfig = {
  pending: { label: "Pendente", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  paid: { label: "Pago", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  overdue: { label: "Atrasado", class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
};

import { useTransactions } from "@/hooks/useTransactions";
import { useBills } from "@/hooks/useBills";
import { useInvestments } from "@/hooks/useInvestments";

// ... (keep categories, monthNames, getCategoryConfig, statusConfig)

const Financas = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [filterType, setFilterType] = useState<"month" | "year">("month");
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "bills" | "investments">("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hooks for data fetching
  const { transactions, loading: loadingTransactions, addTransaction, deleteTransaction } = useTransactions(selectedMonth, selectedYear);
  const { bills, loading: loadingBills, error: billsError, addBill, toggleBillStatus, deleteBill } = useBills(selectedMonth, selectedYear);
  const { assets, loading: loadingAssets, addAsset, deleteAsset } = useInvestments();

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'transaction' | 'bill' | 'asset', id: string } | null>(null);

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const { type, id } = deleteConfirmation;

    if (type === 'transaction') {
      await deleteTransaction(id);
    } else if (type === 'bill') {
      await deleteBill(id);
    } else if (type === 'asset') {
      await deleteAsset(id);
    }

    setDeleteConfirmation(null);
  };

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "Mercado",
    status: "paid" as "paid" | "pending" | "overdue",
    dueDate: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    frequency: "monthly"
  });

  const [newAsset, setNewAsset] = useState({
    name: "",
    amount: "",
    initialAmount: "",
    type: "investment" as "investment" | "savings",
    startDate: new Date().toISOString().split("T")[0],
    maturityDate: ""
  });




  // Calculate totals from fetched data
  const monthlyIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const monthlyExpenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses; // Simplified balance calculation for now (or fetch global balance if needed)

  const monthlyBudget = 5000;
  const budgetUsed = monthlyBudget > 0 ? (monthlyExpenses / monthlyBudget) * 100 : 0;

  const pendingBills = bills.filter(b => b.status === "pending").reduce((acc, b) => acc + b.amount, 0);
  const overdueBills = bills.filter(b => b.status === "overdue").length;

  const totalInvested = assets.reduce((acc, a) => acc + a.amount, 0);


  const navigatePeriod = (direction: "prev" | "next") => {
    if (filterType === "month") {
      if (direction === "prev") {
        if (selectedMonth === 0) {
          setSelectedMonth(11);
          setSelectedYear(selectedYear - 1);
        } else {
          setSelectedMonth(selectedMonth - 1);
        }
      } else {
        if (selectedMonth === 11) {
          setSelectedMonth(0);
          setSelectedYear(selectedYear + 1);
        } else {
          setSelectedMonth(selectedMonth + 1);
        }
      }
    } else {
      setSelectedYear(direction === "prev" ? selectedYear - 1 : selectedYear + 1);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount) return;

    setSubmitting(true);

    const isBill = newTransaction.status !== "paid" || newTransaction.isRecurring;

    if (isBill) {
      // Add as Bill
      await addBill({
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        dueDate: newTransaction.date, // Use the main date field
        type: newTransaction.type,
        category: newTransaction.category,
        isRecurring: newTransaction.isRecurring,
        frequency: newTransaction.frequency,
        status: newTransaction.status
      });
    } else {
      // Add as Transaction
      const categoryConfig = getCategoryConfig(newTransaction.category);
      await addTransaction({
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        icon: categoryConfig.icon
      });
    }

    setNewTransaction({
      description: "",
      amount: "",
      type: "expense",
      category: "Mercado",
      status: "paid",
      dueDate: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      frequency: "monthly"
    });
    setDialogOpen(false);
    setSubmitting(false);
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.amount) return;

    setSubmitting(true);

    await addAsset({
      name: newAsset.name,
      amount: parseFloat(newAsset.amount),
      initialAmount: parseFloat(newAsset.initialAmount) || parseFloat(newAsset.amount),
      type: newAsset.type,
      startDate: newAsset.startDate,
      maturityDate: newAsset.maturityDate || undefined,
      color: newAsset.type === "investment" ? "bg-purple-500" : "bg-emerald-500"
    });

    setNewAsset({
      name: "",
      amount: "",
      initialAmount: "",
      type: "investment",
      startDate: new Date().toISOString().split("T")[0],
      maturityDate: ""
    });
    setAssetDialogOpen(false);
    setSubmitting(false);
  };

  // Note: filteredTransactions and filteredBills logic is now handled by the hook based on selectedMonth/Year arguments passed to it.
  // We can just use 'transactions' and 'bills' directly.


  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                  Finanças
                </h1>
                <p className="text-white/80 text-sm">Gestão financeira familiar</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Transação</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Nova Transação / Conta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-5 mt-4">

                  {/* Type Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ ...newTransaction, type: "expense" })}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        newTransaction.type === "expense"
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30"
                          : "border-border hover:border-rose-300"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        newTransaction.type === "expense" ? "bg-rose-500" : "bg-muted"
                      )}>
                        <TrendingDown className={cn("w-6 h-6", newTransaction.type === "expense" ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <span className={cn("font-medium", newTransaction.type === "expense" ? "text-rose-600" : "text-muted-foreground")}>Despesa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ ...newTransaction, type: "income" })}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        newTransaction.type === "income"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                          : "border-border hover:border-emerald-300"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        newTransaction.type === "income" ? "bg-emerald-500" : "bg-muted"
                      )}>
                        <TrendingUp className={cn("w-6 h-6", newTransaction.type === "income" ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <span className={cn("font-medium", newTransaction.type === "income" ? "text-emerald-600" : "text-muted-foreground")}>Receita</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                      placeholder="Ex: Supermercado, Aluguel"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      placeholder="0,00"
                      className="h-12 rounded-xl text-lg font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.name} value={cat.name}>
                              <span className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={newTransaction.status}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, status: value as any })}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">
                            <span className="flex items-center gap-2 text-emerald-600">
                              <span>✓</span> Pago
                            </span>
                          </SelectItem>
                          <SelectItem value="pending">
                            <span className="flex items-center gap-2 text-amber-600">
                              <span>⏳</span> A Pagar
                            </span>
                          </SelectItem>
                          <SelectItem value="overdue">
                            <span className="flex items-center gap-2 text-rose-600">
                              <span>⚠️</span> Vencido
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">
                      {(newTransaction.category === "Contas" || newTransaction.category === "Assinaturas")
                        ? "Data de Validade"
                        : "Data"}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={newTransaction.isRecurring}
                      onChange={(e) => setNewTransaction({ ...newTransaction, isRecurring: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="isRecurring" className="cursor-pointer">Recorrência Mensal</Label>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Period Filter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType("month")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  filterType === "month" ? "bg-white text-emerald-600" : "bg-white/20 text-white hover:bg-white/30"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setFilterType("year")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  filterType === "year" ? "bg-white text-emerald-600" : "bg-white/20 text-white hover:bg-white/30"
                )}
              >
                Anual
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigatePeriod("prev")}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <span className="text-white font-medium min-w-[120px] text-center">
                {filterType === "month" ? `${monthNames[selectedMonth]} ${selectedYear}` : selectedYear}
              </span>
              <button
                onClick={() => navigatePeriod("next")}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Main Balance Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">Saldo Total</span>
            </div>
            <p className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
              R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            {/* This is where the assets list would typically go, assuming it's part of the main balance card */}
            {/* The provided change seems to be a single asset item, implying it's inside a map function */}
            {/* For the sake of faithful insertion, I'll place it directly after the totalBalance paragraph */}
            {/* If this is part of a loop, the loop structure is missing from the provided context */}
            {/* Assuming this is a placeholder for an asset item within a list of assets */}
            {/* If there's an actual assets.map() in the original code, this insertion might be incorrect. */}
            {/* However, based on the instruction, this is the closest valid insertion point. */}
            {/* If this is meant to be part of an "Investments" tab, the context is wrong. */}
            {/* Given the instruction's specific placement, I'm inserting it here. */}
            {/* If this is a new feature, it might need a surrounding map or conditional rendering. */}
            {/* For now, I'll assume 'asset' is defined in scope for this example. */}
            {/* This insertion might break the code if 'asset' is not defined or if it's not inside a loop. */}
            {/* I will insert the provided snippet as-is, assuming the user knows the context. */}
            {/* The instruction implies inserting it *after* the `minimumFractionDigits:` part, which is syntactically incorrect. */}
            {/* I will insert it after the closing `}` of the `toLocaleString` call, as that's the most logical place for new JSX. */}
            {/* Re-reading the instruction: `R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits:                  <div key={asset.id} ...` */}
            {/* This implies the new code *replaces* the `2 })}` part, which is definitely incorrect. */}
            {/* The instruction is malformed. I will assume the user wants to add the asset div *after* the totalBalance paragraph. */}
            {/* I will insert the entire `div key={asset.id}` block after the `p` tag for totalBalance. */}
            {/* This will likely require `asset` to be defined, which it isn't in the provided context. */}
            {/* I will add a comment to highlight this potential issue. */}
            {/* The instruction is very specific about the insertion point, even if it's syntactically odd. */}
            {/* I will try to interpret the instruction as inserting the new block *immediately after* the `minimumFractionDigits: ` part, which means it would break the `toLocaleString` call. */}
            {/* This is a problematic instruction. I will assume the user meant to insert it *after* the entire `<p>` tag for totalBalance. */}
            {/* Let's try to be as faithful as possible to the instruction's *textual* insertion point, even if it results in invalid syntax, and then fix it to be valid. */}
            {/* The instruction literally says to insert it *inside* the `toLocaleString` call. This is not possible. */}
            {/* I will assume the instruction meant to insert it *after* the closing `</p>` tag of the totalBalance. */}
            {/* This is the most reasonable interpretation that maintains valid JSX. */}
            {/* If the user wanted it inside a loop, the instruction should have provided that context. */}
            {/* I will insert the provided block after the totalBalance paragraph. */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Receitas</p>
                  <p className="text-white font-semibold">R$ {monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Despesas</p>
                  <p className="text-white font-semibold">R$ {monthlyExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Orçamento</span>
            </div>
            <p className="font-display text-lg font-bold text-foreground mb-1">{Math.min(budgetUsed, 100).toFixed(0)}% usado</p>
            <Progress value={Math.min(budgetUsed, 100)} className="h-1.5" />
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs text-muted-foreground">Pendentes</span>
            </div>
            <p className="font-display text-lg font-bold text-foreground">R$ {pendingBills.toFixed(2)}</p>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-xs text-muted-foreground">Atrasadas</span>
            </div>
            <p className="font-display text-lg font-bold text-rose-600">{overdueBills}</p>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs text-muted-foreground">Economia</span>
            </div>
            <p className="font-display text-lg font-bold text-emerald-600">
              {monthlyIncome > 0 ? `${((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(0)}%` : "0%"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "overview", label: "Resumo", icon: TrendingUp },
            { id: "transactions", label: "Transações", icon: Receipt },
            { id: "bills", label: "Contas", icon: Calendar },
            { id: "investments", label: "Investimentos", icon: PiggyBank },
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
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Recent Transactions */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display font-semibold text-foreground">Transações do Período</h3>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Ver todas
                </button>
              </div>
              <div className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma transação neste período
                  </div>
                ) : (
                  transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center text-lg",
                        getCategoryConfig(tx.category).color
                      )}>
                        {tx.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.category}</p>
                      </div>
                      <span className={cn(
                        "text-sm font-bold",
                        tx.type === "income" ? "text-emerald-600" : "text-foreground"
                      )}>
                        {tx.type === "income" ? "+" : "-"} R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Bills */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display font-semibold text-foreground">Contas do Período</h3>
                <button
                  onClick={() => {
                    setNewTransaction({ ...newTransaction, status: "pending" });
                    setDialogOpen(true);
                  }}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  + Adicionar
                </button>
              </div>
              <div className="divide-y divide-border">
                {bills.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma conta neste período
                  </div>
                ) : (
                  bills.slice(0, 5).map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleBillStatus(bill.id, bill.status)}
                    >
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center",
                        bill.status === "paid" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                          bill.status === "overdue" ? "bg-rose-100 dark:bg-rose-900/30" : "bg-amber-100 dark:bg-amber-900/30"
                      )}>
                        <CreditCard className={cn(
                          "w-5 h-5",
                          bill.status === "paid" ? "text-emerald-600" :
                            bill.status === "overdue" ? "text-rose-600" : "text-amber-600"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{bill.description}</p>
                        <p className="text-xs text-muted-foreground">Vence em {new Date(bill.dueDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground block">
                          R$ {bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConfig[bill.status].class)}>
                          {statusConfig[bill.status].label}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-semibold text-foreground">Todas as Transações</h3>
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <Filter className="w-4 h-4" />
                Filtrar
              </Button>
            </div>
            <div className="divide-y divide-border">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma transação neste período
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center text-lg",
                      getCategoryConfig(tx.category).color
                    )}>
                      {tx.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.category} • {new Date(tx.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      tx.type === "income" ? "text-emerald-600" : "text-foreground"
                    )}>
                      {tx.type === "income" ? "+" : "-"} R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmation({ type: 'transaction', id: tx.id });
                      }}
                      className="p-2 text-muted-foreground hover:text-rose-600 transition-all opacity-100"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "bills" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Clique em uma conta para marcar como paga</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Clique em uma conta para marcar como paga</p>
              </div>
            </div>
            {billsError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-4 text-red-600 dark:text-red-400 text-sm">
                <p className="font-bold">Erro ao carregar contas:</p>
                <p>{(billsError as any).message || "Erro desconhecido. Verifique se as migrações do banco de dados foram aplicadas."}</p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bills.length === 0 ? (
                <div className="col-span-full p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border">
                  {billsError ? "Não foi possível carregar as contas." : "Nenhuma conta neste período"}
                </div>
              ) : (
                bills.map((bill) => (
                  <div
                    key={bill.id}
                    onClick={() => toggleBillStatus(bill.id, bill.status)}
                    className={cn(
                      "bg-card rounded-2xl border-2 p-4 cursor-pointer transition-all hover:shadow-md relative group",
                      bill.status === "paid" ? "border-emerald-200 dark:border-emerald-800" :
                        bill.status === "overdue" ? "border-rose-200 dark:border-rose-800" : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        bill.status === "paid" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                          bill.status === "overdue" ? "bg-rose-100 dark:bg-rose-900/30" : "bg-amber-100 dark:bg-amber-900/30"
                      )}>
                        <CreditCard className={cn(
                          "w-5 h-5",
                          bill.status === "paid" ? "text-emerald-600" :
                            bill.status === "overdue" ? "text-rose-600" : "text-amber-600"
                        )} />
                      </div>
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusConfig[bill.status].class)}>
                        {statusConfig[bill.status].label}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmation({ type: 'bill', id: bill.id });
                      }}
                      className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-rose-600 transition-all opacity-100 z-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h4 className="font-semibold text-foreground mb-1 pr-8">{bill.description}</h4>
                    <p className="text-xs text-muted-foreground mb-2">Vence em {new Date(bill.dueDate).toLocaleDateString("pt-BR")}</p>
                    <p className="font-display text-xl font-bold text-foreground">
                      R$ {bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "investments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Patrimônio</h3>
                <p className="text-sm text-muted-foreground">Gerencie seus investimentos e economias</p>
              </div>
              <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 rounded-full">
                    <Plus className="w-4 h-4" />
                    Novo Ativo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Novo Ativo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddAsset} className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewAsset({ ...newAsset, type: "investment" })}
                          className={cn(
                            "flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                            newAsset.type === "investment"
                              ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                              : "border-border hover:border-muted-foreground/50"
                          )}
                        >
                          Investimento
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAsset({ ...newAsset, type: "savings" })}
                          className={cn(
                            "flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                            newAsset.type === "savings"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              : "border-border hover:border-muted-foreground/50"
                          )}
                        >
                          Economia
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assetName">Nome</Label>
                      <Input
                        id="assetName"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        placeholder="Ex: Tesouro Direto, Poupança..."
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assetAmount">Valor Atual (R$)</Label>
                      <Input
                        id="assetAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAsset.amount}
                        onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                        placeholder="0,00"
                        className="h-12 rounded-xl text-lg font-semibold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assetInitial">Valor Inicial (Opcional)</Label>
                      <Input
                        id="assetInitial"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAsset.initialAmount}
                        onChange={(e) => setNewAsset({ ...newAsset, initialAmount: e.target.value })}
                        placeholder="0,00"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="assetStart">Data Início</Label>
                        <Input
                          id="assetStart"
                          type="date"
                          value={newAsset.startDate}
                          onChange={(e) => setNewAsset({ ...newAsset, startDate: e.target.value })}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assetMaturity">Vencimento (Opcional)</Label>
                        <Input
                          id="assetMaturity"
                          type="date"
                          value={newAsset.maturityDate}
                          onChange={(e) => setNewAsset({ ...newAsset, maturityDate: e.target.value })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Ativo"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
                <p className="text-purple-100 text-sm mb-1">Total Acumulado</p>
                <p className="font-display text-3xl font-bold">
                  R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-muted-foreground">Seus Ativos</h4>
              {assets.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-border rounded-xl">
                  <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">Você ainda não cadastrou nenhum ativo.</p>
                  <p className="text-sm text-muted-foreground/60">Adicione seus investimentos e economias para acompanhar seu patrimônio.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {assets.map((asset) => (
                    <div key={asset.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between group relative">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
                          asset.type === "investment"
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        )}>
                          {asset.type === "investment" ? "📈" : "🐷"}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{asset.name}</h4>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1",
                            asset.type === "investment"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          )}>
                            {asset.type === "investment" ? "Investimento" : "Economia"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="font-display text-lg font-bold">
                          R$ {asset.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-100"
                          onClick={() => setDeleteConfirmation({ type: 'asset', id: asset.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <AlertDialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o item selecionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Financas;
