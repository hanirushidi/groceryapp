"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const COLORS = {
  darkGreen: "#4A5D52",
  mediumGreen: "#6B8068",
  warmOrange: "#FF8C42",
  peachBackground: "#FFF0E6",
  textPrimary: "#212529",
  textSecondary: "#6C757D",
};

type Product = {
  id?: string;
  code?: string;
  image_front_small_url?: string;
  product_name?: string;
  brands?: string;
  stores_tags?: string[];
  price?: number;
};

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
      <svg className="animate-spin h-8 w-8 text-[#6B8068]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  );
}

export default function MarketsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("milk");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&page=${page}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, [query, page]);

  return (
    <main className="min-h-screen bg-[#FFF0E6] pb-16">
      <section className="max-w-4xl mx-auto mt-8 mb-8 p-8 rounded-2xl shadow-lg flex flex-col items-center relative overflow-hidden" style={{ background: COLORS.darkGreen }}>
        <h1 className="text-4xl font-bold text-white mb-2 font-display">Market Products</h1>
        <p className="text-lg text-white/90 mb-4">Browse real products and prices from Open Food Facts</p>
        <form
          onSubmit={e => {
            e.preventDefault();
            setQuery(search);
          }}
          className="w-full max-w-xl flex gap-3 mb-2"
        >
          <input
            type="text"
            placeholder="Search for products (e.g., milk, bread, apple)"
            className="flex-1 px-5 py-3 rounded-xl border border-[#E9ECEF] bg-white text-lg text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#6B8068] transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            type="submit"
            className="bg-[#6B8068] text-white px-6 py-3 rounded-xl font-semibold text-lg shadow hover:bg-[#4A5D52] transition"
          >
            Search
          </button>
        </form>
      </section>
      <section className="max-w-4xl mx-auto px-4">
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            className="px-4 py-2 rounded bg-[#E9ECEF] text-[#6B8068] font-semibold disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-[#212529] font-medium">Page {page}</span>
          <button
            className="px-4 py-2 rounded bg-[#E9ECEF] text-[#6B8068] font-semibold disabled:opacity-50"
            onClick={() => setPage(p => p + 1)}
            disabled={products.length < 20}
          >
            Next
          </button>
        </div>
        {loading && products.length === 0 ? (
          <div className="text-center text-[#6C757D] py-12 text-lg">Loading...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-[#FFB366] flex items-center justify-center text-4xl">🛒</div>
            <div className="text-xl font-semibold mb-2" style={{ color: COLORS.textPrimary }}>No products found!</div>
            <div className="text-[#6C757D] mb-4">Try a different search term.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 relative">
            {loading && <Spinner />}
            {products.map(product => (
              <div key={product.id || product.code} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <Image
                  src={product.image_front_small_url || "/vercel.svg"}
                  alt={product.product_name || "Product"}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain rounded mb-2 bg-[#F8F9FA]"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/vercel.svg")}
                />
                <div className="font-semibold text-lg text-[#212529] text-center mb-1 truncate w-full" title={product.product_name}>{product.product_name || "Unnamed Product"}</div>
                <div className="text-[#6C757D] text-sm mb-1 text-center w-full truncate">{product.brands || "Unknown Brand"}</div>
                {product.stores_tags && product.stores_tags.length > 0 && (
                  <div className="text-xs text-[#6B8068] mb-1">{product.stores_tags.join(", ")}</div>
                )}
                {product.price ? (
                  <div className="text-[#FF6B35] font-bold text-base">${product.price}</div>
                ) : (
                  <div className="text-[#6C757D] text-base font-medium">Price: N/A</div>
                )}
                <a
                  href={`https://world.openfoodfacts.org/product/${product.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[#FF8C42] hover:underline text-sm"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
} 