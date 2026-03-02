# test_server.py
import os
from server import (
    carregar_tarefas,
    salvar_tarefas,
    _adicionar_tarefa as adicionar_tarefa,
    _concluir_tarefa as concluir_tarefa,
    _remover_tarefa as remover_tarefa,
    _buscar_por_prioridade as buscar_por_prioridade,
    _estatisticas_tarefas as estatisticas_tarefas,
    _criar_relatorio_semanal as criar_relatorio_semanal,
    _sugerir_priorizacao as sugerir_priorizacao,
    DB_FILE,
)

def setup_module(module):
    """Garante um DB limpo para os testes"""
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    salvar_tarefas([])

def test_fluxo_basico():
    """Teste do fluxo básico de operações"""
    print("\n🧪 Teste 1: Fluxo Básico")
    print("=" * 50)
    
    # Adiciona tarefa
    msg = adicionar_tarefa("Teste", "Descrição de teste", "alta")
    print(f"Adicionar tarefa: {msg}")
    assert "criada com sucesso" in msg
    
    tarefas = carregar_tarefas()
    assert len(tarefas) == 1
    assert tarefas[0]["titulo"] == "Teste"
    print(f"✅ Tarefa adicionada corretamente")
    
    # Conclui tarefa
    msg = concluir_tarefa(1)
    print(f"Concluir tarefa: {msg}")
    assert "marcada como concluída" in msg
    
    tarefas = carregar_tarefas()
    assert tarefas[0]["status"] == "concluída"
    print(f"✅ Tarefa concluída com sucesso")
    
    # Remove tarefa
    msg = remover_tarefa(1)
    print(f"Remover tarefa: {msg}")
    assert "removida com sucesso" in msg
    
    tarefas = carregar_tarefas()
    assert len(tarefas) == 0
    print(f"✅ Tarefa removida corretamente")

def test_interacao_ia_cenarios():
    """Teste dos cenários de interação com IA"""
    print("\n🧪 Teste 2: Cenários de Interação IA")
    print("=" * 50)
    
    # Limpa o banco
    salvar_tarefas([])
    
    # Cenário 1: Criando tarefas (simula comandos da IA)
    print("\n📝 Cenário 1: Criando tarefas")
    adicionar_tarefa("Revisar código", "Revisar PR #234 do backend", "alta")
    adicionar_tarefa("Escrever documentação", "Documentar API REST", "média")
    adicionar_tarefa("Reunião de planejamento", "Planning sprint Q1", "alta")
    adicionar_tarefa("Atualizar dependências", "Atualizar pacotes npm", "baixa")
    adicionar_tarefa("Code review", "Revisar PRs pendentes", "média")
    
    tarefas = carregar_tarefas()
    assert len(tarefas) == 5
    print(f"✅ 5 tarefas criadas com sucesso")
    
    # Marca algumas como concluídas
    concluir_tarefa(1)
    concluir_tarefa(2)
    print(f"✅ 2 tarefas marcadas como concluídas")
    
    # Cenário 2: Consultando estatísticas (resource)
    print("\n📊 Cenário 2: Consultando estatísticas")
    stats = estatisticas_tarefas()
    print(stats)
    assert "Total de tarefas: 5" in stats
    assert "✅ Concluídas: 2 (40.0%)" in stats
    assert "⏳ Pendentes: 3" in stats
    print(f"✅ Estatísticas retornadas corretamente")
    
    # Cenário 3: Usando prompt de relatório semanal
    print("\n📋 Cenário 3: Usando prompt de relatório semanal")
    prompt = criar_relatorio_semanal()
    assert "relatório semanal" in prompt.lower()
    assert "resumo de tarefas concluídas".lower() in prompt.lower()
    print(f"✅ Prompt de relatório gerado")
    print(f"Prompt: {prompt}")
    
    # Cenário 4: Busca por prioridade
    print("\n🔍 Cenário 4: Busca por prioridade")
    resultado = buscar_por_prioridade("alta")
    print(resultado)
    assert "Reunião de planejamento" in resultado
    print(f"✅ Busca por prioridade funcionando")
    
    # Cenário 5: Prompt de priorização
    print("\n🎯 Cenário 5: Sugestão de priorização")
    prompt_priorizacao = sugerir_priorizacao()
    assert "prioridade" in prompt_priorizacao.lower()
    assert "dependências" in prompt_priorizacao.lower()
    print(f"✅ Prompt de priorização gerado")
    print(f"Prompt: {prompt_priorizacao}")

def test_casos_erro():
    """Teste de casos de erro"""
    print("\n🧪 Teste 3: Casos de Erro")
    print("=" * 50)
    
    salvar_tarefas([])
    
    # Tenta concluir tarefa inexistente
    msg = concluir_tarefa(999)
    print(f"Concluir tarefa inexistente: {msg}")
    assert "não encontrada" in msg
    print(f"✅ Erro tratado corretamente para tarefa inexistente")
    
    # Tenta remover tarefa inexistente
    msg = remover_tarefa(999)
    print(f"Remover tarefa inexistente: {msg}")
    assert "não encontrada" in msg
    print(f"✅ Erro tratado corretamente para remoção")
    
    # Busca por prioridade sem resultados
    msg = buscar_por_prioridade("urgente")
    print(f"Buscar prioridade inexistente: {msg}")
    assert "Nenhuma tarefa encontrada" in msg
    print(f"✅ Busca sem resultados tratada corretamente")

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🚀 INICIANDO TESTES DO GESTOR DE TAREFAS")
    print("=" * 50)
    
    setup_module(None)
    
    try:
        test_fluxo_basico()
        test_interacao_ia_cenarios()
        test_casos_erro()
        
        print("\n" + "=" * 50)
        print("✅ TODOS OS TESTES PASSARAM COM SUCESSO!")
        print("=" * 50 + "\n")
    except AssertionError as e:
        print(f"\n❌ TESTE FALHOU: {e}\n")
    except Exception as e:
        print(f"\n❌ ERRO INESPERADO: {e}\n")
