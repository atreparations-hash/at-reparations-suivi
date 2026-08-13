import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Appareil = {
  id: string
  numero_suivi: string
  type_appareil: string
  marque_modele: string | null
  statut: string
  date_depot: string
  commentaire: string | null
  created_at: string
  updated_at: string
}

export type Historique = {
  id: string
  appareil_id: string
  ancien_statut: string | null
  nouveau_statut: string
  commentaire: string | null
  created_at: string
}

export const STATUTS = [
  'Déposé',
  'En diagnostic',
  'En réparation',
  'Pièces commandées',
  'Réparé',
  'Prêt à récupérer',
] as const

export type Statut = typeof STATUTS[number]
