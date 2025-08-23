# Efficient Finetuning (LoRA/QLoRA)
**Goal:** Finetune small models with adapters; compare cost/quality.


## Environment Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install transformers accelerate peft datasets bitsandbytes evaluate
```


## Suggested Repo Structure
```
eft-finetune/
  data/
  src/finetune_lora.py
  src/finetune_qlora.py
  src/eval.py
  README.md
```


## Steps
1. Tokenize instruction pairs.
2. Train LoRA (rank=8/16).",
3. Train QLoRA (4-bit).",
4. Evaluate: PPL + ROUGE.

## Acceptance Criteria
- [ ] Fits in <=12GB VRAM
- [ ] Training stable (no OOM)
- [ ] Report table LoRA vs QLoRA
- [ ] Curves plotted
