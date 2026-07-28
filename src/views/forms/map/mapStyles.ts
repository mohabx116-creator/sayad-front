import { StyleSpecification } from 'maplibre-gl';

import osmBrightJson from './map-data/osm_bright.json';
import alidadeSmoothJson from './map-data/alidade_smooth.json';
import alidadeSmoothDarkJson from './map-data/alidade_smooth_dark.json';

const toStyleSpecification = (style: unknown): StyleSpecification => style as unknown as StyleSpecification;

export const mapStyles = {
  light: toStyleSpecification(alidadeSmoothJson),
  dark: toStyleSpecification(alidadeSmoothDarkJson),
  streets: toStyleSpecification(osmBrightJson)
} as const;
