import { Equipment } from '../types';

export const USER_FLEET_CODES = [
  // Grillos (Prefijo 20 - 5 equipos)
  '20-1607',
  '20-1608',
  '20-2209',
  '20-2412',
  '20-2413',

  // Pettibone (Prefijo 40 - 25 equipos)
  '40-1847',
  '40-1948',
  '40-1952',
  '40-2153',
  '40-2154',
  '40-2155',
  '40-2156',
  '40-2157',
  '40-2158',
  '40-2259',
  '40-2260',
  '40-2261',
  '40-2262',
  '40-2363',
  '40-2364',
  '40-2365',
  '40-2466',
  '40-2467',
  '40-2468',
  '40-2469',
  '40-2470',
  '40-2471',
  '40-2472',
  '40-2473',
  '40-2475',

  // Hyster (Prefijo 45 - 16 equipos)
  '45-0920',
  '45-1540',
  '45-1946',
  '45-1948',
  '45-2249',
  '45-2350',
  '45-2351',
  '45-2352',
  '45-2554',
  '45-2555',
  '45-2556',
  '45-2557',
  '45-2558',
  '45-2559',
  '45-2560',
  '45-2561',

  // TT / Terberg (Prefijo 50 - 26 equipos)
  '50-1325',
  '50-1642',
  '50-2045',
  '50-2046',
  '50-2147',
  '50-2148',
  '50-2250',
  '50-2252',
  '50-2253',
  '50-2254',
  '50-2355',
  '50-2356',
  '50-2357',
  '50-2358',
  '50-2359',
  '50-2360',
  '50-2361',
  '50-2563',
  '50-2564',
  '50-2565',
  '50-2566',
  '50-2567',
  '50-2568',
  '50-2569',
  '50-2570',
  '50-2571',
];

export function buildOfficialFleet(): Equipment[] {
  return USER_FLEET_CODES.map((code, index) => {
    const prefix = code.split('-')[0];
    let type: Equipment['type'] = 'otro';
    let brandModel = 'Equipo Industrial';
    let location = 'Patio Central';

    if (prefix === '20') {
      type = 'grillo';
      brandModel = 'Grillo Climber AWD Industrial';
      location = index % 2 === 0 ? 'Patio Norte' : 'Patio Central';
    } else if (prefix === '40') {
      type = 'pettibone';
      brandModel = 'Pettibone Cary-Lift Heavy Handler';
      location = index % 3 === 0 ? 'Muelle 1 - Descarga' : index % 3 === 1 ? 'Patio de Contenedores' : 'Taller Central';
    } else if (prefix === '45') {
      type = 'hyster';
      brandModel = 'Hyster Heavy Duty Container Forklift';
      location = index % 2 === 0 ? 'Almacén General' : 'Rampa de Carga';
    } else if (prefix === '50') {
      type = 'terberg';
      brandModel = 'Terberg YT Terminal Tractor';
      location = index % 3 === 0 ? 'Patio de Maniobras' : index % 3 === 1 ? 'Muelle Ro-Ro' : 'Terminal Portuaria';
    }

    // Default status: most are operational, a few under maintenance
    const status: Equipment['operationalStatus'] =
      code === '20-2412' || code === '40-2155' || code === '45-2351' || code === '50-2046'
        ? 'en_mantenimiento'
        : code === '40-2260' || code === '50-2358'
        ? 'en_espera'
        : 'operativo';

    return {
      id: `eq-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      code,
      prefix,
      type,
      brandModel,
      serialNumber: `SN-${code}-${1000 + index}`,
      location,
      operationalStatus: status,
      hoursOperating: 0,
      createdAt: '2025-01-10T08:00:00Z',
    };
  });
}
