import { Box, Grid, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectItem } from '../../../../qr-types';

type Props = {
  item: ProjectItem;
}

export function ItemListItem ({ item }: Props) {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isExtraSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  return (
    <UnstyledButton sx={{ 
      display: 'block',
      padding: theme.spacing['xs'],
      boxSizing: 'border-box',
      textAlign: 'left',
      width: '100%',
      borderRadius: theme.radius['sm'],
      '&:hover': {
        backgroundColor: theme.colors[theme.primaryColor]['1'],
        color: theme.colors[theme.primaryColor]['9'],
        '&:nth-of-type(odd)': {
          backgroundColor: theme.colors[theme.primaryColor]['1'],
        }
      },
      marginTop: theme.spacing['xs'],
      '&:nth-of-type(odd)': {
        backgroundColor: theme.colors.gray[1]
      }
    }} key={item.uuid} onClick={() => navigate(`./${item.uuid}`)}>
      <Grid>
        <Grid.Col xs={12} sm={9}>
          <Text component="h3" sx={{ margin: 0, fontSize: '1.4rem' }}>{item.name}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{item.uuid}</Text>
        </Grid.Col>
        <Grid.Col xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center'}}>
          <Box sx={{
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors[theme.primaryColor][1],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isExtraSmallScreen ? '80%' : '5rem',
            height: '4rem'
          }}>
            <Text style={{fontSize: '2rem'}} color="blue">{item.cost}</Text>
          </Box>
        </Grid.Col>
        <Grid.Col xs={12} sx={{paddingTop: 0 }}>
          <Text>{item.description}</Text>
        </Grid.Col>
      </Grid>
    </UnstyledButton>
  );
}