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

export function useTransactions(
    selectedMonth: number,
    selectedYear: number,
    filterMode: 'month' | 'year' | 'total' = 'month',
    scope: 'family' | 'personal' = 'family'
) {
    const { family } = useFamily();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id && (scope === 'personal' || family?.id)) {
            fetchTransactions();
        } else {
            setTransactions([]);
            setLoading(false);
        }
    }, [family?.id, user?.id, selectedMonth, selectedYear, filterMode, scope]);

    const fetchTransactions = async () => {
        if (!user?.id) return;
        if (scope === 'family' && !family?.id) return;

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
            let query = supabase
                .from('transactions')
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (scope === 'personal') {
                query = query.eq('created_by', user.id);
            } else {
                query = query.eq('family_id', family!.id);
            }

            const { data, error } = await query;

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
        if (!user?.id) return;
        if (scope === 'family' && !family?.id) return;

        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    family_id: scope === 'family' ? family!.id : null, // Optional for personal
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

            // Update local state if it matches filters
            const txDate = new Date(newTx.date);
            const matchesMonth = txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
            const matchesYear = txDate.getFullYear() === selectedYear;

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

    const editTransaction = async (id: string, updates: Partial<Omit<Transaction, "id" | "month" | "year">>) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .update({
                    description: updates.description,
                    amount: updates.amount,
                    type: updates.type,
                    category: updates.category,
                    date: updates.date,
                    icon: updates.icon
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const updatedTx: Transaction = {
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

            setTransactions(prev => prev.map(t => t.id === id ? updatedTx : t));

            // Check if updated date still matches filter, if not remove it? 
            // For simplicity, we just update it in place. If date changed out of range, 
            // user might see it disappear next refresh or if we implement strict filter check here.

            toast({ title: "Transação atualizada!" });
            return updatedTx;
        } catch (error) {
            console.error("Error updating transaction:", error);
            toast({ title: "Erro ao atualizar transação", variant: "destructive" });
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
        editTransaction,
        deleteTransaction,
        refetch: fetchTransactions
    };
}
