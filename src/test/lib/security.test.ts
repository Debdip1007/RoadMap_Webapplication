import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  escapeHtml,
  rateLimiter
} from '../../lib/security';

describe('Security utilities', () => {
  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).toBe('scriptalert("xss")/scriptHello');
    });

    it('removes javascript protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeInput(input);
      expect(result).toBe('alert("xss")');
    });

    it('removes event handlers', () => {
      const input = 'onclick=alert("xss")';
      const result = sanitizeInput(input);
      expect(result).toBe('');
    });

    it('trims whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeInput(input);
      expect(result).toBe('hello world');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong password', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });

  describe('escapeHtml', () => {
    it('escapes HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const result = escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('escapes ampersands', () => {
      const input = 'Tom & Jerry';
      const result = escapeHtml(input);
      expect(result).toBe('Tom &amp; Jerry');
    });
  });

  describe('rateLimiter', () => {
    it('allows requests within limit', () => {
      const key = 'test-key';
      expect(rateLimiter.isAllowed(key, 3, 1000)).toBe(true);
      expect(rateLimiter.isAllowed(key, 3, 1000)).toBe(true);
      expect(rateLimiter.isAllowed(key, 3, 1000)).toBe(true);
    });

    it('blocks requests exceeding limit', () => {
      const key = 'test-key-2';
      expect(rateLimiter.isAllowed(key, 2, 1000)).toBe(true);
      expect(rateLimiter.isAllowed(key, 2, 1000)).toBe(true);
      expect(rateLimiter.isAllowed(key, 2, 1000)).toBe(false);
    });

    it('resets rate limit', () => {
      const key = 'test-key-3';
      rateLimiter.isAllowed(key, 1, 1000);
      rateLimiter.isAllowed(key, 1, 1000); // Should be blocked
      
      rateLimiter.reset(key);
      expect(rateLimiter.isAllowed(key, 1, 1000)).toBe(true);
    });
  });
});