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
      investment: {
        Row: {
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
          portfolio: number
          success_fee: number | null
        }
        Insert: {
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
          portfolio: number
          success_fee?: number | null
        }
        Update: {
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
          portfolio?: number
          success_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_portfolio_fkey"
            columns: ["portfolio"]
            isOneToOne: false
            referencedRelation: "portfolio"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "transaction_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

