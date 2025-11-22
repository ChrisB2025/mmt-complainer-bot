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

  const getShareUrl = () => {
    return window.location.href
  }

  const getShareText = () => {
    const outlet = incident?.outlet.name || 'a media outlet'
    const infraction = incident?.infractionType
      ? INFRACTION_TYPES.find((t) => t.value === incident.infractionType)?.label
      : 'economic misinformation'
    return `I just complained to ${outlet} about ${infraction} using the MMT Complainer Bot! Join me in holding media accountable for accurate economic reporting.`
  }

  const handleShareX = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getShareUrl())
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const handleShareBluesky = () => {
    const text = encodeURIComponent(getShareText() + '\n' + getShareUrl())
    window.open(`https://bsky.app/intent/compose?text=${text}`, '_blank')
  }

  const handleShareReddit = () => {
    const title = encodeURIComponent(`Complained to ${incident?.outlet.name} about economic misinformation`)
    const url = encodeURIComponent(getShareUrl())
    window.open(`https://reddit.com/submit?title=${title}&url=${url}`, '_blank')
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

      {/* Social Sharing Section */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <h2 className="font-semibold mb-3 text-gray-800">📣 Spread the Word</h2>
        <p className="text-gray-700 mb-4 text-sm">
          Share this incident on social media to raise awareness and encourage others to complain about economic misinformation!
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleShareX}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>
          <button
            onClick={handleShareBluesky}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
            </svg>
            Share on Bluesky
          </button>
          <button
            onClick={handleShareReddit}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
            Share on Reddit
          </button>
        </div>
      </div>

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
