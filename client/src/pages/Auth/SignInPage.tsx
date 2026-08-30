import { SignIn } from "@clerk/react";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <SignIn />
    </main>
  );
}