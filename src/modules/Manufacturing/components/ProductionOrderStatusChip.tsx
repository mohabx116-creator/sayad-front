import React from 'react';
import Chip from '@mui/material/Chip';
import type { ProductionStatus } from '../types/manufacturing.types';

interface Props {
  status: ProductionStatus;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<
  ProductionStatus,
  { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }
> = {
  Draft: { label: 'Draft', color: 'default' },
  Approved: { label: 'Approved', color: 'info' },
  Released: { label: 'Released', color: 'primary' },
  InProgress: { label: 'In Progress', color: 'warning' },
  Completed: { label: 'Completed', color: 'secondary' },
  Closed: { label: 'Closed', color: 'success' },
  Cancelled: { label: 'Cancelled', color: 'error' }
};

export default function ProductionOrderStatusChip({ status, size = 'small' }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'default' as const };
  return <Chip size={size} label={config.label} color={config.color} />;
}
