import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);
  
  // API URL for error logging
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const handleError = useCallback(async (error) => {
    console.error('Application Error:', error);
    
    let userMessage = 'An unexpected error occurred. Please try again.';
    
    // Handle specific error cases
    if (error.message.includes('user rejected transaction')) {
      userMessage = 'Transaction rejected by user.';
    } else if (error.message.includes('insufficient funds')) {
      userMessage = 'Insufficient funds for transaction.';
    } else if (error.message.includes('execution reverted')) {
      const reason = error.message.split('execution reverted: ')[1] || '';
      userMessage = `Transaction failed: ${reason}`;
    } else if (error.message.includes('underlying network changed')) {
      userMessage = 'Network changed. Please switch back to the correct network.';
    } else if (error.code === 4001) {
      userMessage = 'Request rejected by user.';
    } else if (error.code === -32603) {
      userMessage = 'Internal JSON-RPC error. Please try again later.';
    }
    
    // Add to error log
    const newError = {
      id: Date.now(),
      message: error.message,
      userMessage,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    setErrors(prev => [newError, ...prev.slice(0, 9)]);
    
    // Log error to backend API
    try {
      await fetch(`${API_URL}/errors/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          userMessage,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (logError) {
      console.error('Failed to log error to backend:', logError);
    }
    
    // Show toast notification
    toast.error(userMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  const clearError = (id) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, handleError, clearError, clearAllErrors }}>
      {children}
      <ToastContainer />
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
