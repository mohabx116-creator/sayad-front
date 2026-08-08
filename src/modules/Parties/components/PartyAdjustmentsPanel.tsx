import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconPlus, IconRotateClockwise } from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { PARTIES_PERMISSIONS } from '../utils/parties.constants';
import { getAvailablePartyAdjustmentTypeOptions, getPartyAdjustmentStatusLabelId, getPartyAdjustmentTypeLabelId } from '../utils/party-adjustments';
import type { PartyAdjustmentDto } from '../types/parties.types';
import PartyAdjustmentDialog from './PartyAdjustmentDialog';
import PartyAdjustmentReverseDialog from './PartyAdjustmentReverseDialog';

type PartyAdjustmentsPanelProps = {
  partyId: string;
  partyName: string;
  isCustomer: boolean;
  isSupplier: boolean;
  isActive: boolean;
  onSaved?: () => Promise<void> | void;
};

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default function PartyAdjustmentsPanel({ partyId, partyName, isCustomer, isSupplier, isActive, onSaved }: PartyAdjustmentsPanelProps) {
  const intl = useIntl();
  const adjustmentTypes = useMemo(() => getAvailablePartyAdjustmentTypeOptions(isCustomer, isSupplier), [isCustomer, isSupplier]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [recentAdjustments, setRecentAdjustments] = useState<PartyAdjustmentDto[]>([]);
  const [reverseTarget, setReverseTarget] = useState<PartyAdjustmentDto | null>(null);

  const handleSaved = async () => {
    await onSaved?.();
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              <FormattedMessage id="party-adjustment-history" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="party-adjustment-create-help" values={{ partyName }} />
            </Typography>
          </Box>
          <PermissionGuard permission={PARTIES_PERMISSIONS.adjustmentsManage}>
            <Button
              variant="contained"
              startIcon={<IconPlus size={18} />}
              onClick={() => setIsCreateOpen(true)}
              disabled={!isActive || adjustmentTypes.length === 0}
            >
              <FormattedMessage id="party-adjustment-create" />
            </Button>
          </PermissionGuard>
        </Stack>

        {!isActive && (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="party-adjustment-inactive-help" />
          </Typography>
        )}

        {recentAdjustments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="party-adjustment.no-history" />
          </Typography>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="number" defaultMessage="Number" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="adjustment-type" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="date" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="amount" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="status" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="reference-number" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="actions" />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentAdjustments.map((adjustment) => (
                  <TableRow key={adjustment.adjustmentId} hover>
                    <TableCell dir="ltr">{adjustment.number}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" variant="outlined" label={<FormattedMessage id={getPartyAdjustmentTypeLabelId(adjustment.adjustmentType)} />} />
                        <Chip size="small" color={adjustment.status === 'Posted' ? 'success' : 'default'} label={<FormattedMessage id={getPartyAdjustmentStatusLabelId(adjustment.status)} />} />
                      </Stack>
                    </TableCell>
                    <TableCell dir="ltr">{adjustment.entryDate}</TableCell>
                    <TableCell align="right" dir="ltr">
                      {formatAmount(intl.locale, adjustment.amount)}
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id={getPartyAdjustmentStatusLabelId(adjustment.status)} />
                    </TableCell>
                    <TableCell dir="ltr">{adjustment.referenceNumber ?? '-'}</TableCell>
                    <TableCell align="right">
                      <PermissionGuard permission={PARTIES_PERMISSIONS.adjustmentsManage}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<IconRotateClockwise size={16} />}
                          onClick={() => setReverseTarget(adjustment)}
                          disabled={adjustment.status !== 'Posted'}
                        >
                          <FormattedMessage id="reverse" />
                        </Button>
                      </PermissionGuard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      <PartyAdjustmentDialog
        open={isCreateOpen}
        partyId={partyId}
        partyName={partyName}
        isCustomer={isCustomer}
        isSupplier={isSupplier}
        onClose={() => setIsCreateOpen(false)}
        onSaved={async (adjustment) => {
          setRecentAdjustments((current) => [adjustment, ...current.filter((item) => item.adjustmentId !== adjustment.adjustmentId)]);
          await handleSaved();
        }}
      />

      <PartyAdjustmentReverseDialog
        open={!!reverseTarget}
        adjustment={reverseTarget}
        onClose={() => setReverseTarget(null)}
        onSaved={async (adjustment) => {
          setRecentAdjustments((current) => current.map((item) => (item.adjustmentId === adjustment.adjustmentId ? adjustment : item)));
          await handleSaved();
        }}
      />
    </Card>
  );
}
