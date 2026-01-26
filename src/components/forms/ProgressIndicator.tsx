type Step = 'business' | 'contact' | 'credentials';

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: Step;
}

const STEP_LABELS: Record<Step, string> = {
  business: 'Business Info',
  contact: 'Contact',
  credentials: 'Account',
};

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="progress-indicator">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="progress-step-wrapper">
            <div
              className={`progress-step ${isCompleted ? 'progress-step--completed' : ''} ${
                isCurrent ? 'progress-step--current' : ''
              }`}
            >
              <div className="progress-step__number">
                {isCompleted ? '\u2713' : index + 1}
              </div>
              <div className="progress-step__label">{STEP_LABELS[step]}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`progress-connector ${
                  isCompleted ? 'progress-connector--completed' : ''
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
