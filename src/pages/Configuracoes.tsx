import { useState, useEffect } from "react";
import {
  Settings, Palette, Bell, Shield,
  Moon, Sun, Monitor, LogOut,
  ChevronRight, User as UserIcon, Lock, Database,
  Loader2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Theme = "light" | "dark" | "system";

const Configuracoes = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Theme State
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "dark"
  );

  // Notifications State
  const [notifications, setNotifications] = useState({
    bills: true,
    tasks: true,
    inventory: false,
    health: true,
  });

  // Profile Edit State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load Settings
  useEffect(() => {
    // Load notifications from local storage
    const savedNotifs = localStorage.getItem("nexus_notifications");
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }

    if (user?.user_metadata?.full_name) {
      setProfileName(user.user_metadata.full_name);
    }
  }, [user]);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle Notification Change
  const handleNotificationChange = (key: string, value: boolean) => {
    const newNotifs = { ...notifications, [key]: value };
    setNotifications(newNotifs);
    localStorage.setItem("nexus_notifications", JSON.stringify(newNotifs));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const themeOptions: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Escuro", icon: Moon },
    { id: "system", label: "Sistema", icon: Monitor },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileName }
      });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Seu nome foi alterado com sucesso.",
      });
      setIsProfileOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive"
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setIsPasswordOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: "Não foi possível alterar sua senha. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = () => {
    const data = {
      notifications,
      theme,
      timestamp: new Date().toISOString(),
      user: {
        email: user?.email,
        fullName: user?.user_metadata?.full_name
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup realizado",
      description: "Arquivo de backup baixado com sucesso."
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Configurações
            </h1>
            <p className="text-muted-foreground">Personalize seu Nexus Familiar</p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* User Profile */}
        <div className="bento-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{user?.user_metadata?.full_name || "Usuário"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>Atualize suas informações pessoais.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsProfileOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSavingProfile}>
                      {isSavingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Salvar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Appearance */}
        <div className="bento-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Aparência</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Tema</p>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors",
                      theme === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <option.icon className={cn(
                      "w-5 h-5",
                      theme === option.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      theme === option.id ? "text-primary" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bento-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-inventory/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-inventory" />
            </div>
            <h3 className="font-semibold text-foreground">Notificações</h3>
          </div>

          <div className="space-y-4">
            {[
              { id: "bills", label: "Vencimento de contas", description: "Lembrar 3 dias antes" },
              { id: "tasks", label: "Tarefas do dia", description: "Resumo matinal às 7h" },
              { id: "inventory", label: "Estoque baixo", description: "Quando itens estiverem em baixa" },
              { id: "health", label: "Lembretes de saúde", description: "Vacinas e medicamentos" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={notifications[item.id as keyof typeof notifications]}
                  onCheckedChange={(checked) => handleNotificationChange(item.id, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bento-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Segurança</h3>
          </div>

          <div className="space-y-2">
            <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
              <DialogTrigger asChild>
                <button
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Alterar senha</p>
                    <p className="text-xs text-muted-foreground">Atualizar senha de acesso</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Senha</DialogTitle>
                  <DialogDescription>Digite sua nova senha abaixo.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPass">Nova Senha</Label>
                    <Input
                      id="newPass"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="******"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPass">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPass"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="******"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsPasswordOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Alterar Senha
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <Database className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Backup de dados</p>
                <p className="text-xs text-muted-foreground">Exportar configurações locais</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
};

export default Configuracoes;
