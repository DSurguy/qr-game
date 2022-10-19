import { Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useContext, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, Stack2 } from 'tabler-icons-react';
import { TablerIconFromString } from '../../components/icons/TablerIconFromString';
import { HookResponseContext } from '../../context/hookResponse';
import { useServerResource } from '../../hooks/useServerResource';
import { InventoryItem, PluginModifiedPayloadResponse, RedeemItemPayload } from '../../qr-types';
import { RedemptionModal } from './RedemptionModal';

export function InventoryItem() {
  const theme = useMantineTheme();
  const { itemUuid } = useParams();
  const navigate = useNavigate();
  const [redemptionModalOpen, setRedemptionModalOpen] = useState(false);
  const { addResponses } = useContext(HookResponseContext);

  const {
    data: item,
    isLoading: isLoadingItem,
    loadError: loadItemError,
    load: loadItem,
  } = useServerResource<null, InventoryItem>({
    load: `game/inventory/${itemUuid}`
  })

  const {
    isSaving: isRedeeming,
    saveError: redeemError,
    create: redeem,
  } = useServerResource<RedeemItemPayload, PluginModifiedPayloadResponse>({
    create: `game/inventory/redeem`
  })

  useEffect(() => {
    loadItem();
  }, [])

  const onRedeem = () => {
    if( item.item.hasRedemptionChallenge ) {
      setRedemptionModalOpen(true);
    }
    else {
      redeem({ itemUuid }, (wasSuccessful, data) => {
        if( wasSuccessful ) onRedeemSuccess(data);
      })
    }
  }

  const onRedeemSuccess = (data?: PluginModifiedPayloadResponse) => {
    if( data?.hooks?.itemRedemption ) addResponses(data.hooks.itemRedemption);
    loadItem();
    showNotification({
      message: 'Item Redeemed!',
      icon: <Check />,
      color: 'green',
      autoClose: 2000
    })
  }

  const onRedemptionModalClose = (wasSuccessful: boolean, data?: PluginModifiedPayloadResponse) => {
    if( wasSuccessful ) onRedeemSuccess(data);
    setRedemptionModalOpen(false)
  }

  const itemContent = () => {
    if( isLoadingItem ) return <Loader />
    if( loadItemError ) return <Text color={theme.colors['errorColor'][4]}>Error loading item {loadItemError?.message}</Text>
    if( !item ) return null;

    const quantityAvailable = item.quantity - item.quantityRedeemed;

    return <Box sx={{
      borderRadius: theme.radius.sm,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: theme.colors.dark[4],
      backgroundColor: theme.colors.dark[8],
      margin: '0 auto',
      boxSizing: 'border-box',
      padding: '1rem'
    }}>
      <Box sx={{ borderRadius: theme.radius.md, backgroundColor: item.item.color || 'none', marginBottom: '1rem'}}>
        <Box sx={{ display: 'flex', padding: '0.25rem 0', justifyContent: 'center' }}>
          <Text sx={{ fontSize: '1.5rem' }}>{item.item.name}</Text>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <TablerIconFromString icon={item.item.icon} size={80} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
          <Box sx={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', borderRadius: theme.radius.sm, padding: '0 0.5rem' }}>
            <Text sx={{ fontSize: '1.5rem', marginRight: '0.25rem'}}>{quantityAvailable}</Text>
            <Stack2 size={24} />
          </Box>
        </Box>
      </Box>
      { redeemError && <Text color={theme.colors['errorColor'][4]}>{redeemError.message}</Text>}
      <Box sx={{ boxSizing: 'border-box' }}>
        <Button
          onClick={onRedeem}
          disabled={!quantityAvailable}
          loading={isRedeeming}
          fullWidth
        >
          <Text sx={{ fontSize: '1.25rem', marginRight: '1rem'}}>Redeem</Text>
        </Button>
      </Box>
      <Box sx={{ margin: '1rem 0' }}>
        <Text><ReactMarkdown children={item.item.description} /></Text>
      </Box>
    </Box>
  }

  return (<Box>
    <Box sx={{ marginBottom: '0.5rem' }}>
      <Button variant="subtle" sx={{ padding: '0 1rem 0 0.25rem' }} onClick={() => navigate('..')}>
        <ChevronLeft /> Back
      </Button>
    </Box>
    {itemContent()}
    <RedemptionModal opened={redemptionModalOpen} onClose={onRedemptionModalClose} itemUuid={itemUuid} />
  </Box>)
}