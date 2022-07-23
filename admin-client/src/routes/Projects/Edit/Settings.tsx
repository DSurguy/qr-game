import React, { useEffect, useState } from 'react';
import { Field, FieldAttributes, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Box, Checkbox, Text, useMantineTheme } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { ProjectSettings } from '@qr-game/types';
import { ADMIN_API_BASE } from '../../../constants';
import FormikNumberInput from '../../../components/inputs/FormikNumberInput';
import { AutoSave } from '../../../components/forms/AutoSave';

function useSaveForm (projectUuid: string) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<null | Error>(null)
  const save = (values: ProjectSettings, callback?: Function) => {
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        callback(true)
      } catch (e) {
        setError(e);
        callback(false)
      } finally {
        setIsSaving(false);
      }
    })()
  }
  return [
    save,
    isSaving,
    error,
  ] as const;
}

type ApiActionCallback = (actionWasSuccessful: boolean) => void;

const initialValues: ProjectSettings = {
  numPlayers: 50,
  duels: {
    allow: true,
    allowRematch: false
  }
}

const useProjectSettings = (projectUuid: string) => {
  const [settings, setSettings] = useState<null | ProjectSettings>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);

  /**
   * Load project settings from
   * @param callback A function that can perform cleanup actions, such as telling Formik loading is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const load = (callback?: ApiActionCallback) => {
    setIsLoading(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}/settings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if( result.status <= 299 && result.status >= 200 ) {
          setSettings(await result.json());
          setError(null);
          if( callback ) callback(true);
        }
        else if( result.status === 404 ) {
          setSettings({
            ...initialValues
          })
          setError(null)
          if( callback ) callback(true);
        }
        else {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
      } catch (e) {
        setError(e);
        if( callback ) callback(false)
      } finally {
        setIsLoading(false);
      }
    })()
  }

  /**
   * Save project settings to the server
   * @param values 
   * @param callback A function that can perform cleanup actions, such as telling Formik submission is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const save = (values: ProjectSettings, callback?: ApiActionCallback) => {
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        setSettings(values);
        setError(null);
        callback(true);
      } catch (e) {
        setError(e);
        callback(false)
      } finally {
        setIsSaving(false);
      }
    })()
  }

  return {
    settings,
    isSaving,
    isLoading,
    error,
    load,
    save
  } as const
}

export function Settings() {
  const { projectUuid } = useParams();
  const {settings, isSaving, isLoading, error, load, save} = useProjectSettings(projectUuid);

  useEffect(() => {
    load();
  }, [])

  const handleSubmit = (values: ProjectSettings, helpers: FormikHelpers<ProjectSettings>) => {
    if( isSaving ) return;
    save(values, () => helpers.setSubmitting(false));
  }

  const form = (
    <Box>
      <Formik
        initialValues={settings}
        onSubmit={handleSubmit}
      >
        <Form>
          <AutoSave />
          {error && <Text color="red">{error.message}</Text>}
          <Text component="h3" sx={{ fontSize: '1.5rem', margin: 0 }}>Players</Text>
          <Field
            name="numPlayers"
            component={FormikNumberInput}
            mantineProps={{
              sx: { width: '8rem' },
              label: "Number of Players"
            }}
          />
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
    {isLoading ? 'Loading...' : error ? 'Error' : 'Unknown state'}
  </Box>)

  return settings ? form : unLoadedForm;
}