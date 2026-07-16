import { d as defineEventHandler, c as createError, r as readBody } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const calculateMortgage_post = defineEventHandler(async (event) => {
  var _a;
  const tenant = event.context.tenant;
  if (!tenant.capabilities.includes("mortgage_calculator")) {
    throw createError({ statusCode: 403, statusMessage: "Capability not enabled for this tenant" });
  }
  const body = await readBody(event);
  const years = (_a = body.years) != null ? _a : 25;
  const principal = Math.max(body.price - body.deposit, 0);
  const annualRate = 0.035;
  const monthlyRate = annualRate / 12;
  const n = years * 12;
  const monthlyPayment = principal > 0 ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -n)) : 0;
  return {
    principal,
    years,
    monthlyPayment: Math.round(monthlyPayment)
  };
});

export { calculateMortgage_post as default };
//# sourceMappingURL=calculate-mortgage.post.mjs.map
