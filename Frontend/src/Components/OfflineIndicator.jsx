import { useState, useEffect } from 'react';
import '../Styles/OfflineIndicator.css';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <div className="offline-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM5.354 4.646a.5.5 0 1 1 .708.708L8 7.293l1.938-1.939a.5.5 0 0 1 .708.708L8.707 8l1.939 1.938a.5.5 0 0 1-.708.708L8 8.707l-1.938 1.939a.5.5 0 0 1-.708-.708L7.293 8 5.354 6.062Z"/>
        </svg>
        <span>Offline Mode</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
