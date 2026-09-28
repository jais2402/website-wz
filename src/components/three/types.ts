/** One instance's target transform and colour weight. */
export interface InstanceState {
  x: number;
  y: number;
  z: number;
  /** Uniform scale. 0 hides the instance without unmounting it. */
  s: number;
  rx: number;
  ry: number;
  /** Index into the scene's hue list; -1 means the neutral model material. */
  hue: number;
}

export interface SceneState {
  instances: InstanceState[];
  /** Camera x offset, so the model sits opposite the reading column. */
  cameraX: number;
}

export type SceneKey =
  | 'workarounds'
  | 'disciplines'
  | 'intelligence'
  | 'onesystem'
  | 'principles'
  | 'range'
  | 'stages'
  | 'price'
  | 'since2012'
  | 'cases'
  | 'connected'
  | 'architecture'
  | 'questions'
  | 'start';
