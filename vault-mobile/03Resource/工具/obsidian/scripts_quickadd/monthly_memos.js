// ✅ 配置区
const config = {
  gddSectionTitle: "### GDD 统计",
  gddTargetSectionPattern: /(### GDD 统计\s*\n)([\s\S]*?)(?=\n### |\n## |\n# |$)/,
  chartTitle: "GDD 标签统计饼图",
  tagPatterns: {
    observe: /#### 👀 Observe · (\d+) 条/,   
    good: /#### 👍 Good · (\d+) 条/,         
    difficult: /#### 💪 Difficult · (\d+) 条/,
    different: /#### 🌟 Different · (\d+) 条/
  },
  memoTargetSectionPattern: /(### 标签统计\s*\n)([\s\S]*?)(?=\n### |\n## |\n# |$)/,
  memoSectionPattern: /## Memos\s*([\s\S]*?)(?=\n## |\n# |$)/,
  tagPattern: /#([a-zA-Z0-9\u4e00-\u9fa5_-]+)/g,
};

// ✅ 从文件内容中提取 Memos 章节
function extractMemoSection(content) {
  const match = content.match(config.memoSectionPattern);
  return match ? match[1] : "";
}

// ✅ 从 Memos 章节中提取并统计标签
function extractTagsFromMemos(memoSection) {
  const tags = {};
  let match;
  while ((match = config.tagPattern.exec(memoSection)) !== null) {
    const tag = match[1];
    tags[tag] = (tags[tag] || 0) + 1;
  }
  return tags;
}

// ✅ 统计所有文件中的标签
async function collectTagStatistics(dv, files) {
  const allTags = {};
  
  for (const file of files) {
    const content = await dv.io.load(file.file.path);
    const memoSection = extractMemoSection(content);
    
    if (memoSection) {
      const fileTags = extractTagsFromMemos(memoSection);
      for (const tag in fileTags) {
        allTags[tag] = (allTags[tag] || 0) + fileTags[tag];
      }
    }
  }
  
  // 按标签出现次数排序
  const sortedTags = Object.entries(allTags)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  
  return sortedTags;
}

// ✅ 构造tag chartsview 块 (柱状图)
function generateTagChartsViewData(tagStats) {
  let dataLines = [];
  
  // 取前10个标签（如果超过10个的话）
  const topTags = Object.entries(tagStats).slice(0, 10);
  
  for (const [tag, count] of topTags) {
    dataLines.push(`  - tag: "#${tag}"\n    count: ${count}`);
  }
  
  return `\`\`\`chartsview
type: Bar
data:
${dataLines.join("\n")}
options:
  xField: "count"
  yField: "tag"
  seriesField: "tag"
  label: 
    position: "right"
\`\`\``;
}


// ✅ 主函数：生成 & 写入标签统计
async function generateAndInsertTagStatistics(dv) {
  try {
    const { year, month } = getYearAndMonth(dv);
    console.log(`分析月份：${year}-${month}`);

    const weeklyFiles = await getWeeklyFilesForMonth(dv, year, month);
    console.log(`找到 ${weeklyFiles.length} 个周总结文件`);

    if (weeklyFiles.length === 0) {
      new Notice(`没有找到 ${year}-${month} 月份的周总结文件`);
      return;
    }

    const tagStats = await collectTagStatistics(dv, weeklyFiles);
    const tagCount = Object.keys(tagStats).length;
    
    if (tagCount === 0) {
      new Notice("未在 Memos 章节中找到任何标签");
      return;
    }
    
    const chartsViewData = generateTagChartsViewData(tagStats);
    const currentFile = app.workspace.getActiveFile();
    const fileContent = await app.vault.read(currentFile);
    const success = await updateFileContent(app, fileContent, config.memoTargetSectionPattern, chartsViewData);

    if (success) {
      const topTags = Object.entries(tagStats).slice(0, 3);
      const topTagsMessage = topTags.map(([tag, count]) => `#${tag}: ${count}次`).join("\n");
      new Notice(`标签统计已更新 ✅\n共 ${tagCount} 个标签\n\n前三名标签:\n${topTagsMessage}`);
    }
  } catch (error) {
    console.error("标签统计错误:", error);
    new Notice(`标签统计错误: ${error.message}`);
  }
}


// ✅ 获取当前文件中推断的年份与月份
function getYearAndMonth(dv) {
  const currentFileName = app.workspace.getActiveFile().name;
  const match = currentFileName.match(/(\d{4})-(\d{2})/);
  if (match) {
    return { year: match[1], month: match[2] };
  } else {
    const now = new Date();
    return {
      year: now.getFullYear().toString(),
      month: (now.getMonth() + 1).toString().padStart(2, '0')
    };
  }
}

// ✅ 查找符合条件的 Weekly 文件
async function getWeeklyFilesForMonth(dv, year, month) {
  const weeklyFolder = `Diary/${year}/Weekly`;
  const weeklyFiles = [];
  const allWeeklyFiles = dv.pages(`"${weeklyFolder}"`);

  for (const file of allWeeklyFiles) {
    const weekMatch = file.file.name.match(/(\d{4})-W(\d{1,2})/);
    if (weekMatch) {
      const fileYear = weekMatch[1];
      const weekNum = parseInt(weekMatch[2]);
      const janFirst = new Date(fileYear, 0, 1);
      const weekDate = new Date(janFirst.getTime());
      weekDate.setDate(janFirst.getDate() + (weekNum - 1) * 7);
      const weekMonth = (weekDate.getMonth() + 1).toString().padStart(2, '0');
      if (fileYear === year && weekMonth === month) {
        weeklyFiles.push(file);
      }
    }
  }

  return weeklyFiles;
}

// ✅ 统计标签出现次数
async function extractGDDCounts(dv, files) {
  let observeCount = 0,goodCount = 0, difficultCount = 0, differentCount = 0;
  for (const file of files) {
    const content = await dv.io.load(file.file.path);
    const observeMatch = content.match(config.tagPatterns.observe);
    const goodMatch = content.match(config.tagPatterns.good);
    const difficultMatch = content.match(config.tagPatterns.difficult);
    const differentMatch = content.match(config.tagPatterns.different);

    if (observeMatch) observeCount += parseInt(observeMatch[1]);
    if (goodMatch) goodCount += parseInt(goodMatch[1]);
    if (difficultMatch) difficultCount += parseInt(difficultMatch[1]);
    if (differentMatch) differentCount += parseInt(differentMatch[1]);
  }
  return { observeCount, goodCount, difficultCount, differentCount };
}

// ✅ 构造 gdd chartsview 块
function generateGddChartsViewData(observeCount, goodCount, difficultCount, differentCount) {
  return `\`\`\`chartsview
type: Pie
data:
  - type: "Observe"
    value: ${observeCount}
  - type: "Good"
    value: ${goodCount}
  - type: "Difficult"
    value: ${difficultCount}
  - type: "Different"
    value: ${differentCount}
options:
  angleField: "value"
  colorField: "type"
  radius: 0.5
  label:
    type: "spider"
    content: "{value}条\\n{percentage}\\n{name}"
  legend:
    layout: "horizontal"
    position: "bottom"
\`\`\``;
}

// ✅ 更新当前文件的内容
async function updateFileContent(app, fileContent, targetSectionPattern , chartsViewData) {
  const currentFile = app.workspace.getActiveFile();
  if (!currentFile) {
    console.error("无法获取当前文件");
    return false;
  }
  const match = fileContent.match(targetSectionPattern);
  if (!match) {
    new Notice(`错误: 未找到 ${targetSectionPattern} 的章节，请先创建此章节`);
    return false;
  }

  const sectionHeader = match[1];
  const sectionContent = match[2];
  const chartsViewRegex = /```chartsview[\s\S]*?```/;
  const hasChartsView = chartsViewRegex.test(sectionContent);

  let newContent;
  if (hasChartsView) {
    const updatedSectionContent = sectionContent.replace(chartsViewRegex, chartsViewData);
    newContent = fileContent.replace(targetSectionPattern, sectionHeader + updatedSectionContent);
  } else {
    newContent = fileContent.replace(targetSectionPattern, sectionHeader + chartsViewData + "\n\n" + sectionContent);
  }

  await app.vault.modify(currentFile, newContent);
  return true;
}

// ✅ 主函数：生成 & 写入 GDD 统计
async function generateAndInsertGDDStatistics(dv) {
  try {
    const { year, month } = getYearAndMonth(dv);
    console.log(`分析月份：${year}-${month}`);

    const weeklyFiles = await getWeeklyFilesForMonth(dv, year, month);
    console.log(`找到 ${weeklyFiles.length} 个周总结文件`);

    if (weeklyFiles.length === 0) {
      new Notice(`没有找到 ${year}-${month} 月份的周总结文件`);
      return;
    }

    const { observeCount, goodCount, difficultCount, differentCount } = await extractGDDCounts(dv, weeklyFiles);
    const chartsViewData = generateGddChartsViewData(observeCount, goodCount, difficultCount, differentCount);
    const currentFile = app.workspace.getActiveFile();
    const fileContent = await app.vault.read(currentFile);
    const success = await updateFileContent(app, fileContent, config.gddTargetSectionPattern, chartsViewData);

    if (success) {
      new Notice(`GDD 统计已更新 ✅\n👍 Observe: ${observeCount} 条\n✅\n👍 Good: ${goodCount} 条\n💪 Difficult: ${difficultCount} 条\n🌟 Different: ${differentCount} 条`);
    }
  } catch (error) {
    console.error("GDD 统计错误:", error);
    new Notice(`GDD 统计错误: ${error.message}`);
  }
}

// 导出提供给 QuickAdd 使用的函数
module.exports = async (params) => {
  const { app } = params;
  const dv = app.plugins.plugins.dataview.api;
  
  // 获取当前活动文件
  const activeFile = app.workspace.getActiveFile();
  if (!activeFile) {
    new Notice("请先打开一个文件", 3000);
    return;
  }
  
  // 用户可以选择要执行的功能
  const choice = await params.quickAddApi.suggester(
    ["🙂 生成本月GDD统计", "🏷️ 生成本月标签统计"],
    ["gdd", "tag"]
  );
  try {
    if (choice === "gdd") {
      await generateAndInsertGDDStatistics(dv);
    } else if (choice === "tag") {
      await generateAndInsertTagStatistics(dv);
    }
  } catch (error) {
    console.error('操作失败:', error);
    new Notice(`❌ 执行失败，请查看控制台`, 5000);
  }
};