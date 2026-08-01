import { Navigate, useParams } from 'react-router-dom';

export default function PartyStatementPage() {
  const { id } = useParams();

  return <Navigate to={id ? `/parties/${id}` : '/parties'} replace />;
}
