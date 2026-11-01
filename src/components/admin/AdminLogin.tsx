"use client";

import { useState } from "react";
import { Alert, Button, Card, Label, PasswordInput } from "@/components/ui";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: new FormData(e.currentTarget).get("password") }),
    });
    if (res.ok) return location.reload();
    setError((await res.json().catch(() => null))?.error ?? "Login failed.");
    setBusy(false);
  }

  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <Card variant="elevated" padding="lg" title="Admin">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password" required>Password</Label>
            <PasswordInput id="password" name="password" size="lg" required autoFocus />
          </div>
          {error && <Alert variant="error">{error}</Alert>}
          <Button type="submit" size="lg" icon="log-in" loading={busy} animation="glow">
            Log in
          </Button>
        </form>
      </Card>
    </div>
  );
}
