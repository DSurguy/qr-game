import { Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'tabler-icons-react';
import { HookResponseContext } from '../../context/hookResponse';
import { useServerResource } from '../../hooks/useServerResource';
import { InventoryItem, PluginModifiedPayloadResponse, RedeemItemPayload } from '../../qr-types';
import { RedemptionModal } from './RedemptionModal';

export function InventoryItem() {
  const theme = useMantineTheme();
  const { itemUuid } = useParams();
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

    return <Box>
      <Text>Name: {item.item.name}</Text>
      <Text>Description: {item.item.description}</Text>
      <Text>Has Redemption Challenge?: {item.item.hasRedemptionChallenge.toString()}</Text>
      <Text>Quantity Available: {quantityAvailable}</Text>
      <Text>Quantity Redeemed: {item.quantityRedeemed}</Text>
      { redeemError && <Text color={theme.colors['errorColor'][4]}>{redeemError.message}</Text>}
      <Button onClick={onRedeem} disabled={!quantityAvailable} loading={isRedeeming}>Redeem</Button>
      <RedemptionModal opened={redemptionModalOpen} onClose={onRedemptionModalClose} itemUuid={itemUuid} />
    </Box>
  }

  return (<Box>
    {itemContent()}
  </Box>)
}