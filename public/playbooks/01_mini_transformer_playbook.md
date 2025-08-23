# Mini Transformer (Encoder-Only)
**Goal:** Implement a small Transformer encoder in PyTorch and train it on a toy corpus.


## Environment Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install torch torchvision torchaudio numpy tqdm matplotlib
```


## Suggested Repo Structure
```
mini-transformer/
  data/
    tiny_corpus.txt
  src/
    model.py
    train.py
    dataset.py
    utils.py
  tests/
    test_attention.py
  README.md
```


## Steps
1. Tokenizer (byte-level or simple).
2. PositionalEncoding.
3. MultiHeadAttention with mask.
4. Residual + LayerNorm around MHA and FFN.
5. Train 5–10 epochs; plot loss.
6. Ablations: heads/layers.

## Acceptance Criteria
- [ ] Attention shapes & masks tested
- [ ] Loss down >30% by epoch 5
- [ ] Attention map saved
- [ ] README explains design choices
