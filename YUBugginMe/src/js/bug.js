// bug.js - the Bug class

class Bug {
  constructor(id, title, status, priority, labels, details) {
    this.id = id;
    this.title = title;
    this.status = status;
    this.priority = priority;
    this.labels = labels;     // array, e.g. ["css", "interface"]
    this.details = details;   // nested object, e.g. { page: "login", browser: "Chrome" }
  }

  // high priority and not resolved yet
  isCritical() {
    return this.priority === "high" && this.status !== "resolved";
  }

  isOpen() {
    return this.status !== "resolved";
  }

  hasLabel(label) {
    return this.labels.includes(label.toLowerCase());
  }

  // turns the priority into a number so i can sort
  priorityScore() {
    if (this.priority === "high") return 3;
    if (this.priority === "medium") return 2;
    return 1;
  }

  makeLabel() {
    return `${this.title} • ${this.status}`;
  }

  // the check is inside the class, so a wrong status gets refused
  setStatus(newStatus) {
    const errors = Bug.validate(this.title, newStatus, this.priority);
    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }
    this.status = newStatus;
  }

  // static: called on the class itself, Bug.validate(...)
  // returns a list of error messages (empty = all good)
  static validate(title, status, priority) {
    const errors = [];
    if (typeof title !== "string" || title.trim().length < 3) {
      errors.push("Title is required (at least 3 characters).");
    }
    if (!["open", "ongoing", "resolved"].includes(status)) {
      errors.push("Choose a valid status.");
    }
    if (!["low", "medium", "high"].includes(priority)) {
      errors.push("Choose a valid priority.");
    }
    return errors;
  }
}
