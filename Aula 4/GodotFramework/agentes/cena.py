"""
Gerador determinístico de arquivos .tscn para Godot 4.
Não usa LLM — gera a partir do JSON de arquitetura do Diretor.
"""
import hashlib

# Correção de tipos Godot 3 → Godot 4
_TYPE_MAP = {
    "KinematicBody2D": "CharacterBody2D",
    "Sprite": "Sprite2D",
    "CollisionPolygon": "CollisionPolygon2D",
}

_UI_ROOTS = ("Control", "Panel", "PanelContainer", "CanvasLayer", "MarginContainer", "HBoxContainer", "VBoxContainer")
_PHYSICS_ROOTS = ("CharacterBody2D", "RigidBody2D", "StaticBody2D", "Area2D")


def _remap(t: str) -> str:
    return _TYPE_MAP.get(t, t)


def _uid(name: str) -> str:
    h = hashlib.md5(name.encode()).hexdigest()[:11]
    return f"uid://b{h}"


def _pascal(snake: str) -> str:
    return "".join(w.title() for w in snake.replace(".tscn", "").split("_"))


def gerar_cena(cena: dict, usa_assets: bool = False) -> str:
    nome = cena["nome"].replace(".tscn", "")
    raiz = _remap(cena.get("tipo_raiz", "Node2D"))
    filhos = [{"nome": f["nome"], "tipo": _remap(f["tipo"])} for f in cena.get("filhos", [])]
    script = cena.get("script_associado", "")

    print(f"[Cena] Gerando {cena['nome']} (determinístico, assets={'sim' if usa_assets else 'Polygon2D'})...")

    is_ui = raiz in _UI_ROOTS
    is_physics = raiz in _PHYSICS_ROOTS

    ext_resources = []
    sub_resources = []

    if script:
        ext_resources.append({"type": "Script", "path": f"res://{script}", "id": f"1_{nome}"})

    if is_physics:
        sub_resources.append({"type": "RectangleShape2D", "id": "RectShape1", "props": "size = Vector2(40, 40)"})

    load_steps = 1 + len(ext_resources) + len(sub_resources)
    out = [f'[gd_scene load_steps={load_steps} format=3 uid="{_uid(nome)}"]', ""]

    for er in ext_resources:
        out.append(f'[ext_resource type="{er["type"]}" path="{er["path"]}" id="{er["id"]}"]')
    if ext_resources:
        out.append("")

    for sr in sub_resources:
        out.append(f'[sub_resource type="{sr["type"]}" id="{sr["id"]}"]')
        out.append(sr["props"])
        out.append("")

    # Nó raiz
    root_name = _pascal(nome)
    out.append(f'[node name="{root_name}" type="{raiz}"]')
    if script:
        out.append(f'script = ExtResource("{ext_resources[0]["id"]}")')
    if is_ui:
        out += ["layout_mode = 3", "anchors_preset = 15", "anchor_right = 1.0", "anchor_bottom = 1.0"]
    out.append("")

    if is_ui and filhos:
        # Filhos UI dentro de VBoxContainer
        out.append('[node name="VBoxContainer" type="VBoxContainer" parent="."]')
        out += [
            "layout_mode = 1", "anchors_preset = 8",
            "anchor_left = 0.5", "anchor_top = 0.5",
            "anchor_right = 0.5", "anchor_bottom = 0.5",
            "offset_left = -150.0", "offset_top = -150.0",
            "offset_right = 150.0", "offset_bottom = 150.0",
        ]
        out.append("")
        for filho in filhos:
            out.append(f'[node name="{filho["nome"]}" type="{filho["tipo"]}" parent="VBoxContainer"]')
            if filho["tipo"] == "Label":
                out.append('text = ""')
            elif filho["tipo"] == "Button":
                label = filho["nome"].replace("Button", "").replace("Btn", "").strip()
                out.append(f'text = "{label}"')
            out.append("")
    else:
        for filho in filhos:
            out.append(f'[node name="{filho["nome"]}" type="{filho["tipo"]}" parent="."]')
            if filho["tipo"] == "CollisionShape2D":
                out.append('shape = SubResource("RectShape1")')
            out.append("")

        # Auto-adiciona visual e CollisionShape2D para corpos físicos
        tipos_filhos = [f["tipo"] for f in filhos]
        if is_physics:
            if "Sprite2D" not in tipos_filhos and "Polygon2D" not in tipos_filhos:
                if usa_assets:
                    out.append('[node name="Sprite2D" type="Sprite2D" parent="."]')
                else:
                    # Placeholder colorido — cor varia por nome da cena
                    _cores = {
                        "player": ("PackedVector2Array(0, -20, 16, 16, -16, 16)", "Color(0.2, 0.8, 1.0, 1.0)"),
                        "enemy":  ("PackedVector2Array(-16, -16, 16, -16, 16, 16, -16, 16)", "Color(1.0, 0.2, 0.2, 1.0)"),
                        "power":  ("PackedVector2Array(0,-14, 5,-5, 14,-5, 7,3, 10,14, 0,8, -10,14, -7,3, -14,-5, -5,-5)", "Color(0.2, 1.0, 0.4, 1.0)"),
                        "bullet": ("PackedVector2Array(0, -6, 4, 0, 0, 6, -4, 0)", "Color(1.0, 1.0, 0.2, 1.0)"),
                    }
                    poly, cor = next(
                        (v for k, v in _cores.items() if k in nome.lower()),
                        ("PackedVector2Array(-12, -12, 12, -12, 12, 12, -12, 12)", "Color(0.8, 0.8, 0.8, 1.0)")
                    )
                    out.append('[node name="Shape" type="Polygon2D" parent="."]')
                    out.append(f"polygon = {poly}")
                    out.append(f"color = {cor}")
                out.append("")
            if "CollisionShape2D" not in tipos_filhos:
                out.append('[node name="CollisionShape2D" type="CollisionShape2D" parent="."]')
                out.append('shape = SubResource("RectShape1")')
                out.append("")

    return "\n".join(out).rstrip() + "\n"
