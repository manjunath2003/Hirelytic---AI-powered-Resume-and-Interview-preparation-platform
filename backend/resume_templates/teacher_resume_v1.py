# backend/resume_templates/teacher_resume_v1.py
# ATS-safe teacher resume content template (v1)

ROLE_TITLE = "High School English Teacher"

SUMMARY_TEMPLATE = (
    "Dedicated and results-driven High School English Teacher with {years}+ years "
    "of experience delivering curriculum aligned with {boards} standards for "
    "Grades {grades}. Proven ability to improve student academic performance through "
    "structured lesson planning, exam-oriented teaching, and continuous assessment. "
    "Skilled in classroom management, student mentoring, and effective communication "
    "with parents and academic staff."
)

CORE_SKILLS = [
    "Curriculum Planning",
    "Classroom Management",
    "Lesson Design",
    "Student Assessment",
    "Board Exam Preparation",
    "Educational Technology",
    "Student Counseling",
    "Parent Communication",
    "Academic Documentation"
]

DEFAULT_EXPERIENCE = [
    {
        "role": "English Teacher",
        "bullets": [
            "Delivered English curriculum for secondary-level students in alignment with board guidelines",
            "Prepared structured lesson plans and teaching materials to meet learning objectives",
            "Conducted regular assessments, evaluations, and remedial classes",
            "Improved student performance through focused exam preparation strategies",
            "Maintained academic records and communicated progress with parents"
        ]
    },
    {
        "role": "Assistant English Teacher",
        "bullets": [
            "Assisted in classroom instruction and lesson delivery for secondary-level students",
            "Supported student assessments, grading, and academic documentation",
            "Participated in curriculum planning and academic meetings",
            "Assisted in classroom management and student mentoring"
        ]
    }
]

DEFAULT_EDUCATION = [
    "Bachelor of Arts (English)",
    "Bachelor of Education (B.Ed.)"
]

DEFAULT_CERTIFICATIONS = [
    "CTET Qualified",
    "State Teacher Eligibility Test (TET)",
    "Teaching Methodology Training"
]

DEFAULT_ADDITIONAL_INFO = [
    "Familiar with CBSE, ICSE, and State Board academic frameworks",
    "Strong communication and interpersonal skills",
    "Willing to participate in academic development activities"
]
