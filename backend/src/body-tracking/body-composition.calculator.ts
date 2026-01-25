import { Injectable } from '@nestjs/common';

export interface BodyCompositionResult {
  bmi?: { value: number; status: string };
  whr?: { value: number; status: string };
  whtr?: { value: number; status: string };
  bodyFat?: {
    navy?: number;
    jacksonPollock3?: number;
    jacksonPollock7?: number;
    value: number; // Best available
    method: string;
  };
  ffmi?: { value: number; status: string };
}

export interface BodyMetricsInput {
  gender: 'male' | 'female';
  age: number; // Required for skinfolds
  weight?: number; // kg
  height?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  neck?: number; // cm
  
  // Skinfolds (mm)
  skinfold_chest?: number;
  skinfold_midaxillary?: number;
  skinfold_tricep?: number;
  skinfold_subscapular?: number;
  skinfold_abdominal?: number;
  skinfold_suprailiac?: number;
  skinfold_thigh?: number;
}

@Injectable()
export class BodyCompositionCalculator {

  calculate(input: BodyMetricsInput): BodyCompositionResult {
    const result: BodyCompositionResult = {};

    // 1. BMI
    if (input.weight && input.height) {
      const heightM = input.height / 100;
      const bmi = input.weight / (heightM * heightM);
      result.bmi = {
        value: this.round(bmi),
        status: this.getBMIStatus(bmi)
      };
    }

    // 2. WHR (Waist-to-Hip)
    if (input.waist && input.hips) {
      const whr = input.waist / input.hips;
      result.whr = {
        value: this.round(whr),
        status: this.getWHRStatus(whr, input.gender)
      };
    }

    // 3. WHtR (Waist-to-Height)
    if (input.waist && input.height) {
      const whtr = input.waist / input.height;
      result.whtr = {
        value: this.round(whtr),
        status: this.getWHtRStatus(whtr)
      };
    }

    // 4. Body Fat
    const bfMethods: { navy?: number; jacksonPollock3?: number; jacksonPollock7?: number } = {};
    
    // Navy Method
    if (input.height && input.waist && input.neck) {
      if (input.gender === 'male') {
        // 86.010 * log10(abdomen - neck) - 70.041 * log10(height) + 36.76
        // Note: abdomen usually waist in this context
        if (input.waist > input.neck) {
           bfMethods.navy = 86.010 * Math.log10(input.waist - input.neck) - 70.041 * Math.log10(input.height) + 36.76;
        }
      } else if (input.hips) {
        // 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
        if ((input.waist + input.hips) > input.neck) {
          bfMethods.navy = 163.205 * Math.log10(input.waist + input.hips - input.neck) - 97.684 * Math.log10(input.height) - 78.387;
        }
      }
    }

    // Jackson-Pollock 3-Site
    // Men: Chest, Abdominal, Thigh
    // Women: Tricep, Suprailiac, Thigh
    if (input.age) {
        if (input.gender === 'male' && 
            input.skinfold_chest && input.skinfold_abdominal && input.skinfold_thigh) {
            const sum = input.skinfold_chest + input.skinfold_abdominal + input.skinfold_thigh;
            const bd = 1.10938 - (0.0008267 * sum) + (0.0000016 * sum * sum) - (0.0002574 * input.age);
            bfMethods.jacksonPollock3 = this.siriEquation(bd);
        } else if (input.gender === 'female' &&
            input.skinfold_tricep && input.skinfold_suprailiac && input.skinfold_thigh) {
            const sum = input.skinfold_tricep + input.skinfold_suprailiac + input.skinfold_thigh;
            const bd = 1.0994921 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * input.age);
            bfMethods.jacksonPollock3 = this.siriEquation(bd);
        }
    }

