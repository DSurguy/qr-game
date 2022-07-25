import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Loader, Text, TextInput, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { SquarePlus } from 'tabler-icons-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SavedDuelActivityType } from '@qr-game/types';
import { useServerResource } from '../../../../hooks/useServerResource';
import fuzzysort from 'fuzzysort';
import useDebouncedState from '../../../../hooks/useDebouncedState';

export default function DuelActivityList () {
  const theme = useMantineTheme();
  const { projectUuid } = useParams();
  const navigate = useNavigate();
  const {
    data: duelActivities,
    isLoading,
    loadError,
    load
  } = useServerResource<SavedDuelActivityType[], SavedDuelActivityType[]>({
    load: `projects/${projectUuid}/duelActivities`
  })
  const isExtraSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const [search, setSearch, isDebouncingSearch] = useDebouncedState("");
  const [filteredDuelActivities, setFilteredDuelActivities] = useState<typeof duelActivities>(duelActivities);

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    if( duelActivities && search ) {
      const results = fuzzysort.go(search, duelActivities, {
        limit: 50,
        keys: ['name', 'uuid', 'wordId'],
        threshold: -10000
      })
      setFilteredDuelActivities(results.map(result => result.obj));
    }
    else setFilteredDuelActivities(duelActivities)
  }, [duelActivities, search])

  const renderDuelActivity = (duelActivity: SavedDuelActivityType) => (
    <UnstyledButton sx={{ 
      display: 'block',
      padding: theme.spacing['xs'],
      boxSizing: 'border-box',
      textAlign: 'left',
      width: '100%',
      borderRadius: theme.radius['sm'],
      '&:hover': {
        backgroundColor: theme.colors[theme.primaryColor]['1'],
        color: theme.colors[theme.primaryColor]['9'],
        '&:nth-of-type(odd)': {
          backgroundColor: theme.colors[theme.primaryColor]['1'],
        }
      },
      marginTop: theme.spacing['xs'],
      '&:nth-of-type(odd)': {
        backgroundColor: theme.colors.gray[1]
      }
    }} key={duelActivity.uuid} onClick={() => navigate(`./${duelActivity.uuid}`)}>
      <Grid>
        <Grid.Col xs={12} sm={9}>
          <Text component="h3" sx={{ margin: 0, fontSize: '1.4rem' }}>{duelActivity.name}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{duelActivity.uuid}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{duelActivity.wordId}</Text>
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
            <Text style={{fontSize: '2rem'}} color="blue">{duelActivity.value}</Text>
          </Box>
        </Grid.Col>
        <Grid.Col xs={12} sx={{paddingTop: 0 }}>
          <Text>{duelActivity.description}</Text>
        </Grid.Col>
      </Grid>
    </UnstyledButton>
  )

  const duelActivityContent = () => filteredDuelActivities.map((duelActivity: SavedDuelActivityType) => renderDuelActivity(duelActivity)) 
  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading duelActivities"}</Text>
  if( !filteredDuelActivities ) return null;
  return (<Box>
    <Grid>
      <Grid.Col xs={12} sm={6}>
        <TextInput
          placeholder="Search"
          onChange={({ currentTarget: { value }}) => setSearch(value)}
          rightSection={isDebouncingSearch ? <Loader size="xs" /> : null}
        />
      </Grid.Col>
      <Grid.Col xs={12} sm={6}>
        <Button
          leftIcon={<SquarePlus size={theme.fontSizes['xl']} />}
          component={Link}
          to="create"
        >New Duel Activity</Button>
      </Grid.Col>
      <Grid.Col xs={12}>{duelActivityContent()}</Grid.Col>
    </Grid>
  </Box>)
}