import { Mail, Phone, MapPin } from "lucide-react";

export default function MinimalTemplate({ data }) {
if (!data) return null;

// Assuming data.contact is passed as a string or we handle it gracefully
const contactParts = data.contact ? data.contact.split("  •  ") : [];
const email = contactParts[0] || "";
const phone = contactParts[1] || "";
const location = contactParts[2] || "";

return (
<div style={styles.page}>
<div style={styles.container}>

{/* HEADER */}
<div style={styles.header}>
    <h1 style={styles.name}>{data.name}</h1>
    <div style={styles.headerUnderline}></div>
    <p style={styles.tagline}>{data.summary}</p>
</div>

<div style={styles.main}>
    {/* SIDEBAR */}
    <div style={styles.sidebar}>
    {/* CONTACT */}
    <div style={styles.block}>
        <div style={styles.contactRow}>
        <Mail size={14} fill="currentColor" />
        <span style={styles.contactText}>{email}</span>
        </div>
        <div style={styles.contactRow}>
        <Phone size={14} fill="currentColor" />
        <span style={styles.contactText}>{phone}</span>
        </div>
        <div style={styles.contactRow}>
        <MapPin size={14} fill="currentColor" />
        <span style={styles.contactText}>{location}</span>
        </div>
    </div>

    {/* SKILLS */}
    <div style={styles.block}>
        <h3 style={styles.sideHeading}>SKILLS</h3>
        <div style={styles.sideDivider}></div>
        <div style={styles.skillWrap}>
        {data.skills?.map((s, i) => (
            <span key={i} style={styles.skillPill}>{s}</span>
        ))}
        </div>
    </div>

    {/* LANGUAGES */}
    <div style={styles.block}>
        <h3 style={styles.sideHeading}>LANGUAGES</h3>
        <div style={styles.sideDivider}></div>
        {data.strengths?.map((lang, i) => (
        <div key={i} style={styles.langBlock}>
            <p style={styles.langName}>{lang}</p>
            <p style={styles.langSub}>Full Professional Proficiency</p>
        </div>
        ))}
    </div>

    {/* INTERESTS */}
    <div style={styles.block}>
        <h3 style={styles.sideHeading}>INTERESTS</h3>
        <div style={styles.sideDivider}></div>
        <div style={styles.interestWrap}>
        {data.interests?.map((item, idx) => (
            <span key={idx} style={styles.interestBox}>{item}</span>
        )) || ["Badminton", "Travelling", "Photography", "Automobile journalism"].map((item, idx) => (
            <span key={idx} style={styles.interestBox}>{item}</span>
        ))}
        </div>
    </div>
    </div>

    {/* CONTENT */}
    <div style={styles.content}>
    
    {/* EDUCATION */}
    <div style={styles.section}>
        <h3 style={styles.sectionTitle}>EDUCATION</h3>
        <div style={styles.sectionLine}></div>
        {data.education?.map((edu, i) => {
        const parts = edu.split('|'); // Assuming input format "Degree | Institution | Date | Loc"
        return (
            <div key={i} style={{ marginBottom: '12px' }}>
            <div style={styles.rowBetween}>
                <span style={styles.mainBold}>{parts[0] || edu}</span>
            </div>
            <div style={styles.rowBetween}>
                <span style={styles.subBold}>{parts[1] || ""}</span>
            </div>
            <div style={styles.rowBetween}>
                <span style={styles.italicDate}>{parts[2] || ""}</span>
                <span style={styles.italicDate}>{parts[3] || ""}</span>
            </div>
            </div>
        );
        })}
    </div>

    {/* EXPERIENCE */}
    <div style={styles.section}>
        <h3 style={styles.sectionTitle}>WORK EXPERIENCE</h3>
        <div style={styles.sectionLine}></div>
        {data.experience?.map((exp, i) => (
        <div key={i} style={styles.expBlock}>
            <div style={styles.rowBetween}>
            <span style={styles.mainBold}>{exp.role_institution.split(' at ')[0]}</span>
            </div>
            <div style={styles.rowBetween}>
            <span style={styles.subBold}>{exp.role_institution.split(' at ')[1]}</span>
            </div>
            <div style={styles.rowBetween}>
            <span style={styles.italicDate}>{exp.duration}</span>
            <span style={styles.italicDate}>{exp.location || "Remote"}</span>
            </div>
            <p style={styles.expMeta}>Brand Identity, Website design, Packaging and Marketing Communications Design, Digital Marketing</p>
            <p style={styles.tasksHeader}>Tasks</p>
            <ul style={styles.ul}>
            {exp.bullets?.map((b, j) => (
                <li key={j} style={styles.li}>{b}</li>
            ))}
            </ul>
        </div>
        ))}
    </div>

    {/* PROJECTS */}
    <div style={styles.section}>
        <h3 style={styles.sectionTitle}>PROJECTS</h3>
        <div style={styles.sectionLine}></div>
        {data.certifications?.map((proj, i) => (
        <div key={i} style={{ marginBottom: '15px' }}>
            {/* Logic to parse project name and bullets if stored in certifications field */}
            <p style={styles.projectTitle}>{typeof proj === 'string' ? proj.split(':')[0] : proj.title}</p>
            <ul style={styles.ul}>
                <li style={styles.li}><span style={{fontWeight: 'bold'}}>Tech Stack:</span> {proj.tech || "Python, Flask, HTML, CSS"}</li>
                <li style={styles.li}>Developed and implemented features...</li>
            </ul>
        </div>
        ))}
    </div>

    </div>
</div>
</div>
</div>
);
}

