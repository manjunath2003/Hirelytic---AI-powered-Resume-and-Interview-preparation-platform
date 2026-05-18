from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from textwrap import wrap


def wrap_text(text, width):
    lines = []
    for line in str(text).split("\n"):
        lines.extend(wrap(line.strip(), width))
    return lines


def draw_pill(c, x, y, text):
    text_width = c.stringWidth(text, "Helvetica", 8)
    padding = 6
    rect_w = text_width + (padding * 2)
    rect_h = 14

    c.setFillColor(colors.HexColor("#A0AEC0"))
    c.roundRect(x, y - 3, rect_w, rect_h, 4, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica", 8)
    c.drawString(x + padding, y, text)

    return rect_w + 5


# ✅ IMPORTANT: backend calls THIS function
def generate_layout(pdf_path, content):
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    PRIMARY_DARK = colors.HexColor("#2D3748")

    # ---------------- DATA ----------------
    name = content.get("name", "")
    summary = content.get("summary", "")
    contact = content.get("contact", "")
    skills = content.get("skills", [])
    education = content.get("education", [])
    experience = content.get("experience", [])
    languages = content.get("languages", {})

    # ---------------- HEADER ----------------
    c.setFillColor(PRIMARY_DARK)
    c.rect(0, height - 110, width, 110, fill=1)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(40, height - 50, name)

    # underline
    c.setStrokeColor(colors.white)
    c.line(40, height - 60, 200, height - 60)

    c.setFont("Helvetica-Bold", 10)
    for i, line in enumerate(wrap_text(summary, 110)):
        c.drawString(40, height - 80 - (i * 12), line)

    # ---------------- SIDEBAR ----------------
    lx = 40
    ly = height - 140

    # CONTACT FIX (string or list)
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.black)

    contact_items = contact.split("•") if isinstance(contact, str) else contact

    for item in contact_items:
        if item.strip():
            c.drawString(lx, ly, item.strip())
            ly -= 15

    ly -= 10

    def sidebar_header(title, y_pos):
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(PRIMARY_DARK)
        c.drawString(lx, y_pos, title.upper())
        c.setStrokeColor(PRIMARY_DARK)
        c.line(lx, y_pos - 4, lx + 100, y_pos - 4)
        return y_pos - 20

    # SKILLS (pill UI)
    ly = sidebar_header("Skills", ly)
    pill_x = lx

    for skill in skills:
        if pill_x > 150:
            pill_x = lx
            ly -= 18
        pill_x += draw_pill(c, pill_x, ly, skill)

    ly -= 30

    # LANGUAGES
    if languages:
        ly = sidebar_header("Languages", ly)
        for lang, prof in languages.items():
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(colors.black)
            c.drawString(lx, ly, lang)
            ly -= 10

            c.setFont("Helvetica-Oblique", 8)
            c.setFillColor(colors.grey)
            c.drawString(lx, ly, prof)
            ly -= 15

    # ---------------- MAIN CONTENT ----------------
    rx = 180
    ry = height - 140

    def main_header(title, y_pos):
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(PRIMARY_DARK)
        c.drawString(rx, y_pos, title.upper())
        c.setStrokeColor(PRIMARY_DARK)
        c.line(rx, y_pos - 4, width - 40, y_pos - 4)
        return y_pos - 25

    # ✅ EDUCATION FIX (string-based)
    ry = main_header("Education", ry)

    for edu in education:
        for line in wrap_text(edu, 65):
            c.setFont("Helvetica", 9)
            c.setFillColor(colors.black)
            c.drawString(rx, ry, line)
            ry -= 12
        ry -= 5

    # ✅ EXPERIENCE FIX (backend structure)
    ry = main_header("Work Experience", ry)

    for exp in experience:
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(PRIMARY_DARK)
        c.drawString(rx, ry, exp.get("role_institution", ""))
        ry -= 12

        c.setFont("Helvetica-Oblique", 9)
        c.setFillColor(colors.grey)
        c.drawString(rx, ry, exp.get("duration", ""))
        ry -= 12

        c.setFont("Helvetica", 9)
        c.setFillColor(colors.black)

        for bullet in exp.get("bullets", []):
            for line in wrap_text(bullet, 70):
                c.drawString(rx + 5, ry, f"▪ {line}")
                ry -= 11

        ry -= 10

    c.save()
    