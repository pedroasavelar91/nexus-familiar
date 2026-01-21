import { useState, useEffect } from "react";
import {
  Wallet, TrendingUp, TrendingDown, CreditCard,
  Calendar, Plus, ArrowUpRight, ArrowDownRight,
  PiggyBank, Receipt, Filter, Loader2,
  Target, Sparkles, ChevronLeft, ChevronRight,
  Trash2, Ban, PieChart as PieChartIcon, CheckSquare
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
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
import { PaginationControl } from "@/components/PaginationControl";

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
  { name: "Empréstimo", icon: "🤝", color: "bg-orange-500/10 text-orange-600" },
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
  const [filterType, setFilterType] = useState<"month" | "year" | "total">("month");
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "bills" | "investments">("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hooks for data fetching
  const { transactions, loading: loadingTransactions, addTransaction, deleteTransaction } = useTransactions(selectedMonth, selectedYear, filterType);
  const { bills, loading: loadingBills, error: billsError, addBill, toggleBillStatus, deleteBill } = useBills(selectedMonth, selectedYear, filterType);
  const { assets, loading: loadingAssets, addAsset, deleteAsset } = useInvestments();

  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'transaction' | 'bill' | 'asset' | 'bulk_transactions', id?: string } | null>(null);

  // Pagination for Transactions
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear, filterType]);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const { type, id } = deleteConfirmation;

    if (type === 'transaction' && id) {
      await deleteTransaction(id);
    } else if (type === 'bill' && id) {
      await deleteBill(id);
    } else if (type === 'asset' && id) {
      await deleteAsset(id);
    } else if (type === 'bulk_transactions') {
      // Bulk delete
      // Note: For efficiency, a bulk delete API would be better, but loop is acceptable for now.
      for (const txId of selectedTransactions) {
        await deleteTransaction(txId);
      }
      setSelectedTransactions([]);
    }

    setDeleteConfirmation(null);
  };

  const toggleSelection = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t.id));
    }
  };

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "R$ 0,00",
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
    amount: "R$ 0,00",
    initialAmount: "R$ 0,00",
    type: "investment" as "investment" | "savings",
    startDate: new Date().toISOString().split("T")[0],
    maturityDate: ""
  });

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const parseCurrencyInput = (value: string) => {
    return parseFloat(value.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;
  };

  const handleCurrencyChange = (value: string, setter: any, field: string, obj: any) => {
    const formatted = formatCurrencyInput(value);
    setter({ ...obj, [field]: formatted });
  };

  const formatDateToPTBR = (dateString: string) => {
    if (!dateString) return "";
    // Handle both ISO strings (timestamptz) and YYYY-MM-DD (date)
    const cleanDate = dateString.split("T")[0];
    const [year, month, day] = cleanDate.split("-");

    // Create local date at noon to prevent timezone rollovers
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
    return date.toLocaleDateString("pt-BR");
  };




  // Calculate totals from fetched data
  const monthlyIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const monthlyTransactionExpenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const allBillsAmount = bills.reduce((acc, b) => acc + b.amount, 0); // Include all bills (paid, pending, overdue)
  const monthlyExpenses = monthlyTransactionExpenses + allBillsAmount;
  const totalBalance = monthlyIncome - monthlyExpenses;



  const pendingBills = bills.filter(b => b.status === "pending").reduce((acc, b) => acc + b.amount, 0);
  const overdueBillsCount = bills.filter(b => b.status === "overdue").length;
  const overdueBillsAmount = bills.filter(b => b.status === "overdue").reduce((acc, b) => acc + b.amount, 0);

  const totalInvested = assets.reduce((acc, a) => acc + a.amount, 0);

  // Calculate chart data
  const chartData = categories.map(cat => {
    const txAmount = transactions
      .filter(t => t.type === 'expense' && t.category === cat.name)
      .reduce((acc, t) => acc + t.amount, 0);

    // Bills are effectively future expenses or paid expenses
    const billAmount = bills
      .filter(b => b.type === 'expense' && b.category === cat.name)
      .reduce((acc, b) => acc + b.amount, 0);

    return {
      name: cat.name,
      value: txAmount + billAmount,
      color: cat.color.split(' ')[1].replace('text-', 'bg-') // Extract generic color class or use mapping
    };
  })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Map tailwind classes to hex for Recharts (approximate for now or use specific hex map)
  const COLORS = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#6366f1', '#06b6d4', '#22c55e', '#eab308', '#6b7280'];


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
        amount: parseCurrencyInput(newTransaction.amount),
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
        amount: parseCurrencyInput(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        icon: categoryConfig.icon
      });
    }

    setNewTransaction({
      description: "",
      amount: "R$ 0,00",
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
      amount: parseCurrencyInput(newAsset.amount),
      initialAmount: parseCurrencyInput(newAsset.initialAmount) || parseCurrencyInput(newAsset.amount),
      type: newAsset.type,
      startDate: newAsset.startDate,
      maturityDate: newAsset.maturityDate || undefined,
      color: newAsset.type === "investment" ? "bg-purple-500" : "bg-emerald-500"
    });

    setNewAsset({
      name: "",
      amount: "R$ 0,00",
      initialAmount: "R$ 0,00",
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
                      value={newTransaction.amount}
                      onChange={(e) => handleCurrencyChange(e.target.value, setNewTransaction, "amount", newTransaction)}
                      placeholder="R$ 0,00"
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

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8">
            {/* Filters & Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl inline-flex">
                <button
                  onClick={() => setFilterType("month")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filterType === "month" ? "bg-white text-emerald-600 shadow-sm" : "text-white hover:bg-white/10"
                  )}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setFilterType("year")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filterType === "year" ? "bg-white text-emerald-600 shadow-sm" : "text-white hover:bg-white/10"
                  )}
                >
                  Anual
                </button>
                <button
                  onClick={() => setFilterType("total")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filterType === "total" ? "bg-white text-emerald-600 shadow-sm" : "text-white hover:bg-white/10"
                  )}
                >
                  Total
                </button>
              </div>

              {filterType !== 'total' && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                  <button onClick={() => navigatePeriod("prev")} className="hover:bg-white/20 p-1 rounded-full"><ChevronLeft className="w-4 h-4 text-white" /></button>
                  <span className="text-white font-medium min-w-[120px] text-center capitalize">
                    {filterType === "month"
                      ? `${monthNames[selectedMonth]} ${selectedYear}`
                      : selectedYear}
                  </span>
                  <button onClick={() => navigatePeriod("next")} className="hover:bg-white/20 p-1 rounded-full"><ChevronRight className="w-4 h-4 text-white" /></button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Balance Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-white/80" />
                  <span className="text-white/80 text-sm">Saldo Total</span>
                </div>
                <p className="font-display text-4xl lg:text-5xl font-bold text-white mb-6">
                  {totalBalance >= 0 ?
                    totalBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) :
                    `-${Math.abs(totalBalance).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                  }
                </p>

                <div className="flex gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/10">
                      <ArrowUpRight className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Receitas</p>
                      <p className="text-white font-semibold text-lg">{monthlyIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/10">
                      <ArrowDownRight className="w-5 h-5 text-rose-300" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Despesas</p>
                      <p className="text-white font-semibold text-lg">{monthlyExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="hidden lg:block h-48 bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5 relative">
                <p className="text-xs text-white/80 text-center mb-2 absolute top-2 left-0 right-0 z-10">Gastos por Categoria</p>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border-0 min-w-[140px]">
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: data.color ? data.color.replace('bg-', 'var(--color-') : payload[0].payload.fill }}
                                  />
                                  <span className="text-xs font-medium text-muted-foreground">{data.name}</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">
                                  R$ {data.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-white/40">Sem dados</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">


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
              <span className="text-xs text-muted-foreground">Atrasadas ({overdueBillsCount})</span>
            </div>
            <p className="font-display text-lg font-bold text-rose-600">R$ {overdueBillsAmount.toFixed(2)}</p>
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
                        <p className="text-xs text-muted-foreground">Vence em {formatDateToPTBR(bill.dueDate)}</p>
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
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={transactions.length > 0 && selectedTransactions.length === transactions.length}
                  onCheckedChange={toggleAllSelection}
                  aria-label="Selecionar tudo"
                />
                <h3 className="font-display font-semibold text-foreground">
                  {selectedTransactions.length > 0 ? `${selectedTransactions.length} selecionado(s)` : "Todas as Transações"}
                </h3>
              </div>

              {selectedTransactions.length > 0 ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2 rounded-full"
                  onClick={() => setDeleteConfirmation({ type: 'bulk_transactions' })}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Selecionados
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <Filter className="w-4 h-4" />
                  Filtrar
                </Button>
              )}
            </div>
            <div className="divide-y divide-border">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma transação neste período
                </div>
              ) : (
                paginatedTransactions.map((tx) => (
                  <div key={tx.id} className="group relative flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Checkbox
                        checked={selectedTransactions.includes(tx.id)}
                        onCheckedChange={() => toggleSelection(tx.id)}
                        className="mr-2"
                      />
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0",
                        getCategoryConfig(tx.category).color
                      )}>
                        {tx.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.category} • {formatDateToPTBR(tx.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pl-4">
                      <span className={cn(
                        "text-sm font-bold whitespace-nowrap",
                        tx.type === "income" ? "text-emerald-600" : "text-foreground"
                      )}>
                        {tx.type === "income" ? "+" : "-"} R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
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
                    <div className="flex items-start justify-between mb-3 pr-8">
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
                        value={newAsset.amount}
                        onChange={(e) => handleCurrencyChange(e.target.value, setNewAsset, "amount", newAsset)}
                        placeholder="R$ 0,00"
                        className="h-12 rounded-xl text-lg font-semibold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assetInitial">Valor Inicial (Opcional)</Label>
                      <Input
                        id="assetInitial"
                        value={newAsset.initialAmount}
                        onChange={(e) => handleCurrencyChange(e.target.value, setNewAsset, "initialAmount", newAsset)}
                        placeholder="R$ 0,00"
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
