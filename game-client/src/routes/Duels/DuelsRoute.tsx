import React, { useEffect } from 'react';
import { Box, Grid, Loader, Text, TextInput, useMantineTheme } from '@mantine/core';
import { useServerResource } from '../../hooks/useServerResource';
import { DuelState, GameDuel } from '../../qr-types';
import useDebouncedState from '../../hooks/useDebouncedState';
import { useState } from 'react';
import fuzzysort from 'fuzzysort';
import PendingDuel from '../../components/duels/PendingDuel';
import AcceptedDuel from '../../components/duels/AcceptedDuel';
import CancelPendingDuel from '../../components/duels/CancelPendingDuel';
import PendingVictorConfirmDuel from '../../components/duels/PendingVictorConfirmDuel';
import CreatedDuel from '../../components/duels/CreatedDuel';
import { CancelledDuel } from '../../components/duels/CancelledDuel';
import { CompleteDuel } from '../../components/duels/CompleteDuel';

export default function DuelsRoute() {
  const theme = useMantineTheme();
  const [search, setSearch, isDebouncingSearch] = useDebouncedState("");
  const [duelsInSetup, setDuelsInSetup] = useState<GameDuel[]>([]);
  const [activeDuels, setActiveDuels] = useState<GameDuel[]>([]);
  const [completedDuels, setCompletedDuels] = useState<GameDuel[]>([]);
  const {
    data: duels,
    isLoading: isLoadingDuels,
    loadError: loadDuelsError,
    load: loadDuels
  } = useServerResource<undefined, GameDuel[]>({
    load: `game/duels`,
  })

  useEffect(() => {
    loadDuels();
  }, [])

  useEffect(() => {
    if( !duels ) return;
    let duelsToFilter = duels;
    if( search ) {
      duelsToFilter = fuzzysort.go(search, duels, {
        limit: 50,
        keys: [
          'initiator.name',
          'initiator.realName',
          'recipient.name',
          'recipient.realName',
          'activity.name',
          'uuid',
          'initiator.uuid',
          'recipient.uuid',
          'activity.uuid',
          'initiator.wordId',
          'recipient.wordId'
        ],
        threshold: -10000
      }).map(result => result.obj);
    }
    setDuelsInSetup(duelsToFilter.filter(duel => [
      DuelState.Created
    ].includes(duel.state)))
    setActiveDuels(duelsToFilter.filter(duel => [
      DuelState.Accepted,
      DuelState.Pending,
      DuelState.PendingCancel,  
      DuelState.PendingInitiatorConfirm,
      DuelState.PendingRecipientConfirm
    ].includes(duel.state)))
    setCompletedDuels(duelsToFilter.filter(duel => [
      DuelState.Complete,
      DuelState.Cancelled
    ].includes(duel.state)))
  }, [duels, search])

  const duelsInSetupContent = () => {
    return <Box>
      {duelsInSetup.map(duel => {
        switch(duel.state){
          case DuelState.Created: return <CreatedDuel key={duel.uuid} duel={duel} />
          default: return null;
        }
      })}
    </Box>
  }

  const activeDuelsContent = () => {
    return <Box>
      {activeDuels.map(duel => {
        switch(duel.state){
          case DuelState.Pending: return <PendingDuel key={duel.uuid} duel={duel} onUpdate={loadDuels} />
          case DuelState.Accepted: return <AcceptedDuel key={duel.uuid} duel={duel} onUpdate={loadDuels} />
          case DuelState.PendingCancel: return <CancelPendingDuel key={duel.uuid} duel={duel} onUpdate={loadDuels} />
          case DuelState.PendingInitiatorConfirm:
          case DuelState.PendingRecipientConfirm:
            return <PendingVictorConfirmDuel key={duel.uuid} duel={duel} onUpdate={loadDuels} />
          default: return null;
        }
      })}
    </Box>
  }

  const completedDuelsContent = () => {
    return <Box>
      {completedDuels.map(duel => {
        switch(duel.state) {
          case DuelState.Cancelled: return <CancelledDuel key={duel.uuid} duel={duel} />
          case DuelState.Complete: return <CompleteDuel key={duel.uuid} duel={duel} />
          default: return null;
        }
      })}
    </Box>
  }
  
  const noDuelsContent = () => (
    <Text>You have no duels! GO FIGHT SOMEONE.</Text>
  )
  
  if( isLoadingDuels ) return <Loader />
  if( loadDuelsError ) return <Text color={theme.colors['errorColor'][4]}>Error loading player {loadDuelsError?.message}</Text>
  if( !duels || !activeDuels ) return null;
  return (
    <Box>
      <Grid>
        <Grid.Col sm={6} xs={12}>
          <TextInput
            placeholder="Search"
            onChange={({ currentTarget: { value }}) => setSearch(value)}
            rightSection={isDebouncingSearch ? <Loader size="xs" /> : null}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col sm={6} xs={12}>
          <Text component='h2'>Setting Up</Text>
          {!!duelsInSetup.length && duelsInSetupContent()}
          <Text component='h2'>Active</Text>
          {!!activeDuels.length && activeDuelsContent()}
          <Text component='h2'>Complete</Text>
          {!!completedDuels.length && completedDuelsContent()}
          {!activeDuels.length && !completedDuels.length && !duelsInSetup.length && noDuelsContent()}
        </Grid.Col>
      </Grid>
    </Box>
  )
}