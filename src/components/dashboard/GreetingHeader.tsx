import { Bell, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function GreetingHeader() {
  const { user } = useAuth();
  const { joinRequests } = useFamily();
  const navigate = useNavigate();

  const currentHour = new Date().getHours();
  let greeting = "Boa noite";
  let emoji = "🌙";
  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Bom dia";
    emoji = "☀️";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Boa tarde";
    emoji = "🌤️";
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Usuário";
  const notificationCount = joinRequests.length;

  return (
    <header className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-white/80" />
          <span className="text-white/80 text-sm capitalize">{today}</span>
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
          {greeting}, {userName}! {emoji}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
              <Bell className="w-5 h-5 text-white" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-border">
              <h4 className="font-semibold">Notificações</h4>
            </div>
            <div className="p-2">
              {joinRequests.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma notificação nova
                </div>
              ) : (
                <div className="space-y-1">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                      <p>
                        <span className="font-semibold">{request.user_name}</span> quer entrar na família.
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => navigate("/membros")}
                      >
                        Ver Solicitação
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
