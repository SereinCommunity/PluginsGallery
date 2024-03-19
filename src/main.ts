import { log } from 'console';
import { check } from './check.ts';
import { loadFile } from './data.ts';

log(process.env);
await main(process.argv.slice(2));

async function main(args: string[]) {
    const datas = loadFile();

    switch (args[0]) {
        case 'check':
            await check(datas);
            break;

        case 'generate':
            break;

        default:
            throw new Error('未知的操作');
    }
}
