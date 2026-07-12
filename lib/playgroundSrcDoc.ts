// Shared sandbox-iframe builders for running live @elitegrid/{react,vue,core}
// code in the browser. Originally lived inline in app/playground/page.tsx;
// extracted so components/docs/DocsLiveDemo.tsx can reuse the exact same
// proven Babel-transform + importmap + postMessage(RUN_CODE) pipeline instead
// of hand-rolling a second demo mechanism (see components/GridDemo.tsx +
// lib/gridDemoSrcDoc.ts for what that duplicate-maintenance trap looks like —
// don't repeat it here).

// Sandbox attribute used by every playground/docs iframe. No `allow-downloads`
// here (that's only needed by the landing page's GridDemo, for CSV export).
export const PLAYGROUND_SANDBOX = 'allow-scripts allow-same-origin allow-forms'

// ── Shared iframe CSS (used in React, Vue and vanilla sandboxes) ─────────────
// Theme-aware: light is the default, [data-theme='dark'] on <html> overrides —
// the host (page.tsx) sets this via a SET_THEME postMessage, mirroring how
// lib/gridDemoSrcDoc.ts themes the landing page's live demo iframe. Only the
// grid chrome + page background follow theme; the violet/error/brand accents
// stay identical in both (matches site convention elsewhere).
const IFRAME_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--pgf-bg);
    color: var(--pgf-text);
    transition: background 0.2s, color 0.2s;
  }
  :root {
    --pgf-bg: #ffffff; --pgf-text: #18181b; --pgf-muted: #71717a; --pgf-muted2: #a1a1aa;
    --pgf-surface: #f7f7f8; --pgf-overlay: rgba(255,255,255,0.97);
    --pgf-header-bg: #f7f7f8; --pgf-active-bg: #ececed;
    --pgf-striped: #fafafa; --pgf-border: rgba(0,0,0,0.08); --pgf-row-border: rgba(0,0,0,0.06);
    --pgf-skel-base: #ececed; --pgf-skel-hi: #e0e0e2; --pgf-fg-rgb: 0,0,0;
  }
  [data-theme='dark'] {
    --pgf-bg: #09090b; --pgf-text: #e4e4e7; --pgf-muted: #52525b; --pgf-muted2: #3f3f46;
    --pgf-surface: #111113; --pgf-overlay: rgba(9,9,11,0.97);
    --pgf-header-bg: #0d0d0f; --pgf-active-bg: #18181b;
    --pgf-striped: #0f0f11; --pgf-border: rgba(255,255,255,0.07); --pgf-row-border: rgba(255,255,255,0.04);
    --pgf-skel-base: #18181b; --pgf-skel-hi: #27272a; --pgf-fg-rgb: 255,255,255;
  }
  :root, body {
    --eg-primary: #7c3aed; --eg-primary-text: #ffffff;
    --eg-primary-light: rgba(124,58,237,0.08); --eg-primary-hover: #6d28d9;
    --eg-error: #f87171; --eg-error-text: #09090b;
    --eg-error-bg: rgba(248,113,113,0.08); --eg-surface: var(--pgf-surface);
    --eg-overlay-bg: var(--pgf-overlay); --eg-header-bg: var(--pgf-header-bg);
    --eg-header-text: var(--pgf-muted); --eg-header-border: 1px solid var(--pgf-border);
    --eg-header-active-bg: var(--pgf-active-bg); --eg-row-bg: var(--pgf-bg);
    --eg-row-striped-bg: var(--pgf-striped); --eg-row-border: 1px solid var(--pgf-row-border);
    --eg-row-hover-bg: rgba(124,58,237,0.045);
    --eg-row-selected-bg: rgba(124,58,237,0.08);
    --eg-row-selected-border: 1px solid rgba(124,58,237,0.22);
    --eg-row-selected-outline: transparent; --eg-cell-text: var(--pgf-text);
    --eg-cell-border: 1px solid var(--pgf-row-border); --eg-text: var(--pgf-text);
    --eg-muted-text: var(--pgf-muted); --eg-border: var(--pgf-border);
    --eg-border-hover: rgba(124,58,237,0.28); --eg-sort-active-color: #7c3aed;
    --eg-sort-icon-color: var(--pgf-muted2); --eg-btn-bg: rgba(124,58,237,0.08);
    --eg-btn-text: #7c3aed; --eg-skeleton-base: var(--pgf-skel-base);
    --eg-skeleton-highlight: var(--pgf-skel-hi); --eg-empty-icon-bg: var(--pgf-skel-base);
  }
  .yg-header { font-size:.6875rem!important; font-weight:600!important;
    letter-spacing:.09em!important; text-transform:uppercase!important; color: var(--pgf-muted2) !important; }
  .yg-header-cell--sortable:hover { background: var(--pgf-active-bg) !important; }
  .yg-header-cell--sorted { color:#7c3aed!important; }
  .yg-row { transition:background .1s ease; font-size:.875rem!important; }
  .yg-cell { font-size:.875rem!important; color: var(--pgf-text) !important;
    font-family:'Inter',system-ui,sans-serif!important; letter-spacing:-.01em; }
  .yg-pagination { font-size:.8125rem!important;
    border-top:1px solid var(--pgf-border)!important;
    background: var(--pgf-header-bg) !important; padding:0 16px!important; color: var(--pgf-muted2) !important; }
  .yg-row[aria-selected="true"] { background:rgba(124,58,237,.07)!important; }
  .yg-cell:focus { outline:2px solid rgba(124,58,237,.3)!important; outline-offset:-2px; }
  .yg-sort-indicator { opacity:.25; transition:opacity .15s; }
  .yg-header-cell--sorted .yg-sort-indicator { opacity:1!important; color:#7c3aed!important; }
  .yg-header-cell--filtered svg { color:#7c3aed!important; }
  .yg-resize-handle:hover>div { background:rgba(124,58,237,.3)!important; }
  input[type="checkbox"] { accent-color:#7c3aed; width:14px!important; height:14px!important; cursor:pointer; }
  .yg-pagination select {
    appearance: none; -webkit-appearance: none;
    height: 28px !important; padding: 0 26px 0 10px !important;
    border: 1px solid rgba(var(--pgf-fg-rgb),0.1) !important;
    border-radius: 6px !important;
    background-color: rgba(var(--pgf-fg-rgb),0.05) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237c3aed' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 8px center !important;
    color: var(--pgf-muted2) !important;
    font-size: 0.8rem !important;
    font-family: inherit !important;
    cursor: pointer !important;
    outline: none !important;
    transition: border-color 0.15s, background-color 0.15s;
  }
  .yg-pagination select:hover {
    border-color: rgba(124,58,237,0.3) !important;
    background-color: rgba(124,58,237,0.06) !important;
    color: #7c3aed !important;
  }
  .yg-pagination select:focus {
    border-color: rgba(124,58,237,0.4) !important;
    box-shadow: 0 0 0 2px rgba(124,58,237,0.1) !important;
  }
  .yg-pagination select option { background: var(--pgf-surface); color: var(--pgf-text); }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(124,58,237,.15); border-radius:999px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(124,58,237,.35); }
  ::-webkit-scrollbar-corner { background:transparent; }
`

// Just layout — the --eg-* values now come entirely from the :root/body CSS
// rule above (theme-reactive). Don't redeclare them inline here: an inline
// style on #root would win over the CSS rule and pin the grid to whatever
// theme was active at first render, defeating the SET_THEME message.
const ROOT_STYLE = `height:100%;display:flex;flex-direction:column;`

// Applied by each sandbox's message listener on 'SET_THEME'. Kept as one
// function (not duplicated per-sandbox) since all three iframes share the
// same [data-theme] attribute/CSS variable contract above.
const APPLY_THEME_FN = `function applyTheme(t){document.documentElement.setAttribute('data-theme',t)}`

// ── React sandbox iframe ───────────────────────────────────────────────────────
export function buildReactIframeSrcDoc(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>${IFRAME_CSS}</style>
  <script type="importmap">{
    "imports":{
      "react":"https://esm.sh/react@18.3.1",
      "react-dom":"https://esm.sh/react-dom@18.3.1",
      "react-dom/client":"https://esm.sh/react-dom@18.3.1/client",
      "react/jsx-runtime":"https://esm.sh/react@18.3.1/jsx-runtime",
      "@elitegrid/core":"${origin}/cdn/core.js",
      "@elitegrid/react":"${origin}/cdn/react.js"
    }
  }</script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"></script>
</head>
<body>
  <div id="root" style="${ROOT_STYLE}"></div>
  <script type="module">
    import React          from 'react'
    import ReactDOM       from 'react-dom'
    import{createRoot}    from 'react-dom/client'
    import*as ReactAll    from 'react'
    import*as EliteReact  from '@elitegrid/react'
    import*as EliteCore   from '@elitegrid/core'

    const require=mod=>{
      const m={'react':ReactAll,'react-dom':ReactDOM,'react-dom/client':{createRoot},
               '@elitegrid/react':EliteReact,'@elitegrid/core':EliteCore,
               '@elitegrid/react/styles.css':{},'@elitegrid/core/styles.css':{}}
      if(m[mod])return m[mod]
      throw new Error('Module not available: '+mod)
    }
    const rootEl=document.getElementById('root')
    let reactRoot=null

    function showError(msg){
      if(reactRoot){try{reactRoot.unmount()}catch(_){}reactRoot=null}
      rootEl.innerHTML='<div style="padding:24px;font-family:monospace;font-size:12.5px;'+
        'color:#f87171;background:rgba(248,113,113,0.06);border-left:2px solid rgba(248,113,113,0.5);'+
        'white-space:pre-wrap;overflow:auto;height:100%;box-sizing:border-box;line-height:1.6;">'+
        msg.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'
    }

    function runCode(raw){
      const Babel=window.Babel
      if(!Babel){showError('Babel not ready yet.');return}
      let t
      try{t=Babel.transform(raw,{presets:[['react',{runtime:'classic'}],
        ['typescript',{allExtensions:true,isTSX:true}],
        ['env',{targets:{esmodules:true},modules:'commonjs'}]],filename:'app.tsx'}).code}
      catch(e){showError('Syntax error:\\n\\n'+e.message);return}
      const w='"use strict";\\nvar exports={__esModule:true};\\nvar module={exports:exports};\\n'+
        t+'\\nreturn exports["default"]||module.exports["default"]||module.exports;'
      let App
      try{App=(new Function('require','React',w))(require,ReactAll)}
      catch(e){showError('Runtime error:\\n\\n'+e.message);return}
      if(typeof App!=='function'){showError('Export a default React component.');return}
      try{
        if(reactRoot){reactRoot.unmount();reactRoot=null}
        rootEl.innerHTML=''
        reactRoot=createRoot(rootEl)
        reactRoot.render(React.createElement(App))
      }catch(e){showError('Render error:\\n\\n'+e.message)}
    }

    ${APPLY_THEME_FN}
    window.addEventListener('message',e=>{
      if(e.data?.type==='RUN_CODE')runCode(e.data.code)
      if(e.data?.type==='SET_THEME')applyTheme(e.data.theme)
    })
    window.parent.postMessage({type:'IFRAME_READY'},'*')
  </script>
</body></html>`
}

// ── Vue sandbox iframe ─────────────────────────────────────────────────────────
export function buildVueIframeSrcDoc(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>${IFRAME_CSS}</style>
  <script type="importmap">{
    "imports":{
      "vue":"https://esm.sh/vue@3.4.33",
      "@elitegrid/core":"${origin}/cdn/core.js",
      "@elitegrid/vue":"${origin}/cdn/vue.js"
    }
  }</script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"></script>
</head>
<body>
  <div id="root" style="${ROOT_STYLE}"></div>
  <script type="module">
    import*as VueAll    from 'vue'
    import*as EliteVue  from '@elitegrid/vue'
    import*as EliteCore from '@elitegrid/core'

    const require=mod=>{
      const m={'vue':VueAll,'@elitegrid/vue':EliteVue,'@elitegrid/core':EliteCore,
               '@elitegrid/vue/styles.css':{},'@elitegrid/core/styles.css':{}}
      if(m[mod])return m[mod]
      throw new Error('Module not available: '+mod)
    }
    const rootEl=document.getElementById('root')
    let vueApp=null

    function showError(msg){
      if(vueApp){try{vueApp.unmount()}catch(_){}vueApp=null}
      rootEl.innerHTML='<div style="padding:24px;font-family:monospace;font-size:12.5px;'+
        'color:#f87171;background:rgba(248,113,113,0.06);border-left:2px solid rgba(248,113,113,0.5);'+
        'white-space:pre-wrap;overflow:auto;height:100%;box-sizing:border-box;line-height:1.6;">'+
        msg.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'
    }

    function runCode(raw){
      const Babel=window.Babel
      if(!Babel){showError('Babel not ready yet.');return}
      let t
      try{t=Babel.transform(raw,{presets:[
        ['typescript',{allExtensions:true}],
        ['env',{targets:{esmodules:true},modules:'commonjs'}]
      ],filename:'app.ts'}).code}
      catch(e){showError('Syntax error:\\n\\n'+e.message);return}
      const w='"use strict";\\nvar exports={__esModule:true};\\nvar module={exports:exports};\\n'+
        t+'\\nreturn exports["default"]||module.exports["default"]||module.exports;'
      let comp
      try{comp=(new Function('require',w))(require)}
      catch(e){showError('Runtime error:\\n\\n'+e.message);return}
      if(!comp){showError('Export a default Vue component.\\n\\nExample:\\n  export default defineComponent({\\n    setup() { return () => h(Grid, { grid }) }\\n  })');return}
      if(vueApp){try{vueApp.unmount()}catch(_){}vueApp=null}
      rootEl.innerHTML=''
      try{
        vueApp=VueAll.createApp(comp)
        vueApp.mount(rootEl)
      }catch(e){showError('Mount error:\\n\\n'+e.message)}
    }

    ${APPLY_THEME_FN}
    window.addEventListener('message',e=>{
      if(e.data?.type==='RUN_CODE')runCode(e.data.code)
      if(e.data?.type==='SET_THEME')applyTheme(e.data.theme)
    })
    window.parent.postMessage({type:'IFRAME_READY'},'*')
  </script>
</body></html>`
}

// ── Vanilla JS sandbox iframe ───────────────────────────────────────────────────
// The real @elitegrid/vanilla adapter wraps @elitegrid/core with its own
// createGrid()/mount() (see packages/adapters/vanilla in the library repo) —
// end users never import @elitegrid/core directly, same as react/vue users
// never do. There's no separate vanilla.js CDN bundle yet though, so this
// sandbox fakes @elitegrid/vanilla's public surface by reusing the React
// adapter's Grid component under the hood. That's purely an internal
// implementation detail of *this sandbox* — the module name the user's code
// actually imports from must still be '@elitegrid/vanilla', matching the
// real published package and everything the docs teach.
export function buildVanillaIframeSrcDoc(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>${IFRAME_CSS}</style>
  <script type="importmap">{
    "imports":{
      "react":"https://esm.sh/react@18.3.1",
      "react-dom":"https://esm.sh/react-dom@18.3.1",
      "react-dom/client":"https://esm.sh/react-dom@18.3.1/client",
      "react/jsx-runtime":"https://esm.sh/react@18.3.1/jsx-runtime",
      "@elitegrid/core":"${origin}/cdn/core.js",
      "@elitegrid/react":"${origin}/cdn/react.js"
    }
  }</script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"></script>
</head>
<body>
  <div id="grid-container" style="${ROOT_STYLE}"></div>
  <script type="module">
    import React          from 'react'
    import{createRoot}    from 'react-dom/client'
    import*as EliteReact  from '@elitegrid/react'
    import*as EliteCore   from '@elitegrid/core'

    // currentMountEl tracks the actual DOM node the live root was created on.
    // Vanilla example code is free to do raw container.innerHTML='' between
    // runs (see editable/export examples) — that detaches this wrapper from
    // the document without going through React, which desyncs the fiber tree
    // and makes unmount() try to removeChild a node that's already gone. Only
    // unmount() while the wrapper is still actually attached; otherwise React
    // has nothing left to clean up and calling it just throws.
    let currentRoot=null
    let currentMountEl=null
    function mount(grid,container){
      if(!container)throw new Error('mount() requires a container element')
      if(currentRoot){
        if(currentMountEl&&currentMountEl.isConnected){try{currentRoot.unmount()}catch(_){}}
        currentRoot=null
        currentMountEl=null
      }
      container.innerHTML=''
      const wrapper=document.createElement('div')
      wrapper.style.cssText='height:100%'
      container.appendChild(wrapper)
      currentRoot=createRoot(wrapper)
      currentMountEl=wrapper
      currentRoot.render(React.createElement(EliteReact.Grid,{grid,style:{height:'100%'}}))
      return ()=>{
        if(currentRoot&&currentMountEl&&currentMountEl.isConnected){try{currentRoot.unmount()}catch(_){}}
        currentRoot=null
        currentMountEl=null
      }
    }
    const VanillaShim=Object.assign({},EliteCore,{createGrid:EliteReact.createGrid,mount})

    const require=mod=>{
      const m={'@elitegrid/vanilla':VanillaShim,'@elitegrid/vanilla/styles.css':{}}
      if(m[mod])return m[mod]
      throw new Error('Module not available: '+mod+' — the vanilla sandbox only provides "@elitegrid/vanilla"')
    }
    const rootEl=document.getElementById('grid-container')

    function showError(msg){
      if(currentRoot){try{currentRoot.unmount()}catch(_){}currentRoot=null}
      rootEl.innerHTML='<div style="padding:24px;font-family:monospace;font-size:12.5px;'+
        'color:#f87171;background:rgba(248,113,113,0.06);border-left:2px solid rgba(248,113,113,0.5);'+
        'white-space:pre-wrap;overflow:auto;height:100%;box-sizing:border-box;line-height:1.6;">'+
        msg.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'
    }

    function runCode(raw){
      const Babel=window.Babel
      if(!Babel){showError('Babel not ready yet.');return}
      let t
      try{t=Babel.transform(raw,{presets:[
        ['typescript',{allExtensions:true}],
        ['env',{targets:{esmodules:true},modules:'commonjs'}]
      ],filename:'app.ts'}).code}
      catch(e){showError('Syntax error:\\n\\n'+e.message);return}
      const w='"use strict";\\nvar exports={__esModule:true};\\nvar module={exports:exports};\\n'+t
      try{(new Function('require',w))(require)}
      catch(e){showError('Runtime error:\\n\\n'+e.message);return}
    }

    ${APPLY_THEME_FN}
    window.addEventListener('message',e=>{
      if(e.data?.type==='RUN_CODE')runCode(e.data.code)
      if(e.data?.type==='SET_THEME')applyTheme(e.data.theme)
    })
    window.parent.postMessage({type:'IFRAME_READY'},'*')
  </script>
</body></html>`
}
