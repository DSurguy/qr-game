import { Box, Grid, Loader, Text, TextInput } from '@mantine/core';
import fuzzysort from 'fuzzysort';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDebouncedState from '../../hooks/useDebouncedState';
import { useServerResource } from '../../hooks/useServerResource';
import { InventoryItem, ProjectItem } from '../../qr-types';

export function InventoryDirectory() {
  const navigate = useNavigate();
  const {
    data: items,
    isLoading,
    loadError,
    load
  } = useServerResource<null, InventoryItem[]>({
    load: `game/inventory`
  })

  const [search, setSearch, isDebouncingSearch] = useDebouncedState("");
  const [filteredItems, setFilteredItems] = useState<typeof items>(items);

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    if( items && search ) {
      const results = fuzzysort.go(search, items, {
        limit: 50,
        keys: ['name', 'uuid', 'description'],
        threshold: -10000
      })
      setFilteredItems(results.map(result => result.obj));
    }
    else setFilteredItems(items)
  }, [items, search])

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">Error loading store items {loadError?.message}</Text>
  if( !filteredItems ) return null;

  return (<Box>
    <Grid>
      <Grid.Col xs={12} sm={6}>
        <TextInput
          placeholder="Search"
          onChange={({ currentTarget: { value }}) => setSearch(value)}
          rightSection={isDebouncingSearch ? <Loader size="xs" /> : null}
        />
      </Grid.Col>
    </Grid>
    <Box>
      {filteredItems.map(item => (<Box key={item.itemUuid} onClick={() => navigate(`${item.itemUuid}`)}>
        <Text>Name: {item.item.name}</Text>
        <Text>Description: {item.item.description}</Text>
      </Box>))}
    </Box>
  </Box>);
}