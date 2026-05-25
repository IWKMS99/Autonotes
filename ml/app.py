from __future__ import annotations

from fastapi import FastAPI

# Keep this module lightweight to avoid import-time side-effects (worker, model)
# Tests only need the simple health endpoint; other imports are performed lazily
# inside endpoints or startup handlers in other modules.
app = FastAPI(title="Autonotes ML Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
