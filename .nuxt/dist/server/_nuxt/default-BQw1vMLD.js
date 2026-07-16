import { _ as __nuxt_component_0 } from "./nuxt-link-D4qPYPxo.js";
import { defineComponent, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from "vue/server-renderer";
import { u as useTenant } from "./useTenant-CFdS_kXM.js";
import { u as useRoute } from "../server.mjs";
import "/Users/emirhan/Downloads/neuron-demo/node_modules/ufo/dist/index.mjs";
import "/Users/emirhan/Downloads/neuron-demo/node_modules/defu/dist/defu.mjs";
import "/Users/emirhan/Downloads/neuron-demo/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "/Users/emirhan/Downloads/neuron-demo/node_modules/perfect-debounce/dist/index.mjs";
import "/Users/emirhan/Downloads/neuron-demo/node_modules/hookable/dist/index.mjs";
import "/Users/emirhan/Downloads/neuron-demo/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/emirhan/Downloads/neuron-demo/node_modules/unctx/dist/index.mjs";
import "/Users/emirhan/Downloads/neuron-demo/node_modules/h3/dist/index.mjs";
import "vue-router";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const tenant = ([__temp, __restore] = withAsyncContext(() => useTenant()), __temp = await __temp, __restore(), __temp);
    const route = useRoute();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: unref(tenant)?.theme,
        "data-testid": "tenant-root",
        "data-tenant-id": unref(tenant)?.id
      }, _attrs))}><header class="site-header">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: { path: "/", query: unref(route).query },
        class: "logo",
        "data-testid": "site-logo"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(tenant)?.brand.logoText)}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(tenant)?.brand.logoText), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="tagline">${ssrInterpolate(unref(tenant)?.brand.tagline)}</p></header><main>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="site-footer"><small>Demo tenant: ${ssrInterpolate(unref(tenant)?.id)} · theme: ${ssrInterpolate(unref(tenant)?.theme)}</small></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=default-BQw1vMLD.js.map
