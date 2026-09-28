import { useEffect, useState } from 'react';

import { IconBriefcase, IconPackage, IconUsers } from '@tabler/icons-react';

import { listInvoices as listSalesInvoices } from 'modules/Sales/api/salesApi';
import type { SalesInvoiceListItem } from 'modules/Sales/types/sales.types';
import { listInvoices as listPurchaseInvoices } from 'modules/Purchases/api/purchasesApi';
import type { PurchaseInvoiceListItem } from 'modules/Purchases/types/purchases.types';
import { getParties } from 'modules/Parties/api/partiesApi';
import type { PartyDto } from 'modules/Parties/types/parties.types';
import { getItems } from 'modules/Inventory/api/inventoryApi';
import type { ItemDto } from 'modules/Inventory/types/inventory.types';
import { getWorkers } from 'modules/Workers/api/workersApi';
import type { WorkerListItemDto } from 'modules/Workers/types/workers.types';
import { hasPermission } from 'modules/Administration/utils/permission-utils';
import type { UserProfile } from 'types/user-profile';

import type { GlobalSearchEntry, GlobalSearchScope } from './search-navigation-utils';

export type EntitySearchGroup = {
  kind: 'party' | 'item' | 'worker' | 'sales-invoice' | 'purchase-invoice';
  entries: GlobalSearchEntry[];
  loading: boolean;
  error: boolean;
};

const emptyGroups: EntitySearchGroup[] = [
  { kind: 'party', entries: [], loading: false, error: false },
  { kind: 'item', entries: [], loading: false, error: false },
  { kind: 'worker', entries: [], loading: false, error: false },
  { kind: 'sales-invoice', entries: [], loading: false, error: false },
  { kind: 'purchase-invoice', entries: [], loading: false, error: false }
];

function rank(values: Array<string | null | undefined>, query: string) {
  const normalized = query.toLocaleLowerCase();
  const value = values.find((candidate) => candidate?.toLocaleLowerCase().includes(normalized));
  if (!value) return 3;
  const normalizedValue = value.toLocaleLowerCase();
  return normalizedValue === normalized ? 0 : normalizedValue.startsWith(normalized) ? 1 : 2;
}

function sortEntries(entries: GlobalSearchEntry[], query: string) {
  return entries.sort((left, right) => (rank([left.title, left.subtitle, left.detail], query) - rank([right.title, right.subtitle, right.detail], query)));
}

function mapParties(items: PartyDto[], query: string): GlobalSearchEntry[] {
  return sortEntries(items.slice(0, 5).map((party) => ({
    id: `party-${party.id}`,
    kind: 'party' as const,
    title: party.nameArabic || party.nameEnglish || party.code,
    subtitle: party.nameEnglish || undefined,
    detail: party.code,
    route: `/parties/${party.id}`,
    icon: IconUsers
  })), query);
}

function mapItems(items: ItemDto[], query: string): GlobalSearchEntry[] {
  return sortEntries(items.slice(0, 5).map((item) => ({
    id: `item-${item.id}`,
    kind: 'item' as const,
    title: item.nameArabic || item.nameEnglish || item.code,
    subtitle: item.nameEnglish || undefined,
    detail: item.code,
    route: `/inventory/items/${item.id}`,
    icon: IconPackage
  })), query);
}

function mapWorkers(items: WorkerListItemDto[], query: string): GlobalSearchEntry[] {
  return sortEntries(items.slice(0, 5).map((worker) => ({
    id: `worker-${worker.id}`,
    kind: 'worker' as const,
    title: worker.name,
    subtitle: worker.operationalJobName || undefined,
    detail: worker.code,
    route: `/labor/workers/${worker.id}`,
    icon: IconBriefcase
  })), query);
}

function mapSalesInvoices(items: SalesInvoiceListItem[], query: string): GlobalSearchEntry[] {
  return sortEntries(items.slice(0, 5).map((invoice) => ({
    id: `sales-invoice-${invoice.id}`,
    kind: 'sales-invoice' as const,
    title: invoice.number,
    subtitle: invoice.customerNameArabic || invoice.customerNameEnglish || invoice.customerCode,
    detail: invoice.customerReferenceNumber || invoice.customerCode,
    route: `/sales/invoices/${invoice.id}`,
    icon: IconPackage
  })), query);
}

function mapPurchaseInvoices(items: PurchaseInvoiceListItem[], query: string): GlobalSearchEntry[] {
  return sortEntries(items.slice(0, 5).map((invoice) => ({
    id: `purchase-invoice-${invoice.id}`,
    kind: 'purchase-invoice' as const,
    title: invoice.number,
    subtitle: invoice.supplierNameArabic || invoice.supplierNameEnglish || invoice.supplierCode,
    detail: invoice.supplierInvoiceNumber || invoice.supplierCode,
    route: `/purchases/invoices/${invoice.id}`,
    icon: IconPackage
  })), query);
}

export default function useGlobalEntitySearch(query: string, user: UserProfile | null | undefined, scope: GlobalSearchScope = 'all') {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [groups, setGroups] = useState(emptyGroups);
  const meaningfulQuery = query.trim().length >= 2;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!meaningfulQuery || debouncedQuery.length < 2) {
      setGroups(emptyGroups);
      return;
    }

    let active = true;
    const canSearch = {
      party: (scope === 'all' || scope === 'parties') && hasPermission(user, 'parties.view'),
      item: (scope === 'all' || scope === 'items') && hasPermission(user, 'inventory.items.view'),
      worker: (scope === 'all' || scope === 'workers') && hasPermission(user, 'labor.workers.view'),
      'sales-invoice': (scope === 'all' || scope === 'sales') && hasPermission(user, 'sales.invoices.view'),
      'purchase-invoice': (scope === 'all' || scope === 'purchases') && hasPermission(user, 'purchases.invoices.view')
    };
    const nextGroups = emptyGroups.map((group) => ({ ...group, loading: canSearch[group.kind] }));
    setGroups(nextGroups);

    const update = (kind: EntitySearchGroup['kind'], entries: GlobalSearchEntry[] = [], error = false) => {
      if (!active) return;
      setGroups((current) => current.map((group) => (group.kind === kind ? { ...group, entries, loading: false, error } : group)));
    };

    if (canSearch.party) getParties({ page: 1, pageSize: 5, search: debouncedQuery }).then((items) => update('party', mapParties(items, debouncedQuery))).catch(() => update('party', [], true));
    if (canSearch.item) getItems({ page: 1, pageSize: 5, search: debouncedQuery }).then((items) => update('item', mapItems(items, debouncedQuery))).catch(() => update('item', [], true));
    if (canSearch.worker) getWorkers({ page: 1, pageSize: 5, search: debouncedQuery }).then((items) => update('worker', mapWorkers(items, debouncedQuery))).catch(() => update('worker', [], true));
    if (canSearch['sales-invoice']) listSalesInvoices({ page: 1, pageSize: 5, search: debouncedQuery }).then(({ items }) => update('sales-invoice', mapSalesInvoices(items, debouncedQuery))).catch(() => update('sales-invoice', [], true));
    if (canSearch['purchase-invoice']) listPurchaseInvoices({ page: 1, pageSize: 5, search: debouncedQuery }).then(({ items }) => update('purchase-invoice', mapPurchaseInvoices(items, debouncedQuery))).catch(() => update('purchase-invoice', [], true));

    return () => {
      active = false;
    };
  }, [debouncedQuery, meaningfulQuery, scope, user]);

  return { groups, meaningfulQuery, loading: groups.some((group) => group.loading) };
}
