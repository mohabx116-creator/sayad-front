import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconEye, IconSearch, IconDownload, IconFilter, IconAlertTriangle, IconBox } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useLowStockItems } from '../hooks/useInventory';

export default function InventoryLowStockPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  
  // The hook returns items, meta, isLoading, error based on query params
  const { items, meta, isLoading, error } = useLowStockItems({ page: page + 1, pageSize, search });

  return (
    <>
      <Breadcrumbs custom heading="inventory-low-stock" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'inventory-low-stock' }]} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconAlertTriangle color="var(--mui-palette-warning-main)" size={28} />
            <FormattedMessage id="inventory-low-stock" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            متابعة الأصناف التي وصلت للحد الأدنى من المخزون وتحتاج لإعادة طلب.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="inherit" startIcon={<IconDownload size={18} />} sx={{ borderRadius: 2 }}>
            <FormattedMessage id="export" />
          </Button>
        </Stack>
      </Box>

      <MainCard content={false} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" color="inherit" startIcon={<IconFilter size={18} color="currentColor" />} sx={{ color: 'text.secondary', borderColor: 'divider' }}>
              <FormattedMessage id="filter" />
            </Button>
          </Stack>
          <Box sx={{ width: 300 }}>
            <TextField 
              fullWidth 
              size="small"
              placeholder={intl.formatMessage({ id: 'search' })} 
              value={search} 
              onChange={(event) => { setSearch(event.target.value); setPage(0); }} 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </Box>
        
        {isLoading && <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><Loader /></Box>}
        {error && <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography></Box>}
        {!isLoading && items.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <IconBox size={48} color="var(--mui-palette-grey-400)" />
            <Typography variant="h4" color="text.secondary" sx={{ mt: 2 }}>
              <FormattedMessage id="inventory-no-low-stock" />
            </Typography>
          </Box>
        )}
        
        {items.length > 0 && (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="item-code" /></TableCell>
                    <TableCell><FormattedMessage id="name" /></TableCell>
                    <TableCell><FormattedMessage id="current-quantity" /></TableCell>
                    <TableCell><FormattedMessage id="minimum-quantity" /></TableCell>
                    <TableCell><FormattedMessage id="stock-status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const isOutOfStock = item.currentQuantity <= 0;
                    const isCritical = item.stockStatus === 'Critical';
                    const statusColor = isOutOfStock ? 'error' : (isCritical ? 'error' : 'warning');
                    const qtyColor = isOutOfStock ? 'error.main' : (isCritical ? 'error.main' : 'warning.dark');
                    const chipVariant = isOutOfStock ? 'filled' : 'outlined';
                    const chipBg = isOutOfStock ? 'error.main' : `${statusColor}.lighter`;
                    const chipText = isOutOfStock ? 'white' : undefined;

                    return (
                      <TableRow hover key={item.itemId} sx={{ bgcolor: isOutOfStock ? 'error.lighter' : 'inherit' }}>
                        <TableCell>
                          <Typography component={Link} to={`/inventory/items/${item.itemId}`} color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                            {item.itemCode}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{item.itemNameArabic}</TableCell>
                        <TableCell>
                           <Typography fontWeight={800} color={qtyColor} sx={{ fontSize: '1.1rem' }}>
                              {item.currentQuantity}
                           </Typography>
                        </TableCell>
                        <TableCell>{item.minimumQuantity}</TableCell>
                        <TableCell>
                          <Chip 
                            label={isOutOfStock ? intl.formatMessage({ id: 'out-of-stock', defaultMessage: 'نفد من المخزون' }) : item.stockStatus} 
                            color={statusColor} 
                            size="small" 
                            variant={chipVariant}
                            sx={{ 
                              bgcolor: chipBg,
                              color: chipText,
                              border: 'none',
                              fontWeight: 700,
                              px: 1
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={<FormattedMessage id="details" />}>
                            <IconButton size="small" component={Link} to={`/inventory/items/${item.itemId}`}>
                               <IconEye size={18} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={meta?.totalCount || 0}
              page={page}
              rowsPerPage={pageSize}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => { setPageSize(parseInt(event.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </MainCard>
    </>
  );
}
