"use client";

interface Source {
  name: string;
  url: string;
}

interface SourceFilterProps {
  sources: Source[];
  selectedSource: string | null;
  onSelect: (sourceUrl: string | null) => void;
}

export function SourceFilter({
  sources,
  selectedSource,
  onSelect,
}: SourceFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          selectedSource === null
            ? "bg-blue-600 text-white shadow-sm"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {sources.map((source) => (
        <button
          key={source.url}
          onClick={() => onSelect(source.url)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedSource === source.url
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {source.name
            .replace(" Engineering", "")
            .replace(" Tech Blog", "")
            .replace(" Dev Blogs", "")
            .replace(" Developers", "")
            .replace(" Research", "")}
        </button>
      ))}
    </div>
  );
}
