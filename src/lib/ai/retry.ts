/**
 * Retry Logic with Exponential Backoff and Timeout Handling
 * Provides robust error handling for AI API calls
 */

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeout: number;
  retryableErrors: string[];
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  totalDuration: number;
}

// Default retry configuration for AI requests
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  timeout: 120000, // 2 minutes
  retryableErrors: [
    'RATE_LIMIT_EXCEEDED',
    'SERVICE_UNAVAILABLE',
    'TIMEOUT',
    'NETWORK_ERROR',
    'INTERNAL_ERROR',
    'QUOTA_EXCEEDED',
    'MODEL_OVERLOADED',
    '429', // Too Many Requests
    '500', // Internal Server Error
    '502', // Bad Gateway
    '503', // Service Unavailable
    '504', // Gateway Timeout
  ]
};

// High-priority retry config for paid operations
export const PRIORITY_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  initialDelay: 500,
  maxDelay: 60000, // 1 minute
  backoffMultiplier: 1.5,
  timeout: 300000, // 5 minutes
  retryableErrors: [
    ...DEFAULT_RETRY_CONFIG.retryableErrors,
    'TEMPORARY_FAILURE',
    'RESOURCE_EXHAUSTED',
  ]
};

// Sleep utility
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Check if error is retryable
const isRetryableError = (error: unknown, retryableErrors: string[]): boolean => {
  if (!error) return false;
  
  const errorMessage = String((error as Error)?.message || error?.toString?.() || '').toUpperCase();
  const errorCode = String((error as Record<string, unknown>)?.code || (error as Record<string, unknown>)?.status || '').toUpperCase();
  
  return retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError.toUpperCase()) ||
    errorCode.includes(retryableError.toUpperCase())
  );
};

// Calculate next delay with jitter to avoid thundering herd
const calculateNextDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number => {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (±25% random variation)
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.max(100, cappedDelay + jitter); // Minimum 100ms
};

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${finalConfig.timeout}ms`));
        }, finalConfig.timeout);
      });

      // Race between operation and timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);

      // Success case
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalDuration: Date.now() - startTime
      };

    } catch (error: unknown) {
      lastError = error;
      
      // Log the attempt
      console.warn(`AI operation attempt ${attempt}/${finalConfig.maxAttempts} failed:`, {
        error: (error as Error)?.message || 'Unknown error',
        attempt,
        duration: Date.now() - startTime
      });

      // Check if this is the last attempt
      if (attempt === finalConfig.maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, finalConfig.retryableErrors)) {
        console.error('Non-retryable error encountered:', error);
        break;
      }

      // Calculate delay for next attempt
      const delay = calculateNextDelay(
        attempt,
        finalConfig.initialDelay,
        finalConfig.maxDelay,
        finalConfig.backoffMultiplier
      );

      console.info(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${finalConfig.maxAttempts})`);
      
      // Wait before next attempt
      await sleep(delay);
    }
  }

  // All attempts failed
  return {
    success: false,
    error: (lastError as Error)?.message || 'Operation failed after all retry attempts',
    attempts: finalConfig.maxAttempts,
    totalDuration: Date.now() - startTime
  };
}

/**
 * Wrapper specifically for AI generation requests
 */
export async function withAIRetry<T>(
  operation: () => Promise<T>,
  isPriorityOperation = false
): Promise<RetryResult<T>> {
  const config = isPriorityOperation ? PRIORITY_RETRY_CONFIG : DEFAULT_RETRY_CONFIG;
  
  return withRetry(operation, config);
}

/**
 * Circuit breaker pattern for AI services
 */
export class AICircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly failureThreshold = 5,
    private readonly successThreshold = 2,
    private readonly timeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
      }
      // Try to recover
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN' && this.successCount >= this.successThreshold) {
      this.state = 'CLOSED';
      console.info('Circuit breaker recovered - state: CLOSED');
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error(`Circuit breaker triggered - state: OPEN (failures: ${this.failureCount})`);
    }
  }

  getState(): { state: string; failureCount: number; successCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}

// Global circuit breaker instance for AI services
export const aiCircuitBreaker = new AICircuitBreaker();

/**
 * Enhanced wrapper that combines retry logic with circuit breaker
 */
export async function withResilientAI<T>(
  operation: () => Promise<T>,
  config?: {
    retryConfig?: Partial<RetryConfig>;
    useCircuitBreaker?: boolean;
    isPriority?: boolean;
  }
): Promise<RetryResult<T>> {
  const { 
    useCircuitBreaker = true, 
    isPriority = false 
  } = config || {};

  const wrappedOperation = useCircuitBreaker 
    ? () => aiCircuitBreaker.execute(operation)
    : operation;

  return withAIRetry(wrappedOperation, isPriority);
}

/**
 * Timeout wrapper for any async operation
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Progress tracking for long-running operations
 */
export class ProgressTracker {
  private startTime = Date.now();
  private lastUpdate = Date.now();

  constructor(
    private readonly onProgress?: (progress: {
      step: string;
      percentage?: number;
      duration: number;
      eta?: number;
    }) => void
  ) {}

  update(step: string, percentage?: number): void {
    const now = Date.now();
    const duration = now - this.startTime;
    const eta = percentage && percentage > 0 
      ? Math.round((duration / percentage) * (100 - percentage))
      : undefined;

    this.lastUpdate = now;

    if (this.onProgress) {
      this.onProgress({
        step,
        percentage,
        duration,
        eta
      });
    }
  }

  complete(step = 'Completed'): void {
    this.update(step, 100);
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Rate limiter for AI API calls
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill = Date.now();

  constructor(
    private readonly capacity: number,
    private readonly refillRate: number, // tokens per second
    private readonly refillInterval = 1000 // ms
  ) {
    this.tokens = capacity;
  }

  async waitForToken(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait for next refill
    const waitTime = this.refillInterval;
    await sleep(waitTime);
    return this.waitForToken();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor((elapsed / 1000) * this.refillRate);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// Global rate limiter for AI operations (e.g., 10 requests per minute)
export const aiRateLimiter = new RateLimiter(10, 10 / 60); // 10 tokens, refill 1 every 6 seconds