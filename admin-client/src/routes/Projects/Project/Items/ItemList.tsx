import { Box, Button, Grid, Loader, Text, TextInput, UnstyledButton, useMantineTheme } from '@mantine/core';
import fuzzysort from 'fuzzysort';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SquarePlus } from 'tabler-icons-react';
import useDebouncedState from '../../../../hooks/useDebouncedState';
import { useServerResource } from '../../../../hooks/useServerResource';
import { ProjectItem } from '../../../../qr-types';
import { ItemListItem } from './ItemListItem';

export function ItemListRoute() {
  const { projectUuid } = useParams();
  const theme = useMantineTheme()

  const {
    data: items,
    isLoading,
    loadError,
    load
  } = useServerResource<null, ProjectItem[]>({
    load: `projects/${projectUuid}/items`
  })

  const [search, setSearch, isDebouncingSearch] = useDebouncedState("");
  const [filteredItems, setFilteredItems] = useState<typeof items>(items);

  useEffect(() => {
    load()
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
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading item"}</Text>
  if( !filteredItems ) return null;

  return <Box>
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
        >New Item</Button>
      </Grid.Col>
      <Grid.Col xs={12}>
        {filteredItems.map(item => <ItemListItem item={item} key={item.uuid} />)}
      </Grid.Col>
    </Grid>
  </Box>
}