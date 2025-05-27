import { ref, watch } from 'vue';

export function useFormValidation() {
  const errors = ref<Record<string, string>>({});
  const isDirty = ref<Record<string, boolean>>({});
  const isFormValid = ref(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Minimum 8 characters, at least one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
  };

  const validateField = (fieldName: string, value: any, rules: Record<string, any>) => {
    // Mark field as dirty once validated
    isDirty.value[fieldName] = true;
    
    // Reset error for this field
    delete errors.value[fieldName];

    // Apply validation rules
    if (rules.email && !validateEmail(value)) {
      errors.value[fieldName] = 'Please enter a valid email address';
      return false;
    }

    if (rules.password && !validatePassword(value)) {
      errors.value[fieldName] = 'Password must be at least 8 characters with at least one letter and one number';
      return false;
    }
    
    if (rules.required && (!value || value.trim() === '')) {
      errors.value[fieldName] = 'Fields are required';
      return false;
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.value[fieldName] = `Minimum length is ${rules.minLength} characters`;
      return false;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.value[fieldName] = `Maximum length is ${rules.maxLength} characters`;
      return false;
    }

    if (rules.numeric && isNaN(Number(value))) {
      errors.value[fieldName] = 'Please enter a valid number';
      return false;
    }    if (rules.match && value !== (typeof rules.match.value === 'function' ? rules.match.value() : rules.match.value)) {
      errors.value[fieldName] = rules.match.message || 'Fields do not match';
      return false;
    }

    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value);
      if (customError) {
        errors.value[fieldName] = customError;
        return false;
      }
    }

    return true;
  };

  const validateForm = (formData: Record<string, any>, validationRules: Record<string, any>) => {
    let valid = true;
    
    // Validate each field in the form
    Object.keys(validationRules).forEach(fieldName => {
      const fieldValid = validateField(fieldName, formData[fieldName], validationRules[fieldName]);
      if (!fieldValid) valid = false;
    });
    
    isFormValid.value = valid;
    return valid;
  };

  const resetValidation = () => {
    errors.value = {};
    isDirty.value = {};
    isFormValid.value = false;
  };

  return {
    errors,
    isDirty,
    isFormValid,
    validateField,
    validateForm,
    resetValidation
  };
}
