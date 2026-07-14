import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import {
  IconArrowsLeftRight,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconRefresh,
  IconWallet
} from '@tabler/icons-react';
import type { TreasuryMovement } from '../types/treasury.types';
import { formatTreasuryMoney } from '../utils/treasury.format';

function getMovementPresentation(movementType: string) {
  switch (movementType.toLowerCase()) {
    case 'openingbalance':
      return { label: 'الرصيد الافتتاحي', icon: <IconWallet size={14} />, color: 'primary' as const };
    case 'receipt':
      return { label: 'إيصال', icon: <IconArrowDownLeft size={14} />, color: 'success' as const };
    case 'receiptreversal':
      return { label: 'عكس إيصال', icon: <IconRefresh size={14} />, color: 'error' as const };
    case 'payment':
      return { label: 'صرف', icon: <IconArrowUpRight size={14} />, color: 'error' as const };
    case 'paymentreversal':
      return { label: 'عكس صرف', icon: <IconRefresh size={14} />, color: 'success' as const };
    case 'transferin':
      return { label: 'تحويل وارد', icon: <IconArrowsLeftRight size={14} />, color: 'info' as const };
    case 'transferout':
      return { label: 'تحويل صادر', icon: <IconArrowsLeftRight size={14} />, color: 'warning' as const };
    case 'transferreversalin':
      return { label: 'عكس تحويل وارد', icon: <IconRefresh size={14} />, color: 'error' as const };
    case 'transferreversalout':
      return { label: 'عكس تحويل صادر', icon: <IconRefresh size={14} />, color: 'error' as const };
    default:
      return { label: movementType, icon: <IconArrowsLeftRight size={14} />, color: 'default' as const };
  }
}

function getReferenceLabel(referenceType: string) {
  switch (referenceType.toLowerCase()) {
    case 'openingbalance':
      return 'الرصيد الافتتاحي';
    case 'openingbalancecorrection':
      return 'تصحيح الرصيد الافتتاحي';
    case 'receiptvoucher':
      return 'سند قبض';
    case 'receiptvouchercancellation':
      return 'إلغاء سند قبض';
    case 'paymentvoucher':
      return 'سند صرف';
    case 'paymentvouchercancellation':
      return 'إلغاء سند صرف';
    case 'transfervoucher':
      return 'سند تحويل';
    case 'transfervouchercancellation':
      return 'إلغاء سند تحويل';
    default:
      return referenceType;
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
              <TableCell><FormattedMessage id="document" defaultMessage="المستند" /></TableCell>
              <TableCell><FormattedMessage id="type" defaultMessage="النوع" /></TableCell>
              <TableCell><FormattedMessage id="party" defaultMessage="الجهة" /></TableCell>
              <TableCell><FormattedMessage id="description" defaultMessage="البيان" /></TableCell>
              <TableCell align="right"><FormattedMessage id="receipt-amount" defaultMessage="وارد (مقبوضات)" /></TableCell>
              <TableCell align="right"><FormattedMessage id="payment-amount" defaultMessage="منصرف (مدفوعات)" /></TableCell>
              <TableCell align="right"><FormattedMessage id="running-balance" defaultMessage="الرصيد التراكمي" /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((row) => (
              <TableRow key={row.id} hover sx={{ bgcolor: row.isReversal ? 'error.lighter' : 'inherit' }}>
                <TableCell>{row.movementDate}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {row.referenceNumber || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {getReferenceLabel(row.referenceType)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={getMovementPresentation(row.movementType).color}
                    icon={getMovementPresentation(row.movementType).icon}
                    label={getMovementPresentation(row.movementType).label}
                  />
                </TableCell>
                <TableCell>{row.partyNameArabic || '-'}</TableCell>
                <TableCell sx={{ maxWidth: 250 }}>
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
            ))}
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
