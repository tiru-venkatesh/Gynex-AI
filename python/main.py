from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pdf2image import convert_from_path
from pypdf import PdfReader
from PIL import Image
import pytesseract
import requests
import os
import uuid
import numpy as np
import faiss
POPPLER_PATH = r"C:\poppler\Library\bin"
# ============================ CONFIG ============================

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
OLLAMA_URL = "http://localhost:11434"

# ============================ APP ============================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================ MEMORY ============================

DOCUMENT_TEXT = ""
CHUNKS = []
INDEX = None
EMBEDDING_DIM = None

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
    r = requests.post(
        f"{OLLAMA_URL}/api/embeddings",
        json={
            "model": "nomic-embed-text",
            "prompt": text
        },
        timeout=120
    )

    r.raise_for_status()
    return np.array(r.json()["embedding"], dtype="float32")


def clean_text(text):
    return text.replace("\x00", "").replace("\n\n", "\n").strip()

# ============================ UPLOAD ============================
# ============================ UPLOAD ============================

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global DOCUMENT_TEXT, CHUNKS, INDEX, EMBEDDING_DIM

    filename = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    text = ""

    # ----------- PDF (FORCE OCR) ----------
    if file.filename.lower().endswith(".pdf"):
        images = convert_from_path(path, poppler_path=POPPLER_PATH)

        for img in images:
            text += pytesseract.image_to_string(
                img,
                config="--oem 3 --psm 6"
            )

    # ----------- IMAGE ----------
    else:
        img = Image.open(path).convert("L")
        text = pytesseract.image_to_string(
            img,
            config="--oem 3 --psm 6"
        )

    text = clean_text(text)

    if not text:
        return {"status": "error", "message": "No text extracted"}

    DOCUMENT_TEXT = text
    CHUNKS = chunk_text(text)

    vectors = [embed(c) for c in CHUNKS]
    EMBEDDING_DIM = len(vectors[0])

    INDEX = faiss.IndexFlatL2(EMBEDDING_DIM)
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
        return {"error": "Upload a document first"}

    q_vec = embed(req.question)
    _, I = INDEX.search(np.array([q_vec]), 3)

    sources = [CHUNKS[i] for i in I[0]]
    context = "\n\n".join(sources)

    prompt = f"""
You are a document assistant.

Answer ONLY from context.

CONTEXT:
{context}

QUESTION:
{req.question}
"""

    r = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )

    r.raise_for_status()
    data = r.json()

    return {
        "answer": data["response"],
        "sources": [{"chunk_text": s} for s in sources],
        "ocr_text": DOCUMENT_TEXT[:2000]
    }

# ============================ ROOT ============================

@app.get("/")
def root():
    return {"status": "running"}
