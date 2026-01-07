import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

const todayTasks: Task[] = [
  { id: "1", title: "Levar cachorro no veterinário", assignee: "Maria", priority: "high", completed: false },
  { id: "2", title: "Pagar conta de luz", assignee: "João", priority: "high", completed: false },
  { id: "3", title: "Limpar filtro do ar-condicionado", assignee: "Lucas", priority: "medium", completed: true },
  { id: "4", title: "Comprar ração do Rex", assignee: "Maria", priority: "medium", completed: false },
];

const priorityConfig = {
  high: { color: "text-rose-600", dot: "bg-rose-500" },
  medium: { color: "text-amber-600", dot: "bg-amber-500" },
  low: { color: "text-slate-500", dot: "bg-slate-400" },
};

const assigneeColors: Record<string, string> = {
  "Maria": "bg-pink-500",
  "João": "bg-blue-500",
  "Lucas": "bg-emerald-500",
  "Ana": "bg-purple-500",
};

export function TasksWidget() {
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const progressPercent = (completedCount / todayTasks.length) * 100;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 col-span-2 lg:col-span-1 animate-fade-in" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Tarefas de Hoje</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} de {todayTasks.length} concluídas
            </p>
          </div>
        </div>
        <Link to="/tarefas" className="text-xs text-primary font-medium hover:underline">Ver todas</Link>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium text-foreground">{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {todayTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 py-2.5 px-3 rounded-xl transition-all duration-200",
              task.completed
                ? "bg-muted/30 opacity-60"
                : "bg-muted/50 hover:bg-muted"
            )}
          >
            <button className="mt-0.5 flex-shrink-0">
              {task.completed ? (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              ) : (
                <div className={cn("w-5 h-5 rounded-full border-2", priorityConfig[task.priority].color.replace("text-", "border-"))} />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium text-foreground",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </p>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", assigneeColors[task.assignee])} />
                {task.assignee}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
