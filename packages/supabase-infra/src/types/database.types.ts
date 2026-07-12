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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      account_deletion_requests: {
        Row: {
          approved_at: string | null
          cancelled_at: string | null
          correlation_id: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          metadata: Json
          processed_at: string | null
          processing_started_at: string | null
          reason: string | null
          requested_at: string
          requested_by: string
          retention_until: string | null
          status: Database["public"]["Enums"]["account_deletion_status"]
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          cancelled_at?: string | null
          correlation_id?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json
          processed_at?: string | null
          processing_started_at?: string | null
          reason?: string | null
          requested_at?: string
          requested_by: string
          retention_until?: string | null
          status?: Database["public"]["Enums"]["account_deletion_status"]
          user_id: string
        }
        Update: {
          approved_at?: string | null
          cancelled_at?: string | null
          correlation_id?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json
          processed_at?: string | null
          processing_started_at?: string | null
          reason?: string | null
          requested_at?: string
          requested_by?: string
          retention_until?: string | null
          status?: Database["public"]["Enums"]["account_deletion_status"]
          user_id?: string
        }
        Relationships: []
      }
      app_roles: {
        Row: {
          created_at: string
          is_self_sign_up_allowed: boolean
          label: string
          role: string
        }
        Insert: {
          created_at?: string
          is_self_sign_up_allowed?: boolean
          label: string
          role: string
        }
        Update: {
          created_at?: string
          is_self_sign_up_allowed?: boolean
          label?: string
          role?: string
        }
        Relationships: []
      }
      assistant_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          invited_email: string | null
          invited_phone: string | null
          metadata: Json | null
          psychologist_id: string | null
          revoked_at: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          invited_email?: string | null
          invited_phone?: string | null
          metadata?: Json | null
          psychologist_id?: string | null
          revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invited_email?: string | null
          invited_phone?: string | null
          metadata?: Json | null
          psychologist_id?: string | null
          revoked_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string | null
          changed_fields: Json | null
          correlation_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string
          user_type: string | null
        }
        Insert: {
          action?: string | null
          changed_fields?: Json | null
          correlation_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id: string
          user_type?: string | null
        }
        Update: {
          action?: string | null
          changed_fields?: Json | null
          correlation_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      availability_exceptions: {
        Row: {
          created_at: string | null
          end_time: string | null
          exception_date: string
          id: string
          is_available: boolean | null
          psychologist_id: string
          reason: string | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          exception_date: string
          id?: string
          is_available?: boolean | null
          psychologist_id: string
          reason?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          exception_date?: string
          id?: string
          is_available?: boolean | null
          psychologist_id?: string
          reason?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_exceptions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "availability_exceptions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      busy_slots: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["calendar_event_type"] | null
          id: string
          is_hard_block: boolean
          psychologist_id: string
          slot_range: unknown
          source_id: string
          source_type: string
          title: string | null
        }
        Insert: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["calendar_event_type"] | null
          id?: string
          is_hard_block?: boolean
          psychologist_id: string
          slot_range: unknown
          source_id: string
          source_type: string
          title?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["calendar_event_type"] | null
          id?: string
          is_hard_block?: boolean
          psychologist_id?: string
          slot_range?: unknown
          source_id?: string
          source_type?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "busy_slots_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "busy_slots_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_change_log: {
        Row: {
          created_at: string
          google_event_id: string
          id: string
          modification_hash: string
          processed_at: string
          psychologist_id: string
          sync_direction: string
        }
        Insert: {
          created_at?: string
          google_event_id: string
          id?: string
          modification_hash: string
          processed_at?: string
          psychologist_id: string
          sync_direction: string
        }
        Update: {
          created_at?: string
          google_event_id?: string
          id?: string
          modification_hash?: string
          processed_at?: string
          psychologist_id?: string
          sync_direction?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_change_log_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "calendar_change_log_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_event_series: {
        Row: {
          all_day: boolean
          color: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          effective_end: string | null
          effective_start: string
          end_time: string
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id: string | null
          google_sync_status: Database["public"]["Enums"]["google_sync_status"]
          id: string
          location: string | null
          metadata: Json | null
          psychologist_id: string
          rrule: string
          start_time: string
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          effective_end?: string | null
          effective_start: string
          end_time: string
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id?: string | null
          google_sync_status?: Database["public"]["Enums"]["google_sync_status"]
          id?: string
          location?: string | null
          metadata?: Json | null
          psychologist_id: string
          rrule: string
          start_time: string
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          effective_end?: string | null
          effective_start?: string
          end_time?: string
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id?: string | null
          google_sync_status?: Database["public"]["Enums"]["google_sync_status"]
          id?: string
          location?: string | null
          metadata?: Json | null
          psychologist_id?: string
          rrule?: string
          start_time?: string
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_series_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "calendar_event_series_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_event_series_exceptions: {
        Row: {
          created_at: string
          exception_type: Database["public"]["Enums"]["series_exception_type"]
          id: string
          modified_fields: Json | null
          new_end_datetime: string | null
          new_start_datetime: string | null
          original_date: string
          reason: string | null
          series_id: string
        }
        Insert: {
          created_at?: string
          exception_type: Database["public"]["Enums"]["series_exception_type"]
          id?: string
          modified_fields?: Json | null
          new_end_datetime?: string | null
          new_start_datetime?: string | null
          original_date: string
          reason?: string | null
          series_id: string
        }
        Update: {
          created_at?: string
          exception_type?: Database["public"]["Enums"]["series_exception_type"]
          id?: string
          modified_fields?: Json | null
          new_end_datetime?: string | null
          new_start_datetime?: string | null
          original_date?: string
          reason?: string | null
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_series_exceptions_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "calendar_event_series"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean
          color: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          end_datetime: string
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id: string | null
          google_original_start_time: string | null
          google_recurring_event_id: string | null
          google_sync_error: string | null
          google_sync_status: Database["public"]["Enums"]["google_sync_status"]
          id: string
          last_synced_at: string | null
          location: string | null
          metadata: Json
          original_end_datetime: string | null
          original_start_datetime: string | null
          private_notes: string | null
          psychologist_id: string
          remote_etag: string | null
          remote_updated_at: string | null
          series_id: string | null
          source: Database["public"]["Enums"]["calendar_event_source"]
          start_datetime: string
          status: Database["public"]["Enums"]["calendar_event_status"]
          sync_origin: string
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes: number
          end_datetime: string
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id?: string | null
          google_original_start_time?: string | null
          google_recurring_event_id?: string | null
          google_sync_error?: string | null
          google_sync_status?: Database["public"]["Enums"]["google_sync_status"]
          id?: string
          last_synced_at?: string | null
          location?: string | null
          metadata?: Json
          original_end_datetime?: string | null
          original_start_datetime?: string | null
          private_notes?: string | null
          psychologist_id: string
          remote_etag?: string | null
          remote_updated_at?: string | null
          series_id?: string | null
          source?: Database["public"]["Enums"]["calendar_event_source"]
          start_datetime: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          sync_origin?: string
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          end_datetime?: string
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id?: string | null
          google_original_start_time?: string | null
          google_recurring_event_id?: string | null
          google_sync_error?: string | null
          google_sync_status?: Database["public"]["Enums"]["google_sync_status"]
          id?: string
          last_synced_at?: string | null
          location?: string | null
          metadata?: Json
          original_end_datetime?: string | null
          original_start_datetime?: string | null
          private_notes?: string | null
          psychologist_id?: string
          remote_etag?: string | null
          remote_updated_at?: string | null
          series_id?: string | null
          source?: Database["public"]["Enums"]["calendar_event_source"]
          start_datetime?: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          sync_origin?: string
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "calendar_events_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "calendar_event_series"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_holidays: {
        Row: {
          city: string | null
          created_at: string
          date: string
          description: string | null
          id: number
          name: string
          source: string
          state: string | null
          type: string | null
          updated_at: string
          year: number
        }
        Insert: {
          city?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: never
          name: string
          source?: string
          state?: string | null
          type?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          city?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: never
          name?: string
          source?: string
          state?: string | null
          type?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      catalog_clinical_activities: {
        Row: {
          active: boolean | null
          activity_kind: string | null
          clinician_notes_template: string | null
          code: string
          created_at: string | null
          delivery_modes: string[] | null
          description: string | null
          duration_min: number | null
          goals: string[] | null
          id: string
          image_path: string | null
          materials_json: Json | null
          media_url: string | null
          name: string | null
          pdf_path: string | null
          populations: string[] | null
          risk_level: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          activity_kind?: string | null
          clinician_notes_template?: string | null
          code: string
          created_at?: string | null
          delivery_modes?: string[] | null
          description?: string | null
          duration_min?: number | null
          goals?: string[] | null
          id?: string
          image_path?: string | null
          materials_json?: Json | null
          media_url?: string | null
          name?: string | null
          pdf_path?: string | null
          populations?: string[] | null
          risk_level?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          activity_kind?: string | null
          clinician_notes_template?: string | null
          code?: string
          created_at?: string | null
          delivery_modes?: string[] | null
          description?: string | null
          duration_min?: number | null
          goals?: string[] | null
          id?: string
          image_path?: string | null
          materials_json?: Json | null
          media_url?: string | null
          name?: string | null
          pdf_path?: string | null
          populations?: string[] | null
          risk_level?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      catalog_document_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          template_category: string
          template_data: Json
          title: string
          updated_at: string | null
          updated_by: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          template_category?: string
          template_data?: Json
          title: string
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          template_category?: string
          template_data?: Json
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      clinical_session_details: {
        Row: {
          attendance_confirmed: boolean | null
          billing_attempt_count: number
          billing_last_attempt_at: string | null
          billing_last_error: string | null
          billing_next_attempt_at: string | null
          billing_status: string | null
          calendar_event_id: string
          clinical_session_id: string | null
          confirmation_sent_at: string | null
          created_at: string
          id: string
          patient_id: string | null
          psychologist_client_id: string | null
          psychologist_service_id: string | null
          reminder_sent_at: string | null
          session_number: number | null
          session_type_id: string | null
          updated_at: string
        }
        Insert: {
          attendance_confirmed?: boolean | null
          billing_attempt_count?: number
          billing_last_attempt_at?: string | null
          billing_last_error?: string | null
          billing_next_attempt_at?: string | null
          billing_status?: string | null
          calendar_event_id: string
          clinical_session_id?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          id?: string
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_service_id?: string | null
          reminder_sent_at?: string | null
          session_number?: number | null
          session_type_id?: string | null
          updated_at?: string
        }
        Update: {
          attendance_confirmed?: boolean | null
          billing_attempt_count?: number
          billing_last_attempt_at?: string | null
          billing_last_error?: string | null
          billing_next_attempt_at?: string | null
          billing_status?: string | null
          calendar_event_id?: string
          clinical_session_id?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          id?: string
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_service_id?: string | null
          reminder_sent_at?: string | null
          session_number?: number | null
          session_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_session_details_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: true
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: true
            referencedRelation: "calendar_events_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: true
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["calendar_event_id"]
          },
          {
            foreignKeyName: "clinical_session_details_clinical_session_id_fkey"
            columns: ["clinical_session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_clinical_session_id_fkey"
            columns: ["clinical_session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
          {
            foreignKeyName: "clinical_session_details_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_psychologist_client_id_fkey"
            columns: ["psychologist_client_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_psychologist_service_id_fkey"
            columns: ["psychologist_service_id"]
            isOneToOne: false
            referencedRelation: "psychologist_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "session_types"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_audit_log: {
        Row: {
          attempted_at: string | null
          caller_role: string | null
          caller_user_id: string | null
          context: string | null
          error_message: string | null
          id: string
          operation: string
          success: boolean
        }
        Insert: {
          attempted_at?: string | null
          caller_role?: string | null
          caller_user_id?: string | null
          context?: string | null
          error_message?: string | null
          id?: string
          operation: string
          success: boolean
        }
        Update: {
          attempted_at?: string | null
          caller_role?: string | null
          caller_user_id?: string | null
          context?: string | null
          error_message?: string | null
          id?: string
          operation?: string
          success?: boolean
        }
        Relationships: []
      }
      generated_documents: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          document_type: string | null
          encoded_content: string | null
          id: string
          is_archived: boolean | null
          patient_id: string | null
          psychologist_client_id: string | null
          psychologist_id: string
          tags: string[] | null
          template_id: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string | null
          encoded_content?: string | null
          id?: string
          is_archived?: boolean | null
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_id: string
          tags?: string[] | null
          template_id?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string | null
          encoded_content?: string | null
          id?: string
          is_archived?: boolean | null
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_id?: string
          tags?: string[] | null
          template_id?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_psychologist_client_id_fkey"
            columns: ["psychologist_client_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "generated_documents_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "catalog_document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_connections: {
        Row: {
          access_token: string | null
          access_token_encrypted: string | null
          auto_create_meet_for_sessions: boolean
          consecutive_errors: number
          created_at: string
          google_calendar_id: string
          google_email: string
          id: string
          is_connected: boolean
          last_full_sync_at: string | null
          last_incremental_sync_at: string | null
          last_successful_sync_at: string | null
          last_sync_at: string | null
          last_sync_error: string | null
          last_sync_error_code: string | null
          last_watch_renewal_at: string | null
          last_webhook_at: string | null
          psychologist_id: string
          refresh_error_count: number
          refresh_token: string | null
          refresh_token_encrypted: string | null
          show_event_details: boolean
          show_patient_name: boolean
          sync_blocks: boolean
          sync_enabled: boolean
          sync_from_google: boolean
          sync_meetings: boolean
          sync_other: boolean
          sync_sessions: boolean
          sync_state: string
          sync_supervisions: boolean
          sync_tasks: boolean
          sync_to_google: boolean
          sync_token: string | null
          sync_token_updated_at: string | null
          token_expires_at: string
          updated_at: string
          watch_channel_id: string | null
          watch_channel_token: string | null
          watch_expiration: string | null
          watch_expires_at: string | null
          watch_resource_id: string | null
        }
        Insert: {
          access_token?: string | null
          access_token_encrypted?: string | null
          auto_create_meet_for_sessions?: boolean
          consecutive_errors?: number
          created_at?: string
          google_calendar_id?: string
          google_email: string
          id?: string
          is_connected?: boolean
          last_full_sync_at?: string | null
          last_incremental_sync_at?: string | null
          last_successful_sync_at?: string | null
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_error_code?: string | null
          last_watch_renewal_at?: string | null
          last_webhook_at?: string | null
          psychologist_id: string
          refresh_error_count?: number
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          show_event_details?: boolean
          show_patient_name?: boolean
          sync_blocks?: boolean
          sync_enabled?: boolean
          sync_from_google?: boolean
          sync_meetings?: boolean
          sync_other?: boolean
          sync_sessions?: boolean
          sync_state?: string
          sync_supervisions?: boolean
          sync_tasks?: boolean
          sync_to_google?: boolean
          sync_token?: string | null
          sync_token_updated_at?: string | null
          token_expires_at: string
          updated_at?: string
          watch_channel_id?: string | null
          watch_channel_token?: string | null
          watch_expiration?: string | null
          watch_expires_at?: string | null
          watch_resource_id?: string | null
        }
        Update: {
          access_token?: string | null
          access_token_encrypted?: string | null
          auto_create_meet_for_sessions?: boolean
          consecutive_errors?: number
          created_at?: string
          google_calendar_id?: string
          google_email?: string
          id?: string
          is_connected?: boolean
          last_full_sync_at?: string | null
          last_incremental_sync_at?: string | null
          last_successful_sync_at?: string | null
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_error_code?: string | null
          last_watch_renewal_at?: string | null
          last_webhook_at?: string | null
          psychologist_id?: string
          refresh_error_count?: number
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          show_event_details?: boolean
          show_patient_name?: boolean
          sync_blocks?: boolean
          sync_enabled?: boolean
          sync_from_google?: boolean
          sync_meetings?: boolean
          sync_other?: boolean
          sync_sessions?: boolean
          sync_state?: string
          sync_supervisions?: boolean
          sync_tasks?: boolean
          sync_to_google?: boolean
          sync_token?: string | null
          sync_token_updated_at?: string | null
          token_expires_at?: string
          updated_at?: string
          watch_channel_id?: string | null
          watch_channel_token?: string | null
          watch_expiration?: string | null
          watch_expires_at?: string | null
          watch_resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_connections_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "google_calendar_connections_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sync_idempotency: {
        Row: {
          calendar_event_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          expires_at: string
          idempotency_key: string
          operation: string
          psychologist_id: string
          request_data: Json | null
          response_data: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at: string
          idempotency_key: string
          operation: string
          psychologist_id: string
          request_data?: Json | null
          response_data?: Json | null
          status: string
          updated_at?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string
          idempotency_key?: string
          operation?: string
          psychologist_id?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_sync_idempotency_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_sync_idempotency_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_sync_idempotency_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["calendar_event_id"]
          },
          {
            foreignKeyName: "google_sync_idempotency_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "google_sync_idempotency_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sync_inbound_coalesce: {
        Row: {
          connection_id: string
          created_at: string
          last_enqueued_at: string
          msg_id: number | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          last_enqueued_at?: string
          msg_id?: number | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          last_enqueued_at?: string
          msg_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "google_sync_inbound_coalesce_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "google_calendar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sync_job_dedup: {
        Row: {
          idempotency_key: string
          outcome: Json | null
          processed_at: string
        }
        Insert: {
          idempotency_key: string
          outcome?: Json | null
          processed_at?: string
        }
        Update: {
          idempotency_key?: string
          outcome?: Json | null
          processed_at?: string
        }
        Relationships: []
      }
      google_sync_logs: {
        Row: {
          calendar_event_id: string | null
          completed_at: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          google_event_id: string | null
          id: string
          operation: Database["public"]["Enums"]["sync_operation"]
          psychologist_id: string
          request_payload: Json | null
          response_payload: Json | null
          series_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["sync_result_status"]
          sync_direction: Database["public"]["Enums"]["sync_direction"]
        }
        Insert: {
          calendar_event_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          google_event_id?: string | null
          id?: string
          operation: Database["public"]["Enums"]["sync_operation"]
          psychologist_id: string
          request_payload?: Json | null
          response_payload?: Json | null
          series_id?: string | null
          started_at?: string
          status: Database["public"]["Enums"]["sync_result_status"]
          sync_direction: Database["public"]["Enums"]["sync_direction"]
        }
        Update: {
          calendar_event_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          google_event_id?: string | null
          id?: string
          operation?: Database["public"]["Enums"]["sync_operation"]
          psychologist_id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          series_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["sync_result_status"]
          sync_direction?: Database["public"]["Enums"]["sync_direction"]
        }
        Relationships: [
          {
            foreignKeyName: "google_sync_logs_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_sync_logs_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_sync_logs_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["calendar_event_id"]
          },
          {
            foreignKeyName: "google_sync_logs_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "google_sync_logs_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_sync_logs_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "calendar_event_series"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sync_worker_metrics: {
        Row: {
          backlog_after: number | null
          batch_size: number
          duration_ms: number
          failed: number
          id: number
          metadata: Json
          queue_name: string
          recorded_at: string
          requeued: number
          skipped: number
          successful: number
          worker_id: string | null
        }
        Insert: {
          backlog_after?: number | null
          batch_size?: number
          duration_ms?: number
          failed?: number
          id?: number
          metadata?: Json
          queue_name: string
          recorded_at?: string
          requeued?: number
          skipped?: number
          successful?: number
          worker_id?: string | null
        }
        Update: {
          backlog_after?: number | null
          batch_size?: number
          duration_ms?: number
          failed?: number
          id?: number
          metadata?: Json
          queue_name?: string
          recorded_at?: string
          requeued?: number
          skipped?: number
          successful?: number
          worker_id?: string | null
        }
        Relationships: []
      }
      observability_events: {
        Row: {
          actor_id_hash: string | null
          actor_type: string
          component: string
          correlation_id: string
          correlation_provenance: string
          duration_ms: number | null
          environment: string
          error_category: string | null
          error_code: string | null
          error_message: string | null
          event_family: string
          event_name: string
          http_status: number | null
          id: string
          ip_hash: string | null
          metadata: Json
          operation: string
          operation_type: string
          outcome: string
          request_path: string | null
          role: string | null
          runtime: string
          service: string
          severity: string
          timestamp: string
          trace_id: string
          user_agent: string | null
        }
        Insert: {
          actor_id_hash?: string | null
          actor_type: string
          component: string
          correlation_id: string
          correlation_provenance: string
          duration_ms?: number | null
          environment: string
          error_category?: string | null
          error_code?: string | null
          error_message?: string | null
          event_family: string
          event_name: string
          http_status?: number | null
          id?: string
          ip_hash?: string | null
          metadata?: Json
          operation: string
          operation_type: string
          outcome: string
          request_path?: string | null
          role?: string | null
          runtime: string
          service: string
          severity: string
          timestamp?: string
          trace_id: string
          user_agent?: string | null
        }
        Update: {
          actor_id_hash?: string | null
          actor_type?: string
          component?: string
          correlation_id?: string
          correlation_provenance?: string
          duration_ms?: number | null
          environment?: string
          error_category?: string | null
          error_code?: string | null
          error_message?: string | null
          event_family?: string
          event_name?: string
          http_status?: number | null
          id?: string
          ip_hash?: string | null
          metadata?: Json
          operation?: string
          operation_type?: string
          outcome?: string
          request_path?: string | null
          role?: string | null
          runtime?: string
          service?: string
          severity?: string
          timestamp?: string
          trace_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      patient_deletion_audit_log: {
        Row: {
          cleanup_timestamp: string
          created_at: string
          deleted_count: number
          id: string
          notes: string | null
          triggered_by: string | null
        }
        Insert: {
          cleanup_timestamp: string
          created_at?: string
          deleted_count?: number
          id?: string
          notes?: string | null
          triggered_by?: string | null
        }
        Update: {
          cleanup_timestamp?: string
          created_at?: string
          deleted_count?: number
          id?: string
          notes?: string | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_version: number
          avatar_url: string | null
          created_at: string
          full_name: string | null
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          access_version?: number
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          subscription?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          access_version?: number
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      psychologist_assistants: {
        Row: {
          assistant_id: string
          created_at: string | null
          metadata: Json | null
          psychologist_id: string
          revoked_at: string | null
        }
        Insert: {
          assistant_id: string
          created_at?: string | null
          metadata?: Json | null
          psychologist_id: string
          revoked_at?: string | null
        }
        Update: {
          assistant_id?: string
          created_at?: string | null
          metadata?: Json | null
          psychologist_id?: string
          revoked_at?: string | null
        }
        Relationships: []
      }
      psychologist_clinical_sessions: {
        Row: {
          attendance_confirmed: boolean | null
          automation_metadata: Json | null
          billing_attempt_count: number | null
          billing_last_error: string | null
          billing_next_attempt_at: string | null
          billing_status: string | null
          calendar_event_id: string | null
          confirmation_sent_at: string | null
          created_at: string | null
          created_by: string | null
          custom_price_cents: number | null
          default_charge_id: string | null
          duration_minutes: number | null
          id: string
          location_id: string | null
          note_id: string | null
          notes: string | null
          psychologist_id: string
          psychologist_patient_id: string | null
          psychologist_service_id: string | null
          reminder_sent_at: string | null
          session_number: number | null
          snapshot_price: number | null
          snapshot_price_cents: number | null
          snapshot_service_name: string | null
          start_time: string
          status: string | null
          status_reason: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          attendance_confirmed?: boolean | null
          automation_metadata?: Json | null
          billing_attempt_count?: number | null
          billing_last_error?: string | null
          billing_next_attempt_at?: string | null
          billing_status?: string | null
          calendar_event_id?: string | null
          confirmation_sent_at?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_price_cents?: number | null
          default_charge_id?: string | null
          duration_minutes?: number | null
          id?: string
          location_id?: string | null
          note_id?: string | null
          notes?: string | null
          psychologist_id: string
          psychologist_patient_id?: string | null
          psychologist_service_id?: string | null
          reminder_sent_at?: string | null
          session_number?: number | null
          snapshot_price?: number | null
          snapshot_price_cents?: number | null
          snapshot_service_name?: string | null
          start_time?: string
          status?: string | null
          status_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          attendance_confirmed?: boolean | null
          automation_metadata?: Json | null
          billing_attempt_count?: number | null
          billing_last_error?: string | null
          billing_next_attempt_at?: string | null
          billing_status?: string | null
          calendar_event_id?: string | null
          confirmation_sent_at?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_price_cents?: number | null
          default_charge_id?: string | null
          duration_minutes?: number | null
          id?: string
          location_id?: string | null
          note_id?: string | null
          notes?: string | null
          psychologist_id?: string
          psychologist_patient_id?: string | null
          psychologist_service_id?: string | null
          reminder_sent_at?: string | null
          session_number?: number | null
          snapshot_price?: number | null
          snapshot_price_cents?: number | null
          snapshot_service_name?: string | null
          start_time?: string
          status?: string | null
          status_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_sessions_default_charge_id_fkey"
            columns: ["default_charge_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patient_charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "public_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_sessions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "psychologist_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_sessions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "clinical_sessions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_sessions_psychologist_patient_id_fkey"
            columns: ["psychologist_patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_sessions_psychologist_service_id_fkey"
            columns: ["psychologist_service_id"]
            isOneToOne: false
            referencedRelation: "psychologist_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_clinical_sessions_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_clinical_sessions_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_clinical_sessions_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["calendar_event_id"]
          },
        ]
      }
      psychologist_financial_entries: {
        Row: {
          amount: number
          attachment_url: string | null
          billing_id: string | null
          charge_id: string | null
          charges_count: number | null
          consolidation_type: string | null
          created_at: string | null
          created_by: string | null
          date_time: string
          description: string | null
          id: string
          is_automatically_generated: boolean | null
          notes: string | null
          parent_recurrence_id: string | null
          payment_method:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          psychologist_id: string
          session_id: string | null
          status: Database["public"]["Enums"]["financial_entry_status"] | null
          transaction_category_id: string | null
          type: string
          updated_at: string | null
          updated_by: string | null
          weekly_period_end: string | null
          weekly_period_start: string | null
        }
        Insert: {
          amount?: number
          attachment_url?: string | null
          billing_id?: string | null
          charge_id?: string | null
          charges_count?: number | null
          consolidation_type?: string | null
          created_at?: string | null
          created_by?: string | null
          date_time?: string
          description?: string | null
          id?: string
          is_automatically_generated?: boolean | null
          notes?: string | null
          parent_recurrence_id?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          psychologist_id: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["financial_entry_status"] | null
          transaction_category_id?: string | null
          type: string
          updated_at?: string | null
          updated_by?: string | null
          weekly_period_end?: string | null
          weekly_period_start?: string | null
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          billing_id?: string | null
          charge_id?: string | null
          charges_count?: number | null
          consolidation_type?: string | null
          created_at?: string | null
          created_by?: string | null
          date_time?: string
          description?: string | null
          id?: string
          is_automatically_generated?: boolean | null
          notes?: string | null
          parent_recurrence_id?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          psychologist_id?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["financial_entry_status"] | null
          transaction_category_id?: string | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          weekly_period_end?: string | null
          weekly_period_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_financial_entries_billing_id_fkey"
            columns: ["billing_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patient_charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_financial_entries_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patient_charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_financial_entries_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_financial_entries_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_financial_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_financial_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
          {
            foreignKeyName: "psychologist_financial_entries_transaction_category_id_fkey"
            columns: ["transaction_category_id"]
            isOneToOne: false
            referencedRelation: "reference_values"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_invoices: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          currency: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_pdf: string | null
          period_end: string | null
          period_start: string | null
          psychologist_id: string
          status: string | null
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf?: string | null
          period_end?: string | null
          period_start?: string | null
          psychologist_id: string
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf?: string | null
          period_end?: string | null
          period_start?: string | null
          psychologist_id?: string
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_invoices_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_invoices_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_message_preferences: {
        Row: {
          category: string
          channel: string
          created_at: string
          id: string
          is_enabled: boolean
          psychologist_id: string
          recipient_role: string
          updated_at: string
        }
        Insert: {
          category: string
          channel: string
          created_at?: string
          id?: string
          is_enabled: boolean
          psychologist_id: string
          recipient_role: string
          updated_at?: string
        }
        Update: {
          category?: string
          channel?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          psychologist_id?: string
          recipient_role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_message_preferences_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_message_preferences_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_notes: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          encoded_content: string
          id: string
          is_archived: boolean | null
          note_type: Database["public"]["Enums"]["clinical_note_type"] | null
          parent_note_id: string | null
          patient_id: string | null
          psychologist_client_id: string | null
          psychologist_id: string
          session_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          encoded_content?: string
          id?: string
          is_archived?: boolean | null
          note_type?: Database["public"]["Enums"]["clinical_note_type"] | null
          parent_note_id?: string | null
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_id: string
          session_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          encoded_content?: string
          id?: string
          is_archived?: boolean | null
          note_type?: Database["public"]["Enums"]["clinical_note_type"] | null
          parent_note_id?: string | null
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_id?: string
          session_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_psychologist_client_id_fkey"
            columns: ["psychologist_client_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "clinical_notes_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_related_evolution_id_fkey"
            columns: ["parent_note_id"]
            isOneToOne: false
            referencedRelation: "psychologist_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
        ]
      }
      psychologist_onboarding_state: {
        Row: {
          abandoned_at: string | null
          completed_steps: Json | null
          completion_percentage: number | null
          configuration_step_completed: boolean | null
          created_at: string | null
          current_step: number | null
          current_step_id: string | null
          draft_data: Json | null
          identity_step_completed: boolean | null
          last_resumed_at: string | null
          onboarding_completed_at: string | null
          operational_step_completed: boolean | null
          payment_step_completed: boolean | null
          professional_step_completed: boolean | null
          profile_step_completed: boolean | null
          psychologist_id: string
          step_drafts: Json | null
          total_steps: number | null
          updated_at: string | null
        }
        Insert: {
          abandoned_at?: string | null
          completed_steps?: Json | null
          completion_percentage?: number | null
          configuration_step_completed?: boolean | null
          created_at?: string | null
          current_step?: number | null
          current_step_id?: string | null
          draft_data?: Json | null
          identity_step_completed?: boolean | null
          last_resumed_at?: string | null
          onboarding_completed_at?: string | null
          operational_step_completed?: boolean | null
          payment_step_completed?: boolean | null
          professional_step_completed?: boolean | null
          profile_step_completed?: boolean | null
          psychologist_id: string
          step_drafts?: Json | null
          total_steps?: number | null
          updated_at?: string | null
        }
        Update: {
          abandoned_at?: string | null
          completed_steps?: Json | null
          completion_percentage?: number | null
          configuration_step_completed?: boolean | null
          created_at?: string | null
          current_step?: number | null
          current_step_id?: string | null
          draft_data?: Json | null
          identity_step_completed?: boolean | null
          last_resumed_at?: string | null
          onboarding_completed_at?: string | null
          operational_step_completed?: boolean | null
          payment_step_completed?: boolean | null
          professional_step_completed?: boolean | null
          profile_step_completed?: boolean | null
          psychologist_id?: string
          step_drafts?: Json | null
          total_steps?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_onboarding_state_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_onboarding_state_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_patient_activities: {
        Row: {
          activity_id: string | null
          assigned_at: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          instructions: string | null
          is_archived: boolean | null
          patient_feedback: string | null
          patient_id: string | null
          psychologist_client_id: string | null
          psychologist_id: string
          response_data: Json | null
          status: string | null
          submitted_at: string | null
          therapist_comment: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          activity_id?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          is_archived?: boolean | null
          patient_feedback?: string | null
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_id: string
          response_data?: Json | null
          status?: string | null
          submitted_at?: string | null
          therapist_comment?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          activity_id?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          is_archived?: boolean | null
          patient_feedback?: string | null
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_id?: string
          response_data?: Json | null
          status?: string | null
          submitted_at?: string | null
          therapist_comment?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_activity_assignments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "catalog_clinical_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_activity_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "patient_activity_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_activity_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_activity_assignments_psychologist_client_id_fkey"
            columns: ["psychologist_client_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_activity_assignments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "patient_activity_assignments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_activity_assignments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "patient_activity_assignments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_patient_assessments: {
        Row: {
          applied_at: string | null
          clinical_note_id: string | null
          created_at: string | null
          created_by: string | null
          file_url: string | null
          id: string
          interpretation: string | null
          is_archived: boolean | null
          name: string | null
          notes: string | null
          patient_id: string | null
          psychologist_client_id: string | null
          psychologist_id: string
          psychologist_notes: string | null
          results: string | null
          status: string | null
          tags: string[] | null
          test_date: string | null
          test_id: string | null
          test_name: string | null
          test_type: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          applied_at?: string | null
          clinical_note_id?: string | null
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          id?: string
          interpretation?: string | null
          is_archived?: boolean | null
          name?: string | null
          notes?: string | null
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_id: string
          psychologist_notes?: string | null
          results?: string | null
          status?: string | null
          tags?: string[] | null
          test_date?: string | null
          test_id?: string | null
          test_name?: string | null
          test_type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          applied_at?: string | null
          clinical_note_id?: string | null
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          id?: string
          interpretation?: string | null
          is_archived?: boolean | null
          name?: string | null
          notes?: string | null
          patient_id?: string | null
          psychologist_client_id?: string | null
          psychologist_id?: string
          psychologist_notes?: string | null
          results?: string | null
          status?: string | null
          tags?: string[] | null
          test_date?: string | null
          test_id?: string | null
          test_name?: string | null
          test_type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_tests_clinical_note_id_fkey"
            columns: ["clinical_note_id"]
            isOneToOne: false
            referencedRelation: "psychologist_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_tests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "patient_tests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_tests_psychologist_client_id_fkey"
            columns: ["psychologist_client_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_tests_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "patient_tests_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_tests_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "patient_tests_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patient_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_patient_charges: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_status: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          invoice_url: string | null
          last_sent_at: string | null
          paid_at: string | null
          payment_method:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          payment_notes: string | null
          payment_status: string | null
          price_cents: number | null
          psychologist_id: string
          psychologist_patient_id: string | null
          sent_count: number | null
          session_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_status?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          last_sent_at?: string | null
          paid_at?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          payment_notes?: string | null
          payment_status?: string | null
          price_cents?: number | null
          psychologist_id: string
          psychologist_patient_id?: string | null
          sent_count?: number | null
          session_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_status?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          last_sent_at?: string | null
          paid_at?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          payment_notes?: string | null
          payment_status?: string | null
          price_cents?: number | null
          psychologist_id?: string
          psychologist_patient_id?: string | null
          sent_count?: number | null
          session_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_client_charges_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_client_charges_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_client_charges_psychologist_patient_id_fkey"
            columns: ["psychologist_patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_client_charges_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_client_charges_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
        ]
      }
      psychologist_patient_emergency_contacts: {
        Row: {
          contact_name: string
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          phone: string | null
          psychologist_patient_id: string
          relationship: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          contact_name: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          phone?: string | null
          psychologist_patient_id: string
          relationship?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          contact_name?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          phone?: string | null
          psychologist_patient_id?: string
          relationship?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_emergency_contacts_psychologist_client_id_fkey"
            columns: ["psychologist_patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_patient_guardian_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string
          expires_at: string | null
          file_name: string
          file_size: number | null
          file_url: string | null
          guardian_id: string | null
          id: string
          mime_type: string | null
          patient_id: string | null
          psychologist_id: string
          status: string
          title: string
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type: string
          expires_at?: string | null
          file_name: string
          file_size?: number | null
          file_url?: string | null
          guardian_id?: string | null
          id?: string
          mime_type?: string | null
          patient_id?: string | null
          psychologist_id: string
          status?: string
          title: string
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string
          expires_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string | null
          guardian_id?: string | null
          id?: string
          mime_type?: string | null
          patient_id?: string | null
          psychologist_id?: string
          status?: string
          title?: string
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_patient_guardian_documents_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patient_guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patient_guardian_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patient_guardian_documents_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_patient_guardian_documents_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_patient_guardians: {
        Row: {
          city: string | null
          complement: string | null
          country: string | null
          cpf: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          guardian_type: string | null
          id: string
          name: string | null
          neighborhood: string | null
          number: string | null
          patient_id: string | null
          phone: string | null
          postal_code: string | null
          psychologist_id: string
          relationship: string | null
          rg: string | null
          state: string | null
          status: string | null
          street: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          complement?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          guardian_type?: string | null
          id?: string
          name?: string | null
          neighborhood?: string | null
          number?: string | null
          patient_id?: string | null
          phone?: string | null
          postal_code?: string | null
          psychologist_id: string
          relationship?: string | null
          rg?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          complement?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          guardian_type?: string | null
          id?: string
          name?: string | null
          neighborhood?: string | null
          number?: string | null
          patient_id?: string | null
          phone?: string | null
          postal_code?: string | null
          psychologist_id?: string
          relationship?: string | null
          rg?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_patient_guardians_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patient_guardians_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_patient_guardians_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_patient_medical_items: {
        Row: {
          created_at: string | null
          description: string | null
          diagnosed_date: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          icd10_code: string | null
          id: string
          is_active: boolean | null
          item_kind: Database["public"]["Enums"]["medical_item_kind"] | null
          kind: Database["public"]["Enums"]["medical_item_kind"] | null
          name: string | null
          notes: string | null
          psychologist_id: string
          psychologist_patient_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          diagnosed_date?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          icd10_code?: string | null
          id?: string
          is_active?: boolean | null
          item_kind?: Database["public"]["Enums"]["medical_item_kind"] | null
          kind?: Database["public"]["Enums"]["medical_item_kind"] | null
          name?: string | null
          notes?: string | null
          psychologist_id: string
          psychologist_patient_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          diagnosed_date?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          icd10_code?: string | null
          id?: string
          is_active?: boolean | null
          item_kind?: Database["public"]["Enums"]["medical_item_kind"] | null
          kind?: Database["public"]["Enums"]["medical_item_kind"] | null
          name?: string | null
          notes?: string | null
          psychologist_id?: string
          psychologist_patient_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_patient_medical_items_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_patient_medical_items_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patient_medical_items_therapist_client_id_fkey"
            columns: ["psychologist_patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_patient_services: {
        Row: {
          created_at: string | null
          id: string
          price_cents: number | null
          psychologist_id: string
          psychologist_patient_id: string
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_cents?: number | null
          psychologist_id: string
          psychologist_patient_id: string
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_cents?: number | null
          psychologist_id?: string
          psychologist_patient_id?: string
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_client_services_psychologist_client_id_fkey"
            columns: ["psychologist_patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_client_services_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_client_services_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_patients: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          attached_documents: Json | null
          clinical_hypothesis: string | null
          clinical_notes: string | null
          created_at: string | null
          created_by: string | null
          current_medications: Json | null
          data_sharing_consent: boolean | null
          data_sharing_consent_date: string | null
          default_session_price: number | null
          deleted_at: string | null
          deleted_by: string | null
          discharge_reason: string | null
          disorders: Json | null
          first_session_date: string | null
          id: string
          informed_consent_date: string | null
          informed_consent_document_url: string | null
          informed_consent_signed: boolean | null
          initial_complaint: string | null
          invite_expires_at: string | null
          invite_reminder_count: number | null
          invite_reminder_sent_at: string | null
          invite_sent_via:
            | Database["public"]["Enums"]["contact_method_type"]
            | null
          invite_status:
            | Database["public"]["Enums"]["invite_status_type"]
            | null
          invite_token: string | null
          invited_at: string | null
          is_minor: boolean | null
          known_allergies: Json | null
          last_session_date: string | null
          manual_address: Json | null
          manual_cpf: string | null
          manual_date_of_birth: string | null
          manual_display_name: string | null
          manual_email: string | null
          manual_emergency_contacts: Json | null
          manual_first_name: string | null
          manual_full_name: string | null
          manual_gender: string | null
          manual_last_name: string | null
          manual_patient_origin: string | null
          manual_phone: string | null
          manual_place_of_birth: string | null
          manual_preferred_name: string | null
          manual_profession: string | null
          manual_pronouns: string | null
          manual_rg: string | null
          patient_id: string | null
          preferred_contact_method:
            | Database["public"]["Enums"]["contact_method_type"]
            | null
          price_set_at: string | null
          price_set_by: string | null
          psychologist_id: string
          recovery_deadline: string | null
          relationship_end_date: string | null
          relationship_start_date: string | null
          requires_legal_guardian: boolean | null
          retention_until: string | null
          risk_level: string | null
          status: string | null
          suicide_risk_assessment: string | null
          synced_address: Json | null
          synced_cpf: string | null
          synced_date_of_birth: string | null
          synced_display_name: string | null
          synced_email: string | null
          synced_full_name: string | null
          synced_gender: string | null
          synced_phone: string | null
          synced_place_of_birth: string | null
          synced_profession: string | null
          synced_pronouns: string | null
          synced_rg: string | null
          therapeutic_goals: Json | null
          total_sessions_count: number | null
          treatment_plan: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          attached_documents?: Json | null
          clinical_hypothesis?: string | null
          clinical_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          current_medications?: Json | null
          data_sharing_consent?: boolean | null
          data_sharing_consent_date?: string | null
          default_session_price?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          discharge_reason?: string | null
          disorders?: Json | null
          first_session_date?: string | null
          id?: string
          informed_consent_date?: string | null
          informed_consent_document_url?: string | null
          informed_consent_signed?: boolean | null
          initial_complaint?: string | null
          invite_expires_at?: string | null
          invite_reminder_count?: number | null
          invite_reminder_sent_at?: string | null
          invite_sent_via?:
            | Database["public"]["Enums"]["contact_method_type"]
            | null
          invite_status?:
            | Database["public"]["Enums"]["invite_status_type"]
            | null
          invite_token?: string | null
          invited_at?: string | null
          is_minor?: boolean | null
          known_allergies?: Json | null
          last_session_date?: string | null
          manual_address?: Json | null
          manual_cpf?: string | null
          manual_date_of_birth?: string | null
          manual_display_name?: string | null
          manual_email?: string | null
          manual_emergency_contacts?: Json | null
          manual_first_name?: string | null
          manual_full_name?: string | null
          manual_gender?: string | null
          manual_last_name?: string | null
          manual_patient_origin?: string | null
          manual_phone?: string | null
          manual_place_of_birth?: string | null
          manual_preferred_name?: string | null
          manual_profession?: string | null
          manual_pronouns?: string | null
          manual_rg?: string | null
          patient_id?: string | null
          preferred_contact_method?:
            | Database["public"]["Enums"]["contact_method_type"]
            | null
          price_set_at?: string | null
          price_set_by?: string | null
          psychologist_id: string
          recovery_deadline?: string | null
          relationship_end_date?: string | null
          relationship_start_date?: string | null
          requires_legal_guardian?: boolean | null
          retention_until?: string | null
          risk_level?: string | null
          status?: string | null
          suicide_risk_assessment?: string | null
          synced_address?: Json | null
          synced_cpf?: string | null
          synced_date_of_birth?: string | null
          synced_display_name?: string | null
          synced_email?: string | null
          synced_full_name?: string | null
          synced_gender?: string | null
          synced_phone?: string | null
          synced_place_of_birth?: string | null
          synced_profession?: string | null
          synced_pronouns?: string | null
          synced_rg?: string | null
          therapeutic_goals?: Json | null
          total_sessions_count?: number | null
          treatment_plan?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          attached_documents?: Json | null
          clinical_hypothesis?: string | null
          clinical_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          current_medications?: Json | null
          data_sharing_consent?: boolean | null
          data_sharing_consent_date?: string | null
          default_session_price?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          discharge_reason?: string | null
          disorders?: Json | null
          first_session_date?: string | null
          id?: string
          informed_consent_date?: string | null
          informed_consent_document_url?: string | null
          informed_consent_signed?: boolean | null
          initial_complaint?: string | null
          invite_expires_at?: string | null
          invite_reminder_count?: number | null
          invite_reminder_sent_at?: string | null
          invite_sent_via?:
            | Database["public"]["Enums"]["contact_method_type"]
            | null
          invite_status?:
            | Database["public"]["Enums"]["invite_status_type"]
            | null
          invite_token?: string | null
          invited_at?: string | null
          is_minor?: boolean | null
          known_allergies?: Json | null
          last_session_date?: string | null
          manual_address?: Json | null
          manual_cpf?: string | null
          manual_date_of_birth?: string | null
          manual_display_name?: string | null
          manual_email?: string | null
          manual_emergency_contacts?: Json | null
          manual_first_name?: string | null
          manual_full_name?: string | null
          manual_gender?: string | null
          manual_last_name?: string | null
          manual_patient_origin?: string | null
          manual_phone?: string | null
          manual_place_of_birth?: string | null
          manual_preferred_name?: string | null
          manual_profession?: string | null
          manual_pronouns?: string | null
          manual_rg?: string | null
          patient_id?: string | null
          preferred_contact_method?:
            | Database["public"]["Enums"]["contact_method_type"]
            | null
          price_set_at?: string | null
          price_set_by?: string | null
          psychologist_id?: string
          recovery_deadline?: string | null
          relationship_end_date?: string | null
          relationship_start_date?: string | null
          requires_legal_guardian?: boolean | null
          retention_until?: string | null
          risk_level?: string | null
          status?: string | null
          suicide_risk_assessment?: string | null
          synced_address?: Json | null
          synced_cpf?: string | null
          synced_date_of_birth?: string | null
          synced_display_name?: string | null
          synced_email?: string | null
          synced_full_name?: string | null
          synced_gender?: string | null
          synced_phone?: string | null
          synced_place_of_birth?: string | null
          synced_profession?: string | null
          synced_pronouns?: string | null
          synced_rg?: string | null
          therapeutic_goals?: Json | null
          total_sessions_count?: number | null
          treatment_plan?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_clients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_clients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_clients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patients_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_patients_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patients_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_patients_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_patients_price_set_by_fkey"
            columns: ["price_set_by"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_patients_price_set_by_fkey"
            columns: ["price_set_by"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_preferences: {
        Row: {
          created_at: string | null
          id: string
          notifications_billing_alerts: boolean | null
          notifications_email_reminders: boolean | null
          notifications_marketing: boolean | null
          notifications_payment_receipts: boolean | null
          notifications_security_alerts: boolean | null
          notifications_whatsapp_reminders: boolean | null
          preferences: Json | null
          sensitive_data_visible: boolean
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notifications_billing_alerts?: boolean | null
          notifications_email_reminders?: boolean | null
          notifications_marketing?: boolean | null
          notifications_payment_receipts?: boolean | null
          notifications_security_alerts?: boolean | null
          notifications_whatsapp_reminders?: boolean | null
          preferences?: Json | null
          sensitive_data_visible?: boolean
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notifications_billing_alerts?: boolean | null
          notifications_email_reminders?: boolean | null
          notifications_marketing?: boolean | null
          notifications_payment_receipts?: boolean | null
          notifications_security_alerts?: boolean | null
          notifications_whatsapp_reminders?: boolean | null
          preferences?: Json | null
          sensitive_data_visible?: boolean
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      psychologist_preferences_audit_log: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      psychologist_quick_notes: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          is_completed: boolean
          priority: string
          psychologist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          priority?: string
          psychologist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          priority?: string
          psychologist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_quick_notes_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_quick_notes_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_services: {
        Row: {
          catalog_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          is_public: boolean | null
          name: string | null
          price: number | null
          psychologist_id: string
          service_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          catalog_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_public?: boolean | null
          name?: string | null
          price?: number | null
          psychologist_id: string
          service_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          catalog_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_public?: boolean | null
          name?: string | null
          price?: number | null
          psychologist_id?: string
          service_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_services_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "reference_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_services_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_services_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_session_cancellation_policy: {
        Row: {
          cancellation_window_hours: number | null
          created_at: string | null
          effective_from: string | null
          effective_until: string | null
          id: string
          penalty_percent: number | null
          policy_code:
            | Database["public"]["Enums"]["cancellation_policy_code"]
            | null
          psychologist_id: string
          updated_at: string | null
        }
        Insert: {
          cancellation_window_hours?: number | null
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          penalty_percent?: number | null
          policy_code?:
            | Database["public"]["Enums"]["cancellation_policy_code"]
            | null
          psychologist_id: string
          updated_at?: string | null
        }
        Update: {
          cancellation_window_hours?: number | null
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          penalty_percent?: number | null
          policy_code?:
            | Database["public"]["Enums"]["cancellation_policy_code"]
            | null
          psychologist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_session_cancellation_policy_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_session_cancellation_policy_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_stripe_connect: {
        Row: {
          created_at: string | null
          onboarding_status: Database["public"]["Enums"]["stripe_onboarding_status"]
          psychologist_id: string
          stripe_account_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          onboarding_status?: Database["public"]["Enums"]["stripe_onboarding_status"]
          psychologist_id: string
          stripe_account_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          onboarding_status?: Database["public"]["Enums"]["stripe_onboarding_status"]
          psychologist_id?: string
          stripe_account_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_stripe_connect_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_stripe_connect_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          has_active_subscription: boolean | null
          id: string
          metadata: Json | null
          psychologist_id: string | null
          status: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_plan_id: string | null
          therapist_id: string | null
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          has_active_subscription?: boolean | null
          id?: string
          metadata?: Json | null
          psychologist_id?: string | null
          status?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id?: string | null
          therapist_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          has_active_subscription?: boolean | null
          id?: string
          metadata?: Json | null
          psychologist_id?: string | null
          status?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id?: string | null
          therapist_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_subscriptions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_subscriptions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_subscriptions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_subscriptions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_weekly_schedules: {
        Row: {
          available_for_first_appointment: boolean | null
          created_at: string | null
          daily_appointment_limit: number | null
          day_of_week: number
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          effective_end: string | null
          effective_start: string | null
          end_time: string
          id: string
          is_active: boolean | null
          location_id: string | null
          psychologist_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          available_for_first_appointment?: boolean | null
          created_at?: string | null
          daily_appointment_limit?: number | null
          day_of_week: number
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          effective_end?: string | null
          effective_start?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          psychologist_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          available_for_first_appointment?: boolean | null
          created_at?: string | null
          daily_appointment_limit?: number | null
          day_of_week?: number
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          effective_end?: string | null
          effective_start?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          psychologist_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_availability_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "public_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_availability_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_availability_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      public_client_checkout_intents: {
        Row: {
          amount_cents: number
          application_fee_cents: number | null
          charge_id: string | null
          created_at: string | null
          currency: string
          id: string
          idempotency_key: string | null
          livemode: boolean
          metadata: Json | null
          psychologist_id: string
          psychologist_patient_id: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["marketplace_payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          application_fee_cents?: number | null
          charge_id?: string | null
          created_at?: string | null
          currency: string
          id?: string
          idempotency_key?: string | null
          livemode?: boolean
          metadata?: Json | null
          psychologist_id: string
          psychologist_patient_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["marketplace_payment_status"]
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          application_fee_cents?: number | null
          charge_id?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          idempotency_key?: string | null
          livemode?: boolean
          metadata?: Json | null
          psychologist_id?: string
          psychologist_patient_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["marketplace_payment_status"]
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_payment_intents_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patient_charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_payment_intents_psychologist_client_id_fkey"
            columns: ["psychologist_patient_id"]
            isOneToOne: false
            referencedRelation: "psychologist_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_payment_intents_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "marketplace_payment_intents_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_payment_intents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_payment_intents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
        ]
      }
      public_linktree_links: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          psychologist_id: string
          sort_order: number
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          psychologist_id: string
          sort_order?: number
          title?: string
          updated_at?: string | null
          url?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          psychologist_id?: string
          sort_order?: number
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "linktree_links_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "linktree_links_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      public_locations: {
        Row: {
          city: string | null
          complement: string | null
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean
          is_primary: boolean | null
          latitude: number | null
          longitude: number | null
          name: string | null
          neighborhood: string | null
          number: string | null
          postal_code: string | null
          psychologist_id: string
          state: string | null
          street: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          neighborhood?: string | null
          number?: string | null
          postal_code?: string | null
          psychologist_id: string
          state?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          neighborhood?: string | null
          number?: string | null
          postal_code?: string | null
          psychologist_id?: string
          state?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_locations_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "public_locations_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          academic_timeline: Json | null
          accepting_new_patients: boolean
          avatar_path: string | null
          avatar_url: string | null
          background_path: string | null
          background_url: string | null
          bio: string | null
          certificates: Json | null
          city: string | null
          cpf: string | null
          created_at: string | null
          crp: string | null
          crp_state: string | null
          date_of_birth: string | null
          display_name: string | null
          display_name_linktree: string | null
          education: Json | null
          education_records: Json | null
          ethnicity: string | null
          full_name: string | null
          gallery_photos: string[] | null
          gender: string | null
          id: string
          instagram_url: string | null
          is_public: boolean | null
          languages: string[] | null
          linkedin_url: string | null
          linktree_theme: string | null
          marital_status: string | null
          neighborhood: string | null
          professional_timeline: Json | null
          professional_title: string | null
          profile_completed: boolean | null
          profile_sections: Json | null
          registered_specialties: string[] | null
          rqe: string | null
          service_values: Json | null
          session_duration: number | null
          session_price: number | null
          show_in_marketplace: boolean | null
          slug: string | null
          social_links: Json | null
          specialties: string[] | null
          state: string | null
          tagline: string | null
          telegram_url: string | null
          therapeutic_approaches: string[] | null
          updated_at: string | null
          username: string | null
          video_section: Json | null
          website_url: string | null
          whatsapp_url: string | null
          youtube_url: string | null
        }
        Insert: {
          academic_timeline?: Json | null
          accepting_new_patients?: boolean
          avatar_path?: string | null
          avatar_url?: string | null
          background_path?: string | null
          background_url?: string | null
          bio?: string | null
          certificates?: Json | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          crp?: string | null
          crp_state?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          display_name_linktree?: string | null
          education?: Json | null
          education_records?: Json | null
          ethnicity?: string | null
          full_name?: string | null
          gallery_photos?: string[] | null
          gender?: string | null
          id: string
          instagram_url?: string | null
          is_public?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          linktree_theme?: string | null
          marital_status?: string | null
          neighborhood?: string | null
          professional_timeline?: Json | null
          professional_title?: string | null
          profile_completed?: boolean | null
          profile_sections?: Json | null
          registered_specialties?: string[] | null
          rqe?: string | null
          service_values?: Json | null
          session_duration?: number | null
          session_price?: number | null
          show_in_marketplace?: boolean | null
          slug?: string | null
          social_links?: Json | null
          specialties?: string[] | null
          state?: string | null
          tagline?: string | null
          telegram_url?: string | null
          therapeutic_approaches?: string[] | null
          updated_at?: string | null
          username?: string | null
          video_section?: Json | null
          website_url?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          academic_timeline?: Json | null
          accepting_new_patients?: boolean
          avatar_path?: string | null
          avatar_url?: string | null
          background_path?: string | null
          background_url?: string | null
          bio?: string | null
          certificates?: Json | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          crp?: string | null
          crp_state?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          display_name_linktree?: string | null
          education?: Json | null
          education_records?: Json | null
          ethnicity?: string | null
          full_name?: string | null
          gallery_photos?: string[] | null
          gender?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          linktree_theme?: string | null
          marital_status?: string | null
          neighborhood?: string | null
          professional_timeline?: Json | null
          professional_title?: string | null
          profile_completed?: boolean | null
          profile_sections?: Json | null
          registered_specialties?: string[] | null
          rqe?: string | null
          service_values?: Json | null
          session_duration?: number | null
          session_price?: number | null
          show_in_marketplace?: boolean | null
          slug?: string | null
          social_links?: Json | null
          specialties?: string[] | null
          state?: string | null
          tagline?: string | null
          telegram_url?: string | null
          therapeutic_approaches?: string[] | null
          updated_at?: string | null
          username?: string | null
          video_section?: Json | null
          website_url?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_values: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          label_pt: string
          metadata: Json | null
          updated_at: string | null
          value: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label_pt: string
          metadata?: Json | null
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label_pt?: string
          metadata?: Json | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      security_audit_events: {
        Row: {
          action: string
          actor_id: string | null
          correlation_id: string
          id: string
          metadata: Json
          occurred_at: string
          source: string
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          correlation_id?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          source?: string
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          correlation_id?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          source?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      session_billing_dead_letter: {
        Row: {
          attempts: number
          context: Json
          created_at: string
          error_message: string
          id: string
          psychologist_id: string
          resolved_at: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          context?: Json
          created_at?: string
          error_message: string
          id?: string
          psychologist_id: string
          resolved_at?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          context?: Json
          created_at?: string
          error_message?: string
          id?: string
          psychologist_id?: string
          resolved_at?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_billing_dead_letter_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "session_billing_dead_letter_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_billing_dead_letter_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_billing_dead_letter_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
        ]
      }
      session_reschedule_logs: {
        Row: {
          created_at: string | null
          created_by: string | null
          from_duration_minutes: number | null
          from_start_time: string
          id: string
          reason: string | null
          session_id: string
          to_duration_minutes: number | null
          to_start_time: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          from_duration_minutes?: number | null
          from_start_time: string
          id?: string
          reason?: string | null
          session_id: string
          to_duration_minutes?: number | null
          to_start_time: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          from_duration_minutes?: number | null
          from_start_time?: string
          id?: string
          reason?: string | null
          session_id?: string
          to_duration_minutes?: number | null
          to_start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_reschedule_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "session_reschedule_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_reschedule_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_reschedule_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
        ]
      }
      session_reschedule_requests: {
        Row: {
          created_at: string | null
          id: string
          initiated_by: string | null
          reason: string | null
          requested_end_time: string | null
          requested_start_time: string | null
          responded_by: string | null
          session_id: string
          status:
            | Database["public"]["Enums"]["reschedule_request_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          initiated_by?: string | null
          reason?: string | null
          requested_end_time?: string | null
          requested_start_time?: string | null
          responded_by?: string | null
          session_id: string
          status?:
            | Database["public"]["Enums"]["reschedule_request_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          initiated_by?: string | null
          reason?: string | null
          requested_end_time?: string | null
          requested_start_time?: string | null
          responded_by?: string | null
          session_id?: string
          status?:
            | Database["public"]["Enums"]["reschedule_request_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_reschedule_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_reschedule_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
        ]
      }
      session_types: {
        Row: {
          code: string | null
          created_at: string | null
          default_duration_minutes: number | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          default_duration_minutes?: number | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          default_duration_minutes?: number | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_idempotency_log: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          idempotency_key: string
          operation: string
          request_payload: Json | null
          response_summary: Json | null
          status: string
          stripe_event_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          idempotency_key: string
          operation: string
          request_payload?: Json | null
          response_summary?: Json | null
          status?: string
          stripe_event_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          idempotency_key?: string
          operation?: string
          request_payload?: Json | null
          response_summary?: Json | null
          status?: string
          stripe_event_id?: string | null
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          event_type: string
          id: string
          livemode: boolean
          payload: Json
          processed_at: string | null
          processing_error: string | null
          received_at: string | null
          stripe_account_id: string | null
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          livemode?: boolean
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string | null
          stripe_account_id?: string | null
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          livemode?: boolean
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string | null
          stripe_account_id?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string | null
          interval_count: number | null
          is_active: boolean | null
          metadata: Json | null
          name: string | null
          plan_name: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          subscription_plan_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id: string
          interval?: string | null
          interval_count?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          plan_name?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          subscription_plan_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          interval_count?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          plan_name?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          subscription_plan_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_conflict_resolutions: {
        Row: {
          conflict_type: string
          created_at: string
          event_id: string | null
          fluri_data: Json | null
          google_data: Json | null
          google_event_id: string | null
          id: string
          message: string | null
          psychologist_id: string
          resolution: string | null
          resolved_at: string | null
          status: string
          title: string | null
        }
        Insert: {
          conflict_type: string
          created_at?: string
          event_id?: string | null
          fluri_data?: Json | null
          google_data?: Json | null
          google_event_id?: string | null
          id?: string
          message?: string | null
          psychologist_id: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          conflict_type?: string
          created_at?: string
          event_id?: string | null
          fluri_data?: Json | null
          google_data?: Json | null
          google_event_id?: string | null
          id?: string
          message?: string | null
          psychologist_id?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_conflict_resolutions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflict_resolutions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflict_resolutions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["calendar_event_id"]
          },
        ]
      }
      sync_locks: {
        Row: {
          expires_at: string
          lock_key: string
          locked_at: string
          locked_by: string | null
        }
        Insert: {
          expires_at: string
          lock_key: string
          locked_at?: string
          locked_by?: string | null
        }
        Update: {
          expires_at?: string
          lock_key?: string
          locked_at?: string
          locked_by?: string | null
        }
        Relationships: []
      }
      unified_events: {
        Row: {
          actor_id_hash: string | null
          actor_type: string
          component: string
          correlation_id: string | null
          duration_ms: number | null
          environment: string
          error_category: string | null
          error_code: string | null
          error_message: string | null
          event_family: string
          event_name: string
          force_keep: boolean
          http_status: number | null
          id: string
          ip_address: string | null
          metadata: Json | null
          operation: string
          operation_type: string
          outcome: string
          request_path: string | null
          retention_days: number | null
          role: string | null
          sample_rate: number
          service: string
          timestamp: string
          trace_id: string
          user_agent: string | null
        }
        Insert: {
          actor_id_hash?: string | null
          actor_type: string
          component: string
          correlation_id?: string | null
          duration_ms?: number | null
          environment: string
          error_category?: string | null
          error_code?: string | null
          error_message?: string | null
          event_family: string
          event_name: string
          force_keep?: boolean
          http_status?: number | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          operation: string
          operation_type: string
          outcome: string
          request_path?: string | null
          retention_days?: number | null
          role?: string | null
          sample_rate?: number
          service: string
          timestamp?: string
          trace_id?: string
          user_agent?: string | null
        }
        Update: {
          actor_id_hash?: string | null
          actor_type?: string
          component?: string
          correlation_id?: string | null
          duration_ms?: number | null
          environment?: string
          error_category?: string | null
          error_code?: string | null
          error_message?: string | null
          event_family?: string
          event_name?: string
          force_keep?: boolean
          http_status?: number | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          operation?: string
          operation_type?: string
          outcome?: string
          request_path?: string | null
          retention_days?: number | null
          role?: string | null
          sample_rate?: number
          service?: string
          timestamp?: string
          trace_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      user_admins: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          metadata: Json | null
          permissions: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          metadata?: Json | null
          permissions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          metadata?: Json | null
          permissions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_assistants: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_patients: {
        Row: {
          created_at: string | null
          display_name: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          preferred_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          preferred_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          preferred_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_psychologists: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"] | null
          cpf: string | null
          created_at: string | null
          crp: string | null
          crp_state: string | null
          display_name: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          business_type?: Database["public"]["Enums"]["business_type"] | null
          cpf?: string | null
          created_at?: string | null
          crp?: string | null
          crp_state?: string | null
          display_name?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"] | null
          cpf?: string | null
          created_at?: string | null
          crp?: string | null
          crp_state?: string | null
          display_name?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["role"]
          },
        ]
      }
      webhook_audit_log: {
        Row: {
          channel_id: string | null
          event_id: string | null
          event_type: string | null
          id: string
          ip_address: string | null
          payload_hash: string | null
          processed: boolean | null
          processed_at: string | null
          processing_error: string | null
          received_at: string | null
          resource_id: string | null
          source: string
        }
        Insert: {
          channel_id?: string | null
          event_id?: string | null
          event_type?: string | null
          id?: string
          ip_address?: string | null
          payload_hash?: string | null
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string | null
          resource_id?: string | null
          source: string
        }
        Update: {
          channel_id?: string | null
          event_id?: string | null
          event_type?: string | null
          id?: string
          ip_address?: string | null
          payload_hash?: string | null
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string | null
          resource_id?: string | null
          source?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_id: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          payload?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      calendar_events_full: {
        Row: {
          all_day: boolean | null
          attendance_confirmed: boolean | null
          billing_status: string | null
          clinical_session_id: string | null
          color: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_datetime: string | null
          event_type: Database["public"]["Enums"]["calendar_event_type"] | null
          google_event_id: string | null
          google_sync_error: string | null
          google_sync_status:
            | Database["public"]["Enums"]["google_sync_status"]
            | null
          id: string | null
          last_synced_at: string | null
          location: string | null
          metadata: Json | null
          original_end_datetime: string | null
          original_start_datetime: string | null
          patient_display_name: string | null
          patient_name: string | null
          private_notes: string | null
          psychologist_id: string | null
          psychologist_patient_id: string | null
          psychologist_service_id: string | null
          series_id: string | null
          service_duration: number | null
          service_name: string | null
          service_price: number | null
          session_number: number | null
          source: Database["public"]["Enums"]["calendar_event_source"] | null
          start_datetime: string | null
          status: Database["public"]["Enums"]["calendar_event_status"] | null
          timezone: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "calendar_events_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "calendar_event_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_clinical_session_id_fkey"
            columns: ["clinical_session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_clinical_session_id_fkey"
            columns: ["clinical_session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
          {
            foreignKeyName: "clinical_session_details_patient_id_fkey"
            columns: ["psychologist_patient_id"]
            isOneToOne: false
            referencedRelation: "user_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_psychologist_service_id_fkey"
            columns: ["psychologist_service_id"]
            isOneToOne: false
            referencedRelation: "psychologist_services"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_derived_modality: {
        Row: {
          practice_modality:
            | Database["public"]["Enums"]["practice_modality"]
            | null
          psychologist_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_availability_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_availability_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_onboarding_status: {
        Row: {
          abandoned_at: string | null
          completion_percentage: number | null
          configuration_step_completed: boolean | null
          current_step: number | null
          essential_complete: boolean | null
          fully_complete: boolean | null
          identity_step_completed: boolean | null
          last_resumed_at: string | null
          onboarding_completed_at: string | null
          payment_step_completed: boolean | null
          professional_step_completed: boolean | null
          profile_step_completed: boolean | null
          psychologist_id: string | null
          status: string | null
          total_steps: number | null
        }
        Insert: {
          abandoned_at?: string | null
          completion_percentage?: number | null
          configuration_step_completed?: boolean | null
          current_step?: number | null
          essential_complete?: never
          fully_complete?: never
          identity_step_completed?: boolean | null
          last_resumed_at?: string | null
          onboarding_completed_at?: string | null
          payment_step_completed?: boolean | null
          professional_step_completed?: boolean | null
          profile_step_completed?: boolean | null
          psychologist_id?: string | null
          status?: never
          total_steps?: number | null
        }
        Update: {
          abandoned_at?: string | null
          completion_percentage?: number | null
          configuration_step_completed?: boolean | null
          current_step?: number | null
          essential_complete?: never
          fully_complete?: never
          identity_step_completed?: boolean | null
          last_resumed_at?: string | null
          onboarding_completed_at?: string | null
          payment_step_completed?: boolean | null
          professional_step_completed?: boolean | null
          profile_step_completed?: boolean | null
          psychologist_id?: string | null
          status?: never
          total_steps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_onboarding_state_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "psychologist_onboarding_state_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_onboarding_summary: {
        Row: {
          completion_percentage: number | null
          configuration_step_completed: boolean | null
          current_step: number | null
          essential_complete: boolean | null
          fully_complete: boolean | null
          identity_step_completed: boolean | null
          next_pending_step: string | null
          payment_step_completed: boolean | null
          professional_step_completed: boolean | null
          profile_step_completed: boolean | null
          psychologist_id: string | null
          total_steps: number | null
        }
        Relationships: []
      }
      therapeutic_session_events: {
        Row: {
          all_day: boolean | null
          attendance_confirmed: boolean | null
          billing_attempt_count: number | null
          billing_last_attempt_at: string | null
          billing_last_error: string | null
          billing_next_attempt_at: string | null
          billing_status: string | null
          calendar_event_id: string | null
          clinical_session_id: string | null
          color: string | null
          confirmation_sent_at: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_datetime: string | null
          google_event_id: string | null
          google_sync_error: string | null
          google_sync_status:
            | Database["public"]["Enums"]["google_sync_status"]
            | null
          last_synced_at: string | null
          legacy_session_id: string | null
          location: string | null
          metadata: Json | null
          patient_display_name: string | null
          patient_name: string | null
          private_notes: string | null
          psychologist_id: string | null
          psychologist_patient_id: string | null
          psychologist_service_id: string | null
          reminder_sent_at: string | null
          scheduling_status:
            | Database["public"]["Enums"]["calendar_event_status"]
            | null
          series_id: string | null
          service_duration: number | null
          service_name: string | null
          service_price: number | null
          session_detail_id: string | null
          session_number: number | null
          session_type_id: string | null
          source: Database["public"]["Enums"]["calendar_event_source"] | null
          start_datetime: string | null
          timezone: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "calendar_events_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "calendar_event_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_clinical_session_id_fkey"
            columns: ["clinical_session_id"]
            isOneToOne: false
            referencedRelation: "psychologist_clinical_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_clinical_session_id_fkey"
            columns: ["clinical_session_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_session_events"
            referencedColumns: ["legacy_session_id"]
          },
          {
            foreignKeyName: "clinical_session_details_patient_id_fkey"
            columns: ["psychologist_patient_id"]
            isOneToOne: false
            referencedRelation: "user_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_psychologist_service_id_fkey"
            columns: ["psychologist_service_id"]
            isOneToOne: false
            referencedRelation: "psychologist_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_session_details_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "session_types"
            referencedColumns: ["id"]
          },
        ]
      }
      v_operational_events: {
        Row: {
          actor_id_hash: string | null
          actor_type: string | null
          component: string | null
          correlation_id: string | null
          duration_ms: number | null
          environment: string | null
          error_category: string | null
          error_code: string | null
          error_message: string | null
          event_family: string | null
          event_name: string | null
          force_keep: boolean | null
          http_status: number | null
          id: string | null
          ip_address: string | null
          metadata: Json | null
          operation: string | null
          operation_type: string | null
          outcome: string | null
          request_path: string | null
          retention_days: number | null
          role: string | null
          sample_rate: number | null
          service: string | null
          timestamp: string | null
          trace_id: string | null
          user_agent: string | null
        }
        Insert: {
          actor_id_hash?: string | null
          actor_type?: string | null
          component?: string | null
          correlation_id?: string | null
          duration_ms?: number | null
          environment?: string | null
          error_category?: string | null
          error_code?: string | null
          error_message?: string | null
          event_family?: string | null
          event_name?: string | null
          force_keep?: boolean | null
          http_status?: number | null
          id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          operation?: string | null
          operation_type?: string | null
          outcome?: string | null
          request_path?: string | null
          retention_days?: number | null
          role?: string | null
          sample_rate?: number | null
          service?: string | null
          timestamp?: string | null
          trace_id?: string | null
          user_agent?: string | null
        }
        Update: {
          actor_id_hash?: string | null
          actor_type?: string | null
          component?: string | null
          correlation_id?: string | null
          duration_ms?: number | null
          environment?: string | null
          error_category?: string | null
          error_code?: string | null
          error_message?: string | null
          event_family?: string | null
          event_name?: string | null
          force_keep?: boolean | null
          http_status?: number | null
          id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          operation?: string | null
          operation_type?: string | null
          outcome?: string | null
          request_path?: string | null
          retention_days?: number | null
          role?: string | null
          sample_rate?: number | null
          service?: string | null
          timestamp?: string | null
          trace_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      v_service_role_audit: {
        Row: {
          actor_id_hash: string | null
          actor_type: string | null
          component: string | null
          correlation_id: string | null
          duration_ms: number | null
          environment: string | null
          error_category: string | null
          error_code: string | null
          error_message: string | null
          event_family: string | null
          event_name: string | null
          force_keep: boolean | null
          http_status: number | null
          id: string | null
          ip_address: string | null
          metadata: Json | null
          operation: string | null
          operation_type: string | null
          outcome: string | null
          request_path: string | null
          retention_days: number | null
          role: string | null
          sample_rate: number | null
          service: string | null
          timestamp: string | null
          trace_id: string | null
          user_agent: string | null
        }
        Insert: {
          actor_id_hash?: string | null
          actor_type?: string | null
          component?: string | null
          correlation_id?: string | null
          duration_ms?: number | null
          environment?: string | null
          error_category?: string | null
          error_code?: string | null
          error_message?: string | null
          event_family?: string | null
          event_name?: string | null
          force_keep?: boolean | null
          http_status?: number | null
          id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          operation?: string | null
          operation_type?: string | null
          outcome?: string | null
          request_path?: string | null
          retention_days?: number | null
          role?: string | null
          sample_rate?: number | null
          service?: string | null
          timestamp?: string | null
          trace_id?: string | null
          user_agent?: string | null
        }
        Update: {
          actor_id_hash?: string | null
          actor_type?: string | null
          component?: string | null
          correlation_id?: string | null
          duration_ms?: number | null
          environment?: string | null
          error_category?: string | null
          error_code?: string | null
          error_message?: string | null
          event_family?: string | null
          event_name?: string | null
          force_keep?: boolean | null
          http_status?: number | null
          id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          operation?: string | null
          operation_type?: string | null
          outcome?: string | null
          request_path?: string | null
          retention_days?: number | null
          role?: string | null
          sample_rate?: number | null
          service?: string | null
          timestamp?: string | null
          trace_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      v_stripe_webhook_events: {
        Row: {
          customer_id: string | null
          duration_ms: number | null
          error_message: string | null
          event_name: string | null
          id: string | null
          outcome: string | null
          stripe_event_id: string | null
          stripe_event_type: string | null
          subscription_id: string | null
          timestamp: string | null
        }
        Insert: {
          customer_id?: never
          duration_ms?: number | null
          error_message?: string | null
          event_name?: string | null
          id?: string | null
          outcome?: string | null
          stripe_event_id?: never
          stripe_event_type?: string | null
          subscription_id?: never
          timestamp?: string | null
        }
        Update: {
          customer_id?: never
          duration_ms?: number | null
          error_message?: string | null
          event_name?: string | null
          id?: string | null
          outcome?: string | null
          stripe_event_id?: never
          stripe_event_type?: string | null
          subscription_id?: never
          timestamp?: string | null
        }
        Relationships: []
      }
      view_sync_backlog: {
        Row: {
          stuck_events_1h: number | null
          total_backlog: number | null
        }
        Relationships: []
      }
      view_sync_health_stats: {
        Row: {
          connection_updated_at: string | null
          error_count: number | null
          last_sync_activity: string | null
          pending_count: number | null
          psychologist_id: string | null
          psychologist_name: string | null
          sync_sessions: boolean | null
          synced_count: number | null
          total_events: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_onboarding_summary"
            referencedColumns: ["psychologist_id"]
          },
          {
            foreignKeyName: "calendar_events_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "user_psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_assistant_invite: {
        Args: { p_email: string; p_user_id: string }
        Returns: Json
      }
      acquire_sync_lock: {
        Args: { p_lock_key: string; p_locked_by?: string; p_ttl_ms?: number }
        Returns: boolean
      }
      auth_is_admin: { Args: never; Returns: boolean }
      auto_update_past_session_status: {
        Args: never
        Returns: {
          update_timestamp: string
          updated_count: number
        }[]
      }
      book_appointment: {
        Args: {
          p_duration_minutes?: number
          p_location_id?: string
          p_patient_client_id: string
          p_psychologist_id: string
          p_service_id?: string
          p_start_time: string
          p_timezone?: string
          p_title?: string
        }
        Returns: Json
      }
      broadcast_subscription_update: {
        Args: { p_therapist_id: string }
        Returns: undefined
      }
      calculate_cancellation_fee: {
        Args: {
          p_cancellation_time?: string
          p_psychologist_id: string
          p_session_start_time: string
        }
        Returns: {
          fee_amount_cents: number
          fee_percentage: number
          hours_before_session: number
          min_notice_hours: number
          policy_applies: boolean
        }[]
      }
      calculate_onboarding_progress: {
        Args: { p_psychologist_id: string }
        Returns: number
      }
      can_user_access_app: { Args: { p_user_id: string }; Returns: boolean }
      check_calendar_conflicts: {
        Args: {
          p_end_datetime: string
          p_exclude_event_id?: string
          p_psychologist_id: string
          p_start_datetime: string
        }
        Returns: {
          end_datetime: string
          event_id: string
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          start_datetime: string
          title: string
        }[]
      }
      check_configuration_prerequisites: {
        Args: { p_psychologist_id: string }
        Returns: {
          all_prerequisites_met: boolean
          has_availability: boolean
          has_locations: boolean
          has_online_delivery: boolean
          has_services: boolean
        }[]
      }
      check_profile_completion: {
        Args: { p_psychologist_id: string }
        Returns: boolean
      }
      check_slot_available: {
        Args: {
          p_end_time: string
          p_psychologist_id: string
          p_start_time: string
        }
        Returns: boolean
      }
      check_subscription_access: {
        Args: { p_therapist_id: string }
        Returns: {
          current_period_end: string
          days_remaining: number
          has_access: boolean
          is_in_grace_period: boolean
          status: string
          trial_end: string
        }[]
      }
      check_sync_lock: { Args: { p_lock_key: string }; Returns: boolean }
      cleanup_expired_idempotency_keys: { Args: never; Returns: undefined }
      cleanup_expired_idempotency_records: { Args: never; Returns: undefined }
      cleanup_expired_patient_deletions: {
        Args: never
        Returns: {
          cleanup_timestamp: string
          deleted_count: number
        }[]
      }
      cleanup_expired_sync_locks: { Args: never; Returns: undefined }
      cleanup_old_audit_logs:
        | { Args: never; Returns: undefined }
        | { Args: { p_retention_days?: number }; Returns: number }
      clear_audit_context: { Args: never; Returns: undefined }
      complete_onboarding_phase: {
        Args: { p_phase: number; p_psychologist_id: string; p_updates?: Json }
        Returns: Json
      }
      complete_onboarding_step: {
        Args: { p_psychologist_id: string; p_step: string }
        Returns: boolean
      }
      complete_psychologist_onboarding: { Args: never; Returns: boolean }
      compute_short_display_name: {
        Args: { base_name: string; surname: string }
        Returns: string
      }
      consolidate_daily_charges: {
        Args: { p_date: string; p_psychologist_id: string }
        Returns: {
          action: string
          amount_cents: number
          entry_date: string
          entry_id: string
        }[]
      }
      create_session_charge_if_due: {
        Args: {
          p_force?: boolean
          p_idempotency_key?: string
          p_lead_days?: number
          p_psychologist_id: string
          p_session_id: string
        }
        Returns: Json
      }
      create_session_occurrence_atomic: {
        Args: {
          p_custom_price_cents?: number
          p_duration_minutes?: number
          p_event_description?: string
          p_event_title?: string
          p_location_id?: string
          p_metadata?: Json
          p_notes?: string
          p_original_end_datetime?: string
          p_original_start_datetime?: string
          p_patient_id: string
          p_psychologist_id: string
          p_recurrence_rule?: string
          p_series_id?: string
          p_service_id?: string
          p_session_number?: number
          p_session_type_id?: string
          p_start_time: string
          p_status?: string
          p_timezone?: string
        }
        Returns: Json
      }
      create_session_with_calendar: {
        Args: {
          p_custom_price_cents?: number
          p_duration_minutes?: number
          p_location_id?: string
          p_notes?: string
          p_patient_id: string
          p_psychologist_id: string
          p_recurrence_rule?: string
          p_service_id?: string
          p_session_number?: number
          p_session_type_id?: string
          p_start_time: string
          p_status?: string
          p_timezone?: string
        }
        Returns: Json
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      decrypt_token_base64: {
        Args: { encrypted_token_base64: string; encryption_key: string }
        Returns: string
      }
      decrypt_token_base64_secure: {
        Args: {
          encrypted_token_base64: string
          encryption_key: string
          p_context?: string
        }
        Returns: string
      }
      detect_high_volume_service_role_usage: {
        Args: { threshold: number; window_minutes: number }
        Returns: {
          operation_count: number
          source: string
        }[]
      }
      detect_suspicious_error_patterns: {
        Args: never
        Returns: {
          error_count: number
          error_message: string
          source: string
        }[]
      }
      detect_unusual_table_access: {
        Args: { whitelisted_tables: string[] }
        Returns: {
          access_count: number
          source: string
          table_name: string
        }[]
      }
      empty_lexical_state_base64: { Args: never; Returns: string }
      encrypt_token_base64: {
        Args: { encryption_key: string; token: string }
        Returns: string
      }
      enqueue_calendar_sync_job: {
        Args: {
          p_payload: Json
          p_queue_name?: string
          p_sleep_seconds?: number
        }
        Returns: number
      }
      ensure_psychologist_for_current_user: { Args: never; Returns: undefined }
      get_active_patient_ids: {
        Args: { p_psychologist_id: string }
        Returns: string[]
      }
      get_calendar_sync_queue_backlog: { Args: never; Returns: number }
      get_current_onboarding_phase: {
        Args: { p_user_id?: string }
        Returns: {
          is_complete: boolean
          phase: string
          step_name: string
          step_number: number
        }[]
      }
      get_current_onboarding_step: {
        Args: { p_psychologist_id: string }
        Returns: Json
      }
      get_effective_cancellation_policy: {
        Args: { p_psychologist_id: string; p_reference_timestamp?: string }
        Returns: {
          effective_from: string
          effective_until: string
          fee_percentage: number
          min_notice_hours: number
          policy_code: string
        }[]
      }
      get_jwt_claim_role: { Args: never; Returns: string }
      get_my_access_payload: {
        Args: never
        Returns: {
          access_version: number
          permissions: Json
          roles: Json
          subscription: Json
          user_id: string
        }[]
      }
      get_net_availability: {
        Args: {
          p_end_date: string
          p_psychologist_id: string
          p_slot_duration_minutes?: number
          p_start_date: string
          p_timezone?: string
        }
        Returns: {
          day_of_week: number
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          duration_minutes: number
          slot_end: string
          slot_start: string
        }[]
      }
      get_onboarding_status: { Args: never; Returns: boolean }
      get_onboarding_status_by_user: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      get_onboarding_status_v2: {
        Args: { p_user_id?: string }
        Returns: {
          completion_percentage: number
          configuration_completed: boolean
          current_step: number
          essential_complete: boolean
          fully_complete: boolean
          identity_completed: boolean
          next_pending_step: string
          payment_completed: boolean
          professional_completed: boolean
          profile_completed: boolean
          total_steps: number
        }[]
      }
      get_psychologist_availability: {
        Args: {
          p_end_date: string
          p_psychologist_id: string
          p_start_date: string
        }
        Returns: {
          available_for_first_appointment: boolean
          date: string
          day_of_week: number
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          end_time: string
          is_exception: boolean
          location_id: string
          start_time: string
        }[]
      }
      get_psychologist_ids_for_patient: {
        Args: { p_patient_id: string }
        Returns: string[]
      }
      get_psychologist_linktree_data: {
        Args: { p_psychologist_id: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
          url: string
        }[]
      }
      get_public_psychologist_by_username: {
        Args: { p_username: string }
        Returns: {
          avatar_url: string
          bio: string
          crp: string
          crp_state: string
          full_name: string
          id: string
          specialties: Json
        }[]
      }
      get_record_audit_history: {
        Args: { p_limit?: number; p_record_id: string; p_table_name: string }
        Returns: {
          action: string
          changed_fields: Json
          created_at: string
          user_id: string
          user_type: string
        }[]
      }
      get_sessions_needing_reminders: {
        Args: { p_batch_size?: number; p_reminder_type: string }
        Returns: {
          patient_email: string
          patient_id: string
          patient_phone: string
          psychologist_id: string
          reminder_hours_before: number
          session_id: string
          session_start_time: string
        }[]
      }
      get_subscription_status_by_user: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_upcoming_exceptions: {
        Args: {
          p_from_date?: string
          p_limit?: number
          p_psychologist_id: string
        }
        Returns: {
          created_at: string
          end_time: string
          exception_date: string
          id: string
          is_available: boolean
          reason: string
          start_time: string
        }[]
      }
      get_user_access_payload: {
        Args: { target_user_id: string }
        Returns: {
          access_version: number
          permissions: Json
          roles: Json
          subscription: Json
          user_id: string
        }[]
      }
      get_user_access_payload_core: {
        Args: { target_user_id: string }
        Returns: {
          access_version: number
          permissions: Json
          roles: Json
          subscription: Json
          user_id: string
        }[]
      }
      get_user_by_email: {
        Args: { email_input: string }
        Returns: {
          email: string
          id: string
        }[]
      }
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
      get_user_role: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_subscription_status: {
        Args: { p_user_id: string }
        Returns: {
          has_essential_access: boolean
          is_active: boolean
          status: string
        }[]
      }
      get_weekly_availability_config: {
        Args: { p_psychologist_id: string }
        Returns: {
          day_of_week: number
          intervals: Json
          is_active: boolean
        }[]
      }
      has_access_to_psychologist_data: {
        Args: { target_psychologist_id: string }
        Returns: boolean
      }
      has_client_access: {
        Args: { p_psychologist_client_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_own_psychologist: {
        Args: { p_psychologist_id: string }
        Returns: boolean
      }
      is_assistant: { Args: never; Returns: boolean }
      is_linked_to_psychologist_client: {
        Args: { p_psychologist_client_id: string }
        Returns: boolean
      }
      is_onboarding_essential_complete: {
        Args: { p_psychologist_id: string }
        Returns: boolean
      }
      is_onboarding_fully_complete: {
        Args: { p_psychologist_id: string }
        Returns: boolean
      }
      is_own_patient_data: { Args: { p_patient_id: string }; Returns: boolean }
      is_own_psychologist_data: {
        Args: { p_psychologist_id: string }
        Returns: boolean
      }
      is_patient: { Args: never; Returns: boolean }
      is_profile_public: {
        Args: { p_psychologist_id: string }
        Returns: boolean
      }
      is_psychologist: { Args: never; Returns: boolean }
      is_psychologist_or_linked_patient: {
        Args: { p_psychologist_client_id: string; p_psychologist_id: string }
        Returns: boolean
      }
      is_webhook_event_processed: {
        Args: { p_event_id: string }
        Returns: boolean
      }
      log_security_audit_event: {
        Args: {
          p_action: string
          p_actor_id: string
          p_correlation_id?: string
          p_metadata?: Json
          p_source?: string
          p_target_id: string
          p_target_type: string
        }
        Returns: string
      }
      mark_reminder_sent: {
        Args: {
          p_channel: string
          p_reminder_type: string
          p_session_id: string
        }
        Returns: boolean
      }
      migrate_weekly_to_daily_consolidation: {
        Args: never
        Returns: {
          entries_deleted: number
          entries_migrated: number
          new_daily_entries_created: number
        }[]
      }
      pgmq_archive_message: {
        Args: { p_msg_id: number; p_queue_name: string }
        Returns: boolean
      }
      pgmq_delete_message: {
        Args: { p_msg_id: number; p_queue_name: string }
        Returns: boolean
      }
      pgmq_queue_backlog: { Args: { p_queue_name: string }; Returns: number }
      pgmq_read_messages: {
        Args: { p_qty: number; p_queue_name: string; p_vt: number }
        Returns: Json
      }
      process_pending_session_billing:
        | {
            Args: { p_batch_size?: number }
            Returns: {
              error_count: number
              processed_count: number
              success_count: number
            }[]
          }
        | { Args: { p_lead_days?: number; p_limit?: number }; Returns: Json }
      provision_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      query_audit_logs: {
        Args: {
          p_action?: string
          p_end_date?: string
          p_limit?: number
          p_record_id?: string
          p_start_date?: string
          p_table_name?: string
          p_user_id?: string
        }
        Returns: {
          action: string
          changed_fields: Json
          correlation_id: string
          created_at: string
          id: string
          record_id: string
          table_name: string
          user_id: string
          user_type: string
        }[]
      }
      recalculate_daily_consolidation_for_charge: {
        Args: { p_charge_id: string }
        Returns: {
          action: string
          amount_cents: number
          entry_date: string
          entry_id: string
        }[]
      }
      release_google_sync_inbound_coalesce: {
        Args: { p_connection_id: string }
        Returns: undefined
      }
      release_sync_lock: { Args: { p_lock_key: string }; Returns: undefined }
      request_account_deletion: {
        Args: { p_metadata?: Json; p_reason?: string }
        Returns: string
      }
      resolve_calendar_sync_queue_name: {
        Args: { p_payload: Json; p_queue_name?: string }
        Returns: string
      }
      schedule_all_capitals_holiday_sync: {
        Args: { p_year: number }
        Returns: undefined
      }
      set_audit_context: { Args: { p_user_id: string }; Returns: undefined }
      set_psychologist_cancellation_policy: {
        Args: { p_policy_code: string; p_psychologist_id: string }
        Returns: boolean
      }
      subscription_claims_for_jwt: { Args: { src: Json }; Returns: Json }
      sync_calendar_event_to_session: {
        Args: { p_event_id: string }
        Returns: boolean
      }
      sync_profile_subscription: {
        Args: { p_subscription: Json; p_user_id: string }
        Returns: undefined
      }
      sync_user_app_metadata: {
        Args: { p_onboarding_completed?: boolean }
        Returns: undefined
      }
      sync_user_roles: {
        Args: { p_roles: string[]; p_user_id: string }
        Returns: undefined
      }
      text_to_lexical_base64: { Args: { input_text: string }; Returns: string }
      update_attendance_confirmation: {
        Args: {
          p_confirmation_source: string
          p_confirmed: boolean
          p_confirmed_by?: string
          p_session_id: string
        }
        Returns: boolean
      }
      update_onboarding_step: {
        Args: {
          p_draft_data?: Json
          p_is_complete: boolean
          p_psychologist_id: string
          p_step_id: string
        }
        Returns: Json
      }
      upsert_weekly_availability: {
        Args: {
          p_day_of_week: number
          p_intervals?: Json
          p_is_active: boolean
          p_psychologist_id: string
        }
        Returns: undefined
      }
      user_has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      validate_weekly_availability_overlaps: {
        Args: {
          p_day_of_week: number
          p_intervals: Json
          p_psychologist_id: string
        }
        Returns: {
          has_overlap: boolean
          overlap_details: string
        }[]
      }
    }
    Enums: {
      account_deletion_status:
        | "requested"
        | "approved"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      app_role: "psychologist" | "patient" | "assistant" | "admin"
      block_type: "lunch" | "break" | "vacation" | "personal" | "unavailable"
      business_type: "PF" | "PJ"
      calendar_event_source: "fluri" | "google"
      calendar_event_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
        | "rescheduled"
      calendar_event_type:
        | "session"
        | "supervision"
        | "meeting"
        | "task"
        | "block"
        | "other"
      calendar_event_type_new:
        | "session"
        | "supervision"
        | "meeting"
        | "block"
        | "other"
      cancellation_policy_code:
        | "flexible"
        | "standard"
        | "strict"
        | "non_refundable"
      clinical_note_type: "clinical_note" | "progress_note"
      clinical_scope:
        | "therapy"
        | "assessment"
        | "intervention"
        | "psychoeducation"
        | "report"
        | "supervision"
      clinical_session_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "no_show"
        | "open"
      clinical_session_status_new:
        | "scheduled"
        | "open"
        | "completed"
        | "cancelled"
        | "no_show"
      contact_method_type: "whatsapp" | "sms" | "email" | "phone"
      delivery_mode: "in_person" | "telehealth" | "hybrid"
      financial_entry_status: "confirmed" | "pending" | "cancelled"
      google_sync_status: "pending" | "synced" | "error" | "not_synced"
      interview_kind: "structured" | "semi_structured" | "unstructured"
      invite_status_type: "pending" | "accepted" | "expired" | "cancelled"
      marketplace_payment_status:
        | "requires_payment_method"
        | "requires_action"
        | "processing"
        | "succeeded"
        | "canceled"
        | "refunded"
        | "failed"
      medical_item_kind:
        | "mental_disorder"
        | "chronic_disease"
        | "physical_disability"
        | "other"
        | "medication_intake"
      modality: "individual" | "couple" | "family" | "group"
      onboarding_module:
        | "professional_registration"
        | "identity_verification"
        | "practice_configuration"
      patient_status: "active" | "inactive" | "on_break" | "discharged"
      payment_method_type:
        | "fluripay"
        | "card"
        | "cash"
        | "pix"
        | "bank_transfer"
        | "other"
      payment_status_type:
        | "pending"
        | "paid"
        | "overdue"
        | "refunded"
        | "cancelled"
      population: "child" | "adolescent" | "adult" | "older_adult"
      practice_modality: "in_person" | "online" | "hybrid"
      reschedule_initiator: "psychologist" | "client"
      reschedule_request_status: "pending" | "accepted" | "rejected"
      risk_level_type: "low" | "medium" | "high" | "critical"
      series_exception_type: "cancelled" | "rescheduled" | "modified"
      session_cancellation_policy_code:
        | "flexible"
        | "standard"
        | "strict"
        | "non_refundable"
      stripe_onboarding_status:
        | "not_started"
        | "pending"
        | "complete"
        | "restricted"
        | "rejected"
      supervision_type: "giving" | "receiving"
      sync_direction: "fluri_to_google" | "google_to_fluri"
      sync_operation: "create" | "update" | "delete"
      sync_result_status: "success" | "error" | "skipped"
      timeline_event_type:
        | "patient_created"
        | "patient_updated"
        | "patient_archived"
        | "patient_unarchived"
        | "session_scheduled"
        | "session_completed"
        | "session_cancelled"
        | "session_rescheduled"
        | "session_no_show"
        | "document_generated"
        | "document_uploaded"
        | "document_archived"
        | "activity_assigned"
        | "activity_completed"
        | "activity_response_received"
        | "activity_archived"
        | "charge_created"
        | "charge_cancelled"
        | "payment_received"
        | "payment_processed"
        | "payment_overdue"
        | "refund_processed"
        | "note_added"
        | "note_updated"
        | "note_archived"
        | "consent_signed"
        | "invite_sent"
        | "invite_reminder_sent"
        | "account_linked"
        | "condition_added"
        | "condition_updated"
        | "medication_added"
        | "medication_updated"
        | "emergency_contact_added"
        | "emergency_contact_updated"
        | "emergency_contact_removed"
        | "label_assigned"
        | "label_removed"
        | "test_applied"
        | "test_result_added"
        | "test_archived"
        | "guardian_added"
        | "guardian_updated"
        | "guardian_document_uploaded"
        | "guardian_document_validated"
        | "status_changed"
        | "risk_assessment_updated"
        | "relationship_started"
        | "relationship_ended"
      transaction_type: "INCOME" | "EXPENSE"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_deletion_status: [
        "requested",
        "approved",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      app_role: ["psychologist", "patient", "assistant", "admin"],
      block_type: ["lunch", "break", "vacation", "personal", "unavailable"],
      business_type: ["PF", "PJ"],
      calendar_event_source: ["fluri", "google"],
      calendar_event_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      calendar_event_type: [
        "session",
        "supervision",
        "meeting",
        "task",
        "block",
        "other",
      ],
      calendar_event_type_new: [
        "session",
        "supervision",
        "meeting",
        "block",
        "other",
      ],
      cancellation_policy_code: [
        "flexible",
        "standard",
        "strict",
        "non_refundable",
      ],
      clinical_note_type: ["clinical_note", "progress_note"],
      clinical_scope: [
        "therapy",
        "assessment",
        "intervention",
        "psychoeducation",
        "report",
        "supervision",
      ],
      clinical_session_status: [
        "scheduled",
        "completed",
        "cancelled",
        "no_show",
        "open",
      ],
      clinical_session_status_new: [
        "scheduled",
        "open",
        "completed",
        "cancelled",
        "no_show",
      ],
      contact_method_type: ["whatsapp", "sms", "email", "phone"],
      delivery_mode: ["in_person", "telehealth", "hybrid"],
      financial_entry_status: ["confirmed", "pending", "cancelled"],
      google_sync_status: ["pending", "synced", "error", "not_synced"],
      interview_kind: ["structured", "semi_structured", "unstructured"],
      invite_status_type: ["pending", "accepted", "expired", "cancelled"],
      marketplace_payment_status: [
        "requires_payment_method",
        "requires_action",
        "processing",
        "succeeded",
        "canceled",
        "refunded",
        "failed",
      ],
      medical_item_kind: [
        "mental_disorder",
        "chronic_disease",
        "physical_disability",
        "other",
        "medication_intake",
      ],
      modality: ["individual", "couple", "family", "group"],
      onboarding_module: [
        "professional_registration",
        "identity_verification",
        "practice_configuration",
      ],
      patient_status: ["active", "inactive", "on_break", "discharged"],
      payment_method_type: [
        "fluripay",
        "card",
        "cash",
        "pix",
        "bank_transfer",
        "other",
      ],
      payment_status_type: [
        "pending",
        "paid",
        "overdue",
        "refunded",
        "cancelled",
      ],
      population: ["child", "adolescent", "adult", "older_adult"],
      practice_modality: ["in_person", "online", "hybrid"],
      reschedule_initiator: ["psychologist", "client"],
      reschedule_request_status: ["pending", "accepted", "rejected"],
      risk_level_type: ["low", "medium", "high", "critical"],
      series_exception_type: ["cancelled", "rescheduled", "modified"],
      session_cancellation_policy_code: [
        "flexible",
        "standard",
        "strict",
        "non_refundable",
      ],
      stripe_onboarding_status: [
        "not_started",
        "pending",
        "complete",
        "restricted",
        "rejected",
      ],
      supervision_type: ["giving", "receiving"],
      sync_direction: ["fluri_to_google", "google_to_fluri"],
      sync_operation: ["create", "update", "delete"],
      sync_result_status: ["success", "error", "skipped"],
      timeline_event_type: [
        "patient_created",
        "patient_updated",
        "patient_archived",
        "patient_unarchived",
        "session_scheduled",
        "session_completed",
        "session_cancelled",
        "session_rescheduled",
        "session_no_show",
        "document_generated",
        "document_uploaded",
        "document_archived",
        "activity_assigned",
        "activity_completed",
        "activity_response_received",
        "activity_archived",
        "charge_created",
        "charge_cancelled",
        "payment_received",
        "payment_processed",
        "payment_overdue",
        "refund_processed",
        "note_added",
        "note_updated",
        "note_archived",
        "consent_signed",
        "invite_sent",
        "invite_reminder_sent",
        "account_linked",
        "condition_added",
        "condition_updated",
        "medication_added",
        "medication_updated",
        "emergency_contact_added",
        "emergency_contact_updated",
        "emergency_contact_removed",
        "label_assigned",
        "label_removed",
        "test_applied",
        "test_result_added",
        "test_archived",
        "guardian_added",
        "guardian_updated",
        "guardian_document_uploaded",
        "guardian_document_validated",
        "status_changed",
        "risk_assessment_updated",
        "relationship_started",
        "relationship_ended",
      ],
      transaction_type: ["INCOME", "EXPENSE"],
    },
  },
} as const

