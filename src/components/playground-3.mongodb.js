// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("contest");

db.enrolls.updateMany(
  { institutions: { $exists: true } },
  { $rename: { institutions: "institution" } }
);