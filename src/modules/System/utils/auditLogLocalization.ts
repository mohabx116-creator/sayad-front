import type { IntlShape } from 'react-intl';

const ACTION_MESSAGE_IDS: Record<string, string> = {
  PayrollPeriodApproved: 'audit-log.action.payroll-period-approved',
  PayrollPeriodRecalculated: 'audit-log.action.payroll-period-recalculated',
  PayrollPeriodReopened: 'audit-log.action.payroll-period-reopened',
  PayrollStatementsPaid: 'audit-log.action.payroll-statements-paid',
  PayrollPaymentRecordReversed: 'audit-log.action.payroll-payment-record-reversed',
  PayrollPaymentReversed: 'audit-log.action.payroll-payment-reversed',
  WorkerMonthlyMovementApproved: 'audit-log.action.worker-monthly-movement-approved',
  WorkerMonthlyMovementCreated: 'audit-log.action.worker-monthly-movement-created',
  WorkerCreated: 'audit-log.action.worker-created',
  RolePermissionsAssigned: 'audit-log.action.role-permissions-assigned',
  UserActivated: 'audit-log.action.user-activated',
  UserDeactivated: 'audit-log.action.user-deactivated',
  UserLocked: 'audit-log.action.user-locked',
  UserUnlocked: 'audit-log.action.user-unlocked',
  RoleActivated: 'audit-log.action.role-activated',
  RoleDeactivated: 'audit-log.action.role-deactivated',
  OperationalJobActivated: 'audit-log.action.operational-job-activated',
  OperationalJobDeactivated: 'audit-log.action.operational-job-deactivated'
};

const ENTITY_MESSAGE_IDS: Record<string, string> = {
  PayrollPeriod: 'audit-log.entity.payroll-period',
  PayrollPayment: 'audit-log.entity.payroll-payment',
  WorkerMonthlyMovement: 'audit-log.entity.worker-monthly-movement',
  Worker: 'audit-log.entity.worker',
  Role: 'audit-log.entity.role',
  User: 'audit-log.entity.user',
  SystemOwner: 'audit-log.entity.system-owner',
  OperationalJob: 'audit-log.entity.operational-job'
};

const PAYROLL_STATUS_MESSAGE_IDS: Record<string, string> = {
  draft: 'payroll-period-status-draft',
  calculated: 'payroll-period-status-calculated',
  approved: 'payroll-period-status-approved',
  paid: 'payroll-period-status-paid',
  partiallypaid: 'payroll-period-status-approved',
  unpaid: 'payroll-period-status-approved',
  '1': 'payroll-period-status-draft',
  '2': 'payroll-period-status-calculated',
  '3': 'payroll-period-status-approved',
  '4': 'payroll-period-status-paid'
};

function toMessageId(key: string, map: Record<string, string>) {
  return map[key];
}

export function humanizeAuditCode(code: string) {
  if (!code) {
    return code;
  }

  return code
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseAuditJson(json: string | null | undefined) {
  if (!json) {
    return null;
  }

  try {
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getAuditRecordValue(record: Record<string, unknown>, key: string): unknown {
  if (Object.hasOwn(record, key)) {
    return record[key];
  }

  const requestedKey = key.toLowerCase();
  const actualKey = Object.keys(record).find((entryKey) => entryKey.toLowerCase() === requestedKey);
  return actualKey ? record[actualKey] : undefined;
}

export function getAuditRecordValueByKeys(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.hasOwn(record, key)) {
      return record[key];
    }
  }

  return undefined;
}

export function localizeAuditAction(action: string, intl: IntlShape): string {
  const messageId = toMessageId(action, ACTION_MESSAGE_IDS);
  if (!messageId) {
    return humanizeAuditCode(action);
  }

  return intl.formatMessage({ id: messageId });
}

export function localizeAuditEntity(entity: string, intl: IntlShape): string {
  const messageId = toMessageId(entity, ENTITY_MESSAGE_IDS);
  if (!messageId) {
    return humanizeAuditCode(entity);
  }

  return intl.formatMessage({ id: messageId });
}

export function localizePayrollStatus(status: string | number | null | undefined, intl: IntlShape): string {
  if (status == null || status === '') {
    return 'Unknown';
  }

  const strStatus = String(status).toLowerCase();
  const messageId = PAYROLL_STATUS_MESSAGE_IDS[strStatus];
  if (!messageId) {
    return humanizeAuditCode(strStatus);
  }

  return intl.formatMessage({ id: messageId });
}

export function formatAuditValue(key: string, value: unknown, intl: IntlShape): string {
  if (value == null) {
    return '-';
  }

  const normalizedKey = key.toLowerCase();
  if (
    normalizedKey === 'status' ||
    normalizedKey === 'fromstatus' ||
    normalizedKey === 'tostatus' ||
    normalizedKey === 'oldstatus' ||
    normalizedKey === 'newstatus' ||
    normalizedKey.endsWith('status')
  ) {
    return localizePayrollStatus(value as string | number, intl);
  }

  if (typeof value === 'string') {
    if (normalizedKey.includes('date') || normalizedKey.includes('atutc')) {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return new Intl.DateTimeFormat(intl.locale, {
          dateStyle: 'medium',
          timeStyle: 'short'
        }).format(new Date(parsed));
      }
    }

    return value;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatAuditValue(key, item, intl)).join(', ');
  }

  if (isRecord(value)) {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export function formatAuditKey(key: string): string {
  return humanizeAuditCode(key);
}
