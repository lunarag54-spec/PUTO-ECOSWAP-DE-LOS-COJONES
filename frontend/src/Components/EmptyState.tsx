interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ title, message, icon = "📦", actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-7xl mb-6 opacity-30">{icon}</div>
      <h3 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-xs">{message}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-8 bg-primary text-white px-6 py-3 rounded-2xl font-medium hover:bg-green-600 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;