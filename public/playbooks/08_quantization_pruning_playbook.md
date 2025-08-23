# Quantization & Pruning
**Goal:** PTQ/QAT and pruning; measure speed/quality.


## Environment Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install torch bitsandbytes numpy pandas
```


## Steps
1. Apply quantization.
2. Measure latency/throughput.
3. Prune and re-evaluate.

## Acceptance Criteria
- [ ] Latency improved
- [ ] Quality drop < threshold
- [ ] Report with plots
