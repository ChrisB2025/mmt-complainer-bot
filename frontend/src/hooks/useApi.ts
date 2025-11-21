import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import type { Incident, MediaOutlet, Complaint } from '../types'

// Incidents
export function useIncidents(params?: {
  outletId?: string
  presenterName?: string
  infractionType?: string
  page?: number
}) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: async () => {
      const { data } = await api.get('/incidents', { params })
      return data as {
        incidents: Incident[]
        pagination: { page: number; limit: number; total: number; pages: number }
      }
    },
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const { data } = await api.get(`/incidents/${id}`)
      return data.incident as Incident
    },
    enabled: !!id,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (incident: {
      outletId: string
      date: string
      time?: string
      programName?: string
      presenterName?: string
      description: string
      mediaUrl?: string
      infractionType?: string
    }) => {
      const { data } = await api.post('/incidents', incident)
      return data.incident as Incident
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })
}

// Outlets
export function useOutlets() {
  return useQuery({
    queryKey: ['outlets'],
    queryFn: async () => {
      const { data } = await api.get('/outlets')
      return data.outlets as MediaOutlet[]
    },
  })
}

// Complaints
export function useComplaints() {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data } = await api.get('/complaints')
      return data.complaints as Complaint[]
    },
  })
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const { data } = await api.get(`/complaints/${id}`)
      return data.complaint as Complaint
    },
    enabled: !!id,
  })
}

export function useGenerateLetter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (incidentId: string) => {
      const { data } = await api.post('/generate-letter', { incidentId })
      return data as { complaint: Complaint; outlet: MediaOutlet }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
    },
  })
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      letterContent,
    }: {
      id: string
      letterContent: string
    }) => {
      const { data } = await api.put(`/complaints/${id}`, { letterContent })
      return data.complaint as Complaint
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
    },
  })
}

export function useSendComplaint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/complaints/${id}/send`)
      return data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] })
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
    },
  })
}

export function useRegenerateLetter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (complaintId: string) => {
      const { data } = await api.post(`/generate-letter/regenerate/${complaintId}`)
      return data.complaint as Complaint
    },
    onSuccess: (_, complaintId) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] })
    },
  })
}

// Auth
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', credentials)
      return data as { token: string; user: { id: string; email: string; name: string | null; preferredTone: string } }
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async (userData: {
      email: string
      password: string
      name?: string
      preferredTone?: string
    }) => {
      const { data } = await api.post('/auth/register', userData)
      return data as { token: string; user: { id: string; email: string; name: string | null; preferredTone: string } }
    },
  })
}
