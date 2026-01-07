import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, Users, ArrowRight, Loader2, Search, 
  Plus, UserPlus, Clock, X, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "choose" | "create" | "join" | "pending";

const FamilySetup = () => {
  const [step, setStep] = useState<Step>("choose");
  const [familyName, setFamilyName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [foundFamily, setFoundFamily] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const { createFamily, searchFamilyByCode, requestToJoin, pendingRequest, cancelRequest } = useFamily();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if there's a pending request
  if (pendingRequest && step !== "pending") {
    setStep("pending");
  }

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim() || !memberName.trim()) return;

    setLoading(true);
    try {
      await createFamily(familyName.trim(), memberName.trim());
      toast({
        title: "Família criada!",
        description: `Bem-vindo à família ${familyName}!`,
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a família.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFamily = async () => {
    if (!inviteCode.trim()) return;

    setSearching(true);
    setFoundFamily(null);
    try {
      const family = await searchFamilyByCode(inviteCode.trim());
      if (family) {
        setFoundFamily(family);
      } else {
        toast({
          title: "Família não encontrada",
          description: "Verifique o código e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao buscar família.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleRequestJoin = async () => {
    if (!foundFamily || !memberName.trim()) return;

    setLoading(true);
    try {
      await requestToJoin(foundFamily.id, memberName.trim());
      toast({
        title: "Solicitação enviada!",
        description: "Aguarde a aprovação de um administrador.",
      });
      setStep("pending");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a solicitação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setLoading(true);
    try {
      await cancelRequest();
      toast({
        title: "Solicitação cancelada",
      });
      setStep("choose");
      setFoundFamily(null);
      setInviteCode("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cancelar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-productivity flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Nexus Familiar
          </h1>
          <p className="text-muted-foreground">
            Configure seu espaço familiar
          </p>
        </div>

        {/* Step: Choose */}
        {step === "choose" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("create")}
              className="w-full bento-card hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">Criar nova família</h3>
                  <p className="text-sm text-muted-foreground">Comece do zero e convide membros</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>

            <button
              onClick={() => setStep("join")}
              className="w-full bento-card hover:border-accent/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <UserPlus className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">Entrar em uma família</h3>
                  <p className="text-sm text-muted-foreground">Use o código de convite</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </button>
          </div>
        )}

        {/* Step: Create Family */}
        {step === "create" && (
          <div className="bento-card">
            <button
              onClick={() => setStep("choose")}
              className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>
            
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Criar nova família
            </h2>

            <form onSubmit={handleCreateFamily} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="familyName">Nome da Família</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="familyName"
                    type="text"
                    placeholder="Ex: Família Silva"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberName">Seu Nome</Label>
                <Input
                  id="memberName"
                  type="text"
                  placeholder="Como você quer ser chamado"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="h-12"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Você será o administrador desta família
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Criar Família
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step: Join Family */}
        {step === "join" && (
          <div className="bento-card">
            <button
              onClick={() => { setStep("choose"); setFoundFamily(null); setInviteCode(""); }}
              className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>
            
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Entrar em uma família
            </h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Código de Convite</Label>
                <div className="flex gap-2">
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="Ex: A1B2C3D4"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="h-12 font-mono tracking-wider"
                    maxLength={8}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-4"
                    onClick={handleSearchFamily}
                    disabled={searching || !inviteCode.trim()}
                  >
                    {searching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Peça o código para um administrador da família
                </p>
              </div>

              {foundFamily && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-semibold text-foreground">{foundFamily.name}</p>
                      <p className="text-xs text-muted-foreground">Família encontrada!</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="joinName">Seu Nome</Label>
                      <Input
                        id="joinName"
                        type="text"
                        placeholder="Como você quer ser chamado"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>

                    <Button
                      className="w-full h-12"
                      onClick={handleRequestJoin}
                      disabled={loading || !memberName.trim()}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Solicitar Entrada
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: Pending Request */}
        {step === "pending" && (
          <div className="bento-card text-center">
            <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Aguardando aprovação
            </h2>
            <p className="text-muted-foreground mb-6">
              Sua solicitação foi enviada. Um administrador da família precisa aprovar sua entrada.
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancelRequest}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Solicitação
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilySetup;
