import * as fs from 'fs';
import { jsonc } from 'jsonc';
import { INDEXJSON } from './constants.ts';

export function loadIndex() {
    const datas = jsonc.parse(fs.readFileSync(INDEXJSON, 'utf8')) as {
        [key: string]: any;
    };

    if (typeof datas !== 'object') throw new TypeError();

    return Object.entries(datas);
}
