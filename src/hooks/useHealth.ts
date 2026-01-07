import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFamily } from "./useFamily";
import { toast } from "@/hooks/use-toast";

export interface Vaccine {
    id: string;
    name: string;
    member: string;
    date: string;
    nextDose?: string;
    status: "uptodate" | "pending" | "overdue";
}

export interface Medication {
    id: string;
    name: string;
    member: string;
    dosage: string;
    frequency: string;
    nextDose: string;
}

export interface HealthContact {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    type: "doctor" | "clinic" | "emergency";
}

export function useHealth() {
    const { user } = useAuth();
    const { family } = useFamily();
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [contacts, setContacts] = useState<HealthContact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (family?.id) {
            fetchHealthData();
        } else {
            setVaccines([]);
            setMedications([]);
            setContacts([]);
            setLoading(false);
        }
    }, [family?.id]);

    const fetchHealthData = async () => {
        if (!family?.id) return;
        setLoading(true);
        try {
            await Promise.all([
                fetchVaccines(),
                fetchMedications(),
                fetchContacts()
            ]);
        } catch (error) {
            console.error("Error fetching health data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVaccines = async () => {
        const { data, error } = await supabase
            .from('vaccines')
            .select('*')
            .eq('family_id', family!.id)
            .order('date_administered', { ascending: false });

        if (error) {
            console.error("Error fetching vaccines:", error);
            toast({ title: "Erro ao carregar vacinas", variant: "destructive" });
            return;
        }

        setVaccines(data.map(v => ({
            id: v.id,
            name: v.name,
            member: v.member_name,
            date: v.date_administered,
            nextDose: v.next_dose_date || undefined,
            status: v.status as "uptodate" | "pending" | "overdue"
        })));
    };

    const fetchMedications = async () => {
        const { data, error } = await supabase
            .from('medications')
            .select('*')
            .eq('family_id', family!.id);

        if (error) {
            console.error("Error fetching medications:", error);
            toast({ title: "Erro ao carregar medicamentos", variant: "destructive" });
            return;
        }

        setMedications(data.map(m => ({
            id: m.id,
            name: m.name,
            member: m.member_name,
            dosage: m.dosage || "",
            frequency: m.frequency || "",
            nextDose: m.next_dose_time || ""
        })));
    };

    const fetchContacts = async () => {
        const { data, error } = await supabase
            .from('health_contacts')
            .select('*')
            .eq('family_id', family!.id);

        if (error) {
            console.error("Error fetching contacts:", error);
            toast({ title: "Erro ao carregar contatos", variant: "destructive" });
            return;
        }

        setContacts(data.map(c => ({
            id: c.id,
            name: c.name,
            specialty: c.specialty || "",
            phone: c.phone || "",
            type: c.type as "doctor" | "clinic" | "emergency"
        })));
    };

    const addVaccine = async (vaccine: Omit<Vaccine, "id">) => {
        if (!family?.id) return;
        try {
            const { data, error } = await supabase
                .from('vaccines')
                .insert({
                    family_id: family.id,
                    name: vaccine.name,
                    member_name: vaccine.member,
                    date_administered: vaccine.date,
                    next_dose_date: vaccine.nextDose,
                    status: vaccine.status
                })
                .select()
                .single();

            if (error) throw error;

            const newVaccine: Vaccine = {
                id: data.id,
                name: data.name,
                member: data.member_name,
                date: data.date_administered,
                nextDose: data.next_dose_date || undefined,
                status: data.status as "uptodate" | "pending" | "overdue"
            };

            setVaccines(prev => [newVaccine, ...prev]);
            return newVaccine;
        } catch (error) {
            console.error("Error adding vaccine:", error);
            toast({ title: "Erro ao adicionar vacina", variant: "destructive" });
        }
    };

    const deleteVaccine = async (id: string) => {
        try {
            const { error } = await supabase.from('vaccines').delete().eq('id', id);
            if (error) throw error;
            setVaccines(prev => prev.filter(v => v.id !== id));
        } catch (error) {
            console.error("Error deleting vaccine:", error);
            toast({ title: "Erro ao remover vacina", variant: "destructive" });
        }
    };

    const addMedication = async (med: Omit<Medication, "id">) => {
        if (!family?.id) return;
        try {
            const { data, error } = await supabase
                .from('medications')
                .insert({
                    family_id: family.id,
                    name: med.name,
                    member_name: med.member,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    next_dose_time: med.nextDose
                })
                .select()
                .single();

            if (error) throw error;

            const newMed: Medication = {
                id: data.id,
                name: data.name,
                member: data.member_name,
                dosage: data.dosage || "",
                frequency: data.frequency || "",
                nextDose: data.next_dose_time || ""
            };

            setMedications(prev => [newMed, ...prev]);
            return newMed;
        } catch (error) {
            console.error("Error adding medication:", error);
            toast({ title: "Erro ao adicionar medicamento", variant: "destructive" });
        }
    };

    const deleteMedication = async (id: string) => {
        try {
            const { error } = await supabase.from('medications').delete().eq('id', id);
            if (error) throw error;
            setMedications(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Error deleting medication:", error);
            toast({ title: "Erro ao remover medicamento", variant: "destructive" });
        }
    };

    const addContact = async (contact: Omit<HealthContact, "id">) => {
        if (!family?.id) return;
        try {
            const { data, error } = await supabase
                .from('health_contacts')
                .insert({
                    family_id: family.id,
                    name: contact.name,
                    specialty: contact.specialty,
                    phone: contact.phone,
                    type: contact.type
                })
                .select()
                .single();

            if (error) throw error;

            const newContact: HealthContact = {
                id: data.id,
                name: data.name,
                specialty: data.specialty || "",
                phone: data.phone || "",
                type: data.type as "doctor" | "clinic" | "emergency"
            };

            setContacts(prev => [newContact, ...prev]);
            return newContact;
        } catch (error) {
            console.error("Error adding contact:", error);
            toast({ title: "Erro ao adicionar contato", variant: "destructive" });
        }
    };

    const deleteContact = async (id: string) => {
        try {
            const { error } = await supabase.from('health_contacts').delete().eq('id', id);
            if (error) throw error;
            setContacts(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting contact:", error);
            toast({ title: "Erro ao remover contato", variant: "destructive" });
        }
    };

    return {
        vaccines,
        medications,
        contacts,
        loading,
        addVaccine,
        deleteVaccine,
        addMedication,
        deleteMedication,
        addContact,
        deleteContact
    };
}
