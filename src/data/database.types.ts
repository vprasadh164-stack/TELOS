export type Database = {
  public: {
    Tables: {
      business_applications: {
        Row: {
          business_name: string;
          contact_email: string;
          description: string;
          owner_id: string;
          reviewed_at: string | null;
          status: "pending" | "approved" | "rejected";
          submitted_at: string;
          website: string | null;
        };
        Insert: {
          business_name: string;
          contact_email: string;
          description: string;
          owner_id: string;
          reviewed_at?: string | null;
          status?: "pending" | "approved" | "rejected";
          submitted_at?: string;
          website?: string | null;
        };
        Update: {
          business_name?: string;
          contact_email?: string;
          description?: string;
          owner_id?: string;
          reviewed_at?: string | null;
          status?: "pending" | "approved" | "rejected";
          submitted_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      customer_access_requests: {
        Row: {
          business_email: string;
          business_owner_id: string;
          created_at: string;
          customer_id: string;
          id: string;
          note: string;
          project_reference: string;
          reviewed_at: string | null;
          status: "pending" | "approved" | "rejected";
        };
        Insert: {
          business_email: string;
          business_owner_id: string;
          created_at?: string;
          customer_id: string;
          id?: string;
          note?: string;
          project_reference: string;
          reviewed_at?: string | null;
          status?: "pending" | "approved" | "rejected";
        };
        Update: {
          business_email?: string;
          business_owner_id?: string;
          created_at?: string;
          customer_id?: string;
          id?: string;
          note?: string;
          project_reference?: string;
          reviewed_at?: string | null;
          status?: "pending" | "approved" | "rejected";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      submit_customer_access_request: {
        Args: {
          p_business_email: string;
          p_note?: string;
          p_project_reference: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
