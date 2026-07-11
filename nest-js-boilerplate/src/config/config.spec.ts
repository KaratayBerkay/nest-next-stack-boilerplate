import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import Joi from 'joi';
import { ConfigDemoService } from './config-demo.service';
import databaseConfig from './database.config';
import { validationOptions, validationSchema } from './env.validation';

// Proves the two Configuration sub-features still TODO on the checklist: namespaced config
// (registerAs + typed ConfigType access) and Joi schema validation (reject + defaults).
describe('Configuration (namespaces + validation)', () => {
  describe('namespaced config (registerAs)', () => {
    const ORIGINAL = { ...process.env };

    afterEach(() => {
      process.env = { ...ORIGINAL };
    });

    it('exposes a namespace through both typed injection and ConfigService', async () => {
      process.env.DATABASE_HOST = 'db.example.com';
      process.env.DATABASE_PORT = '6543';
      process.env.DATABASE_URL =
        'postgresql://user:pass@db.example.com:6543/mydb';
      process.env.JWT_SECRET = 'test-jwt-secret-1234';
      process.env.CSRF_SECRET = 'test-csrf-secret-1234';

      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            load: [databaseConfig],
            validationSchema,
            validationOptions,
          }),
        ],
        providers: [ConfigDemoService],
      }).compile();

      const svc = moduleRef.get(ConfigDemoService);
      expect(svc.getHostTyped()).toBe('db.example.com');
      expect(svc.getPortTyped()).toBe(6543); // typed access coerces to number
      expect(svc.getHostViaService()).toBe('db.example.com');
    });
  });

  describe('Joi validationSchema', () => {
    it('aborts boot when a required env var is missing', async () => {
      await expect(
        Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              ignoreEnvFile: true,
              validationSchema: Joi.object({
                MUST_EXIST: Joi.string().required(),
              }),
              validationOptions: { allowUnknown: true },
            }),
          ],
        }).compile(),
      ).rejects.toThrow(/MUST_EXIST/);
    });

    it('fills absent optional vars from Joi defaults', async () => {
      delete process.env.FEATURE_FLAG;

      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            validationSchema: Joi.object({
              FEATURE_FLAG: Joi.string().default('on'),
            }),
            validationOptions: { allowUnknown: true },
          }),
        ],
      }).compile();

      const cfg = moduleRef.get(ConfigService);
      expect(cfg.get('FEATURE_FLAG')).toBe('on');
    });
  });
});
