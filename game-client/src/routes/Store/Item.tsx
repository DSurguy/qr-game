import { Badge, Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useContext, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, Check, ChevronLeft, Diamond } from 'tabler-icons-react';
import { TablerIconFromString } from '../../components/icons/TablerIconFromString';
import { PlayerContext } from '../../context/player';
import { useServerResource } from '../../hooks/useServerResource';
import { PurchaseItemPayload, StoreItem } from '../../qr-types';

export function StoreItem() {
  const { itemUuid } = useParams();
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { updateBalance } = useContext(PlayerContext);

  const {
    data: item,
    isLoading: isLoadingItem,
    loadError: loadItemError,
    load: loadItem,
  } = useServerResource<null, StoreItem>({
    load: `game/store/items/${itemUuid}`
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
  }, [])

  const onPurchase = () => {
    purchase({ itemUuid }, wasSuccessful => {
      if( wasSuccessful ) {
        updateBalance();
        showNotification({
          message: 'Item Purchased!',
          icon: <Check />,
          color: 'green',
          autoClose: 2000
        })
      }
    })
  }

  const itemContent = () => {
    if( isLoadingItem ) return <Loader />
    if( loadItemError ) return <Text color={theme.colors['errorColor'][4]}>Error loading item {loadItemError?.message}</Text>
    if( !item ) return null;

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
      <Box sx={{ borderRadius: theme.radius.md, backgroundColor: item.color || 'none', marginBottom: '1rem'}}>
        <Box sx={{ display: 'flex', padding: '0.25rem 0', justifyContent: 'center' }}>
          <Text sx={{ fontSize: '1.5rem' }}>{item.name}</Text>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <TablerIconFromString icon={item.icon} size={80} />
        </Box>
      </Box>
      <Box sx={{ boxSizing: 'border-box' }}>
        <Button
          onClick={onPurchase}
          loading={isPurchasing}
          fullWidth
        >
          <Text sx={{ fontSize: '1.25rem', marginRight: '1rem'}}>Purchase</Text>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Diamond />
            <Text sx={{ fontSize: '1.25rem', marginLeft: '0.25rem'}}>{item.cost}</Text>
          </Box>
        </Button>
      </Box>
      <Box sx={{ margin: '1rem 0' }}>
        { item.hasRedemptionChallenge && <Badge sx={{ color: theme.colors.dark[1] }}>Challenge</Badge>}
      </Box>
      <Box sx={{ margin: '1rem 0' }}>
        <Text><ReactMarkdown children={item.description} /></Text>
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
  </Box>)
}