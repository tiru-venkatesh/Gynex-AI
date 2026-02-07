import { useState } from "react";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("http://localhost:8000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    alert("Signup successful. Now login.");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={submit} className="space-y-3 w-64">
        <h1 className="text-xl font-bold">Signup</h1>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
        />

        <button className="bg-black text-white w-full p-2">
          Create Account
        </button>
      </form>
    </div>
  );
}
