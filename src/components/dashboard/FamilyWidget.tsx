import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface FamilyMember {
  id: string;
  name: string;
  role: "admin" | "member" | "pet";
  avatar?: string;
  tasksDone: number;
}

const familyMembers: FamilyMember[] = [
  { id: "1", name: "Maria", role: "admin", tasksDone: 8 },
  { id: "2", name: "João", role: "admin", tasksDone: 5 },
  { id: "3", name: "Lucas", role: "member", tasksDone: 12 },
  { id: "4", name: "Ana", role: "member", tasksDone: 9 },
  { id: "5", name: "Rex", role: "pet", tasksDone: 0 },
];

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
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 col-span-2 lg:col-span-1 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Família</h3>
            <p className="text-xs text-muted-foreground">{familyMembers.length} membros</p>
          </div>
        </div>
        <Link to="/membros" className="text-xs text-primary font-medium hover:underline">Gerenciar</Link>
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {familyMembers.map((member, index) => (
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
                {member.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{member.name}</p>
              <p className={cn("text-xs", roleConfig[member.role].color)}>
                {roleConfig[member.role].label}
              </p>
            </div>
            {member.tasksDone > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {member.tasksDone} tarefas
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
