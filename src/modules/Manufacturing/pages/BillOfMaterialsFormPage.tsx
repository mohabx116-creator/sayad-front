import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';

import { createBom, updateBom } from '../api/manufacturingApi';
import { useBom } from '../hooks/useManufacturing';
import { useInventoryItems, useInventoryItemUnits } from 'modules/Inventory/hooks/useInventory';
import type {
  BillOfMaterialsLineInput,
  CreateBillOfMaterialsRequest,
  UpdateBillOfMaterialsRequest
} from '../types/manufacturing.types';
import type { ItemDto } from 'modules/Inventory/types/inventory.types';
import { resolveLocalizedText } from 'shared/utils/localizedText';

type FormLine = BillOfMaterialsLineInput & {
  rawMaterialItemCode?: string;
  rawMaterialItemName?: string;
  unitCode?: string;
};

function emptyLine(lineNumber = 1): FormLine {
  return {
    rawMaterialItemId: '',
    unitOfMeasureId: '',
    quantity: 1,
    factorToBase: 1,
    baseQuantity: 1,
    scrapPercentage: 0,
    lineNumber,
    notes: ''
  };
}

// Unit Selector component per line to handle units lookup & auto-selection
function BomLineUnitField({
  itemId,
  baseUnitId,
  value,
  onUnitChange
}: {
  itemId: string;
  baseUnitId?: string;
  value: string;
  onUnitChange: (unitId: string, factorToBase: number, unitCode: string) => void;
}) {
  const intl = useIntl();
  const { items: units, isLoading } = useInventoryItemUnits(itemId || undefined);

  useEffect(() => {
    if (!itemId || isLoading || units.length === 0) return;

    const hasCurrent = units.some((u) => u.unitOfMeasureId === value);
    if (!hasCurrent) {
      const preferred =
        units.find((u) => u.isDefaultPurchaseUnit) ??
        (baseUnitId ? units.find((u) => u.unitOfMeasureId === baseUnitId) : undefined) ??
        units[0];

      if (preferred) {
        onUnitChange(preferred.unitOfMeasureId, preferred.factorToBase || 1, preferred.unitCode);
      }
    }
  }, [itemId, units, isLoading, value, baseUnitId, onUnitChange]);

  return (
    <TextField
      select
      size="small"
      fullWidth
      value={value}
      disabled={!itemId || isLoading || units.length === 0}
      onChange={(e) => {
        const selected = units.find((u) => u.unitOfMeasureId === e.target.value);
        if (selected) {
          onUnitChange(selected.unitOfMeasureId, selected.factorToBase || 1, selected.unitCode);
        }
      }}
      helperText={!itemId ? intl.formatMessage({ id: 'select-item-first', defaultMessage: 'Select item first' }) : undefined}
    >
      {units.map((u) => (
        <MenuItem key={u.unitOfMeasureId} value={u.unitOfMeasureId}>
          {u.unitCode} ({u.unitNameArabic})
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function BillOfMaterialsFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();

  const { bom, isLoading: isBomLoading } = useBom(id);
  const { items: allItems, isLoading: isItemsLoading } = useInventoryItems({ page: 1, pageSize: 500 });

  const [code, setCode] = useState('');
  const [nameArabic, setNameArabic] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [finishedGoodItemId, setFinishedGoodItemId] = useState('');
  const [baseUnitId, setBaseUnitId] = useState('');
  const [baseUnitCode, setBaseUnitCode] = useState('');
  const [batchSize, setBatchSize] = useState<number>(1);
  const [version, setVersion] = useState<number>(1);
  const [routingNotes, setRoutingNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<FormLine[]>([emptyLine(1)]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Populate data when editing
  useEffect(() => {
    if (isEdit && bom) {
      setCode(bom.code);
      setNameArabic(bom.nameArabic);
      setNameEnglish(bom.nameEnglish || '');
      setFinishedGoodItemId(bom.finishedGoodItemId);
      setBaseUnitId(bom.baseUnitId);
      setBaseUnitCode(bom.baseUnitCode);
      setBatchSize(bom.batchSize);
      setVersion(bom.version);
      setRoutingNotes(bom.routingNotes || '');
      setNotes(bom.notes || '');
      if (bom.lines && bom.lines.length > 0) {
        setLines(
          bom.lines.map((l) => ({
            rawMaterialItemId: l.rawMaterialItemId,
            rawMaterialItemCode: l.rawMaterialItemCode,
            rawMaterialItemName: l.rawMaterialItemNameArabic,
            unitOfMeasureId: l.unitOfMeasureId,
            unitCode: l.unitOfMeasureCode,
            quantity: l.quantity,
            factorToBase: l.factorToBase,
            baseQuantity: l.baseQuantity,
            scrapPercentage: l.scrapPercentage,
            lineNumber: l.lineNumber,
            notes: l.notes || ''
          }))
        );
      }
    }
  }, [isEdit, bom]);

  // Finished good item lookup
  const selectedFinishedGood = useMemo(
    () => allItems.find((i) => i.id === finishedGoodItemId) ?? null,
    [allItems, finishedGoodItemId]
  );

  const handleFinishedGoodChange = (_: React.SyntheticEvent, item: ItemDto | null) => {
    if (item) {
      setFinishedGoodItemId(item.id);
      setBaseUnitId(item.baseUnitId);
      setBaseUnitCode(item.baseUnitCode);
      if (!nameArabic) {
        setNameArabic(item.nameArabic);
      }
      if (!nameEnglish && item.nameEnglish) {
        setNameEnglish(item.nameEnglish);
      }
    } else {
      setFinishedGoodItemId('');
      setBaseUnitId('');
      setBaseUnitCode('');
    }
  };

  const handleAddLine = () => {
    setLines((prev) => [...prev, emptyLine(prev.length + 1)]);
  };

  const handleRemoveLine = (index: number) => {
    setLines((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((line, i) => ({ ...line, lineNumber: i + 1 }));
    });
  };

  const handleLineItemChange = (index: number, item: ItemDto | null) => {
    setLines((prev) => {
      const next = [...prev];
      if (item) {
        next[index] = {
          ...next[index],
          rawMaterialItemId: item.id,
          rawMaterialItemCode: item.code,
          rawMaterialItemName: item.nameArabic,
          unitOfMeasureId: item.baseUnitId,
          unitCode: item.baseUnitCode,
          factorToBase: 1,
          baseQuantity: next[index].quantity
        };
      } else {
        next[index] = {
          ...next[index],
          rawMaterialItemId: '',
          rawMaterialItemCode: '',
          rawMaterialItemName: '',
          unitOfMeasureId: '',
          unitCode: '',
          factorToBase: 1,
          baseQuantity: 0
        };
      }
      return next;
    });
  };

  const handleLineUnitChange = (index: number, unitId: string, factorToBase: number, unitCode: string) => {
    setLines((prev) => {
      const next = [...prev];
      const factor = factorToBase || 1;
      next[index] = {
        ...next[index],
        unitOfMeasureId: unitId,
        unitCode,
        factorToBase: factor,
        baseQuantity: next[index].quantity * factor
      };
      return next;
    });
  };

  const handleLineQuantityChange = (index: number, quantity: number) => {
    setLines((prev) => {
      const next = [...prev];
      const qty = Math.max(0, quantity);
      next[index] = {
        ...next[index],
        quantity: qty,
        baseQuantity: qty * (next[index].factorToBase || 1)
      };
      return next;
    });
  };

  const handleLineScrapChange = (index: number, scrap: number) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        scrapPercentage: Math.max(0, scrap)
      };
      return next;
    });
  };

  const handleLineNotesChange = (index: number, lineNotes: string) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], notes: lineNotes };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!nameArabic.trim()) {
      setValidationError(intl.formatMessage({ id: 'name-arabic-required', defaultMessage: 'Arabic name is required.' }));
      return;
    }

    if (!finishedGoodItemId) {
      setValidationError(intl.formatMessage({ id: 'finished-good-required', defaultMessage: 'Finished good item is required.' }));
      return;
    }

    if (!baseUnitId) {
      setValidationError(intl.formatMessage({ id: 'base-unit-required', defaultMessage: 'Base unit is required.' }));
      return;
    }

    if (batchSize <= 0) {
      setValidationError(intl.formatMessage({ id: 'batch-size-invalid', defaultMessage: 'Batch size must be greater than 0.' }));
      return;
    }

    if (lines.length === 0) {
      setValidationError(intl.formatMessage({ id: 'at-least-one-line', defaultMessage: 'At least one component line is required.' }));
      return;
    }

    const uniqueRawMaterialIds = new Set<string>();
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l.rawMaterialItemId) {
        setValidationError(intl.formatMessage({ id: 'line-item-required', defaultMessage: 'Raw material item is required on all lines.' }));
        return;
      }
      if (uniqueRawMaterialIds.has(l.rawMaterialItemId)) {
        setValidationError(intl.formatMessage({ id: 'duplicate-raw-material', defaultMessage: 'Duplicate raw material item found in lines. Each item can only be added once.' }));
        return;
      }
      uniqueRawMaterialIds.add(l.rawMaterialItemId);
      if (!l.unitOfMeasureId) {
        setValidationError(intl.formatMessage({ id: 'line-unit-required', defaultMessage: 'Unit of measure is required on all lines.' }));
        return;
      }
      if (l.quantity <= 0) {
        setValidationError(intl.formatMessage({ id: 'line-quantity-invalid', defaultMessage: 'Quantity must be greater than 0 on all lines.' }));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const cleanLines: BillOfMaterialsLineInput[] = lines.map((l, index) => ({
        rawMaterialItemId: l.rawMaterialItemId,
        unitOfMeasureId: l.unitOfMeasureId,
        quantity: l.quantity,
        factorToBase: l.factorToBase || 1,
        baseQuantity: l.quantity * (l.factorToBase || 1),
        scrapPercentage: l.scrapPercentage || 0,
        lineNumber: index + 1,
        notes: l.notes?.trim() || null
      }));

      if (isEdit && id) {
        const updateRequest: UpdateBillOfMaterialsRequest = {
          nameArabic: nameArabic.trim(),
          nameEnglish: nameEnglish.trim() || null,
          finishedGoodItemId,
          baseUnitId,
          batchSize,
          version,
          routingNotes: routingNotes.trim() || null,
          notes: notes.trim() || null,
          lines: cleanLines,
          rowVersion: bom?.rowVersion || null
        };

        const result = await updateBom(id, updateRequest);
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: 'bom-updated-success', defaultMessage: 'Bill of Materials updated successfully.' }),
            variant: 'alert',
            alert: { color: 'success' }
          })
        );
        navigate(`/manufacturing/boms/${result.id}`);
      } else {
        const createRequest: CreateBillOfMaterialsRequest = {
          code: code.trim() || null,
          nameArabic: nameArabic.trim(),
          nameEnglish: nameEnglish.trim() || null,
          finishedGoodItemId,
          baseUnitId,
          batchSize,
          version,
          routingNotes: routingNotes.trim() || null,
          notes: notes.trim() || null,
          lines: cleanLines
        };

        const result = await createBom(createRequest);
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: 'bom-created-success', defaultMessage: 'Bill of Materials created successfully.' }),
            variant: 'alert',
            alert: { color: 'success' }
          })
        );
        navigate(`/manufacturing/boms/${result.id}`);
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' });
      setValidationError(message);
      dispatch(
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'error' }
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isBomLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <PageTitle>
            {isEdit ? (
              <FormattedMessage id="edit-bom" defaultMessage="Edit Bill of Materials" />
            ) : (
              <FormattedMessage id="create-bom" defaultMessage="Create Bill of Materials" />
            )}
          </PageTitle>
          <Button
            component={Link}
            to={isEdit && id ? `/manufacturing/boms/${id}` : '/manufacturing/boms'}
            variant="outlined"
            startIcon={<IconArrowLeft size={18} />}
          >
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
        </Stack>
      </Box>

      {validationError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setValidationError(null)}>
          {validationError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Header information */}
          <Grid item xs={12}>
            <MainCard
              title={intl.formatMessage({ id: 'basic-information', defaultMessage: 'Basic Information' })}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label={intl.formatMessage({ id: 'code', defaultMessage: 'Code' })}
                    placeholder={intl.formatMessage({ id: 'auto-generated', defaultMessage: 'Auto-generated if empty' })}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isEdit}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label={intl.formatMessage({ id: 'name-arabic', defaultMessage: 'Arabic Name' })}
                    value={nameArabic}
                    onChange={(e) => setNameArabic(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label={intl.formatMessage({ id: 'name-english', defaultMessage: 'English Name' })}
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={allItems}
                    getOptionLabel={(option) =>
                      `[${option.code}] ${resolveLocalizedText(intl.locale, option.nameArabic, option.nameEnglish)}`
                    }
                    value={selectedFinishedGood}
                    onChange={handleFinishedGoodChange}
                    loading={isItemsLoading}
                    disabled={isEdit}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        size="small"
                        label={intl.formatMessage({ id: 'finished-good-item', defaultMessage: 'Finished Good Item' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 0.001, step: 'any' }}
                    label={intl.formatMessage({ id: 'batch-size', defaultMessage: 'Batch Size' })}
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseFloat(e.target.value) || 0)}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    disabled
                    label={intl.formatMessage({ id: 'base-unit', defaultMessage: 'Base Unit' })}
                    value={baseUnitCode || '-'}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 1, step: 1 }}
                    label={intl.formatMessage({ id: 'version', defaultMessage: 'Version' })}
                    value={version}
                    onChange={(e) => setVersion(parseInt(e.target.value, 10) || 1)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label={intl.formatMessage({ id: 'routing-notes', defaultMessage: 'Routing / Process Notes' })}
                    value={routingNotes}
                    onChange={(e) => setRoutingNotes(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label={intl.formatMessage({ id: 'notes', defaultMessage: 'General Notes' })}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>

          {/* Component lines table */}
          <Grid item xs={12}>
            <SubCard
              title={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4">
                    <FormattedMessage id="bom-components" defaultMessage="BOM Components" /> ({lines.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<IconPlus size={16} />}
                    onClick={handleAddLine}
                  >
                    <FormattedMessage id="add-component" defaultMessage="Add Component" />
                  </Button>
                </Stack>
              }
              content={false}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={50}>#</TableCell>
                      <TableCell width={300}>
                        <FormattedMessage id="raw-material" defaultMessage="Raw Material Item" />
                      </TableCell>
                      <TableCell width={160}>
                        <FormattedMessage id="unit-of-measure" defaultMessage="Unit" />
                      </TableCell>
                      <TableCell width={130} align="right">
                        <FormattedMessage id="quantity" defaultMessage="Quantity" />
                      </TableCell>
                      <TableCell width={110} align="right">
                        <FormattedMessage id="scrap-percent" defaultMessage="Scrap %" />
                      </TableCell>
                      <TableCell width={120} align="right">
                        <FormattedMessage id="base-qty" defaultMessage="Base Qty" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="notes" defaultMessage="Notes" />
                      </TableCell>
                      <TableCell width={50} align="center">
                        <FormattedMessage id="action" defaultMessage="Action" />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map((line, index) => {
                      const selectedRawMaterial =
                        allItems.find((i) => i.id === line.rawMaterialItemId) ?? null;

                      return (
                        <TableRow key={index}>
                          <TableCell>{line.lineNumber}</TableCell>
                          <TableCell>
                            <Autocomplete
                              size="small"
                              options={allItems}
                              getOptionLabel={(option) =>
                                `[${option.code}] ${resolveLocalizedText(intl.locale, option.nameArabic, option.nameEnglish)}`
                              }
                              value={selectedRawMaterial}
                              onChange={(_, item) => handleLineItemChange(index, item)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder={intl.formatMessage({
                                    id: 'select-raw-material',
                                    defaultMessage: 'Select item'
                                  })}
                                />
                              )}
                            />
                          </TableCell>

                          <TableCell>
                            <BomLineUnitField
                              itemId={line.rawMaterialItemId}
                              baseUnitId={selectedRawMaterial?.baseUnitId}
                              value={line.unitOfMeasureId}
                              onUnitChange={(unitId, factor, code) =>
                                handleLineUnitChange(index, unitId, factor, code)
                              }
                            />
                          </TableCell>

                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ min: 0.0001, step: 'any', style: { textAlign: 'right' } }}
                              value={line.quantity}
                              onChange={(e) => handleLineQuantityChange(index, parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ min: 0, max: 100, step: 0.1, style: { textAlign: 'right' } }}
                              value={line.scrapPercentage}
                              onChange={(e) => handleLineScrapChange(index, parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {line.baseQuantity.toFixed(2)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={line.notes || ''}
                              onChange={(e) => handleLineNotesChange(index, e.target.value)}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={lines.length === 1}
                              onClick={() => handleRemoveLine(index)}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </SubCard>
          </Grid>

          {/* Action buttons */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                component={Link}
                to={isEdit && id ? `/manufacturing/boms/${id}` : '/manufacturing/boms'}
                variant="outlined"
              >
                <FormattedMessage id="cancel" defaultMessage="Cancel" />
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={isSubmitting}
                startIcon={<IconDeviceFloppy size={18} />}
              >
                <FormattedMessage id="save" defaultMessage="Save" />
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
