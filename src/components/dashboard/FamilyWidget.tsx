import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useFamily } from "@/hooks/useFamily";
import { useTasks } from "@/hooks/useTasks";

const roleConfig = {
  admin: { label: "Administrador", color: "text-primary" },
  member: { label: "Membro", color: "text-emerald-600" },
  pet: { label: "Pet 🐕", color: "text-muted-foreground" },
};

const avatarColors = [
  "from-pink-500 to-rose-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-violet-500",
  "from-amber-500 to-orange-500",
];

export function FamilyWidget() {
  const { members, loading: loadingFamily } = useFamily();
  const { tasks } = useTasks();

  if (loadingFamily) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 col-span-2 lg:col-span-1 h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Carregando família...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 col-span-2 lg:col-span-1 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Família</h3>
            <p className="text-xs text-muted-foreground">{members.length} membros</p>
          </div>
        </div>
        <Link to="/settings" className="text-xs text-primary font-medium hover:underline">Gerenciar</Link>
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro encontrado.</p>
        ) : (
          members.map((member, index) => {
            const tasksDone = tasks.filter(t => t.assignee === member.name && !t.completed).length; // Showing PENDING tasks as per "8 tarefas" context usually implies workload

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br",
                    avatarColors[index % avatarColors.length]
                  )}
                >
                  <span className="text-sm font-bold text-white">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className={cn("text-xs", roleConfig[member.role]?.color || "text-muted-foreground")}>
                    {roleConfig[member.role]?.label || "Membro"}
                  </p>
                </div>
                {tasksDone > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {tasksDone} tarefas
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
