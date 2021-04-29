import { ValidationError } from 'class-validator';
import { EventException } from '../exceptions/event.exception';

export function exceptionFactoryValidation(validationErrors: ValidationError[]): EventException {
  const errors: string[] = validationErrors.reduce((acc, curr) => [...acc, ...Object.values(curr.constraints)], []);
  return new EventException('validation error', { errors });
}
