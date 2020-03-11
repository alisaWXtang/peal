// export function debounce (func, wait=500) {
//   var timer = null;
//   console.log(this,'this')
//   return function(){
//     clearTimeout(timer)
//     timer = setTimeout(()=>{
//       func()
//     },wait)
//   }

// }


// export function debounce(cb,ms){
//   var Timer = null;
//   console.log(this,'this')

//   return function(){
//     clearTimeout(Timer)  //清除以前的
//     Timer = setTimeout(()=>{   // 只留下最后一个事件被调用
//       cb()
//     },ms)
//   }
// }

// export function throttle(fn, wait, options = {}) {
//   let timer;
//   let previous = 0;
//   let throttled = function() {
//       let now = +new Date();
//       // remaining 不触发下一次函数的剩余时间
//       if (!previous && options.leading === false) previous = now;
//       let remaining = wait - (now - previous);
//       if (remaining < 0) {
//           if (timer) {
//               clearTimeout(timer);
//               timer = null;
//           }
//           previous = now;
//           fn.apply(this, arguments)
//       } else if (!timer && options.trailing !== false) {
//           timer = setTimeout(() => {
//               previous = options.leading === false ? 0 : new Date().getTime();
//               timer = null;
//               fn.apply(this, arguments);
//           }, remaining);
//       }
//   }
//   return throttled;
// }

export function debounce(fn, wait, immediate) {
  let timer;
  return function() {
      if (timer) clearTimeout(timer);
      if (immediate) {
          // 如果已经执行过，不再执行
          var callNow = !timer;
          timer = setTimeout(() => {
              timer = null;
          }, wait)
          if (callNow) {
              fn.apply(this, arguments)
          }
      } else {
          timer = setTimeout(() => {
              fn.apply(this, arguments)
          }, wait);
      }
  }
}
