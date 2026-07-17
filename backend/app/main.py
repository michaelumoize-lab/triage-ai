from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes  # Use full path

app = FastAPI(
    title="TriageAI API",
    description="AI-Powered Clinical Triage & Differential Diagnosis Assistant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api/v1", tags=["TriageAI"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to TriageAI API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "TriageAI Backend"}