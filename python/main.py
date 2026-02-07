from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pdf2image import convert_from_path
from PIL import Image
import pytesseract
import google.genai as genai
import os, uuid
import numpy as np
import faiss

# ============================ CONFIG ============================

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Gemini API from environment (SAFE)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

llm = genai.GenerativeModel("gemini-1.5-flash")

# ============================ APP ============================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all websites
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================ MEMORY ============================

DOCUMENT_TEXT = ""
CHUNKS = []
INDEX = None

# ============================ MODELS ============================

class AskRequest(BaseModel):
    question: str

# ============================ HELPERS ============================

def chunk_text(text, size=800, overlap=200):
    chunks = []
    i = 0
    while i < len(text):
        chunks.append(text[i:i+size])
        i += size - overlap
    return chunks


def embed(text):
    result = genai.embed_content(
        model="models/embedding-001",
        content=text
    )
    return np.array(result["embedding"], dtype="float32")


def clean_text(text):
    return text.replace("\x00", "").strip()

# ============================ UPLOAD ============================

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global DOCUMENT_TEXT, CHUNKS, INDEX

    filename = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    text = ""

    # PDF → OCR
    if file.filename.lower().endswith(".pdf"):
        images = convert_from_path(path)
        for img in images:
            text += pytesseract.image_to_string(img)

    # IMAGE → OCR
    else:
        img = Image.open(path)
        text = pytesseract.image_to_string(img)

    text = clean_text(text)

    if not text:
        return {"status": "error", "message": "No text extracted"}

    DOCUMENT_TEXT = text
    CHUNKS = chunk_text(text)

    vectors = [embed(c) for c in CHUNKS]
    dim = len(vectors[0])

    INDEX = faiss.IndexFlatL2(dim)
    INDEX.add(np.array(vectors))

    return {
        "status": "ok",
        "chunks": len(CHUNKS),
        "characters": len(text)
    }

# ============================ ASK ============================

@app.post("/ask")
def ask(req: AskRequest):

    if INDEX is None:
        return {"error": "Upload document first"}

    q_vec = embed(req.question)
    _, I = INDEX.search(np.array([q_vec]), 3)

    sources = [CHUNKS[i] for i in I[0]]
    context = "\n\n".join(sources)

    prompt = f"""
Answer ONLY from context.

CONTEXT:
{context}

QUESTION:
{req.question}
"""

    response = llm.generate_content(prompt)

    return {
        "answer": response.text,
        "sources": [{"chunk_text": s} for s in sources],
        "ocr_text": DOCUMENT_TEXT[:2000]
    }

# ============================ ROOT ============================

@app.get("/")
def root():
    return {"status": "running"}