const styles = {
page: {
background: "#f0f0f0",
padding: "40px 0",
display: "flex",
justifyContent: "center",
},
container: {
width: "800px",
background: "#fff",
fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
color: "#333",
boxShadow: "0 0 10px rgba(0,0,0,0.1)",
},
header: {
background: "#323b4c",
color: "#fff",
padding: "30px 40px",
},
name: {
fontSize: "36px",
fontWeight: "500",
margin: 0,
letterSpacing: "1px",
},
headerUnderline: {
width: "120px",
height: "2px",
background: "#fff",
margin: "8px 0 15px 0",
},
tagline: {
fontSize: "13px",
lineHeight: "1.4",
fontWeight: "bold",
maxWidth: "600px",
margin: 0,
},
main: {
display: "flex",
minHeight: "900px",
},
sidebar: {
width: "28%",
padding: "30px 20px",
borderRight: "1px solid #eee",
},
content: {
width: "72%",
padding: "30px 30px",
},
block: {
marginBottom: "30px",
},
contactRow: {
display: "flex",
alignItems: "center",
gap: "10px",
marginBottom: "12px",
color: "#323b4c",
},
contactText: {
fontSize: "12px",
wordBreak: "break-all",
},
sideHeading: {
fontSize: "18px",
fontWeight: "bold",
color: "#323b4c",
margin: "0 0 5px 0",
},
sideDivider: {
height: "1.5px",
background: "#323b4c",
marginBottom: "15px",
},
skillWrap: {
display: "flex",
flexWrap: "wrap",
gap: "8px",
},
skillPill: {
background: "#a9b0b9",
color: "#fff",
padding: "4px 10px",
fontSize: "11px",
borderRadius: "4px",
fontWeight: "500",
},
interestBox: {
border: "1px solid #a9b0b9",
padding: "4px 10px",
fontSize: "12px",
borderRadius: "4px",
marginBottom: "8px",
display: "inline-block",
marginRight: "5px",
},
langBlock: {
marginBottom: "12px",
},
langName: {
fontSize: "13px",
fontWeight: "bold",
margin: 0,
},
langSub: {
fontSize: "11px",
color: "#666",
fontStyle: "italic",
margin: 0,
},
section: {
marginBottom: "25px",
},
sectionTitle: {
fontSize: "18px",
fontWeight: "bold",
color: "#323b4c",
margin: 0,
},
sectionLine: {
height: "1.5px",
background: "#323b4c",
margin: "4px 0 15px 0",
},
rowBetween: {
display: "flex",
justifyContent: "space-between",
alignItems: "baseline",
},
mainBold: {
fontSize: "16px",
fontWeight: "bold",
color: "#323b4c",
},
subBold: {
fontSize: "14px",
fontWeight: "bold",
color: "#444",
},
italicDate: {
fontSize: "11px",
fontStyle: "italic",
color: "#666",
},
expMeta: {
fontSize: "11px",
fontStyle: "italic",
color: "#888",
margin: "5px 0",
},
tasksHeader: {
fontSize: "12px",
fontWeight: "bold",
margin: "5px 0",
textDecoration: "underline",
},
ul: {
paddingLeft: "15px",
marginTop: "5px",
listStyleType: "square",
},
li: {
fontSize: "12px",
marginBottom: "4px",
lineHeight: "1.4",
},
projectTitle: {
fontSize: "14px",
fontWeight: "500",
margin: "0 0 5px 0",
}
};
