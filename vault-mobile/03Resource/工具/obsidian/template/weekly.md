# weekly
<%*
// 生成标题和日期
const curFile = tp.file.title;
const isWeeklyFile = curFile.match(/(\d+)-W(\d+)/);
if (isWeeklyFile) {
    const [_, targetYear, targetWeek] = isWeeklyFile;

    // 计算周的开始和结束日期
    const startDate = moment().isoWeekYear(targetYear).isoWeek(targetWeek).startOf('isoWeek').format("YYYY-MM-DD");
    const endDate = moment().isoWeekYear(targetYear).isoWeek(targetWeek).endOf('isoWeek').format("YYYY-MM-DD");

    // 格式化周数显示
    const weekDisplay = `W${targetWeek.padStart(2, '0')}`;

    // 输出内容
    tR += `# ${targetYear}-${weekDisplay} 周报\n\n`;
    tR += `📅 时间范围: ${startDate} 至 ${endDate}`;
} else {
    tR += "⚠️ 文件名格式错误，请使用 'YYYY-Wxx' 格式。";
}
%>

```dataviewjs  
const quickAddChoice  = "周总结-汇总";
// 获取 QuickAdd 插件 API
const quickAdd = app.plugins.plugins["quickadd"];
if (!quickAdd) {
  new Notice("❌ 未检测到 QuickAdd 插件，请先启用它");
}
const btn = dv.el("button", quickAddChoice);
// 创建按钮并绑定点击事件
btn.addEventListener("click", async () => {
  try {
    await quickAdd.api.executeChoice(quickAddChoice);
  } catch (err) {
    new Notice(`❌ 运行失败：${err.message}`);
  }
});
```

## 周计划
1. kr1
2. kr2

## 周复盘

> * KR 达成情况
> * 未达成的卡点

### 工作成果

### 极客工具

## Memos
### GDD 明细

> 自动汇总的数据：good,difficult,different

## Task
### Task 明细

> 自动汇总的数据：按标签分组的 task 执行情况