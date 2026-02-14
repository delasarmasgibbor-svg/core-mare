export default function Loading() {
    return (
        <div className="p-4 md:p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex gap-4 mb-8">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-96 bg-gray-100 rounded-xl border border-gray-200"></div>
                ))}
            </div>
        </div>
    );
}
