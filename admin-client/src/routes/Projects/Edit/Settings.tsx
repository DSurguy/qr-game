import React, { useEffect, useState } from 'react';
import { Field, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Box, Button, Checkbox, NumberInput, Text, Textarea, useMantineTheme } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ADMIN_API_BASE } from '../../../constants';
import { ProjectSettings } from '@qr-game/types';
import FormikNumberInput from '../../../components/inputs/FormikNumberInput';

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

const AutoSave = ({ duration = 1000 }: { duration?: number }) => {
  const formik = useFormikContext();
  const [timeoutId, setTimeoutId] = useState(0);
  const [initial, setInitial] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => () => {
    if( timeoutId ) clearTimeout(timeoutId);
  }, [])

  useEffect(() => {
    if( initial ) {
      setInitial(false);
      return;
    }
    if( timeoutId ) clearTimeout(timeoutId)
    setTimeoutId(setTimeout(() => {
      formik.submitForm()
      setSaved(true);
      setTimeoutId(0)
    }, duration))
  }, [formik.values])

  let content = null;
  if( timeoutId ) content = "debouncing"
  else if( formik.isSubmitting ) content = "submitting"
  else if( Object.keys(formik.errors || {}).length ) content = "failed"
  else if( saved ) content = "saved"
  return <span>{content}</span>
}

export function Settings() {
  const initialValues: ProjectSettings = {
    numPlayers: 50,
    duels: {
      allow: true,
      allowRematch: false
    }
  }
  const theme = useMantineTheme()
  const { projectUuid } = useParams();
  const [save, isSaving, error] = useSaveForm(projectUuid);

  const handleSubmit = (values: ProjectSettings, helpers: FormikHelpers<ProjectSettings>) => {
    if( isSaving ) return;
    save(values, () => helpers.setSubmitting(false));
  }

  return <Box>
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      <Form>
        <AutoSave />
        {error && <Text color="red">{error.message}</Text>}
        <Field
          name="numPlayers"
          component={FormikNumberInput}
          label="Number of Players"
        />
        <Field
          name="duels.allow"
          as={Checkbox}
          label="Allow Duels"
        />
        <Field
          name="duels.allowRematch"
          as={Checkbox}
          label="Allow Duel Rematch"
        />
      </Form>
    </Formik>
  </Box>
}