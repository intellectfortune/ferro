export type UserRole = "owner" | "broker" | "employee";
export type VehicleStatus = "draft" | "published" | "archived";
export type BookingStatus =
  | "inquiry"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";
export type CalendarEventType =
  | "booking"
  | "service"
  | "detailing"
  | "inspection"
  | "content_shoot"
  | "blocked";
export type PhotoCategory =
  | "listing_photo"
  | "id_doc"
  | "dec_page"
  | "other_doc";
export type ListingRequestStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "dismissed";
export type CampaignMode = "full_control" | "review";
export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "completed";
export type ConnectionProvider =
  | "stripe"
  | "instagram"
  | "bouncie"
  | "google_ads"
  | "meta_ads"
  | "docusign"
  | "pandadoc";
export type ConnectionStatus = "connected" | "disconnected";
export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";
export type InquirySource = "web_form" | "call" | "instagram_dm";
export type TeamChatChannel = "general" | "bookings" | "maintenance";
export type InquiryStatus = "new" | "contacted" | "closed";
export type ContractStatus =
  | "draft"
  | "sent"
  | "delivered"
  | "completed"
  | "declined"
  | "voided";

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          role: UserRole;
          full_name: string | null;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          role?: UserRole;
          full_name?: string | null;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicles: {
        Row: {
          id: string;
          company_id: string;
          make: string;
          model: string;
          year: number | null;
          color: string | null;
          vin: string | null;
          license_plate: string | null;
          daily_rate: number | null;
          specs: Record<string, unknown>;
          description: string | null;
          status: VehicleStatus;
          bouncie_imei: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          make: string;
          model: string;
          year?: number | null;
          color?: string | null;
          vin?: string | null;
          license_plate?: string | null;
          daily_rate?: number | null;
          specs?: Record<string, unknown>;
          description?: string | null;
          status?: VehicleStatus;
          bouncie_imei?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicle_photos: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string;
          category: PhotoCategory;
          storage_path: string;
          caption: string | null;
          is_public: boolean;
          uploaded_by: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id: string;
          category?: PhotoCategory;
          storage_path: string;
          caption?: string | null;
          is_public?: boolean;
          uploaded_by: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["vehicle_photos"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          start_at: string;
          end_at: string;
          status: BookingStatus;
          total_price: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id: string;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          start_at: string;
          end_at: string;
          status?: BookingStatus;
          total_price?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bookings_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_events: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string;
          type: CalendarEventType;
          title: string;
          start_at: string;
          end_at: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id: string;
          type?: CalendarEventType;
          title: string;
          start_at: string;
          end_at: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["calendar_events"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "calendar_events_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_requests: {
        Row: {
          id: string;
          company_id: string;
          submitted_by: string;
          message: string;
          status: ListingRequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          submitted_by: string;
          message: string;
          status?: ListingRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["listing_requests"]["Insert"]
        >;
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string | null;
          name: string;
          platform: string | null;
          mode: CampaignMode;
          status: CampaignStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id?: string | null;
          name: string;
          platform?: string | null;
          mode?: CampaignMode;
          status?: CampaignStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "campaigns_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      company_connections: {
        Row: {
          id: string;
          company_id: string;
          provider: ConnectionProvider;
          status: ConnectionStatus;
          credentials: Record<string, unknown> | null;
          connected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          provider: ConnectionProvider;
          status?: ConnectionStatus;
          credentials?: Record<string, unknown> | null;
          connected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["company_connections"]["Insert"]
        >;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          company_id: string;
          booking_id: string;
          stripe_invoice_id: string;
          stripe_customer_id: string;
          amount: number;
          status: InvoiceStatus;
          hosted_invoice_url: string | null;
          due_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          booking_id: string;
          stripe_invoice_id: string;
          stripe_customer_id: string;
          amount: number;
          status?: InvoiceStatus;
          hosted_invoice_url?: string | null;
          due_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      contracts: {
        Row: {
          id: string;
          company_id: string;
          booking_id: string;
          docusign_envelope_id: string | null;
          esign_provider: ConnectionProvider | null;
          pandadoc_document_id: string | null;
          status: ContractStatus;
          customer_name: string;
          customer_email: string;
          sent_at: string | null;
          completed_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          booking_id: string;
          docusign_envelope_id?: string | null;
          esign_provider?: ConnectionProvider | null;
          pandadoc_document_id?: string | null;
          status?: ContractStatus;
          customer_name: string;
          customer_email: string;
          sent_at?: string | null;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contracts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "contracts_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      team_messages: {
        Row: {
          id: string;
          company_id: string;
          author_id: string;
          body: string;
          channel: TeamChatChannel;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          author_id: string;
          body: string;
          channel?: TeamChatChannel;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_messages"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "team_messages_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      waitlist_signups: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["waitlist_signups"]["Insert"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string | null;
          source: InquirySource;
          status: InquiryStatus;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          message: string | null;
          occurred_at: string;
          external_ref: string | null;
          metadata: Record<string, unknown>;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id?: string | null;
          source: InquirySource;
          status?: InquiryStatus;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          message?: string | null;
          occurred_at?: string;
          external_ref?: string | null;
          metadata?: Record<string, unknown>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "inquiries_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      pending_invites: {
        Row: {
          id: string;
          email: string;
          company_id: string;
          role: UserRole;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          company_id: string;
          role: UserRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pending_invites"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_company_and_owner: {
        Args: { company_name: string; company_slug: string };
        Returns: Database["public"]["Tables"]["companies"]["Row"];
      };
      company_connection_statuses: {
        Args: Record<string, never>;
        Returns: {
          provider: ConnectionProvider;
          status: ConnectionStatus;
          connected_at: string | null;
        }[];
      };
      waitlist_count: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      vehicle_status: VehicleStatus;
      listing_request_status: ListingRequestStatus;
      campaign_mode: CampaignMode;
      campaign_status: CampaignStatus;
      booking_status: BookingStatus;
      calendar_event_type: CalendarEventType;
      photo_category: PhotoCategory;
      connection_provider: ConnectionProvider;
      connection_status: ConnectionStatus;
      invoice_status: InvoiceStatus;
      contract_status: ContractStatus;
      inquiry_source: InquirySource;
      inquiry_status: InquiryStatus;
      team_chat_channel: TeamChatChannel;
    };
    CompositeTypes: Record<string, never>;
  };
}
