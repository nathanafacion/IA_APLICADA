"""
utils/langchain_client.py — Fábrica de LLM para LangChain.

Respeita as mesmas variáveis de ambiente do llm_client.py:
  LLM_PROVIDER=ollama  → Ollama local via OLLAMA_URL / OLLAMA_MODEL
  LLM_PROVIDER=openai  → OpenAI via OPENAI_API_KEY
  (sem config)         → lança ValueError (use llm_client.py p/ mock)
"""

import os
from dotenv import load_dotenv

_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path=_env_path)

_provider = os.getenv("LLM_PROVIDER", "").lower()
_api_key = os.getenv("OPENAI_API_KEY", "")
_ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/v1")
_ollama_model = os.getenv("OLLAMA_MODEL", "llama3")


def criar_llm(temperature: float = 0.2):
    """
    Retorna um ChatOpenAI configurado para o provedor ativo.
    Compatível com Ollama (OpenAI-compatible endpoint) e OpenAI.

    Raises:
        ImportError: se langchain-openai não estiver instalado.
        ValueError:  se nenhum provedor estiver configurado.
    """
    try:
        from langchain_openai import ChatOpenAI
    except ImportError as exc:
        raise ImportError(
            "langchain-openai não instalado. Execute: pip install langchain-openai"
        ) from exc

    if _provider == "ollama":
        return ChatOpenAI(
            model=_ollama_model,
            base_url=_ollama_url,
            api_key="ollama",
            temperature=temperature,
        )

    if _provider == "openai" or (_api_key and not _api_key.startswith("sk-...")):
        return ChatOpenAI(
            model="gpt-4o-mini",
            api_key=_api_key,
            temperature=temperature,
        )

    raise ValueError(
        "Nenhum provedor LLM configurado. "
        "Defina LLM_PROVIDER=ollama ou LLM_PROVIDER=openai no .env"
    )
