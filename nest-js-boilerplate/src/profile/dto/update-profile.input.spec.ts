import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateProfileInput } from './update-profile.input';

// BE-034: register/login validate `timezone` with @IsTimeZone, but
// updateProfile accepted any string — and that value is persisted and
// hydrated into the Redis session snapshot, so it was the one unvalidated
// way to get an arbitrary string into a field every other path treats as
// an IANA zone.
describe('UpdateProfileInput.timezone', () => {
  it('accepts a real IANA zone', async () => {
    const dto = plainToInstance(UpdateProfileInput, {
      timezone: 'Europe/Istanbul',
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts an omitted timezone (partial update)', async () => {
    const dto = plainToInstance(UpdateProfileInput, { name: 'Ada' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects an arbitrary string', async () => {
    const dto = plainToInstance(UpdateProfileInput, {
      timezone: '<script>alert(1)</script>',
    });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toEqual(['timezone']);
    expect(errors[0].constraints).toHaveProperty('isTimeZone');
  });

  it('rejects a plausible-looking but non-existent zone', async () => {
    const dto = plainToInstance(UpdateProfileInput, {
      timezone: 'Mars/Olympus_Mons',
    });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toEqual(['timezone']);
  });
});
