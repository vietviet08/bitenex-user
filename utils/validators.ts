export const validators = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone: string): boolean {
    const cleaned = phone.replaceAll(/\D/g, '');
    const phoneRegex = /^(0|84|\+84)?[3-9]\d{8,9}$/;
    return phoneRegex.test(cleaned);
  },

  isValidPassword(password: string): boolean {
    if (password.length < 8) return false;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUppercase && hasLowercase && hasNumber;
  },

  getPasswordErrors(password: string): string[] {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    return errors;
  },

  isRequired(value: string | null | undefined): boolean {
    return value !== null && value !== undefined && value.trim().length > 0;
  },

  minLength(value: string, min: number): boolean {
    return value.length >= min;
  },

  maxLength(value: string, max: number): boolean {
    return value.length <= max;
  },
};

export default validators;
