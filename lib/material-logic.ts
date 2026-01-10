export interface MaterialCalculation {
  totalGramPerShot: number;
  gramPerUnit: number;
  kgPerThousand: number;
}

export const calculateMaterialLogic = (
  weightPart: number, 
  weightRunner: number, 
  cavity: number
): MaterialCalculation => {
  // Total satu kali tembak (Shot)
  const totalShot = weightPart + weightRunner;
  
  // Berat yang dibebankan ke satu pcs produk (Part + (Runner / Cavity))
  const gramPerUnit = weightPart + (weightRunner / cavity);
  
  // Estimasi kebutuhan untuk 1000 pcs (ditambah safety factor 3%) dalam Kg
  const kgPerThousand = (gramPerUnit * 1000 * 1.03) / 1000;

  return {
    totalGramPerShot: Number(totalShot.toFixed(2)),
    gramPerUnit: Number(gramPerUnit.toFixed(2)),
    kgPerThousand: Number(kgPerThousand.toFixed(3))
  };
};