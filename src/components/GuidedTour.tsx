import { useEffect, useState } from 'react'

type TourStep = {
  title: string
  description: string
}

const steps: TourStep[] = [
  {
    title: 'Welcome to AI Assistant',
    description:
      'This guided tour will show you the main features of the application.',
  },

  {
    title: 'Start a New Chat',
    description:
      'Use the New Chat button to create a fresh conversation with the AI assistant.',
  },

  {
    title: 'Conversation History',
    description:
      'Previous conversations are saved automatically. Select any conversation from the sidebar to resume it.',
  },

  {
    title: 'Streaming AI Responses',
    description:
      'Responses are streamed from Gemini using Server-Sent Events, so text appears progressively while it is generated.',
  },

  {
    title: 'Response Actions',
    description:
      'You can regenerate answers, switch between response versions, submit feedback, view metadata, and inspect citations.',
  },

  {
    title: 'You Are Ready',
    description:
      'Send a message to start using the AI assistant.',
  },
]

export function GuidedTour() {
  const [isOpen, setIsOpen] =
    useState(false)

  const [currentStep, setCurrentStep] =
    useState(0)

  useEffect(() => {
    const completed =
      localStorage.getItem(
        'guidedTourCompleted'
      )

    if (!completed) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (
      currentStep <
      steps.length - 1
    ) {
      setCurrentStep(
        (previous) =>
          previous + 1
      )

      return
    }

    finishTour()
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(
        (previous) =>
          previous - 1
      )
    }
  }

  const finishTour = () => {
    localStorage.setItem(
      'guidedTourCompleted',
      'true'
    )

    setIsOpen(false)
    setCurrentStep(0)
  }

  const restartTour = () => {
    setCurrentStep(0)
    setIsOpen(true)
  }

  const step =
    steps[currentStep]

  return (
    <>
      <button
        onClick={restartTour}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-gray-800"
        title="Start guided tour"
      >
        ? Tour
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-4 flex items-center justify-between">

              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>

              <button
                onClick={finishTour}
                className="text-sm text-gray-400 hover:text-black"
              >
                Skip
              </button>

            </div>

            <div className="mb-5 flex gap-1.5">

              {steps.map(
                (_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full ${
                      index <=
                      currentStep
                        ? 'bg-black'
                        : 'bg-gray-200'
                    }`}
                  />
                )
              )}

            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              {step.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {step.description}
            </p>

            <div className="mt-7 flex items-center justify-between">

              <button
                onClick={handlePrevious}
                disabled={
                  currentStep === 0
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                {currentStep ===
                steps.length - 1
                  ? 'Finish'
                  : 'Next'}
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  )
}