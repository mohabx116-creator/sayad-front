import ErrorState from './ErrorState';

export default function UnauthorizedPage() {
  return (
    <ErrorState
      status="401"
      title="Authentication required"
      description="Please sign in again to continue."
      actionLabel="Sign in"
      actionTo="/login"
    />
  );
}
