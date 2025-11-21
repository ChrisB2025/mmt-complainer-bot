import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLeaderboard, usePlatformStats } from '../hooks/useApi'

export default function LeaderboardPage() {
  const [groupBy, setGroupBy] = useState<'presenter' | 'outlet'>('presenter')
  const { data, isLoading } = useLeaderboard(groupBy)
  const { data: stats, isLoading: statsLoading } = usePlatformStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Worst Offenders League Table</h1>
        <p className="text-gray-600">
          Rankings based on number of complaints and severity ratings from the community
        </p>
      </div>

      {/* Platform Statistics */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600">Total Incidents</p>
            <p className="text-2xl font-bold text-blue-700">{stats.totalIncidents}</p>
          </div>
          <div className="card bg-green-50">
            <p className="text-sm text-gray-600">Total Complaints</p>
            <p className="text-2xl font-bold text-green-700">{stats.totalComplaints}</p>
          </div>
          <div className="card bg-purple-50">
            <p className="text-sm text-gray-600">Complaints Sent</p>
            <p className="text-2xl font-bold text-purple-700">{stats.sentComplaints}</p>
          </div>
          <div className="card bg-orange-50">
            <p className="text-sm text-gray-600">Avg Severity</p>
            <p className="text-2xl font-bold text-orange-700">
              {stats.avgSeverityRating ? `${stats.avgSeverityRating}/10` : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Group By Toggle */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy('presenter')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              groupBy === 'presenter'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Presenter
          </button>
          <button
            onClick={() => setGroupBy('outlet')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              groupBy === 'outlet'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Outlet
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="text-center py-12">Loading leaderboard...</div>
      ) : data?.leaderboard && data.leaderboard.length > 0 ? (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                  Rank
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                  {groupBy === 'presenter' ? 'Presenter' : 'Outlet'}
                </th>
                {groupBy === 'presenter' && (
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                    Outlets
                  </th>
                )}
                {groupBy === 'outlet' && (
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                    Type
                  </th>
                )}
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                  Incidents
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                  Complaints
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                  Avg Severity
                </th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.map((entry, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-gray-50 ${
                    index < 3 ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="py-3 px-2">
                    <span
                      className={`font-bold text-lg ${
                        index === 0
                          ? 'text-yellow-600'
                          : index === 1
                          ? 'text-gray-500'
                          : index === 2
                          ? 'text-orange-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-medium">
                    {entry.presenter || entry.outlet}
                  </td>
                  {groupBy === 'presenter' && (
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {entry.outlets?.join(', ')}
                    </td>
                  )}
                  {groupBy === 'outlet' && (
                    <td className="py-3 px-2 text-sm text-gray-600 capitalize">
                      {entry.outletType}
                    </td>
                  )}
                  <td className="py-3 px-2 text-gray-700">{entry.incidentCount}</td>
                  <td className="py-3 px-2 font-semibold text-primary-600">
                    {entry.complaintCount}
                  </td>
                  <td className="py-3 px-2">
                    {entry.avgSeverityRating ? (
                      <span className="font-bold text-orange-600">
                        {entry.avgSeverityRating}/10
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No data available yet</p>
          <Link to="/incidents/new" className="btn btn-primary">
            Report the first incident
          </Link>
        </div>
      )}

      <div className="card bg-gray-50">
        <h2 className="font-semibold mb-2">How Rankings Work</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Rankings are based primarily on the number of complaints submitted</li>
          <li>• Average severity rating (1-10) from users is shown as a secondary metric</li>
          <li>• All data is aggregated from community submissions</li>
          <li>• Individual complaint letters remain private to each user</li>
        </ul>
      </div>
    </div>
  )
}
