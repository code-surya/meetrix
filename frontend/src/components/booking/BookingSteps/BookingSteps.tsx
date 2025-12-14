import './BookingSteps.css';

interface Step {
  number: number;
  title: string;
  completed: boolean;
}

interface BookingStepsProps {
  currentStep: number;
  steps: Step[];
}

const BookingSteps = ({ currentStep, steps }: BookingStepsProps) => {
  return (
    <div className="booking-steps">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={`step-item ${step.completed ? 'completed' : ''} ${
            currentStep === step.number ? 'active' : ''
          } ${currentStep > step.number ? 'completed' : ''}`}
        >
          <div className="step-number">
            {step.completed ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16.667 5L7.5 14.167L3.333 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span>{step.number}</span>
            )}
          </div>
          <div className="step-content">
            <div className="step-title">{step.title}</div>
          </div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );
};

export default BookingSteps;

