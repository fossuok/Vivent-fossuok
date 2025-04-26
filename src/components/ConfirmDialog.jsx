export default function ConfirmDialog({ 
    isOpen, 
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel", 
    confirmButtonClass = "bg-red-600 hover:bg-red-700", 
    onConfirm, 
    onCancel 
  }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="mb-6 text-gray-600">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }
  