import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="planner-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
        &larr; Back to Home
      </Link>
    </div>
  );
}
