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
      client: {
        Row: {
          advisor: string
          birth_date: string
          created_at: string
          email: string
          id: number
          name: string
        }
        Insert: {
          advisor?: string
          birth_date: string
          created_at?: string
          email: string
          id?: number
          name: string
        }
        Update: {
          advisor?: string
          birth_date?: string
          created_at?: string
          email?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          data: Json | null
          email: string | null
          id: number
          message: string
          pathname: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          email?: string | null
          id?: number
          message: string
          pathname?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          email?: string | null
          id?: number
          message?: string
          pathname?: string | null
        }
        Relationships: []
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
          id: number
          last_edited_at: string | null
          management_fee: number | null
          management_fee_type: string | null
          name: string
          portfolio_id: number
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
          id?: number
          last_edited_at?: string | null
          management_fee?: number | null
          management_fee_type?: string | null
          name: string
          portfolio_id: number
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
          id?: number
          last_edited_at?: string | null
          management_fee?: number | null
          management_fee_type?: string | null
          name?: string
          portfolio_id?: number
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
          client: number
          created_at: string
          currency: string
          end_date: string
          id: number
          inflation_rate: number
          last_edited_at: string
          link: string | null
          name: string
          start_date: string
        }
        Insert: {
          client: number
          created_at?: string
          currency: string
          end_date: string
          id?: number
          inflation_rate: number
          last_edited_at?: string
          link?: string | null
          name: string
          start_date: string
        }
        Update: {
          client?: number
          created_at?: string
          currency?: string
          end_date?: string
          id?: number
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
      transaction: {
        Row: {
          amount: number
          created_at: string
          date: string
          end_date: string | null
          id: number
          investment_id: number
          label: string | null
          last_edited_at: string | null
          repeat: number | null
          repeat_unit: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          end_date?: string | null
          id?: number
          investment_id: number
          label?: string | null
          last_edited_at?: string | null
          repeat?: number | null
          repeat_unit?: string | null
          type: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          end_date?: string | null
          id?: number
          investment_id?: number
          label?: string | null
          last_edited_at?: string | null
          repeat?: number | null
          repeat_unit?: string | null
          type?: string
          user_id?: string
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
        Args: {
          link_id: string
        }
        Returns: Database["public"]["CompositeTypes"]["client_view_type"][]
      }
      investment_readonly_view: {
        Args: {
          link_id: string
        }
        Returns: Database["public"]["CompositeTypes"]["investment_view_type"][]
      }
      portfolio_readonly_view: {
        Args: {
          link_id: string
        }
        Returns: Database["public"]["CompositeTypes"]["portfolio_view_type"][]
      }
      transaction_readonly_view: {
        Args: {
          link_id: string
        }
        Returns: Database["public"]["CompositeTypes"]["transaction_view_type"][]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      client_view_type: {
        id: number | null
        name: string | null
        birth_date: string | null
        advisor: string | null
        created_at: string | null
      }
      investment_view_type: {
        id: number | null
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
        id: number | null
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
        id: number | null
        type: string | null
        amount: number | null
        label: string | null
        date: string | null
        repeat: number | null
        repeat_unit: string | null
        end_date: string | null
        created_at: string | null
        last_edited_at: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never