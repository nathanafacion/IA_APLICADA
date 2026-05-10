"""
Implementacoes reais das ferramentas do rota-monitor-agent.

Suporta:
- React Router (arquivos com <Route> ou createBrowserRouter)
- Next.js pages router  (pasta pages/)
- Next.js app router    (pasta app/ com page.tsx/page.js)
- Jekyll                (_config.yml + _posts/, .md, .html)

O runtime carrega este arquivo automaticamente quando existe,
substituindo as ferramentas simuladas pela LLM.
"""

import re
import textwrap
from datetime import datetime
from pathlib import Path


# ---------------------------------------------------------------------------
# Deteccao de tipo de projeto
# ---------------------------------------------------------------------------

def _detectar_tipo(raiz: Path) -> str:
    if (raiz / "_config.yml").exists():
        return "jekyll"
    if (raiz / "package.json").exists():
        pkg = (raiz / "package.json").read_text(encoding="utf-8", errors="ignore")
        if '"next"' in pkg:
            return "nextjs"
        if '"react-router"' in pkg or '"react-router-dom"' in pkg:
            return "react"
    return "desconhecido"


# ---------------------------------------------------------------------------
# Scanners por tipo
# ---------------------------------------------------------------------------

def _ler_frontmatter(arq: Path) -> dict:
    """Extrai title e description do frontmatter YAML de um arquivo .md."""
    try:
        texto = arq.read_text(encoding="utf-8", errors="ignore")
        if texto.startswith("---"):
            fim = texto.find("---", 3)
            if fim != -1:
                bloco = texto[3:fim]
                titulo = re.search(r"^title:\s*(.+)", bloco, re.MULTILINE)
                descricao = re.search(r"^description:\s*(.+)", bloco, re.MULTILINE)
                excerpt = re.search(r"^excerpt:\s*(.+)", bloco, re.MULTILINE)
                return {
                    "titulo": titulo.group(1).strip().strip('"\'') if titulo else None,
                    "descricao": (descricao or excerpt).group(1).strip().strip('"\'') if (descricao or excerpt) else None,
                }
    except Exception:
        pass
    return {}


def _scan_nextjs(raiz: Path) -> list:
    rotas = []

    # App Router
    pasta_app = raiz / "app"
    if pasta_app.exists():
        for arq in sorted(pasta_app.rglob("page.*")):
            if arq.suffix in (".tsx", ".jsx", ".ts", ".js"):
                rel = arq.parent.relative_to(pasta_app)
                rota = "/" + str(rel).replace("\\", "/")
                rota = re.sub(r"\(.*?\)/", "", rota)
                rota = rota.rstrip("/") or "/"
                nome = rota.split("/")[-1] or "home"
                rotas.append({"rota": rota, "titulo": nome.replace("-", " ").title(), "descricao": f"Pagina {rota}"})

    # Pages Router
    pasta_pages = raiz / "pages"
    if pasta_pages.exists():
        for arq in sorted(pasta_pages.rglob("*")):
            if arq.suffix not in (".tsx", ".jsx", ".ts", ".js"):
                continue
            rel = arq.relative_to(pasta_pages)
            partes = list(rel.parts)
            if not partes or partes[0] == "api":
                continue
            nome = partes[-1]
            if nome.startswith("_"):
                continue
            partes[-1] = re.sub(r"\.(tsx|jsx|ts|js)$", "", nome)
            if partes[-1] == "index":
                partes = partes[:-1]
            rota = "/" + "/".join(partes) if partes else "/"
            label = (partes[-1] if partes else "home").replace("-", " ").title()
            rotas.append({"rota": rota, "titulo": label, "descricao": f"Pagina {rota}"})

    visto = set()
    resultado = []
    for p in rotas:
        if p["rota"] not in visto:
            visto.add(p["rota"])
            resultado.append(p)
    return resultado or [{"rota": "/", "titulo": "Home", "descricao": "Pagina inicial"}]


def _scan_react(raiz: Path) -> list:
    rotas = set()
    padrao_route = re.compile(r'<Route[^>]+path=["\']([^"\']+)["\']')
    padrao_path = re.compile(r'path:\s*["\']([^"\']+)["\']')

    for arq in list(raiz.rglob("*.tsx")) + list(raiz.rglob("*.jsx")):
        texto = arq.read_text(encoding="utf-8", errors="ignore")
        rotas.update(padrao_route.findall(texto))
        rotas.update(padrao_path.findall(texto))

    return [
        {"rota": r, "titulo": r.split("/")[-1].replace("-", " ").title() or "Home", "descricao": f"Pagina {r}"}
        for r in sorted(rotas)
    ] or [{"rota": "/", "titulo": "Home", "descricao": "Pagina inicial"}]


