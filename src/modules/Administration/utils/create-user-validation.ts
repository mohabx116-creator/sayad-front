import type { IntlShape } from 'react-intl';

import type { ApiResponse } from 'types/api';

import type { CreateUserValidationMessages } from '../schemas/user.schema';

export type CreateUserFieldName = 'displayName' | 'email' | 'password' | 'confirmPassword' | 'roleIds';

export type CreateUserValidationState = {
  summary: string;
  fieldErrors: Partial<Record<CreateUserFieldName, string>>;
};

export function buildCreateUserValidationMessages(intl: IntlShape): CreateUserValidationMessages {
  return {
    displayNameRequired: intl.formatMessage({ id: 'create-user-display-name-required', defaultMessage: 'Full name is required.' }),
    displayNameTooLong: intl.formatMessage({ id: 'create-user-display-name-too-long', defaultMessage: 'Full name must be 200 characters or less.' }),
    emailRequired: intl.formatMessage({ id: 'create-user-email-required', defaultMessage: 'Email is required.' }),
    emailInvalid: intl.formatMessage({ id: 'create-user-email-invalid', defaultMessage: 'Enter a valid email address.' }),
    emailTooLong: intl.formatMessage({ id: 'create-user-email-too-long', defaultMessage: 'Email must be 320 characters or less.' }),
    passwordConfirmationMismatch: intl.formatMessage({
      id: 'create-user-password-mismatch',
      defaultMessage: 'The password confirmation does not match.'
    }),
    passwordPolicy: intl.formatMessage({
      id: 'create-user-weak-password',
      defaultMessage: 'Password must be at least 10 characters and include uppercase, lowercase, number, and special character.'
    }),
    roleRequired: intl.formatMessage({ id: 'create-user-no-role-selected', defaultMessage: 'Select at least one active role.' }),
    inactiveRole: intl.formatMessage({
      id: 'create-user-inactive-role',
      defaultMessage: 'The selected role is inactive. Choose an active role to create the user.'
    }),
    roleNotFound: intl.formatMessage({
      id: 'create-user-role-not-found',
      defaultMessage: 'One or more selected roles could not be found.'
    }),
    duplicateRole: intl.formatMessage({
      id: 'create-user-duplicate-role',
      defaultMessage: 'The same role was selected more than once.'
    })
  };
}

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function classifyValidationMessage(message: string, intl: IntlShape): Partial<Record<CreateUserFieldName, string>> {
  const normalized = normalizeText(message);

  if (!normalized) return {};

  if (normalized.includes('email') && (normalized.includes('already exists') || normalized.includes('duplicate'))) {
    return { email: intl.formatMessage({ id: 'create-user-duplicate-email', defaultMessage: 'This email is already in use.' }) };
  }

  if (normalized.includes('email') && (normalized.includes('valid') || normalized.includes('invalid'))) {
    return { email: intl.formatMessage({ id: 'create-user-email-invalid', defaultMessage: 'Enter a valid email address.' }) };
  }

  if (normalized.includes('password confirmation does not match') || (normalized.includes('confirm') && normalized.includes('match'))) {
    return {
      confirmPassword: intl.formatMessage({
        id: 'create-user-password-mismatch',
        defaultMessage: 'The password confirmation does not match.'
      })
    };
  }

  if (normalized.includes('password must be at least') || (normalized.includes('password') && normalized.includes('uppercase'))) {
    return {
      password: intl.formatMessage({
        id: 'create-user-weak-password',
        defaultMessage: 'Password must be at least 10 characters and include uppercase, lowercase, number, and special character.'
      })
    };
  }

  if (normalized.includes('inactive') && normalized.includes('role')) {
    return { roleIds: intl.formatMessage({ id: 'create-user-inactive-role', defaultMessage: 'The selected role is inactive.' }) };
  }

  if (normalized.includes('role') && normalized.includes('not found')) {
    return { roleIds: intl.formatMessage({ id: 'create-user-role-not-found', defaultMessage: 'One or more selected roles could not be found.' }) };
  }

  if (normalized.includes('role') && normalized.includes('invalid')) {
    return { roleIds: intl.formatMessage({ id: 'create-user-role-not-found', defaultMessage: 'One or more selected roles could not be found.' }) };
  }

  if (normalized.includes('duplicate role')) {
    return {
      roleIds: intl.formatMessage({
        id: 'create-user-duplicate-role',
        defaultMessage: 'The same role was selected more than once.'
      })
    };
  }

  if (normalized.includes('display name') || normalized.includes('name is required')) {
    return { displayName: intl.formatMessage({ id: 'create-user-display-name-required', defaultMessage: 'Full name is required.' }) };
  }

  return {};
}

export function resolveCreateUserValidationState(error: unknown, intl: IntlShape): CreateUserValidationState {
  const apiError = error as { response?: { data?: ApiResponse<unknown> } } | undefined;
  const response = apiError?.response?.data;
  const messages = [
    ...(response?.errors ?? []),
    typeof response?.message === 'string' ? response.message : '',
    error instanceof Error ? error.message : ''
  ]
    .map((message) => message.trim())
    .filter((message) => {
      const normalized = normalizeText(message);
      return Boolean(message) && normalized !== 'validation failed.' && normalized !== 'validation failed' && normalized !== 'request failed';
    });

  const fieldErrors: Partial<Record<CreateUserFieldName, string>> = {};
  const summaryMessages: string[] = [];

  messages.forEach((message) => {
    const classified = classifyValidationMessage(message, intl);
    const fieldName = Object.keys(classified)[0] as CreateUserFieldName | undefined;

    if (fieldName) {
      fieldErrors[fieldName] = classified[fieldName]!;
      return;
    }

    summaryMessages.push(message);
  });

  return {
    fieldErrors,
    summary:
      summaryMessages[0] ??
      intl.formatMessage({
        id: 'create-user-failed-summary',
        defaultMessage: 'The user could not be created. Review the entered data and try again.'
      })
  };
}
