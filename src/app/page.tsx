export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FFF0E6]">
      <div className="relative max-w-xl w-full p-10 rounded-2xl shadow-lg flex flex-col items-center text-center overflow-hidden" style={{ background: '#FFF0E6', borderRadius: '24px' }}>
        {/* Organic shapes */}
        <div className="absolute right-6 top-6 w-24 h-24 bg-[#FFB366] rounded-full opacity-30 blur-2xl z-0" />
        <div className="absolute left-6 bottom-6 w-16 h-16 bg-[#FF8C42] rounded-full opacity-20 blur-2xl z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl mb-4">🥦</div>
          <h1 className="text-4xl font-bold mb-2 text-[#4A5D52] font-display">GroShare</h1>
          <p className="text-xl text-[#4A5D52]/80 mb-6 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            Grocery shopping, <span className="text-[#FF8C42] font-bold">together</span>.<br />
            <span className="text-[#6B8068]">Share, plan, and shop as a team—real-time, fun, and stress-free!</span>
          </p>
          <a
            href="/auth"
            className="inline-block bg-[#6B8068] text-white px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-[#4A5D52] transition"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            🚀 Get Started
          </a>
        </div>
      </div>
    </main>
  );
}
