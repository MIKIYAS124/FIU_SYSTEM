interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isActive ? "bg-blue-600 text-white" : ""}
                ${isCompleted ? "bg-green-600 text-white" : ""}
                ${!isActive && !isCompleted ? "bg-gray-200 text-gray-600" : ""}
              `}
            >
              {stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div
                className={`
                  w-12 h-0.5 mx-2
                  ${isCompleted ? "bg-green-600" : "bg-gray-200"}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
