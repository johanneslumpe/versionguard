import { Either, left, right } from 'fp-ts/lib/Either';
import { VersionGuardError } from '../../errors';
import { emphasize } from '../../utils';

const ONE_DAY = 1000 * 60 * 60 * 24;

export function getGracePeriodValue(
  str: string | number,
): Either<VersionGuardError, number> {
  if (typeof str === 'number') {
    return right(str);
  }
  const parsedNumber = Number(str);
  if (!isNaN(parsedNumber)) {
    return right(parsedNumber);
  }
  // user might have used a day configuration value
  const days = str.match(/^(\d+)d$/);
  if (!days) {
    return left(
      VersionGuardError.from(emphasize`${str} is not a valid grace period`),
    );
  }
  return right(parseInt(days[1], 10) * ONE_DAY);
}
