> [!info]
> This is a sample vault. More info is available [here](https://forum.obsidian.md/t/dashboard-and-workflow-for-obsidian-at-work-sales/34794).

- [x] Read this note before playing with this vault 📅 1999-01-01 ✅ 2025-07-14

# To get this vault working

1. Change the logo links in [[New meeting template]] and [[Dunder Mifflin]] to where the logos are stored on your computer

# Things you can do

#### Go to dashboard

1. Click "Ctrl - D" or the Home-button in the left menu

#### Create a new customer case

1. Create a blank note and give it the customer's name
2. Click "Ctrl + -" or run command "QuickAdd SetupNewCustomer"
3. The script will now
   1. Auto-populate the note
   2. Create a new folder called your customer name in the "Customers"-folder
   3. Launch an image search for the logo in your browser. Save the logo you wish to keep as "\<customername\>.png" in the "Logos"-folder. If size is not good then it need to be resized (see the [Obsidian forum](https://forum.obsidian.md/t/dashboard-and-workflow-for-obsidian-at-work-sales/34794) for example on how)

#### Create a new meeting

1. Create a blank note. If you want it you can name it for example "Meeting with"
2. Click "Ctrl - M" or run command "QuickAdd SetupNewMeeting"
3. The script will now
   1. Ask you for the meeting date. Enter in this format: "24apr".
   2. Ask you for the customer case or project.
   3. Auto-populate the note
   4. Update the note title
4. Once the meeting has been held you can click the "Finish meeting"-button. This will mark the meeting as has been held and will move it to the customer folder (if applicable)

#### Create a new person

1. Create a blank note and name it the person's name
2. Click "Ctrl - R" or run command "QuickAdd Ask for employer"
3. The script will now ask you for the employer
4. If the employer is same as yours (currently configured as "ACME") then tag Colleague is added, otherwise tag Customer is added
5. The script will finally move the note to the "🧑CRM"-folder
