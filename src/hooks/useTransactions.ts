import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    icon: string | null;
    month: number;
    year: number;
}

export function useTransactions(selectedMonth: number, selectedYear: number, filterMode: 'month' | 'year' | 'total' = 'month') {
    const { family } = useFamily();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (family?.id) {
            fetchTransactions();
        } else {
            setTransactions([]);
            setLoading(false);
        }
    }, [family?.id, selectedMonth, selectedYear, filterMode]);

    const fetchTransactions = async () => {
        if (!family?.id) return;
        setLoading(true);

        // Calculate start and end date
        let startDate: string;
        let endDate: string;

        if (filterMode === 'total') {
            startDate = "1970-01-01T00:00:00.000Z";
            endDate = "2100-12-31T23:59:59.999Z";
        } else if (filterMode === 'year') {
            startDate = new Date(selectedYear, 0, 1).toISOString();
            endDate = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();
        } else {
            startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
            endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString();
        }

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('family_id', family.id)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (error) throw error;

            // Map DB data to frontend structure
            const mappedTransactions: Transaction[] = data.map(t => {
                const date = new Date(t.date);
                return {
                    id: t.id,
                    description: t.description,
                    amount: t.amount,
                    type: (t.type as "income" | "expense") || "expense",
                    category: t.category,
                    date: t.date,
                    icon: t.icon,
                    month: date.getMonth(),
                    year: date.getFullYear()
                };
            });

            setTransactions(mappedTransactions);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast({ title: "Erro ao carregar transações", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (transaction: Omit<Transaction, "id" | "month" | "year">) => {
        if (!family?.id || !user?.id) return;

        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    family_id: family.id,
                    description: transaction.description,
                    amount: transaction.amount,
                    type: transaction.type,
                    category: transaction.category,
                    date: transaction.date,
                    icon: transaction.icon,
                    created_by: user.id
                })
                .select()
                .single();

            if (error) throw error;

            const newTx: Transaction = {
                id: data.id,
                description: data.description,
                amount: data.amount,
                type: (data.type as "income" | "expense") || "expense",
                category: data.category,
                date: data.date,
                icon: data.icon,
                month: new Date(data.date).getMonth(),
                year: new Date(data.date).getFullYear()
            };

            // Checking if the new transaction fits the current filter
            // Since we might be in 'total' or 'year' mode, we need to be broader
            const txDate = new Date(newTx.date);
            const matchesMonth = txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
            const matchesYear = txDate.getFullYear() === selectedYear;

            // Update if strict month match OR if in year mode and year matches OR if in total mode
            if (
                filterMode === 'total' ||
                (filterMode === 'year' && matchesYear) ||
                (filterMode === 'month' && matchesMonth)
            ) {
                setTransactions(prev => [newTx, ...prev]);
            }

            toast({
                title: "Transação adicionada!",
                description: `${newTx.description} - R$ ${newTx.amount.toFixed(2)}`,
            });

            return newTx;
        } catch (error) {
            console.error("Error adding transaction:", error);
            toast({ title: "Erro ao adicionar transação", variant: "destructive" });
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) throw error;
            setTransactions(prev => prev.filter(t => t.id !== id));
            toast({ title: "Transação removida" });
        } catch (error) {
            console.error("Error deleting transaction:", error);
            toast({ title: "Erro ao remover transação", variant: "destructive" });
        }
    };

    return {
        transactions,
        loading,
        addTransaction,
        deleteTransaction,
        refetch: fetchTransactions
    };
}