def _scan_jekyll(raiz: Path) -> list:
    paginas = []

    for arq in sorted(raiz.glob("*.md")) + sorted(raiz.glob("*.html")):
        if arq.name.startswith("_"):
            continue
        stem = arq.stem
        rota = "/" if stem == "index" else f"/{stem}"
        fm = _ler_frontmatter(arq) if arq.suffix == ".md" else {}
        paginas.append({
            "rota": rota,
            "titulo": fm.get("titulo") or stem.replace("-", " ").title(),
            "descricao": fm.get("descricao") or f"Pagina {rota}",
        })

    for arq in sorted(raiz.rglob("*.md")) + sorted(raiz.rglob("*.html")):
        partes = arq.relative_to(raiz).parts
        if any(p.startswith("_") and p != "_posts" for p in partes):
            continue
        if arq.name.startswith("_"):
            continue
        if arq.parent == raiz:
            continue
        stem = arq.stem
        rel_dir = "/".join(p for p in partes[:-1] if not p.startswith("_"))
        rota = f"/{rel_dir}/{stem}" if rel_dir else f"/{stem}"
        fm = _ler_frontmatter(arq) if arq.suffix == ".md" else {}
        paginas.append({
            "rota": rota,
            "titulo": fm.get("titulo") or stem.replace("-", " ").title(),
            "descricao": fm.get("descricao") or f"Pagina {rota}",
        })

    pasta_posts = raiz / "_posts"
    if pasta_posts.exists():
        for arq in sorted(pasta_posts.glob("*.md")):
            nome = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", arq.stem)
            rota = f"/blog/{nome}"
            fm = _ler_frontmatter(arq)
            paginas.append({
                "rota": rota,
                "titulo": fm.get("titulo") or nome.replace("-", " ").title(),
                "descricao": fm.get("descricao") or f"Post: {nome.replace('-', ' ').title()}",
            })

    # deduplicar por rota
    visto = set()
    resultado = []
    for p in paginas:
        if p["rota"] not in visto:
            visto.add(p["rota"])
            resultado.append(p)
    return resultado or [{"rota": "/", "titulo": "Home", "descricao": "Pagina inicial"}]


# ---------------------------------------------------------------------------
# Ferramentas expostas ao runtime
# ---------------------------------------------------------------------------

def detectar_paginas(argumentos: dict) -> dict:
    caminho_str = argumentos.get("caminho_projeto", ".")
    raiz = Path(caminho_str).expanduser().resolve()

    if not raiz.exists():
        return {"sucesso": False, "erro": f"Caminho nao encontrado: {raiz}"}

    tipo = _detectar_tipo(raiz)

    if tipo == "nextjs":
        paginas = _scan_nextjs(raiz)
    elif tipo == "react":
        paginas = _scan_react(raiz)
    elif tipo == "jekyll":
        paginas = _scan_jekyll(raiz)
    else:
        return {
            "sucesso": False,
            "erro": f"Tipo de projeto nao reconhecido em '{raiz}'. Esperado: React Router, Next.js ou Jekyll.",
        }

    print(f"  [tools] {tipo} detectado — {len(paginas)} pagina(s) encontrada(s)")

    return {
        "sucesso": True,
        "dados": {
            "tipo_projeto": tipo,
            "paginas": paginas,
            "_entrada": argumentos,
        },
    }


def gerar_md(argumentos: dict) -> dict:
    paginas = argumentos.get("paginas", [])
    caminho_saida_str = argumentos.get("caminho_saida", "./docs")

    # suporte a chamada legada com pagina/descricao individuais
    if not paginas and argumentos.get("pagina"):
        paginas = [{
            "rota": argumentos["pagina"],
            "titulo": argumentos.get("titulo", argumentos["pagina"]),
            "descricao": argumentos.get("descricao", f"Pagina {argumentos['pagina']}"),
        }]

    if not paginas:
        return {"sucesso": False, "erro": "Nenhuma pagina fornecida em 'paginas'"}

    caminho_saida = Path(caminho_saida_str).expanduser().resolve()
    caminho_saida.mkdir(parents=True, exist_ok=True)

    arquivos_gerados = []
    for pagina in paginas:
        if isinstance(pagina, dict):
            rota = pagina.get("rota", "/")
            titulo = pagina.get("titulo") or rota
            descricao = pagina.get("descricao") or f"Pagina {rota}"
        else:
            rota = str(pagina)
            titulo = rota
            descricao = f"Pagina {rota}"

        nome_arquivo = re.sub(r"[^\w]", "_", rota.strip("/")) or "index"
        nome_arquivo = f"pagina_{nome_arquivo}.md"
        caminho_arquivo = caminho_saida / nome_arquivo

        conteudo = textwrap.dedent(f"""\
            # {titulo}

            {descricao}

            ---

            - **Rota:** `{rota}`
            - **Gerado em:** {datetime.now().strftime("%Y-%m-%d %H:%M")}
        """)

        caminho_arquivo.write_text(conteudo, encoding="utf-8")
        arquivos_gerados.append(str(caminho_arquivo))
        print(f"  [tools] gerado: {caminho_arquivo}")

    return {
        "sucesso": True,
        "dados": {
            "arquivos_gerados": arquivos_gerados,
            "_entrada": argumentos,
        },
    }


def gerar_llms_txt(argumentos: dict) -> dict:
    paginas = argumentos.get("paginas", [])
    tipo_projeto = argumentos.get("tipo_projeto", "desconhecido")
    caminho_saida_str = argumentos.get("caminho_saida", "./docs")

    caminho_saida = Path(caminho_saida_str).expanduser().resolve()
    caminho_saida.mkdir(parents=True, exist_ok=True)

    caminho_arquivo = caminho_saida / "llms.txt"

    linhas = [
        "# llms.txt",
        f"# Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"# Tipo de projeto: {tipo_projeto}",
        f"# Total de paginas: {len(paginas)}",
        "",
    ]

    for pagina in paginas:
        if isinstance(pagina, dict):
            rota = pagina.get("rota") or pagina.get("pagina") or str(pagina)
        else:
            rota = str(pagina)
        linhas.append(f"- {rota}")

    caminho_arquivo.write_text("\n".join(linhas), encoding="utf-8")
    print(f"  [tools] gerado: {caminho_arquivo}")

    return {
        "sucesso": True,
        "dados": {
            "arquivo_llms_txt": str(caminho_arquivo),
            "_entrada": argumentos,
        },
    }


# ---------------------------------------------------------------------------
# Registro exposto ao runtime
# ---------------------------------------------------------------------------

FERRAMENTAS = {
    "detectar_paginas": detectar_paginas,
    "gerar_md": gerar_md,
    "gerar_llms_txt": gerar_llms_txt,
}
