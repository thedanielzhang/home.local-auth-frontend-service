import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

export function NotFoundPage() {
  return (
    <div className="page page--not-found">
      <div className="page__container">
        <Card className="not-found-card">
          <h1>Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <Link to="/business/signup" className="btn btn-primary">
            Go to Business Registration
          </Link>
        </Card>
      </div>
    </div>
  );
}
