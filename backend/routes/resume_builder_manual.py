from flask import Blueprint, request, jsonify, send_file
from backend.extensions import mongo
from datetime import datetime
from bson import ObjectId
import uuid
import os

from backend.utils.pdf_generator import generate_pdf_from_html
from backend.utils.docx_generator import generate_docx


# ================================================================
# CLASSIC TEMPLATE
# Formal, traditional, single-column layout – best for schools
# ================================================================

def generate_classic_html(content):

    # ---------- CONTACT LINE ----------
    # Renders as:  ■ phone | ■ email | ■ linkedin | ■ github
    contact_raw = content.get("contact", "")
    contact_parts = [p.strip() for p in contact_raw.split("  •  ") if p.strip()]
    contact_items = "  |  ".join(
        f'<span style="margin-right:3px;">&#9632;</span>{p}' for p in contact_parts
    )

    # ---------- EDUCATION ----------
    education_items = ""
    for e in content.get("education", []):
        education_items += f"<li>{e}</li>"

    # ---------- SKILLS ----------
    # In the screenshot, skills are grouped as:  Bold label: value
    # Since we store plain strings, render each as a bullet
    skills_items = ""
    for s in content.get("skills", []):
        skills_items += f"<li>{s}</li>"

    # ---------- EXPERIENCE ----------
    experience_html = ""
    for exp in content.get("experience", []):
        bullets = "".join(f"<li>{b}</li>" for b in exp.get("bullets", []))
        experience_html += f"""
        <div style="margin-bottom:10px;">
            <div style="font-weight:bold; font-size:12pt;">{exp.get('role_institution','')}</div>
            <div style="font-size:10pt; color:#444; font-style:italic; margin-bottom:3px;">{exp.get('duration','')}</div>
            <ul style="margin:4px 0 0 18px; padding:0;">{bullets}</ul>
        </div>
        """

    # ---------- PROJECTS ----------
    # Screenshot style: • ProjectName – description on same line
    projects_html = ""
    for p in content.get("projects", []):
        title = p.get("title", "")
        desc  = p.get("description", "")
        if title and desc:
            projects_html += f"""<li><span style="font-weight:bold;">{title}</span> &ndash; {desc}</li>"""
        elif title:
            projects_html += f"""<li><span style="font-weight:bold;">{title}</span></li>"""

    # ---------- CERTIFICATIONS ----------
    certs_html = ""
    for c in content.get("certifications", []):
        certs_html += f"<li>{c}</li>"

    # ---------- STRENGTHS ----------
    strengths_html = ""
    for s in content.get("strengths", []):
        strengths_html += f"<li>{s}</li>"

    # ---------- SECTION BUILDER ----------
    # Only render a section if it has content
    def section(title, body_html):
        if not body_html.strip():
            return ""
        return f"""
        <div style="margin-top:16px;">
            <div style="font-weight:bold; font-size:13pt; margin-bottom:5px;">{title}</div>
            {body_html}
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: A4;
                margin: 0;
            }}
            * {{
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }}
            body {{
                font-family: 'Times New Roman', Times, serif;
                color: #000;
                background: #fff;
                padding: 55px 65px 55px 65px;
                font-size: 11pt;
                line-height: 1.45;
            }}

            /* NAME */
            .resume-name {{
                text-align: center;
                font-size: 18pt;
                font-weight: bold;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-bottom: 8px;
            }}

            /* CONTACT */
            .resume-contact {{
                text-align: center;
                font-size: 9.5pt;
                color: #111;
                margin-bottom: 18px;
                line-height: 1.6;
            }}
            .resume-contact a {{
                color: #1155CC;
                text-decoration: underline;
            }}

            /* SECTION TITLE */
            .section-title {{
                font-weight: bold;
                font-size: 12.5pt;
                margin-top: 16px;
                margin-bottom: 5px;
            }}

            /* SUMMARY TEXT */
            .summary-text {{
                font-size: 10.5pt;
                line-height: 1.55;
                color: #111;
            }}

            /* BULLET LIST */
            ul {{
                margin: 4px 0 0 20px;
                padding: 0;
                list-style-type: disc;
            }}
            li {{
                font-size: 10.5pt;
                margin-bottom: 4px;
                line-height: 1.5;
            }}
        </style>
    </head>
    <body>

        <!-- NAME -->
        <div class="resume-name">{content['name']}</div>

        <!-- CONTACT -->
        <div class="resume-contact">{contact_items}</div>

        <!-- CAREER OBJECTIVE -->
        {section("Career Objective",
            f'<p class="summary-text">{content.get("summary","")}</p>'
        )}

        <!-- EDUCATION -->
        {section("Education",
            f'<ul>{education_items}</ul>'
        )}

        <!-- TECHNICAL SKILLS -->
        {section("Technical Skills",
            f'<ul>{skills_items}</ul>'
        )}

        <!-- EXPERIENCE -->
        {section("Teaching Experience", experience_html) if content.get("experience") else ""}

        <!-- PROJECTS -->
        {section("Projects",
            f'<ul>{projects_html}</ul>'
        ) if projects_html else ""}

        <!-- ACHIEVEMENTS & CERTIFICATIONS -->
        {section("Achievements &amp; Certifications",
            f'<ul>{certs_html}</ul>'
        ) if certs_html else ""}

        <!-- STRENGTHS -->
        {section("Strengths",
            f'<ul>{strengths_html}</ul>'
        ) if strengths_html else ""}

    </body>
    </html>
    """


