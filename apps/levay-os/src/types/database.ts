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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_messages: {
        Row: {
          cache_hit: boolean
          content: Json
          created_at: string
          id: string
          role: string
          thread_id: string
          tokens_used: number | null
          tool_calls: Json | null
          workspace_id: string
        }
        Insert: {
          cache_hit?: boolean
          content: Json
          created_at?: string
          id?: string
          role: string
          thread_id: string
          tokens_used?: number | null
          tool_calls?: Json | null
          workspace_id: string
        }
        Update: {
          cache_hit?: boolean
          content?: Json
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          tokens_used?: number | null
          tool_calls?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ai_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_threads: {
        Row: {
          collaborator_id: string | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          collaborator_id?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          collaborator_id?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_threads_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_threads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_collaborator_id: string | null
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          entity_id: string
          entity_kind: string
          id: string
          workspace_id: string
        }
        Insert: {
          action: string
          actor_collaborator_id?: string | null
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id: string
          entity_kind: string
          id?: string
          workspace_id: string
        }
        Update: {
          action?: string
          actor_collaborator_id?: string | null
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string
          entity_kind?: string
          id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_collaborator_id_fkey"
            columns: ["actor_collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      captures: {
        Row: {
          created_at: string
          created_by_collaborator_id: string | null
          destination_id: string | null
          destination_kind: string | null
          id: string
          processed_at: string | null
          raw_audio_url: string | null
          raw_text: string | null
          source: string
          transcript: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by_collaborator_id?: string | null
          destination_id?: string | null
          destination_kind?: string | null
          id?: string
          processed_at?: string | null
          raw_audio_url?: string | null
          raw_text?: string | null
          source: string
          transcript?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by_collaborator_id?: string | null
          destination_id?: string | null
          destination_kind?: string | null
          id?: string
          processed_at?: string | null
          raw_audio_url?: string | null
          raw_text?: string | null
          source?: string
          transcript?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "captures_created_by_collaborator_id_fkey"
            columns: ["created_by_collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captures_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_companies: {
        Row: {
          allocated_since: string | null
          collaborator_id: string | null
          company_id: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          role_at_company: string | null
          workspace_id: string
        }
        Insert: {
          allocated_since?: string | null
          collaborator_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role_at_company?: string | null
          workspace_id?: string
        }
        Update: {
          allocated_since?: string | null
          collaborator_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role_at_company?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_companies_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_notes: {
        Row: {
          author_id: string | null
          collaborator_id: string | null
          content: string
          created_at: string | null
          id: string
          tags: Json | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          author_id?: string | null
          collaborator_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          tags?: Json | null
          updated_at?: string | null
          workspace_id?: string
        }
        Update: {
          author_id?: string | null
          collaborator_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          tags?: Json | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_notes_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborators: {
        Row: {
          active: boolean
          address: string | null
          admission_date: string | null
          birthday: string | null
          contract_type: string | null
          cpf: string | null
          created_at: string
          default_company_id: string | null
          email: string | null
          emergency_contact: string | null
          emergency_contact_phone: string | null
          id: string
          legacy_notion_id: string | null
          name: string
          notes: Json | null
          phone: string | null
          photo_url: string | null
          position: string | null
          profile_data: Json | null
          rg: string | null
          role: string | null
          status_employment: string | null
          uniform_size: string | null
          updated_at: string
          user_id: string | null
          vinculo: string | null
          whatsapp: string | null
          workspace_id: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          admission_date?: string | null
          birthday?: string | null
          contract_type?: string | null
          cpf?: string | null
          created_at?: string
          default_company_id?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_phone?: string | null
          id?: string
          legacy_notion_id?: string | null
          name: string
          notes?: Json | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          profile_data?: Json | null
          rg?: string | null
          role?: string | null
          status_employment?: string | null
          uniform_size?: string | null
          updated_at?: string
          user_id?: string | null
          vinculo?: string | null
          whatsapp?: string | null
          workspace_id: string
        }
        Update: {
          active?: boolean
          address?: string | null
          admission_date?: string | null
          birthday?: string | null
          contract_type?: string | null
          cpf?: string | null
          created_at?: string
          default_company_id?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_phone?: string | null
          id?: string
          legacy_notion_id?: string | null
          name?: string
          notes?: Json | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          profile_data?: Json | null
          rg?: string | null
          role?: string | null
          status_employment?: string | null
          uniform_size?: string | null
          updated_at?: string
          user_id?: string | null
          vinculo?: string | null
          whatsapp?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_default_company_id_fkey"
            columns: ["default_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborators_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          anti_publico: string | null
          cluster: string | null
          color: string | null
          compartilha_cozinha_com: string | null
          compartilha_predio_com: string | null
          created_at: string
          dna: Json | null
          dna_oneliner: string | null
          escopo: string | null
          icon: string | null
          id: string
          legacy_notion_id: string | null
          name: string
          promessa: string | null
          principal_desafio: string | null
          principal_oportunidade: string | null
          proximo_marco: string | null
          slug: string
          tagline: string | null
          tom_voz: string | null
          type: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          anti_publico?: string | null
          cluster?: string | null
          color?: string | null
          compartilha_cozinha_com?: string | null
          compartilha_predio_com?: string | null
          created_at?: string
          dna?: Json | null
          dna_oneliner?: string | null
          escopo?: string | null
          icon?: string | null
          id?: string
          legacy_notion_id?: string | null
          name: string
          promessa?: string | null
          principal_desafio?: string | null
          principal_oportunidade?: string | null
          proximo_marco?: string | null
          slug: string
          tagline?: string | null
          tom_voz?: string | null
          type?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          anti_publico?: string | null
          cluster?: string | null
          color?: string | null
          compartilha_cozinha_com?: string | null
          compartilha_predio_com?: string | null
          created_at?: string
          dna?: Json | null
          dna_oneliner?: string | null
          escopo?: string | null
          icon?: string | null
          id?: string
          legacy_notion_id?: string | null
          name?: string
          promessa?: string | null
          principal_desafio?: string | null
          principal_oportunidade?: string | null
          proximo_marco?: string | null
          slug?: string
          tagline?: string | null
          tom_voz?: string | null
          type?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_clients: {
        Row: {
          company_id: string
          created_at: string
          document: string | null
          id: string
          kind: string
          layer: string | null
          legacy_notion_id: string | null
          name: string
          next_step: string | null
          next_step_at: string | null
          responsible_collaborator_id: string | null
          services: string[] | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          document?: string | null
          id?: string
          kind: string
          layer?: string | null
          legacy_notion_id?: string | null
          name: string
          next_step?: string | null
          next_step_at?: string | null
          responsible_collaborator_id?: string | null
          services?: string[] | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          document?: string | null
          id?: string
          kind?: string
          layer?: string | null
          legacy_notion_id?: string | null
          name?: string
          next_step?: string | null
          next_step_at?: string | null
          responsible_collaborator_id?: string | null
          services?: string[] | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_clients_responsible_collaborator_id_fkey"
            columns: ["responsible_collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          type: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          type?: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          next_follow_up_at: string | null
          notes: string | null
          phone: string | null
          pipeline_id: string
          probability: string | null
          source: string | null
          source_type: string | null
          stage_id: string
          status: string
          updated_at: string
          value: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_id: string
          probability?: string | null
          source?: string | null
          source_type?: string | null
          stage_id: string
          status?: string
          updated_at?: string
          value?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_id?: string
          probability?: string | null
          source?: string | null
          source_type?: string | null
          stage_id?: string
          status?: string
          updated_at?: string
          value?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipelines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipelines_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          pipeline_id: string
          position: number
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          pipeline_id: string
          position?: number
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_stages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      lacunas: {
        Row: {
          bloqueia: string | null
          contexto: string | null
          created_at: string
          dono_collaborator_id: string | null
          empresa_id: string | null
          id: string
          impacto: string
          proximo_movimento: string | null
          resolvida_em: string | null
          status: string
          titulo: string
          tipo: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          bloqueia?: string | null
          contexto?: string | null
          created_at?: string
          dono_collaborator_id?: string | null
          empresa_id?: string | null
          id?: string
          impacto?: string
          proximo_movimento?: string | null
          resolvida_em?: string | null
          status?: string
          titulo: string
          tipo?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          bloqueia?: string | null
          contexto?: string | null
          created_at?: string
          dono_collaborator_id?: string | null
          empresa_id?: string | null
          id?: string
          impacto?: string
          proximo_movimento?: string | null
          resolvida_em?: string | null
          status?: string
          titulo?: string
          tipo?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lacunas_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lacunas_company_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lacunas_dono_collaborator_id_fkey"
            columns: ["dono_collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
          workspace_id: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
          workspace_id: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_config_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      alocacoes: {
        Row: {
          cargo: string
          collaborator_id: string
          company_id: string
          created_at: string
          fim: string | null
          id: string
          inicio: string
          responsavel_substituto_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          cargo: string
          collaborator_id: string
          company_id: string
          created_at?: string
          fim?: string | null
          id?: string
          inicio?: string
          responsavel_substituto_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          cargo?: string
          collaborator_id?: string
          company_id?: string
          created_at?: string
          fim?: string | null
          id?: string
          inicio?: string
          responsavel_substituto_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alocacoes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alocacoes_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alocacoes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          alternatives: string | null
          company_id: string | null
          context: string | null
          created_at: string
          decided_at: string
          decided_by_collaborator_id: string | null
          decision_type: string
          expected_outcome: string | null
          format: string | null
          id: string
          learning: string | null
          legacy_notion_id: string | null
          okr_ids: string[] | null
          practical_change: string
          reversibility: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          alternatives?: string | null
          company_id?: string | null
          context?: string | null
          created_at?: string
          decided_at?: string
          decided_by_collaborator_id?: string | null
          decision_type: string
          expected_outcome?: string | null
          format?: string | null
          id?: string
          learning?: string | null
          legacy_notion_id?: string | null
          okr_ids?: string[] | null
          practical_change?: string
          reversibility: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          alternatives?: string | null
          company_id?: string | null
          context?: string | null
          created_at?: string
          decided_at?: string
          decided_by_collaborator_id?: string | null
          decision_type?: string
          expected_outcome?: string | null
          format?: string | null
          id?: string
          learning?: string | null
          legacy_notion_id?: string | null
          okr_ids?: string[] | null
          practical_change?: string
          reversibility?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_decided_by_collaborator_id_fkey"
            columns: ["decided_by_collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          company_id: string
          created_at: string
          event_date: string | null
          guest_count: number | null
          id: string
          notes: string | null
          responsible_collaborator_id: string | null
          status: string
          title: string
          type: string | null
          updated_at: string
          value: number | null
          workspace_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          responsible_collaborator_id?: string | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string
          value?: number | null
          workspace_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          responsible_collaborator_id?: string | null
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
          value?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_responsible_collaborator_id_fkey"
            columns: ["responsible_collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      gaps: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          legacy_notion_id: string | null
          priority: number | null
          status: string
          title: string
          type: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          legacy_notion_id?: string | null
          priority?: number | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          legacy_notion_id?: string | null
          priority?: number | null
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaps_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_links: {
        Row: {
          created_at: string
          entity_id: string
          entity_kind: string
          external_id: string
          external_kind: string | null
          id: string
          integration_id: string
          meta: Json | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_kind: string
          external_id: string
          external_kind?: string | null
          id?: string
          integration_id: string
          meta?: Json | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_kind?: string
          external_id?: string
          external_kind?: string | null
          id?: string
          integration_id?: string
          meta?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_links_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_links_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          last_sync_at: string | null
          provider: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          provider: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          provider?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          blocks: Json | null
          company_id: string | null
          created_at: string
          embedding: string | null
          id: string
          legacy_notion_id: string | null
          tags: string[] | null
          title: string
          type: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          blocks?: Json | null
          company_id?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          legacy_notion_id?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          blocks?: Json | null
          company_id?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          legacy_notion_id?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          benefits: Json | null
          company_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          status: string
          updated_at: string
          valid_until: string | null
          whatsapp: string | null
          workspace_id: string
        }
        Insert: {
          benefits?: Json | null
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          valid_until?: string | null
          whatsapp?: string | null
          workspace_id: string
        }
        Update: {
          benefits?: Json | null
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          valid_until?: string | null
          whatsapp?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      okrs: {
        Row: {
          company_id: string | null
          created_at: string
          cycle: string
          id: string
          kind: string
          legacy_notion_id: string | null
          parent_okr_id: string | null
          progress_pct: number
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          cycle: string
          id?: string
          kind: string
          legacy_notion_id?: string | null
          parent_okr_id?: string | null
          progress_pct?: number
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          cycle?: string
          id?: string
          kind?: string
          legacy_notion_id?: string | null
          parent_okr_id?: string | null
          progress_pct?: number
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "okrs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okrs_parent_okr_id_fkey"
            columns: ["parent_okr_id"]
            isOneToOne: false
            referencedRelation: "okrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okrs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_quental: {
        Row: {
          created_at: string
          crm_client_id: string | null
          id: string
          next_action: string | null
          stage: string
          updated_at: string
          value: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          crm_client_id?: string | null
          id?: string
          next_action?: string | null
          stage: string
          updated_at?: string
          value?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          crm_client_id?: string | null
          id?: string
          next_action?: string | null
          stage?: string
          updated_at?: string
          value?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_quental_crm_client_id_fkey"
            columns: ["crm_client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_quental_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          legacy_notion_id: string | null
          status: string
          steps: Json | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          legacy_notion_id?: string | null
          status?: string
          steps?: Json | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          legacy_notion_id?: string | null
          status?: string
          steps?: Json | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          attention: string | null
          blocking: string | null
          company_id: string | null
          created_at: string
          foco_trimestral: string | null
          health_score: number | null
          id: string
          legacy_notion_id: string | null
          modality: string
          name: string
          next_milestone: string | null
          okr_id: string | null
          responsible_collaborator_id: string | null
          status: string
          type: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          attention?: string | null
          blocking?: string | null
          company_id?: string | null
          created_at?: string
          foco_trimestral?: string | null
          health_score?: number | null
          id?: string
          legacy_notion_id?: string | null
          modality: string
          name: string
          next_milestone?: string | null
          okr_id?: string | null
          responsible_collaborator_id?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          attention?: string | null
          blocking?: string | null
          company_id?: string | null
          created_at?: string
          foco_trimestral?: string | null
          health_score?: number | null
          id?: string
          legacy_notion_id?: string | null
          modality?: string
          name?: string
          next_milestone?: string | null
          okr_id?: string | null
          responsible_collaborator_id?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_okr_id_fkey"
            columns: ["okr_id"]
            isOneToOne: false
            referencedRelation: "okrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_responsible_collaborator_id_fkey"
            columns: ["responsible_collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_responses: {
        Row: {
          collaborator_id: string | null
          company_id: string | null
          created_at: string
          id: string
          mood: number | null
          question: string
          replied_at: string | null
          response: string | null
          workspace_id: string
        }
        Insert: {
          collaborator_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          mood?: number | null
          question: string
          replied_at?: string | null
          response?: string | null
          workspace_id: string
        }
        Update: {
          collaborator_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          mood?: number | null
          question?: string
          replied_at?: string | null
          response?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_responses_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulse_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulse_responses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          company_id: string
          created_at: string
          guest_count: number
          guest_name: string
          id: string
          is_member: boolean
          membership_id: string | null
          notes: string | null
          reserved_at: string
          status: string
          table_ref: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          guest_count: number
          guest_name: string
          id?: string
          is_member?: boolean
          membership_id?: string | null
          notes?: string | null
          reserved_at: string
          status?: string
          table_ref?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          guest_count?: number
          guest_name?: string
          id?: string
          is_member?: boolean
          membership_id?: string | null
          notes?: string | null
          reserved_at?: string
          status?: string
          table_ref?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          block: string | null
          co_owners: string[] | null
          company_id: string | null
          created_at: string
          description: string | null
          due_at: string | null
          due_date: string | null
          effort_hours: number | null
          event_fronts: string[] | null
          id: string
          inbox: boolean
          legacy_notion_id: string | null
          minimum_movement: string
          origin: string | null
          owner_collaborator_id: string | null
          priority: number | null
          project_id: string | null
          status: string
          tags: Json | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          block?: string | null
          co_owners?: string[] | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          due_date?: string | null
          effort_hours?: number | null
          event_fronts?: string[] | null
          id?: string
          inbox?: boolean
          legacy_notion_id?: string | null
          minimum_movement?: string
          origin?: string | null
          owner_collaborator_id?: string | null
          priority?: number | null
          project_id?: string | null
          status?: string
          tags?: Json | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          block?: string | null
          co_owners?: string[] | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          due_date?: string | null
          effort_hours?: number | null
          event_fronts?: string[] | null
          id?: string
          inbox?: boolean
          legacy_notion_id?: string | null
          minimum_movement?: string
          origin?: string | null
          owner_collaborator_id?: string | null
          priority?: number | null
          project_id?: string | null
          status?: string
          tags?: Json | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_collaborator_id_fkey"
            columns: ["owner_collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          mode: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_workspace_id: { Args: never; Returns: string }
      initialize_sollu_pipeline: {
        Args: { p_workspace_id: string }
        Returns: string
      }
      workspace_id: { Args: never; Returns: string }
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
