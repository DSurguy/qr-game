import { Box, Grid, Loader, Text, TextInput, useMantineTheme } from '@mantine/core';
import fuzzysort from 'fuzzysort';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDebouncedState from '../../hooks/useDebouncedState';
import { useServerResource } from '../../hooks/useServerResource';
import { ProjectItem } from '../../qr-types';

export function StoreDirectory() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const {
    data: items,
    isLoading,
    loadError,
    load
  } = useServerResource<null, ProjectItem[]>({
    load: `game/store/items`
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
  if( loadError ) return <Text color={theme.colors['errorColor'][4]}>Error loading store items {loadError?.message}</Text>
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
    {filteredItems.map(item => (<Box key={item.uuid} onClick={() => navigate(`${item.uuid}`)}>
      <Text>Name: {item.name}</Text>
      <Text>Description: {item.description}</Text>
    </Box>))}
    </Box>
  </Box>);
}