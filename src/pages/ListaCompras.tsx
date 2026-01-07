import { useState } from "react";
import {
    ShoppingCart, Plus, Search, Loader2,
    Check, Trash2, ArrowDownToLine, MoreVertical
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useShoppingList } from "@/hooks/useShoppingList";
import { usePantry } from "@/hooks/usePantry";

const units = [
    { value: "un", label: "Unidades (un)" },
    { value: "kg", label: "Quilogramas (kg)" },
    { value: "g", label: "Gramas (g)" },
    { value: "L", label: "Litros (L)" },
    { value: "pct", label: "Pacotes (pct)" },
    { value: "cx", label: "Caixas (cx)" },
    { value: "ml", label: "Mililitros (ml)" },
];

const ListaCompras = () => {
    const { items, addItem, toggleComplete, deleteItem, clearCompleted, importFromPantry } = useShoppingList();
    const { items: pantryItems } = usePantry();

    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const [newItem, setNewItem] = useState({
        name: "",
        category: "others",
        quantity: "",
        unit: "un",
    });

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const incompleteItems = filteredItems.filter(i => !i.completed);
    const completedItems = filteredItems.filter(i => i.completed);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name) return;

        addItem({
            name: newItem.name,
            category: newItem.category,
            quantity: parseFloat(newItem.quantity) || 1,
            unit: newItem.unit,
        });

        setNewItem({ name: "", category: "others", quantity: "", unit: "un" });
        setDialogOpen(false);
    };

    const handleImport = () => {
        importFromPantry(pantryItems);
    };

    return (
        <div className="min-h-screen pb-24 lg:pb-8">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 dark:from-emerald-600 dark:via-teal-700 dark:to-cyan-800">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                                    Lista de Compras
                                </h1>
                                <p className="text-white/80 text-sm">Planejamento de compras</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleImport}
                                variant="secondary"
                                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm hidden sm:flex"
                            >
                                <ArrowDownToLine className="w-4 h-4" />
                                <span>Importar Sugestões</span>
                            </Button>

                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 bg-white text-emerald-600 hover:bg-white/90 border-0 shadow-lg">
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Adicionar</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl">Adicionar à Lista</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddItem} className="space-y-5 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="itemName">Nome do Item</Label>
                                            <Input
                                                id="itemName"
                                                value={newItem.name}
                                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                                placeholder="Ex: Sabão em pó"
                                                className="h-12 rounded-xl"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Quantidade</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={newItem.quantity}
                                                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                                    placeholder="1"
                                                    className="h-12 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Unidade</Label>
                                                <Select
                                                    value={newItem.unit}
                                                    onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                                                >
                                                    <SelectTrigger className="h-12 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {units.map((u) => (
                                                            <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-12 rounded-xl text-base bg-emerald-600 hover:bg-emerald-700 text-white">
                                            Adicionar
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex sm:hidden gap-2 mb-4">
                        <Button
                            onClick={handleImport}
                            variant="secondary"
                            className="flex-1 gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                        >
                            <ArrowDownToLine className="w-4 h-4" />
                            <span>Importar</span>
                        </Button>
                        {completedItems.length > 0 && (
                            <Button
                                onClick={clearCompleted}
                                variant="secondary"
                                className="flex-1 gap-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Limpar</span>
                            </Button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <Input
                            placeholder="Buscar na lista..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                <div className="space-y-6">
                    {/* Pending Items */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="font-semibold text-lg text-foreground">A comprar ({incompleteItems.length})</h2>
                        </div>

                        {incompleteItems.length === 0 && (
                            <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Tudo comprado!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Sua lista de compras está vazia.
                                </p>
                            </div>
                        )}

                        <div className="grid gap-3">
                            {incompleteItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <button
                                            onClick={() => toggleComplete(item.id)}
                                            className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center"
                                        />
                                        <div>
                                            <p className="font-medium text-foreground">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity} {item.unit}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Remover
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Items */}
                    {completedItems.length > 0 && (
                        <div className="space-y-3 pt-6 border-t border-border">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="font-semibold text-lg text-muted-foreground">Comprados ({completedItems.length})</h2>
                                <Button
                                    onClick={clearCompleted}
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive text-xs h-8"
                                >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Limpar concluídos
                                </Button>
                            </div>

                            <div className="grid gap-3 opacity-60">
                                {completedItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-muted/50 p-4 rounded-xl border border-border/50 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <button
                                                onClick={() => toggleComplete(item.id)}
                                                className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center text-white"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <div>
                                                <p className="font-medium text-muted-foreground line-through decoration-emerald-500/50">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.quantity} {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => deleteItem(item.id)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground/50 hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListaCompras;
