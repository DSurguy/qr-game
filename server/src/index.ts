import { resolve } from 'path';
import { bootstrap } from './bootstrap';
import { start } from './app'
import * as dotenv from 'dotenv';

dotenv.config();

const db = bootstrap(resolve(__dirname, '../../runtime'))
start(db);