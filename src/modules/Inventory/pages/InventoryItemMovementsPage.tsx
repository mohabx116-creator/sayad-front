import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useItemMovements } from '../hooks/useInventory';
import { getInventoryMovementAccountingStatusLabel } from '../utils/inventory.constants';

export default function InventoryItemMovementsPage() {
  const { id } = useParams();
  const theme = useTheme();
  const intl = useIntl();
  const { items, isLoading, error } = useItemMovements(id);

  const getMovementTypeLabel = (movementType: string) => {
    switch (movementType) {
      case 'OpeningStock':
        return intl.formatMessage({ id: 'inventory-movement-type.opening-stock', defaultMessage: 'Opening stock' });
      case 'StockIn':
        return intl.formatMessage({ id: 'inventory-movement-type.stock-in', defaultMessage: 'Stock in' });
      case 'StockOut':
        return intl.formatMessage({ id: 'inventory-movement-type.stock-out', defaultMessage: 'Stock out' });
      case 'AdjustmentIncrease':
        return intl.formatMessage({ id: 'inventory-movement-type.adjustment-increase', defaultMessage: 'Adjustment increase' });
      case 'AdjustmentDecrease':
        return intl.formatMessage({ id: 'inventory-movement-type.adjustment-decrease', defaultMessage: 'Adjustment decrease' });
      case 'Reversal':
        return intl.formatMessage({ id: 'inventory-movement-type.reversal', defaultMessage: 'Reversal' });
      default:
        return movementType;
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="inventory-movements" links={[{ title: 'inventory' }, { title: 'inventory-movements' }]} />
      <MainCard title={<FormattedMessage id="inventory-movements" />}>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>}
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell><FormattedMessage id="date" /></TableCell><TableCell><FormattedMessage id="entry-type" /></TableCell><TableCell><FormattedMessage id="quantity" /></TableCell><TableCell><FormattedMessage id="running-balance" /></TableCell><TableCell><FormattedMessage id="description" /></TableCell><TableCell><FormattedMessage id="accounting" defaultMessage="Accounting" /></TableCell></TableRow></TableHead>
            <TableBody>
              {items.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.movementDate}</TableCell>
                  <TableCell>{getMovementTypeLabel(movement.movementType)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
                        {Math.abs(movement.quantity)} {movement.unitCode}
                      </Typography>
                      {movement.baseQuantityIn > 0 ? (
                        <IconArrowUp size={16} color={theme.palette.success.main} />
                      ) : movement.baseQuantityOut > 0 ? (
                        <IconArrowDown size={16} color={theme.palette.error.main} />
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell>{movement.runningQuantity}</TableCell>
                  <TableCell>{movement.descriptionArabic}</TableCell>
                  <TableCell>
                    {movement.accountingJournalEntryId ? (
                      <Stack spacing={0.5} alignItems="flex-start">
                        <Chip
                          size="small"
                          variant="outlined"
                          color="success"
                          label={getInventoryMovementAccountingStatusLabel(intl, movement.accountingPostingStatus)}
                        />
                        <Typography component={Link} to={`/accounting/journal-entries/${movement.accountingJournalEntryId}`} variant="caption" color="primary" sx={{ textDecoration: 'none' }}>
                          {movement.accountingEntryNumber ?? movement.accountingJournalEntryId}
                        </Typography>
                      </Stack>
                    ) : (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={getInventoryMovementAccountingStatusLabel(intl, movement.accountingPostingStatus)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>
    </>
  );
}
