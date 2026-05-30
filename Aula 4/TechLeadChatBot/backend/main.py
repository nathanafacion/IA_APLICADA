from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from agent import run_agent

app = FastAPI(title="TechLead ChatBot API", version="1.0.0")

# Permite requisições do frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    user_id: str
    message: str
    sprint_context: Optional[str] = ""


class ChatResponse(BaseModel):
    response: str
    user_id: str


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "TechLead ChatBot"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Mensagem não pode ser vazia.")
    try:
        resposta = run_agent(
            user_id=request.user_id,
            mensagem=request.message,
            sprint_context=request.sprint_context or "",
        )
        return ChatResponse(response=resposta, user_id=request.user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
