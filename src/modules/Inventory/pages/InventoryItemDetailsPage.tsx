import { FormattedMessage } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useInventoryItem } from '../hooks/useInventory';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';

export default function InventoryItemDetailsPage() {
  const { id } = useParams();
  const { item, isLoading, error } = useInventoryItem(id);
  if (isLoading) return <Loader />;
  if (error || !item) return <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>;

  return (
    <>
      <Breadcrumbs custom heading="item-details" links={[{ title: 'inventory' }, { title: 'inventory-items' }]} />
      <MainCard
        title={`${item.code} - ${item.nameArabic}`}
        secondary={
          <Stack direction="row" spacing={1}>
            <Button component={Link} to={`/inventory/items/${item.id}/movements`} variant="outlined"><FormattedMessage id="inventory-movements" /></Button>
            <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsUpdate}>
              <Button component={Link} to={`/inventory/items/${item.id}/edit`} variant="contained"><FormattedMessage id="edit" /></Button>
            </PermissionGuard>
          </Stack>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="item-type" /></Typography><Typography>{item.itemType}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="base-unit" /></Typography><Typography>{item.baseUnitCode}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="stock-status" /></Typography><Typography><Chip label={item.stockStatus} color={item.stockStatus === 'Normal' ? 'success' : 'warning'} /></Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="is-purchasable" /></Typography><Typography>{item.isPurchasable ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="is-sellable" /></Typography><Typography>{item.isSellable ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="current-quantity" /></Typography><Typography>{item.currentQuantity}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="minimum-quantity" /></Typography><Typography>{item.minimumQuantity}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="reorder-quantity" /></Typography><Typography>{item.reorderQuantity}</Typography></Grid>
          <Grid item xs={12} md={6}><Typography variant="caption"><FormattedMessage id="description-arabic" /></Typography><Typography>{item.descriptionArabic ?? '-'}</Typography></Grid>
          <Grid item xs={12} md={6}><Typography variant="caption"><FormattedMessage id="description-english" /></Typography><Typography>{item.descriptionEnglish ?? '-'}</Typography></Grid>
          <Grid item xs={12}><Typography variant="caption"><FormattedMessage id="notes" /></Typography><Typography>{item.notes ?? '-'}</Typography></Grid>
        </Grid>
      </MainCard>
    </>
  );
}
