export default class EventBus<T extends { [key: string]: Record<any, any> }> {
   private bus = new EventTarget();

   constructor() {
      this.subscribe = this.subscribe.bind(this);
      this.unsub = this.unsub.bind(this);
      this.trigger = this.trigger.bind(this);
   }

   subscribe<R extends keyof T>(channel: R, callback: (e: CustomEvent<T[R]>) => void) {
      this.bus.addEventListener(channel as string, callback as (e: Event) => void);
      return () => {
         this.bus.removeEventListener(channel as string, callback as (e: Event) => void);
      };
   }

   unsub<R extends keyof T>(channel: R, callback: (e: CustomEvent<T[R]>) => void) {
      this.bus.removeEventListener(channel as string, callback as (e: Event) => void);
   }

   trigger<R extends keyof T>(channel: R, detail: T[R]) {
      this.bus.dispatchEvent(new CustomEvent<T[R]>(channel as string, { detail }));
   }
}
