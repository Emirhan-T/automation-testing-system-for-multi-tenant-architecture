import { defineComponent, withAsyncContext, ref, computed, unref, mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc, u as useRoute } from './server.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-D4qPYPxo.mjs';
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

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SearchForm",
  __ssrInlineRender: true,
  emits: ["search"],
  setup(__props, { emit: __emit }) {
    const city = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: "search-form",
        "data-testid": "search-form"
      }, _attrs))} data-v-6019c250><input class="search-input" data-testid="search-input" type="text" placeholder="\u015Eehir ara (\xF6rn. \u0130stanbul)"${ssrRenderAttr("value", unref(city))} data-v-6019c250><button class="cta-button" data-testid="search-submit" type="submit" data-v-6019c250> Ara </button></form>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SearchForm.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-6019c250"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "PriceFilter",
  __ssrInlineRender: true,
  emits: ["apply"],
  setup(__props, { emit: __emit }) {
    const maxPrice = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "price-filter",
        "data-testid": "price-filter"
      }, _attrs))} data-v-89a9b522><input type="number" placeholder="Maks. fiyat" data-testid="filter-price-max"${ssrRenderAttr("value", unref(maxPrice))} data-v-89a9b522><button class="cta-button" data-testid="filter-apply" data-v-89a9b522> Filtrele </button></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PriceFilter.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-89a9b522"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "PropertyCard",
  __ssrInlineRender: true,
  props: {
    property: {}
  },
  setup(__props) {
    const route = useRoute();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: { path: `/property/${__props.property.id}`, query: unref(route).query },
        class: "property-card",
        "data-testid": "search-results-item"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="property-card__image" data-v-6a60fb65${_scopeId}></div><div class="property-card__body" data-v-6a60fb65${_scopeId}><h3 data-testid="property-card-title" data-v-6a60fb65${_scopeId}>${ssrInterpolate(__props.property.title)}</h3><p class="muted" data-v-6a60fb65${_scopeId}>${ssrInterpolate(__props.property.city)} \xB7 ${ssrInterpolate(__props.property.bedrooms)} oda</p><p class="price" data-testid="property-card-price" data-v-6a60fb65${_scopeId}>${ssrInterpolate(__props.property.price.toLocaleString("tr-TR"))} \u20BA </p></div>`);
          } else {
            return [
              createVNode("div", { class: "property-card__image" }),
              createVNode("div", { class: "property-card__body" }, [
                createVNode("h3", { "data-testid": "property-card-title" }, toDisplayString(__props.property.title), 1),
                createVNode("p", { class: "muted" }, toDisplayString(__props.property.city) + " \xB7 " + toDisplayString(__props.property.bedrooms) + " oda", 1),
                createVNode("p", {
                  class: "price",
                  "data-testid": "property-card-price"
                }, toDisplayString(__props.property.price.toLocaleString("tr-TR")) + " \u20BA ", 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-6a60fb65"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MapView",
  __ssrInlineRender: true,
  setup(__props) {
    const visible = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "map-section" }, _attrs))} data-v-f665e3eb><button class="cta-button" data-testid="map-toggle" data-v-f665e3eb>${ssrInterpolate(unref(visible) ? "Haritay\u0131 Gizle" : "Haritada G\xF6ster")}</button>`);
      if (unref(visible)) {
        _push(`<div class="map-placeholder" data-testid="map-container" data-v-f665e3eb> \u{1F5FA} Harita g\xF6sterimi (demo) </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MapView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-f665e3eb"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b;
    let __temp, __restore;
    const tenant = ([__temp, __restore] = withAsyncContext(() => useTenant()), __temp = await __temp, __restore(), __temp);
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/search",
      "$fxgfdZMW1e"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const results = ref((_b = (_a = data.value) == null ? void 0 : _a.results) != null ? _b : []);
    const maxPrice = ref(Infinity);
    async function onSearch(city) {
      const res = await $fetch("/api/search", { query: { city } });
      results.value = res.results;
    }
    function onFilterApply(price) {
      maxPrice.value = price;
    }
    const filteredResults = computed(
      () => results.value.filter((p) => p.price <= maxPrice.value)
    );
    const hasMap = computed(() => {
      var _a2;
      return (_a2 = tenant.value) == null ? void 0 : _a2.capabilities.includes("map");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SearchForm = __nuxt_component_0;
      const _component_PriceFilter = __nuxt_component_1;
      const _component_PropertyCard = __nuxt_component_2;
      const _component_MapView = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_SearchForm, { onSearch }, null, _parent));
      _push(ssrRenderComponent(_component_PriceFilter, { onApply: onFilterApply }, null, _parent));
      _push(`<section class="results-grid" data-testid="search-results" style="${ssrRenderStyle({ "padding": "0 32px 32px" })}"><!--[-->`);
      ssrRenderList(unref(filteredResults), (p) => {
        _push(ssrRenderComponent(_component_PropertyCard, {
          key: p.id,
          property: p
        }, null, _parent));
      });
      _push(`<!--]--></section>`);
      if (unref(hasMap)) {
        _push(`<div style="${ssrRenderStyle({ "padding": "0 32px 32px" })}">`);
        _push(ssrRenderComponent(_component_MapView, null, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(filteredResults).length === 0) {
        _push(`<p data-testid="empty-state" style="${ssrRenderStyle({ "padding": "0 32px" })}"> Sonu\xE7 bulunamad\u0131. </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BADtPF18.mjs.map
