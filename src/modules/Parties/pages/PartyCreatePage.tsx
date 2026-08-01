import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { createParty, deactivateParty } from '../api/partiesApi';
import PartyForm, { cleanCreate, emptyCreateValues, type PartyFormValues } from '../components/PartyForm';

export default function PartyCreatePage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: PartyFormValues) => {
    try {
      setIsSaving(true);
      const party = await createParty(cleanCreate(values));
      if (!values.isActive) {
        await deactivateParty(party.id);
      }
      notify(intl.formatMessage({ id: 'parties-action-success' }));
      navigate(`/parties/${party.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="create-party" links={[{ title: 'parties', to: '/parties' }, { title: 'create-party' }]} />
      <MainCard title={<FormattedMessage id="create-party" />}>
        <PartyForm mode="create" initialValues={emptyCreateValues} isSaving={isSaving} onSubmit={save} onCancel={() => navigate('/parties')} />
      </MainCard>
    </>
  );
}
