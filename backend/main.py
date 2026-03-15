"""
SwitchCost (Inference Autopilot) - FastAPI Entry Point
Migration engine from proprietary to open-source models on Nebius Token Factory.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router
from backend.api.websocket import ws_router

app = FastAPI(
    title="SwitchCost",
    description="Migrate from proprietary to open-source models. See exactly what you save.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "inference-autopilot"}
