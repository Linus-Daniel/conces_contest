import mongoose from "mongoose";
import fs from "fs";
import Enroll from "@/models/Enroll";

async function exportPhones() {
  try {
    await mongoose.connect(
      "mongodb+srv://ld604068:zfyOhBow2nmL1L8Z@cluster0.wipjjmc.mongodb.net/conces"
    );

    const users = await Enroll.find({}, { phone: 1, _id: 0 });

    const phones = users
      .map((u) => {
        let phone = u.phone?.toString().trim() || "";
        phone = phone.replace(/\D/g, ""); // remove non-digits

        // format to +234
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

    // Join with comma and newline
    const formatted = phones.map((p) => `${p},`).join("\n");

    fs.writeFileSync("phones.csv", formatted);

    console.log(`✅ Exported ${phones.length} phone numbers to phones.csv`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

exportPhones();
