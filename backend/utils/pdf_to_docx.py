from pdf2docx import Converter
from docx import Document

def convert_pdf_to_docx(pdf_path, docx_path):
    try:
        cv = Converter(pdf_path)

        # 🔥 IMPORTANT SETTINGS
        cv.convert(
            docx_path,
            start=0,
            end=None,
            pages=None,
            multi_processing=True,   # faster + better layout detection
        )

        cv.close()

    except Exception as e:
        print("PDF → DOCX conversion failed:", e)
    
def clean_docx_formatting(docx_path):
    doc = Document(docx_path)

    for para in doc.paragraphs:
        text = para.text.strip()

        # Remove extra empty lines
        if text == "":
            para._element.getparent().remove(para._element)
            continue

        # Improve headings detection
        if text.isupper() and len(text) < 40:
            para.style = "Heading 1"

        # Improve bullet alignment
        if text.startswith("-"):
            para.style = "List Bullet"

    doc.save(docx_path)
        