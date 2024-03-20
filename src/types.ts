export declare type Indexes = { [key: string]: PluginFullInfo & RepoInfo };

export declare type PluginFullInfo = {
    name: string;
    author: string;
    version: string;
    targetingSereinVersion: string;
    targetingServerInfos?: {
        name: string;
        version: string;
        description?: string;
    }[];
    isDependency?: boolean;
    dependencies?: { id: string; version: string }[];
    description?: string | null;
    tags: (
        | 'entertainment'
        | 'development'
        | 'tool'
        | 'information'
        | 'management'
        | 'api'
    )[];
};

export declare type PluginShortInfo = {
    owner: string;
    repo: string;
    path?: string;
    branch?: string;
};

export declare type RepoInfo = {
    updateTime: string;
    releases: {
        name: string | null;
        tag: string;
        time: string | null;
        assets: { url: string; size: number; downloadCount: number }[];
    }[];
};
