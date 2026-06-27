"use client";

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface TopicFilterProps {
  topics: Topic[];
  selectedTopic: string | null;
  onSelect: (slug: string | null) => void;
}

export function TopicFilter({ topics, selectedTopic, onSelect }: TopicFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedTopic === null
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        All
      </button>
      {topics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelect(topic.slug)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTopic === topic.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {topic.name}
        </button>
      ))}
    </div>
  );
}
