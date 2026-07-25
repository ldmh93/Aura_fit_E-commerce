"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

/** Búsqueda por URL: el estado vive en la dirección, no en el componente. */
export function SearchBox({
  placeholder = "Buscar…",
  paramName = "q",
}: {
  placeholder?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(current);

  useEffect(() => setValue(current), [current]);

  useEffect(() => {
    if (value === current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(paramName, value);
      else params.delete(paramName);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, current, paramName, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:w-72">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-white/10 bg-steel py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-mist/70 focus:border-aura/60 focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
