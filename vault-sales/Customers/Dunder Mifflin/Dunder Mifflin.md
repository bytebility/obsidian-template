---
tags: case, 
logo: file:///C:/< YOUR PATH HERE! >/Logos/Dunder%20Mifflin.png
---
#### General
- AE:: [[John Doe]]
- [CRM](https://mycorporatecrm.com/list/adwef789sdl)
- Products:: [[CSR]]

#### Info
- ERPs:: [[SAP]]

#### Todos
```tasks
not done
path includes Dunder Mifflin
hide task count
hide start date
```

#### Activities
- [[2022-04-05]]
	- Chatted with [[John Doe]] about various options that could be suitable. Agreed to create a business case calculation. 📅 2022-04-05
- [[2022-04-04]]
	- [ ] Add to [CRM](https://mycorporatecrm.com/list) ⏳ 2022-04-19
	- [ ] Add [logo](https://www.google.com/search?q=logo+fileformat:png&tbm=isch) ⏳ 2022-04-19

#### Meetings
```dataviewjs
let meetings = dv.pages(`"${dv.current().file.folder}" and #meeting`)
meetings = meetings.sort(k => k.date, 'desc')
for (let meeting of meetings){
dv.el("p", "![[" + meeting.file.name + "]]");
}
```