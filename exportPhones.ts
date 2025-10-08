import mongoose from "mongoose";
import fs from "fs";
import Enroll from "@/models/Enroll";

async function exportQualifiedPhones() {
  try {
    await mongoose.connect(
      "mongodb+srv://ld604068:zfyOhBow2nmL1L8Z@cluster0.wipjjmc.mongodb.net/conces"
    );

    // ✅ Fetch only qualified users
    const users = await Enroll.find(
      { isQualified: true },
      { phone: 1, _id: 0 }
    );

    const phones = users
      .map((u) => {
        let phone = u.phone?.toString().trim() || "";
        phone = phone.replace(/\D/g, ""); // remove non-digits

        // ✅ Format to +234
        if (phone.startsWith("234")) {
          phone = `+${phone}`;
        } else if (phone.startsWith("0")) {
          phone = `+234${phone.substring(1)}`;
        } else if (!phone.startsWith("+234")) {
          phone = `+234${phone}`;
        }

        return phone;
      })
      .filter(Boolean);

    // ✅ Optional: Remove duplicates
    const uniquePhones = [...new Set(phones)];

    // ✅ Save to CSV (comma-separated, each on new line)
    const formatted = uniquePhones.map((p) => `${p},`).join("\n");

    fs.writeFileSync("qualified_phones.csv", formatted);

    console.log(
      `✅ Exported ${uniquePhones.length} qualified phone numbers to qualified_phones.csv`
    );
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

exportQualifiedPhones();
