import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCreateIncident, useOutlets } from '../hooks/useApi'
import { INFRACTION_TYPES } from '../types'

interface IncidentForm {
  outletId: string
  date: string
  time: string
  programName: string
  presenterName: string
  description: string
  mediaUrl: string
  infractionType: string
}

export default function CreateIncidentPage() {
  const navigate = useNavigate()
  const { data: outlets, isLoading: outletsLoading } = useOutlets()
  const createIncident = useCreateIncident()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncidentForm>()

  const onSubmit = async (data: IncidentForm) => {
    setIsSubmitting(true)
    try {
      const incident = await createIncident.mutateAsync({
        outletId: data.outletId,
        date: data.date,
        time: data.time || undefined,
        programName: data.programName || undefined,
        presenterName: data.presenterName || undefined,
        description: data.description,
        mediaUrl: data.mediaUrl || undefined,
        infractionType: data.infractionType || undefined,
      })
      toast.success('Incident reported successfully!')
      navigate(`/incidents/${incident.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create incident')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/incidents" className="text-primary-600 hover:underline">
        &larr; Back to Incidents
      </Link>

      <div className="card mt-4">
        <h1 className="text-2xl font-bold mb-6">Report an Incident</h1>
        <p className="text-gray-600 mb-6">
          Log an instance of economic misinformation in the media. Be as specific
          as possible - include dates, times, and exact quotes where available.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="label">Media Outlet *</label>
            <select
              className="input"
              {...register('outletId', { required: 'Please select an outlet' })}
              disabled={outletsLoading}
            >
              <option value="">Select an outlet...</option>
              {outlets?.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name} ({outlet.type})
                </option>
              ))}
            </select>
            {errors.outletId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.outletId.message}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                className="input"
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="label">Time (optional)</label>
              <input
                type="time"
                className="input"
                {...register('time')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Program Name (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., BBC Breakfast, Question Time"
                {...register('programName')}
              />
            </div>
            <div>
              <label className="label">Presenter Name (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., John Smith"
                {...register('presenterName')}
              />
            </div>
          </div>

          <div>
            <label className="label">Type of Infraction</label>
            <select className="input" {...register('infractionType')}>
              <option value="">Select type...</option>
              {INFRACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              className="input min-h-[150px]"
              placeholder="Describe what was said and why it is incorrect. Include direct quotes if possible. Be specific about the economic misinformation presented."
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters',
                },
              })}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">Media URL (optional)</label>
            <input
              type="url"
              className="input"
              placeholder="https://www.bbc.co.uk/iplayer/..."
              {...register('mediaUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL',
                },
              })}
            />
            {errors.mediaUrl && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mediaUrl.message}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Link to the video, article, or audio clip if available
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Report Incident'}
            </button>
            <Link to="/incidents" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
