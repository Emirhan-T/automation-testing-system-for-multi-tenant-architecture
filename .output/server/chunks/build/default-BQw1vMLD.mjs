import { _ as __nuxt_component_0 } from './nuxt-link-D4qPYPxo.mjs';
import { defineComponent, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { u as useTenant } from './useTenant-CFdS_kXM.mjs';
import { u as useRoute } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@vue/shared';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const tenant = ([__temp, __restore] = withAsyncContext(() => useTenant()), __temp = await __temp, __restore(), __temp);
    const route = useRoute();
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: (_a = unref(tenant)) == null ? void 0 : _a.theme,
        "data-testid": "tenant-root",
        "data-tenant-id": (_b = unref(tenant)) == null ? void 0 : _b.id
      }, _attrs))}><header class="site-header">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: { path: "/", query: unref(route).query },
        class: "logo",
        "data-testid": "site-logo"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2;
          if (_push2) {
            _push2(`${ssrInterpolate((_a2 = unref(tenant)) == null ? void 0 : _a2.brand.logoText)}`);
          } else {
            return [
              createTextVNode(toDisplayString((_b2 = unref(tenant)) == null ? void 0 : _b2.brand.logoText), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="tagline">${ssrInterpolate((_c = unref(tenant)) == null ? void 0 : _c.brand.tagline)}</p></header><main>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="site-footer"><small>Demo tenant: ${ssrInterpolate((_d = unref(tenant)) == null ? void 0 : _d.id)} \xB7 theme: ${ssrInterpolate((_e = unref(tenant)) == null ? void 0 : _e.theme)}</small></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-BQw1vMLD.mjs.map
