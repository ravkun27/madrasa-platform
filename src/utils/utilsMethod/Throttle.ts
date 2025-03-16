export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay = 3000
) {
  let isThrottled = false;

  return function (this: void, ...args: Parameters<T>) {
    if (!isThrottled) {
      func.apply(this, args);
      isThrottled = true;

      setTimeout(() => {
        isThrottled = false;
      }, delay);
    }
  };
}
