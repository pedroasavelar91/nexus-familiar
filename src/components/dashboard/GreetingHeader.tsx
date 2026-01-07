import { Bell, Search, Sparkles } from "lucide-react";

export function GreetingHeader() {
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

  return (
    <header className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-white/80" />
          <span className="text-white/80 text-sm capitalize">{today}</span>
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
          {greeting}, Maria! {emoji}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
          <Search className="w-5 h-5 text-white" />
        </button>
        <button className="relative w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
          <Bell className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
