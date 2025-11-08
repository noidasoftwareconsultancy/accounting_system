import { useState, useCallback } from 'react';

const useFormValidation = (validationSchema = {}) => {
  const [errors, setErrors] = useState({});

  const validateField = useCallback((fieldName, value, customRules = {}) => {
    const rules = customRules[fieldName] || validationSchema[fieldName] || {};
    let error = '';

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      error = rules.requiredMessage || 'This field is required';
    }

    // Numeric validation
    if (rules.numeric && value && isNaN(Number(value))) {
      error = rules.numericMessage || 'Please enter a valid number';
    }

    // Min value validation
    if (rules.min !== undefined && value && Number(value) < rules.min) {
      error = rules.minMessage || `Value must be at least ${rules.min}`;
    }

    // Max value validation
    if (rules.max !== undefined && value && Number(value) > rules.max) {
      error = rules.maxMessage || `Value must be at most ${rules.max}`;
    }

    // Email validation
    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = rules.emailMessage || 'Please enter a valid email';
    }

    // Custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value);
      if (customError) error = customError;
    }

    return error;
  }, [validationSchema]);

  const validate = useCallback((formData, customSchema = {}) => {
    const schema = Object.keys(customSchema).length > 0 ? customSchema : validationSchema;
    const newErrors = {};
    let isValid = true;

    Object.keys(schema).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName], schema);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [validationSchema, validateField]);

  const validateSingleField = useCallback((fieldName, value, customRules = {}) => {
    const error = validateField(fieldName, value, customRules);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return !error;
  }, [validateField]);

  const clearError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    validateField: validateSingleField,
    clearError,
    clearAllErrors,
    setErrors
  };
};

export default useFormValidation;
