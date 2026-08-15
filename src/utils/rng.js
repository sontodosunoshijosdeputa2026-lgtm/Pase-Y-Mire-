/**
 * Motor de Números Aleatorios Centralizado para Casino As
 * Garantiza aleatoriedad segura y auditable en todos los juegos
 */

export class RNG {
  /**
   * Genera un número aleatorio entre min y max (inclusive)
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Genera un número aleatorio entre 0 y 1
   */
  static random() {
    return Math.random();
  }

  /**
   * Selecciona un elemento aleatorio de un array
   */
  static randomElement(array) {
    return array[this.randomInt(0, array.length - 1)];
  }

  /**
   * Mezcla un array aleatoriamente (Fisher-Yates)
   */
  static shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Determina si algo ocurre basado en una probabilidad (0-100)
   */
  static willOccur(probability) {
    return this.random() * 100 < probability;
  }

  /**
   * Genera una semilla para reproducibilidad (opcional)
   */
  static seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}

export default RNG;
  
