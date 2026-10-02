"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p>Something went wrong while starting the application.</p>
          <a
            href="/"
            className="rounded-md bg-black px-4 py-2 text-white"
          >
            Return home
          </a>
        </main>
      </body>
    </html>
  );
}
