import React, { useEffect, useState } from 'react';
import { SavedPlayer } from '@qrTypes';
import { Link, useParams } from 'react-router-dom';
import { useServerResource } from '../../../../hooks/useServerResource';
import { Badge, Box, Button, Grid, Loader, Text, useMantineTheme } from '@mantine/core';
import { AlertTriangle, Check, ChevronLeft, Copy } from 'tabler-icons-react';
import { playerToQrAsUrl } from '../../../../conversions/playerToQr';
import ClaimPlayerModal from './ClaimPlayerModal';
import { showNotification } from '@mantine/notifications';
import { replacePort } from '../../../../conversions/domain';
import copyToClipboardWithNotify from '../../../../utilities/copyToClipboardWithNotify';

export default function Player() {
  const { projectUuid, playerUuid } = useParams();
  const {
    data: player,
    isLoading,
    isSaving,
    loadError,
    saveError,
    load,
    update
  } = useServerResource<SavedPlayer, SavedPlayer>({
    load: `projects/${projectUuid}/players/${playerUuid}`,
    update: `projects/${projectUuid}/players/${playerUuid}`
  })
  const theme = useMantineTheme();
  const [qrCode, setQrCode] = useState<null | string>(null)
  const [qrCodeError, setQrCodeError] = useState<null | Error>(null);
  const [claimPlayerModalOpen, setClaimPlayerModalOpen] = useState(false);

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    ( async () => {
      try {
        if( player ) {
          const code = await playerToQrAsUrl(player);
          setQrCode(code);
          setQrCodeError(null);
        }
      } catch (e) {
        setQrCodeError(e);
      }
    })();
  }, [player])

  const portalLink = `${PROCESS_ENV_CLIENT_ORIGIN}/portal?projectUuid=${projectUuid}&type=player&uuid=${playerUuid}`;

  const unclaimedPlayerButton = <Button onClick={() => setClaimPlayerModalOpen(true)}>Claim Player</Button>
  const claimedPlayerBadge = <Badge color="green" size="md">Claimed</Badge>

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading activity"}</Text>
  if( !player ) return null;
  return <Box>
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
    <Grid sx={{ marginTop: '0.5rem'}}>
      <Grid.Col xs={10}>
        <Text component="h3" sx={{ margin: 0, fontSize: '1.4rem' }}>{player.name || 'UNCLAIMED'}</Text>
        <Text size="xs" color={theme.colors.gray[6]}>{player.uuid}</Text>
        <Text size="xs" color={theme.colors.gray[6]}>{player.wordId}</Text>
      </Grid.Col>
      <Grid.Col xs={2}>
        { player.claimed ? claimedPlayerBadge : unclaimedPlayerButton}
      </Grid.Col>
    </Grid>
    <Box>
      { qrCodeError && qrCodeError.message }
      { qrCode && <img src={qrCode} /> }
    </Box>
    <ClaimPlayerModal
      opened={claimPlayerModalOpen}
      onClose={() => {
        setClaimPlayerModalOpen(false);
        load();
      }}
      player={player}
    />
  </Box>
}