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
      return { label: 'رصيد افتتاحي', icon: <IconWallet size={14} />, color: 'primary' as const };
    case 'receipt':
      return { label: 'قبض', icon: <IconArrowDownLeft size={14} />, color: 'success' as const };
    case 'receiptreversal':
      return { label: 'إلغاء قبض', icon: <IconRefresh size={14} />, color: 'error' as const };
    case 'payment':
      return { label: 'صرف', icon: <IconArrowUpRight size={14} />, color: 'error' as const };
    case 'paymentreversal':
      return { label: 'إلغاء صرف', icon: <IconRefresh size={14} />, color: 'success' as const };
    case 'transferin':
      return { label: 'تحويل وارد', icon: <IconArrowsLeftRight size={14} />, color: 'info' as const };
    case 'transferout':
      return { label: 'تحويل صادر', icon: <IconArrowsLeftRight size={14} />, color: 'warning' as const };
    case 'transferreversalin':
      return { label: 'إلغاء تحويل وارد', icon: <IconRefresh size={14} />, color: 'error' as const };
    case 'transferreversalout':
      return { label: 'إلغاء تحويل صادر', icon: <IconRefresh size={14} />, color: 'error' as const };
    default:
      return { label: movementType, icon: <IconArrowsLeftRight size={14} />, color: 'default' as const };
  }
}

function getReferenceLabel(referenceType: string) {
  switch (referenceType.toLowerCase()) {
    case 'openingbalance':
      return 'رصيد افتتاحي';
    case 'openingbalancecorrection':
      return 'تصحيح رصيد افتتاحي';
    case 'receiptvoucher':
      return 'سند قبض';
    case 'receiptvouchercancellation':
      return 'إلغاء سند قبض';
    case 'paymentvoucher':
      return 'سند صرف';
    case 'paymentvouchercancellation':
      return 'إلغاء سند صرف';
    case 'transfervoucher':
      return 'تحويل بين حسابات الخزينة';
    case 'transfervouchercancellation':
      return 'إلغاء تحويل';
    default:
      return referenceType;
  }
}

function getReferencePresentation(movement: TreasuryMovement) {
  const sourceType = movement.sourceDocumentType?.toLowerCase();

  if (sourceType === 'expense' && movement.sourceDocumentId) {
    return { label: 'مصروف', route: `/expenses/${movement.sourceDocumentId}` };
  }

  if (sourceType === 'salesinvoice' && movement.sourceDocumentId) {
    return { label: 'فاتورة بيع', route: `/sales/invoices/${movement.sourceDocumentId}` };
  }

  if (sourceType === 'purchaseinvoice' && movement.sourceDocumentId) {
    return { label: 'فاتورة شراء', route: `/purchases/invoices/${movement.sourceDocumentId}` };
  }

  switch (movement.referenceType.toLowerCase()) {
    case 'receiptvoucher':
    case 'receiptvouchercancellation':
      return { label: 'سند قبض', route: movement.referenceId ? `/treasury/receipts/${movement.referenceId}` : null };
    case 'paymentvoucher':
    case 'paymentvouchercancellation':
      return { label: 'سند صرف', route: movement.referenceId ? `/treasury/payments/${movement.referenceId}` : null };
    case 'transfervoucher':
    case 'transfervouchercancellation':
      return { label: 'تحويل بين حسابات الخزينة', route: movement.referenceId ? `/treasury/transfers/${movement.referenceId}` : null };
    case 'openingbalance':
      return { label: 'رصيد افتتاحي', route: null };
    case 'openingbalancecorrection':
      return { label: 'تصحيح رصيد افتتاحي', route: null };
    default:
      return { label: getReferenceLabel(movement.referenceType), route: null };
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
          <FormattedMessage id="no-movements-found" defaultMessage="لا توجد حركات" />
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
              <TableCell><FormattedMessage id="date" defaultMessage="التاريخ" /></TableCell>
              <TableCell><FormattedMessage id="movement-number" defaultMessage="رقم الحركة" /></TableCell>
              <TableCell><FormattedMessage id="movement-type" defaultMessage="نوع الحركة" /></TableCell>
              <TableCell><FormattedMessage id="related-document" defaultMessage="المستند المرتبط" /></TableCell>
              <TableCell><FormattedMessage id="description" defaultMessage="الوصف" /></TableCell>
              <TableCell align="right"><FormattedMessage id="inbound" defaultMessage="داخل" /></TableCell>
              <TableCell align="right"><FormattedMessage id="outbound" defaultMessage="خارج" /></TableCell>
              <TableCell align="right"><FormattedMessage id="running-balance" defaultMessage="الرصيد بعد الحركة" /></TableCell>
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
                        <FormattedMessage id="reversed" defaultMessage="حركة عكسية / إلغاء" />
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
                        {row.balanceNature === 'Debit' ? 'مدين' : row.balanceNature === 'Credit' ? 'دائن' : 'مستقر'}
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
