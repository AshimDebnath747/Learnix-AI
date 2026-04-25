import fs from "fs";
import { db } from "../config/db.js";
import { subjects } from "../model/subjectsSchema.js";

async function insertSubjects() {
    const raw = fs.readFileSync("./pyqs/cse/sem6.json", "utf-8");
    const data = JSON.parse(raw);

    const rows = data.subjects.map((sub) => ({
        subjectCode: sub.subject_code,
        subjectTitle: sub.subject_title,
        semester: data.semester,
        university: data.university
    }));

    await db.insert(subjects).values(rows);

    console.log("✅ Subjects inserted");
}

insertSubjects();