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
import { IconFileInvoice } from '@tabler/icons-react';

import type { TreasuryEligibleInvoice } from '../types/treasury.types';

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
            <TableCell align="right"><FormattedMessage id="outstanding-amount" defaultMessage="المتبقي" /></TableCell>
            <TableCell align="right" width={180}><FormattedMessage id="allocated-amount" defaultMessage="المبلغ المخصص" /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((row) => (
            <TableRow key={row.invoiceId} hover>
              <TableCell>{row.invoiceNumber}</TableCell>
              <TableCell>{row.invoiceDate}</TableCell>
              <TableCell align="right">{row.grandTotal.toFixed(2)}</TableCell>
              <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>{row.outstandingAmount.toFixed(2)}</TableCell>
              <TableCell align="right">
                {readOnly ? (
                  <Typography variant="body2" fontWeight={600}>
                    {row.allocatedAmount.toFixed(2)}
                  </Typography>
                ) : (
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
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
