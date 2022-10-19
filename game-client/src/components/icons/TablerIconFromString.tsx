import React from 'react';
import * as TablerIcons from 'tabler-icons-react';

const titleCaseToKebabCase = (input: string): string => {
  return input
    .split('')
    .map(
      (char, index) => /[A-Z]/.test(char) && index > 0
        ? '-' + char.toLowerCase()
        : char.toLowerCase()
    ).join('');
}

const iconMap = Object.entries(TablerIcons).reduce((aggregate, [key, value]) => {
  aggregate[titleCaseToKebabCase(key)] = value;
  return aggregate;
}, {} as Record<string, TablerIcons.Icon>)

interface Props extends TablerIcons.IconProps {
  icon: string;
}

export function TablerIconFromString({ icon, ...other}: Props) {
  const OutComponent = iconMap[icon] || TablerIcons.QuestionMark;
  return <OutComponent {...other} />
}