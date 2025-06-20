export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-lg w-full p-8 bg-white rounded shadow text-center">
        <h1 className="text-4xl font-bold mb-4">GroShare</h1>
        <p className="mb-6 text-gray-600">Collaborate in real-time on shared grocery lists. Sign up or log in to get started!</p>
        <a
          href="/auth"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
        >
          Login / Sign Up
        </a>
      </div>
    </main>
  );
}
