import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { IntlShape } from 'react-intl';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconEye, IconSearch, IconX } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';

import { useSystemAuditLogs } from '../hooks/useSystem';
import type { SystemAuditLogDto } from '../types/system.types';
import {
  formatAuditKey,
  formatAuditValue,
  getAuditRecordValueByKeys,
  isRecord,
  localizeAuditAction,
  localizeAuditEntity,
  localizePayrollStatus,
  parseAuditJson
} from '../utils/auditLogLocalization';

const DRAWER_WIDTH = 620;

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function renderStructuredDetails(value: unknown, intl: IntlShape) {
  if (!isRecord(value)) {
    const rendered = value == null ? '-' : typeof value === 'string' ? value : JSON.stringify(value, null, 2);

    return (
      <Box
        component="pre"
        sx={{
          m: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          borderRadius: 1,
          bgcolor: 'action.hover',
          p: 1.5,
          fontFamily: 'monospace',
          fontSize: 12
        }}
      >
        {rendered}
      </Box>
    );
  }

  const entries = Object.entries(value);
  if (!entries.length) {
    return <Typography variant="body2" color="text.secondary"><FormattedMessage id="audit-log.no-structured-details" /></Typography>;
  }

  return (
    <Stack spacing={1.25}>
      {entries.map(([key, entryValue]) => {
        const normalizedKey = key.toLowerCase();
        const renderedValue =
          normalizedKey === 'status' || normalizedKey === 'fromstatus' || normalizedKey === 'tostatus' || normalizedKey.endsWith('status')
            ? localizePayrollStatus(typeof entryValue === 'string' ? entryValue : String(entryValue), intl)
            : formatAuditValue(key, entryValue, intl);

        return (
          <Stack key={key} spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
              {formatAuditKey(key)}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {renderedValue}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export default function SystemAuditPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [entityName, setEntityName] = useState('');
  const [action, setAction] = useState('');
  const [selectedLog, setSelectedLog] = useState<SystemAuditLogDto | null>(null);

  const { items, meta, isLoading, error } = useSystemAuditLogs({ page: page + 1, pageSize, search, entityName, action });

  const selectedLogOldValuesJson = selectedLog?.oldValuesJson;
  const selectedLogNewValuesJson = selectedLog?.newValuesJson;
  const selectedLogOldValues = useMemo(() => parseAuditJson(selectedLogOldValuesJson), [selectedLogOldValuesJson]);
  const selectedLogNewValues = useMemo(() => parseAuditJson(selectedLogNewValuesJson), [selectedLogNewValuesJson]);
  const isPayrollReopen = selectedLog?.action === 'PayrollPeriodReopened';
  const reopenFromStatus = isRecord(selectedLogNewValues) ? getAuditRecordValueByKeys(selectedLogNewValues, ['fromStatus', 'FromStatus']) : null;
  const reopenOldStatus = isRecord(selectedLogOldValues) ? getAuditRecordValueByKeys(selectedLogOldValues, ['status', 'Status']) : null;
  const reopenPreviousStatus = reopenFromStatus ?? reopenOldStatus;
  const reopenNewStatus = isRecord(selectedLogNewValues) ? getAuditRecordValueByKeys(selectedLogNewValues, ['toStatus', 'ToStatus']) : null;
  const reopenReason = isRecord(selectedLogNewValues) ? getAuditRecordValueByKeys(selectedLogNewValues, ['reason', 'Reason']) : null;
  const reopenedByUserId = isRecord(selectedLogNewValues) ? getAuditRecordValueByKeys(selectedLogNewValues, ['reopenedByUserId', 'ReopenedByUserId']) : null;

  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading="system-audit-log" links={[{ title: 'system-administration' }, { title: 'system-audit-log' }]} />
      <MainCard title={<FormattedMessage id="system-audit-log" />}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={intl.formatMessage({ id: 'search-placeholder' })}
            value={search}
            onChange={(event) => {
              setPage(0);
              setSearch(event.target.value);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconSearch size={18} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            size="small"
            fullWidth
            label={intl.formatMessage({ id: 'entity' })}
            value={entityName}
            onChange={(event) => {
              setPage(0);
              setEntityName(event.target.value);
            }}
          >
            <MenuItem value="">
              <FormattedMessage id="all" />
            </MenuItem>
            <MenuItem value="User">{localizeAuditEntity('User', intl)}</MenuItem>
            <MenuItem value="Role">{localizeAuditEntity('Role', intl)}</MenuItem>
            <MenuItem value="SystemOwner">{localizeAuditEntity('SystemOwner', intl)}</MenuItem>
            <MenuItem value="Worker">{localizeAuditEntity('Worker', intl)}</MenuItem>
            <MenuItem value="PayrollPeriod">{localizeAuditEntity('PayrollPeriod', intl)}</MenuItem>
            <MenuItem value="WorkerMonthlyMovement">{localizeAuditEntity('WorkerMonthlyMovement', intl)}</MenuItem>
            <MenuItem value="OperationalJob">{localizeAuditEntity('OperationalJob', intl)}</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            fullWidth
            label={intl.formatMessage({ id: 'action' })}
            value={action}
            onChange={(event) => {
              setPage(0);
              setAction(event.target.value);
            }}
          >
            <MenuItem value="">
              <FormattedMessage id="all" />
            </MenuItem>
            <MenuItem value="PayrollPeriodReopened">{localizeAuditAction('PayrollPeriodReopened', intl)}</MenuItem>
            <MenuItem value="WorkerMonthlyMovementApproved">{localizeAuditAction('WorkerMonthlyMovementApproved', intl)}</MenuItem>
            <MenuItem value="WorkerMonthlyMovementCreated">{localizeAuditAction('WorkerMonthlyMovementCreated', intl)}</MenuItem>
            <MenuItem value="WorkerCreated">{localizeAuditAction('WorkerCreated', intl)}</MenuItem>
            <MenuItem value="RolePermissionsAssigned">{localizeAuditAction('RolePermissionsAssigned', intl)}</MenuItem>
            <MenuItem value="UserActivated">{localizeAuditAction('UserActivated', intl)}</MenuItem>
            <MenuItem value="UserDeactivated">{localizeAuditAction('UserDeactivated', intl)}</MenuItem>
            <MenuItem value="UserLocked">{localizeAuditAction('UserLocked', intl)}</MenuItem>
            <MenuItem value="UserUnlocked">{localizeAuditAction('UserUnlocked', intl)}</MenuItem>
            <MenuItem value="RoleActivated">{localizeAuditAction('RoleActivated', intl)}</MenuItem>
            <MenuItem value="RoleDeactivated">{localizeAuditAction('RoleDeactivated', intl)}</MenuItem>
            <MenuItem value="OperationalJobActivated">{localizeAuditAction('OperationalJobActivated', intl)}</MenuItem>
            <MenuItem value="OperationalJobDeactivated">{localizeAuditAction('OperationalJobDeactivated', intl)}</MenuItem>
          </TextField>
        </Stack>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            <FormattedMessage id="administration-load-error" />
          </Typography>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><FormattedMessage id="date" /></TableCell>
                <TableCell><FormattedMessage id="actor" /></TableCell>
                <TableCell><FormattedMessage id="action" /></TableCell>
                <TableCell><FormattedMessage id="entity" /></TableCell>
                <TableCell><FormattedMessage id="ip-address" /></TableCell>
                <TableCell align="right"><FormattedMessage id="details" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((log) => (
                <TableRow
                  key={log.id}
                  hover
                  role="button"
                  tabIndex={0}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelectedLog(log)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedLog(log);
                    }
                  }}
                >
                  <TableCell>{new Date(log.createdAtUtc).toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack spacing={0}>
                      <Typography variant="body2">{log.actorName ?? '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.actorEmail ?? '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{localizeAuditAction(log.action, intl)}</TableCell>
                  <TableCell>
                    <Stack spacing={0}>
                      <Typography variant="body2">{localizeAuditEntity(log.entityName, intl)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.entityId ?? '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{log.ipAddress ?? '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedLog(log);
                      }}
                      aria-label={intl.formatMessage({ id: 'details' })}
                    >
                      <IconEye size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={meta.totalCount}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
          labelRowsPerPage={intl.formatMessage({ id: 'rows-per-page' })}
        />
      </MainCard>

      <Drawer
        anchor="right"
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: DRAWER_WIDTH },
            maxWidth: '100%'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5">
                <FormattedMessage id="audit-log.details-title" />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLog ? new Date(selectedLog.createdAtUtc).toLocaleString() : ''}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedLog(null)} aria-label={intl.formatMessage({ id: 'cancel' })}>
              <IconX size={18} />
            </IconButton>
          </Stack>

          {selectedLog && (
            <>
              <Divider sx={{ my: 2.5 }} />

              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip label={localizeAuditAction(selectedLog.action, intl)} color="primary" variant="outlined" />
                  <Chip label={localizeAuditEntity(selectedLog.entityName, intl)} variant="outlined" />
                </Stack>

                <Stack spacing={2}>
                  <DetailRow label={intl.formatMessage({ id: 'actor' })} value={selectedLog.actorName ?? '-'} />
                  <DetailRow label={intl.formatMessage({ id: 'audit-log.actor-email' })} value={selectedLog.actorEmail ?? '-'} />
                  <DetailRow label={intl.formatMessage({ id: 'action' })} value={localizeAuditAction(selectedLog.action, intl)} />
                  <DetailRow label={intl.formatMessage({ id: 'entity' })} value={localizeAuditEntity(selectedLog.entityName, intl)} />
                  <DetailRow label={intl.formatMessage({ id: 'audit-log.entity-id' })} value={selectedLog.entityId ?? '-'} />
                  <DetailRow label={intl.formatMessage({ id: 'ip-address' })} value={selectedLog.ipAddress ?? '-'} />
                  <DetailRow label={intl.formatMessage({ id: 'audit-log.user-agent' })} value={selectedLog.userAgent ?? '-'} />
                  <DetailRow label={intl.formatMessage({ id: 'date' })} value={new Date(selectedLog.createdAtUtc).toLocaleString()} />
                </Stack>

                {isPayrollReopen && isRecord(selectedLogOldValues) && isRecord(selectedLogNewValues) && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      <FormattedMessage id="audit-log.reopen-summary" />
                    </Typography>
                    <Stack spacing={1.5}>
                      <DetailRow
                        label={intl.formatMessage({ id: 'audit-log.reopen.previous-status' })}
                        value={localizePayrollStatus(typeof reopenPreviousStatus === 'string' ? reopenPreviousStatus : null, intl)}
                      />
                      <DetailRow
                        label={intl.formatMessage({ id: 'audit-log.reopen.new-status' })}
                        value={localizePayrollStatus(typeof reopenNewStatus === 'string' ? reopenNewStatus : null, intl)}
                      />
                      <DetailRow
                        label={intl.formatMessage({ id: 'audit-log.reopen.reason' })}
                        value={typeof reopenReason === 'string' ? reopenReason : '-'}
                      />
                      <DetailRow
                        label={intl.formatMessage({ id: 'audit-log.reopen.reopened-by' })}
                        value={selectedLog.actorName ?? selectedLog.actorEmail ?? formatAuditValue('ReopenedByUserId', reopenedByUserId, intl)}
                      />
                    </Stack>
                  </Box>
                )}

                <Divider />

                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      <FormattedMessage id="audit-log.old-values" />
                    </Typography>
                    {renderStructuredDetails(selectedLogOldValues, intl)}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      <FormattedMessage id="audit-log.new-values" />
                    </Typography>
                    {renderStructuredDetails(selectedLogNewValues, intl)}
                  </Box>
                </Stack>
              </Stack>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
