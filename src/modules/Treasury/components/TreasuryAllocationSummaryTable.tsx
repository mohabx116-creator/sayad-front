import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconFiles } from '@tabler/icons-react';

import type { TreasuryAllocation } from '../types/treasury.types';

interface Props {
  allocations: TreasuryAllocation[];
}

export default function TreasuryAllocationSummaryTable({ allocations }: Props) {
  if (!allocations.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
        <IconFiles size={48} color="var(--mui-palette-text-disabled)" />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          <FormattedMessage id="treasury.no-allocations" defaultMessage="لا توجد تخصيصات" />
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="allocation-type" defaultMessage="نوع التخصيص" /></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="source-document-type" defaultMessage="نوع المستند" /></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="reference-number" defaultMessage="المرجع" /></TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}><FormattedMessage id="amount" defaultMessage="المبلغ" /></TableCell>
            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="notes" defaultMessage="ملاحظات" /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allocations.map((allocation) => (
            <TableRow key={allocation.id} hover>
              <TableCell>{allocation.allocationTypeLabel}</TableCell>
              <TableCell>{allocation.sourceDocumentType ?? '-'}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {allocation.sourceDocumentNumber ?? '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={700} color="success.dark">
                  {allocation.amount.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>{allocation.notes ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
