import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MMT Media Accountability Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Hold media outlets accountable for economic misinformation. Log incidents
          of incorrect household budget analogies for government finances, generate
          unique complaint letters, and send them directly to broadcasters.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/incidents" className="btn btn-primary text-lg px-6 py-3">
            Browse Incidents
          </Link>
          {isAuthenticated ? (
            <Link
              to="/incidents/new"
              className="btn btn-secondary text-lg px-6 py-3"
            >
              Report an Incident
            </Link>
          ) : (
            <Link to="/register" className="btn btn-secondary text-lg px-6 py-3">
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="font-semibold mb-2">Log an Incident</h3>
            <p className="text-gray-600 text-sm">
              Record when you see economic misinformation - the outlet, date, program,
              and what was said.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-semibold mb-2">Generate Letter</h3>
            <p className="text-gray-600 text-sm">
              Our AI generates a unique, professional complaint letter citing MMT
              principles and journalism standards.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold mb-2">Review & Edit</h3>
            <p className="text-gray-600 text-sm">
              Review the generated letter and make any personal edits or additions
              you'd like.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h3 className="font-semibold mb-2">Send Complaint</h3>
            <p className="text-gray-600 text-sm">
              Send directly to the outlet's complaints team. Multiple people can
              complain about the same incident.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Why This Matters</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Currency-issuing governments cannot "run out of money" in their own
              currency
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Household budget analogies mislead the public about government fiscal
              capacity
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Misinformation shapes policy debates and electoral outcomes
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              Media outlets have editorial obligations to accuracy
            </li>
          </ul>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-4">What We Track</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">!</span>
              <strong>Household Analogies:</strong> "The government must balance its
              books like a household"
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">!</span>
              <strong>Debt Scares:</strong> "Future generations will have to pay back
              the national debt"
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">!</span>
              <strong>Insolvency Myths:</strong> "The government could go bankrupt"
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
