import React, { useEffect } from "react";

// 防抖
export const debunce = (fn: Function, timer: number) => {
  let interval;
  return (...args) => {
    if (interval) clearTimeout(interval);
    interval = setTimeout(fn.bind(this, ...args), timer);
  };
};

/**
 * @public
 * @param {(Function)} fn
 * @param {number} [delay=0] Unit: ms.
 * @param {boolean} [debounce=false]
 *        true: If call interval less than `delay`, only the last call works.
 *        false: If call interval less than `delay, call works on fixed rate.
 * @return {(Function)} throttled fn.
 */

export function throttle(fn, delay = 0, debounce = false) {
  var currCall;
  var lastCall = 0;
  var lastExec = 0;
  var timer;
  var diff;
  var scope;
  var args;
  var debounceNextCall;

  function exec() {
    lastExec = new Date().getTime();
    timer = undefined;
    fn.apply(scope, args || []);
  }

  var cb = function (...cbArgs) {
    currCall = new Date().getTime();
    scope = this;
    args = cbArgs;
    var thisDelay = debounceNextCall || delay;
    var thisDebounce = debounceNextCall || debounce;
    debounceNextCall = null;
    diff = currCall - (thisDebounce ? lastCall : lastExec) - thisDelay;
    clearTimeout(timer);

    if (thisDebounce) {
      timer = setTimeout(exec, thisDelay);
    } else {
      if (diff >= 0) {
        exec();
      } else {
        timer = setTimeout(exec, -diff);
      }
    }

    lastCall = currCall;
  };
  /**
   * Clear throttle.
   * @public
   */

  cb["clear"] = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  /**
   * Enable debounce once.
   */

  cb["debounceNextCall"] = function (debounceDelay) {
    debounceNextCall = debounceDelay;
  };

  return cb;
}

/**
 * 检测是否在ref元素中点击，不是则进行回调
 * @param refObject 元素ref
 * @param callback 回调
 */
export function useClickOutside(
  refObject: React.RefObject<HTMLElement>,
  callback: () => void
) {
  const handleClickOutside = (e: MouseEvent) => {
    if (!refObject?.current?.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });
}

/**
 * 数字转汉字
 */
const chnNumToChar = [
  "零",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
];
const chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
const chnUnitChar = ["", "十", "百", "千"];
function SectionToChinese(section) {
  var strIns = "",
    chnStr = "";
  var unitPos = 0;
  var zero = true;
  while (section > 0) {
    var v = section % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        chnStr = chnNumChar[v] + chnStr;
      }
    } else {
      zero = false;
      strIns = chnNumToChar[v];
      strIns += chnUnitChar[unitPos];
      chnStr = strIns + chnStr;
    }
    unitPos++;
    section = Math.floor(section / 10);
  }
  return chnStr;
}
export function NumberToChinese(num) {
  var unitPos = 0;
  var strIns = "",
    chnStr = "";
  var needZero = false;

  if (num === 0) {
    return chnNumChar[0];
  }

  while (num > 0) {
    var section = num % 10000;
    if (needZero) {
      chnStr = chnNumChar[0] + chnStr;
    }
    strIns = SectionToChinese(section);
    strIns += section !== 0 ? chnUnitSection[unitPos] : chnUnitSection[0];
    chnStr = strIns + chnStr;
    needZero = section < 1000 && section > 0;
    num = Math.floor(num / 10000);
    unitPos++;
  }

  return chnStr;
}

/**
 * 汉字转数字
 */
const chnNumChar = {
  零: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};
const chnNameValue = {
  十: { value: 10, secUnit: false },
  百: { value: 100, secUnit: false },
  千: { value: 1000, secUnit: false },
  万: { value: 10000, secUnit: true },
  亿: { value: 100000000, secUnit: true },
};
export function ChineseToNumber(chnStr) {
  var rtn = 0;
  var section = 0;
  var number = 0;
  var secUnit = false;
  var str = chnStr.split("");

  for (var i = 0; i < str.length; i++) {
    var num = chnNumChar[str[i]];
    if (typeof num !== "undefined") {
      number = num;
      if (i === str.length - 1) {
        section += number;
      }
    } else {
      var unit = chnNameValue[str[i]].value;
      secUnit = chnNameValue[str[i]].secUnit;
      if (secUnit) {
        section = (section + number) * unit;
        rtn += section;
        section = 0;
      } else {
        section += number * unit;
      }
      number = 0;
    }
  }
  return rtn + section;
}

/**
 * 解析URL参数
 * 返回routeHash(#/xxx)和params对象
 */
const URL_PARAM_REGEXP = /\?([^#]+)(#[^?]+)\??(.*)/;
export const getRouteHashParams = (url: string) => {
  // str为？之后的参数部分字符串
  const match_result = URL_PARAM_REGEXP.exec(url);
  if (!match_result) {
    return { params: {} };
  }
  const [, bf_p, routeHash, af_p] = match_result;

  // arr每个元素都是完整的参数键值
  const bf_params_arr = bf_p.split("&");
  const af_params_arr = af_p.split("&");
  const splitKV = (arr) => {
    const r = {};
    for (let i = 0; i < arr.length; i++) {
      // item的两个元素分别为参数名和参数值
      const item = arr[i].split("=");
      r[item[0]] = item[1];
    }
    return r;
  };
  function getKey(k, s = "a") {
    if (!k) {
      return s === "a" ? this.af_p : this.bf_p;
    }
    let arr = [this.af_p, this.bf_p];
    if (s === "b") {
      arr.reverse();
    }
    const obj = arr.find((obj) => {
      return obj[k];
    });
    return obj[k];
  }
  const bf_params = splitKV(bf_params_arr);
  const af_params = splitKV(af_params_arr);
  // result为存储参数键值的集合
  const result = {
    routeHash,
    bf_params,
    af_params,
    params: { ...bf_params, ...af_params },
    getKey,
  };
  return result;
};
