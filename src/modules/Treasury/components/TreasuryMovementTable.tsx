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
import Pagination from '@mui/material/Pagination';
import { IconArrowsLeftRight } from '@tabler/icons-react';
import type { TreasuryMovement } from '../types/treasury.types';

interface Props {
  movements: TreasuryMovement[];
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export default function TreasuryMovementTable({ movements, page, totalPages, onPageChange, isLoading }: Props) {
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
                    <FormattedMessage id={`treasury.referenceType.${row.referenceType.toLowerCase()}`} defaultMessage={row.referenceType} />
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" color={row.isReversal ? 'error' : 'default'} label={<FormattedMessage id={`treasury.movementType.${row.movementType.toLowerCase()}`} defaultMessage={row.movementType} />} />
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
                  {row.debitAmount > 0 ? row.debitAmount.toFixed(2) : '-'}
                </TableCell>
                <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                  {row.creditAmount > 0 ? row.creditAmount.toFixed(2) : '-'}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>
                    {row.balanceAfter.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.balanceNature === 'Debit' ? 'مدين' : 'دائن'}
                  </Typography>
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
