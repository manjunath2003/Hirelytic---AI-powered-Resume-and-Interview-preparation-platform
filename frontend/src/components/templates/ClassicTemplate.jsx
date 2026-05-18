export default function ClassicTemplate({ data }) {
if (!data) return null;

// Build contact line:  ■ phone  |  ■ email  |  ■ linkedin
const contactParts = data.contact
? data.contact.split("  •  ").filter(Boolean)
: [];

return (
<div style={styles.page}>
    <div style={styles.resume}>

    {/* ── NAME ── */}
    <div style={styles.name}>{data.name}</div>

    {/* ── CONTACT ── */}
    <div style={styles.contact}>
        {contactParts.map((part, i) => (
        <span key={i}>
            {i > 0 && <span style={styles.pipe}> | </span>}
            <span style={styles.bullet}>■</span>
            {part.startsWith("http") ? (
            <a href={part} style={styles.link} target="_blank" rel="noreferrer">
                {part}
            </a>
            ) : (
            <span>{part}</span>
            )}
        </span>
        ))}
    </div>

    {/* ── CAREER OBJECTIVE ── */}
    {data.summary && (
        <>
        <div style={styles.sectionTitle}>Career Objective</div>
        <p style={styles.text}>{data.summary}</p>
        </>
    )}

    {/* ── EDUCATION ── */}
    {data.education?.length > 0 && (
        <>
        <div style={styles.sectionTitle}>Education</div>
        <ul style={styles.ul}>
            {data.education.map((edu, i) => (
            <li key={i} style={styles.li}>{edu}</li>
            ))}
        </ul>
        </>
    )}

    {/* ── TECHNICAL SKILLS ── */}
    {data.skills?.length > 0 && (
        <>
        <div style={styles.sectionTitle}>Technical Skills</div>
        <ul style={styles.ul}>
            {data.skills.map((skill, i) => (
            <li key={i} style={styles.li}>{skill}</li>
            ))}
        </ul>
        </>
    )}

    {/* ── TEACHING EXPERIENCE ── */}
    {data.experience?.length > 0 && (
        <>
        <div style={styles.sectionTitle}>Teaching Experience</div>
        {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
            <div style={styles.expRole}>{exp.role_institution}</div>
            <div style={styles.expDuration}>{exp.duration}</div>
            <ul style={styles.ul}>
                {exp.bullets?.map((b, j) => (
                <li key={j} style={styles.li}>{b}</li>
                ))}
            </ul>
            </div>
        ))}
        </>
    )}

    {/* ── PROJECTS ── */}
    {data.projects?.length > 0 && (
        <>
        <div style={styles.sectionTitle}>Projects</div>
        <ul style={styles.ul}>
            {data.projects.map((proj, i) => (
            <li key={i} style={styles.li}>
                <span style={styles.projTitle}>{proj.title}</span>
                {proj.description && (
                <span> &ndash; {proj.description}</span>
                )}
            </li>
            ))}
        </ul>
        </>
    )}

    {/* ── ACHIEVEMENTS & CERTIFICATIONS ── */}
    {data.certifications?.length > 0 && (
        <>
        <div style={styles.sectionTitle}>Achievements &amp; Certifications</div>
        <ul style={styles.ul}>
            {data.certifications.map((item, i) => (
            <li key={i} style={styles.li}>{item}</li>
            ))}
        </ul>
        </>
    )}

    {/* ── STRENGTHS ── */}
    {data.strengths?.length > 0 && (
        <>
        <div style={styles.sectionTitle}>Strengths</div>
        <ul style={styles.ul}>
            {data.strengths.map((s, i) => (
            <li key={i} style={styles.li}>{s}</li>
            ))}
        </ul>
        </>
    )}

    </div>
</div>
);
}

/* ─────────────── STYLES ─────────────── */
const styles = {
page: {
background: "#e5e5e5",
padding: "30px",
minHeight: "100vh",
},
resume: {
width: "750px",
margin: "auto",
background: "#fff",
padding: "55px 65px",
fontFamily: "'Times New Roman', Times, serif",
color: "#000",
fontSize: "11pt",
lineHeight: 1.45,
},

/* NAME */
name: {
textAlign: "center",
fontSize: "20px",
fontWeight: "bold",
letterSpacing: "2px",
textTransform: "uppercase",
marginBottom: "8px",
},

/* CONTACT */
contact: {
textAlign: "center",
fontSize: "12px",
color: "#111",
marginBottom: "18px",
lineHeight: 1.6,
},
bullet: {
fontSize: "9px",
marginRight: "3px",
verticalAlign: "middle",
},
pipe: {
color: "#555",
margin: "0 4px",
},
link: {
color: "#1155CC",
textDecoration: "underline",
},

/* SECTION TITLE */
sectionTitle: {
fontWeight: "bold",
fontSize: "14px",
marginTop: "16px",
marginBottom: "5px",
},

/* BODY TEXT */
text: {
fontSize: "12px",
lineHeight: 1.55,
color: "#111",
},

/* LISTS */
ul: {
margin: "4px 0 0 20px",
padding: 0,
listStyleType: "disc",
},
li: {
fontSize: "12px",
marginBottom: "4px",
lineHeight: 1.5,
},

/* EXPERIENCE */
expRole: {
fontWeight: "bold",
fontSize: "12px",
},
expDuration: {
fontSize: "11px",
color: "#444",
fontStyle: "italic",
marginBottom: "3px",
},

/* PROJECT TITLE */
projTitle: {
fontWeight: "bold",
},
};
