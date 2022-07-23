import React, { useEffect } from 'react';
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from 'formik';
import { Box, Checkbox, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { ProjectSettingsType } from '@qr-game/types';
import { AutoSave } from '../../../components/forms/AutoSave';
import { useServerResource } from '../../../hooks/useServerResource';

export function Settings() {
  const { projectUuid } = useParams();
  const {
    data: settings,
    isSaving,
    isLoading,
    loadError,
    saveError,
    load: loadSettings,
    update: saveSettings
  } = useServerResource<ProjectSettingsType, ProjectSettingsType>({
    update: `projects/${projectUuid}/settings`,
    load: `projects/${projectUuid}/settings`
  })

  useEffect(() => {
    loadSettings();
  }, [])

  const handleSubmit = (values: ProjectSettingsType, helpers: FormikHelpers<ProjectSettingsType>) => {
    if( isSaving ) return;
    saveSettings(values, () => helpers.setSubmitting(false));
  }

  const form = (
    <Box>
      <Formik
        initialValues={settings}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <AutoSave />
          {saveError && <Text color="red">{saveError.message}</Text>}
          <Text component="h3" sx={{ fontSize: '1.5rem', margin: 0, marginTop: '1rem' }}>Duels</Text>
          <Field
            name="duels.allow"
          >
            {({ field }: FieldAttributes<any>) => (
              <Checkbox
                {...field}
                checked={field.value}
                label="Allow Duels"
                sx={{ marginTop: '0.5rem' }}
              />
            )}
          </Field>
          <Field
            name="duels.allowRematch"
          >
            {({ field, form }: FieldAttributes<any>) => (
              <Checkbox
                {...field}
                checked={field.value}
                label="Allow Duel Rematch"
                sx={{ marginTop: '0.5rem' }}
                disabled={(form.values?.duels?.allow !== true)}
              />
            )}
          </Field>
        </Form>
      </Formik>
    </Box>
  );

  const unLoadedForm = (<Box>
    {isLoading ? 'Loading...' : loadError ? 'Error' : 'Unknown state'}
  </Box>)

  return settings ? form : unLoadedForm;
}