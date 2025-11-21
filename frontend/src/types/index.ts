export interface User {
  id: string
  email: string
  name: string | null
  preferredTone: string
}

export interface MediaOutlet {
  id: string
  name: string
  type: string | null
  complaintEmail: string | null
  complaintUrl: string | null
  notes: string | null
}

export interface Incident {
  id: string
  outletId: string
  date: string
  time: string | null
  programName: string | null
  presenterName: string | null
  description: string
  mediaUrl: string | null
  infractionType: string | null
  createdById: string | null
  createdAt: string
  outlet: MediaOutlet
  _count?: {
    complaints: number
  }
}

export interface Complaint {
  id: string
  incidentId: string
  userId: string
  letterContent: string
  sentAt: string | null
  sentTo: string | null
  status: 'draft' | 'sent' | 'response_received'
  responseText: string | null
  createdAt: string
  incident?: Incident
}

export type InfractionType = 'household_analogy' | 'debt_scare' | 'insolvency_myth' | 'other'

export const INFRACTION_TYPES: { value: InfractionType; label: string }[] = [
  { value: 'household_analogy', label: 'Household Budget Analogy' },
  { value: 'debt_scare', label: 'Debt Scare Mongering' },
  { value: 'insolvency_myth', label: 'Government Insolvency Myth' },
  { value: 'other', label: 'Other Economic Misinformation' },
]

export const PREFERRED_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'academic', label: 'Academic' },
  { value: 'passionate', label: 'Passionate Citizen' },
]
