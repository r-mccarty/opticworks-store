import{r,c3 as u}from"./index-CqaD8P5c.js";/**
   * react-table
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */function p(t,e){return t?f(t)?r.createElement(t,e):t:null}function f(t){return l(t)||typeof t=="function"||i(t)}function l(t){return typeof t=="function"&&(()=>{const e=Object.getPrototypeOf(t);return e.prototype&&e.prototype.isReactComponent})()}function i(t){return typeof t=="object"&&typeof t.$$typeof=="symbol"&&["react.memo","react.forward_ref"].includes(t.$$typeof.description)}function S(t){const e={state:{},onStateChange:()=>{},renderFallbackValue:null,...t},[n]=r.useState(()=>({current:u(e)})),[o,s]=r.useState(()=>n.current.initialState);return n.current.setOptions(c=>({...c,...t,state:{...o,...t.state},onStateChange:a=>{s(a),t.onStateChange==null||t.onStateChange(a)}})),n.current}export{p as f,S as u};
