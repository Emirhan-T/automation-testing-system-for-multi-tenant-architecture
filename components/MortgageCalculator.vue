<script setup lang="ts">
const props = defineProps<{ price: number }>()

const deposit = ref(Math.round(props.price * 0.2))
const result = ref<{ monthlyPayment: number } | null>(null)
const loading = ref(false)

async function calculate() {
  loading.value = true
  try {
    result.value = await $fetch('/api/calculate-mortgage', {
      method: 'POST',
      body: { price: props.price, deposit: deposit.value }
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="calculator" data-testid="mortgage-calculator">
    <h3>İpotek Hesaplayıcı</h3>
    <label>
      Peşinat
      <input
        type="number"
        data-testid="calc-deposit"
        v-model.number="deposit"
      />
    </label>
    <button class="cta-button" data-testid="calc-submit" @click="calculate">
      Hesapla
    </button>
    <p v-if="loading">Hesaplanıyor…</p>
    <p v-if="result" data-testid="calc-result">
      Aylık taksit: <strong>{{ result.monthlyPayment.toLocaleString('tr-TR') }} ₺</strong>
    </p>
  </section>
</template>

<style scoped>
.calculator {
  padding: 20px;
  border-radius: var(--radius, 8px);
  background: var(--color-surface, #f5f5f5);
  margin-top: 24px;
}
.calculator label {
  display: block;
  margin: 12px 0;
}
.calculator input {
  display: block;
  margin-top: 4px;
  padding: 8px;
  width: 100%;
  max-width: 240px;
}
</style>
