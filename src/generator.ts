import * as core from '@actions/core';
import * as fs from 'fs';

import { check } from './check.ts';
import { BUILDDIR, PLUGININFOJSON } from './constants.ts';
import { octokit, rawGHInstance } from './network.ts';
import { Indexes, PluginFullInfo, PluginShortInfo, RepoInfo } from './types.ts';
import { jsonc } from 'jsonc';

export async function generate(datas: [string, any][]) {
    if (fs.existsSync(BUILDDIR))
        fs.rmSync(BUILDDIR, { recursive: true, force: true });
    fs.mkdirSync(BUILDDIR);

    const result = await check(datas);

    if (result.success.length === 0) {
        core.setFailed('没有可用的插件');
        return;
    }

    const indexes = await createDict(
        result.success.sort((a, b) => a[0].localeCompare(b[0]))
    );

    fs.writeFileSync(
        `${BUILDDIR}/index.json`,
        jsonc.stringify(indexes, undefined, 4)
    );

    for (const key in indexes) {
        fs.writeFileSync(
            `${BUILDDIR}/${key}.json`,
            jsonc.stringify(indexes[key], undefined, 4)
        );
    }

    summary(indexes);
}

async function summary(inedxes: Indexes) {
    core.summary.addHeading('生成结果', 2);

    core.summary.addTable([
        ['ID', 'Repo'],
        ...Object.entries(inedxes).map((item) => [`<code>${item[0]}</code>`]),
    ]);

    const rateLimit = await octokit.rest.rateLimit.get();
    core.summary.addDetails(
        'Octokit Api状态',
        `${rateLimit.data.rate.remaining}/${
            rateLimit.data.rate.limit
        }<br>重置时间: ${new Date(
            rateLimit.data.rate.reset * 1000
        ).toISOString()}`
    );

    await core.summary.write();
}

async function createDict(data: [string, PluginShortInfo][]) {
    const indexes: Indexes = {};

    for (const item of data) {
        const repo = await octokit.rest.repos.get({
            owner: item[1].owner,
            repo: item[1].repo,
        });

        if (repo.status !== 200) continue;

        const branch = item[1].branch || repo.data.default_branch;
        const location =
            `${item[1].owner}/${item[1].repo}/${branch}/` +
            (item[1].path ? item[1].path.replace(/^(.\/)+/, '') : '') +
            PLUGININFOJSON;

        const info = (await rawGHInstance.get<PluginFullInfo>(location)).data;
        const releases = await octokit.rest.repos.listReleases({
            owner: item[1].owner,
            repo: item[1].repo,
            per_page: 20,
        });

        const indexInfo: PluginFullInfo & RepoInfo = {
            author: info.author,
            name: info.name,
            tags: info.tags,
            version: info.version,
            isDependency: Boolean(info.isDependency),
            dependencies: info.dependencies || [],
            description: info.description || null,
            targetingSereinVersion: info.targetingSereinVersion,
            targetingServerInfos: info.targetingServerInfos
                ? info.targetingServerInfos
                      .filter(
                          (v) =>
                              v.name &&
                              v.version &&
                              typeof v.name === 'string' &&
                              typeof v.version === 'string'
                      )
                      .map(
                          (v) =>
                              ({
                                  name: v.name,
                                  version: v.version,
                                  description: v.description || null,
                              } as {
                                  name: string;
                                  version: string;
                                  description?: string | undefined;
                              })
                      )
                : [],
            updateTime: repo.data.pushed_at,
            releases: releases.data.map((v) => ({
                name: v.name,
                tag: v.tag_name,
                time: v.published_at,
                assets: v.assets.map((i) => ({
                    size: i.size,
                    downloadCount: i.download_count,
                    url: i.browser_download_url,
                })),
            })),
        };

        indexes[item[0]] = indexInfo;
        console.log(`[${item[0]}] 插件索引生成成功`);
    }

    return indexes;
}
