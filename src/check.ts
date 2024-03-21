import * as core from '@actions/core';
import { PLUGININFOJSON } from './constants.ts';
import { octokit, rawGHInstance } from './network.ts';
import { PluginFullInfo, PluginShortInfo } from './types.ts';

declare type Result = {
    success: [string, PluginShortInfo][];
    failure: [string, PluginShortInfo | null, string][];
};

export async function check(datas: [string, any][]) {
    const result: Result = { failure: [], success: [] };

    for (const item of datas) {
        try {
            checkId(item);
            console.log(`[${item[0]}] id检查通过`);

            checkItem(item);
            console.log(`[${item[0]}] 插件索引信息检查通过`);

            await checkJson(item);
            console.log(`[${item[0]}] 插件仓库信息检查通过`);

            result.success.push([item[0], item[1]]);
        } catch (error) {
            result.failure.push([item[0], item[1], String(error)]);
            core.error(`[${item[0]}]: ${error}`);
        }
    }

    return result;
}
export async function summaryCheck(result: Result) {
    core.summary.addHeading('检查结果', 2);

    core.summary.addTable([
        ['状态', 'ID', 'Repo', '原因'],
        ...result.success.map((item) => [
            '✅',
            `<code>${item[0]}</code>`,
            `<a href="https://github.com/${item[1].owner}/${item[1].repo}">${item[1].owner}/${item[1].repo}</a>`,
            '-',
        ]),
        ...result.failure.map((item) => [
            '❌',
            `<code>${item[0]}</code>`,
            item[1]?.owner && item[1]?.repo
                ? `<a href="https://github.com/${item[1].owner}/${item[1].repo}">${item[1].owner}/${item[1].repo}</a>`
                : '-',
            item[2],
        ]),
    ]);

    core.summary.addEOL();
    core.summary.addRaw(
        `共${result.success.length + result.failure.length}项；${
            result.success.length
        }项成功，${result.failure.length}项异常`,
        true
    );

    const rateLimit = await octokit.rest.rateLimit.get();
    core.summary.addDetails(
        'Octokit Api状态',
        `${rateLimit.data.rate.remaining}/${
            rateLimit.data.rate.limit
        }<br>重置时间: <code>${new Date(
            rateLimit.data.rate.reset * 1000
        ).toISOString()}</code>`
    );

    await core.summary.write();

    if (result.failure.length > 0)
        core.setFailed(
            `存在"${result.failure[0][0]}"等共${result.failure.length}项有问题的插件`
        );
}

function checkId(item: [string, any]) {
    if (!/^[a-zA-Z][a-zA-Z0-9\\-]{4,25}$/.test(item[0]))
        throw new Error('id不符合规范');

    if (item[0] === 'index') throw new Error('该id使用了一个保留字段');
}

function checkItem(item: [string, any]) {
    if (typeof item[1] !== 'object') throw new TypeError('该项不是一个object');
    if (!item[1]['owner']) throw new Error('"owner" 为空');
    if (!item[1]['repo']) throw new Error('"repo" 为空');
}

async function checkJson(item: [string, PluginShortInfo]) {
    const result = await octokit.rest.repos.get({
        owner: item[1].owner,
        repo: item[1].repo,
    });

    if (result.status !== 200) throw new Error('仓库不存在');

    const branch = item[1].branch || result.data.default_branch;
    const location =
        `${item[1].owner}/${item[1].repo}/${branch}/` +
        (item[1].path ? item[1].path.replace(/^(.\/)+/, '') : '') +
        PLUGININFOJSON;

    const data = (await rawGHInstance.get<PluginFullInfo>(location)).data;

    if (typeof data !== 'object') throw new TypeError('插件信息类型不正确');

    if (!data['id']) throw new Error('"id" 为空');
    if (typeof data['id'] !== 'string') throw new TypeError('"id" 类型不正确');
    if (data['id'] !== item[0]) throw new Error('"id" 与索引中的id不一致');

    if (!data['name']) throw new Error('"name" 为空');
    if (typeof data['name'] !== 'string')
        throw new TypeError('"name" 类型不正确');

    if (!data['author']) throw new Error('"author" 为空');
    if (typeof data['author'] !== 'string')
        throw new TypeError('"author" 类型不正确');

    if (!data['version']) throw new Error('"version" 为空');
    if (typeof data['version'] !== 'string')
        throw new TypeError('"version" 类型不正确');

    if (!data['targetingSereinVersion'])
        throw new Error('"targetingSereinVersion" 为空');
    if (typeof data['targetingSereinVersion'] !== 'string')
        throw new TypeError('"targetingSereinVersion" 类型不正确');

    if (!data['tags']) throw new Error('"tags" 为空');
    if (!Array.isArray(data['tags'])) throw new TypeError('"tags" 类型不正确');

    const tags = data['tags'].filter(
        (v) =>
            ![
                'entertainment',
                'development',
                'tool',
                'information',
                'management',
                'api',
            ].includes(v)
    );
    if (tags.length > 0)
        throw new Error('"tags" 中存在未知的tag: ' + tags.join(','));
}
