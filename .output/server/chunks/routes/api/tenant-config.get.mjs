import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const tenantConfig_get = defineEventHandler((event) => {
  return event.context.tenant;
});

export { tenantConfig_get as default };
//# sourceMappingURL=tenant-config.get.mjs.map
