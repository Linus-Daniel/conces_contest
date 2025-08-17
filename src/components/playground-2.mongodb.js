// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("contest");

// MongoDB Compass or Shell Commands

// 1. Check current state of contestants
// Query to see how many contestants don't have isQualified field
db.enrolls.countDocuments({ isQualified: { $exists: false } })

// Query to see all contestants without isQualified field
db.enrolls.find({ isQualified: { $exists: false } })

// 2. Update all contestants to add isQualified field with default true
db.enrolls.updateMany(
  { isQualified: { $exists: false } },
  { $set: { isQualified: true } }
)

// 3. Alternative: Update all contestants (even if field exists) to true
db.enrolls.updateMany(
  {},
  { $set: { isQualified: true } }
)

// 4. Verify the update
db.enrolls.countDocuments({ isQualified: true })
db.enrolls.countDocuments({ isQualified: false })

// 5. Check a few documents to confirm the field was added
db.enrolls.find({}).limit(3)

// 6. If you want to set some contestants as disqualified (example)
// Replace 'email@example.com' with actual emails or use other criteria
db.enrolls.updateMany(
  { email: { $in: ["test1@example.com", "test2@example.com"] } },
  { $set: { isQualified: false } }
)

// 7. Get statistics
db.enrolls.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      qualified: {
        $sum: {
          $cond: [{ $eq: ["$isQualified", true] }, 1, 0]
        }
      },
      disqualified: {
        $sum: {
          $cond: [{ $eq: ["$isQualified", false] }, 1, 0]
        }
      }
    }
  }
])