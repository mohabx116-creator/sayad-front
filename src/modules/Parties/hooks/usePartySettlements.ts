import { useCallback, useMemo } from 'react';

import { createPartySettlement } from '../api/partiesApi';
import type { PartySettlementRequest } from '../types/parties.types';

export function usePartySettlementActions() {
  const createSettlement = useCallback((partyId: string, request: PartySettlementRequest) => {
    return createPartySettlement(partyId, request);
  }, []);

  return useMemo(
    () => ({
      createSettlement
    }),
    [createSettlement]
  );
}
