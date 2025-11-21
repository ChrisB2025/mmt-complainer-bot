import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useComplaints } from '../hooks/useApi'

export default function MyComplaintsPage() {
  const { data: complaints, isLoading, error } = useComplaints()

  if (isLoading) {
    return <div className="text-center py-12">Loading complaints...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading complaints</p>
      </div>
    )
  }

  const drafts = complaints?.filter((c) => c.status === 'draft') || []
  const sent = complaints?.filter((c) => c.status === 'sent') || []

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">My Complaints</h1>

      {/* Draft Complaints */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
          Draft Complaints ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <p className="text-gray-500">No draft complaints</p>
        ) : (
          <div className="space-y-3">
            {drafts.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaints/${complaint.id}`}
                className="card block hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {complaint.incident?.outlet.name} -{' '}
                      {complaint.incident?.programName || 'Unknown Program'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created {format(new Date(complaint.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    Draft
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Sent Complaints */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Sent Complaints ({sent.length})
        </h2>
        {sent.length === 0 ? (
          <p className="text-gray-500">No sent complaints yet</p>
        ) : (
          <div className="space-y-3">
            {sent.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaints/${complaint.id}`}
                className="card block hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {complaint.incident?.outlet.name} -{' '}
                      {complaint.incident?.programName || 'Unknown Program'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sent {format(new Date(complaint.sentAt!), 'dd MMM yyyy')} to{' '}
                      {complaint.sentTo}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Sent
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {complaints?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any complaints yet</p>
          <Link to="/incidents" className="btn btn-primary">
            Browse Incidents
          </Link>
        </div>
      )}
    </div>
  )
}
