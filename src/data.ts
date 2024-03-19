import * as fs from 'fs';
import { jsonc } from 'jsonc';
import { PluginInfo } from './types.ts';
import { INDEXJSON } from './constants.ts';

export function loadFile() {
    const datas = Object.entries(
        jsonc.parse(fs.readFileSync(INDEXJSON, 'utf8')) as {
            [key: string]: any;
        }
    );

    const result: LoadResult = {
        invalid: [],
        success: [],
    };

    for (const entry of datas) {
        if (entry[0] === '-example-') continue;

        if (!/^[a-zA-Z][a-zA-Z1-9\\-]{4,25}$/.test(entry[0]))
            result.invalid.push([entry[0], 'ID不符合规范']);
        else if (typeof entry[1] !== 'object')
            result.invalid.push([entry[0], '不是一个object']);
        else if (!entry[1]['owner'])
            result.invalid.push([entry[0], '$.owner 为空']);
        else if (!entry[1]['repo'])
            result.invalid.push([entry[0], '$.repo 为空']);
        else result.success.push(entry);
    }

    return result;
}

declare type LoadResult = {
    invalid: [string, string][];
    success: [string, PluginInfo][];
};
