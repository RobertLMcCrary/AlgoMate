'use client';

export default function NotesSection({ notes, setNotes, saveNotes, isSaving }) {
    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Notes</h2>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 rounded border border-gray-700 text-gray-200 bg-gray-800 resize-none"
                placeholder="Write your notes here..."
                rows="10"
            />
            <button
                onClick={saveNotes}
                disabled={isSaving}
                className="mt-2 px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-600 transition disabled:opacity-50"
            >
                {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Saving...
                    </span>
                ) : (
                    'Save Notes'
                )}
            </button>
        </div>
    );
}
