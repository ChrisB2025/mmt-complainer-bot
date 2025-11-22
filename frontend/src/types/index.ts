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
  complaintCount?: number
  avgSeverityRating?: number | null
}

export interface Complaint {
  id: string
  incidentId: string
  userId: string
  letterContent: string
  severityRating: number | null
  sentAt: string | null
  sentTo: string | null
  status: 'draft' | 'sent' | 'response_received'
  responseText: string | null
  createdAt: string
  incident?: Incident
}

export interface LeaderboardEntry {
  presenter?: string
  outlet?: string
  outletType?: string
  outlets?: string[]
  incidentCount: number
  complaintCount: number
  avgSeverityRating: number | null
}

export interface PlatformStats {
  totalIncidents: number
  totalComplaints: number
  totalUsers: number
  totalOutlets: number
  sentComplaints: number
  draftComplaints: number
  avgSeverityRating: number | null
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

export interface OutletSuggestion {
  id: string
  outletName: string
  outletType: string | null
  websiteUrl: string | null
  suggestedBy: string | null
  additionalInfo: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}
