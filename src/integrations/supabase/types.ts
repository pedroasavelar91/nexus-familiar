export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string | null
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string | null
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string | null
          name?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          family_id: string
          id: string
          name: string
          phone: string | null
          role: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          family_id: string
          id?: string
          name: string
          phone?: string | null
          role?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          family_id?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          created_at: string
          family_id: string
          id: string
          responded_at: string | null
          responded_by: string | null
          status: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_family_id: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_family_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_family_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_family_id_fkey"
            columns: ["current_family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          family_id: string
          title: string
          assignee: string
          priority: string
          completed: boolean
          due_date: string
          recurring: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          family_id: string
          title: string
          assignee: string
          priority: string
          completed?: boolean
          due_date: string
          recurring?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          title?: string
          assignee?: string
          priority?: string
          completed?: boolean
          due_date?: string
          recurring?: boolean
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      pantry_items: {
        Row: {
          id: string
          family_id: string
          name: string
          category: string
          current_amount: number
          ideal_amount: number
          unit: string
          expiration_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          category: string
          current_amount?: number
          ideal_amount?: number
          unit: string
          expiration_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          category?: string
          current_amount?: number
          ideal_amount?: number
          unit?: string
          expiration_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pantry_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      shopping_items: {
        Row: {
          id: string
          family_id: string
          name: string
          category: string
          quantity: number
          unit: string
          completed: boolean
          pantry_item_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          category: string
          quantity?: number
          unit: string
          completed?: boolean
          pantry_item_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          category?: string
          quantity?: number
          unit?: string
          completed?: boolean
          pantry_item_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_pantry_item_id_fkey"
            columns: ["pantry_item_id"]
            isOneToOne: false
            referencedRelation: "pantry_items"
            referencedColumns: ["id"]
          }
        ]
      }
      recipes: {
        Row: {
          id: string
          family_id: string
          name: string
          prep_time: string | null
          servings: number | null
          difficulty: string | null
          instructions: string | null
          image_url: string | null
          ingredients: Json | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          prep_time?: string | null
          servings?: number | null
          difficulty?: string | null
          instructions?: string | null
          image_url?: string | null
          ingredients?: Json | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          prep_time?: string | null
          servings?: number | null
          difficulty?: string | null
          instructions?: string | null
          image_url?: string | null
          ingredients?: Json | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      meal_plans: {
        Row: {
          id: string
          family_id: string
          date: string
          meals: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          date: string
          meals?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          date?: string
          meals?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      vaccines: {
        Row: {
          id: string
          family_id: string
          name: string
          member_name: string
          date_administered: string
          next_dose_date: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          member_name: string
          date_administered: string
          next_dose_date?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          member_name?: string
          date_administered?: string
          next_dose_date?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccines_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      medications: {
        Row: {
          id: string
          family_id: string
          name: string
          member_name: string
          dosage: string | null
          frequency: string | null
          next_dose_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          member_name: string
          dosage?: string | null
          frequency?: string | null
          next_dose_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          member_name?: string
          dosage?: string | null
          frequency?: string | null
          next_dose_time?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      health_contacts: {
        Row: {
          id: string
          family_id: string
          name: string
          specialty: string | null
          phone: string | null
          type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          specialty?: string | null
          phone?: string | null
          type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          specialty?: string | null
          phone?: string | null
          type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_contacts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          family_id: string
          description: string
          amount: number
          type: string | null
          category: string
          date: string
          icon: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          family_id: string
          description: string
          amount: number
          type?: string | null
          category: string
          date: string
          icon?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          description?: string
          amount?: number
          type?: string | null
          category?: string
          date?: string
          icon?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      bills: {
        Row: {
          id: string
          family_id: string
          description: string
          amount: number
          due_date: string
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          description: string
          amount: number
          due_date: string
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          description?: string
          amount?: number
          due_date?: string
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_assets: {
        Row: {
          id: string
          family_id: string
          name: string
          amount: number
          type: "investment" | "savings"
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          amount?: number
          type: "investment" | "savings"
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          amount?: number
          type?: "investment" | "savings"
          color?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_assets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_family_id: { Args: { p_user_id: string }; Returns: string }
      is_family_admin: {
        Args: { p_family_id: string; p_user_id: string }
        Returns: boolean
      }
      user_belongs_to_family: {
        Args: { p_family_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
