import { resolve } from 'path';
import { bootstrap } from './bootstrap';
import { start } from './app'

process.env.HTTPS = 'true';
const db = bootstrap(resolve(__dirname, '../../runtime'))
start(db);