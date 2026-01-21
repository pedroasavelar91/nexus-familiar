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

export function useBills(selectedMonth: number, selectedYear: number, filterMode: 'month' | 'year' | 'total' = 'month') {
    const { family } = useFamily();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (family?.id) {
            fetchBills();
        } else {
            setBills([]);
            setLoading(false);
        }
    }, [family?.id, selectedMonth, selectedYear, filterMode]);

    const fetchBills = async () => {
        if (!family?.id) return;
        setLoading(true);
        setError(null);

        // Calculate dates based on filter
        let startDate: string;
        let endDate: string;

        if (filterMode === 'total') {
            startDate = "1970-01-01";
            endDate = "2100-12-31";
        } else if (filterMode === 'year') {
            const start = new Date(selectedYear, 0, 1);
            const end = new Date(selectedYear, 11, 31);
            startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
            endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
        } else {
            const start = new Date(selectedYear, selectedMonth, 1);
            const end = new Date(selectedYear, selectedMonth + 1, 0);
            startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
            endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
        }

        try {
            let query = supabase
                .from('bills')
                .select('*')
                .eq('family_id', family.id)
                .order('due_date', { ascending: true });

            if (filterMode === 'total') {
                // For total, just fetch everything
            } else {
                // For Month/Year:
                // Fetch bills where:
                // 1. Due date is within range (lte endDate)
                // 2. AND (Status is not paid OR due date is after startDate)
                // This preserves the "Backlog" logic (show unpaid bills from past), but constrains "Paid" bills to the selected period.
                query = query
                    .lte('due_date', endDate)
                    .or(`status.neq.paid,due_date.gte.${startDate}`);
            }

            const { data, error } = await query;

            if (error) throw error;

            const mappedBills: Bill[] = (data as any[]).map(b => {
                const date = new Date(b.due_date);
                return {
                    id: b.id,
                    description: b.description,
                    amount: b.amount,
                    dueDate: b.due_date,
                    status: (b.status as "pending" | "paid" | "overdue") || "pending",
                    type: (b.type as "income" | "expense") || "expense",
                    category: b.category || "Contas",
                    isRecurring: b.is_recurring || false,
                    frequency: b.frequency || "monthly",
                    month: date.getMonth(),
                    year: date.getFullYear()
                };
            });

            setBills(mappedBills);
        } catch (error) {
            console.error("Error fetching bills:", error);
            setError(error);
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

            // Update local state - similar optimistic update logic
            // For Total: Always add
            // For Year: Add if years match
            // For Month: Add if months match (or if it's backlog/unpaid? complicated, simplification: strict date match)

            // Re-fetching is safer given the complex backlog logic, but let's try strict update first
            const billDate = new Date(newBill.dueDate);
            const matchesMonth = billDate.getMonth() === selectedMonth && billDate.getFullYear() === selectedYear;
            const matchesYear = billDate.getFullYear() === selectedYear;

            if (
                filterMode === 'total' ||
                (filterMode === 'year' && matchesYear) ||
                (filterMode === 'month' && matchesMonth)
            ) {
                setBills(prev => [newBill, ...prev]);
            } else {
                // If it's a backlog item (e.g. adding a past unpaid bill), refetching is best as it might appear.
                // But typically users add bills for *future*.
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

            // Note: If we are in 'Month' view, and we toggle a backlog bill to 'Paid', 
            // the fetch logic (status != paid OR in current month) means it typically DISAPPEARS 
            // if it was from a previous month.
            // But doing it via local state map keeps it visible until refetch. 
            // Users usually prefer it to vanish or stick? Sticking is less confusing.

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
        error,
        addBill,
        toggleBillStatus,
        deleteBill,
        refetch: fetchBills
    };
}
