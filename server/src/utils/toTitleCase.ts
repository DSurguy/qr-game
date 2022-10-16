export function toTitleCase(input: string): string {
  if ( !input ) return input;
  const parts = input.split(/[-_\s]/g);
  return parts.map(part => part.substring(0,1).toUpperCase() + part.substring(1).toLowerCase()).join('');
}