import { Navigate } from 'react-router-dom';

export default function ExpensesHomePage() {
  return <Navigate to="/expenses/list" replace />;
}
