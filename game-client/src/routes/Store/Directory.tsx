import { Box, Grid, Loader, Text, TextInput, useMantineTheme } from '@mantine/core';
import fuzzysort from 'fuzzysort';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Diamond } from 'tabler-icons-react';
import useDebouncedState from '../../hooks/useDebouncedState';
import { useServerResource } from '../../hooks/useServerResource';
import { ProjectItem } from '../../qr-types';

type Props = {
  item: ProjectItem;
  onClick: () => void;
}

const DirectoryItem = ({ item, onClick }: Props) => {
  const theme = useMantineTheme();
  return (
    <Box onClick={onClick} sx={{
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.dark[8],
      width: '160px',
      height: '200px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: theme.colors.dark[4],
      boxSizing: 'border-box',
      padding: '0.5rem',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer'
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        flexGrow: 0
      }}><Text>{item.name}</Text></Box>
      <Box sx={{ flexGrow: 1 }}></Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexGrow: 0
      }}>
        <Text sx={{ fontSize: '1.25rem', marginRight: '0.25rem'}}>{item.cost}</Text>
        <Diamond />
      </Box>
    </Box>
  )
}

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
    <Box sx={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '1rem'}}>
      {filteredItems.map(item => (<DirectoryItem key={item.uuid} item={item} onClick={() => navigate(`${item.uuid}`)} />))}
    </Box>
  </Box>);
}