import { log } from 'console';
import { check } from './check.ts';

const args = process.argv.slice(2);

switch (args[0]) {
    case 'check':
        await check();
        break;

    case 'generate':
        break;

    default:
        throw new Error('未知的操作');
}
