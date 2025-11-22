import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <span className="text-xl font-bold">MMT Accountability</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-primary-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
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

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              <Link
                to="/incidents"
                className="block py-2 px-4 hover:bg-primary-600 rounded transition-colors"
                onClick={closeMobileMenu}
              >
                Incidents
              </Link>
              <Link
                to="/leaderboard"
                className="block py-2 px-4 hover:bg-primary-600 rounded transition-colors"
                onClick={closeMobileMenu}
              >
                🏆 Leaderboard
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/incidents/new"
                    className="block py-2 px-4 hover:bg-primary-600 rounded transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Report Incident
                  </Link>
                  <Link
                    to="/my-complaints"
                    className="block py-2 px-4 hover:bg-primary-600 rounded transition-colors"
                    onClick={closeMobileMenu}
                  >
                    My Complaints
                  </Link>
                  <div className="py-2 px-4 text-primary-200 text-sm">
                    {user?.name || user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 px-4 hover:bg-primary-600 rounded transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 px-4 hover:bg-primary-600 rounded transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 px-4 hover:bg-primary-600 rounded transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          )}
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
