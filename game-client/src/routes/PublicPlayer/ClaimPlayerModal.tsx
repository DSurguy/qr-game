import React, { useContext } from 'react';
import { Button, Modal, Text, TextInput, useMantineTheme } from '@mantine/core';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { GamePlayer, PluginModifiedPayloadResponse } from '../../qr-types';
import { useServerResource } from '../../hooks/useServerResource';
import { showNotification } from '@mantine/notifications';
import { Check } from 'tabler-icons-react';
import { useNavigate } from 'react-router-dom';
import { HookResponseContext } from '../../context/hookResponse';

type Props = {
  opened: boolean;
  onClose: () => void;
  playerUuid: string;
  projectUuid: string;
}

type ClaimPayload = {
  projectUuid: string;
  displayName: string;
  realName: string;
}

interface ClaimResponse extends PluginModifiedPayloadResponse, GamePlayer {}

export default function ClaimPlayerModal ({ opened, onClose, playerUuid, projectUuid }: Props) {
  const { addResponses } = useContext(HookResponseContext);
  const navigate = useNavigate();
  const {
    isSaving: isClaiming,
    saveError: claimError,
    create: claim
  } = useServerResource<ClaimPayload, ClaimResponse>({
    create: `public/player/${playerUuid}/claim`,
  })
  const theme = useMantineTheme();

  const handleSubmit = (values: ClaimPayload, helpers: FormikHelpers<ClaimPayload>) => {
    if( isClaiming ) return;
    claim(values, (wasSuccessful, data) => {
      helpers.setSubmitting(false)
      if( wasSuccessful ) {
        if( data?.hooks?.claimPlayer?.length ) addResponses(data.hooks.claimPlayer);
        showNotification({
          title: "Player Claimed",
          message: "Logging in...",
          icon: <Check />,
          autoClose: 2000
        })
        //TODO: Perhaps handle this more gracefully...
        navigate(`/portal?projectUuid=${projectUuid}&type=player&uuid=${playerUuid}&suppressNotifications`)
        onClose();
      }
    });
  }

  return <Modal opened={opened} onClose={onClose} title="Claim Player">
    <Formik initialValues={{
      projectUuid,
      displayName: "",
      realName: ""
    }} onSubmit={handleSubmit} enableReinitialize>
      {({ dirty, values }) => (
        <Form>
          {claimError && <Text color={theme.colors['errorColor'][4]}>{claimError.message}</Text>}
          <Field name="displayName" as={TextInput} label="Display Name" required sx={{ marginTop: '1rem' }} />
          <Field name="realName" as={TextInput} label="Your Real Name" sx={{ marginTop: '1rem' }} />
          {<Button type="submit" disabled={!dirty || !values.displayName} loading={isClaiming} sx={{
            marginTop: '1rem'
          }}>Claim</Button>}
        </Form>
      )}
    </Formik>
  </Modal>
}