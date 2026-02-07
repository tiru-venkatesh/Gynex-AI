import { API_BASE_URL } from "./config";

export async function askQuestion(question: string) {
  const res = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  if (!res.ok) {
    throw new Error("Ask failed");
  }

  return res.json();
}
