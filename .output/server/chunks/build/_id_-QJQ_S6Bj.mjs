import { defineComponent, withAsyncContext, computed, mergeProps, unref, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { u as useRoute, _ as _export_sfc } from './server.mjs';
import { u as useTenant, a as useFetch } from './useTenant-CFdS_kXM.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "MortgageCalculator",
  __ssrInlineRender: true,
  props: {
    price: {}
  },
  setup(__props) {
    const props = __props;
    const deposit = ref(Math.round(props.price * 0.2));
    const result = ref(null);
    const loading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "calculator",
        "data-testid": "mortgage-calculator"
      }, _attrs))} data-v-c54058be><h3 data-v-c54058be>\u0130potek Hesaplay\u0131c\u0131</h3><label data-v-c54058be> Pe\u015Finat <input type="number" data-testid="calc-deposit"${ssrRenderAttr("value", unref(deposit))} data-v-c54058be></label><button class="cta-button" data-testid="calc-submit" data-v-c54058be> Hesapla </button>`);
      if (unref(loading)) {
        _push(`<p data-v-c54058be>Hesaplan\u0131yor\u2026</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(result)) {
        _push(`<p data-testid="calc-result" data-v-c54058be> Ayl\u0131k taksit: <strong data-v-c54058be>${ssrInterpolate(unref(result).monthlyPayment.toLocaleString("tr-TR"))} \u20BA</strong></p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MortgageCalculator.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-c54058be"]]);
const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<section${ssrRenderAttrs(mergeProps({
    class: "video-tour",
    "data-testid": "video-tour"
  }, _attrs))} data-v-337716bc><h3 data-v-337716bc>Video Turu</h3><div class="video-tour__player" data-testid="video-player" data-v-337716bc> \u25B6 Sanal tur oynat\u0131l\u0131yor (demo) </div></section>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VideoTour.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-337716bc"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const tenant = ([__temp, __restore] = withAsyncContext(() => useTenant()), __temp = await __temp, __restore(), __temp);
    const { data: property } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/property/${route.params.id}`,
      "$QRbehsULbY"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const hasCalculator = computed(() => {
      var _a;
      return (_a = tenant.value) == null ? void 0 : _a.capabilities.includes("mortgage_calculator");
    });
    const hasVideo = computed(() => {
      var _a;
      return (_a = tenant.value) == null ? void 0 : _a.capabilities.includes("video");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MortgageCalculator = __nuxt_component_0;
      const _component_VideoTour = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        style: { "padding": "32px" },
        "data-testid": "property-detail-page"
      }, _attrs))}>`);
      if (unref(property)) {
        _push(`<!--[--><h1 data-testid="property-title">${ssrInterpolate(unref(property).title)}</h1><p class="muted">${ssrInterpolate(unref(property).city)} \xB7 ${ssrInterpolate(unref(property).bedrooms)} oda</p><p class="price" data-testid="property-price">${ssrInterpolate(unref(property).price.toLocaleString("tr-TR"))} \u20BA </p><p>${ssrInterpolate(unref(property).description)}</p>`);
        if (unref(hasCalculator)) {
          _push(ssrRenderComponent(_component_MortgageCalculator, {
            price: unref(property).price
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(hasVideo)) {
          _push(ssrRenderComponent(_component_VideoTour, null, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<p data-testid="not-found">\u0130lan bulunamad\u0131.</p>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/property/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-QJQ_S6Bj.mjs.map
