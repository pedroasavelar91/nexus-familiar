import { useState } from "react";
import {
  CheckSquare, ListTodo, Plus, Calendar,
  Circle, CheckCircle2, User,
  Repeat, Loader2, Trash2, Zap,
  Filter
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

import { useTasks, Task } from "@/hooks/useTasks";

const priorityConfig = {
  high: { label: "Alta", color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30", dot: "bg-rose-500" },
  medium: { label: "Média", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", dot: "bg-amber-500" },
  low: { label: "Baixa", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", dot: "bg-slate-400" },
};

const assigneeColors: Record<string, string> = {
  "Maria": "bg-pink-500",
  "João": "bg-blue-500",
  "Lucas": "bg-emerald-500",
  "Ana": "bg-purple-500",
};

const assignees = ["Maria", "João", "Lucas", "Ana"];
const ITEMS_PER_PAGE = 10;

const Tarefas = () => {
  const { toast } = useToast();
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();

  const [activeTab, setActiveTab] = useState<"today" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "Maria",
    priority: "medium" as "high" | "medium" | "low",
    dueDate: new Date().toISOString().split("T")[0],
    recurring: false,
  });

  // Calculate filtered tasks based on Tab + Status Filter
  const filteredTasks = tasks.filter((t) => {
    // 1. Filter by Tab (Today vs All)
    // Note: Comparing YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    const matchesTab = activeTab === "all" || t.dueDate === today;

    // 2. Filter by Status
    const matchesStatus =
      statusFilter === "all" ? true :
        statusFilter === "completed" ? t.completed :
          !t.completed;

    return matchesTab && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const progressPercent = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    setSubmitting(true);
    await addTask({
      title: newTask.title,
      assignee: newTask.assignee,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      recurring: newTask.recurring
    });

    setNewTask({ title: "", assignee: "Maria", priority: "medium", dueDate: new Date().toISOString().split("T")[0], recurring: false });
    setDialogOpen(false);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 dark:from-violet-600 dark:via-purple-600 dark:to-fuchsia-600">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                  Tarefas
                </h1>
                <p className="text-white/80 text-sm">Motor de rotina familiar</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Tarefa</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Nova Tarefa</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskTitle">O que precisa ser feito?</Label>
                    <Input
                      id="taskTitle"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Ex: Comprar leite"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Select
                        value={newTask.assignee}
                        onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assignees.map((a) => (
                            <SelectItem key={a} value={a}>
                              <span className="flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full", assigneeColors[a])} />
                                {a}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: "high" | "medium" | "low") => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(priorityConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full", config.dot)} />
                                {config.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Data</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTask.recurring}
                      onChange={(e) => setNewTask({ ...newTask, recurring: e.target.checked })}
                      className="w-5 h-5 rounded-lg"
                    />
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Tarefa recorrente</span>
                    </div>
                  </label>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Tarefa"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Progress Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-white/80 text-sm">Progresso de Hoje</span>
                </div>
                <p className="font-display text-3xl font-bold text-white">
                  {completedCount}/{todayTasks.length} tarefas
                </p>
              </div>
              <div className="w-20 h-20 relative">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{tasks.filter(t => !t.completed).length}</p>
                <p className="text-white/60 text-xs">Pendentes</p>
              </div>
              <div className="text-center border-l border-white/20">
                <p className="text-2xl font-bold text-white">{tasks.filter(t => t.recurring).length}</p>
                <p className="text-white/60 text-xs">Recorrentes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-4">
        {/* Filters and Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
          {/* View Mode Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: "today", label: "Hoje", icon: Calendar },
              { id: "all", label: "Todas", icon: ListTodo },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setCurrentPage(1);
                }}
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

          {/* Status Filter */}
          <div className="flex gap-2 p-1 bg-secondary rounded-full">
            {[
              { id: "all", label: "Tudo" },
              { id: "pending", label: "Pendentes" },
              { id: "completed", label: "Realizadas" },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => {
                  setStatusFilter(status.id as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  statusFilter === status.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 min-h-[400px]">
          {paginatedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "bg-card rounded-2xl border border-border p-4 transition-all group hover:shadow-md",
                task.completed && "opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {task.completed ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 transition-colors",
                      priorityConfig[task.priority].color.replace("text-", "border-")
                    )} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-foreground mb-1",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn("w-2 h-2 rounded-full", assigneeColors[task.assignee])} />
                      {task.assignee}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                      priorityConfig[task.priority].bg,
                      priorityConfig[task.priority].color
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", priorityConfig[task.priority].dot)} />
                      {priorityConfig[task.priority].label}
                    </span>
                    {task.recurring && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <Repeat className="w-3 h-3" />
                        Recorrente
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ))}

          {paginatedTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <CheckSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhuma tarefa encontrada.</p>
            </div>
          )}
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
      </div>
    </div>
  );
};

export default Tarefas;
