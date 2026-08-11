import type { IntlShape } from 'react-intl';

const CHECK_TITLE_IDS: Record<string, string> = {
  'treasury-integrity': 'system-maintenance.checks.treasury-integrity.title',
  'party-ledger-integrity': 'system-maintenance.checks.party-ledger-integrity.title',
  'invoice-outstanding-integrity': 'system-maintenance.checks.invoice-outstanding-integrity.title',
  'orphan-record-detection': 'system-maintenance.checks.orphan-record-detection.title'
};

const CHECK_DESCRIPTION_IDS: Record<string, string> = {
  'treasury-integrity': 'system-maintenance.checks.treasury-integrity.description',
  'party-ledger-integrity': 'system-maintenance.checks.party-ledger-integrity.description',
  'invoice-outstanding-integrity': 'system-maintenance.checks.invoice-outstanding-integrity.description',
  'orphan-record-detection': 'system-maintenance.checks.orphan-record-detection.description'
};

type IssuePattern = {
  code: string;
  pattern: RegExp;
  messageId: string;
};

const ISSUE_PATTERNS: IssuePattern[] = [
  {
    code: 'treasury-integrity',
    pattern: /^(\d+) payment voucher\(s\) are missing posting links\.$/,
    messageId: 'system-maintenance.checks.treasury-integrity.issue.payment-vouchers-missing-links'
  },
  {
    code: 'treasury-integrity',
    pattern: /^(\d+) receipt voucher\(s\) are missing posting links\.$/,
    messageId: 'system-maintenance.checks.treasury-integrity.issue.receipt-vouchers-missing-links'
  },
  {
    code: 'treasury-integrity',
    pattern: /^(\d+) transfer voucher\(s\) are missing posting links\.$/,
    messageId: 'system-maintenance.checks.treasury-integrity.issue.transfer-vouchers-missing-links'
  },
  {
    code: 'party-ledger-integrity',
    pattern: /^(\d+) reversal entry\(s\) are missing a source entry\.$/,
    messageId: 'system-maintenance.checks.party-ledger-integrity.issue.reversal-entry-missing-source'
  },
  {
    code: 'party-ledger-integrity',
    pattern: /^(\d+) ledger entry\(s\) have an unexpected reversal reference\.$/,
    messageId: 'system-maintenance.checks.party-ledger-integrity.issue.unexpected-reversal-reference'
  },
  {
    code: 'invoice-outstanding-integrity',
    pattern: /^(\d+) posted sales invoice\(s\) are missing party ledger links\.$/,
    messageId: 'system-maintenance.checks.invoice-outstanding-integrity.issue.sales-invoice-missing-ledger'
  },
  {
    code: 'invoice-outstanding-integrity',
    pattern: /^(\d+) posted purchase invoice\(s\) are missing party ledger links\.$/,
    messageId: 'system-maintenance.checks.invoice-outstanding-integrity.issue.purchase-invoice-missing-ledger'
  },
  {
    code: 'invoice-outstanding-integrity',
    pattern: /^(\d+) posted sales return\(s\) are missing party ledger links\.$/,
    messageId: 'system-maintenance.checks.invoice-outstanding-integrity.issue.sales-return-missing-ledger'
  },
  {
    code: 'invoice-outstanding-integrity',
    pattern: /^(\d+) posted purchase return\(s\) are missing party ledger links\.$/,
    messageId: 'system-maintenance.checks.invoice-outstanding-integrity.issue.purchase-return-missing-ledger'
  },
  {
    code: 'orphan-record-detection',
    pattern: /^(\d+) party-item relation\(s\) look incomplete\.$/,
    messageId: 'system-maintenance.checks.orphan-record-detection.issue.party-item-relations-incomplete'
  },
  {
    code: 'orphan-record-detection',
    pattern: /^(\d+) audit log entry\(s\) are incomplete\.$/,
    messageId: 'system-maintenance.checks.orphan-record-detection.issue.audit-logs-incomplete'
  }
];

export function localizeSystemMaintenanceCheckTitle(code: string, intl: IntlShape) {
  const messageId = CHECK_TITLE_IDS[code];
  return messageId ? intl.formatMessage({ id: messageId }) : code;
}

export function localizeSystemMaintenanceCheckDescription(code: string, intl: IntlShape) {
  const messageId = CHECK_DESCRIPTION_IDS[code];
  return messageId ? intl.formatMessage({ id: messageId }) : code;
}

export function localizeSystemMaintenanceIssue(code: string, issue: string, intl: IntlShape) {
  const pattern = ISSUE_PATTERNS.find((entry) => entry.code === code && entry.pattern.test(issue));

  if (!pattern) {
    return issue;
  }

  const match = issue.match(pattern.pattern);
  const count = Number(match?.[1] ?? 0);
  return intl.formatMessage({ id: pattern.messageId }, { count });
}
