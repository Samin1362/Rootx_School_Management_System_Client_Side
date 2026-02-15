import { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

const FirebaseStatus = () => {
  const [status, setStatus] = useState('checking');
  const [missingVars, setMissingVars] = useState([]);

  useEffect(() => {
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    const missing = requiredVars.filter(varName => !import.meta.env[varName]);

    if (missing.length === 0) {
      setStatus('success');
    } else {
      setStatus('error');
      setMissingVars(missing);
    }
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  if (status === 'success') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg max-w-sm z-50">
        <div className="flex items-center gap-2 text-green-700">
          <FaCheckCircle className="text-lg" />
          <div>
            <p className="font-semibold text-sm">Firebase Connected</p>
            <p className="text-xs text-green-600">
              Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md z-50">
        <div className="flex items-start gap-3">
          <FaTimesCircle className="text-red-500 text-xl mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-800 mb-1">
              Firebase Configuration Error
            </p>
            <p className="text-xs text-red-600 mb-2">
              Missing environment variables:
            </p>
            <ul className="text-xs text-red-600 space-y-1 mb-3">
              {missingVars.map(varName => (
                <li key={varName} className="font-mono">• {varName}</li>
              ))}
            </ul>
            <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
              <p className="font-semibold mb-1">Fix:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check if <code className="bg-red-200 px-1 rounded">.env.local</code> exists</li>
                <li>Restart the dev server</li>
                <li>Hard refresh browser (Ctrl+Shift+R)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FirebaseStatus;
