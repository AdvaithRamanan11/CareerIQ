export const COLLEGES = {
  "Level 4 (Very High Tier)": [
    "Rice University",
    "The University of Texas at Austin",
    "Texas A&M University-College Station",
    "Southern Methodist University",
    "University of Texas at Dallas",
  ],
  "Level 3 (High Tier)": [
    "Texas Tech University",
    "University of Houston",
    "Baylor University",
    "Texas State University",
    "University of North Texas",
    "University of Texas at Arlington",
    "Texas Christian University",
    "University of Texas at San Antonio",
  ],
  "Level 2 (Mid Tier)": [
    "Sam Houston State University",
    "Texas Woman's University",
    "Tarleton State University",
    "Stephen F. Austin State University",
    "West Texas A&M University",
    "Midwestern State University",
    "Lamar University",
    "Prairie View A&M University",
    "Texas A&M University-Commerce",
  ],
  "Level 1 (Low Tier)": [
    "Texas A&M International University",
    "Sul Ross State University",
    "Texas A&M University-Kingsville",
    "University of Houston-Downtown",
    "Texas Southern University",
    "Angelo State University",
    "University of Texas Permian Basin",
    "University of Texas Rio Grande Valley",
    "Texas A&M University-Texarkana",
  ],
}

export const MAJORS = [
  "Engineering",
  "Computer Science",
  "Business",
  "Healthcare",
  "Law",
]

export const AREA_MULTIPLIERS = {
  Engineering:       { urban: 1.18, suburban: 1.06, rural: 0.88 },
  "Computer Science":{ urban: 1.25, suburban: 1.10, rural: 0.80 },
  Business:          { urban: 1.15, suburban: 1.05, rural: 0.92 },
  Healthcare:        { urban: 1.08, suburban: 1.03, rural: 0.98 },
  Law:               { urban: 1.20, suburban: 1.08, rural: 0.85 },
}

export const EXP_MULTIPLIERS = {
  Engineering:       { entry: 1.00, initial_experienced: 1.12, experienced: 1.28, veteran: 1.45 },
  "Computer Science":{ entry: 1.00, initial_experienced: 1.20, experienced: 1.45, veteran: 1.75 },
  Business:          { entry: 1.00, initial_experienced: 1.10, experienced: 1.30, veteran: 1.50 },
  Healthcare:        { entry: 1.00, initial_experienced: 1.05, experienced: 1.15, veteran: 1.28 },
  Law:               { entry: 1.00, initial_experienced: 1.12, experienced: 1.35, veteran: 1.40 },
}

export const JOB_INCOME = {
  "Level 4 (Very High Tier)": {
    Engineering:       { "Software Engineer": 90000, "Mechanical Engineer": 78000, "Electrical Engineer": 85000, "Civil Engineer": 70000, "Chemical Engineer": 82000 },
    "Computer Science":{ "Software Engineer": 95000, "Data Scientist": 100000, "Systems Architect": 105000, "Database Administrator": 82000, "Web Developer": 78000 },
    Business:          { "Investment Banker": 100000, "Management Consultant": 85000, "Financial Analyst": 68000, "Marketing Manager": 65000, "Business Analyst": 80000 },
    Healthcare:        { "Physician": 180000, "Surgeon": 275000, "Nurse Practitioner": 112000, "Medical Researcher": 82000, "Pharmacist": 122000 },
    Law:               { "Corporate Lawyer": 200000, "Public Defender": 68000, "Family Lawyer": 68000, "Patent Lawyer": 140000, "Litigation Lawyer": 90000 },
  },
  "Level 3 (High Tier)": {
    Engineering:       { "Software Engineer": 78000, "Mechanical Engineer": 68000, "Electrical Engineer": 74000, "Civil Engineer": 62000, "Chemical Engineer": 72000 },
    "Computer Science":{ "Software Engineer": 82000, "Data Scientist": 87000, "Systems Architect": 90000, "Database Administrator": 72000, "Web Developer": 67000 },
    Business:          { "Investment Banker": 85000, "Management Consultant": 72000, "Financial Analyst": 60000, "Marketing Manager": 57000, "Business Analyst": 68000 },
    Healthcare:        { "Physician": 175000, "Surgeon": 268000, "Nurse Practitioner": 108000, "Medical Researcher": 70000, "Pharmacist": 118000 },
    Law:               { "Corporate Lawyer": 155000, "Public Defender": 62000, "Family Lawyer": 62000, "Patent Lawyer": 120000, "Litigation Lawyer": 78000 },
  },
  "Level 2 (Mid Tier)": {
    Engineering:       { "Software Engineer": 68000, "Mechanical Engineer": 60000, "Electrical Engineer": 65000, "Civil Engineer": 56000, "Chemical Engineer": 64000 },
    "Computer Science":{ "Software Engineer": 70000, "Data Scientist": 74000, "Systems Architect": 78000, "Database Administrator": 63000, "Web Developer": 58000 },
    Business:          { "Investment Banker": 70000, "Management Consultant": 72000, "Financial Analyst": 55000, "Marketing Manager": 52000, "Business Analyst": 58000 },
    Healthcare:        { "Physician": 172000, "Surgeon": 262000, "Nurse Practitioner": 105000, "Medical Researcher": 64000, "Pharmacist": 114000 },
    Law:               { "Corporate Lawyer": 110000, "Public Defender": 57000, "Family Lawyer": 57000, "Patent Lawyer": 100000, "Litigation Lawyer": 68000 },
  },
  "Level 1 (Low Tier)": {
    Engineering:       { "Software Engineer": 58000, "Mechanical Engineer": 52000, "Electrical Engineer": 56000, "Civil Engineer": 50000, "Chemical Engineer": 56000 },
    "Computer Science":{ "Software Engineer": 60000, "Data Scientist": 63000, "Systems Architect": 67000, "Database Administrator": 55000, "Web Developer": 50000 },
    Business:          { "Investment Banker": 58000, "Management Consultant": 54000, "Financial Analyst": 50000, "Marketing Manager": 47000, "Business Analyst": 50000 },
    Healthcare:        { "Physician": 168000, "Surgeon": 255000, "Nurse Practitioner": 102000, "Medical Researcher": 58000, "Pharmacist": 110000 },
    Law:               { "Corporate Lawyer": 80000, "Public Defender": 52000, "Family Lawyer": 52000, "Patent Lawyer": 80000, "Litigation Lawyer": 58000 },
  },
}

