export const getCurrentDate = () => {
  const cincoHoras = 5 * 60 * 60 * 1000;
  return new Date(Date.now() - cincoHoras);
}