const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-3xl shadow overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;