#### Meetings with [[John Doe]]
```dataviewjs
let meetings = dv.current().file.inlinks
meetings = meetings.sort(k => dv.page(k).date, 'desc')
for (let meeting of meetings){
if (dv.page(meeting).file.tags.indexOf("#meeting")>-1){
dv.el("p", "![[" + dv.page(meeting).file.name + "]]");}
}
```