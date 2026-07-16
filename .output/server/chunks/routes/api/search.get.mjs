import { d as defineEventHandler, a as getQuery } from '../../nitro/nitro.mjs';
import { p as properties } from '../../_/properties.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const search_get = defineEventHandler((event) => {
  const query = getQuery(event);
  const city = typeof query.city === "string" ? query.city.trim().toLowerCase() : "";
  const results = city ? properties.filter((p) => p.city.toLowerCase().includes(city)) : properties;
  return {
    results,
    totalCount: results.length,
    tenant: event.context.tenant.id
    // debug/gözlemlenebilirlik amaçlı
  };
});

export { search_get as default };
//# sourceMappingURL=search.get.mjs.map
