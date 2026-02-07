const AI_BASE_URL = import.meta.env.VITE_AI_URL;

export async function askQuestion(question: string) {
  const res = await fetch(`${AI_BASE_URL}/ask`, {
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
