import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconArrowsLeftRight,
  IconRefresh,
  IconWallet
} from '@tabler/icons-react';

import type { TreasuryMovement } from '../types/treasury.types';
import { formatTreasuryMoney } from '../utils/treasury.format';

function getMovementPresentation(movementType: string) {
  switch (movementType.toLowerCase()) {
    case 'openingbalance':
      return { label: 'Opening Balance', icon: <IconWallet size={14} />, color: 'primary' as const };
    case 'receipt':
      return { label: 'Receipt', icon: <IconArrowDownLeft size={14} />, color: 'success' as const };
    case 'manualcashin':
      return { label: 'Cash In', icon: <IconArrowDownLeft size={14} />, color: 'success' as const };
    case 'receiptreversal':
      return { label: 'Receipt Reversal', icon: <IconRefresh size={14} />, color: 'error' as const };
    case 'payment':
      return { label: 'Payment', icon: <IconArrowUpRight size={14} />, color: 'error' as const };
    case 'manualcashout':
      return { label: 'Cash Out', icon: <IconArrowUpRight size={14} />, color: 'error' as const };
    case 'paymentreversal':
      return { label: 'Payment Reversal', icon: <IconRefresh size={14} />, color: 'success' as const };
    case 'transferin':
      return { label: 'Transfer In', icon: <IconArrowsLeftRight size={14} />, color: 'info' as const };
    case 'transferout':
      return { label: 'Transfer Out', icon: <IconArrowsLeftRight size={14} />, color: 'warning' as const };
    case 'transferreversalin':
      return { label: 'Transfer In Reversal', icon: <IconRefresh size={14} />, color: 'error' as const };
    case 'transferreversalout':
      return { label: 'Transfer Out Reversal', icon: <IconRefresh size={14} />, color: 'error' as const };
    default:
      return { label: movementType, icon: <IconArrowsLeftRight size={14} />, color: 'default' as const };
  }
}

function getReferenceLabel(referenceType: string, movementType: string) {
  const normalizedReferenceType = referenceType.toLowerCase();
  const normalizedMovementType = movementType.toLowerCase();

  if (normalizedMovementType === 'manualcashin') {
    return 'Cash In';
  }

  if (normalizedMovementType === 'manualcashout') {
    return 'Cash Out';
  }

  switch (normalizedReferenceType) {
    case 'openingbalance':
      return 'Opening Balance';
    case 'openingbalancecorrection':
      return 'Opening Balance Correction';
    case 'manualmovement':
      return 'Manual Movement';
    case 'receiptvoucher':
      return 'Receipt Voucher';
    case 'receiptvouchercancellation':
      return 'Receipt Voucher Cancellation';
    case 'paymentvoucher':
      return 'Payment Voucher';
    case 'paymentvouchercancellation':
      return 'Payment Voucher Cancellation';
    case 'transfervoucher':
      return 'Transfer Voucher';
    case 'transfervouchercancellation':
      return 'Transfer Voucher Cancellation';
    default:
      return referenceType;
  }
}

function getReferencePresentation(movement: TreasuryMovement) {
  const sourceType = movement.sourceDocumentType?.toLowerCase();

  if (movement.movementType.toLowerCase() === 'manualcashin') {
    return { label: 'Cash In', route: null };
  }

  if (movement.movementType.toLowerCase() === 'manualcashout') {
    return { label: 'Cash Out', route: null };
  }

  if (sourceType === 'expense' && movement.sourceDocumentId) {
    return { label: 'Expense', route: `/expenses/${movement.sourceDocumentId}` };
  }

  if (sourceType === 'salesinvoice' && movement.sourceDocumentId) {
    return { label: 'Sales Invoice', route: `/sales/invoices/${movement.sourceDocumentId}` };
  }

  if (sourceType === 'purchaseinvoice' && movement.sourceDocumentId) {
    return { label: 'Purchase Invoice', route: `/purchases/invoices/${movement.sourceDocumentId}` };
  }

  switch (movement.referenceType.toLowerCase()) {
    case 'receiptvoucher':
    case 'receiptvouchercancellation':
      return { label: 'Receipt Voucher', route: movement.referenceId ? `/treasury/receipts/${movement.referenceId}` : null };
    case 'paymentvoucher':
    case 'paymentvouchercancellation':
      return { label: 'Payment Voucher', route: movement.referenceId ? `/treasury/payments/${movement.referenceId}` : null };
    case 'transfervoucher':
    case 'transfervouchercancellation':
      return { label: 'Transfer Voucher', route: movement.referenceId ? `/treasury/transfers/${movement.referenceId}` : null };
    case 'openingbalance':
      return { label: 'Opening Balance', route: null };
    case 'openingbalancecorrection':
      return { label: 'Opening Balance Correction', route: null };
    case 'manualmovement':
      return { label: 'Manual Movement', route: null };
    default:
      return { label: getReferenceLabel(movement.referenceType, movement.movementType), route: null };
  }
}

