import * as core from '@actions/core';
import { loadFile } from './data.ts';

export async function check() {
    const result = loadFile();

    await core.summary.clear();
    core.summary.addHeading('检查结果', 1);

    core.summary.addTable([
        ['状态', 'ID', 'Repo', '原因'],
        ...result.success.map((item) => [
            '✅',
            item[0],
            `${item[1].owner}/${item[1].repo}`,
            'null',
        ]),
        ...result.invalid.map((item) => ['❌', item[0], 'null', item[1]]),
    ]);

    core.summary.addEOL();
    core.summary.addRaw(
        `共${result.success.length + result.invalid.length}项；${
            result.success.length
        }项成功，${result.invalid.length}项失败`
    );

    core.summary.addQuote(new Date().toString());

    if (result.invalid.length > 0) {
        result.invalid.forEach((item) => core.error(`${item[0]}: ${item[1]}`));
        core.setFailed(
            `存在'${result.invalid[0]}'等共${result.invalid.length}项有问题的插件`
        );
    }
}
