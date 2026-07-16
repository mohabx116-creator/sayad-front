import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import { IconFileInvoice } from '@tabler/icons-react';

import type { TreasuryEligibleInvoice } from '../types/treasury.types';
import { getTreasurySettlementStatusLabel } from '../utils/treasury.labels';

export interface TreasuryAllocationRow extends TreasuryEligibleInvoice {
  allocatedAmount: number;
}

interface Props {
  invoices: TreasuryAllocationRow[];
  onAllocationChange?: (invoiceId: string, amount: number) => void;
  maxTotalAllocation?: number;
  readOnly?: boolean;
}

export default function TreasuryAllocationTable({ invoices, onAllocationChange, maxTotalAllocation, readOnly = false }: Props) {
  if (!invoices.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
        <IconFileInvoice size={48} color="var(--mui-palette-text-disabled)" />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          <FormattedMessage id="treasury.no-eligible-invoices" defaultMessage="لا توجد فواتير مستحقة" />
        </Typography>
      </Box>
    );
  }

  const currentTotalAllocated = invoices.reduce((sum, row) => sum + row.allocatedAmount, 0);

  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell><FormattedMessage id="invoice-number" defaultMessage="رقم الفاتورة" /></TableCell>
            <TableCell><FormattedMessage id="invoice-date" defaultMessage="تاريخ الفاتورة" /></TableCell>
            <TableCell align="right"><FormattedMessage id="total" defaultMessage="الإجمالي" /></TableCell>
            <TableCell align="right"><FormattedMessage id="outstanding-amount" defaultMessage="المبلغ المتبقي" /></TableCell>
            <TableCell><FormattedMessage id="settlement-status" defaultMessage="حالة التسوية" /></TableCell>
            <TableCell align="right" width={180}><FormattedMessage id="allocated-amount" defaultMessage="المبلغ المخصص" /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((row) => {
            const allocationPercentage = row.outstandingAmount > 0
              ? Math.min(100, Math.max(0, (row.allocatedAmount / row.outstandingAmount) * 100))
              : 0;
            const isFullyAllocated = row.allocatedAmount >= row.outstandingAmount;

            return (
              <TableRow key={row.invoiceId} hover sx={{ bgcolor: isFullyAllocated ? 'success.lighter' : 'inherit' }}>
                <TableCell>{row.invoiceNumber}</TableCell>
                <TableCell>{row.invoiceDate}</TableCell>
                <TableCell align="right">{row.grandTotal.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="error.main" fontWeight={600}>{row.outstandingAmount.toFixed(2)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={isFullyAllocated ? 'success' : row.allocatedAmount > 0 ? 'primary' : 'default'}
                    label={getTreasurySettlementStatusLabel(row.allocatedAmount, row.outstandingAmount)}
                  />
                </TableCell>
                <TableCell align="right">
                  {readOnly ? (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={700} color={isFullyAllocated ? 'success.dark' : 'text.primary'}>
                        {row.allocatedAmount.toFixed(2)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={allocationPercentage}
                        color={isFullyAllocated ? 'success' : 'primary'}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        value={row.allocatedAmount || ''}
                        onChange={(event) => {
                          if (!onAllocationChange) {
                            return;
                          }

                          let value = Number(event.target.value);
                          if (Number.isNaN(value) || value < 0) {
                            value = 0;
                          }
                          if (value > row.outstandingAmount) {
                            value = row.outstandingAmount;
                          }

                          if (maxTotalAllocation !== undefined) {
                            const otherAllocations = currentTotalAllocated - row.allocatedAmount;
                            const available = maxTotalAllocation - otherAllocations;
                            if (value > available && available > 0) {
                              value = available;
                            }
                          }

                          onAllocationChange(row.invoiceId, value);
                        }}
                        inputProps={{ min: 0, max: row.outstandingAmount, step: 0.01 }}
                        placeholder="0.00"
                      />
                      <LinearProgress
                        variant="determinate"
                        value={allocationPercentage}
                        color={isFullyAllocated ? 'success' : 'primary'}
                        sx={{ height: 3, borderRadius: 2 }}
                      />
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
