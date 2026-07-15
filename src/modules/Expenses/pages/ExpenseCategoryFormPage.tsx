import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams, Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconInfoCircle } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import MainCard from 'ui-component/cards/MainCard';
import Loader from 'ui-component/Loader';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

import { getExpenseCategory, createExpenseCategory, updateExpenseCategory } from '../api/expensesApi';
import type { ExpenseCategoryInput } from '../types/expense.types';

export default function ExpenseCategoryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [rowVersion, setRowVersion] = useState('');

  const [form, setForm] = useState<ExpenseCategoryInput>({
    code: '',
    nameArabic: '',
    nameEnglish: '',
    description: '',
    displayOrder: 1
  });

  useEffect(() => {
    if (isEdit && id) {
      getExpenseCategory(id)
        .then((data) => {
          setForm({
            code: data.code,
            nameArabic: data.nameArabic,
            nameEnglish: data.nameEnglish,
            description: data.description,
            displayOrder: data.displayOrder
          });
          setRowVersion(data.rowVersion);
        })
        .catch((error) => {
          dispatch(openSnackbar({ open: true, message: error.message, variant: 'alert', severity: 'error' }));
          navigate('/expenses/categories');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit, dispatch, navigate]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEdit && id) {
        await updateExpenseCategory(id, { ...form, rowVersion });
        notify(intl.formatMessage({ id: 'expenses.category-updated', defaultMessage: 'تم تعديل التصنيف بنجاح' }));
      } else {
        await createExpenseCategory(form);
        notify(intl.formatMessage({ id: 'expenses.category-created', defaultMessage: 'تم إنشاء التصنيف بنجاح' }));
      }
      navigate('/expenses/categories');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          card={false}
          title={false}
          divider={false}
          heading={isEdit ? 'expenses.edit-category' : 'expenses.create-category'}
          links={[
            { title: 'expenses', to: '/expenses' },
            { title: 'expenses.categories', to: '/expenses/categories' },
            { title: isEdit ? 'edit' : 'create' }
          ]}
          sx={{ mb: 0 }}
        />
        <PageTitle>
          <FormattedMessage id={isEdit ? 'expenses.edit-category' : 'expenses.create-category'} />
        </PageTitle>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <MainCard
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
                  <Typography variant="h4" fontWeight={600}>
                    <FormattedMessage id="basic-information" defaultMessage="المعلومات الأساسية" />
                  </Typography>
                </Box>
              }
              sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={<FormattedMessage id="code" defaultMessage="الكود" />}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    required
                    label={<FormattedMessage id="display-order" defaultMessage="ترتيب العرض" />}
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={<FormattedMessage id="name-arabic" defaultMessage="الاسم (عربي)" />}
                    value={form.nameArabic}
                    onChange={(e) => setForm({ ...form, nameArabic: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="name-english" defaultMessage="الاسم (إنجليزي)" />}
                    value={form.nameEnglish || ''}
                    onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={<FormattedMessage id="description" defaultMessage="الوصف" />}
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSaving || !form.code || !form.nameArabic}
                >
                  <FormattedMessage id="save" defaultMessage="حفظ" />
                </Button>
                <Button component={Link} to="/expenses/categories" variant="outlined" color="inherit" fullWidth disabled={isSaving}>
                  <FormattedMessage id="cancel" defaultMessage="إلغاء" />
                </Button>
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
