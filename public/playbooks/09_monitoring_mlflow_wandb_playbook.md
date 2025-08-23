# Monitoring (MLflow/W&B)
**Goal:** Track runs, metrics, alerts.


## Environment Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install mlflow wandb
```


## Steps
1. Log params/metrics/artifacts.
2. Dashboard & alert.
3. Failure runbook.

## Acceptance Criteria
- [ ] All runs tracked
- [ ] Dashboard created
- [ ] Alert tested
