import { API_BASE_URL } from "./config";

export async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}
