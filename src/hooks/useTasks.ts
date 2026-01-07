import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFamily } from "./useFamily";
import { toast } from "@/hooks/use-toast";

export interface Task {
    id: string;
    family_id: string;
    title: string;
    assignee: string;
    priority: "high" | "medium" | "low";
    completed: boolean;
    dueDate: string;
    recurring: boolean;
    createdAt: string;
}

export function useTasks() {
    const { user } = useAuth();
    const { family } = useFamily();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (family?.id) {
            fetchTasks();
        } else {
            setTasks([]);
            setLoading(false);
        }
    }, [family?.id]);

    const fetchTasks = async () => {
        if (!family?.id) return;
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('family_id', family.id)
                .order('due_date', { ascending: true });

            if (error) throw error;

            const mappedTasks: Task[] = data.map(item => ({
                id: item.id,
                family_id: item.family_id,
                title: item.title,
                assignee: item.assignee,
                priority: item.priority as "high" | "medium" | "low",
                completed: item.completed,
                dueDate: item.due_date,
                recurring: item.recurring,
                createdAt: item.created_at
            }));

            setTasks(mappedTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast({ title: "Erro ao carregar tarefas", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (task: Omit<Task, "id" | "family_id" | "createdAt" | "completed">) => {
        if (!family?.id || !user?.id) return;

        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    family_id: family.id,
                    title: task.title,
                    assignee: task.assignee,
                    priority: task.priority,
                    completed: false,
                    due_date: task.dueDate,
                    recurring: task.recurring,
                    created_by: user.id
                })
                .select()
                .single();

            if (error) throw error;

            const newTask: Task = {
                id: data.id,
                family_id: data.family_id,
                title: data.title,
                assignee: data.assignee,
                priority: data.priority as "high" | "medium" | "low",
                completed: data.completed,
                dueDate: data.due_date,
                recurring: data.recurring,
                createdAt: data.created_at
            };

            setTasks((prev) => [newTask, ...prev]);
            toast({
                title: "✓ Tarefa criada!",
                description: `${newTask.title} atribuída a ${newTask.assignee}`,
            });
            return newTask;
        } catch (error) {
            console.error("Error adding task:", error);
            toast({ title: "Erro ao criar tarefa", variant: "destructive" });
        }
    };

    const toggleTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Optimistic update
        const newCompleted = !task.completed;
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, completed: newCompleted } : t
        ));

        toast({
            title: newCompleted ? "✓ Concluída!" : "Reaberta",
            description: task.title,
        });

        try {
            const { error } = await supabase
                .from('tasks')
                .update({ completed: newCompleted })
                .eq('id', taskId);

            if (error) throw error;
        } catch (error) {
            console.error("Error toggling task:", error);
            toast({ title: "Erro ao atualizar tarefa", variant: "destructive" });
            // Revert
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: !newCompleted } : t
            ));
        }
    };

    const deleteTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        // Optimistic
        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== taskId));

        toast({
            title: "Tarefa removida",
            description: task?.title,
        });

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting task:", error);
            toast({ title: "Erro ao remover tarefa", variant: "destructive" });
            setTasks(previousTasks);
        }
    };

    return {
        tasks,
        loading,
        addTask,
        toggleTask,
        deleteTask,
        fetchTasks
    };
}
