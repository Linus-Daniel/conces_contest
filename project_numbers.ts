import mongoose from "mongoose";
import fs from "fs";
import Project from "@/models/Project";
import Enroll from "@/models/Enroll";

async function countSubmittedAndSelected() {
  try {
    await mongoose.connect(
      "mongodb+srv://ld604068:zfyOhBow2nmL1L8Z@cluster0.wipjjmc.mongodb.net/conces"
    );

    const _ =Enroll.find()

    // ✅ Count submitted (anything except draft)
    const submittedCount = await Project.countDocuments({
      status: { $ne: "draft" },
    });

    // ✅ Find selected projects and populate candidate info
    const selectedProjects = await Project.find({
      status: "selected",
    }).populate("candidate", "email fullName avatar");

    console.log("📊 Project Statistics:");
    console.log(`• Total Submitted Projects: ${submittedCount}`);
    console.log(`• Total Selected Projects:  ${selectedProjects.length}`);

    // ✅ Prepare CSV data
    const header = "Full Name,Email,Candidate Link, Votes\n";
    const rows = selectedProjects
      .map((project) => {
        const candidate = project.candidate as any;
        const vote = project.vote
        const name = candidate?.fullName || "";
        const email = candidate?.email || "";
        const votingLink = `https://brandchallenge.conces.org/voting/candidate/${project._id}`;
        return `"${name}","${email}","${votingLink}",${vote}`;
      })
      .join("\n");

    const csvData = header + rows;

    // ✅ Save to CSV
    fs.writeFileSync("selected_candidates.csv", csvData, "utf8");
    console.log(
      `✅ Exported ${selectedProjects.length} selected candidates to selected_candidates.csv`
    );

    // ✅ (Optional) Save Google Sheets–ready copy
    fs.writeFileSync(
      "selected_candidates.tsv",
      csvData.replace(/,/g, "\t"),
      "utf8"
    );
    console.log(
      "📄 Also saved a Google Sheets–ready version (selected_candidates.tsv)"
    );

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

countSubmittedAndSelected();
