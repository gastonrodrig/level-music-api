export const getCurrentDate = () => {
  const cincoHoras = 5 * 60 * 60 * 1000;
  return new Date(Date.now() - cincoHoras);
}

export const getCurrentDateNormalized = () => {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 5);
  return currentDate.toISOString().split("T")[0] + "T00:00:00.000Z";
}