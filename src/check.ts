import * as core from '@actions/core';
import { PluginInfo } from './types.ts';

declare type Result = {
    success: [string, PluginInfo][];
    failure: [string, string][];
};

export async function check(datas: [string, any][]) {
    const result: Result = { failure: [], success: [] };

    for (const item of datas) {
        try {
            checkId(item);
            checkItem(item);

            result.success.push([item[0], item[1]]);
        } catch (error) {
            result.failure.push([item[0], String(error)]);
            core.error(`${item[0]}: ${error}`);
        }
    }

    await summary(result);
}

async function summary(result: Result) {
    core.summary.addHeading('检查结果', 2);

    core.summary.addTable([
        ['状态', 'ID', 'Repo', '原因'],
        ...result.success.map((item) => [
            '✅',
            item[0],
            `[${item[1].owner}/${item[1].repo}](https://github.com/${item[1].owner}/${item[1].repo})`,
            '-',
        ]),
        ...result.failure.map((item) => ['❌', item[0], 'null', item[1]]),
    ]);

    core.summary.addEOL();
    core.summary.addRaw(
        `共${result.success.length + result.failure.length}项；${
            result.success.length
        }项成功，${result.failure.length}项失败`,
        true
    );

    core.summary.addQuote('生成时间: ' + new Date().toString());

    if (result.failure.length > 0)
        core.setFailed(
            `存在"${result.failure[0][0]}"等共${result.failure.length}项有问题的插件`
        );

    await core.summary.write();
}

function checkId(item: [string, any]) {
    if (!/^[a-zA-Z][a-zA-Z0-9\\-]{4,25}$/.test(item[0]))
        throw new Error('ID不符合规范');
}

function checkItem(item: [string, any]) {
    if (typeof item[1] !== 'object') throw new TypeError('该项不是一个object');
    if (!item[1]['owner']) throw new Error('"owner" 为空');
    if (!item[1]['repo']) throw new Error('"repo" 为空');
}
