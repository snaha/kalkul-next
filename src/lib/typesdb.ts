export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          token_hash: string
          token_prefix: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          token_hash: string
          token_prefix: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          token_hash?: string
          token_prefix?: string
          user_id?: string
        }
        Relationships: []
      }
      client: {
        Row: {
          advisor: string
          birth_date: string
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          advisor?: string
          birth_date: string
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          advisor?: string
          birth_date?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      goal_investment_link: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          investment_id: string
          percentage: number | null
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          investment_id: string
          percentage?: number | null
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          investment_id?: string
          percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_investment_link_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "investment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_investment_link_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investment"
            referencedColumns: ["id"]
          },
        ]
      }
      investment: {
        Row: {
          advanced_fees: boolean | null
          apy: number | null
          created_at: string
          entry_fee: number | null
          entry_fee_type: string | null
          exit_fee: number | null
          exit_fee_type: string | null
          goal_data: Json | null
          id: string
          last_edited_at: string | null
          management_fee: number | null
          management_fee_type: string | null
          name: string
          portfolio_id: string
          success_fee: number | null
          ter: number | null
          type: string | null
        }
        Insert: {
          advanced_fees?: boolean | null
          apy?: number | null
          created_at?: string
          entry_fee?: number | null
          entry_fee_type?: string | null
          exit_fee?: number | null
          exit_fee_type?: string | null
          goal_data?: Json | null
          id?: string
          last_edited_at?: string | null
          management_fee?: number | null
          management_fee_type?: string | null
          name: string
          portfolio_id: string
          success_fee?: number | null
          ter?: number | null
          type?: string | null
        }
        Update: {
          advanced_fees?: boolean | null
          apy?: number | null
          created_at?: string
          entry_fee?: number | null
          entry_fee_type?: string | null
          exit_fee?: number | null
          exit_fee_type?: string | null
          goal_data?: Json | null
          id?: string
          last_edited_at?: string | null
          management_fee?: number | null
          management_fee_type?: string | null
          name?: string
          portfolio_id?: string
          success_fee?: number | null
          ter?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_portfolio_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolio"
            referencedColumns: ["id"]
          },
        ]
      }
      isin_errors: {
        Row: {
          created_at: string
          error: Json | null
          id: number
          identifier: string | null
        }
        Insert: {
          created_at?: string
          error?: Json | null
          id?: number
          identifier?: string | null
        }
        Update: {
          created_at?: string
          error?: Json | null
          id?: number
          identifier?: string | null
        }
        Relationships: []
      }
      market_data_cache: {
        Row: {
          created_at: string
          id: number
          id_type: string
          identifier: string
          response_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          id_type: string
          identifier: string
          response_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          id_type?: string
          identifier?: string
          response_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          client: string
          created_at: string
          currency: string
          end_date: string
          id: string
          inflation_rate: number
          last_edited_at: string
          link: string | null
          name: string
          start_date: string
        }
        Insert: {
          client: string
          created_at?: string
          currency: string
          end_date: string
          id?: string
          inflation_rate: number
          last_edited_at?: string
          link?: string | null
          name: string
          start_date: string
        }
        Update: {
          client?: string
          created_at?: string
          currency?: string
          end_date?: string
          id?: string
          inflation_rate?: number
          last_edited_at?: string
          link?: string | null
          name?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_client_fkey"
            columns: ["client"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_subscription: {
        Row: {
          created_at: string
          current_period_end: string
          id: number
          items: Json | null
          last_edited_at: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          id?: number
          items?: Json | null
          last_edited_at?: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          id?: number
          items?: Json | null
          last_edited_at?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transaction: {
        Row: {
          amount: number
          created_at: string
          date: string
          end_date: string | null
          id: string
          inflation_adjusted: boolean
          investment_id: string
          label: string | null
          last_edited_at: string | null
          repeat: number | null
          repeat_unit: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          end_date?: string | null
          id?: string
          inflation_adjusted?: boolean
          investment_id: string
          label?: string | null
          last_edited_at?: string | null
          repeat?: number | null
          repeat_unit?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          end_date?: string | null
          id?: string
          inflation_adjusted?: boolean
          investment_id?: string
          label?: string | null
          last_edited_at?: string | null
          repeat?: number | null
          repeat_unit?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investment"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      client_readonly_view: {
        Args: { link_id: string }
        Returns: Database["public"]["CompositeTypes"]["client_view_type"][]
      }
      investment_readonly_view: {
        Args: { link_id: string }
        Returns: Database["public"]["CompositeTypes"]["investment_view_type"][]
      }
      portfolio_readonly_view: {
        Args: { link_id: string }
        Returns: Database["public"]["CompositeTypes"]["portfolio_view_type"][]
      }
      transaction_readonly_view: {
        Args: { link_id: string }
        Returns: Database["public"]["CompositeTypes"]["transaction_view_type"][]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      client_view_type: {
        id: string | null
        name: string | null
        birth_date: string | null
        advisor: string | null
        created_at: string | null
      }
      investment_view_type: {
        id: string | null
        apy: number | null
        entry_fee: number | null
        exit_fee: number | null
        management_fee: number | null
        exit_fee_type: string | null
        management_fee_type: string | null
        entry_fee_type: string | null
        name: string | null
        success_fee: number | null
        created_at: string | null
        last_edited_at: string | null
      }
      portfolio_view_type: {
        id: string | null
        name: string | null
        start_date: string | null
        end_date: string | null
        inflation_rate: number | null
        currency: string | null
        link: string | null
        created_at: string | null
        last_edited_at: string | null
      }
      transaction_view_type: {
        id: string | null
        type: string | null
        amount: number | null
        label: string | null
        date: string | null
        repeat: number | null
        repeat_unit: string | null
        end_date: string | null
        created_at: string | null
        last_edited_at: string | null
        investment_id: string | null
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

