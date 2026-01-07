import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { useToast } from "./use-toast";

export interface Asset {
    id: string;
    name: string;
    amount: number;
    initialAmount: number;
    type: "investment" | "savings";
    startDate: string;
    maturityDate?: string;
    color?: string;
}

export function useInvestments() {
    const { toast } = useToast();
    const { family } = useFamily();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (family?.id) {
            fetchAssets();
        } else {
            setAssets([]);
            setLoading(false);
        }
    }, [family?.id]);

    const fetchAssets = async () => {
        if (!family?.id) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('financial_assets')
                .select('*')
                .eq('family_id', family.id)
                .order('amount', { ascending: false });

            if (error) throw error;

            // Type validation/cast - casting to any[] to handle new columns not in auto-generated types
            const mappedAssets: Asset[] = (data as any[]).map(item => ({
                id: item.id,
                name: item.name,
                amount: item.amount,
                initialAmount: item.initial_amount || item.amount,
                type: item.type as "investment" | "savings",
                startDate: item.start_date || new Date().toISOString().split("T")[0],
                maturityDate: item.maturity_date,
                color: item.color || undefined
            }));

            setAssets(mappedAssets);
        } catch (error) {
            console.error("Error fetching assets:", error);
            toast({ title: "Erro ao carregar investimentos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const addAsset = async (asset: Omit<Asset, "id">) => {
        if (!family?.id) return;

        try {
            const { data, error } = await supabase
                .from('financial_assets')
                .insert({
                    family_id: family.id,
                    name: asset.name,
                    amount: asset.amount,
                    initial_amount: asset.initialAmount,
                    type: asset.type,
                    start_date: asset.startDate,
                    maturity_date: asset.maturityDate,
                    color: asset.color
                } as any)
                .select()
                .single();

            if (error) throw error;

            const newAssetData = data as any;
            const newAsset: Asset = {
                id: newAssetData.id,
                name: newAssetData.name,
                amount: newAssetData.amount,
                initialAmount: newAssetData.initial_amount,
                type: newAssetData.type as "investment" | "savings",
                startDate: newAssetData.start_date,
                maturityDate: newAssetData.maturity_date,
                color: newAssetData.color || undefined
            };

            setAssets((prev) => [...prev, newAsset]);
            toast({
                title: "Investimento/Economia adicionado!",
                description: asset.name,
            });
        } catch (error) {
            console.error("Error adding asset:", error);
            toast({ title: "Erro ao adicionar", variant: "destructive" });
        }
    };

    const deleteAsset = async (id: string) => {
        try {
            const { error } = await supabase
                .from('financial_assets')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAssets((prev) => prev.filter(a => a.id !== id));
            toast({ title: "Removido com sucesso" });
        } catch (error) {
            console.error("Error deleting asset:", error);
            toast({ title: "Erro ao remover", variant: "destructive" });
        }
    };

    return {
        assets,
        loading,
        addAsset,
        deleteAsset,
        refreshAssets: fetchAssets
    };
}
