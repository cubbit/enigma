import {realpathSync} from 'fs';
import * as path from 'path';

export const app_dir = realpathSync(process.cwd());
export const resolve_app = (rel_path: string) => {
    const p = path.resolve(app_dir, rel_path);
    console.log(p);
    return p;
}
