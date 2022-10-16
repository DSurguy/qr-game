import { Box, Button, Grid, Text, TextInput } from '@mantine/core';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DeviceFloppy, Loader, Plus, Trash } from 'tabler-icons-react';
import { useServerResource } from '../../../../hooks/useServerResource';
import { Tag } from '../../../../qr-types';

type NewTagItemsProps = {
  projectUuid: string;
  itemUuid: string;
  onSave: () => void;
}

export function NewTagItem({ projectUuid, itemUuid, onSave }: NewTagItemsProps) {

  const {
    isSaving,
    saveError,
    create,
  } = useServerResource<Tag, void>({
    create: `projects/${projectUuid}/items/${itemUuid}/tags`
  })

  const onSubmit = (values: Tag, helpers: FormikHelpers<Tag>) => {
    create(values, wasSuccessful => {
      helpers.setSubmitting(false);
      if( wasSuccessful ) {
        onSave();
        helpers.resetForm();
      }
    })
  }

  return <Formik onSubmit={onSubmit} initialValues={{ tag: "", value: ""}}>
    {({ dirty }) => (
      <Form>
        <Grid>
          { saveError && <Text color="red">{saveError.message}</Text>}
          <Grid.Col xs={5}>
            <Field
              as={TextInput}
              name="tag"
              placeholder="New Tag"
              required
            />
          </Grid.Col>
          <Grid.Col xs={5}>
            <Field
              as={TextInput}
              name="value"
              placeholder="New Value"
              required
            />
          </Grid.Col>
          <Grid.Col xs={2} sx={{ display: 'flex', justifyContent: 'space-around'}}>
            <Button
              disabled={ !dirty || isSaving }
              sx={{ padding: '0 0.5rem'}}
              type="submit"
            >
              { isSaving ? <Loader /> : <Plus /> }
            </Button>
          </Grid.Col>
        </Grid>
      </Form>
    )}
  </Formik>
}

type TagListItemProps = {
  tag: Tag;
  projectUuid: string;
  itemUuid: string;
  onSave: () => void;
  onRemove: () => void;
}

export function TagListItem({ tag, projectUuid, itemUuid, onSave, onRemove }: TagListItemProps) {
  const [initialValues, setInitialValues] = useState(tag);

  const {
    isSaving,
    saveError,
    update,
  } = useServerResource<Tag, Tag>({
    update: `projects/${projectUuid}/items/${itemUuid}/tags/${tag.tag}`
  })

  const {
    isRemoving,
    removeError,
    remove
  } = useServerResource<Tag, void>({
    remove: `projects/${projectUuid}/items/${itemUuid}/tags/${tag.tag}`
  })

  useEffect(() => {
    setInitialValues(tag);
  }, [tag])

  const onSubmit = (values: Tag, helpers: FormikHelpers<Tag>) => {
    update(values, wasSuccessful => {
      helpers.setSubmitting(false);
      if( wasSuccessful ) {
        onSave();
        helpers.resetForm();
      }
    })
  }

  const onRemoveClick = () => {
    remove(wasSuccessful => {
      if( wasSuccessful ) {
        onRemove();
      }
    })
  }

  return <Formik onSubmit={onSubmit} initialValues={initialValues}>
    {({ dirty }) => (
      <Form>
        <Grid>
          { saveError && <Text color="red">{saveError.message}</Text>}
          { removeError && <Text color="red">{removeError.message}</Text>}
          <Grid.Col xs={5}>
            <Field
              as={TextInput}
              name="tag"
              readOnly
            />
          </Grid.Col>
          <Grid.Col xs={5}>
            <Field
              as={TextInput}
              name="value"
              placeholder="New Value"
            />
          </Grid.Col>
          <Grid.Col xs={2} sx={{ display: 'flex', justifyContent: 'space-around'}}>
            <Button
              disabled={ !dirty || isSaving || isRemoving }
              sx={{ padding: '0 0.5rem'}}
              type="submit"
            >
              { isSaving ? <Loader /> : <DeviceFloppy /> }
            </Button>
            <Button
              disabled={ isSaving || isRemoving }
              sx={{ padding: '0 0.5rem'}}
              color="red"
              onClick={onRemoveClick}
            >
              { isRemoving ? <Loader /> : <Trash /> }
            </Button>
          </Grid.Col>
        </Grid>
      </Form>
    )}
  </Formik>
}

export function Tags() {
  const { projectUuid, itemUuid } = useParams();

  const {
    data: tags,
    isLoading,
    loadError,
    load,
  } = useServerResource<Tag, Tag[]>({
    load: `projects/${projectUuid}/items/${itemUuid}/tags`
  })

  useEffect(() => {
    load();
  }, [])

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading tags"}</Text>
  if( !tags ) return null;

  return <Box>
    <Grid>
      <Grid.Col xs={5}><Text>Tag</Text></Grid.Col>
      <Grid.Col xs={5}><Text>Value</Text></Grid.Col>
    </Grid>
    {tags.map(tag => <TagListItem
      tag={tag}
      projectUuid={projectUuid}
      itemUuid={itemUuid}
      key={tag.tag}
      onSave={() => load()}
      onRemove={() => load()}
    />)}
    <NewTagItem
      projectUuid={projectUuid}
      itemUuid={itemUuid}
      onSave={() => load()}
    />
  </Box>
}