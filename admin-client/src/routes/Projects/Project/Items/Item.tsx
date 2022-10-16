import { Box, Button, Checkbox, Loader, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from 'formik';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Copy } from 'tabler-icons-react';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { itemToQrAsUrl } from '../../../../conversions/itemToQr';
import { useServerResource } from '../../../../hooks/useServerResource';
import { ProjectItem } from '../../../../qr-types';
import copyToClipboardWithNotify from '../../../../utilities/copyToClipboardWithNotify';
import { DeleteItemModal } from './DeleteItemModal';
import { Tags } from '../../../../components/Tags';

export function ItemRoute() {
  const { projectUuid, itemUuid } = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const {
    data: item,
    isLoading,
    isSaving,
    loadError,
    saveError,
    load,
    update
  } = useServerResource<ProjectItem, ProjectItem>({
    load: `projects/${projectUuid}/items/${itemUuid}`,
    update: `projects/${projectUuid}/items/${itemUuid}`,
  })
  const theme = useMantineTheme();
  const [qrCode, setQrCode] = useState<null | string>(null)
  const [qrCodeError, setQrCodeError] = useState<null | Error>(null);

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    ( async () => {
      try {
        if( item ) {
          const code = await itemToQrAsUrl(item);
          setQrCode(code);
          setQrCodeError(null);
        }
      } catch (e) {
        setQrCodeError(e);
      }
    })();
  }, [item])

  const handleSubmit = (values: ProjectItem, helpers: FormikHelpers<ProjectItem>) => {
    if( isSaving ) return;
    update(values, () => {
      helpers.setSubmitting(false)
    });
  }

  const onDeleteModalClose = (didDelete: boolean) => {
    if( didDelete ) navigate('..');
  }

  const portalLink = `${PROCESS_ENV_CLIENT_ORIGIN}/portal?projectUuid=${projectUuid}&type=item&uuid=${itemUuid}`;

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading item"}</Text>
  if( !item ) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
        <Button
          compact
          variant="subtle"
          component={Link}
          to=".."
          leftIcon={<ChevronLeft size={16} />}
        >Back</Button>
        <Button compact variant="subtle" leftIcon={<Copy />} onClick={() => copyToClipboardWithNotify(portalLink)}>Copy Portal Link</Button>
      </Box>
      <Box sx={{ marginTop: '1rem'}}>
        <Formik initialValues={item} onSubmit={handleSubmit} enableReinitialize>
          {({ dirty }) => (
            <Form>
              {saveError && <Text color="red">{saveError.message}</Text>}
              <Field name="name" as={TextInput} label="Activity Name" />
              <Field name="description" as={Textarea} label="Description" sx={{ marginTop: theme.spacing['xs'] }} />
              <Field
                name="cost"
                component={FormikNumberInput}
                mantineProps={{
                  sx: { width: '8rem' },
                  label: "Cost"
                }}
              />
              <Field
                name="availableForPurchase"
              >
                {({ field }: FieldAttributes<any>) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    label="Is Available For Purchase?"
                    sx={{ marginTop: '0.5rem' }}
                  />
                )}
              </Field>
              <Field
                name="canPurchaseMultiple"
              >
                {({ field }: FieldAttributes<any>) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    label="Can Purchase Multiple?"
                    sx={{ marginTop: '0.5rem' }}
                  />
                )}
              </Field>
              <Field name="redemptionChallenge" as={TextInput} label="Redemption Challenge" />
              <Box sx={{ display: 'flex' }}>
                {dirty && <Button type="submit" loading={isSaving} sx={{
                  marginTop: theme.spacing['xs']
                }}>Save Item</Button>}
                <Button onClick={() => setDeleteModalOpen(true)} type="button" color="red" disabled={isSaving} sx={{
                  marginTop: theme.spacing['xs'],
                  marginLeft: 'auto'
                }}>Delete Item</Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
      <Box>
        { qrCodeError && qrCodeError.message }
        { qrCode && <img src={qrCode} /> }
      </Box>
      <Box>
        <Tags resourceType="items" resourceUuid={itemUuid} />
      </Box>
      <DeleteItemModal opened={deleteModalOpen} onClose={onDeleteModalClose} item={item} />
    </Box>
  )
}