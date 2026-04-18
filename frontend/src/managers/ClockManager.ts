type Player = 'white' | 'black';
type TimeoutCallback = (player: Player) => void;

export class ClockManager {
  private times: Record<Player, number>;
  private increment: number;
  private active: Player | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timeoutCb: TimeoutCallback | null = null;
  private onTick: (() => void) | null = null;

  constructor(initialSeconds: number, incrementSeconds: number, tickCallback?: () => void) {
    this.times = { white: initialSeconds * 1000, black: initialSeconds * 1000 };
    this.increment = incrementSeconds * 1000;
    this.onTick = tickCallback || null;
  }

  start(player: Player) {
    this.stop();
    this.active = player;
    this.intervalId = setInterval(() => {
      if (!this.active) return;
      this.times[this.active] -= 100;
      this.onTick?.();
      if (this.times[this.active] <= 0) {
        this.times[this.active] = 0;
        this.stop();
        this.timeoutCb?.(this.active!);
      }
    }, 100);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.active = null;
  }

  switchTurn() {
    if (!this.active) return;
    const prev = this.active;
    this.addIncrement(prev);
    const next: Player = prev === 'white' ? 'black' : 'white';
    this.start(next);
  }

  addIncrement(player: Player) {
    this.times[player] += this.increment;
  }

  getRemainingTime(player: Player): number {
    return Math.max(0, this.times[player]);
  }

  onTimeout(callback: TimeoutCallback) {
    this.timeoutCb = callback;
  }

  getActive(): Player | null {
    return this.active;
  }

  destroy() {
    this.stop();
    this.timeoutCb = null;
    this.onTick = null;
  }
}
