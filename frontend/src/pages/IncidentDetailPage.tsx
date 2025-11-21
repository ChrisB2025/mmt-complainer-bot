import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useIncident, useGenerateLetter } from '../hooks/useApi'
import { useAuthStore } from '../store/auth.store'
import { INFRACTION_TYPES } from '../types'

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [severityRating, setSeverityRating] = useState(7)

  const { data: incident, isLoading, error } = useIncident(id!)
  const generateLetter = useGenerateLetter()

  const handleGenerateLetter = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to generate a complaint letter')
      navigate('/login')
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateLetter.mutateAsync({ incidentId: id!, severityRating })
      toast.success('Letter generated successfully!')
      navigate(`/complaints/${result.complaint.id}`)
    } catch (error: any) {
      if (error.response?.data?.complaint) {
        // User already has a complaint for this incident
        toast.error('You already have a complaint for this incident')
        navigate(`/complaints/${error.response.data.complaint.id}`)
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate letter')
      }
    } finally {
      setIsGenerating(false)
      setShowRatingDialog(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading incident...</div>
  }

  if (error || !incident) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Incident not found</p>
        <Link to="/incidents" className="btn btn-primary">
          Back to Incidents
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/incidents" className="text-primary-600 hover:underline">
        &larr; Back to Incidents
      </Link>

      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{incident.outlet.name}</h1>
            <p className="text-gray-500">
              {incident.programName || 'Unknown Program'}
            </p>
          </div>
          {incident.infractionType && (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
              {
                INFRACTION_TYPES.find((t) => t.value === incident.infractionType)
                  ?.label
              }
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-gray-500">Date:</span>{' '}
            <span className="font-medium">
              {format(new Date(incident.date), 'EEEE, d MMMM yyyy')}
            </span>
          </div>
          {incident.time && (
            <div>
              <span className="text-gray-500">Time:</span>{' '}
              <span className="font-medium">{incident.time}</span>
            </div>
          )}
          {incident.presenterName && (
            <div>
              <span className="text-gray-500">Presenter:</span>{' '}
              <span className="font-medium">{incident.presenterName}</span>
            </div>
          )}
          {incident.mediaUrl && (
            <div>
              <span className="text-gray-500">Media Link:</span>{' '}
              <a
                href={incident.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                View Source
              </a>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-2">Description of Incident</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {incident.description}
          </p>
        </div>

        <div className="border-t pt-6">
          {incident.complaintCount !== undefined && incident.complaintCount > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>📊 Community Data:</strong> {incident.complaintCount} {incident.complaintCount === 1 ? 'complaint' : 'complaints'} submitted
                {incident.avgSeverityRating && ` • Avg severity: ${incident.avgSeverityRating}/10`}
              </p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">Generate Complaint Letter</h2>
              <p className="text-gray-500">
                Create a unique AI-generated complaint letter for this incident
              </p>
            </div>
            <button
              onClick={() => setShowRatingDialog(true)}
              disabled={isGenerating}
              className="btn btn-primary"
            >
              Generate My Complaint Letter
            </button>
          </div>
        </div>
      </div>

      {/* Severity Rating Dialog */}
      {showRatingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Rate This Infraction</h3>
            <p className="text-gray-600 mb-6">
              How serious do you consider this infraction to be?
            </p>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Minor</span>
                <span className="font-bold text-lg text-primary-600">{severityRating}/10</span>
                <span>Very Serious</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={severityRating}
                onChange={(e) => setSeverityRating(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateLetter}
                disabled={isGenerating}
                className="btn btn-primary flex-1"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">&#9696;</span>
                    Generating...
                  </>
                ) : (
                  'Generate Letter'
                )}
              </button>
              <button
                onClick={() => setShowRatingDialog(false)}
                disabled={isGenerating}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outlet Contact Info */}
      <div className="card bg-gray-50">
        <h2 className="font-semibold mb-3">Contact Information</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-500">Outlet:</span> {incident.outlet.name}
          </p>
          {incident.outlet.complaintEmail && (
            <p>
              <span className="text-gray-500">Complaints Email:</span>{' '}
              <a
                href={`mailto:${incident.outlet.complaintEmail}`}
                className="text-primary-600"
              >
                {incident.outlet.complaintEmail}
              </a>
            </p>
          )}
          {incident.outlet.complaintUrl && (
            <p>
              <span className="text-gray-500">Complaints Portal:</span>{' '}
              <a
                href={incident.outlet.complaintUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {incident.outlet.complaintUrl}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
