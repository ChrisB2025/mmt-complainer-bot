import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  useComplaint,
  useUpdateComplaint,
  useSendComplaint,
  useRegenerateLetter,
} from '../hooks/useApi'

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')

  const { data: complaint, isLoading, error, refetch } = useComplaint(id!)
  const updateComplaint = useUpdateComplaint()
  const sendComplaint = useSendComplaint()
  const regenerateLetter = useRegenerateLetter()

  const handleStartEdit = () => {
    setEditedContent(complaint?.letterContent || '')
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      await updateComplaint.mutateAsync({
        id: id!,
        letterContent: editedContent,
      })
      toast.success('Letter saved')
      setIsEditing(false)
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save')
    }
  }

  const handleRegenerate = async () => {
    if (!confirm('This will replace your current letter. Continue?')) return

    try {
      await regenerateLetter.mutateAsync(id!)
      toast.success('Letter regenerated')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to regenerate')
    }
  }

  const handleSend = async () => {
    // Check if letter still contains placeholder
    if (complaint?.letterContent.includes('[Your name]')) {
      toast.error('Please edit the letter to replace "[Your name]" with your actual name before sending.')
      setIsEditing(true)
      setEditedContent(complaint?.letterContent || '')
      return
    }

    if (
      !confirm(
        `Send this complaint to ${complaint?.incident?.outlet.complaintEmail}?`
      )
    )
      return

    try {
      await sendComplaint.mutateAsync(id!)
      toast.success('Complaint sent successfully!')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send complaint')
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(complaint?.letterContent || '')
    toast.success('Letter copied to clipboard')
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading complaint...</div>
  }

  if (error || !complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Complaint not found</p>
        <Link to="/my-complaints" className="btn btn-primary">
          Back to My Complaints
        </Link>
      </div>
    )
  }

  const incident = complaint.incident
  const outlet = incident?.outlet
  const isSent = complaint.status === 'sent'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/my-complaints" className="text-primary-600 hover:underline">
        &larr; Back to My Complaints
      </Link>

      {/* Status Banner */}
      {isSent ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">
            Complaint sent on{' '}
            {format(new Date(complaint.sentAt!), 'dd MMMM yyyy')} to{' '}
            {complaint.sentTo}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700 font-medium">
              Draft - Not yet sent. Review and edit your letter below.
            </p>
          </div>
          {complaint.letterContent.includes('[Your name]') && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
              <p className="text-orange-800 font-medium">
                ⚠️ Action Required: Please edit the letter below to replace "[Your name]" with your actual name before sending.
              </p>
            </div>
          )}
        </>
      )}

      {/* Incident Summary */}
      <div className="card bg-gray-50">
        <h2 className="font-semibold mb-3">Incident Details</h2>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          <p>
            <span className="text-gray-500">Outlet:</span> {outlet?.name}
          </p>
          <p>
            <span className="text-gray-500">Program:</span>{' '}
            {incident?.programName || 'N/A'}
          </p>
          <p>
            <span className="text-gray-500">Date:</span>{' '}
            {incident && format(new Date(incident.date), 'dd MMM yyyy')}
          </p>
          {incident?.presenterName && (
            <p>
              <span className="text-gray-500">Presenter:</span>{' '}
              {incident.presenterName}
            </p>
          )}
        </div>
        <Link
          to={`/incidents/${incident?.id}`}
          className="text-primary-600 text-sm hover:underline mt-2 inline-block"
        >
          View full incident details &rarr;
        </Link>
      </div>

      {/* Letter Content */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Complaint Letter</h2>
          {!isSent && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="btn btn-primary text-sm"
                    disabled={updateComplaint.isPending}
                  >
                    {updateComplaint.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="btn btn-secondary text-sm"
                  >
                    Edit Letter
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="btn btn-secondary text-sm"
                    disabled={regenerateLetter.isPending}
                  >
                    {regenerateLetter.isPending ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="input min-h-[400px] font-mono text-sm"
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm">
            {complaint.letterContent}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="card">
        <h2 className="font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleCopyToClipboard} className="btn btn-secondary">
            Copy to Clipboard
          </button>

          {outlet?.complaintUrl && (
            <a
              href={outlet.complaintUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Open Complaints Portal
            </a>
          )}

          {!isSent && outlet?.complaintEmail && (
            <button
              onClick={handleSend}
              className="btn btn-primary"
              disabled={sendComplaint.isPending}
            >
              {sendComplaint.isPending
                ? 'Sending...'
                : `Send to ${outlet.complaintEmail}`}
            </button>
          )}
        </div>

        {!outlet?.complaintEmail && !isSent && (
          <p className="text-yellow-600 text-sm mt-4">
            No email address configured for this outlet. Please use the complaints
            portal or copy the letter manually.
          </p>
        )}
      </div>
    </div>
  )
}
