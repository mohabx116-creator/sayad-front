import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import BomStatusChip from '../components/BomStatusChip';
import { useBoms } from '../hooks/useManufacturing';
import { MANUFACTURING_PERMISSIONS } from '../utils/manufacturing.constants';
import { resolveLocalizedText } from 'shared/utils/localizedText';

export default function BillsOfMaterialsListPage() {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    setSearch(initialSearch);
    setPage(0);
  }, [initialSearch]);

  const isActiveParam =
    activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;

  const { items, meta, isLoading, mutate } = useBoms({
    page: page + 1,
    pageSize,
    search: search.trim() || undefined,
    isActive: isActiveParam
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveFilter(e.target.value);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setActiveFilter('all');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <PageTitle>
            <FormattedMessage id="manufacturing-boms" defaultMessage="Bills of Materials" />
          </PageTitle>
          <PermissionGuard permission={MANUFACTURING_PERMISSIONS.bomsCreate}>
            <Button
              component={Link}
              to="/manufacturing/boms/create"
              variant="contained"
              color="secondary"
              startIcon={<IconPlus size={18} />}
            >
              <FormattedMessage id="create-bom" defaultMessage="Create BOM" />
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder={intl.formatMessage({
                id: 'search-boms-placeholder',
                defaultMessage: 'Search by BOM code, name, or finished good...'
              })}
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: { xs: '100%', sm: 300 }, flexGrow: 1 }}
            />

            <TextField
              select
              size="small"
              label={intl.formatMessage({ id: 'status', defaultMessage: 'Status' })}
              value={activeFilter}
              onChange={handleActiveFilterChange}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">
                <FormattedMessage id="all" defaultMessage="All" />
              </MenuItem>
              <MenuItem value="active">
                <FormattedMessage id="active" defaultMessage="Active" />
              </MenuItem>
              <MenuItem value="inactive">
                <FormattedMessage id="inactive" defaultMessage="Inactive" />
              </MenuItem>
            </TextField>

            <Tooltip title={intl.formatMessage({ id: 'reset-filters', defaultMessage: 'Reset Filters' })}>
              <IconButton onClick={handleResetFilters} size="small" color="primary">
                <IconRefresh size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="code" defaultMessage="Code" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="bom-name" defaultMessage="BOM Name" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="finished-good" defaultMessage="Finished Good" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="batch-size" defaultMessage="Batch Size" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="version" defaultMessage="Version" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="components-count" defaultMessage="Components" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="status" defaultMessage="Status" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="actions" defaultMessage="Actions" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={180} /></TableCell>
                    <TableCell align="right"><Skeleton width={60} /></TableCell>
                    <TableCell align="center"><Skeleton width={40} /></TableCell>
                    <TableCell align="center"><Skeleton width={50} /></TableCell>
                    <TableCell align="center"><Skeleton width={70} /></TableCell>
                    <TableCell align="center"><Skeleton width={40} /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      <FormattedMessage id="no-boms-found" defaultMessage="No Bills of Materials found." />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((bom) => {
                  const resolvedFinishedGood = resolveLocalizedText(
                    intl.locale,
                    bom.finishedGoodItemNameArabic,
                    bom.finishedGoodItemNameEnglish
                  );
                  const resolvedBomName = resolveLocalizedText(
                    intl.locale,
                    bom.nameArabic,
                    bom.nameEnglish
                  );

                  return (
                    <TableRow hover key={bom.id}>
                      <TableCell>
                        <Typography
                          component={Link}
                          to={`/manufacturing/boms/${bom.id}`}
                          variant="subtitle2"
                          sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 600 }}
                        >
                          {bom.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {resolvedBomName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                            [{bom.finishedGoodItemCode}]
                          </Box>
                          {resolvedFinishedGood}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {(bom.batchSize ?? 0).toLocaleString()} {bom.baseUnitCode}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          v{bom.version}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {bom.lineCount}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <BomStatusChip isActive={bom.isActive} />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={intl.formatMessage({ id: 'view-details', defaultMessage: 'View Details' })}>
                          <IconButton
                            component={Link}
                            to={`/manufacturing/boms/${bom.id}`}
                            size="small"
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={meta.totalCount}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </MainCard>
    </Box>
  );
}
