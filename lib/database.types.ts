export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          name: 'Cardiff' | 'Wembley'
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: 'Cardiff' | 'Wembley'
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: 'Cardiff' | 'Wembley'
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      branch_users: {
        Row: {
          id: string
          branch_id: string
          full_name: string | null
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          branch_id: string
          full_name?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          full_name?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_categories: {
        Row: {
          id: string
          name: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category_id: string
          image_url: string | null
          is_available: boolean
          is_vegetarian: boolean
          is_vegan: boolean
          allergens: string[] | null
          prep_time_minutes: number
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          price: number
          category_id: string
          image_url?: string | null
          is_available?: boolean
          is_vegetarian?: boolean
          is_vegan?: boolean
          allergens?: string[] | null
          prep_time_minutes?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category_id?: string
          image_url?: string | null
          is_available?: boolean
          is_vegetarian?: boolean
          is_vegan?: boolean
          allergens?: string[] | null
          prep_time_minutes?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          branch_id: string
          title: string
          message: string
          type: string
          order_id: string | null
          is_read: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          branch_id: string
          title: string
          message: string
          type?: string
          order_id?: string | null
          is_read?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          branch_id?: string
          title?: string
          message?: string
          type?: string
          order_id?: string | null
          is_read?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          special_instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          total_price?: number
          special_instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          special_instructions?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          old_status: 'New' | 'Preparing' | 'Ready' | null
          new_status: 'New' | 'Preparing' | 'Ready'
          changed_by: string | null
          changed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          order_id: string
          old_status?: 'New' | 'Preparing' | 'Ready' | null
          new_status: 'New' | 'Preparing' | 'Ready'
          changed_by?: string | null
          changed_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          old_status?: 'New' | 'Preparing' | 'Ready' | null
          new_status?: 'New' | 'Preparing' | 'Ready'
          changed_by?: string | null
          changed_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          branch_id: string
          table_number: string
          status: 'New' | 'Preparing' | 'Ready'
          total_amount: number
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          ready_at: string | null
        }
        Insert: {
          id?: string
          order_number?: string
          branch_id: string
          table_number: string
          status?: 'New' | 'Preparing' | 'Ready'
          total_amount?: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          ready_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          branch_id?: string
          table_number?: string
          status?: 'New' | 'Preparing' | 'Ready'
          total_amount?: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          ready_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      menu_with_categories: {
        Row: {
          id: string | null
          name: string | null
          description: string | null
          price: number | null
          image_url: string | null
          is_available: boolean | null
          is_vegetarian: boolean | null
          is_vegan: boolean | null
          allergens: string[] | null
          prep_time_minutes: number | null
          display_order: number | null
          category_name: string | null
          category_order: number | null
        }
        Relationships: []
      }
      order_details: {
        Row: {
          id: string | null
          order_number: string | null
          table_number: string | null
          status: 'New' | 'Preparing' | 'Ready' | null
          total_amount: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
          ready_at: string | null
          branch_name: string | null
          created_by_name: string | null
          item_count: number | null
        }
        Relationships: []
      }
      order_items_details: {
        Row: {
          id: string | null
          order_id: string | null
          quantity: number | null
          unit_price: number | null
          total_price: number | null
          special_instructions: string | null
          item_name: string | null
          item_description: string | null
          category_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_order_total: {
        Args: {
          order_uuid: string
        }
        Returns: number
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_branch_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      branch_name: 'Cardiff' | 'Wembley'
      order_status: 'New' | 'Preparing' | 'Ready'
    }
  }
} 