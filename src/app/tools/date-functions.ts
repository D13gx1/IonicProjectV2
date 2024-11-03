export function convertStringToDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  try {
    // Si es una fecha ISO
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) throw new Error('Fecha inválida');
      return date;
    }

    // Si es formato dd/mm/yyyy
    const parts = dateStr.split('/');
    if (parts.length !== 3) throw new Error('Formato incorrecto');

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Restamos 1 porque los meses van de 0-11
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    // Validar que la fecha es válida
    if (isNaN(date.getTime())) throw new Error('Fecha inválida');
    
    return date;
  } catch (error) {
    console.error('Error al convertir fecha:', error);
    throw new Error('El formato de la fecha debe ser "dd/mm/yyyy"');
  }
}

export function convertDateToString(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}