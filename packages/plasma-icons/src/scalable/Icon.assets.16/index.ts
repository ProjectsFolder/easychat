import { Video } from './Video';
import { Lock } from './Icon.assets/Lock';

export const iconSet16 = {
    video: Video,
    lock: Lock,
};

export type IconSet16 = keyof typeof iconSet16;
