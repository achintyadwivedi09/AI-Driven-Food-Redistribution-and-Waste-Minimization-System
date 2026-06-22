export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 animate-pulse"
        >
          <div className="h-3 w-24 bg-gray-700 rounded mb-3" />
          <div className="h-8 w-32 bg-gray-700 rounded mb-2" />
          <div className="h-3 w-16 bg-gray-700/50 rounded" />
        </div>
      ))}
    </>
  );
}
