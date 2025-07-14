---
tags: meeting, future
---
```button
name Finish Meeting
type command
action QuickAdd: FinishMeeting
color yellow
remove true
```
^button-y9qv
#### Metadata
Project:: 
Date:: [[<% tp.date.now("YYYY-MM-DD") %>]]

# Preparation
- 

# Agenda & files
- 

# Attendees
- 

# Notes
- 
<%*
  let title = tp.file.title
  await tp.file.rename(`${title}` + ` ` + tp.date.now("YYYY-MM-DD"));
%>