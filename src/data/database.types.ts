export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          actor_kind: "member" | "client" | "system";
          actor_portal_access_id: string | null;
          actor_user_id: string | null;
          entity_id: string;
          entity_type: "lead" | "client" | "project";
          id: string;
          occurred_at: string;
          summary: string;
          type: string;
          visibility: "internal" | "portal";
          workspace_id: string;
        };
        Insert: {
          actor_kind: "member" | "client" | "system";
          actor_portal_access_id?: string | null;
          actor_user_id?: string | null;
          entity_id: string;
          entity_type: "lead" | "client" | "project";
          id?: string;
          occurred_at?: string;
          summary: string;
          type: string;
          visibility?: "internal" | "portal";
          workspace_id: string;
        };
        Update: {
          actor_kind?: "member" | "client" | "system";
          actor_portal_access_id?: string | null;
          actor_user_id?: string | null;
          entity_id?: string;
          entity_type?: "lead" | "client" | "project";
          id?: string;
          occurred_at?: string;
          summary?: string;
          type?: string;
          visibility?: "internal" | "portal";
          workspace_id?: string;
        };
        Relationships: [];
      };
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
      clients: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          owner_id: string | null;
          phone: string | null;
          source_lead_id: string | null;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          owner_id?: string | null;
          phone?: string | null;
          source_lead_id?: string | null;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          owner_id?: string | null;
          phone?: string | null;
          source_lead_id?: string | null;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [];
      };
      follow_ups: {
        Row: {
          client_id: string | null;
          created_at: string;
          due_at: string;
          id: string;
          lead_id: string | null;
          note: string;
          owner_id: string | null;
          status: "open" | "sent" | "done";
          workspace_id: string;
        };
        Insert: {
          client_id?: string | null;
          created_at?: string;
          due_at: string;
          id?: string;
          lead_id?: string | null;
          note: string;
          owner_id?: string | null;
          status?: "open" | "sent" | "done";
          workspace_id: string;
        };
        Update: {
          client_id?: string | null;
          created_at?: string;
          due_at?: string;
          id?: string;
          lead_id?: string | null;
          note?: string;
          owner_id?: string | null;
          status?: "open" | "sent" | "done";
          workspace_id?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          converted_client_id: string | null;
          created_at: string;
          email: string | null;
          estimated_value: number | null;
          id: string;
          lost_at: string | null;
          lost_reason: string | null;
          name: string;
          owner_id: string | null;
          phone: string | null;
          source: string | null;
          stage: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
          updated_at: string;
          won_at: string | null;
          workspace_id: string;
        };
        Insert: {
          converted_client_id?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_value?: number | null;
          id?: string;
          lost_at?: string | null;
          lost_reason?: string | null;
          name: string;
          owner_id?: string | null;
          phone?: string | null;
          source?: string | null;
          stage?: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
          updated_at?: string;
          won_at?: string | null;
          workspace_id: string;
        };
        Update: {
          converted_client_id?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_value?: number | null;
          id?: string;
          lost_at?: string | null;
          lost_reason?: string | null;
          name?: string;
          owner_id?: string | null;
          phone?: string | null;
          source?: string | null;
          stage?: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
          updated_at?: string;
          won_at?: string | null;
          workspace_id?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          client_id: string;
          created_at: string;
          deadline: string | null;
          id: string;
          name: string;
          owner_id: string | null;
          start_date: string | null;
          status: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          deadline?: string | null;
          id?: string;
          name: string;
          owner_id?: string | null;
          start_date?: string | null;
          status?: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          deadline?: string | null;
          id?: string;
          name?: string;
          owner_id?: string | null;
          start_date?: string | null;
          status?: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          created_at: string;
          role: "owner" | "member";
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          role: "owner" | "member";
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          role?: "owner" | "member";
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          created_at: string;
          currency: string;
          id: string;
          name: string;
          plan_id: string;
          timezone: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          id?: string;
          name: string;
          plan_id?: string;
          timezone?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          id?: string;
          name?: string;
          plan_id?: string;
          timezone?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      convert_lead_to_client: {
        Args: { p_lead_id: string };
        Returns: string;
      };
      create_follow_up_with_activity: {
        Args: {
          p_due_at: string;
          p_lead_id: string;
          p_note: string;
          p_workspace_id: string;
        };
        Returns: string;
      };
      create_lead_with_activity: {
        Args: {
          p_email?: string;
          p_estimated_value?: number;
          p_name: string;
          p_phone?: string;
          p_source?: string;
          p_workspace_id: string;
        };
        Returns: string;
      };
      create_project_with_activity: {
        Args: {
          p_client_id: string;
          p_deadline?: string;
          p_name: string;
          p_start_date?: string;
          p_workspace_id: string;
        };
        Returns: string;
      };
      submit_customer_access_request: {
        Args: {
          p_business_email: string;
          p_note?: string;
          p_project_reference: string;
        };
        Returns: string;
      };
      update_follow_up_status: {
        Args: { p_follow_up_id: string; p_message?: string; p_status: string };
        Returns: undefined;
      };
      is_workspace_member: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
