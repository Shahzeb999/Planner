# RAG Chatbot
**Goal:** Build a RAG pipeline with retrieval + LLM generation.


## Environment Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install langchain faiss-cpu chromadb sentence-transformers uvicorn fastapi
```


## Suggested Repo Structure
```
rag-bot/
  data/docs/
  src/ingest.py
  src/retrieve.py
  src/generate.py
  src/server.py
  src/eval.py
  README.md
```


## Steps
1. Ingest & embed to FAISS/Chroma.
2. Retrieve top-k docs.
3. Answer with citations.
4. Evaluate latency/recall.

## Acceptance Criteria
- [ ] API `/chat` < 1.5s p95 on small corpora
- [ ] Top-3 citations included
- [ ] Recall@k and latency reported
