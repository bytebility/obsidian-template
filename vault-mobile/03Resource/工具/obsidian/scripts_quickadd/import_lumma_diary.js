module.exports = async (params) => {
    const { quickAddApi: { inputPrompt }, app } = params;
    const adapter = app.vault.adapter;

    // 配置常量
    const CONFIG = {
        SOURCE_FOLDER: "00Mobile/lumma/data/diary",
        TARGET_BASE: "Diary"
    };

    // 工具函数
    const utils = {
        // 显示通知
        showNotice: (message, isError = false) => {
            new Notice(message);
            if (isError) {
                console.error(message);
            } else {
                console.log(message);
            }
        },

        // 确保目录存在
        ensureFolder: async (folderPath) => {
            try {
                const folder = app.vault.getAbstractFileByPath(folderPath);
                if (!folder) {
                    await app.vault.createFolder(folderPath);
                    console.log(`Created folder: ${folderPath}`);
                }
                return true;
            } catch (error) {
                console.error(`Error ensuring folder ${folderPath}:`, error);
                throw error;
            }
        },

        // 从文件名提取日期信息
        extractDateInfo: (fileName) => {
            const match = fileName.match(/(\d{4}-\d{2}-\d{2})\.md$/);
            if (match) {
                const dateStr = match[1];
                const year = dateStr.substring(0, 4);
                return { dateStr, year };
            }
            return null;
        },

        // 从内容中提取日记内容
        extractDiaryContent: (content) => {
            const lines = content.split('\n');
            let inDailySummary = false;
            let inDiaryContent = false;
            let diaryLines = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // 检测是否进入日总结章节
                if (line.trim() === '## 日总结') {
                    inDailySummary = true;
                    continue;
                }
                
                // 如果已经在日总结章节中，检测日记内容子章节
                if (inDailySummary && line.trim() === '### 日记内容') {
                    inDiaryContent = true;
                    continue;
                }
                
                // 如果遇到新的章节（以 ## 或 ### 开头），停止收集
                if (inDiaryContent && (line.match(/^##[^#]/) || line.match(/^###[^#]/))) {
                    break;
                }
                
                // 如果在日记内容章节中，收集内容
                if (inDiaryContent && line.trim() !== '') {
                    diaryLines.push(line);
                }
            }
            
            return diaryLines.length > 0 ? diaryLines.join('\n') : null;
        },

        // 更新或创建目标文件
        updateTargetFile: async (targetPath, dateStr, diaryContent) => {
            let existingContent = '';
            let fileExists = false;
            
            try {
                const file = app.vault.getAbstractFileByPath(targetPath);
                if (file) {
                    existingContent = await app.vault.read(file);
                    fileExists = true;
                }
            } catch (error) {
                console.log(`Target file doesn't exist, will create: ${targetPath}`);
            }
            
            let updatedContent;
            
            if (fileExists) {
                // 文件存在，查找或创建 memos 章节
                const lines = existingContent.split('\n');
                let memosIndex = -1;
                let nextSectionIndex = -1;
                
                // 查找 memos 章节
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim() === '## memos') {
                        memosIndex = i;
                        break;
                    }
                }
                
                if (memosIndex !== -1) {
                    // 找到 memos 章节，查找下一个章节的位置
                    for (let i = memosIndex + 1; i < lines.length; i++) {
                        if (lines[i].match(/^##[^#]/)) {
                            nextSectionIndex = i;
                            break;
                        }
                    }
                    
                    // 在 memos 章节中插入内容
                    const beforeMemos = lines.slice(0, memosIndex + 1);
                    const afterMemos = nextSectionIndex !== -1 ? lines.slice(nextSectionIndex) : [];
                    
                    updatedContent = [
                        ...beforeMemos,
                        '',
                        diaryContent,
                        '',
                        ...afterMemos
                    ].join('\n');
                } else {
                    // 没有找到 memos 章节，在文件末尾添加
                    updatedContent = existingContent + '\n\n## memos\n\n' + diaryContent + '\n';
                }
            } else {
                // 文件不存在，创建新文件
                updatedContent = `# ${dateStr}\n\n## memos\n\n${diaryContent}\n`;
            }
            
            try {
                await adapter.write(targetPath, updatedContent);
                console.log(`Updated target file: ${targetPath}`);
                return true;
            } catch (error) {
                console.error(`Error writing target file ${targetPath}:`, error);
                throw error;
            }
        }
    };

    // 主执行函数
    const main = async () => {
        try {
            // 检查源文件夹
            const sourceFolder = app.vault.getAbstractFileByPath(CONFIG.SOURCE_FOLDER);
            if (!sourceFolder || !sourceFolder.children) {
                throw new Error(`Directory not found or inaccessible: ${CONFIG.SOURCE_FOLDER}`);
            }

            // 获取所有日期格式的 md 文件
            const diaryFiles = sourceFolder.children
                .filter(file => file.extension === 'md')
                .filter(file => /\d{4}-\d{2}-\d{2}\.md$/.test(file.name))
                .sort((a, b) => a.name.localeCompare(b.name));

            if (diaryFiles.length === 0) {
                throw new Error(`No diary files found in ${CONFIG.SOURCE_FOLDER}`);
            }

            console.log(`Found ${diaryFiles.length} diary files to process`);

            let processedCount = 0;
            let skippedCount = 0;

            // 处理每个日记文件
            for (const file of diaryFiles) {
                const dateInfo = utils.extractDateInfo(file.name);
                if (!dateInfo) {
                    console.log(`Skipping file with invalid date format: ${file.name}`);
                    skippedCount++;
                    continue;
                }

                const { dateStr, year } = dateInfo;
                
                try {
                    // 读取源文件内容
                    const content = await app.vault.read(file);
                    
                    // 提取日记内容
                    const diaryContent = utils.extractDiaryContent(content);
                    
                    if (!diaryContent) {
                        console.log(`No diary content found in: ${file.name}`);
                        skippedCount++;
                        continue;
                    }

                    // 确保目标年份文件夹存在
                    const targetYearFolder = `${CONFIG.TARGET_BASE}/${year}`;
                    await utils.ensureFolder(CONFIG.TARGET_BASE);
                    await utils.ensureFolder(targetYearFolder);

                    // 构建目标文件路径
                    const targetPath = `${targetYearFolder}/${dateStr}.md`;
                    
                    // 更新目标文件
                    await utils.updateTargetFile(targetPath, dateStr, diaryContent);
                    
                    processedCount++;
                    console.log(`Processed: ${file.name} -> ${targetPath}`);
                    
                } catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                    skippedCount++;
                }
            }

            utils.showNotice(`日记导入完成！处理了 ${processedCount} 个文件，跳过了 ${skippedCount} 个文件。`);
            
        } catch (error) {
            utils.showNotice(`导入失败: ${error.message}`, true);
            console.error('Import error:', error);
        }
    };

    // 执行主函数
    await main();
};