# ================================================================
# MODERN TEMPLATE
# Two-column layout – dark sidebar, clean main content
# Best for private institutions
# ================================================================
def generate_modern_html(content):
    contact_parts = content.get("contact", "").split("  •  ")
    email    = contact_parts[0].strip() if len(contact_parts) > 0 else ""
    phone    = contact_parts[1].strip() if len(contact_parts) > 1 else ""
    location = contact_parts[2].strip() if len(contact_parts) > 2 else ""
    linkedin = contact_parts[3].strip() if len(contact_parts) > 3 else ""

    # ---------- CONTACT ----------
    contact_html = ""
    if email:
        contact_html += f'<div class="side-item">{email}</div>'
    if phone:
        contact_html += f'<div class="side-item">{phone}</div>'
    if location:
        contact_html += f'<div class="side-item">{location}</div>'
    if linkedin:
        contact_html += f'<div class="side-item">{linkedin}</div>'

    # ---------- EDUCATION ----------
    education_html = ""
    for e in content.get("education", []):
        parts  = e.split(" | ")
        degree = parts[0].strip() if len(parts) > 0 else e
        inst   = parts[1].strip() if len(parts) > 1 else ""
        year   = parts[2].strip() if len(parts) > 2 else ""
        education_html += f"""
        <div class="edu-block">
            <div class="edu-degree">{degree}</div>
            {f'<div class="edu-inst">{inst}</div>' if inst else ''}
            {f'<div class="edu-year">{year}</div>' if year else ''}
        </div>
        """

    # ---------- SKILLS ----------
    skills_html = ""
    for s in content.get("skills", []):
        if s and s.strip():
            skills_html += f'<li class="side-li">{s.strip()}</li>'

    # ---------- LANGUAGE / STRENGTHS ----------
    language_html = ""
    for s in content.get("strengths", []):
        if s and s.strip():
            language_html += f'<li class="side-li">{s.strip()}</li>'

    # ---------- TAGLINE ----------
    # Use first part of summary as tagline, uppercased
    summary_text = content.get("summary", "")
    tagline_parts = [p.strip() for p in summary_text.split(",")[:2] if p.strip()]
    tagline = " | ".join(tagline_parts).upper() if tagline_parts else "PROFESSIONAL RESUME"

    # ---------- EXPERIENCE ----------
    experience_html = ""
    for exp in content.get("experience", []):
        role_inst = exp.get("role_institution", "")
        duration  = exp.get("duration", "")
        bullets   = exp.get("bullets", [])
        bullet_items = "".join(
            f'<li>{b.strip()}</li>' for b in bullets if b and b.strip()
        )
        experience_html += f"""
        <div class="exp-block">
            <div class="exp-header">
                <span class="exp-role">{role_inst}</span>
                <span class="exp-date">{duration}</span>
            </div>
            {"<ul class='exp-list'>" + bullet_items + "</ul>" if bullet_items else ""}
        </div>
        """

    # ---------- PROJECTS ----------
    projects_html = ""
    for p in content.get("projects", []):
        title = p.get("title", "").strip()
        desc  = p.get("description", "").strip()
        if title:
            projects_html += f"""
            <div class="proj-block">
                <div class="proj-title">{title}</div>
                {f'<p class="proj-desc">{desc}</p>' if desc else ''}
            </div>
            """

    # ---------- CERTIFICATIONS ----------
    certs_items = "".join(
        f'<li>{c.strip()}</li>'
        for c in content.get("certifications", []) if c and c.strip()
    )

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            * {{ box-sizing: border-box; margin: 0; padding: 0; }}
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #222;
                background: #fff;
            }}

            /* ── HEADER ── */
            .header {{
                padding: 35px 40px 20px 40px;
                border-bottom: 1px solid #ddd;
            }}
            .header-name {{
                font-size: 28pt;
                font-weight: 400;
                color: #111;
                margin-bottom: 6px;
                letter-spacing: 0.3px;
            }}
            .header-cursor {{
                font-weight: 200;
                margin-right: 5px;
                color: #333;
            }}
            .header-tagline {{
                font-size: 8.5pt;
                letter-spacing: 3px;
                color: #888;
                text-align: center;
                text-transform: uppercase;
            }}

            /* ── BODY ── */
            .body {{
                display: flex;
                min-height: 24cm;
            }}

            /* ── LEFT SIDEBAR ── */
            .sidebar {{
                width: 33%;
                padding: 28px 22px;
                border-right: 1px solid #ddd;
                background: #fff;
            }}
            .side-section {{
                margin-bottom: 22px;
            }}
            .side-title {{
                font-size: 12.5pt;
                font-weight: bold;
                color: #111;
                margin-bottom: 6px;
            }}
            .side-divider {{
                height: 1px;
                background: #bbb;
                margin-bottom: 12px;
            }}
            .side-item {{
                font-size: 9.5pt;
                color: #333;
                margin-bottom: 9px;
                line-height: 1.4;
                word-break: break-word;
            }}
            .edu-block {{
                margin-bottom: 14px;
            }}
            .edu-degree {{
                font-size: 10.5pt;
                font-weight: bold;
                color: #111;
                line-height: 1.3;
            }}
            .edu-inst {{
                font-size: 9.5pt;
                color: #333;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                margin-top: 2px;
            }}
            .edu-year {{
                font-size: 9pt;
                color: #555;
                margin-top: 2px;
            }}
            .side-ul {{
                padding-left: 18px;
                margin: 0;
                list-style-type: disc;
            }}
            .side-li {{
                font-size: 9.5pt;
                color: #333;
                margin-bottom: 6px;
                line-height: 1.4;
            }}

            /* ── RIGHT CONTENT ── */
            .content {{
                width: 67%;
                padding: 28px 30px;
                background: #fff;
            }}
            .main-section {{
                margin-bottom: 22px;
            }}
            .main-title {{
                font-size: 13.5pt;
                font-weight: bold;
                color: #111;
                margin-bottom: 6px;
            }}
            .main-title-caps {{
                font-size: 13.5pt;
                font-weight: bold;
                color: #111;
                margin-bottom: 6px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .main-divider {{
                height: 1px;
                background: #bbb;
                margin-bottom: 14px;
            }}
            .overview-text {{
                font-size: 9.5pt;
                line-height: 1.65;
                color: #333;
                text-align: justify;
            }}

            /* EXPERIENCE */
            .exp-block {{
                margin-bottom: 16px;
            }}
            .exp-header {{
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                margin-bottom: 5px;
            }}
            .exp-role {{
                font-size: 11pt;
                font-weight: bold;
                color: #111;
                flex: 1;
            }}
            .exp-date {{
                font-size: 9pt;
                font-style: italic;
                color: #777;
                white-space: nowrap;
                margin-left: 10px;
            }}
            .exp-list {{
                padding-left: 18px;
                margin: 0;
                list-style-type: disc;
            }}
            .exp-list li {{
                font-size: 9.5pt;
                color: #333;
                margin-bottom: 4px;
                line-height: 1.45;
            }}

            /* PROJECTS */
            .proj-block {{
                margin-bottom: 18px;
            }}
            .proj-title {{
                font-size: 11pt;
                font-weight: bold;
                color: #111;
                margin-bottom: 3px;
            }}
            .proj-desc {{
                font-size: 9.5pt;
                line-height: 1.6;
                color: #333;
                text-align: justify;
                margin: 0;
            }}
        </style>
    </head>
    <body>

        <!-- HEADER -->
        <div class="header">
            <div class="header-name">
                <span class="header-cursor">|</span>{content['name']}
            </div>
            <div class="header-tagline">{tagline}</div>
        </div>

        <!-- BODY -->
        <div class="body">

            <!-- LEFT SIDEBAR -->
            <div class="sidebar">

                <div class="side-section">
                    <div class="side-title">Contact</div>
                    <div class="side-divider"></div>
                    {contact_html}
                </div>

                <div class="side-section">
                    <div class="side-title">Education</div>
                    <div class="side-divider"></div>
                    {education_html}
                </div>

                {"<div class='side-section'><div class='side-title'>Skills</div><div class='side-divider'></div><ul class='side-ul'>" + skills_html + "</ul></div>" if skills_html else ""}

                {"<div class='side-section'><div class='side-title'>Language</div><div class='side-divider'></div><ul class='side-ul'>" + language_html + "</ul></div>" if language_html else ""}

            </div>

            <!-- RIGHT CONTENT -->
            <div class="content">

                <div class="main-section">
                    <div class="main-title">Overview</div>
                    <div class="main-divider"></div>
                    <p class="overview-text">{content.get('summary', '')}</p>
                </div>

                {"<div class='main-section'><div class='main-title-caps'>Projects</div><div class='main-divider'></div>" + projects_html + "</div>" if projects_html else ""}

                {"<div class='main-section'><div class='main-title'>Work Experience</div><div class='main-divider'></div>" + experience_html + "</div>" if experience_html else ""}

                {"<div class='main-section'><div class='main-title'>Achievements &amp; Certifications</div><div class='main-divider'></div><ul class='exp-list'>" + certs_items + "</ul></div>" if certs_items else ""}

            </div>
        </div>

    </body>
    </html>
    """


# ================================================================
# MINIMAL TEMPLATE
# Two-column with dark header, skill pills – ATS-friendly
# ================================================================
def generate_minimal_html(content):
    contact_parts = content.get("contact", "").split("  •  ")
    email    = contact_parts[0] if len(contact_parts) > 0 else ""
    phone    = contact_parts[1] if len(contact_parts) > 1 else ""
    location = contact_parts[2] if len(contact_parts) > 2 else ""
    linkedin = contact_parts[3] if len(contact_parts) > 3 else ""

    skills_pills = "".join(
        f'<span class="skill-pill">{s}</span>' for s in content.get("skills", [])
    )

    strengths_html = "".join(
        f'<div class="strength-item">• {s}</div>' for s in content.get("strengths", [])
    )

    interests_html = "".join(
        f'<span class="interest-box">{i}</span>' for i in content.get("interests", [])
    )

    education_html = ""
    for e in content.get("education", []):
        parts = e.split(" | ")
        degree   = parts[0] if len(parts) > 0 else e
        inst     = parts[1] if len(parts) > 1 else ""
        year     = parts[2] if len(parts) > 2 else ""
        education_html += f"""
        <div class="edu-entry">
            <div class="item-bold">{degree}</div>
            <div class="inst-name">{inst}</div>
            <div class="year-text">{year}</div>
        </div>
        """

    experience_html = ""
    for exp in content.get("experience", []):
        parts = exp.get("role_institution", "").split(" at ", 1)
        role  = parts[0] if parts else exp.get("role_institution", "")
        inst  = parts[1] if len(parts) > 1 else ""
        bullets = "".join(f"<li>{b}</li>" for b in exp.get("bullets", []))
        experience_html += f"""
        <div class="exp-entry">
            <div class="row-between">
                <span class="item-bold">{role}</span>
                <span class="year-text">{exp.get('duration', '')}</span>
            </div>
            <div class="inst-name">{inst}</div>
            <ul>{bullets}</ul>
        </div>
        """

    projects_html = ""
    for p in content.get("projects", []):
        projects_html += f"""
        <div class="exp-entry">
            <div class="item-bold">{p.get('title', '')}</div>
            <p class="body-text">{p.get('description', '')}</p>
        </div>
        """

    certifications_html = "".join(
        f"<li>{c}</li>" for c in content.get("certifications", [])
    )

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            * {{ box-sizing: border-box; margin: 0; padding: 0; }}
            body {{
                font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                color: #333;
                background: #fff;
                line-height: 1.4;
            }}

            /* HEADER */
            .header {{
                background-color: #323b4c;
                color: #fff;
                padding: 35px 50px;
            }}
            .header h1 {{
                font-size: 26pt;
                font-weight: 500;
                letter-spacing: 1px;
                margin-bottom: 8px;
            }}
            .header-underline {{
                width: 100px;
                height: 2px;
                background: #fff;
                margin-bottom: 14px;
            }}
            .header p {{
                font-size: 10.5pt;
                font-weight: bold;
                opacity: 0.88;
                max-width: 80%;
                line-height: 1.5;
            }}

            /* LAYOUT */
            .container {{
                display: flex;
                min-height: 22cm;
            }}
            .sidebar {{
                width: 30%;
                background: #f6f6f6;
                padding: 28px 18px;
                border-right: 1px solid #ddd;
            }}
            .main-content {{
                width: 70%;
                padding: 28px 38px;
            }}

            /* SIDEBAR ELEMENTS */
            .sidebar-title {{
                font-size: 10.5pt;
                font-weight: bold;
                color: #323b4c;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 22px 0 5px 0;
            }}
            .side-divider {{
                height: 1.5px;
                background: #323b4c;
                margin-bottom: 12px;
            }}
            .contact-info {{
                font-size: 9pt;
                color: #323b4c;
                margin-bottom: 5px;
                line-height: 1.5;
                word-break: break-all;
            }}
            .skill-pill {{
                background: #a9b0b9;
                color: #fff;
                padding: 3px 9px;
                border-radius: 4px;
                display: inline-block;
                margin: 3px 2px;
                font-size: 8.5pt;
                font-weight: 500;
            }}
            .strength-item {{
                font-size: 9.5pt;
                margin-bottom: 6px;
                color: #444;
            }}
            .interest-box {{
                border: 1px solid #a9b0b9;
                padding: 3px 9px;
                font-size: 8.5pt;
                border-radius: 4px;
                display: inline-block;
                margin: 3px 3px 3px 0;
                color: #555;
            }}

            /* MAIN CONTENT */
            .section-title {{
                font-size: 12pt;
                font-weight: bold;
                color: #323b4c;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 20px 0 4px 0;
            }}
            .section-line {{
                height: 1.5px;
                background: #323b4c;
                margin-bottom: 12px;
            }}
            .edu-entry, .exp-entry {{
                margin-bottom: 14px;
            }}
            .item-bold {{
                font-size: 11pt;
                font-weight: bold;
                color: #323b4c;
            }}
            .inst-name {{
                font-size: 10pt;
                font-weight: 600;
                color: #444;
                margin-top: 1px;
            }}
            .year-text {{
                font-size: 9pt;
                font-style: italic;
                color: #777;
                margin-top: 2px;
            }}
            .row-between {{
                display: flex;
                justify-content: space-between;
                align-items: baseline;
            }}
            .body-text {{
                font-size: 10pt;
                line-height: 1.5;
                color: #444;
                margin-top: 4px;
            }}
            ul {{
                padding-left: 18px;
                margin-top: 6px;
                list-style-type: square;
            }}
            li {{
                font-size: 9.5pt;
                margin-bottom: 4px;
                color: #444;
                line-height: 1.4;
            }}
        </style>
    </head>
    <body>
        <!-- HEADER -->
        <div class="header">
            <h1>{content['name']}</h1>
            <div class="header-underline"></div>
            <p>{content['summary']}</p>
        </div>

        <div class="container">
            <!-- SIDEBAR -->
            <div class="sidebar">
                <div class="sidebar-title" style="margin-top:0;">Contact</div>
                <div class="side-divider"></div>
                <div class="contact-info">✉ {email}</div>
                <div class="contact-info">📞 {phone}</div>
                <div class="contact-info">📍 {location}</div>
                {f'<div class="contact-info">🔗 {linkedin}</div>' if linkedin else ''}

                <div class="sidebar-title">Skills</div>
                <div class="side-divider"></div>
                <div>{skills_pills}</div>

                {"<div class='sidebar-title'>Core Strengths</div><div class='side-divider'></div>" + strengths_html if content.get('strengths') else ""}

                {"<div class='sidebar-title'>Interests</div><div class='side-divider'></div>" + interests_html if content.get('interests') else ""}
            </div>

            <!-- MAIN CONTENT -->
            <div class="main-content">
                <div class="section-title">Education</div>
                <div class="section-line"></div>
                {education_html}

                {"<div class='section-title'>Work Experience</div><div class='section-line'></div>" + experience_html if content.get('experience') else ""}

                {"<div class='section-title'>Projects</div><div class='section-line'></div>" + projects_html if content.get('projects') else ""}

                {"<div class='section-title'>Certifications</div><div class='section-line'></div><ul>" + certifications_html + "</ul>" if content.get('certifications') else ""}
            </div>
        </div>
    </body>
    </html>
    """


# ================================================================
# BLUEPRINT
# ================================================================
resume_builder_manual_bp = Blueprint(
    "resume_builder_manual_bp",
    __name__,
)


# ================================================================
# CREATE RESUME
# ================================================================
@resume_builder_manual_bp.route("/create/<user_id>", methods=["POST"])
def create_manual_resume(user_id):
    data = request.json or {}
    template_id = data.get("template", "teacher_classic")

    personal          = data.get("personal", {})
    summary           = data.get("summary", "").strip()
    skills_raw        = data.get("skills", [])
    experience        = data.get("experience", [])
    education         = data.get("education", [])
    projects_raw      = data.get("projects", [])
    certifications_raw = data.get("certifications", [])
    strengths_raw     = data.get("strengths", [])
    interests_raw     = data.get("interests", [])

    if not personal.get("fullName") or not personal.get("email"):
        return jsonify({"error": "Essential personal details missing"}), 400

    # Build contact string with  •  separator (matches template splitting logic)
    contact_parts = [
        personal.get("email", ""),
        personal.get("phone", ""),
        personal.get("location", ""),
        personal.get("linkedin", ""),
    ]
    contact = "  •  ".join([c for c in contact_parts if c])

    # Format experience
    formatted_experience = []
    for exp in experience:
        bullets = [
            b.strip()
            for b in exp.get("responsibilities", "").split("\n")
            if b.strip()
        ]
        formatted_experience.append({
            "role_institution": f"{exp.get('role', '')} at {exp.get('institution', '')}",
            "duration": exp.get("duration", ""),
            "bullets": bullets,
        })

    # Format education as "Degree | Institution | Year"
    formatted_education = [
        f"{e.get('degree')} | {e.get('institution')} | {e.get('year')}"
        for e in education
        if e.get("degree")
    ]

    # Projects
    project_list = [
        {"title": p.get("title"), "description": p.get("description", "")}
        for p in projects_raw
        if p.get("title")
    ]

    # Certifications (sent as list of {title: "..."})
    certs_list = [c.get("title") for c in certifications_raw if c.get("title")]

    # Skills / strengths / interests — accept list or comma-string
    def to_list(val):
        if isinstance(val, list):
            return [str(v).strip() for v in val if str(v).strip()]
        return [s.strip() for s in str(val).split(",") if s.strip()]

    content = {
        "name":           personal.get("fullName"),
        "contact":        contact,
        "summary":        summary,
        "skills":         to_list(skills_raw),
        "experience":     formatted_experience,
        "education":      formatted_education,
        "certifications": certs_list,
        "projects":       project_list,
        "strengths":      to_list(strengths_raw),
        "interests":      to_list(interests_raw),
    }

    # Select HTML template
    if template_id == "teacher_modern":
        html_content = generate_modern_html(content)
    elif template_id == "teacher_minimal":
        html_content = generate_minimal_html(content)
    else:
        # teacher_classic (default)
        html_content = generate_classic_html(content)

    # File generation
    filename      = f"resume_{uuid.uuid4().hex}"
    pdf_filename  = f"{filename}.pdf"
    docx_filename = f"{filename}.docx"

    BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
    output_folder = os.path.join(BASE_DIR, "../generated_resumes")
    os.makedirs(output_folder, exist_ok=True)

    pdf_path  = os.path.join(output_folder, pdf_filename)
    docx_path = os.path.join(output_folder, docx_filename)

    generate_pdf_from_html(html_content, pdf_path)
    generate_docx(content, docx_path)

    result = mongo.db.generated_resumes.insert_one({
        "user_id":       user_id,
        "template_used": template_id,
        "pdf_filename":  pdf_filename,
        "docx_filename": docx_filename,
        "created_at":    datetime.utcnow(),
        "content":       content,
    })

    return jsonify({
        "message":       "Resume created successfully",
        "resume_id":     str(result.inserted_id),
        "pdf_filename":  pdf_filename,
        "docx_filename": docx_filename,
        "content":       content,
    }), 200


# ================================================================
# PREVIEW PDF
# ================================================================
@resume_builder_manual_bp.route("/preview/<resume_id>/pdf", methods=["GET"])
def preview_pdf(resume_id):
    resume = mongo.db.generated_resumes.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(BASE_DIR, "../generated_resumes", resume.get("pdf_filename"))

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    return send_file(file_path, mimetype="application/pdf")


# ================================================================
# DOWNLOAD PDF
# ================================================================
@resume_builder_manual_bp.route("/download/<resume_id>/pdf", methods=["GET"])
def download_pdf(resume_id):
    resume = mongo.db.generated_resumes.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(BASE_DIR, "../generated_resumes", resume.get("pdf_filename"))

    return send_file(file_path, as_attachment=True)


# ================================================================
# DOWNLOAD DOCX
# ================================================================
@resume_builder_manual_bp.route("/download/<resume_id>/docx", methods=["GET"])
def download_docx(resume_id):
    resume = mongo.db.generated_resumes.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(BASE_DIR, "../generated_resumes", resume.get("docx_filename"))

    return send_file(file_path, as_attachment=True)


# ================================================================
# RENAME
# ================================================================
@resume_builder_manual_bp.route("/rename/<resume_id>", methods=["PUT"])
def rename_resume(resume_id):
    data     = request.json or {}
    new_name = data.get("new_name", "").strip()

    if not new_name:
        return jsonify({"error": "New name required"}), 400

    resume = mongo.db.generated_resumes.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    folder   = os.path.join(BASE_DIR, "../generated_resumes")

    old_pdf  = resume.get("pdf_filename")
    old_docx = resume.get("docx_filename")
    new_pdf  = f"{new_name}.pdf"
    new_docx = f"{new_name}.docx"

    if os.path.exists(os.path.join(folder, new_pdf)) or \
       os.path.exists(os.path.join(folder, new_docx)):
        return jsonify({"error": "File name already exists"}), 409

    try:
        if old_pdf and os.path.exists(os.path.join(folder, old_pdf)):
            os.rename(os.path.join(folder, old_pdf), os.path.join(folder, new_pdf))

        if old_docx and os.path.exists(os.path.join(folder, old_docx)):
            os.rename(os.path.join(folder, old_docx), os.path.join(folder, new_docx))

        mongo.db.generated_resumes.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"pdf_filename": new_pdf, "docx_filename": new_docx}},
        )

        return jsonify({
            "message":      "Renamed successfully",
            "pdf_filename": new_pdf,
            "docx_filename": new_docx,
        })

    except Exception as e:
        print("❌ RENAME ERROR:", e)
        return jsonify({"error": "Rename failed"}), 500
    