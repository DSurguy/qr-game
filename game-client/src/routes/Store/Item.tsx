import { Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'tabler-icons-react';
import { useServerResource } from '../../hooks/useServerResource';
import { PurchaseItemPayload, StoreItem } from '../../qr-types';

export function StoreItem() {
  const { itemUuid } = useParams();
  const theme = useMantineTheme();

  const {
    data: item,
    isLoading: isLoadingItem,
    loadError: loadItemError,
    load: loadItem,
  } = useServerResource<null, StoreItem>({
    load: `game/store/items/${itemUuid}`
  })

  const {
    data: balance,
    isLoading: isLoadingBalance,
    loadError: loadBalanceError,
    load: loadBalance,
  } = useServerResource<null, number>({
    load: `game/me/balance`
  })

  const {
    isSaving: isPurchasing,
    saveError: purchaseError,
    create: purchase,
  } = useServerResource<PurchaseItemPayload, void>({
    create: `game/store/purchase`
  })

  useEffect(() => {
    loadItem();
    loadBalance();
  }, [])

  const onPurchase = () => {
    purchase({ itemUuid }, wasSuccessful => {
      if( wasSuccessful ) {
        loadBalance();
        showNotification({
          message: 'Item Purchased!',
          icon: <Check />,
          color: 'green',
          autoClose: 2000
        })
      }
    })
  }

  const balanceContent = () => {
    if( isLoadingBalance ) return <Loader />
    if( loadBalanceError ) return <Text color="red">Error loading item {loadBalanceError?.message}</Text>
    if( balance === undefined || balance === null ) return null;

    return <Box sx={{ backgroundColor: theme.colors[theme.primaryColor][1], borderRadius: theme.radius.sm, padding: '0.5rem' }}>
      <Text>Points: {balance}</Text>
    </Box>
  }

  const itemContent = () => {
    if( isLoadingItem ) return <Loader />
    if( loadItemError ) return <Text color="red">Error loading item {loadItemError?.message}</Text>
    if( !item ) return null;

    return <Box>
      <Text>Name: {item.name}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Has Redemption Challenge? {item.hasRedemptionChallenge.toString()}</Text>
      <Text>Cost: {item.cost}</Text>
      <Button onClick={onPurchase} loading={isPurchasing}>Purchase</Button>
    </Box>
  }

  return (<Box>
    {balanceContent()}
    {itemContent()}
  </Box>)
}