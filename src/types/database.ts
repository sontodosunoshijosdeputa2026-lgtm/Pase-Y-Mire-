export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      game_users: {
        Row: {
          id: string;
          telegram_id: string;
          username: string | null;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          telegram_id: string;
          username?: string | null;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telegram_id?: string;
          username?: string | null;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_profiles: {
        Row: {
          id: string;
          user_id: string;
          admin_level: 'admin' | 'super_admin';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          admin_level?: 'admin' | 'super_admin';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          admin_level?: 'admin' | 'super_admin';
          is_active?: boolean;
          created_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          admin_id: string;
          target_user_id: string;
          amount: number;
          transaction_type: 'generate' | 'transfer';
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          target_user_id: string;
          amount: number;
          transaction_type: 'generate' | 'transfer';
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          target_user_id?: string;
          amount?: number;
          transaction_type?: 'generate' | 'transfer';
          created_at?: string;
        };
      };
    };
    Functions: {
      generate_credits: {
        Args: { target_user_id: string; amount: number };
        Returns: Json;
      };
      transfer_credits: {
        Args: { target_user_id: string; amount: number };
        Returns: Json;
      };
    };
  };
        }
        
