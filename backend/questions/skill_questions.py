# 25 Questions grouped into weighted categories

questions = [
    # ------------------ Communication (4) ------------------
    {
        "id": "q1",
        "question": "A student is struggling to understand your explanation. What is the BEST response?",
        "options": {"a": "Repeat loudly", "b": "Try a different example", "c": "Ignore and continue", "d": "Ask another student to explain"},
        "correct": "b",
        "category": "communication"
    },
    {
        "id": "q2",
        "question": "During a class discussion, what is an effective teaching behavior?",
        "options": {"a": "Interrupt students", "b": "Allow constructive debate", "c": "Speak continuously", "d": "Discourage questions"},
        "correct": "b",
        "category": "communication"
    },
    {
        "id": "q3",
        "question": "A student gives a wrong answer. What should you do?",
        "options": {"a": "Scold the student", "b": "Guide them to the right answer", "c": "Ignore the mistake", "d": "Ask them to sit down"},
        "correct": "b",
        "category": "communication"
    },
    {
        "id": "q4",
        "question": "Teachers should speak at a speed that is:",
        "options": {"a": "Very fast", "b": "Very slow", "c": "Clear & moderate", "d": "Random"},
        "correct": "c",
        "category": "communication"
    },

    # ------------------ Subject Knowledge (4) ------------------
    {
        "id": "q5",
        "question": "A good teacher must:",
        "options": {"a": "Know only syllabus", "b": "Have deep subject knowledge", "c": "Avoid answering doubts", "d": "Depend fully on textbooks"},
        "correct": "b",
        "category": "subject_knowledge"
    },
    {
        "id": "q6",
        "question": "You find a topic you don’t fully know. What do you do?",
        "options": {"a": "Skip it", "b": "Study & return prepared", "c": "Give random information", "d": "Ask students to learn themselves"},
        "correct": "b",
        "category": "subject_knowledge"
    },
    {
        "id": "q7",
        "question": "Which is MOST essential?",
        "options": {"a": "Memorizing answers", "b": "Conceptual understanding", "c": "Reading quickly", "d": "Copying notes"},
        "correct": "b",
        "category": "subject_knowledge"
    },
    {
        "id": "q8",
        "question": "A student asks a very advanced question. What should you do?",
        "options": {"a": "Ignore", "b": "Provide a simple explanation", "c": "Punish them", "d": "Tell them not to ask extra questions"},
        "correct": "b",
        "category": "subject_knowledge"
    },

    # ------------------ Classroom Management (4) ------------------
    {
        "id": "q9",
        "question": "Best way to manage a noisy class?",
        "options": {"a": "Shout", "b": "Punish all", "c": "Use attention signals", "d": "Walk out"},
        "correct": "c",
        "category": "classroom_management"
    },
    {
        "id": "q10",
        "question": "How to handle distracting students?",
        "options": {"a": "Speak privately to them", "b": "Insult publicly", "c": "Remove from class", "d": "Ignore"},
        "correct": "a",
        "category": "classroom_management"
    },
    {
        "id": "q11",
        "question": "Best seating plan?",
        "options": {"a": "Random", "b": "By height", "c": "According to learning needs", "d": "Teacher decides without thinking"},
        "correct": "c",
        "category": "classroom_management"
    },
    {
        "id": "q12",
        "question": "If multiple students misbehave:",
        "options": {"a": "Punish entire class", "b": "Identify root cause", "c": "Ignore", "d": "Send all to principal"},
        "correct": "b",
        "category": "classroom_management"
    },

    # ------------------ Pedagogy & Teaching Methods (4) ------------------
    {
        "id": "q13",
        "question": "Best teaching approach?",
        "options": {"a": "One-way lecture", "b": "Interactive learning", "c": "Memorization", "d": "Only homework"},
        "correct": "b",
        "category": "pedagogy"
    },
    {
        "id": "q14",
        "question": "Good lesson planning includes:",
        "options": {"a": "Random teaching", "b": "Clear objectives", "c": "No examples", "d": "No activities"},
        "correct": "b",
        "category": "pedagogy"
    },
    {
        "id": "q15",
        "question": "To help slow learners:",
        "options": {"a": "Ignore them", "b": "Provide additional support", "c": "Give punishment", "d": "Ask to study alone"},
        "correct": "b",
        "category": "pedagogy"
    },
    {
        "id": "q16",
        "question": "Most effective evaluation method:",
        "options": {"a": "Just one final exam", "b": "Only assignments", "c": "Continuous assessment", "d": "No assessment"},
        "correct": "c",
        "category": "pedagogy"
    },

    # ------------------ Digital Literacy (4) ------------------
    {
        "id": "q17",
        "question": "A modern teacher should:",
        "options": {"a": "Avoid technology", "b": "Use only chalkboard", "c": "Use digital tools where needed", "d": "Depend fully on AI"},
        "correct": "c",
        "category": "digital_literacy"
    },
    {
        "id": "q18",
        "question": "Best use of digital tools:",
        "options": {"a": "Replace teacher", "b": "Avoid completely", "c": "Enhance teaching", "d": "Distract students"},
        "correct": "c",
        "category": "digital_literacy"
    },
    {
        "id": "q19",
        "question": "Using PPT in class:",
        "options": {"a": "Should never be used", "b": "Useful when mixed with explanation", "c": "Use only PPT", "d": "Replace textbooks"},
        "correct": "b",
        "category": "digital_literacy"
    },
    {
        "id": "q20",
        "question": "Online tools can:",
        "options": {"a": "Harm learning", "b": "Enhance engagement", "c": "Confuse students", "d": "Replace practice"},
        "correct": "b",
        "category": "digital_literacy"
    },

    # ------------------ Student Psychology (5) ------------------
    {
        "id": "q21",
        "question": "A shy student should be:",
        "options": {"a": "Ignored", "b": "Encouraged gently", "c": "Forced to speak", "d": "Punished"},
        "correct": "b",
        "category": "psychology"
    },
    {
        "id": "q22",
        "question": "Motivation improves when:",
        "options": {"a": "Students are insulted", "b": "Praise is used correctly", "c": "Homework is doubled", "d": "Marks reduced"},
        "correct": "b",
        "category": "psychology"
    },
    {
        "id": "q23",
        "question": "A stressed student should:",
        "options": {"a": "Be shouted at", "b": "Receive emotional support", "c": "Be ignored", "d": "Get more homework"},
        "correct": "b",
        "category": "psychology"
    },
    {
        "id": "q24",
        "question": "Students learn better when:",
        "options": {"a": "They sit silently", "b": "They are afraid", "c": "They feel safe", "d": "Teacher dominates"},
        "correct": "c",
        "category": "psychology"
    },
    {
        "id": "q25",
        "question": "Best approach for diverse students:",
        "options": {"a": "One method for all", "b": "Differentiate teaching", "c": "Ignore differences", "d": "Punish weak students"},
        "correct": "b",
        "category": "psychology"
    }
]
