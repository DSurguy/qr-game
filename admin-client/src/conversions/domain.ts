export const replacePort = (host: string) => {
  if( host.includes('8080') ) return host.replace('8080', '8081')
  return host.replace('8081', '8080')
}