import fs from "fs";
import { db } from "../config/db.js"; // your drizzle db
import { questions } from "../model/questionsSchema.js";

async function insertQuestions() {
    const rawData = fs.readFileSync("./pyqs/cse/sem6.json", "utf-8");
    const data = JSON.parse(rawData);

    const semester = data.semester;

    const rows = [];

    for (const subject of data.subjects) {
        for (let i = 0; i < subject.training_data.length; i++) {
            const q = subject.training_data[i];

            rows.push({
                questionId: `${subject.subject_code}_${i}`, // generate ID
                subjectCode: subject.subject_code,
                semester: semester,
                moduleId: q.module_id,
                topic: q.topic,
                marks: q.marks,
                instruction: q.instruction,
                output: q.output
            });
        }
    }

    // 🔥 bulk insert (important)
    await db.insert(questions).values(rows);

    console.log("✅ Questions inserted successfully");
}

insertQuestions();