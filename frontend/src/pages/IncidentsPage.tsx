import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useIncidents, useOutlets } from '../hooks/useApi'
import { useAuthStore } from '../store/auth.store'
import { INFRACTION_TYPES } from '../types'

export default function IncidentsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [filters, setFilters] = useState({
    outletId: '',
    infractionType: '',
    page: 1,
  })

  const { data, isLoading, error } = useIncidents(filters)
  const { data: outlets } = useOutlets()

  const updateFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading incidents</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reported Incidents</h1>
        {isAuthenticated && (
          <Link to="/incidents/new" className="btn btn-primary">
            Report New Incident
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Media Outlet</label>
            <select
              className="input"
              value={filters.outletId}
              onChange={(e) => updateFilter('outletId', e.target.value)}
            >
              <option value="">All Outlets</option>
              {outlets?.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Infraction Type</label>
            <select
              className="input"
              value={filters.infractionType}
              onChange={(e) => updateFilter('infractionType', e.target.value)}
            >
              <option value="">All Types</option>
              {INFRACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="text-center py-12">Loading incidents...</div>
      ) : data?.incidents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No incidents found</p>
          {isAuthenticated && (
            <Link to="/incidents/new" className="btn btn-primary">
              Report the first incident
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.incidents.map((incident) => (
            <Link
              key={incident.id}
              to={`/incidents/${incident.id}`}
              className="card block hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg">
                      {incident.outlet.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {incident.programName || 'Unknown Program'}
                    </span>
                  </div>
                  <p className="text-gray-700 line-clamp-2 mb-2">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {format(new Date(incident.date), 'dd MMM yyyy')}
                      {incident.time && ` at ${incident.time}`}
                    </span>
                    {incident.presenterName && (
                      <span>Presenter: {incident.presenterName}</span>
                    )}
                    {incident.infractionType && (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                        {
                          INFRACTION_TYPES.find(
                            (t) => t.value === incident.infractionType
                          )?.label
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className="text-primary-600 font-medium">
                    {incident._count?.complaints || 0} complaints
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            className="btn btn-secondary"
            disabled={filters.page === 1}
            onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {filters.page} of {data.pagination.pages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={filters.page === data.pagination.pages}
            onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
