import grilloImg from './images/grillo_equipment_1791563135855.jpg';
import pettiboneImg from './images/pettibone_equipment_1791563160260.jpg';
import hysterImg from './images/hyster_equipment_1791563184962.jpg';
import terbergImg from './images/terberg_equipment_1791563207435.jpg';
import { EquipmentType } from '../types';

export const EQUIPMENT_IMAGES: Record<EquipmentType, string> = {
  grillo: grilloImg,
  pettibone: pettiboneImg,
  hyster: hysterImg,
  terberg: terbergImg,
  otro: terbergImg,
};

export { grilloImg, pettiboneImg, hysterImg, terbergImg };
