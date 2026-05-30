const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function sendMessage({ userId, message, sprintContext = "" }) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      message,
      sprint_context: sprintContext,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erro ao contactar o agente.");
  }

  return response.json();
}
