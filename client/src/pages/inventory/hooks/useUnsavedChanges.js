import { useEffect, useCallback } from 'react';

const useUnsavedChanges = (isDirty, message = 'You have unsaved changes. Are you sure you want to leave?') => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  const confirmNavigation = useCallback(() => {
    if (isDirty) {
      return window.confirm(message);
    }
    return true;
  }, [isDirty, message]);

  return { confirmNavigation };
};

export default useUnsavedChanges;