    // Jackson-Pollock 7-Site
    if (input.age && 
        input.skinfold_chest && input.skinfold_midaxillary && input.skinfold_tricep && 
        input.skinfold_subscapular && input.skinfold_abdominal && input.skinfold_suprailiac && 
        input.skinfold_thigh) {
        
        const sum = input.skinfold_chest + input.skinfold_midaxillary + input.skinfold_tricep + 
                    input.skinfold_subscapular + input.skinfold_abdominal + input.skinfold_suprailiac + 
                    input.skinfold_thigh;
        
        let bd = 0;
        if (input.gender === 'male') {
            bd = 1.112 - (0.00043499 * sum) + (0.00000055 * sum * sum) - (0.00028826 * input.age);
        } else {
            bd = 1.097 - (0.00046971 * sum) + (0.00000056 * sum * sum) - (0.00012828 * input.age);
        }
        bfMethods.jacksonPollock7 = this.siriEquation(bd);
    }

    // Select Best Body Fat Method (Priority: 7-site > 3-site > Navy)
    let selectedBf = null;
    let selectedMethod = '';

    if (bfMethods.jacksonPollock7) {
        selectedBf = bfMethods.jacksonPollock7;
        selectedMethod = 'Jackson-Pollock 7';
    } else if (bfMethods.jacksonPollock3) {
        selectedBf = bfMethods.jacksonPollock3;
        selectedMethod = 'Jackson-Pollock 3';
    } else if (bfMethods.navy) {
        selectedBf = bfMethods.navy;
        selectedMethod = 'US Navy';
    }

    if (selectedBf !== null) {
        result.bodyFat = {
            value: this.round(selectedBf),
            method: selectedMethod,
            ...bfMethods
        };

        // 5. FFMI (Fat-Free Mass Index)
        // FFMI = (Weight * (1 - BF%)) / Height^2
        // Normalized FFMI (for height > 1.8m) not implemented yet, using standard
        if (input.weight && input.height) {
            const heightM = input.height / 100;
            const leanMass = input.weight * (1 - (selectedBf / 100));
            const ffmi = leanMass / (heightM * heightM);
            // Normalized for height (optional but good for bodybuilders)
            // const normalizedFfmi = ffmi + 6.1 * (1.8 - heightM); 
            
            result.ffmi = {
                value: this.round(ffmi),
                status: this.getFFMIStatus(ffmi, input.gender)
            };
        }
    }

    return result;
  }

  private siriEquation(density: number): number {
    return (495 / density) - 450;
  }

  private round(val: number): number {
    return Math.round(val * 100) / 100;
  }

  private getBMIStatus(bmi: number): string {
    if (bmi < 18.5) return 'Sottopeso';
    if (bmi < 25) return 'Normopeso';
    if (bmi < 30) return 'Sovrappeso';
    return 'Obeso';
  }

  private getWHRStatus(whr: number, gender: 'male' | 'female'): string {
    if (gender === 'male') {
        if (whr < 0.9) return 'Basso rischio';
        if (whr < 1.0) return 'Rischio moderato';
        return 'Alto rischio';
    } else {
        if (whr < 0.8) return 'Basso rischio';
        if (whr < 0.85) return 'Rischio moderato';
        return 'Alto rischio';
    }
  }

  private getWHtRStatus(whtr: number): string {
      if (whtr < 0.4) return 'Troppo magro';
      if (whtr < 0.5) return 'Sano';
      if (whtr < 0.6) return 'Sovrappeso';
      return 'Obeso';
  }

  private getFFMIStatus(ffmi: number, gender: 'male' | 'female'): string {
      // Basic classification
      if (gender === 'male') {
          if (ffmi < 18) return 'Sotto la media';
          if (ffmi < 20) return 'Media';
          if (ffmi < 22) return 'Sopra la media';
          if (ffmi < 25) return 'Eccellente';
          return 'Superiore (possibile uso steroidi)';
      } else {
          if (ffmi < 13) return 'Sotto la media';
          if (ffmi < 15) return 'Media';
          if (ffmi < 17) return 'Sopra la media';
          if (ffmi < 19) return 'Eccellente';
          return 'Superiore';
      }
  }
}
