import React, { useEffect, useState } from 'react';
import { Box, Button, Loader, Tabs, Text, Textarea, TextInput, useMantineTheme, } from '@mantine/core';
import { SavedProject } from '@qrTypes';
import { Link, matchPath, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useServerResource } from '../../../hooks/useServerResource';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { ChevronLeft } from 'tabler-icons-react';

enum ProjectTab {
  activities = "activities",
  players = "players",
  settings = "settings"
}

export function ProjectRoute() {
  const { projectUuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string | null>(null)

  const {
    data: project,
    isLoading,
    isSaving,
    loadError,
    saveError,
    load,
    update
  } = useServerResource<SavedProject, SavedProject>({
    load: `projects/${projectUuid}`,
    update: `projects/${projectUuid}`
  })
  const theme = useMantineTheme();

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    const locationToTab = () => {
      if( matchPath({ path: "projects/:id/activities", end: false }, location.pathname) ) return ProjectTab.activities;
      else if( matchPath({ path: "projects/:id/players", end: false }, location.pathname) ) return ProjectTab.players;
      else if( matchPath({ path: "projects/:id/settings", end: false }, location.pathname) ) return ProjectTab.settings;
    }

    setActiveTab(locationToTab());

  }, [location])

  useEffect(() => {
    if( project && activeTab === undefined ) navigate("activities");
  }, [project])

  const handleSubmit = (values: SavedProject, helpers: FormikHelpers<SavedProject>) => {
    if( isSaving ) return;
    update(values, () => {
      helpers.setSubmitting(false)
    });
  }

  const onTabChange = (tab: ProjectTab) => {
    switch(tab){
      case ProjectTab.activities: navigate("activities"); break;
      case ProjectTab.players: navigate("players"); break;
      case ProjectTab.settings: navigate("settings"); break;
    }
  };
  
  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading project"}</Text>
  if( !project ) return null;
  return <Box style={{maxWidth: `700px`}}>
    <Button
      compact
      variant="subtle"
      component={Link}
      to=".."
      leftIcon={<ChevronLeft size={16} />}
    >Back</Button>
    <Formik initialValues={project} onSubmit={handleSubmit} enableReinitialize>
      {({ dirty }) => (
        <Form>
          {saveError && <Text color="red">{saveError.message}</Text>}
          <Field name="name" as={TextInput} label="Project Name" />
          <Field name="description" as={Textarea} label="Description" sx={{ marginTop: theme.spacing['xs'] }} />
          {dirty && <Button type="submit" disabled={isSaving} sx={{
            marginTop: theme.spacing['xs']
          }}>Save</Button>}
        </Form>
      )}
    </Formik>
    <Tabs value={activeTab} onTabChange={onTabChange} sx={{ marginBottom: '0.5rem', marginTop: '1rem' }}>
      <Tabs.Tab value="Activities">Activities</Tabs.Tab>
      <Tabs.Tab value="Players">Players</Tabs.Tab>
      <Tabs.Tab value="Settings">Settings</Tabs.Tab>
    </Tabs>
    <Outlet />
  </Box>
}