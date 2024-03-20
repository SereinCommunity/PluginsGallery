import { config } from 'dotenv';
import { check, summaryCheck } from './check.ts';
import { loadIndex } from './data.ts';
import { generate } from './generator.ts';

config();
await main(process.argv.slice(2));

async function main(args: string[]) {
    const datas = loadIndex();

    switch (args[0]) {
        case 'check':
            await summaryCheck(await check(datas));
            break;

        case 'generate':
            await generate(datas);
            break;

        default:
            throw new Error('未知的操作');
    }
}
