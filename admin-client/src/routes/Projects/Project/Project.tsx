import React, { useEffect, useState } from 'react';
import { Box, Button, Loader, Tabs, Text, Textarea, TextInput, useMantineTheme, } from '@mantine/core';
import { QrGenerationPayload, SavedProject } from '@qrTypes';
import { Link, matchPath, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useServerResource } from '../../../hooks/useServerResource';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { ChevronLeft, Download } from 'tabler-icons-react';
import { useDownloadFile } from '../../../hooks/downloadFile';

enum ProjectTab {
  activities = "activities",
  players = "players",
  settings = "settings",
  items = "items"
}

export function ProjectRoute() {
  const { projectUuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useMantineTheme();
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

  const {
    isLoading: isGettingPdf,
    loadError: getPdfError,
    download: getPdf
  } = useDownloadFile<QrGenerationPayload>(`projects/${projectUuid}/qrFile`, "POST")

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    const locationToTab = () => {
      if( matchPath({ path: "projects/:id/activities", end: false }, location.pathname) ) return ProjectTab.activities;
      else if( matchPath({ path: "projects/:id/players", end: false }, location.pathname) ) return ProjectTab.players;
      else if( matchPath({ path: "projects/:id/settings", end: false }, location.pathname) ) return ProjectTab.settings;
      else if( matchPath({ path: "projects/:id/items", end: false }, location.pathname) ) return ProjectTab.items;
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
      case ProjectTab.items: navigate("items"); break;
    }
  };

  const onGetQrPdfClick = async () => {
    getPdf({
      includePlayers: true,
      includeActivities: true,
      includeItems: true
    }, (success) => {
      if( success ) {
        console.log("YAY");
      }
      console.log("NAY");
    })
  }
  
  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading project"}</Text>
  if( !project ) return null;

  { getPdfError && <Text color="red">{getPdfError.message}</Text> }
  return <Box style={{maxWidth: `700px`}}>
    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
      <Button
        compact
        variant="subtle"
        component={Link}
        to=".."
        leftIcon={<ChevronLeft size={16} />}
      >Back</Button>
      <Button
        compact
        variant="subtle"
        loading={isGettingPdf}
        onClick={onGetQrPdfClick}
        type="button"
      ><Download /><Text sx={{ marginRight: '0.5rem' }}>Get QR Pdf</Text></Button>
    </Box>
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
      <Tabs.List>
        <Tabs.Tab value={ProjectTab.activities}>Activities</Tabs.Tab>
        <Tabs.Tab value={ProjectTab.players}>Players</Tabs.Tab>
        <Tabs.Tab value={ProjectTab.settings}>Settings</Tabs.Tab>
        <Tabs.Tab value={ProjectTab.items}>Items</Tabs.Tab>
      </Tabs.List>
    </Tabs>
    <Outlet />
  </Box>
}