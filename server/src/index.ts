import { resolve } from 'path';
import { bootstrap } from './bootstrap';
import { start } from './routing/index'

const db = bootstrap(resolve(__dirname, '../../runtime'))
start(db);