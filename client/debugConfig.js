export const DEBUG = {
  // 0 = OFF | 1 = ERROR | 2 = WARN | 3 = INFO | 4 = VERBOSE
  level: 3,

  // Topic switches (solo attivi se level > 0)
  serial: true,       // messaggi inviati/ricevuti dal controller Arduino
  battle: true,       // parametri battaglia single-player (hp, danno, attacchi)
  multiplayer: true,  // GameScene networking (hp, shoot, hit)

  // Frequenza massima log nei loop update() — in millisecondi
  updateThrottleMs: 2000,
};
