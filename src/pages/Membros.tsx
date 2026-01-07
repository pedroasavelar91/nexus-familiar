import React, { useState } from "react";
import { 
  Users, UserPlus, Copy, Check,
  Mail, Phone, Edit2, Trash2, Clock,
  Crown, User, Dog, Loader2, UserCheck, UserX,
  Shield, Sparkles
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
import { useFamily, FamilyMember } from "@/hooks/useFamily";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const roleConfig = {
  admin: { label: "Administrador", icon: Crown, color: "text-violet-600", bgColor: "bg-violet-100 dark:bg-violet-900/30" },
  member: { label: "Membro", icon: User, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  pet: { label: "Pet", icon: Dog, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
};

const avatarColors = [
  "from-pink-500 to-rose-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-violet-500",
  "from-amber-500 to-orange-500",
];

const Membros = () => {
  const { family, members, joinRequests, loading, addMember, removeMember, approveRequest, rejectRequest } = useFamily();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "member" as "admin" | "member" | "pet",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const admins = members.filter((m) => m.role === "admin");
  const regularMembers = members.filter((m) => m.role === "member");
  const pets = members.filter((m) => m.role === "pet");

  const selected = members.find((m) => m.id === selectedMember);

  const handleCopyCode = async () => {
    if (!family?.invite_code) return;
    await navigator.clipboard.writeText(family.invite_code);
    setCopied(true);
    toast({ title: "✓ Código copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    setSubmitting(true);
    try {
      await addMember(
        newMember.name.trim(),
        newMember.role,
        newMember.email || undefined,
        newMember.phone || undefined
      );
      toast({
        title: "👤 Membro adicionado!",
        description: `${newMember.name} foi adicionado à família.`,
      });
      setNewMember({ name: "", role: "member", email: "", phone: "" });
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (member: FamilyMember) => {
    try {
      await removeMember(member.id);
      toast({
        title: "Membro removido",
        description: `${member.name} foi removido da família.`,
      });
      setSelectedMember(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o membro.",
        variant: "destructive",
      });
    }
  };

  const handleApproveRequest = async (requestId: string, userName: string) => {
    try {
      await approveRequest(requestId);
      toast({
        title: "✓ Aprovado!",
        description: `${userName} agora faz parte da família.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível aprovar.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, userName: string) => {
    try {
      await rejectRequest(requestId);
      toast({
        title: "Recusado",
        description: `A solicitação de ${userName} foi recusada.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível recusar.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 dark:from-violet-600 dark:via-purple-600 dark:to-fuchsia-600">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                  {family?.name || "Família"}
                </h1>
                <p className="text-white/80 text-sm">Gestão familiar e acessos</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Adicionar Membro</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="Nome do membro"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["admin", "member", "pet"] as const).map((role) => {
                        const config = roleConfig[role];
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setNewMember({ ...newMember, role })}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                              newMember.role === role
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <config.icon className={cn("w-5 h-5", config.color)} />
                            <span className="text-xs font-medium">{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {newMember.role !== "pet" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (opcional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                          placeholder="email@exemplo.com"
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone (opcional)</Label>
                        <Input
                          id="phone"
                          value={newMember.phone}
                          onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </>
                  )}
                  <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Adicionar Membro"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{admins.length}</p>
                <p className="text-white/60 text-xs">Admins</p>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{regularMembers.length}</p>
                <p className="text-white/60 text-xs">Membros</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <Dog className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{pets.length}</p>
                <p className="text-white/60 text-xs">Pets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Invite Code Card */}
        {family?.invite_code && (
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Código de Convite</p>
                  <p className="font-mono text-2xl font-bold text-foreground tracking-wider">
                    {family.invite_code}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2 rounded-full" onClick={handleCopyCode}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {joinRequests.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-display font-semibold text-foreground">
                Solicitações Pendentes ({joinRequests.length})
              </h3>
            </div>
            <div className="space-y-3">
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-card border border-amber-100 dark:border-amber-900/30"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <User className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{request.user_name}</p>
                    <p className="text-xs text-muted-foreground">{request.user_email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-full"
                      onClick={() => handleRejectRequest(request.id, request.user_name)}
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1 rounded-full"
                      onClick={() => handleApproveRequest(request.id, request.user_name)}
                    >
                      <UserCheck className="w-4 h-4" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Members List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-display font-semibold text-foreground">Todos os Membros</h3>
              </div>
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Nenhum membro adicionado</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {members.map((member, index) => {
                    const config = roleConfig[member.role];
                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member.id)}
                        className={cn(
                          "flex items-center gap-3 p-4 cursor-pointer transition-colors",
                          selectedMember === member.id
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br",
                            avatarColors[index % avatarColors.length]
                          )}
                        >
                          <span className="text-lg font-bold text-white">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{member.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn(
                              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                              config.bgColor, config.color
                            )}>
                              <config.icon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </div>
                        </div>
                        {member.email && (
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Member Details */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-foreground">Detalhes</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive rounded-full"
                      onClick={() => handleRemoveMember(selected)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br mx-auto mb-3",
                      avatarColors[members.findIndex((m) => m.id === selected.id) % avatarColors.length]
                    )}
                  >
                    <span className="text-2xl font-bold text-white">
                      {selected.name.charAt(0)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground text-lg">{selected.name}</h4>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full mt-2",
                    roleConfig[selected.role].bgColor, roleConfig[selected.role].color
                  )}>
                    {React.createElement(roleConfig[selected.role].icon, { className: "w-4 h-4" })}
                    {roleConfig[selected.role].label}
                  </span>
                </div>

                <div className="space-y-3">
                  {selected.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{selected.email}</p>
                      </div>
                    </div>
                  )}

                  {selected.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="text-sm font-medium text-foreground">{selected.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-5 text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Selecione um membro para ver detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membros;
