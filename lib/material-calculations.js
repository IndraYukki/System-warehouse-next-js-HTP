export const calculateMaterialRequirement = (qtyOrder, weightPart, weightRunner, cavity) => {
    const LOSS_PERCENT = 3; // Standar scrap/loss 3%
    
    // 1. Hitung berat per satu part (termasuk pembagian runner)
    const weightPerPcsGram = parseFloat(weightPart) + (parseFloat(weightRunner) / parseInt(cavity));
    
    // 2. Total kebutuhan dalam gram
    const totalGram = qtyOrder * weightPerPcsGram;
    
    // 3. Tambahkan estimasi loss/scrap
    const totalWithLossGram = totalGram * (1 + LOSS_PERCENT / 100);
    
    // 4. Konversi ke Kilogram (3 angka di belakang koma)
    const totalKg = (totalWithLossGram / 1000).toFixed(3);

    return {
        weightPerPcs: weightPerPcsGram.toFixed(2),
        totalKg: totalKg,
        lossAmount: (totalWithLossGram - totalGram).toFixed(2)
    };
};