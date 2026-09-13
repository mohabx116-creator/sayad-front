import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconCheck, IconPlayerPlay, IconPlus } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { startProductionOperation } from '../api/manufacturingApi';
import AddOperationDialog from './AddOperationDialog';
import CompleteOperationDialog from './CompleteOperationDialog';
import { useProductionOperations } from '../hooks/useManufacturing';
import type { ProductionOperationDto, ProductionOperationStatus } from '../types/manufacturing.types';
import { MANUFACTURING_PERMISSIONS } from '../utils/manufacturing.constants';

type ProductionOperationsTabProps = {
  orderId: string;
  onChanged?: () => Promise<void> | void;
};

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMinutes(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function statusColor(status: ProductionOperationStatus) {
  if (status === 'Completed') return 'success';
  if (status === 'InProgress') return 'info';
  if (status === 'Cancelled') return 'default';
  return 'warning';
}

export default function ProductionOperationsTab({ orderId, onChanged }: ProductionOperationsTabProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { operations, isLoading, mutate } = useProductionOperations(orderId);
  const [addOpen, setAddOpen] = useState(false);
  const [completeOperation, setCompleteOperation] = useState<ProductionOperationDto | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const showSnackbar = (message: string, color: 'success' | 'error') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', alert: { color } }));
  };

  const refresh = async () => {
    await mutate();
    await onChanged?.();
  };

  const handleStart = async (operation: ProductionOperationDto) => {
    setProcessingId(operation.id);
    try {
      await startProductionOperation(orderId, operation.id, operation.rowVersion);
      await refresh();
      showSnackbar(intl.formatMessage({ id: 'operation-started', defaultMessage: 'Operation started.' }), 'success');
    } catch (error: any) {
      showSnackbar(error?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaved = async (messageId: string, defaultMessage: string) => {
    await refresh();
    showSnackbar(intl.formatMessage({ id: messageId, defaultMessage }), 'success');
  };

  return (
    <MainCard
      title={<FormattedMessage id="production-operations" defaultMessage="Production Operations" />}
      secondary={
        <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersUpdate}>
          <Button variant="contained" color="secondary" size="small" startIcon={<IconPlus size={16} />} onClick={() => setAddOpen(true)}>
            <FormattedMessage id="add-operation" defaultMessage="Add Operation" />
          </Button>
        </PermissionGuard>
      }
      content={false}
    >
      <TableContainer>
        <Table sx={{ minWidth: 820 }}>
          <TableHead>
            <TableRow>
              <TableCell align="right"><FormattedMessage id="sequence" defaultMessage="Sequence" /></TableCell>
              <TableCell><FormattedMessage id="operation" defaultMessage="Operation" /></TableCell>
              <TableCell><FormattedMessage id="work-center" defaultMessage="Work Center" /></TableCell>
              <TableCell align="right"><FormattedMessage id="planned-time" defaultMessage="Planned Time" /></TableCell>
              <TableCell align="right"><FormattedMessage id="actual-time" defaultMessage="Actual Time" /></TableCell>
              <TableCell align="right"><FormattedMessage id="costs" defaultMessage="Costs" /></TableCell>
              <TableCell align="center"><FormattedMessage id="status" defaultMessage="Status" /></TableCell>
              <TableCell align="center"><FormattedMessage id="actions" defaultMessage="Actions" /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell align="right"><Skeleton width={40} /></TableCell>
                  <TableCell><Skeleton width={160} /></TableCell>
                  <TableCell><Skeleton width={140} /></TableCell>
                  <TableCell align="right"><Skeleton width={70} /></TableCell>
                  <TableCell align="right"><Skeleton width={70} /></TableCell>
                  <TableCell align="right"><Skeleton width={90} /></TableCell>
                  <TableCell align="center"><Skeleton width={80} /></TableCell>
                  <TableCell align="center"><Skeleton width={80} /></TableCell>
                </TableRow>
              ))
            ) : operations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    <FormattedMessage id="no-production-operations" defaultMessage="No production operations recorded." />
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              operations
                .slice()
                .sort((left, right) => left.sequence - right.sequence)
                .map((operation) => {
                  const canStart = operation.status === 'Planned';
                  const canComplete = operation.status === 'Planned' || operation.status === 'InProgress';
                  return (
                    <TableRow hover key={operation.id}>
                      <TableCell align="right">{operation.sequence}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{operation.operationName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2">{operation.workCenterName}</Typography>
                          {operation.workCenterCode && (
                            <Typography variant="caption" color="text.secondary">{operation.workCenterCode}</Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{formatMinutes(operation.plannedMinutes)}</TableCell>
                      <TableCell align="right">{formatMinutes(operation.actualMinutes)}</TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2">{formatNumber(operation.laborCost + operation.machineCost)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            <FormattedMessage id="labor-cost" defaultMessage="Labor" /> {formatNumber(operation.laborCost)} /{' '}
                            <FormattedMessage id="machine-cost" defaultMessage="Machine" /> {formatNumber(operation.machineCost)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          color={statusColor(operation.status)}
                          label={<FormattedMessage id={`production-operation-status.${operation.status}`} defaultMessage={operation.status} />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersUpdate}>
                          {canStart && (
                            <Tooltip title={intl.formatMessage({ id: 'start-operation', defaultMessage: 'Start Operation' })}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="info"
                                  disabled={processingId === operation.id}
                                  onClick={() => handleStart(operation)}
                                >
                                  <IconPlayerPlay size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canComplete && (
                            <Tooltip title={intl.formatMessage({ id: 'complete-operation', defaultMessage: 'Complete Operation' })}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  disabled={processingId === operation.id}
                                  onClick={() => setCompleteOperation(operation)}
                                >
                                  <IconCheck size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddOperationDialog
        open={addOpen}
        orderId={orderId}
        onClose={() => setAddOpen(false)}
        onSaved={() => handleSaved('operation-added', 'Operation added.')}
        onError={(message) => showSnackbar(message, 'error')}
      />
      <CompleteOperationDialog
        open={Boolean(completeOperation)}
        operation={completeOperation}
        onClose={() => setCompleteOperation(null)}
        onSaved={() => handleSaved('operation-completed', 'Operation completed.')}
        onError={(message) => showSnackbar(message, 'error')}
      />
    </MainCard>
  );
}
