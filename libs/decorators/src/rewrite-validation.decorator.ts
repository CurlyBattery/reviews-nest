import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';
import { SetMetadata } from '@nestjs/common';
import { REWRITE_VALIDATION_OPTIONS } from '@app/decorators/constants';

export function RewriteValidationOptions(options: ValidatorOptions) {
  return SetMetadata(REWRITE_VALIDATION_OPTIONS, options);
}
