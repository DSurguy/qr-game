import React, { useState } from 'react';
import { Box, Button, Grid, Text, useMantineTheme } from '@mantine/core';
import { faker } from '@faker-js/faker';
import { useMediaQuery } from '@mantine/hooks';
import { SquarePlus } from 'tabler-icons-react';
import CreateActivity from './CreateActivity';
import { useParams } from 'react-router-dom';

const toTitleCase = (str: string) => str ? str[0].toUpperCase() + str.substring(1): str

enum ActivityRoute {
  index,
  create,
  edit
}

export function Activities() {
  const theme = useMantineTheme();
  const { projectUuid } = useParams();
  const isExtraSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const [routingState, setRoutingState] = useState<ActivityRoute>(ActivityRoute.index);

  const getRandomActivity = () => ({
    uuid: faker.datatype.uuid(),
    wordId: toTitleCase(faker.word.adjective()) + toTitleCase(faker.word.adjective()) + toTitleCase(faker.word.noun()),
    name: faker.lorem.words(2),
    description: faker.lorem.words(10),
    value: faker.datatype.number({
      min: 1,
      max: 15
    })
  } as const)

  const renderActivity = (activity: ReturnType<typeof getRandomActivity>) => (
    <Box sx={{ 
      display: 'block',
      padding: theme.spacing['xs'],
      boxSizing: 'border-box',
      textAlign: 'left',
      width: '100%',
      borderRadius: theme.radius['sm'],
      marginTop: theme.spacing['xs'],
      '&:nth-child(odd)': {
        backgroundColor: theme.colors.gray[1]
      }
    }} key={activity.uuid}>
      <Grid>
        <Grid.Col xs={12} sm={9}>
          <Text component="h3" sx={{ margin: 0, fontSize: '1.4rem' }}>{activity.name}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{activity.uuid}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{activity.wordId}</Text>
        </Grid.Col>
        <Grid.Col xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center'}}>
          <Box sx={{
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors[theme.primaryColor][1],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isExtraSmallScreen ? '80%' : '5rem',
            height: '4rem'
          }}>
            <Text style={{fontSize: '2rem'}} color="blue">{activity.value}</Text>
          </Box>
        </Grid.Col>
        <Grid.Col xs={12} sx={{paddingTop: 0 }}>
          <Text>{activity.description}</Text>
        </Grid.Col>
      </Grid>
    </Box>
  )

  const activities = Array(5).fill(1).map((v: number) => getRandomActivity()).map((activity: ReturnType<typeof getRandomActivity>) => renderActivity(activity)) 
  const indexContent = (<Box>
    <Button
      compact
      leftIcon={<SquarePlus size={theme.fontSizes['xl']} />}
      onClick={() => setRoutingState(ActivityRoute.create)}
    >New Activity</Button>
    <Box>{activities}</Box>
  </Box>)

  const createContent = <CreateActivity projectUuid={projectUuid} />

  switch(routingState) {
    case ActivityRoute.index: return indexContent;
    case ActivityRoute.create: return createContent;
    default: return null;
  }
}