import { Test, TestingModule } from '@nestjs/testing';
import { BodyCompositionCalculator, BodyMetricsInput } from './body-composition.calculator';

describe('BodyCompositionCalculator', () => {
  let service: BodyCompositionCalculator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BodyCompositionCalculator],
    }).compile();

    service = module.get<BodyCompositionCalculator>(BodyCompositionCalculator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('BMI Calculation', () => {
    it('should calculate BMI correctly', () => {
      const input: BodyMetricsInput = {
        gender: 'male',
        age: 25,
        weight: 80,
        height: 180,
      };
      const result = service.calculate(input);
      expect(result.bmi).toBeDefined();
      expect(result.bmi.value).toBeCloseTo(24.69, 2); // 80 / 1.8^2
      expect(result.bmi.status).toBe('Normopeso');
    });
  });

  describe('WHR Calculation', () => {
    it('should calculate WHR correctly', () => {
      const input: BodyMetricsInput = {
        gender: 'male',
        age: 25,
        waist: 80,
        hips: 95,
      };
      const result = service.calculate(input);
      expect(result.whr).toBeDefined();
      expect(result.whr.value).toBeCloseTo(0.84, 2); // 80 / 95
      expect(result.whr.status).toBe('Basso rischio');
    });
  });

  describe('Body Fat (Navy Method)', () => {
    it('should calculate Body Fat using Navy method for Male', () => {
      const input: BodyMetricsInput = {
        gender: 'male',
        age: 30,
        height: 178,
        waist: 85,
        neck: 38,
      };
      const result = service.calculate(input);
      expect(result.bodyFat).toBeDefined();
      expect(result.bodyFat.method).toBe('US Navy');
      // ~15-16% expected
      expect(result.bodyFat.value).toBeGreaterThan(10);
      expect(result.bodyFat.value).toBeLessThan(25);
    });
  });

  describe('Body Fat (Jackson-Pollock 3-Site)', () => {
    it('should calculate Body Fat using JP3 for Male', () => {
      const input: BodyMetricsInput = {
        gender: 'male',
        age: 25,
        skinfold_chest: 10,
        skinfold_abdominal: 15,
        skinfold_thigh: 12,
      };
      // Sum = 37
      // Manual calc approx 10.65%
      const result = service.calculate(input);
      expect(result.bodyFat).toBeDefined();
      expect(result.bodyFat.method).toBe('Jackson-Pollock 3');
      expect(result.bodyFat.value).toBeCloseTo(10.66, 1);
    });
  });

  describe('FFMI Calculation', () => {
    it('should calculate FFMI correctly', () => {
      // If we provide enough info for BF%, FFMI should be calc
      const input: BodyMetricsInput = {
        gender: 'male',
        age: 25,
        weight: 80,
        height: 180,
        skinfold_chest: 10,
        skinfold_abdominal: 15,
        skinfold_thigh: 12,
      };
      // BF ~ 10.66%
      // Lean Mass = 80 * (1 - 0.1066) = 71.472
      // FFMI = 71.472 / 1.8^2 = 22.05
      const result = service.calculate(input);
      expect(result.ffmi).toBeDefined();
      expect(result.ffmi.value).toBeCloseTo(22.06, 1);
      expect(result.ffmi.status).toBe('Sopra la media');
    });
  });
});
