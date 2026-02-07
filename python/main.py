import os
import re
import shutil
import uuid
import traceback
import pytesseract
import uvicorn

from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from pdf2image import convert_from_path

# ================== BASIC SETUP ==================

BASE_DIR = "uploads"
PDF_DIR = os.path.join(BASE_DIR, "pdfs")

os.makedirs(PDF_DIR, exist_ok=True)

ENABLE_OCR = True

print("TESSERACT:", shutil.which("tesseract"))
print("PDFINFO:", shutil.which("pdfinfo"))

# ================== APP ==================

app = FastAPI(title="Img2XL Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== MEMORY STORE ==================

DOCUMENT_TEXT = ""

# ================== MODELS ==================

class AskRequest(BaseModel):
    question: str

# ================== HELPERS ==================

def analyze_text(text: str):
    return {
        "numbers": re.findall(r"\b\d+\b", text),
        "dates": re.findall(r"\b\d{2}-\d{2}-\d{4}\b", text),
        "emails": re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    }

def split_text(text, size=1000):
    return [text[i:i+size] for i in range(0, len(text), size)]

# ================== HOME ==================

@app.get("/")
def home():
    return {"status": "running"}

# ================== UPLOAD ==================

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    use_ocr: bool = Form(True)
):
    global DOCUMENT_TEXT

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF allowed")

    doc_id = str(uuid.uuid4())
    pdf_path = os.path.join(PDF_DIR, f"{doc_id}.pdf")

    try:
        with open(pdf_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        reader = PdfReader(pdf_path)
        pages_text = []

        for i, page in enumerate(reader.pages):
            text_layer = page.extract_text() or ""

            ocr_text = ""
            if ENABLE_OCR and use_ocr:
                try:
                    images = convert_from_path(
                        pdf_path,
                        first_page=i + 1,
                        last_page=i + 1
                    )
                    ocr_text = pytesseract.image_to_string(images[0])
                except:
                    pass

            combined = f"{text_layer}\n{ocr_text}"
            pages_text.append(combined)

        DOCUMENT_TEXT = "\n".join(pages_text)

        return {
            "status": "ok",
            "filename": file.filename,
            "pages": len(reader.pages),
            "characters": len(DOCUMENT_TEXT)
        }

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Upload failed")

# ================== ASK ==================

@app.post("/ask")
async def ask_question(payload: AskRequest):

    if not DOCUMENT_TEXT:
        return {"answer": "Upload document first"}

    chunks = split_text(DOCUMENT_TEXT)

    context = chunks[0]  # simple first chunk

    return {
        "answer": f"Question received: {payload.question}",
        "sources": [
            {"chunk_text": context[:500]}
        ]
    }

# ================== RUN ==================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
