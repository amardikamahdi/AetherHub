'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'

interface StepState {
  step: string
  status: string
  completed_at?: string
  notes?: string
}

interface ProgressStepsProps {
  assignmentId: string
  steps: StepState[]
  onStepComplete?: () => void
}

const STEP_LABELS: Record<string, string> = {
  absen: 'Absen',
  draft_storyline: 'Draft Storyline',
  input_link: 'Input Link',
  insight: 'Insight',
}

const STEP_ICONS: Record<string, string> = {
  absen: '📋',
  draft_storyline: '✍️',
  input_link: '🔗',
  insight: '💡',
}

export function ProgressSteps({ assignmentId, steps, onStepComplete }: ProgressStepsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  const completedCount = steps.filter((s) => s.status === 'completed').length
  const allComplete = completedCount === steps.length

  const getNextStep = () => {
    return steps.find((s) => s.status === 'pending')
  }

  const handleCompleteStep = async () => {
    const nextStep = getNextStep()
    if (!nextStep || isUpdating) return

    setIsUpdating(true)
    setError('')

    try {
      await apiClient.updateProgressStep(assignmentId, nextStep.step)
      onStepComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
    } finally {
      setIsUpdating(false)
    }
  }

  const nextStep = getNextStep()

  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-4">
        {steps.map((step, index) => (
          <div key={step.step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                step.status === 'completed'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}
            >
              {step.status === 'completed' ? '✓' : STEP_ICONS[step.step] || index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex gap-2 mb-4">
        {steps.map((step) => (
          <div key={step.step} className="flex-1 text-center">
            <p
              className={`text-xs font-medium ${
                step.status === 'completed' ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              {STEP_LABELS[step.step] || step.step}
            </p>
            {step.completed_at && (
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(step.completed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 mb-2">{error}</p>
      )}

      {/* Complete button */}
      {!allComplete && nextStep && (
        <button
          onClick={handleCompleteStep}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isUpdating ? 'Updating...' : `Complete: ${STEP_LABELS[nextStep.step] || nextStep.step}`}
        </button>
      )}

      {allComplete && (
        <p className="text-sm text-green-600 font-medium">✓ All steps completed</p>
      )}
    </div>
  )
}
