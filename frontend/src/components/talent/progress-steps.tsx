'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Circle, ClipboardList, PenLine, Link2, Lightbulb } from 'lucide-react'

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

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  absen: ClipboardList,
  draft_storyline: PenLine,
  input_link: Link2,
  insight: Lightbulb,
}

export function ProgressSteps({ assignmentId, steps, onStepComplete }: ProgressStepsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  const completedCount = steps.filter((s) => s.status === 'completed').length
  const allComplete = completedCount === steps.length
  const progressPercent = Math.round((completedCount / steps.length) * 100)

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
    <div className="flex flex-col gap-4">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.step] || Circle
          const isCompleted = step.status === 'completed'
          return (
            <div key={step.step} className="flex items-center">
              <div className={`flex items-center justify-center size-10 rounded-full border-2 ${
                isCompleted
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-muted-foreground/20 bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels */}
      <div className="flex gap-2">
        {steps.map((step) => (
          <div key={step.step} className="flex-1 text-center">
            <p className={`text-xs font-medium ${
              step.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {STEP_LABELS[step.step] || step.step}
            </p>
            {step.completed_at && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(step.completed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} />

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Complete button */}
      {!allComplete && nextStep && (
        <Button onClick={handleCompleteStep} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : `Complete: ${STEP_LABELS[nextStep.step] || nextStep.step}`}
        </Button>
      )}

      {allComplete && (
        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
          <CheckCircle2 className="size-4" />
          All steps completed
        </p>
      )}
    </div>
  )
}
