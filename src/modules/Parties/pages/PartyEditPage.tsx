import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { updateParty } from '../api/partiesApi';
import PartyForm, { cleanUpdate, type PartyFormValues } from '../components/PartyForm';
import { useParty } from '../hooks/useParties';

export default function PartyEditPage() {
  const { id } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { party, error, isLoading } = useParty(id);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: PartyFormValues) => {
    if(!id) return;
    try {
      setIsSaving(true);
      await updateParty(id, cleanUpdate(values));
      notify(intl.formatMessage({ id: 'parties-action-success' }));
      navigate(`/parties/${id}`);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="edit-party" links={[{ title: 'parties', to: '/parties' }, { title: 'party-details', to: id ? `/parties/${id}` : '/parties' }, { title: 'edit-party' }]} />
      <MainCard title={<FormattedMessage id="edit-party" />}>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="parties-load-error" /></Typography>}
        {party && (
          <PartyForm
            mode="edit"
            initialValues={{
              nameArabic: party.nameArabic,
              nameEnglish: party.nameEnglish ?? '',
              isCustomer: party.isCustomer,
              isSupplier: party.isSupplier,
              primaryPhone: party.primaryPhone ?? '',
              secondaryPhone: party.secondaryPhone ?? '',
              email: party.email ?? '',
              address: party.address ?? '',
              notes: party.notes ?? '',
              openingBalance: null,
              rowVersion: party.rowVersion
            }}
            isSaving={isSaving}
            onSubmit={save}
            onCancel={() => navigate(id ? `/parties/${id}` : '/parties')}
          />
        )}
      </MainCard>
    </>
  );
}
