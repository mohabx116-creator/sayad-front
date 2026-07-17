import { FormattedMessage } from 'react-intl';
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
import { Link } from 'react-router-dom';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useItemMovements } from '../hooks/useInventory';

export default function InventoryItemMovementsPage() {
  const { id } = useParams();
  const { items, isLoading, error } = useItemMovements(id);
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
                  <TableCell>{movement.movementType}</TableCell>
                  <TableCell>{movement.quantity} {movement.unitCode}</TableCell>
                  <TableCell>{movement.runningQuantity}</TableCell>
                  <TableCell>{movement.descriptionArabic}</TableCell>
                  <TableCell>
                    {movement.accountingJournalEntryId ? (
                      <Stack spacing={0.5} alignItems="flex-start">
                        <Chip size="small" variant="outlined" color="success" label={movement.accountingPostingStatus} />
                        <Typography component={Link} to={`/accounting/journal-entries/${movement.accountingJournalEntryId}`} variant="caption" color="primary" sx={{ textDecoration: 'none' }}>
                          {movement.accountingEntryNumber ?? movement.accountingJournalEntryId}
                        </Typography>
                      </Stack>
                    ) : (
                      <Chip size="small" variant="outlined" label={movement.accountingPostingStatus} />
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
