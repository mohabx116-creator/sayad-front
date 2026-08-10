import Chip from '@mui/material/Chip';

import type { CustomerMaterialDocumentStatus } from '../../types/customerMaterials.types';

export default function CustomerMaterialStatusChip({ status }: { status: CustomerMaterialDocumentStatus }) {
  switch (status) {
    case 'Posted':
      return <Chip size="small" color="success" label="Posted" />;
    case 'Cancelled':
      return <Chip size="small" color="default" variant="outlined" label="Cancelled" />;
    default:
      return <Chip size="small" color="warning" label="Draft" />;
  }
}
