import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">MMT Accountability</span>
            </Link>

            <nav className="flex items-center space-x-4">
              <Link
                to="/incidents"
                className="hover:text-primary-200 transition-colors"
              >
                Incidents
              </Link>
              <Link
                to="/leaderboard"
                className="hover:text-primary-200 transition-colors"
              >
                🏆 Leaderboard
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/incidents/new"
                    className="hover:text-primary-200 transition-colors"
                  >
                    Report Incident
                  </Link>
                  <Link
                    to="/my-complaints"
                    className="hover:text-primary-200 transition-colors"
                  >
                    My Complaints
                  </Link>
                  <span className="text-primary-200 text-sm">
                    {user?.name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-primary-200">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-secondary text-sm">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            MMT Media Accountability Platform - Promoting accurate economic reporting
          </p>
        </div>
      </footer>
    </div>
  )
}
