import React from 'react';
import { useError } from '../context/ErrorContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ErrorConsole = () => {
  const { errors, clearError, clearAllErrors } = useError();
  
  if (errors.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-red-50 border border-red-200 rounded-lg shadow-xl z-50">
      <div className="flex justify-between items-center p-3 bg-red-100 border-b border-red-200 rounded-t-lg">
        <h3 className="font-semibold text-red-700 flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          Error Console ({errors.length})
        </h3>
        <button 
          onClick={clearAllErrors}
          className="text-red-500 hover:text-red-700"
        >
          Clear All
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-80">
        {errors.map((error) => (
          <div key={error.id} className="p-3 border-b border-red-100">
            <div className="flex justify-between">
              <p className="text-red-700 font-medium">{error.userMessage}</p>
              <button 
                onClick={() => clearError(error.id)}
                className="text-red-400 hover:text-red-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <p className="text-red-500 text-xs mt-1 truncate">{error.message}</p>
            <details className="mt-2">
              <summary className="text-xs text-red-400 cursor-pointer">Technical Details</summary>
              <pre className="text-xs text-red-500 bg-red-100 p-2 mt-1 rounded overflow-x-auto">
                {error.stack}
              </pre>
            </details>
          </div>
        ))}
      </div>
      
      <div className="p-2 text-center bg-red-50 text-xs text-red-500">
        These errors are only visible in development mode
      </div>
    </div>
  );
};

export default ErrorConsole;
