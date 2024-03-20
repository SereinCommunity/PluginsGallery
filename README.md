# PluginsGallery

Serein的插件列表索引

- 主索引文件：[`index.json`](https://sereincommunity.github.io/PluginsGallery/index.json)

## 提交插件教程

> [!warning]
> 提交并审核通过后不一定马上生效

### PR （⭐推荐）

1. fork此仓库的`main`分支
2. 打开根目录下的`list.json`
3. 在其中加入自己的插件项，其中`key`为插件ID，`value`为插件的仓库信息
   ```jsonc
    {
        // .........
        "example": {
            "owner": "", // 仓库所有者
            "repo": "", // 仓库名称
            "branch": null, // 分支。保留为空则使用默认分支
            "path": "/" // `plugininfo.json`的所在路径
        }
    }
   ```
4. 推送并提交pr等待审核

> [!tip]
> 为方便维护，推荐按照字母排序插件ID

### 提交Issue

1. [点此处](https://github.com/SereinCommunity/PluginsGallery/issues/new/choose)打开Issue界面
2. 选择`提交插件`
3. 按提示填写

