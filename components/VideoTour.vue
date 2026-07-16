<template>
  <section class="video-tour" data-testid="video-tour">
    <h3>Video Turu</h3>
    <div class="video-tour__player" data-testid="video-player">
      ▶ Sanal tur oynatılıyor (demo)
    </div>
  </section>
</template>

<style scoped>
.video-tour {
  margin-top: 24px;
}
.video-tour__player {
  aspect-ratio: 16 / 9;
  background: #111;
  color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius, 8px);
}
</style>
