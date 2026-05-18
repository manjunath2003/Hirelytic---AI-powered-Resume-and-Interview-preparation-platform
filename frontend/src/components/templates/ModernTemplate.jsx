import React from "react";

export default function ModernTemplate({ data }) {
if (!data) return null;

const contactParts = data.contact ? data.contact.split("  •  ") : [];
const email    = contactParts[0]?.trim() || "";
const phone    = contactParts[1]?.trim() || "";
const location = contactParts[2]?.trim() || "";
const linkedin = contactParts[3]?.trim() || "";

// Tagline from summary
const summaryText = data.summary || "";
const taglineParts = summaryText.split(",").slice(0, 2).map(p => p.trim()).filter(Boolean);
const tagline = taglineParts.length
? taglineParts.join(" | ").toUpperCase()
: "PROFESSIONAL RESUME";

return (
<div style={styles.page}>
<div style={styles.container}>

{/* ── HEADER ── */}
<div style={styles.header}>
    <h1 style={styles.name}>
    <span style={styles.cursor}>|</span>{data.name}
    </h1>
    <p style={styles.tagline}>{tagline}</p>
</div>

{/* ── BODY ── */}
<div style={styles.body}>

    {/* ── LEFT SIDEBAR ── */}
    <div style={styles.sidebar}>

    {/* CONTACT */}
    <div style={styles.sideSection}>
        <div style={styles.sideTitle}>Contact</div>
        <div style={styles.sideDivider}></div>
        {email    && <div style={styles.sideItem}>{email}</div>}
        {phone    && <div style={styles.sideItem}>{phone}</div>}
        {location && <div style={styles.sideItem}>{location}</div>}
        {linkedin && <div style={styles.sideItem}>{linkedin}</div>}
    </div>

    {/* EDUCATION */}
    {data.education?.length > 0 && (
        <div style={styles.sideSection}>
        <div style={styles.sideTitle}>Education</div>
        <div style={styles.sideDivider}></div>
        {data.education.map((edu, i) => {
            const parts  = edu.split(" | ");
            const degree = parts[0] || edu;
            const inst   = parts[1] || "";
            const year   = parts[2] || "";
            return (
            <div key={i} style={styles.eduBlock}>
                <div style={styles.eduDegree}>{degree}</div>
                {inst && <div style={styles.eduInst}>{inst}</div>}
                {year && <div style={styles.eduYear}>{year}</div>}
            </div>
            );
        })}
        </div>
    )}

    {/* SKILLS */}
    {data.skills?.length > 0 && (
        <div style={styles.sideSection}>
        <div style={styles.sideTitle}>Skills</div>
        <div style={styles.sideDivider}></div>
        <ul style={styles.sideUl}>
            {data.skills.map((s, i) => (
            <li key={i} style={styles.sideLi}>{s}</li>
            ))}
        </ul>
        </div>
    )}

    {/* LANGUAGE */}
    {data.strengths?.length > 0 && (
        <div style={styles.sideSection}>
        <div style={styles.sideTitle}>Language</div>
        <div style={styles.sideDivider}></div>
        <ul style={styles.sideUl}>
            {data.strengths.map((s, i) => (
            <li key={i} style={styles.sideLi}>{s}</li>
            ))}
        </ul>
        </div>
    )}

    </div>

    {/* ── RIGHT CONTENT ── */}
    <div style={styles.content}>

    {/* OVERVIEW */}
    {data.summary && (
        <div style={styles.mainSection}>
        <div style={styles.mainTitle}>Overview</div>
        <div style={styles.mainDivider}></div>
        <p style={styles.overviewText}>{data.summary}</p>
        </div>
    )}

    {/* PROJECTS */}
    {data.projects?.length > 0 && (
        <div style={styles.mainSection}>
        <div style={styles.mainTitleCaps}>Projects</div>
        <div style={styles.mainDivider}></div>
        {data.projects.map((proj, i) => (
            <div key={i} style={styles.projBlock}>
            <div style={styles.projTitle}>{proj.title}</div>
            {proj.description && (
                <p style={styles.projDesc}>{proj.description}</p>
            )}
            </div>
        ))}
        </div>
    )}

    {/* WORK EXPERIENCE */}
    {data.experience?.length > 0 && (
        <div style={styles.mainSection}>
        <div style={styles.mainTitle}>Work Experience</div>
        <div style={styles.mainDivider}></div>
        {data.experience.map((exp, i) => (
            <div key={i} style={styles.expBlock}>
            <div style={styles.expHeader}>
                <span style={styles.expRole}>{exp.role_institution}</span>
                <span style={styles.expDate}>{exp.duration}</span>
            </div>
            {exp.bullets?.length > 0 && (
                <ul style={styles.expList}>
                {exp.bullets.map((b, j) => (
                    <li key={j} style={styles.expLi}>{b}</li>
                ))}
                </ul>
            )}
            </div>
        ))}
        </div>
    )}

    {/* CERTIFICATIONS */}
    {data.certifications?.length > 0 && (
        <div style={styles.mainSection}>
        <div style={styles.mainTitle}>Achievements &amp; Certifications</div>
        <div style={styles.mainDivider}></div>
        <ul style={styles.expList}>
            {data.certifications.map((c, i) => (
            <li key={i} style={styles.expLi}>{c}</li>
            ))}
        </ul>
        </div>
    )}

    </div>
</div>
</div>
</div>
);
}