function getReferenceRoute(referenceType: string, referenceId: string | null) {
  if (!referenceId) return null;

  switch (referenceType.toLowerCase()) {
    case 'receiptvoucher':
    case 'receiptvouchercancellation':
      return `/treasury/receipts/${referenceId}`;
    case 'paymentvoucher':
    case 'paymentvouchercancellation':
      return `/treasury/payments/${referenceId}`;
    case 'transfervoucher':
    case 'transfervouchercancellation':
      return `/treasury/transfers/${referenceId}`;
    default:
      return null;
  }
}

interface Props {
  movements: TreasuryMovement[];
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  currencyCode?: string;
}

export default function TreasuryMovementTable({ movements, page, totalPages, onPageChange, isLoading, currencyCode }: Props) {
  if (!movements || movements.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
        <IconArrowsLeftRight size={48} color="var(--mui-palette-text-disabled)" />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          <FormattedMessage id="no-movements-found" defaultMessage="No movements found." />
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, opacity: isLoading ? 0.6 : 1 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><FormattedMessage id="date" defaultMessage="Date" /></TableCell>
              <TableCell><FormattedMessage id="movement-number" defaultMessage="Movement Number" /></TableCell>
              <TableCell><FormattedMessage id="movement-type" defaultMessage="Movement Type" /></TableCell>
              <TableCell><FormattedMessage id="related-document" defaultMessage="Related Document" /></TableCell>
              <TableCell><FormattedMessage id="description" defaultMessage="Description" /></TableCell>
              <TableCell align="right"><FormattedMessage id="inbound" defaultMessage="Inbound" /></TableCell>
              <TableCell align="right"><FormattedMessage id="outbound" defaultMessage="Outbound" /></TableCell>
              <TableCell align="right"><FormattedMessage id="running-balance" defaultMessage="Running Balance" /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((row) => {
              const relatedDocument = getReferencePresentation(row);
              const route = relatedDocument.route ?? getReferenceRoute(row.referenceType, row.referenceId);
              const movement = getMovementPresentation(row.movementType);

              return (
                <TableRow key={row.id} hover sx={{ bgcolor: row.isReversal ? 'error.lighter' : 'inherit' }}>
                  <TableCell>{row.movementDate}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.referenceNumber || '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" color={movement.color} icon={movement.icon} label={movement.label} />
                  </TableCell>
                  <TableCell>
                    {route ? (
                      <Button component={Link} to={route} size="small" variant="text" sx={{ px: 0, minWidth: 0, textTransform: 'none' }}>
                        {relatedDocument.label}
                      </Button>
                    ) : (
                      <Typography variant="body2" fontWeight={500}>
                        {relatedDocument.label}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" noWrap title={row.descriptionArabic}>
                      {row.descriptionArabic}
                    </Typography>
                    {row.isReversal && (
                      <Typography variant="caption" color="error.main" display="block">
                        <FormattedMessage id="reversed" defaultMessage="Reversed" />
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                    {row.debitAmount > 0 ? formatTreasuryMoney(row.debitAmount, currencyCode) : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                    {row.creditAmount > 0 ? formatTreasuryMoney(row.creditAmount, currencyCode) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack spacing={0.25} alignItems="flex-end">
                      <Typography variant="body2" fontWeight={700}>
                        {formatTreasuryMoney(row.balanceAfter, currencyCode)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.balanceNature === 'Debit' ? 'Debit' : row.balanceNature === 'Credit' ? 'Credit' : 'Settled'}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => onPageChange?.(value)}
            color="primary"
            disabled={isLoading}
          />
        </Box>
      )}
    </Box>
  );
}
