# LLM Evaluation Suite
**Goal:** Build a PPL + BLEU/ROUGE harness + human eval stub.


## Environment Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install evaluate sacrebleu rouge-score numpy pandas
```


## Suggested Repo Structure
```
eval-suite/
  src/perplexity.py
  src/bleu_rouge.py
  src/human_eval.py
  src/report.py
  README.md
```


## Steps
1. PPL on held-out set.
2. BLEU/ROUGE for tasks.
3. Human eval template.
4. Auto-generate report.

## Acceptance Criteria
- [ ] PPL computed
- [ ] BLEU/ROUGE computed
- [ ] Report with caveats
