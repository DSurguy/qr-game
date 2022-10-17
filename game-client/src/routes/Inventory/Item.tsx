import { Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'tabler-icons-react';
import { useServerResource } from '../../hooks/useServerResource';
import { InventoryItem, RedeemItemPayload } from '../../qr-types';
import { RedemptionModal } from './RedemptionModal';

export function InventoryItem() {
  const theme = useMantineTheme();
  const { itemUuid } = useParams();
  const [redemptionModalOpen, setRedemptionModalOpen] = useState(false);

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
  } = useServerResource<RedeemItemPayload, void>({
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
      redeem({ itemUuid }, wasSuccessful => {
        if( wasSuccessful ) onRedeemSuccess();
      })
    }
  }

  const onRedeemSuccess = () => {
    loadItem();
    showNotification({
      message: 'Item Redeemed!',
      icon: <Check />,
      color: 'green',
      autoClose: 2000
    })
  }

  const onRedemptionModalClose = (wasSuccessful: boolean) => {
    if( wasSuccessful ) onRedeemSuccess();
    setRedemptionModalOpen(false)
  }

  const itemContent = () => {
    if( isLoadingItem ) return <Loader />
    if( loadItemError ) return <Text color={theme.colors['errorColor'][7]}>Error loading item {loadItemError?.message}</Text>
    if( !item ) return null;

    const quantityAvailable = item.quantity - item.quantityRedeemed;

    return <Box>
      <Text>Name: {item.item.name}</Text>
      <Text>Description: {item.item.description}</Text>
      <Text>Has Redemption Challenge?: {item.item.hasRedemptionChallenge.toString()}</Text>
      <Text>Quantity Available: {quantityAvailable}</Text>
      <Text>Quantity Redeemed: {item.quantityRedeemed}</Text>
      { redeemError && <Text color={theme.colors['errorColor'][7]}>{redeemError.message}</Text>}
      <Button onClick={onRedeem} disabled={!quantityAvailable} loading={isRedeeming}>Redeem</Button>
      <RedemptionModal opened={redemptionModalOpen} onClose={onRedemptionModalClose} itemUuid={itemUuid} />
    </Box>
  }

  return (<Box>
    {itemContent()}
  </Box>)
}