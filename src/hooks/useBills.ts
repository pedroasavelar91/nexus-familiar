import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { toast } from "@/hooks/use-toast";

export interface Bill {
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    status: "pending" | "paid" | "overdue";
    type: "income" | "expense";
    category: string;
    isRecurring: boolean;
    frequency: string;
    month: number;
    year: number;
}

// Helper type for DB response
interface BillRow {
    id: string;
    description: string;
    amount: number;
    due_date: string;
    status: string;
    type: string;
    category: string;
    is_recurring: boolean;
    frequency: string;
    family_id: string;
    created_at: string;
}

export function useBills(selectedMonth: number, selectedYear: number) {
    const { family } = useFamily();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null); // New error state

    useEffect(() => {
        if (family?.id) {
            fetchBills();
        } else {
            setBills([]);
            setLoading(false);
        }
    }, [family?.id, selectedMonth, selectedYear]);

    const fetchBills = async () => {
        if (!family?.id) return;
        setLoading(true);
        setError(null); // Reset error

        // Calculate range for bills (based on due date)
        // Adjust date to avoid timezone issues with ISOString
        const start = new Date(selectedYear, selectedMonth, 1);
        const end = new Date(selectedYear, selectedMonth + 1, 0);

        // Format dates as YYYY-MM-DD for simpler comparison with Supabase DATE / TIMESTAMPTZ columns
        const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

        try {
            // Fetch bills that are:
            // 1. In the current month (regardless of status)
            // 2. OR Pending/Overdue from the past (Backlog)
            // Logic: due_date <= endDate AND (status != 'paid' OR due_date >= startDate)

            const { data, error } = await supabase
                .from('bills')
                .select('*')
                .eq('family_id', family.id)
                .lte('due_date', endDate)
                .or(`status.neq.paid,due_date.gte.${startDate}`)
                .order('due_date', { ascending: true });

            if (error) throw error;

            // Cast data to any first to avoid type errors with new columns if types aren't generated
            const mappedBills: Bill[] = (data as any[]).map(b => {
                const date = new Date(b.due_date);
                return {
                    id: b.id,
                    description: b.description,
                    amount: b.amount,
                    dueDate: b.due_date,
                    status: (b.status as "pending" | "paid" | "overdue") || "pending",
                    type: (b.type as "income" | "expense") || "expense",
                    category: b.category || "Contas", // Default to "Contas" if missing
                    isRecurring: b.is_recurring || false,
                    frequency: b.frequency || "monthly",
                    month: date.getMonth(),
                    year: date.getFullYear()
                };
            });

            setBills(mappedBills);
        } catch (error) {
            console.error("Error fetching bills:", error);
            setError(error); // Set error state
            toast({ title: "Erro ao carregar contas", description: "Verifique os alertas na tela.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const addBill = async (bill: Omit<Bill, "id" | "month" | "year">) => {
        if (!family?.id) {
            console.error("Family ID missing in addBill");
            toast({ title: "Erro", description: "Família não identificada. Tente recarregar a página.", variant: "destructive" });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('bills')
                .insert({
                    family_id: family.id,
                    description: bill.description,
                    amount: bill.amount,
                    due_date: bill.dueDate,
                    type: bill.type,
                    category: bill.category,
                    is_recurring: bill.isRecurring,
                    frequency: bill.frequency,
                    status: bill.status || "pending"
                } as any)
                .select()
                .single();

            if (error) throw error;

            const newBillData = data as any;
            const newBill: Bill = {
                id: newBillData.id,
                description: newBillData.description,
                amount: newBillData.amount,
                dueDate: newBillData.due_date,
                status: (newBillData.status as "pending" | "paid" | "overdue") || "pending",
                type: (newBillData.type as "income" | "expense") || "expense",
                category: newBillData.category || bill.category || "Contas",
                isRecurring: newBillData.is_recurring || false,
                frequency: newBillData.frequency || "monthly",
                month: new Date(newBillData.due_date).getMonth(),
                year: new Date(newBillData.due_date).getFullYear()
            };

            // Update local state if it matches current view
            const billDate = new Date(newBill.dueDate);
            if (billDate.getMonth() === selectedMonth && billDate.getFullYear() === selectedYear) {
                setBills(prev => [newBill, ...prev]);
            }

            toast({
                title: "Conta adicionada!",
                description: `${newBill.description} - Vence em ${new Date(newBill.dueDate).toLocaleDateString("pt-BR")}`,
            });

            return newBill;
        } catch (error: any) {
            console.error("Error adding bill:", error);
            toast({
                title: "Erro ao adicionar conta",
                description: `Detalhes: ${typeof error === "object" ? (error.message || JSON.stringify(error)) : error}`,
                variant: "destructive"
            });
        }
    };

    const toggleBillStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "paid" ? "pending" : "paid";
        try {
            const { error } = await supabase
                .from('bills')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setBills(prev => prev.map(b =>
                b.id === id ? { ...b, status: newStatus as "pending" | "paid" } : b
            ));

            toast({
                title: newStatus === "paid" ? "✓ Conta paga!" : "Conta reaberta",
            });

        } catch (error) {
            console.error("Error updating bill status:", error);
            toast({ title: "Erro ao atualizar status", variant: "destructive" });
        }
    };

    const deleteBill = async (id: string) => {
        try {
            const { error } = await supabase.from('bills').delete().eq('id', id);
            if (error) throw error;
            setBills(prev => prev.filter(b => b.id !== id));
            toast({ title: "Conta removida" });
        } catch (error) {
            console.error("Error deleting bill:", error);
            toast({ title: "Erro ao remover conta", variant: "destructive" });
        }
    };

    return {
        bills,
        loading,
        error, // Return the real error
        addBill,
        toggleBillStatus,
        deleteBill,
        refetch: fetchBills
    };
}
