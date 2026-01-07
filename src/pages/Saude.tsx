import { useState } from "react";
import {
  Heart, Stethoscope, Plus, Calendar,
  Syringe, Pill, Phone, User,
  AlertCircle, CheckCircle2, Clock, Loader2, Trash2,
  Activity, Shield, Building2, Ambulance
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

interface Vaccine {
  id: string;
  name: string;
  member: string;
  date: string;
  nextDose?: string;
  status: "uptodate" | "pending" | "overdue";
}

interface Medication {
  id: string;
  name: string;
  member: string;
  dosage: string;
  frequency: string;
  nextDose: string;
}

interface HealthContact {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  type: "doctor" | "clinic" | "emergency";
}

const statusConfig = {
  uptodate: { label: "Em dia", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle2 },
  pending: { label: "Próxima", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Clock },
  overdue: { label: "Atrasada", color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30", icon: AlertCircle },
};

const contactTypeConfig = {
  doctor: { label: "Médico", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  clinic: { label: "Clínica", icon: Building2, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
  emergency: { label: "Emergência", icon: Ambulance, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
};

const memberColors: Record<string, string> = {
  "Maria": "bg-pink-500",
  "João": "bg-blue-500",
  "Lucas": "bg-emerald-500",
  "Ana": "bg-purple-500",
  "Rex": "bg-amber-500",
};

const members = ["Maria", "João", "Lucas", "Ana", "Rex"];
const ITEMS_PER_PAGE = 10;

const Saude = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"vaccines" | "medications" | "contacts">("vaccines");
  const [vaccineDialogOpen, setVaccineDialogOpen] = useState(false);
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [vaccines, setVaccines] = useState<Vaccine[]>([
    { id: "1", name: "Gripe", member: "Maria", date: "2024-01-15", status: "uptodate" },
    { id: "2", name: "COVID-19 Reforço", member: "João", date: "2023-11-20", nextDose: "2024-05-20", status: "uptodate" },
    { id: "3", name: "Tétano", member: "Lucas", date: "2020-03-10", nextDose: "2024-03-10", status: "pending" },
    { id: "4", name: "V10 (Cachorro)", member: "Rex", date: "2023-06-15", nextDose: "2024-01-15", status: "overdue" },
  ]);

  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Losartana 50mg", member: "João", dosage: "1 comprimido", frequency: "1x ao dia", nextDose: "08:00" },
    { id: "2", name: "Vitamina D", member: "Maria", dosage: "1 cápsula", frequency: "1x ao dia", nextDose: "12:00" },
    { id: "3", name: "Suplemento Ômega 3", member: "Lucas", dosage: "2 cápsulas", frequency: "1x ao dia", nextDose: "07:00" },
  ]);

  const [contacts, setContacts] = useState<HealthContact[]>([
    { id: "1", name: "Dr. Carlos Mendes", specialty: "Clínico Geral", phone: "(11) 99999-1234", type: "doctor" },
    { id: "2", name: "Dra. Ana Paula", specialty: "Pediatra", phone: "(11) 99999-5678", type: "doctor" },
    { id: "3", name: "PetVet Clínica", specialty: "Veterinário", phone: "(11) 3333-4444", type: "clinic" },
    { id: "4", name: "SAMU", specialty: "Emergência", phone: "192", type: "emergency" },
  ]);

  const [newVaccine, setNewVaccine] = useState({
    name: "",
    member: "Maria",
    date: new Date().toISOString().split("T")[0],
    nextDose: "",
  });

  const [newMedication, setNewMedication] = useState({
    name: "",
    member: "Maria",
    dosage: "",
    frequency: "1x ao dia",
    nextDose: "08:00",
  });

  const [newContact, setNewContact] = useState({
    name: "",
    specialty: "",
    phone: "",
    type: "doctor" as "doctor" | "clinic" | "emergency",
  });

  const overdueCount = vaccines.filter((v) => v.status === "overdue").length;
  const uptodateCount = vaccines.filter((v) => v.status === "uptodate").length;

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccine.name) return;

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const vaccine: Vaccine = {
      id: crypto.randomUUID(),
      name: newVaccine.name,
      member: newVaccine.member,
      date: newVaccine.date,
      nextDose: newVaccine.nextDose || undefined,
      status: "uptodate",
    };

    setVaccines(prev => [vaccine, ...prev]);
    setNewVaccine({ name: "", member: "Maria", date: new Date().toISOString().split("T")[0], nextDose: "" });
    setVaccineDialogOpen(false);
    setSubmitting(false);

    toast({
      title: "💉 Vacina registrada!",
      description: `${vaccine.name} para ${vaccine.member}`,
    });
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedication.name) return;

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const medication: Medication = {
      id: crypto.randomUUID(),
      name: newMedication.name,
      member: newMedication.member,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      nextDose: newMedication.nextDose,
    };

    setMedications(prev => [medication, ...prev]);
    setNewMedication({ name: "", member: "Maria", dosage: "", frequency: "1x ao dia", nextDose: "08:00" });
    setMedicationDialogOpen(false);
    setSubmitting(false);

    toast({
      title: "💊 Medicamento adicionado!",
      description: `${medication.name} para ${medication.member}`,
    });
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const contact: HealthContact = {
      id: crypto.randomUUID(),
      name: newContact.name,
      specialty: newContact.specialty,
      phone: newContact.phone,
      type: newContact.type,
    };

    setContacts(prev => [contact, ...prev]);
    setNewContact({ name: "", specialty: "", phone: "", type: "doctor" });
    setContactDialogOpen(false);
    setSubmitting(false);

    toast({
      title: "📞 Contato adicionado!",
      description: contact.name,
    });
  };

  const deleteVaccine = (id: string) => {
    const vaccine = vaccines.find(v => v.id === id);
    setVaccines(prev => prev.filter(v => v.id !== id));
    toast({ title: "Vacina removida", description: vaccine?.name });
  };

  const deleteMedication = (id: string) => {
    const med = medications.find(m => m.id === id);
    setMedications(prev => prev.filter(m => m.id !== id));
    toast({ title: "Medicamento removido", description: med?.name });
  };

  const deleteContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    toast({ title: "Contato removido", description: contact?.name });
  };

  const getActiveDialogTrigger = () => {
    if (activeTab === "vaccines") {
      return (
        <Dialog open={vaccineDialogOpen} onOpenChange={setVaccineDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Vacina</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Registrar Vacina</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVaccine} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label htmlFor="vaccineName">Nome da Vacina</Label>
                <Input
                  id="vaccineName"
                  value={newVaccine.name}
                  onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })}
                  placeholder="Ex: Gripe"
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Membro</Label>
                  <Select
                    value={newVaccine.member}
                    onValueChange={(value) => setNewVaccine({ ...newVaccine, member: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m} value={m}>
                          <span className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", memberColors[m])} />
                            {m}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vaccineDate">Data</Label>
                  <Input
                    id="vaccineDate"
                    type="date"
                    value={newVaccine.date}
                    onChange={(e) => setNewVaccine({ ...newVaccine, date: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDose">Próxima Dose (opcional)</Label>
                <Input
                  id="nextDose"
                  type="date"
                  value={newVaccine.nextDose}
                  onChange={(e) => setNewVaccine({ ...newVaccine, nextDose: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar Vacina"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      );
    }
    if (activeTab === "medications") {
      return (
        <Dialog open={medicationDialogOpen} onOpenChange={setMedicationDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Medicamento</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Novo Medicamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMedication} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label htmlFor="medName">Nome</Label>
                <Input
                  id="medName"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  placeholder="Ex: Losartana 50mg"
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Membro</Label>
                  <Select
                    value={newMedication.member}
                    onValueChange={(value) => setNewMedication({ ...newMedication, member: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m} value={m}>
                          <span className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", memberColors[m])} />
                            {m}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosagem</Label>
                  <Input
                    id="dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    placeholder="Ex: 1 comprimido"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={newMedication.frequency}
                    onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1x ao dia">1x ao dia</SelectItem>
                      <SelectItem value="2x ao dia">2x ao dia</SelectItem>
                      <SelectItem value="3x ao dia">3x ao dia</SelectItem>
                      <SelectItem value="A cada 8h">A cada 8h</SelectItem>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDoseTime">Horário</Label>
                  <Input
                    id="nextDoseTime"
                    type="time"
                    value={newMedication.nextDose}
                    onChange={(e) => setNewMedication({ ...newMedication, nextDose: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Adicionar Medicamento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      );
    }
    return (
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Contato</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Novo Contato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddContact} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Nome</Label>
              <Input
                id="contactName"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Ex: Dr. Carlos"
                className="h-12 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newContact.type}
                  onValueChange={(value: "doctor" | "clinic" | "emergency") => setNewContact({ ...newContact, type: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Médico</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  value={newContact.specialty}
                  onChange={(e) => setNewContact({ ...newContact, specialty: e.target.value })}
                  placeholder="Ex: Cardiologista"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="h-12 rounded-xl"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Adicionar Contato"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Pagination Logic
  const getCurrentItems = () => {
    switch (activeTab) {
      case "vaccines": return vaccines;
      case "medications": return medications;
      case "contacts": return contacts;
      default: return [];
    }
  };
  const currentItems = getCurrentItems();
  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  const paginatedItems = currentItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-500 dark:from-rose-500 dark:via-pink-600 dark:to-fuchsia-600">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                  Saúde
                </h1>
                <p className="text-white/80 text-sm">Prontuário familiar</p>
              </div>
            </div>
            {getActiveDialogTrigger()}
          </div>

          {/* Stats Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{uptodateCount}</p>
                <p className="text-white/60 text-xs">Em dia</p>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{medications.length}</p>
                <p className="text-white/60 text-xs">Medicamentos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{overdueCount}</p>
                <p className="text-white/60 text-xs">Atrasadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "vaccines", label: "Vacinas", icon: Syringe },
            { id: "medications", label: "Medicamentos", icon: Pill },
            { id: "contacts", label: "Contatos", icon: Phone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab)
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

        {/* Content */}
        {activeTab === "vaccines" && (
          <div className="space-y-3">
            {(paginatedItems as Vaccine[]).map((vaccine) => {
              const status = statusConfig[vaccine.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={vaccine.id}
                  className="bg-card rounded-2xl border border-border p-4 transition-all hover:shadow-md group"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", status.bg)}>
                      <Syringe className={cn("w-5 h-5", status.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{vaccine.name}</h4>
                        <span className={cn(
                          "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                          status.bg, status.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className={cn("w-2 h-2 rounded-full", memberColors[vaccine.member])} />
                          {vaccine.member}
                        </span>
                        <span>Aplicada: {new Date(vaccine.date).toLocaleDateString("pt-BR")}</span>
                        {vaccine.nextDose && (
                          <span>Próxima: {new Date(vaccine.nextDose).toLocaleDateString("pt-BR")}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteVaccine(vaccine.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "medications" && (
          <div className="space-y-3">
            {(paginatedItems as Medication[]).map((med) => (
              <div
                key={med.id}
                className="bg-card rounded-2xl border border-border p-4 transition-all hover:shadow-md group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">{med.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", memberColors[med.member])} />
                        {med.member}
                      </span>
                      <span>{med.dosage}</span>
                      <span className="text-primary font-medium">{med.frequency}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {med.nextDose}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMedication(med.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(paginatedItems as HealthContact[]).map((contact) => {
              const typeConfig = contactTypeConfig[contact.type];
              const TypeIcon = typeConfig.icon;
              return (
                <div
                  key={contact.id}
                  className="bg-card rounded-2xl border border-border p-4 transition-all hover:shadow-md group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", typeConfig.bg)}>
                      <TypeIcon className={cn("w-5 h-5", typeConfig.color)} />
                    </div>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{contact.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{contact.specialty}</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </a>
                </div>
              );
            })}
          </div>
        )}

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

export default Saude;
