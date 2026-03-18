import pdfplumber
import json
import re
import os

def parse_tripura_univ_syllabus(pdf_path):
    """Parses TU syllabus with improved error handling for missing keys."""
    # Matches: 'Semester 5', 'Semester - V', '5th Semester'
    sem_pattern = re.compile(r"(?:Semester|Sem|th Sem)[-\s]*([IVX\d]+)", re.IGNORECASE)
    # Matches: 'PC CS 502', 'HU 601', 'PC CE 801'
    code_pattern = re.compile(r"([A-Z]{2}\s[A-Z]{2,3}\s\d{3})")
    # Matches: 'Module 1', 'Unit-IV'
    mod_pattern = re.compile(r"(?:Module|Unit)[-\s]*([IVX\d]+)", re.IGNORECASE)

    branch_syllabus = {}
    current_sem = "Semester Unknown"
    
    # Pre-initialize the default key to avoid the 'General' error
    branch_syllabus[current_sem] = {}

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text: continue
                
                lines = text.split('\n')
                active_subject = None
                active_mod = None
                
                for line in lines:
                    line = line.strip()
                    if not line: continue

                    # 1. Update Semester context
                    sem_match = sem_pattern.search(line)
                    if sem_match:
                        current_sem = f"Semester {sem_match.group(1)}"
                        if current_sem not in branch_syllabus:
                            branch_syllabus[current_sem] = {}
                    
                    # 2. Detect Subject Header
                    code_match = code_pattern.search(line)
                    if code_match:
                        subj_code = code_match.group(1)
                        subj_title = line.replace(subj_code, "").replace("()", "").strip()
                        active_subject = f"{subj_title} ({subj_code})"
                        
                        # Ensure the semester key exists before adding subject
                        if current_sem not in branch_syllabus:
                            branch_syllabus[current_sem] = {}
                            
                        branch_syllabus[current_sem][active_subject] = {}
                        active_mod = None 
                        continue

                    # 3. Detect Module/Unit
                    mod_match = mod_pattern.search(line)
                    if mod_match and active_subject:
                        active_mod = f"module {mod_match.group(1)}"
                        if active_mod not in branch_syllabus[current_sem][active_subject]:
                            branch_syllabus[current_sem][active_subject][active_mod] = {"topics": ""}
                        continue

                    # 4. Content Accumulation
                    if active_subject and active_mod and len(line) > 4:
                        if not any(x in line.lower() for x in ["page", "course code", "marks", "credits"]):
                            existing = branch_syllabus[current_sem][active_subject][active_mod]["topics"]
                            branch_syllabus[current_sem][active_subject][active_mod]["topics"] = (existing + " " + line).strip()
    except Exception as e:
        print(f"   Critical Error parsing {os.path.basename(pdf_path)}: {e}")

    return branch_syllabus

def build_mega_syllabus():
    # Targets 'raw/syllabuses' relative to the script in 'data' folder
    source_dir = os.path.join("data","raw", "syllabuses")
    mega_data = {}
    
    if not os.path.exists(source_dir):
        print(f"Error: Folder not found at {os.path.abspath(source_dir)}")
        return None

    pdf_files = [f for f in os.listdir(source_dir) if f.lower().endswith(".pdf")]
    
    for filename in pdf_files:
        branch_key = filename.replace(".pdf", "").replace("-", " ").upper()
        file_path = os.path.join(source_dir, filename)
        
        print(f"Processing branch: {branch_key}...")
        mega_data[branch_key] = parse_tripura_univ_syllabus(file_path)
            
    return mega_data

if __name__ == "__main__":
    final_output = build_mega_syllabus()
    if final_output:
        output_file = "combined_tu_syllabus.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(final_output, f, indent=4)
        print(f"\nSuccessfully generated {output_file}")