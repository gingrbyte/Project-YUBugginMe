// app.js - load, show, add, filter, stats, import and export

let bugs = []; // all Bug objects

function showMessage(text, type) {
  const message = document.getElementById("message");
  message.textContent = text;
  message.className = "message message-" + type; // a-ok?
  message.hidden = false;
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

// ---------- load JSON ----------
async function loadBugs() {
  try {
    const response = await fetch("src/data/bugs.json");
    if (!response.ok) {
      throw new Error("bugs.json not found (status " + response.status + ").");
    }
    const data = await response.json();
    bugs = convertToBugs(data);
  } catch (error) {
    bugs = [];
    showMessage("Loading failed: " + error.message + " Use Live Server or import a JSON file.", "error");
  }
  showAll();
}

// JSON record to Bug object
function convertToBugs(data) {
  if (!Array.isArray(data)) {
    throw new Error("JSON must be a list of bugs.");
  }
  const list = [];
  for (const record of data) {
    const errors = Bug.validate(record.title, record.status, record.priority);
    if (errors.length > 0) {
      throw new Error("Bug " + record.id + " is invalid: " + errors.join(" "));
    }
    list.push(new Bug(record.id, record.title, record.status, record.priority, record.labels || [], record.details || {}));
  }
  return list;
}

// ---------- filter and sort ---------- \\
function getFilteredBugs() {
  const searchText = document.getElementById("search").value.trim().toLowerCase();
  const status = document.getElementById("filterStatus").value;
  const priority = document.getElementById("filterPriority").value;

  const result = bugs.filter(function (bug) {
    const matchesStatus = status === "" || bug.status === status;
    const matchesPriority = priority === "" || bug.priority === priority;
    const matchesSearch = searchText === "" || bug.title.toLowerCase().includes(searchText) || bug.hasLabel(searchText);
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // open bugs first, then high priority first
  result.sort(function (a, b) {
    if (a.isOpen() !== b.isOpen()) {
      return a.isOpen() ? -1 : 1;
    }
    return b.priorityScore() - a.priorityScore();
  });

  return result;
}

// ---------- show ---------- \\
function makeCard(bug) {
  const card = document.createElement("li");
  card.className = "card priority-" + bug.priority;
  if (!bug.isOpen()) card.classList.add("resolved");

  const head = document.createElement("div");
  head.className = "card-head";
  head.append(makeElement("h3", "", bug.title));
  head.append(makeElement("span", "badge status-" + bug.status, bug.status));
  card.append(head);

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.append(makeElement("span", "priority-text-" + bug.priority, "Priority " + bug.priority));
  if (bug.isCritical()) {
    meta.append(makeElement("span", "critical", "Critical"));
  }
  card.append(meta);

  card.append(makeElement("p", "details", "Page: " + (bug.details.page || "-") + "  |  Browser: " + (bug.details.browser || "-")));

  const tags = document.createElement("p");
  tags.className = "tags";
  for (const label of bug.labels) {
    tags.append(makeElement("span", "tag", label));
  }
  card.append(tags);

  const actions = document.createElement("div");
  actions.className = "card-actions";

  // change status
  const select = document.createElement("select");
  for (const s of ["open", "ongoing", "resolved"]) {
    const option = document.createElement("option");
    option.value = s;
    option.textContent = s;
    option.selected = s === bug.status;
    select.append(option);
  }
  select.addEventListener("change", function () {
    bug.setStatus(select.value);
    showAll();
  });

  // delete
  const deleteButton = makeElement("button", "btn btn-small btn-danger", "Delete");
  deleteButton.type = "button";
  deleteButton.addEventListener("click", function () {
    if (confirm('Delete "' + bug.title + '"?')) {
      bugs = bugs.filter(function (b) { return b.id !== bug.id; });
      showAll();
    }
  });

  actions.append(select, deleteButton);
  card.append(actions);
  return card;
}

function showDashboard() {
  const open = bugs.filter((b) => b.status === "open").length;
  const ongoing = bugs.filter((b) => b.status === "ongoing").length;
  const resolved = bugs.filter((b) => b.status === "resolved").length;
  const critical = bugs.filter((b) => b.isCritical()).length;


  document.getElementById("dashboard").innerHTML = `
    <div class="stat"><strong>${bugs.length}</strong><span>Total</span></div>
    <div class="stat"><strong>${open}</strong><span>Open</span></div>
    <div class="stat"><strong>${ongoing}</strong><span>Ongoing</span></div>
    <div class="stat"><strong>${resolved}</strong><span>Resolved</span></div>
    <div class="stat"><strong>${critical}</strong><span>High priority (not resolved)</span></div>
  `;
}

function showAll() {
  showDashboard();

  const list = document.getElementById("bugList");
  list.innerHTML = "";

  const visible = getFilteredBugs();
  for (const bug of visible) {
    list.append(makeCard(bug));
  }

  const empty = document.getElementById("empty");
  empty.hidden = visible.length > 0;
  if (bugs.length === 0) {
    empty.textContent = "No bugs yet. Report a bug or import a JSON file.";
  } else {
    empty.textContent = "No bugs match these filters.";
  }
}

// ---------- add a bug ----------
function getNextId() {
  let highest = 0;
  for (const bug of bugs) {
    if (bug.id > highest) highest = bug.id;
  }
  return highest + 1;
}

document.getElementById("bugForm").addEventListener("submit", function (event) {
  event.preventDefault(); // don't reload the page

  const title = document.getElementById("bugTitle").value;
  const status = document.getElementById("bugStatus").value;
  const priority = document.getElementById("bugPriority").value;

  const errors = Bug.validate(title, status, priority);
  const errorList = document.getElementById("formErrors");
  errorList.innerHTML = "";
  for (const error of errors) {
    errorList.append(makeElement("li", "", error));
  }
  if (errors.length > 0) return; // don't add

  // "css, interface" becomes ["css", "interface"]
  const labels = document.getElementById("bugLabels").value
    .split(",")
    .map((l) => l.trim().toLowerCase())
    .filter((l) => l !== "");
  const details = {
    page: document.getElementById("bugPage").value.trim(),
    browser: document.getElementById("bugBrowser").value.trim()
  };

  bugs.push(new Bug(getNextId(), title.trim(), status, priority, labels, details));

  event.target.reset();
  showAll();
});

// ---------- filters ----------
document.getElementById("search").addEventListener("input", showAll);
document.getElementById("filterStatus").addEventListener("change", showAll);
document.getElementById("filterPriority").addEventListener("change", showAll);

// ---------- export ----------
document.getElementById("exportButton").addEventListener("click", function () {
  const content = JSON.stringify(bugs, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "bugs.json";
  link.click();
  URL.revokeObjectURL(url);

  showMessage(bugs.length + " bugs exported as bugs.json.", "ok");
});

// ---------- import ----------
document.getElementById("importFile").addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);   // fails on broken JSON
    bugs = convertToBugs(data);      // fails on invalid bugs
    showMessage(bugs.length + " bugs imported from " + file.name + ".", "ok");
  } catch (error) {
    showMessage("Import failed: " + error.message, "error"); // old list stays
  }

  event.target.value = ""; // so the same file can be picked again
  showAll();
});

loadBugs();
