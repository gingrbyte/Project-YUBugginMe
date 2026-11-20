# Test overview

Open the app with Live Server (right click `index.html` > Open with Live Server).

| # | Test | Expected result | Result |
|---|------|-----------------|--------|
| 1 | Open the page | 4 bugs from `src/data/bugs.json` are shown, dashboard says Total 4 | ☑ |
| 2 | Add a new bug (valid data) | Bug shows up in the overview, dashboard counts it | ☑ |
| 3 | Submit an empty title (or "ab") | Error message, bug is not added | ☑ |
| 4 | Submit without status or priority | Error message per field, bug is not added | ☑ |
| 5 | Filter on status "open" + priority "high" | Only open high priority bugs; a message shows when nothing matches | ☑ |
| 6 | Search for "css" | Only bugs with "css" in the title or labels | ☑ |
| 7 | Change the status on a card | Card and dashboard update right away | ☑ |
| 8 | Export | `bugs.json` downloads and contains valid JSON (see `docs/bugs-export--example.json`) | ☑ |
| 9 | Import the exported file | All bugs come back, message says imported | ☑ |
| 10 | Import an invalid file (broken JSON or status "wrong") | Error message, current list stays | ☑ |
| 11 | Rename `src/data/bugs.json` and reload | "Loading failed" message, app still works | ☑ |