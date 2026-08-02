import ErrorState from './ErrorState';

export default function ForbiddenPage() {
  return (
    <ErrorState
      status="403"
      title="Access forbidden"
      description="Your account does not have permission to open this page."
      actionLabel="Go back"
      actionTo="/dashboard"
    />
  );
}
