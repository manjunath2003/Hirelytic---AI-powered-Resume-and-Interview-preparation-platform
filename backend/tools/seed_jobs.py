from backend.extensions import mongo
from datetime import datetime

JOBS_DATA = [
    {
        "title": "Primary School Math Teacher",
        "institution": "Green Valley Public School",
        "category": "Primary (Grades 1–5)",
        "subject": "Mathematics",
        "location": "Bangalore",
        "salary": "25000",
        "experience_required": 1,
        "description": "Teach basic math concepts, conduct practice sessions, handle class assessments."
    },
    {
        "title": "Primary School English Teacher",
        "institution": "St. Joseph English Medium School",
        "category": "Primary (Grades 1–5)",
        "subject": "English",
        "location": "Mysore",
        "salary": "26000",
        "experience_required": 2,
        "description": "Teach grammar, reading and comprehension. Prepare lesson plans and evaluate assignments."
    },
    {
        "title": "Primary EVS Teacher",
        "institution": "Little Flower School",
        "category": "Primary (Grades 1–5)",
        "subject": "Environmental Studies",
        "location": "Hubli",
        "salary": "24000",
        "experience_required": 1,
        "description": "Teach foundational EVS concepts with activities and visual learning aids."
    },
    {
        "title": "Middle School Science Teacher",
        "institution": "City Central School",
        "category": "Middle School (Grades 6–8)",
        "subject": "Science",
        "location": "Mangalore",
        "salary": "32000",
        "experience_required": 3,
        "description": "Teach physics, chemistry, biology fundamentals with lab-based activities."
    },
    {
        "title": "Middle School Mathematics Teacher",
        "institution": "Vidya Mandir School",
        "category": "Middle School (Grades 6–8)",
        "subject": "Mathematics",
        "location": "Dharwad",
        "salary": "30000",
        "experience_required": 2,
        "description": "Explain algebra, geometry, and number systems. Conduct quizzes and tests."
    },
    {
        "title": "Middle School Social Science Teacher",
        "institution": "National Public School",
        "category": "Middle School (Grades 6–8)",
        "subject": "Social Science",
        "location": "Udupi",
        "salary": "28000",
        "experience_required": 2,
        "description": "Teach history, civics, and geography. Prepare projects and presentations."
    },
    {
        "title": "Middle School Hindi Teacher",
        "institution": "Government Model School",
        "category": "Middle School (Grades 6–8)",
        "subject": "Hindi",
        "location": "Hassan",
        "salary": "27000",
        "experience_required": 1,
        "description": "Teach Hindi grammar and literature. Conduct dictation sessions and tests."
    },
    {
        "title": "High School Physics Teacher (CBSE)",
        "institution": "Kendriya Vidyalaya",
        "category": "High School Teacher (9–12) – CBSE Board",
        "subject": "Physics",
        "location": "Bangalore",
        "salary": "45000",
        "experience_required": 4,
        "description": "Teach physics for grades 9–12; prepare students for CBSE board exams."
    },
    {
        "title": "High School Chemistry Teacher (CBSE)",
        "institution": "Delhi Public School",
        "category": "High School Teacher (9–12) – CBSE Board",
        "subject": "Chemistry",
        "location": "Mysore",
        "salary": "44000",
        "experience_required": 3,
        "description": "Conduct chemistry theory and lab classes. Prepare practical exam materials."
    },
    {
        "title": "High School Biology Teacher (State Board)",
        "institution": "Vivekananda PU & High School",
        "category": "High School Teacher (9–12) – State Board",
        "subject": "Biology",
        "location": "Tumkur",
        "salary": "42000",
        "experience_required": 3,
        "description": "Teach zoology and botany topics. Organize practical experiments."
    },
    {
        "title": "High School English Teacher (ICSE)",
        "institution": "Christ King ICSE School",
        "category": "High School Teacher (9–12) – ICSE Board",
        "subject": "English",
        "location": "Udupi",
        "salary": "43000",
        "experience_required": 4,
        "description": "Teach ICSE literature and language. Conduct essay writing and comprehension sessions."
    },
    {
        "title": "High School Mathematics Teacher (ICSE)",
        "institution": "St. Mary's ICSE School",
        "category": "High School Teacher (9–12) – ICSE Board",
        "subject": "Mathematics",
        "location": "Bangalore",
        "salary": "46000",
        "experience_required": 5,
        "description": "Teach algebra, calculus, and geometry for ICSE curriculum."
    },
    {
        "title": "High School Computer Science Teacher",
        "institution": "New Horizon Public School",
        "category": "High School Teacher (9–12) – CBSE Board",
        "subject": "Computer Science",
        "location": "Mangalore",
        "salary": "48000",
        "experience_required": 4,
        "description": "Teach Python, Java, algorithms, and computer networks for grades 9–12."
    },
    {
        "title": "High School Kannada Teacher",
        "institution": "Shree Basaveshwara High School",
        "category": "High School Teacher (9–12) – State Board",
        "subject": "Kannada",
        "location": "Davangere",
        "salary": "35000",
        "experience_required": 3,
        "description": "Teach Kannada grammar, poetry, drama, and comprehension."
    },
    {
        "title": "High School Commerce Teacher",
        "institution": "Siddaganga High School",
        "category": "High School Teacher (9–12) – State Board",
        "subject": "Commerce",
        "location": "Belgaum",
        "salary": "38000",
        "experience_required": 2,
        "description": "Teach business studies, economics, and accountancy for classes 11–12."
    },
    {
        "title": "PUC Physics Lecturer (PCMB)",
        "institution": "MES PU College",
        "category": "Higher Secondary / PUC (PCMB)",
        "subject": "Physics",
        "location": "Bangalore",
        "salary": "50000",
        "experience_required": 5,
        "description": "Teach physics with focus on competitive exam preparation (NEET/JEE)."
    },
    {
        "title": "PUC Chemistry Lecturer (PCMB)",
        "institution": "Seshadripuram PU College",
        "category": "Higher Secondary / PUC (PCMB)",
        "subject": "Chemistry",
        "location": "Tumkur",
        "salary": "52000",
        "experience_required": 4,
        "description": "Teach organic, inorganic, and physical chemistry for PCMB students."
    },
    {
        "title": "PUC Biology Lecturer (PCMB)",
        "institution": "Expert PU College",
        "category": "Higher Secondary / PUC (PCMB)",
        "subject": "Biology",
        "location": "Mangalore",
        "salary": "51000",
        "experience_required": 4,
        "description": "Teach botany and zoology with NEET-focused preparation."
    },
    {
        "title": "PUC Math Lecturer (PCMCs)",
        "institution": "KLE Independent PU College",
        "category": "Higher Secondary / PUC (PCMCs)",
        "subject": "Mathematics",
        "location": "Hubli",
        "salary": "53000",
        "experience_required": 4,
        "description": "Teach calculus, algebra, vectors, and statistics."
    },
    {
        "title": "PUC Computer Science Lecturer",
        "institution": "St. Aloysius PU College",
        "category": "Higher Secondary / PUC (PCMCs)",
        "subject": "Computer Science",
        "location": "Bangalore",
        "salary": "56000",
        "experience_required": 5,
        "description": "Teach Python, C++, DBMS, and problem-solving for PUC students."
    },
    {
        "title": "PUC Economics Lecturer",
        "institution": "Govt PU College Hassan",
        "category": "Higher Secondary / PUC (Commerce)",
        "subject": "Economics",
        "location": "Hassan",
        "salary": "47000",
        "experience_required": 3,
        "description": "Teach micro and macroeconomics to commerce students."
    },
    {
        "title": "PUC Accountancy Lecturer",
        "institution": "Milagres PU College",
        "category": "Higher Secondary / PUC (Commerce)",
        "subject": "Accountancy",
        "location": "Udupi",
        "salary": "48000",
        "experience_required": 4,
        "description": "Teach partnership accounts, financial statements and GST basics."
    },
    {
        "title": "PUC Business Studies Lecturer",
        "institution": "Marimallappa PU College",
        "category": "Higher Secondary / PUC (Commerce)",
        "subject": "Business Studies",
        "location": "Mysore",
        "salary": "46000",
        "experience_required": 3,
        "description": "Teach management principles, business environment and planning."
    },
    {
        "title": "High School Geography Teacher",
        "institution": "Baldwin High School",
        "category": "High School Teacher (9–12) – State Board",
        "subject": "Geography",
        "location": "Bangalore",
        "salary": "39000",
        "experience_required": 2,
        "description": "Teach world and Indian geography, maps, climate, and landforms."
    },
    {
        "title": "Middle School Computer Teacher",
        "institution": "Canara High School",
        "category": "Middle School (Grades 6–8)",
        "subject": "Computer Basics",
        "location": "Mangalore",
        "salary": "30000",
        "experience_required": 1,
        "description": "Teach MS Office, basic coding, and internet safety."
    },
    {
        "title": "Primary General Teacher",
        "institution": "Sacred Heart School",
        "category": "Primary (Grades 1–5)",
        "subject": "General",
        "location": "Hassan",
        "salary": "23000",
        "experience_required": 1,
        "description": "Teach all core subjects and manage classroom activities."
    },
    {
        "title": "High School Hindi Teacher",
        "institution": "Jnana Bharathi High School",
        "category": "High School Teacher (9–12) – State Board",
        "subject": "Hindi",
        "location": "Hubli",
        "salary": "36000",
        "experience_required": 2,
        "description": "Teach Hindi grammar, prose and poetry for classes 9–12."
    },
    {
        "title": "High School Moral Science Teacher",
        "institution": "St. Theresa ICSE School",
        "category": "High School Teacher (9–12) – ICSE Board",
        "subject": "Moral Science",
        "location": "Mangalore",
        "salary": "35000",
        "experience_required": 1,
        "description": "Teach value education, personality development and ethics."
    },
    {
        "title": "Middle School Art Teacher",
        "institution": "Udupi Central School",
        "category": "Middle School (Grades 6–8)",
        "subject": "Art",
        "location": "Udupi",
        "salary": "25000",
        "experience_required": 1,
        "description": "Teach drawing, painting and creative artwork."
    },
    {
        "title": "Primary Physical Education Teacher",
        "institution": "Orchid Public School",
        "category": "Primary (Grades 1–5)",
        "subject": "Physical Education",
        "location": "Bangalore",
        "salary": "28000",
        "experience_required": 1,
        "description": "Conduct sports activities, fitness training and outdoor games."
    }
]

def seed_jobs():
    db = mongo.db
    print("Deleting old job records...")
    db.jobs.delete_many({})

    print("Inserting 30 unique job records...")
    for job in JOBS_DATA:
        db.jobs.insert_one(job)

    print("✔ Successfully inserted 30 unique jobs!")

if __name__ == "__main__":
    from backend import create_app
    app = create_app()

    with app.app_context():
        seed_jobs()
