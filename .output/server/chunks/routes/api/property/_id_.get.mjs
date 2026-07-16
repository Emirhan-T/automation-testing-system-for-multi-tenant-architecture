import { d as defineEventHandler, g as getRouterParam, c as createError } from '../../../nitro/nitro.mjs';
import { p as properties } from '../../../_/properties.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _id__get = defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  const property = properties.find((p) => p.id === id);
  if (!property) {
    throw createError({ statusCode: 404, statusMessage: "Property not found" });
  }
  return property;
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
