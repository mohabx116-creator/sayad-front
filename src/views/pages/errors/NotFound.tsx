import ErrorState from './ErrorState';

export default function NotFoundPage() {
  return (
    <ErrorState
      status="404"
      title="Page not found"
      description="The page you requested does not exist or was moved."
      actionLabel="Go to dashboard"
      actionTo="/dashboard"
    />
  );
}