/* ─────────────── STYLES ─────────────── */
const styles = {
page: {
background: "#f0f0f0",
padding: "30px 0",
display: "flex",
justifyContent: "center",
},
container: {
width: "780px",
background: "#fff",
boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
color: "#222",
},

/* HEADER */
header: {
padding: "35px 40px 20px 40px",
borderBottom: "1px solid #ddd",
},
name: {
fontSize: "30px",
fontWeight: "400",
margin: "0 0 6px 0",
color: "#111",
letterSpacing: "0.3px",
},
cursor: {
fontWeight: "200",
marginRight: "5px",
color: "#555",
},
tagline: {
fontSize: "9px",
letterSpacing: "3px",
color: "#888",
margin: 0,
textAlign: "center",
textTransform: "uppercase",
},

/* BODY */
body: {
display: "flex",
minHeight: "750px",
},

/* SIDEBAR */
sidebar: {
width: "33%",
padding: "28px 22px",
borderRight: "1px solid #ddd",
background: "#fff",
},
sideSection: {
marginBottom: "22px",
},
sideTitle: {
fontSize: "13px",
fontWeight: "bold",
color: "#111",
marginBottom: "6px",
},
sideDivider: {
height: "1px",
background: "#bbb",
marginBottom: "12px",
},
sideItem: {
fontSize: "11px",
color: "#333",
marginBottom: "9px",
lineHeight: "1.4",
wordBreak: "break-word",
},
eduBlock: {
marginBottom: "14px",
},
eduDegree: {
fontSize: "11px",
fontWeight: "bold",
color: "#111",
lineHeight: "1.3",
},
eduInst: {
fontSize: "10px",
color: "#333",
textTransform: "uppercase",
letterSpacing: "0.3px",
marginTop: "2px",
},
eduYear: {
fontSize: "9.5px",
color: "#555",
marginTop: "2px",
},
sideUl: {
paddingLeft: "18px",
margin: 0,
listStyleType: "disc",
},
sideLi: {
fontSize: "11px",
color: "#333",
marginBottom: "6px",
lineHeight: "1.4",
},

/* RIGHT CONTENT */
content: {
width: "67%",
padding: "28px 30px",
background: "#fff",
},
mainSection: {
marginBottom: "22px",
},
mainTitle: {
fontSize: "14px",
fontWeight: "bold",
color: "#111",
marginBottom: "6px",
},
mainTitleCaps: {
fontSize: "14px",
fontWeight: "bold",
color: "#111",
marginBottom: "6px",
textTransform: "uppercase",
letterSpacing: "1px",
},
mainDivider: {
height: "1px",
background: "#bbb",
marginBottom: "14px",
},
overviewText: {
fontSize: "10px",
lineHeight: "1.65",
color: "#333",
textAlign: "justify",
margin: 0,
},

/* EXPERIENCE */
expBlock: {
marginBottom: "15px",
},
expHeader: {
display: "flex",
justifyContent: "space-between",
alignItems: "baseline",
marginBottom: "5px",
},
expRole: {
fontSize: "12px",
fontWeight: "bold",
color: "#111",
flex: 1,
},
expDate: {
fontSize: "9.5px",
fontStyle: "italic",
color: "#777",
whiteSpace: "nowrap",
marginLeft: "10px",
},
expList: {
paddingLeft: "18px",
margin: 0,
listStyleType: "disc",
},
expLi: {
fontSize: "10.5px",
color: "#333",
marginBottom: "3px",
lineHeight: "1.45",
},

/* PROJECTS */
projBlock: {
marginBottom: "16px",
},
projTitle: {
fontSize: "12px",
fontWeight: "bold",
color: "#111",
marginBottom: "4px",
},
projDesc: {
fontSize: "10px",
lineHeight: "1.6",
color: "#333",
textAlign: "justify",
margin: 0,
},
};
