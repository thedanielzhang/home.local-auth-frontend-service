import { BusinessRegistrationForm } from '../components/forms/BusinessRegistrationForm';

export function BusinessSignupPage() {
  return (
    <div className="page page--signup">
      <div className="page__container">
        <div className="page__intro">
          <h1>Register Your Business</h1>
          <p>
            Join Iriai to connect your business with apps serving your local community.
            After registration, your account will be reviewed and approved within 1-2 business days.
          </p>
        </div>
        <BusinessRegistrationForm />
      </div>
    </div>
  );
}