export const STATE_MULTIPLIERS = [
  { name: "California",    abbr: "CA", mult: 1.32, note: "Silicon Valley + LA premium" },
  { name: "New York",      abbr: "NY", mult: 1.28, note: "NYC financial hub" },
  { name: "Washington",    abbr: "WA", mult: 1.22, note: "Seattle tech corridor" },
  { name: "Massachusetts", abbr: "MA", mult: 1.18, note: "Boston biotech + finance" },
  { name: "Colorado",      abbr: "CO", mult: 1.08, note: "Denver tech growth" },
  { name: "Texas",         abbr: "TX", mult: 1.00, note: "Base index (no state tax)" },
  { name: "Georgia",       abbr: "GA", mult: 0.97, note: "Atlanta metro growing" },
  { name: "Florida",       abbr: "FL", mult: 0.95, note: "No state income tax" },
  { name: "Arizona",       abbr: "AZ", mult: 0.93, note: "Phoenix tech emerging" },
  { name: "Ohio",          abbr: "OH", mult: 0.88, note: "Midwest cost advantage" },
  { name: "Tennessee",     abbr: "TN", mult: 0.87, note: "Nashville growth market" },
  { name: "Mississippi",   abbr: "MS", mult: 0.78, note: "Lower COL, lower wages" },
]

export const ROI_LOAN_DEFAULTS = {
  "Level 4 (Very High Tier)": { amount: 52000, hint: "Avg. 4-yr debt at private/flagship TX universities (THECB)" },
  "Level 3 (High Tier)":      { amount: 38000, hint: "Avg. 4-yr debt at large public TX universities (THECB)" },
  "Level 2 (Mid Tier)":       { amount: 26000, hint: "Avg. 4-yr debt at regional TX universities (THECB)" },
  "Level 1 (Low Tier)":       { amount: 18000, hint: "Avg. 4-yr debt at smaller TX public universities (THECB)" },
}

export const ROI_EXPENSE_DEFAULTS = {
  urban:    { amount: 2850, hint: "Est. monthly living cost in DFW / Houston / Austin (MIT Living Wage)" },
  suburban: { amount: 2100, hint: "Est. monthly living cost in TX suburban areas (MIT Living Wage)" },
  rural:    { amount: 1650, hint: "Est. monthly living cost in rural Texas (MIT Living Wage)" },
}

export const FEDERAL_LOAN_RATE = 6.53

export const THEMES = [
  { id: "dark",     label: "Dark",     swatch: "#0f1724" },
  { id: "light",    label: "Light",    swatch: "#ffffff" },
  { id: "midnight", label: "Midnight", swatch: "#000000" },
  { id: "slate",    label: "Slate",    swatch: "#222840" },
]
