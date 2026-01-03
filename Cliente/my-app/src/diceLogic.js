export const splitTotalIntoTwoDice = (total) => {
  if (!total || total < 2 || total > 12) return [1, 1]; // Fallback de segurança

  // O dado 1 tem limites matemáticos dependendo do total
  // Ex: Se total é 11, o dado 1 NÃO pode ser 1, 2, 3 ou 4. Tem que ser no mínimo 5.
  const min = Math.max(1, total - 6);
  const max = Math.min(6, total - 1);

  const d1 = Math.floor(Math.random() * (max - min + 1)) + min;
  const d2 = total - d1;

  return [d1, d2];
};