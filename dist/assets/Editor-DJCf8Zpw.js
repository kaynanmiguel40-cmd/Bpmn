import{j as b}from"./query-CQB1N7mz.js";import{g as Vh,r as q,h as Wh,b as Uh}from"./vendor-D5cPNHfC.js";import{E as Yh}from"./jspdf.es.min-COHhpf8m.js";import{B as os,e as z,I as Kh,i as se,c as Fn,a as ue,b as xt,m as sa,d as C,f as ze,t as In,g as as,h as Zh,V as Li,j as T,s as Zt,k as ae,l as rs,n as at,o as ct,q as Ue,p as Ri,r as Ct,u as ca,v as ye,w as Rl,O as Bl,x as ut,y as xr,z as Bt,C as D,A as da,D as gn,E as Te,F as U,G as Z,H as Qe,J as pa,K as Q,L as Ze,M as G,N as _,P as ss,Q as cs,R as la,S as Ut,T as wt,U as ds,W as fn,X as ce,Y as ir,Z as Al,_ as Jt,$ as kl,a0 as Xh,a1 as be,a2 as Pr,a3 as Vt,a4 as ve,a5 as xe,a6 as it,a7 as J,a8 as Jh,a9 as ot,aa as ps,ab as Vc,ac as Qh,ad as Dl,ae as Sr,af as Xt,ag as ls,ah as Tr,ai as ef,aj as Il,ak as Yn,al as ua,am as us,an as rt,ao as qe,ap as Ve,aq as fe,ar as te,as as ma,at as Bi,au as Kn,av as Yt,aw as ht,ax as pe,ay as Gi,az as Ai,aA as Fl,aB as ji,aC as Un,aD as Io,aE as Nn,aF as Wc,aG as tf,aH as nf,aI as of,aJ as af,aK as rf,aL as Ol,aM as mn,aN as Mr,aO as sf,aP as ms,aQ as cf,aR as hs,aS as df,aT as pf,aU as lf,aV as uf,aW as Nr,aX as Ll,aY as mf,aZ as hf,a_ as Uc,a$ as Gl,b0 as ff,b1 as fs,b2 as gf,b3 as _f,b4 as jl,b5 as bf,b6 as $l,b7 as vf,b8 as Yc}from"./bpmn-arwAWWbH.js";import{E as Kc}from"./fynessTemplate-CM7nxNkA.js";import{h as fi,f as Zc,a as lo,i as yf}from"./index-P8Mr3XGt.js";import"./supabase-Br6iVc9W.js";function $i(e){os.call(this,e),this.on("import.parse.complete",function(t){t.error||this._collectIds(t.definitions,t.elementsById)},this),this.on("diagram.destroy",function(){this.get("moddle").ids.clear()},this)}z($i,os);$i.prototype._createModdle=function(e){var t=os.prototype._createModdle.call(this,e);return t.ids=new Kh([32,36,1]),t};$i.prototype._collectIds=function(e,t){var n=e.$model,i=n.ids,o;i.clear();for(o in t)i.claim(o,t[o])};var wf=["c","C"],Ef=["v","V"],xf=["y","Y"],ql=["z","Z"];function Pf(e){return e.ctrlKey||e.metaKey||e.shiftKey||e.altKey}function ft(e){return e.altKey?!1:e.ctrlKey||e.metaKey}function He(e,t){return e=se(e)?e:[e],e.indexOf(t.key)!==-1||e.indexOf(t.code)!==-1}function gs(e){return e.shiftKey}function Sf(e){return ft(e)&&He(wf,e)}function Tf(e){return ft(e)&&He(Ef,e)}function Mf(e){return ft(e)&&!gs(e)&&He(ql,e)}function Nf(e){return ft(e)&&(He(xf,e)||He(ql,e)&&gs(e))}var ha="keyboard.keydown",Cf="keyboard.keyup",Xc="input-handle-modified-keys",Rf=1e3;function Xe(e,t){var n=this;this._config=e||{},this._eventBus=t,this._keydownHandler=this._keydownHandler.bind(this),this._keyupHandler=this._keyupHandler.bind(this),t.on("diagram.destroy",function(){n._fire("destroy"),n.unbind()}),t.on("diagram.init",function(){n._fire("init")}),t.on("attach",function(){e&&e.bindTo&&n.bind(e.bindTo)}),t.on("detach",function(){n.unbind()})}Xe.$inject=["config.keyboard","eventBus"];Xe.prototype._keydownHandler=function(e){this._keyHandler(e,ha)};Xe.prototype._keyupHandler=function(e){this._keyHandler(e,Cf)};Xe.prototype._keyHandler=function(e,t){var n;if(!this._isEventIgnored(e)){var i={keyEvent:e};n=this._eventBus.fire(t||ha,i),n&&e.preventDefault()}};Xe.prototype._isEventIgnored=function(e){return e.defaultPrevented?!0:(Bf(e.target)||Af(e.target)&&He([" ","Enter"],e))&&this._isModifiedKeyIgnored(e)};Xe.prototype._isModifiedKeyIgnored=function(e){if(!ft(e))return!0;var t=this._getAllowedModifiers(e.target);return t.indexOf(e.key)===-1};Xe.prototype._getAllowedModifiers=function(e){var t=Fn(e,"["+Xc+"]",!0);return!t||this._node&&!this._node.contains(t)?[]:t.getAttribute(Xc).split(",")};Xe.prototype.bind=function(e){this.unbind(),this._node=e,ue.bind(e,"keydown",this._keydownHandler),ue.bind(e,"keyup",this._keyupHandler),this._fire("bind")};Xe.prototype.getBinding=function(){return this._node};Xe.prototype.unbind=function(){var e=this._node;e&&(this._fire("unbind"),ue.unbind(e,"keydown",this._keydownHandler),ue.unbind(e,"keyup",this._keyupHandler)),this._node=null};Xe.prototype._fire=function(e){this._eventBus.fire("keyboard."+e,{node:this._node})};Xe.prototype.addListener=function(e,t,n){xt(e)&&(n=t,t=e,e=Rf),this._eventBus.on(n||ha,e,t)};Xe.prototype.removeListener=function(e,t){this._eventBus.off(t||ha,e)};Xe.prototype.hasModifier=Pf;Xe.prototype.isCmd=ft;Xe.prototype.isShift=gs;Xe.prototype.isKey=He;function Bf(e){return e&&(sa(e,"input, textarea")||e.contentEditable==="true")}function Af(e){return e&&sa(e,"button, input[type=submit], input[type=button], a[href], [aria-role=button]")}var kf=500;function oi(e,t){var n=this;e.on("editorActions.init",kf,function(i){var o=i.editorActions;n.registerBindings(t,o)})}oi.$inject=["eventBus","keyboard"];oi.prototype.registerBindings=function(e,t){function n(i,o){t.isRegistered(i)&&e.addListener(o)}n("undo",function(i){var o=i.keyEvent;if(Mf(o))return t.trigger("undo"),!0}),n("redo",function(i){var o=i.keyEvent;if(Nf(o))return t.trigger("redo"),!0}),n("copy",function(i){var o=i.keyEvent;if(Sf(o))return t.trigger("copy"),!0}),n("paste",function(i){var o=i.keyEvent;if(Tf(o))return t.trigger("paste"),!0}),n("stepZoom",function(i){var o=i.keyEvent;if(He(["+","Add","="],o)&&ft(o))return t.trigger("stepZoom",{value:1}),!0}),n("stepZoom",function(i){var o=i.keyEvent;if(He(["-","Subtract"],o)&&ft(o))return t.trigger("stepZoom",{value:-1}),!0}),n("zoom",function(i){var o=i.keyEvent;if(He("0",o)&&ft(o))return t.trigger("zoom",{value:1}),!0}),n("removeSelection",function(i){var o=i.keyEvent;if(He(["Backspace","Delete","Del"],o))return t.trigger("removeSelection"),!0})};const _s={__init__:["keyboard","keyboardBindings"],keyboard:["type",Xe],keyboardBindings:["type",oi]};var Df={moveSpeed:50,moveSpeedAccelerated:200};function Hl(e,t,n){var i=this;this._config=C({},Df,e||{}),t.addListener(o);function o(a){var r=a.keyEvent,s=i._config;if(t.isCmd(r)&&t.isKey(["ArrowLeft","Left","ArrowUp","Up","ArrowDown","Down","ArrowRight","Right"],r)){var c=t.isShift(r)?s.moveSpeedAccelerated:s.moveSpeed,d;switch(r.key){case"ArrowLeft":case"Left":d="left";break;case"ArrowUp":case"Up":d="up";break;case"ArrowRight":case"Right":d="right";break;case"ArrowDown":case"Down":d="down";break}return i.moveCanvas({speed:c,direction:d}),!0}}this.moveCanvas=function(a){var r=0,s=0,c=a.speed,d=c/Math.min(Math.sqrt(n.viewbox().scale),1);switch(a.direction){case"left":r=d;break;case"up":s=d;break;case"right":r=-d;break;case"down":s=-d;break}n.scroll({dx:r,dy:s})}}Hl.$inject=["config.keyboardMove","keyboard","canvas"];const zl={__depends__:[_s],__init__:["keyboardMove"],keyboardMove:["type",Hl]};var If=/^djs-cursor-.*$/;function fa(e){var t=ze(document.body);t.removeMatching(If),e&&t.add("djs-cursor-"+e)}function Vl(){fa(null)}var Ff=5e3;function Wl(e,t){t=t||"element.click";function n(){return!1}return e.once(t,Ff,n),function(){e.off(t,n)}}function Ti(e){return{x:e.x+e.width/2,y:e.y+e.height/2}}function Rt(e,t){return{x:e.x-t.x,y:e.y-t.y}}var Of=15;function Ul(e,t){var n;e.on("element.mousedown",500,function(r){return a(r.originalEvent)});function i(r){var s=n.start,c=n.button,d=In(r),l=Rt(d,s);if(!n.dragging&&Lf(l)>Of&&(n.dragging=!0,c===0&&Wl(e),fa("grab")),n.dragging){var p=n.last||n.start;l=Rt(d,p),t.scroll({dx:l.x,dy:l.y}),n.last=d}r.preventDefault()}function o(r){ue.unbind(document,"mousemove",i),ue.unbind(document,"mouseup",o),n=null,Vl()}function a(r){if(!Fn(r.target,".djs-draggable")){var s=r.button;if(!(s>=2||r.ctrlKey||r.shiftKey||r.altKey))return n={button:s,start:In(r)},ue.bind(document,"mousemove",i),ue.bind(document,"mouseup",o),!0}}this.isActive=function(){return!!n}}Ul.$inject=["eventBus","canvas"];function Lf(e){return Math.sqrt(Math.pow(e.x,2)+Math.pow(e.y,2))}const Yl={__init__:["moveCanvas"],moveCanvas:["type",Ul]};function Cr(e){return Math.log(e)/Math.log(10)}function Kl(e,t){var n=Cr(e.min),i=Cr(e.max),o=Math.abs(n)+Math.abs(i);return o/t}function Gf(e,t){return Math.max(e.min,Math.min(e.max,t))}var jf=Math.sign||function(e){return e>=0?1:-1},bs={min:.2,max:4},Zl=10,$f=.1,qf=.75;function jt(e,t,n){e=e||{},this._enabled=!1,this._canvas=n,this._container=n._container,this._handleWheel=as(this._handleWheel,this),this._totalDelta=0,this._scale=e.scale||qf;var i=this;t.on("canvas.init",function(o){i._init(e.enabled!==!1)})}jt.$inject=["config.zoomScroll","eventBus","canvas"];jt.prototype.scroll=function(t){this._canvas.scroll(t)};jt.prototype.reset=function(){this._canvas.zoom("fit-viewport")};jt.prototype.zoom=function(t,n){var i=Kl(bs,Zl*2);this._totalDelta+=t,Math.abs(this._totalDelta)>$f&&(this._zoom(t,n,i),this._totalDelta=0)};jt.prototype._handleWheel=function(t){if(!Fn(t.target,".djs-scrollable",!0)){var n=this._container;t.preventDefault();var i=t.ctrlKey||Zh()&&t.metaKey,o=t.shiftKey,a=-1*this._scale,r;if(i?a*=t.deltaMode===0?.02:.32:a*=t.deltaMode===0?1:16,i){var s=n.getBoundingClientRect(),c={x:t.clientX-s.left,y:t.clientY-s.top};r=Math.sqrt(Math.pow(t.deltaY,2)+Math.pow(t.deltaX,2))*jf(t.deltaY)*a,this.zoom(r,c)}else o?r={dx:a*t.deltaY,dy:0}:r={dx:a*t.deltaX,dy:a*t.deltaY},this.scroll(r)}};jt.prototype.stepZoom=function(t,n){var i=Kl(bs,Zl);this._zoom(t,n,i)};jt.prototype._zoom=function(e,t,n){var i=this._canvas,o=e>0?1:-1,a=Cr(i.zoom()),r=Math.round(a/n)*n;r+=n*o;var s=Math.pow(10,r);i.zoom(Gf(bs,s),t)};jt.prototype.toggle=function(t){var n=this._container,i=this._handleWheel,o=this._enabled;return typeof t>"u"&&(t=!o),o!==t&&ue[t?"bind":"unbind"](n,"wheel",i,!1),this._enabled=t,t};jt.prototype._init=function(e){this.toggle(e)};const Xl={__init__:["zoomScroll"],zoomScroll:["type",jt]};function ki(e){Li.call(this,e)}z(ki,Li);ki.prototype._navigationModules=[zl,Yl,Xl];ki.prototype._modules=[].concat(Li.prototype._modules,ki.prototype._navigationModules);function or(e){return e&&e[e.length-1]}function Jc(e){return e.y}function Qc(e){return e.x}var Hf={left:Qc,center:Qc,right:function(e){return e.x+e.width},top:Jc,middle:Jc,bottom:function(e){return e.y+e.height}};function ai(e,t){this._modeling=e,this._rules=t}ai.$inject=["modeling","rules"];ai.prototype._getOrientationDetails=function(e){var t=["top","bottom","middle"],n="x",i="width";return t.indexOf(e)!==-1&&(n="y",i="height"),{axis:n,dimension:i}};ai.prototype._isType=function(e,t){return t.indexOf(e)!==-1};ai.prototype._alignmentPosition=function(e,t){var n=this._getOrientationDetails(e),i=n.axis,o=n.dimension,a={},r={},s=!1,c,d,l;function p(u,m){return Math.round((u[i]+m[i]+m[o])/2)}if(this._isType(e,["left","top"]))a[e]=t[0][i];else if(this._isType(e,["right","bottom"]))l=or(t),a[e]=l[i]+l[o];else if(this._isType(e,["center","middle"])){if(T(t,function(u){var m=u[i]+Math.round(u[o]/2);r[m]?r[m].elements.push(u):r[m]={elements:[u],center:m}}),c=Zt(r,function(u){return u.elements.length>1&&(s=!0),u.elements.length}),s)return a[e]=or(c).center,a;d=t[0],t=Zt(t,function(u){return u[i]+u[o]}),l=or(t),a[e]=p(d,l)}return a};ai.prototype.trigger=function(e,t){var n=this._modeling,i,o=ae(e,function(c){return!(c.waypoints||c.host||c.labelTarget)});if(i=this._rules.allowed("elements.align",{elements:o}),se(i)&&(o=i),!(o.length<2||!i)){var a=Hf[t],r=Zt(o,a),s=this._alignmentPosition(t,r);n.alignElements(r,s)}};const zf={__init__:["alignElements"],alignElements:["type",ai]},Vf=new rs;function ri(e){this._scheduled={},e.on("diagram.destroy",()=>{Object.keys(this._scheduled).forEach(t=>{this.cancel(t)})})}ri.$inject=["eventBus"];ri.prototype.schedule=function(e,t=Vf.next()){this.cancel(t);const n=this._schedule(e,t);return this._scheduled[t]=n,n.promise};ri.prototype._schedule=function(e,t){const{promise:n,resolve:i,reject:o}=Wf();return{executionId:requestAnimationFrame(()=>{try{i(e())}catch(r){o(r)}}),promise:n}};ri.prototype.cancel=function(e){const t=this._scheduled[e];t&&(this._cancel(t),this._scheduled[e]=null)};ri.prototype._cancel=function(e){cancelAnimationFrame(e.executionId)};function Wf(){let e,t;return{promise:new Promise((i,o)=>{e=i,t=o}),resolve:e,reject:t}}const Uf={scheduler:["type",ri]};var Yf="djs-element-hidden",uo=".entry",Kf=1e3,ed=8,Zf=300;function Le(e,t,n,i){this._canvas=e,this._elementRegistry=t,this._eventBus=n,this._scheduler=i,this._current=null,this._init()}Le.$inject=["canvas","elementRegistry","eventBus","scheduler"];Le.prototype._init=function(){var e=this;this._eventBus.on("selection.changed",function(t){var n=t.newSelection,i=n.length?n.length===1?n[0]:n:null;i?e.open(i,!0):e.close()}),this._eventBus.on("elements.changed",function(t){var n=t.elements,i=e._current;if(i){var o=i.target,a=se(o)?o:[o],r=a.filter(function(c){return n.includes(c)});if(r.length){e.close();var s=a.filter(function(c){return e._elementRegistry.get(c.id)});s.length&&e._updateAndOpen(s.length>1?s:s[0])}}}),this._eventBus.on("canvas.viewbox.changed",function(){e._updatePosition()}),this._eventBus.on("element.marker.update",function(t){if(e.isOpen()){var n=t.element,i=e._current,o=se(i.target)?i.target:[i.target];o.includes(n)&&e._updateVisibility()}}),this._container=this._createContainer()};Le.prototype._createContainer=function(){var e=at('<div class="djs-context-pad-parent"></div>');return this._canvas.getContainer().appendChild(e),e};Le.prototype.registerProvider=function(e,t){t||(t=e,e=Kf),this._eventBus.on("contextPad.getProviders",e,function(n){n.providers.push(t)})};Le.prototype.getEntries=function(e){var t=this._getProviders(),n=se(e)?"getMultiElementContextPadEntries":"getContextPadEntries",i={};return T(t,function(o){if(xt(o[n])){var a=o[n](e);xt(a)?i=a(i):T(a,function(r,s){i[s]=r})}}),i};Le.prototype.trigger=function(e,t,n){var i=this,o,a,r=t.delegateTarget||t.target;if(!r)return t.preventDefault();if(o=ct(r,"data-action"),a=t.originalEvent||t,e==="mouseover"){this._timeout=setTimeout(function(){i._mouseout=i.triggerEntry(o,"hover",a,n)},Zf);return}else if(e==="mouseout"){clearTimeout(this._timeout),this._mouseout&&(this._mouseout(),this._mouseout=null);return}return this.triggerEntry(o,e,a,n)};Le.prototype.triggerEntry=function(e,t,n,i){if(this.isShown()){var o=this._current.target,a=this._current.entries,r=a[e];if(r){var s=r.action;if(this._eventBus.fire("contextPad.trigger",{entry:r,event:n})!==!1){if(xt(s)){if(t==="click")return s(n,o,i)}else if(s[t])return s[t](n,o,i);n.preventDefault()}}}};Le.prototype.open=function(e,t){!t&&this.isOpen(e)||(this.close(),this._updateAndOpen(e))};Le.prototype._getProviders=function(){var e=this._eventBus.createEvent({type:"contextPad.getProviders",providers:[]});return this._eventBus.fire(e),e.providers};Le.prototype._updateAndOpen=function(e){var t=this.getEntries(e),n=this._createHtml(e),i;T(t,function(o,a){var r=o.group||"default",s=at(o.html||'<div class="entry" draggable="true"></div>'),c;ct(s,"data-action",a),c=Ue("[data-group="+Ri(r)+"]",n),c||(c=at('<div class="group"></div>'),ct(c,"data-group",r),n.appendChild(c)),c.appendChild(s),o.className&&Xf(s,o.className),o.title&&ct(s,"title",o.title),o.imageUrl&&(i=at("<img>"),ct(i,"src",o.imageUrl),i.style.width="100%",i.style.height="100%",s.appendChild(i))}),ze(n).add("open"),this._current={entries:t,html:n,target:e},this._updatePosition(),this._updateVisibility(),this._eventBus.fire("contextPad.open",{current:this._current})};Le.prototype._createHtml=function(e){var t=this,n=at('<div class="djs-context-pad"></div>');return Ct.bind(n,uo,"click",function(i){t.trigger("click",i)}),Ct.bind(n,uo,"dragstart",function(i){t.trigger("dragstart",i)}),Ct.bind(n,uo,"mouseover",function(i){t.trigger("mouseover",i)}),Ct.bind(n,uo,"mouseout",function(i){t.trigger("mouseout",i)}),ue.bind(n,"mousedown",function(i){i.stopPropagation()}),this._container.appendChild(n),this._eventBus.fire("contextPad.create",{target:e,pad:n}),n};Le.prototype.getPad=function(e){console.warn(new Error("ContextPad#getPad is deprecated and will be removed in future library versions, cf. https://github.com/bpmn-io/diagram-js/pull/888"));let t;return this.isOpen()&&Qf(this._current.target,e)?t=this._current.html:t=this._createHtml(e),{html:t}};Le.prototype.close=function(){this.isOpen()&&(clearTimeout(this._timeout),this._container.innerHTML="",this._eventBus.fire("contextPad.close",{current:this._current}),this._current=null)};Le.prototype.isOpen=function(e){var t=this._current;if(!t)return!1;if(!e)return!0;var n=t.target;return se(e)!==se(n)?!1:se(e)?e.length===n.length&&ca(e,function(i){return n.includes(i)}):n===e};Le.prototype.isShown=function(){return this.isOpen()&&ze(this._current.html).has("open")};Le.prototype.show=function(){this.isOpen()&&(ze(this._current.html).add("open"),this._updatePosition(),this._eventBus.fire("contextPad.show",{current:this._current}))};Le.prototype.hide=function(){this.isOpen()&&(ze(this._current.html).remove("open"),this._eventBus.fire("contextPad.hide",{current:this._current}))};Le.prototype._getPosition=function(e){if(!se(e)&&ye(e)){var t=this._canvas.viewbox(),n=Jf(e),i=n.x*t.scale-t.x*t.scale,o=n.y*t.scale-t.y*t.scale;return{left:i+ed*this._canvas.zoom(),top:o}}var a=this._canvas.getContainer(),r=a.getBoundingClientRect(),s=this._getTargetBounds(e);return{left:s.right-r.left+ed*this._canvas.zoom(),top:s.top-r.top}};Le.prototype._updatePosition=function(){const e=()=>{if(this.isOpen()){var t=this._current.html,n=this._getPosition(this._current.target);"x"in n&&"y"in n?(t.style.left=n.x+"px",t.style.top=n.y+"px"):["top","right","bottom","left"].forEach(function(i){i in n&&(t.style[i]=n[i]+"px")})}};this._scheduler.schedule(e,"ContextPad#_updatePosition")};Le.prototype._updateVisibility=function(){const e=()=>{if(this.isOpen()){var t=this,n=this._current.target,i=se(n)?n:[n],o=i.some(function(a){return t._canvas.hasMarker(a,Yf)});o?t.hide():t.show()}};this._scheduler.schedule(e,"ContextPad#_updateVisibility")};Le.prototype._getTargetBounds=function(e){var t=this,n=se(e)?e:[e],i=n.map(function(o){return t._canvas.getGraphics(o)});return i.reduce(function(o,a){const r=a.getBoundingClientRect();return o.top=Math.min(o.top,r.top),o.right=Math.max(o.right,r.right),o.bottom=Math.max(o.bottom,r.bottom),o.left=Math.min(o.left,r.left),o.x=o.left,o.y=o.top,o.width=o.right-o.left,o.height=o.bottom-o.top,o},{top:1/0,right:-1/0,bottom:-1/0,left:1/0})};function Xf(e,t){var n=ze(e);t=se(t)?t:t.split(/\s+/g),t.forEach(function(i){n.add(i)})}function Jf(e){return e.waypoints[e.waypoints.length-1]}function Qf(e,t){return e=se(e)?e:[e],t=se(t)?t:[t],e.length===t.length&&ca(e,function(n){return t.includes(n)})}const Jl={__depends__:[Rl,Uf,Bl],contextPad:["type",Le]};var ga,Se,Ql,An,td,eu,tu,nu,vs,Rr,Br,Di={},iu=[],eg=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,_a=Array.isArray;function Wt(e,t){for(var n in t)e[n]=t[n];return e}function ys(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function ou(e,t,n){var i,o,a,r={};for(a in t)a=="key"?i=t[a]:a=="ref"?o=t[a]:r[a]=t[a];if(arguments.length>2&&(r.children=arguments.length>3?ga.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(a in e.defaultProps)r[a]===void 0&&(r[a]=e.defaultProps[a]);return Fo(e,r,i,o,null)}function Fo(e,t,n,i,o){var a={type:e,props:t,key:n,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++Ql,__i:-1,__u:0};return o==null&&Se.vnode!=null&&Se.vnode(a),a}function ba(e){return e.children}function Oo(e,t){this.props=e,this.context=t}function Zn(e,t){if(t==null)return e.__?Zn(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?Zn(e):null}function au(e){var t,n;if((e=e.__)!=null&&e.__c!=null){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null){e.__e=e.__c.base=n.__e;break}return au(e)}}function nd(e){(!e.__d&&(e.__d=!0)&&An.push(e)&&!Yo.__r++||td!=Se.debounceRendering)&&((td=Se.debounceRendering)||eu)(Yo)}function Yo(){for(var e,t,n,i,o,a,r,s=1;An.length;)An.length>s&&An.sort(tu),e=An.shift(),s=An.length,e.__d&&(n=void 0,i=void 0,o=(i=(t=e).__v).__e,a=[],r=[],t.__P&&((n=Wt({},i)).__v=i.__v+1,Se.vnode&&Se.vnode(n),ws(t.__P,n,i,t.__n,t.__P.namespaceURI,32&i.__u?[o]:null,a,o??Zn(i),!!(32&i.__u),r),n.__v=i.__v,n.__.__k[n.__i]=n,cu(a,n,r),i.__e=i.__=null,n.__e!=o&&au(n)));Yo.__r=0}function ru(e,t,n,i,o,a,r,s,c,d,l){var p,u,m,h,g,f,w,E=i&&i.__k||iu,v=t.length;for(c=tg(n,t,E,c,v),p=0;p<v;p++)(m=n.__k[p])!=null&&(u=m.__i==-1?Di:E[m.__i]||Di,m.__i=p,f=ws(e,m,u,o,a,r,s,c,d,l),h=m.__e,m.ref&&u.ref!=m.ref&&(u.ref&&Es(u.ref,null,m),l.push(m.ref,m.__c||h,m)),g==null&&h!=null&&(g=h),(w=!!(4&m.__u))||u.__k===m.__k?c=su(m,c,e,w):typeof m.type=="function"&&f!==void 0?c=f:h&&(c=h.nextSibling),m.__u&=-7);return n.__e=g,c}function tg(e,t,n,i,o){var a,r,s,c,d,l=n.length,p=l,u=0;for(e.__k=new Array(o),a=0;a<o;a++)(r=t[a])!=null&&typeof r!="boolean"&&typeof r!="function"?(typeof r=="string"||typeof r=="number"||typeof r=="bigint"||r.constructor==String?r=e.__k[a]=Fo(null,r,null,null,null):_a(r)?r=e.__k[a]=Fo(ba,{children:r},null,null,null):r.constructor===void 0&&r.__b>0?r=e.__k[a]=Fo(r.type,r.props,r.key,r.ref?r.ref:null,r.__v):e.__k[a]=r,c=a+u,r.__=e,r.__b=e.__b+1,s=null,(d=r.__i=ng(r,n,c,p))!=-1&&(p--,(s=n[d])&&(s.__u|=2)),s==null||s.__v==null?(d==-1&&(o>l?u--:o<l&&u++),typeof r.type!="function"&&(r.__u|=4)):d!=c&&(d==c-1?u--:d==c+1?u++:(d>c?u--:u++,r.__u|=4))):e.__k[a]=null;if(p)for(a=0;a<l;a++)(s=n[a])!=null&&!(2&s.__u)&&(s.__e==i&&(i=Zn(s)),pu(s,s));return i}function su(e,t,n,i){var o,a;if(typeof e.type=="function"){for(o=e.__k,a=0;o&&a<o.length;a++)o[a]&&(o[a].__=e,t=su(o[a],t,n,i));return t}e.__e!=t&&(i&&(t&&e.type&&!t.parentNode&&(t=Zn(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function ng(e,t,n,i){var o,a,r,s=e.key,c=e.type,d=t[n],l=d!=null&&(2&d.__u)==0;if(d===null&&s==null||l&&s==d.key&&c==d.type)return n;if(i>(l?1:0)){for(o=n-1,a=n+1;o>=0||a<t.length;)if((d=t[r=o>=0?o--:a++])!=null&&!(2&d.__u)&&s==d.key&&c==d.type)return r}return-1}function id(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||eg.test(t)?n:n+"px"}function mo(e,t,n,i,o){var a,r;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof i=="string"&&(e.style.cssText=i=""),i)for(t in i)n&&t in n||id(e.style,t,"");if(n)for(t in n)i&&n[t]==i[t]||id(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")a=t!=(t=t.replace(nu,"$1")),r=t.toLowerCase(),t=r in e||t=="onFocusOut"||t=="onFocusIn"?r.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+a]=n,n?i?n.u=i.u:(n.u=vs,e.addEventListener(t,a?Br:Rr,a)):e.removeEventListener(t,a?Br:Rr,a);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function od(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t.t==null)t.t=vs++;else if(t.t<n.u)return;return n(Se.event?Se.event(t):t)}}}function ws(e,t,n,i,o,a,r,s,c,d){var l,p,u,m,h,g,f,w,E,v,y,P,x,I,N,R,B,S=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(c=!!(32&n.__u),a=[s=t.__e=n.__e]),(l=Se.__b)&&l(t);e:if(typeof S=="function")try{if(w=t.props,E="prototype"in S&&S.prototype.render,v=(l=S.contextType)&&i[l.__c],y=l?v?v.props.value:l.__:i,n.__c?f=(p=t.__c=n.__c).__=p.__E:(E?t.__c=p=new S(w,y):(t.__c=p=new Oo(w,y),p.constructor=S,p.render=og),v&&v.sub(p),p.state||(p.state={}),p.__n=i,u=p.__d=!0,p.__h=[],p._sb=[]),E&&p.__s==null&&(p.__s=p.state),E&&S.getDerivedStateFromProps!=null&&(p.__s==p.state&&(p.__s=Wt({},p.__s)),Wt(p.__s,S.getDerivedStateFromProps(w,p.__s))),m=p.props,h=p.state,p.__v=t,u)E&&S.getDerivedStateFromProps==null&&p.componentWillMount!=null&&p.componentWillMount(),E&&p.componentDidMount!=null&&p.__h.push(p.componentDidMount);else{if(E&&S.getDerivedStateFromProps==null&&w!==m&&p.componentWillReceiveProps!=null&&p.componentWillReceiveProps(w,y),t.__v==n.__v||!p.__e&&p.shouldComponentUpdate!=null&&p.shouldComponentUpdate(w,p.__s,y)===!1){for(t.__v!=n.__v&&(p.props=w,p.state=p.__s,p.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(k){k&&(k.__=t)}),P=0;P<p._sb.length;P++)p.__h.push(p._sb[P]);p._sb=[],p.__h.length&&r.push(p);break e}p.componentWillUpdate!=null&&p.componentWillUpdate(w,p.__s,y),E&&p.componentDidUpdate!=null&&p.__h.push(function(){p.componentDidUpdate(m,h,g)})}if(p.context=y,p.props=w,p.__P=e,p.__e=!1,x=Se.__r,I=0,E){for(p.state=p.__s,p.__d=!1,x&&x(t),l=p.render(p.props,p.state,p.context),N=0;N<p._sb.length;N++)p.__h.push(p._sb[N]);p._sb=[]}else do p.__d=!1,x&&x(t),l=p.render(p.props,p.state,p.context),p.state=p.__s;while(p.__d&&++I<25);p.state=p.__s,p.getChildContext!=null&&(i=Wt(Wt({},i),p.getChildContext())),E&&!u&&p.getSnapshotBeforeUpdate!=null&&(g=p.getSnapshotBeforeUpdate(m,h)),R=l,l!=null&&l.type===ba&&l.key==null&&(R=du(l.props.children)),s=ru(e,_a(R)?R:[R],t,n,i,o,a,r,s,c,d),p.base=t.__e,t.__u&=-161,p.__h.length&&r.push(p),f&&(p.__E=p.__=null)}catch(k){if(t.__v=null,c||a!=null)if(k.then){for(t.__u|=c?160:128;s&&s.nodeType==8&&s.nextSibling;)s=s.nextSibling;a[a.indexOf(s)]=null,t.__e=s}else{for(B=a.length;B--;)ys(a[B]);Ar(t)}else t.__e=n.__e,t.__k=n.__k,k.then||Ar(t);Se.__e(k,t,n)}else a==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):s=t.__e=ig(n.__e,t,n,i,o,a,r,c,d);return(l=Se.diffed)&&l(t),128&t.__u?void 0:s}function Ar(e){e&&e.__c&&(e.__c.__e=!0),e&&e.__k&&e.__k.forEach(Ar)}function cu(e,t,n){for(var i=0;i<n.length;i++)Es(n[i],n[++i],n[++i]);Se.__c&&Se.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(a){a.call(o)})}catch(a){Se.__e(a,o.__v)}})}function du(e){return typeof e!="object"||e==null||e.__b&&e.__b>0?e:_a(e)?e.map(du):Wt({},e)}function ig(e,t,n,i,o,a,r,s,c){var d,l,p,u,m,h,g,f=n.props||Di,w=t.props,E=t.type;if(E=="svg"?o="http://www.w3.org/2000/svg":E=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),a!=null){for(d=0;d<a.length;d++)if((m=a[d])&&"setAttribute"in m==!!E&&(E?m.localName==E:m.nodeType==3)){e=m,a[d]=null;break}}if(e==null){if(E==null)return document.createTextNode(w);e=document.createElementNS(o,E,w.is&&w),s&&(Se.__m&&Se.__m(t,a),s=!1),a=null}if(E==null)f===w||s&&e.data==w||(e.data=w);else{if(a=a&&ga.call(e.childNodes),!s&&a!=null)for(f={},d=0;d<e.attributes.length;d++)f[(m=e.attributes[d]).name]=m.value;for(d in f)if(m=f[d],d!="children"){if(d=="dangerouslySetInnerHTML")p=m;else if(!(d in w)){if(d=="value"&&"defaultValue"in w||d=="checked"&&"defaultChecked"in w)continue;mo(e,d,null,m,o)}}for(d in w)m=w[d],d=="children"?u=m:d=="dangerouslySetInnerHTML"?l=m:d=="value"?h=m:d=="checked"?g=m:s&&typeof m!="function"||f[d]===m||mo(e,d,m,f[d],o);if(l)s||p&&(l.__html==p.__html||l.__html==e.innerHTML)||(e.innerHTML=l.__html),t.__k=[];else if(p&&(e.innerHTML=""),ru(t.type=="template"?e.content:e,_a(u)?u:[u],t,n,i,E=="foreignObject"?"http://www.w3.org/1999/xhtml":o,a,r,a?a[0]:n.__k&&Zn(n,0),s,c),a!=null)for(d=a.length;d--;)ys(a[d]);s||(d="value",E=="progress"&&h==null?e.removeAttribute("value"):h!=null&&(h!==e[d]||E=="progress"&&!h||E=="option"&&h!=f[d])&&mo(e,d,h,f[d],o),d="checked",g!=null&&g!=e[d]&&mo(e,d,g,f[d],o))}return e}function Es(e,t,n){try{if(typeof e=="function"){var i=typeof e.__u=="function";i&&e.__u(),i&&t==null||(e.__u=e(t))}else e.current=t}catch(o){Se.__e(o,n)}}function pu(e,t,n){var i,o;if(Se.unmount&&Se.unmount(e),(i=e.ref)&&(i.current&&i.current!=e.__e||Es(i,null,t)),(i=e.__c)!=null){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(a){Se.__e(a,t)}i.base=i.__P=null}if(i=e.__k)for(o=0;o<i.length;o++)i[o]&&pu(i[o],t,n||typeof e.type!="function");n||ys(e.__e),e.__c=e.__=e.__e=void 0}function og(e,t,n){return this.constructor(e,n)}function lu(e,t,n){var i,o,a,r;t==document&&(t=document.documentElement),Se.__&&Se.__(e,t),o=(i=!1)?null:t.__k,a=[],r=[],ws(t,e=t.__k=ou(ba,null,[e]),o||Di,Di,t.namespaceURI,o?null:t.firstChild?ga.call(t.childNodes):null,a,o?o.__e:t.firstChild,i,r),cu(a,e,r)}ga=iu.slice,Se={__e:function(e,t,n,i){for(var o,a,r;t=t.__;)if((o=t.__c)&&!o.__)try{if((a=o.constructor)&&a.getDerivedStateFromError!=null&&(o.setState(a.getDerivedStateFromError(e)),r=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,i||{}),r=o.__d),r)return o.__E=o}catch(s){e=s}throw e}},Ql=0,Oo.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=Wt({},this.state),typeof e=="function"&&(e=e(Wt({},n),this.props)),e&&Wt(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),nd(this))},Oo.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),nd(this))},Oo.prototype.render=ba,An=[],eu=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,tu=function(e,t){return e.__v.__b-t.__v.__b},Yo.__r=0,nu=/(PointerCapture)$|Capture$/i,vs=0,Rr=od(!1),Br=od(!0);var uu=function(e,t,n,i){var o;t[0]=0;for(var a=1;a<t.length;a++){var r=t[a++],s=t[a]?(t[0]|=r?1:2,n[t[a++]]):t[++a];r===3?i[0]=s:r===4?i[1]=Object.assign(i[1]||{},s):r===5?(i[1]=i[1]||{})[t[++a]]=s:r===6?i[1][t[++a]]+=s+"":r?(o=e.apply(s,uu(e,s,n,["",null])),i.push(o),s[0]?t[0]|=2:(t[a-2]=0,t[a]=o)):i.push(s)}return i},ad=new Map;function ag(e){var t=ad.get(this);return t||(t=new Map,ad.set(this,t)),(t=uu(this,t.get(e)||(t.set(e,t=function(n){for(var i,o,a=1,r="",s="",c=[0],d=function(u){a===1&&(u||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?c.push(0,u,r):a===3&&(u||r)?(c.push(3,u,r),a=2):a===2&&r==="..."&&u?c.push(4,u,0):a===2&&r&&!u?c.push(5,0,!0,r):a>=5&&((r||!u&&a===5)&&(c.push(a,0,r,o),a=6),u&&(c.push(a,u,0,o),a=6)),r=""},l=0;l<n.length;l++){l&&(a===1&&d(),d(l));for(var p=0;p<n[l].length;p++)i=n[l][p],a===1?i==="<"?(d(),c=[c],a=3):r+=i:a===4?r==="--"&&i===">"?(a=1,r=""):r=i+r[0]:s?i===s?s="":r+=i:i==='"'||i==="'"?s=i:i===">"?(d(),a=1):a&&(i==="="?(a=5,o=r,r=""):i==="/"&&(a<5||n[l][p+1]===">")?(d(),a===3&&(c=c[0]),a=c,(c=c[0]).push(2,0,a),a=0):i===" "||i==="	"||i===`
`||i==="\r"?(d(),a=2):r+=i),a===3&&r==="!--"&&(a=4,c=c[0])}return d(),c}(e)),t),arguments,[])).length>1?t:t[0]}var Be=ag.bind(ou),Xn,Ie,ar,rd,Ii=0,mu=[],je=Se,sd=je.__b,cd=je.__r,dd=je.diffed,pd=je.__c,ld=je.unmount,ud=je.__;function va(e,t){je.__h&&je.__h(Ie,e,Ii||t),Ii=0;var n=Ie.__H||(Ie.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function rr(e){return Ii=1,rg(fu,e)}function rg(e,t,n){var i=va(Xn++,2);if(i.t=e,!i.__c&&(i.__=[fu(void 0,t),function(s){var c=i.__N?i.__N[0]:i.__[0],d=i.t(c,s);c!==d&&(i.__N=[d,i.__[1]],i.__c.setState({}))}],i.__c=Ie,!Ie.__f)){var o=function(s,c,d){if(!i.__c.__H)return!0;var l=i.__c.__H.__.filter(function(u){return!!u.__c});if(l.every(function(u){return!u.__N}))return!a||a.call(this,s,c,d);var p=i.__c.props!==s;return l.forEach(function(u){if(u.__N){var m=u.__[0];u.__=u.__N,u.__N=void 0,m!==u.__[0]&&(p=!0)}}),a&&a.call(this,s,c,d)||p};Ie.__f=!0;var a=Ie.shouldComponentUpdate,r=Ie.componentWillUpdate;Ie.componentWillUpdate=function(s,c,d){if(this.__e){var l=a;a=void 0,o(s,c,d),a=l}r&&r.call(this,s,c,d)},Ie.shouldComponentUpdate=o}return i.__N||i.__}function kr(e,t){var n=va(Xn++,3);!je.__s&&xs(n.__H,t)&&(n.__=e,n.u=t,Ie.__H.__h.push(n))}function Dr(e,t){var n=va(Xn++,4);!je.__s&&xs(n.__H,t)&&(n.__=e,n.u=t,Ie.__h.push(n))}function hu(e){return Ii=5,Jn(function(){return{current:e}},[])}function Jn(e,t){var n=va(Xn++,7);return xs(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function gi(e,t){return Ii=8,Jn(function(){return e},t)}function sg(){for(var e;e=mu.shift();)if(e.__P&&e.__H)try{e.__H.__h.forEach(Lo),e.__H.__h.forEach(Ir),e.__H.__h=[]}catch(t){e.__H.__h=[],je.__e(t,e.__v)}}je.__b=function(e){Ie=null,sd&&sd(e)},je.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),ud&&ud(e,t)},je.__r=function(e){cd&&cd(e),Xn=0;var t=(Ie=e.__c).__H;t&&(ar===Ie?(t.__h=[],Ie.__h=[],t.__.forEach(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.forEach(Lo),t.__h.forEach(Ir),t.__h=[],Xn=0)),ar=Ie},je.diffed=function(e){dd&&dd(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(mu.push(t)!==1&&rd===je.requestAnimationFrame||((rd=je.requestAnimationFrame)||cg)(sg)),t.__H.__.forEach(function(n){n.u&&(n.__H=n.u),n.u=void 0})),ar=Ie=null},je.__c=function(e,t){t.some(function(n){try{n.__h.forEach(Lo),n.__h=n.__h.filter(function(i){return!i.__||Ir(i)})}catch(i){t.some(function(o){o.__h&&(o.__h=[])}),t=[],je.__e(i,n.__v)}}),pd&&pd(e,t)},je.unmount=function(e){ld&&ld(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.forEach(function(i){try{Lo(i)}catch(o){t=o}}),n.__H=void 0,t&&je.__e(t,n.__v))};var md=typeof requestAnimationFrame=="function";function cg(e){var t,n=function(){clearTimeout(i),md&&cancelAnimationFrame(t),setTimeout(e)},i=setTimeout(n,35);md&&(t=requestAnimationFrame(n))}function Lo(e){var t=Ie,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),Ie=t}function Ir(e){var t=Ie;e.__c=e.__(),Ie=t}function xs(e,t){return!e||e.length!==t.length||t.some(function(n,i){return n!==e[i]})}function fu(e,t){return typeof t=="function"?t(e):t}function gu(e){var t,n,i="";if(typeof e=="string"||typeof e=="number")i+=e;else if(typeof e=="object")if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(n=gu(e[t]))&&(i&&(i+=" "),i+=n)}else for(n in e)e[n]&&(i&&(i+=" "),i+=n);return i}function Ko(){for(var e,t,n=0,i="",o=arguments.length;n<o;n++)(e=arguments[n])&&(t=gu(e))&&(i&&(i+=" "),i+=t);return i}function dg(e){const{headerEntries:t,onSelect:n,selectedEntry:i,setSelectedEntry:o,title:a}=e,r=Jn(()=>pg(t),[t]);return Be`
    <div class="djs-popup-header">
      <h3 class="djs-popup-title" title=${a}>${a}</h3>
      ${r.map(s=>Be`
        <ul key=${s.id} class="djs-popup-header-group" data-header-group=${s.id}>

          ${s.entries.map(c=>Be`
            <li key=${c.id}>
              <${c.action?"button":"span"}
                class=${lg(c,c===i)}
                onClick=${d=>c.action&&n(d,c)}
                title=${c.title||c.label}
                data-id=${c.id}
                onMouseEnter=${()=>c.action&&o(c)}
                onMouseLeave=${()=>c.action&&o(null)}
                onFocus=${()=>c.action&&o(c)}
                onBlur=${()=>c.action&&o(null)}
              >
                ${c.imageUrl&&Be`<img class="djs-popup-entry-icon" src=${c.imageUrl} alt="" />`||c.imageHtml&&Be`<div class="djs-popup-entry-icon" dangerouslySetInnerHTML=${{__html:c.imageHtml}} />`}
                ${c.label?Be`
                  <span class="djs-popup-label">${c.label}</span>
                `:null}
              </${c.action?"button":"span"}>
            </li>
          `)}
        </ul>
      `)}
    </div>
  `}function pg(e){return e.reduce((t,n)=>{const i=n.group||"default",o=t.find(a=>a.id===i);return o?o.entries.push(n):t.push({id:i,entries:[n]}),t},[])}function lg(e,t){return Ko("entry",e.className,e.active?"active":"",e.disabled?"disabled":"",t?"selected":"")}function ug(e){const{entry:t,selected:n,onMouseEnter:i,onMouseLeave:o,onAction:a}=e;return Be`
    <li
      class=${Ko("entry",{selected:n})}
      data-id=${t.id}
      title=${t.title||t.label}
      tabIndex="0"
      onClick=${a}
      onFocus=${i}
      onBlur=${o}
      onMouseEnter=${i}
      onMouseLeave=${o}
      onDragStart=${r=>a(r,t,"dragstart")}
      draggable=${!0}
    >
      <div class="djs-popup-entry-content">
        <span
          class=${Ko("djs-popup-entry-name",t.className)}
        >
          ${t.imageUrl&&Be`<img class="djs-popup-entry-icon" src=${t.imageUrl} alt="" />`||t.imageHtml&&Be`<div class="djs-popup-entry-icon" dangerouslySetInnerHTML=${{__html:t.imageHtml}} />`}

          ${t.label?Be`
            <span class="djs-popup-label">
              ${t.label}
            </span>
          `:null}
        </span>
        ${t.description&&Be`
          <span
            class="djs-popup-entry-description"
            title=${t.description}
          >
            ${t.description}
          </span>
        `}
      </div>
      ${t.documentationRef&&Be`
        <div class="djs-popup-entry-docs">
          <a
            href="${t.documentationRef}"
            onClick=${r=>r.stopPropagation()}
            title="Open element documentation"
            target="_blank"
            rel="noopener"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6368 10.6375V5.91761H11.9995V10.6382C11.9995 10.9973 11.8623 11.3141 11.5878 11.5885C11.3134 11.863 10.9966 12.0002 10.6375 12.0002H1.36266C0.982345 12.0002 0.660159 11.8681 0.396102 11.6041C0.132044 11.34 1.52588e-05 11.0178 1.52588e-05 10.6375V1.36267C1.52588e-05 0.98236 0.132044 0.660173 0.396102 0.396116C0.660159 0.132058 0.982345 2.95639e-05 1.36266 2.95639e-05H5.91624V1.36267H1.36266V10.6375H10.6368ZM12 0H7.2794L7.27873 1.36197H9.68701L3.06507 7.98391L4.01541 8.93425L10.6373 2.31231V4.72059H12V0Z" fill="#818798"/>
            </svg>
          </a>
        </div>
      `}
    </li>
  `}function mg(e){const{selectedEntry:t,setSelectedEntry:n,entries:i,...o}=e,a=hu(),r=Jn(()=>hg(i),[i]);return Dr(()=>{const s=a.current;if(!s)return;const c=s.querySelector(".selected");c&&fg(c)},[t]),Be`
    <div class="djs-popup-results" ref=${a}>
      ${r.map(s=>Be`
        ${s.name&&Be`
          <div key=${s.id} class="entry-header" title=${s.name}>
            ${s.name}
          </div>
        `}
        <ul class="djs-popup-group" data-group=${s.id}>
          ${s.entries.map(c=>Be`
            <${ug}
              key=${c.id}
              entry=${c}
              selected=${c===t}
              onMouseEnter=${()=>n(c)}
              onMouseLeave=${()=>n(null)}
              ...${o}
            />
          `)}
        </ul>
      `)}
    </div>
  `}function hg(e){const t=[],n=a=>t.find(r=>a.id===r.id),i=a=>!!n(a),o=a=>typeof a=="string"?{id:a}:a;return e.forEach(a=>{const r=a.group?o(a.group):{id:"default"};i(r)?n(r).entries.push(a):t.push({...r,entries:[a]})}),t}function fg(e){typeof e.scrollIntoViewIfNeeded=="function"?e.scrollIntoViewIfNeeded():e.scrollIntoView({scrollMode:"if-needed",block:"nearest"})}function gg(e){const{onClose:t,onSelect:n,className:i,headerEntries:o,position:a,title:r,width:s,scale:c,search:d,emptyPlaceholder:l,entries:p,onOpened:u,onClosed:m}=e,h=Jn(()=>ut(d)?p.length>5:!1,[d,p]),[g,f]=rr(""),w=gi((S,k)=>{if(!h)return S;const W=O=>{if(!k)return(O.rank||0)>=0;if(O.searchable===!1)return!1;const ne=[O.description||"",O.label||"",O.search||""].map(me=>me.toLowerCase());return k.toLowerCase().split(/\s/g).every(me=>ne.some(Pe=>Pe.includes(me)))};return S.filter(W)},[h]),[E,v]=rr(w(p,g)),[y,P]=rr(E[0]),x=gi(S=>{(!y||!S.includes(y))&&P(S[0]),v(S)},[y,v,P]);kr(()=>{x(w(p,g))},[g,p]);const I=gi(S=>{let W=E.indexOf(y)+S;W<0&&(W=E.length-1),W>=E.length&&(W=0),P(E[W])},[E,y,P]),N=gi(S=>{if(S.key==="Enter"&&y)return n(S,y);if(S.key==="ArrowUp")return I(-1),S.preventDefault();if(S.key==="ArrowDown")return I(1),S.preventDefault()},[n,y,I]),R=gi(S=>{sa(S.target,"input")&&f(()=>S.target.value)},[f]);kr(()=>(u(),()=>{m()}),[]);const B=Jn(()=>r||o.length>0,[r,o]);return Be`
    <${hd}
      onClose=${t}
      onKeyup=${R}
      onKeydown=${N}
      className=${i}
      position=${a}
      width=${s}
      scale=${c}
    >
      ${B&&Be`
        <${dg}
          headerEntries=${o}
          onSelect=${n}
          selectedEntry=${y}
          setSelectedEntry=${P}
          title=${r}
        />
      `}
      ${p.length>0&&Be`
        <div class="djs-popup-body">

          ${h&&Be`
          <div class="djs-popup-search">
            <svg class="djs-popup-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
            </svg>
            <input type="text" spellcheck=${!1} aria-label="${r}" />
          </div>
          `}

          <${mg}
            entries=${E}
            selectedEntry=${y}
            setSelectedEntry=${P}
            onAction=${n}
          />
        </div>
      `}
    ${l&&E.length===0&&Be`
      <div class="djs-popup-no-results">${xt(l)?l(g):l}</div>
    `}
    </${hd}>
  `}function hd(e){const{onClose:t,onKeydown:n,onKeyup:i,className:o,children:a,position:r}=e,s=hu();return Dr(()=>{if(typeof r!="function")return;const c=s.current,d=r(c);c.style.left=`${d.x}px`,c.style.top=`${d.y}px`},[s.current,r]),Dr(()=>{const c=s.current;if(!c)return;(c.querySelector("input")||c).focus()},[]),kr(()=>{const c=l=>{if(l.key==="Escape")return l.preventDefault(),t()},d=l=>{if(!Fn(l.target,".djs-popup",!0))return t()};return document.documentElement.addEventListener("keydown",c),document.body.addEventListener("click",d),()=>{document.documentElement.removeEventListener("keydown",c),document.body.removeEventListener("click",d)}},[]),Be`
    <div
      class=${Ko("djs-popup",o)}
      style=${_g(e)}
      onKeydown=${n}
      onKeyup=${i}
      ref=${s}
      tabIndex="-1"
    >
      ${a}
    </div>
  `}function _g(e){return{transform:`scale(${e.scale})`,width:`${e.width}px`,"transform-origin":"top left"}}var bg="data-id",_u=["contextPad.close","canvas.viewbox.changing","commandStack.changed"],vg=1e3;function Me(e,t,n){this._eventBus=t,this._canvas=n,this._current=null;var i=ut(e&&e.scale)?e.scale:{min:1,max:1};this._config={scale:i},t.on("diagram.destroy",()=>{this.close()}),t.on("element.changed",o=>{const a=this.isOpen()&&this._current.target;o.element===a&&this.refresh()})}Me.$inject=["config.popupMenu","eventBus","canvas"];Me.prototype._render=function(){const{position:e,providerId:t,entries:n,headerEntries:i,emptyPlaceholder:o,options:a}=this._current,r=Object.entries(n).map(([u,m])=>({id:u,...m})),s=Object.entries(i).map(([u,m])=>({id:u,...m})),c=e&&(u=>this._ensureVisible(u,e)),d=this._updateScale(this._current.container);lu(Be`
      <${gg}
        onClose=${u=>this.close(u)}
        onSelect=${(u,m,h)=>this.trigger(u,m,h)}
        position=${c}
        className=${t}
        entries=${r}
        headerEntries=${s}
        emptyPlaceholder=${o}
        scale=${d}
        onOpened=${this._onOpened.bind(this)}
        onClosed=${this._onClosed.bind(this)}
        ...${{...a}}
      />
    `,this._current.container)};Me.prototype.open=function(e,t,n,i){if(!e)throw new Error("target is missing");if(!t)throw new Error("providers for <"+t+"> not found");if(!n)throw new Error("position is missing");this.isOpen()&&this.close();const{entries:o,headerEntries:a,emptyPlaceholder:r}=this._getContext(e,t);this._current={position:n,providerId:t,target:e,entries:o,headerEntries:a,emptyPlaceholder:r,container:this._createContainer({provider:t}),options:i},this._emit("open"),this._bindAutoClose(),this._render()};Me.prototype.refresh=function(){if(!this.isOpen())return;const{target:e,providerId:t}=this._current,{entries:n,headerEntries:i,emptyPlaceholder:o}=this._getContext(e,t);this._current={...this._current,entries:n,headerEntries:i,emptyPlaceholder:o},this._emit("refresh"),this._render()};Me.prototype._getContext=function(e,t){const n=this._getProviders(t);if(!n||!n.length)throw new Error("provider for <"+t+"> not found");const i=this._getEntries(e,n),o=this._getHeaderEntries(e,n),a=this._getEmptyPlaceholder(n);return{entries:i,headerEntries:o,emptyPlaceholder:a,empty:!(Object.keys(i).length||Object.keys(o).length)}};Me.prototype.close=function(){this.isOpen()&&(this._emit("close"),this.reset(),this._current=null)};Me.prototype.reset=function(){const e=this._current.container;lu(null,e),xr(e)};Me.prototype._emit=function(e,t){this._eventBus.fire(`popupMenu.${e}`,t)};Me.prototype._onOpened=function(){this._emit("opened")};Me.prototype._onClosed=function(){this._emit("closed")};Me.prototype._createContainer=function(e){var t=this._canvas,n=t.getContainer();const i=at(`<div class="djs-popup-parent djs-scrollable" data-popup=${e.provider}></div>`);return n.appendChild(i),i};Me.prototype._bindAutoClose=function(){this._eventBus.once(_u,this.close,this)};Me.prototype._unbindAutoClose=function(){this._eventBus.off(_u,this.close,this)};Me.prototype._updateScale=function(){var e=this._canvas.zoom(),t=this._config.scale,n,i,o=e;return t!==!0&&(t===!1?(n=1,i=1):(n=t.min,i=t.max),ut(n)&&e<n&&(o=n),ut(i)&&e>i&&(o=i)),o};Me.prototype._ensureVisible=function(e,t){var n=document.documentElement.getBoundingClientRect(),i=e.getBoundingClientRect(),o={},a=t.x,r=t.y;return t.x+i.width>n.width&&(o.x=!0),t.y+i.height>n.height&&(o.y=!0),o.x&&o.y?(a=t.x-i.width,r=t.y-i.height):o.x?(a=t.x-i.width,r=t.y):o.y&&t.y<i.height?(a=t.x,r=10):o.y&&(a=t.x,r=t.y-i.height),t.y<n.top&&(r=t.y+i.height),{x:a,y:r}};Me.prototype.isEmpty=function(e,t){if(!e)throw new Error("target is missing");if(!t)throw new Error("provider ID is missing");const n=this._getProviders(t);return!n||!n.length?!0:this._getContext(e,t).empty};Me.prototype.registerProvider=function(e,t,n){n||(n=t,t=vg),this._eventBus.on("popupMenu.getProviders."+e,t,function(i){i.providers.push(n)})};Me.prototype._getProviders=function(e){var t=this._eventBus.createEvent({type:"popupMenu.getProviders."+e,providers:[]});return this._eventBus.fire(t),t.providers};Me.prototype._getEntries=function(e,t){var n={};return T(t,function(i){if(!i.getPopupMenuEntries){T(i.getEntries(e),function(a){var r=a.id;if(!r)throw new Error("entry ID is missing");n[r]=Bt(a,["id"])});return}var o=i.getPopupMenuEntries(e);xt(o)?n=o(n):T(o,function(a,r){n[r]=a})}),n};Me.prototype._getHeaderEntries=function(e,t){var n={};return T(t,function(i){if(!i.getPopupMenuHeaderEntries){if(!i.getHeaderEntries)return;T(i.getHeaderEntries(e),function(a){var r=a.id;if(!r)throw new Error("entry ID is missing");n[r]=Bt(a,["id"])});return}var o=i.getPopupMenuHeaderEntries(e);xt(o)?n=o(n):T(o,function(a,r){n[r]=a})}),n};Me.prototype._getEmptyPlaceholder=function(e){const t=e.find(n=>xt(n.getEmptyPlaceholder));return t&&t.getEmptyPlaceholder()};Me.prototype.isOpen=function(){return!!this._current};Me.prototype.trigger=function(e,t,n="click"){if(e.preventDefault(),!t){let o=Fn(e.delegateTarget||e.target,".entry",!0),a=ct(o,bg);t={id:a,...this._getEntry(a)}}const i=t.action;if(this._emit("trigger",{entry:t,event:e})!==!1){if(xt(i)){if(n==="click")return i(e,t)}else if(i[n])return i[n](e,t)}};Me.prototype._getEntry=function(e){var t=this._current.entries[e]||this._current.headerEntries[e];if(!t)throw new Error("entry not found");return t};const Ps={__init__:["popupMenu"],popupMenu:["type",Me]};var bu={align:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000">
              <line x1="200" y1="150" x2="200" y2="1850" style="stroke:currentColor;stroke-width:100;stroke-linecap:round;"/>
              <rect x="500" y="150" width="1300" height="700" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
              <rect x="500" y="1150" width="700" height="700" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
          </svg>`,bottom:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
            <line x1="150" y1="1650" x2="1650" y2="1650" style="stroke:currentColor;stroke-width:100;stroke-linecap:round;"/>
            <rect x="150" y="350" width="600" height="1300" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
            <rect x="1050" y="850" width="600" height="800" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
          </svg>`,center:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
            <line x1="900" y1="150" x2="900" y2="1650" style="stroke:currentColor;stroke-width:100;stroke-linecap:round;"/>
            <rect x="250" y="150" width="1300" height="600" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
            <rect x="500" y="1050" width="800" height="600" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
          </svg>`,left:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
            <line x1="100" y1="150" x2="100" y2="1650" style="stroke:currentColor;stroke-width:100;stroke-linecap:round;"/>
            <rect x="100" y="150" width="1300" height="600" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
            <rect x="100" y="1050" width="800" height="600" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
          </svg>`,right:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
            <line x1="1650" y1="150" x2="1650" y2="1650" style="stroke:currentColor;stroke-width:100;stroke-linecap:round;"/>
            <rect x="350" y="150" width="1300" height="600" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
            <rect x="850" y="1050" width="800" height="600" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
          </svg>`,top:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
            <line x1="150" y1="150" x2="1650" y2="150" style="stroke:currentColor;stroke-width:100;stroke-linecap:round;"/>
            <rect x="150" y="150" width="600" height="1300" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
            <rect x="1050" y="150" width="600" height="800" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
          </svg>`,middle:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
            <line x1="150" y1="900" x2="1650" y2="900" style="stroke:currentColor;stroke-width:100;stroke-linecap:round;"/>
            <rect x="150" y="250" width="600" height="1300" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
            <rect x="1050" y="500" width="600" height="800" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
          </svg>`},yg=900;function si(e,t,n,i){e.registerProvider(yg,this),this._contextPad=e,this._popupMenu=t,this._translate=n,this._canvas=i}si.$inject=["contextPad","popupMenu","translate","canvas"];si.prototype.getMultiElementContextPadEntries=function(e){var t={};return this._isAllowed(e)&&C(t,this._getEntries(e)),t};si.prototype._isAllowed=function(e){return!this._popupMenu.isEmpty(e,"align-elements")};si.prototype._getEntries=function(){var e=this;return{"align-elements":{group:"align-elements",title:e._translate("Align elements"),html:`<div class="entry">${bu.align}</div>`,action:{click:function(t,n){var i=e._getMenuPosition(n);C(i,{cursor:{x:t.x,y:t.y}}),e._popupMenu.open(n,"align-elements",i)}}}}};si.prototype._getMenuPosition=function(e){var t=5,n=this._contextPad.getPad(e).html,i=n.getBoundingClientRect(),o={x:i.left,y:i.bottom+t};return o};var wg=["left","center","right","top","middle","bottom"];function qi(e,t,n,i){this._alignElements=t,this._translate=n,this._popupMenu=e,this._rules=i,e.registerProvider("align-elements",this)}qi.$inject=["popupMenu","alignElements","translate","rules"];qi.prototype.getPopupMenuEntries=function(e){var t={};return this._isAllowed(e)&&C(t,this._getEntries(e)),t};qi.prototype._isAllowed=function(e){return this._rules.allowed("elements.align",{elements:e})};qi.prototype._getEntries=function(e){var t=this._alignElements,n=this._translate,i=this._popupMenu,o={};return T(wg,function(a){o["align-elements-"+a]={group:"align",title:n("Align elements "+a),className:"bjs-align-elements-menu-entry",imageHtml:bu[a],action:function(){t.trigger(e,a),i.close()}}}),o};function Pt(e){D.call(this,e),this.init()}Pt.$inject=["eventBus"];z(Pt,D);Pt.prototype.addRule=function(e,t,n){var i=this;typeof e=="string"&&(e=[e]),e.forEach(function(o){i.canExecute(o,t,function(a,r,s){return n(a)},!0)})};Pt.prototype.init=function(){};function ya(e){Pt.call(this,e)}ya.$inject=["eventBus"];z(ya,Pt);ya.prototype.init=function(){this.addRule("elements.align",function(e){var t=e.elements,n=ae(t,function(i){return!(i.waypoints||i.host||i.labelTarget)});return n=da(n),n.length<2?!1:n})};const Eg={__depends__:[zf,Jl,Ps],__init__:["alignElementsContextPadProvider","alignElementsMenuProvider","bpmnAlignElements"],alignElementsContextPadProvider:["type",si],alignElementsMenuProvider:["type",qi],bpmnAlignElements:["type",ya]};var xg=10,vu=50,Pg=250;function Ss(e,t,n,i){for(var o;o=Sg(e,n,t);)n=i(t,n,o);return n}function Ts(e){return function(t,n,i){var o={x:n.x,y:n.y};return["x","y"].forEach(function(a){var r=e[a];if(r){var s=a==="x"?"width":"height",c=r.margin,d=r.minDistance;c<0?o[a]=Math.min(i[a]+c-t[s]/2,n[a]-d+c):o[a]=Math.max(i[a]+i[s]+c+t[s]/2,n[a]+d+c)}}),o}}function Sg(e,t,n){var i={x:t.x-n.width/2,y:t.y-n.height/2,width:n.width,height:n.height},o=Mg(e);return Te(o,function(a){if(a===n)return!1;var r=Qe(a,i,xg);return r==="intersect"})}function Tg(e,t){t||(t={});function n(h){return h.source===e?1:-1}var i=t.defaultDistance||vu,o=t.direction||"e",a=t.filter,r=t.getWeight||n,s=t.maxDistance||Pg,c=t.reference||"start";a||(a=Rg);function d(h,g){return o==="n"?c==="start"?U(h).top-U(g).bottom:c==="center"?U(h).top-Z(g).y:U(h).top-U(g).top:o==="w"?c==="start"?U(h).left-U(g).right:c==="center"?U(h).left-Z(g).x:U(h).left-U(g).left:o==="s"?c==="start"?U(g).top-U(h).bottom:c==="center"?Z(g).y-U(h).bottom:U(g).bottom-U(h).bottom:c==="start"?U(g).left-U(h).right:c==="center"?Z(g).x-U(h).right:U(g).right-U(h).right}var l=e.incoming.filter(a).map(function(h){var g=r(h),f=g<0?d(h.source,e):d(e,h.source);return{id:h.source.id,distance:f,weight:g}}),p=e.outgoing.filter(a).map(function(h){var g=r(h),f=g>0?d(e,h.target):d(h.target,e);return{id:h.target.id,distance:f,weight:g}}),u=l.concat(p).reduce(function(h,g){return h[g.id+"__weight_"+g.weight]=g,h},{}),m=gn(u,function(h,g){var f=g.distance,w=g.weight;return f<0||f>s||(h[String(f)]||(h[String(f)]=0),h[String(f)]+=1*w,(!h.distance||h[h.distance]<h[String(f)])&&(h.distance=f)),h},{});return m.distance||i}function Mg(e){var t=sr(e);return e.host&&(t=t.concat(sr(e.host))),e.attachers&&(t=t.concat(e.attachers.reduce(function(n,i){return n.concat(sr(i))},[]))),t}function sr(e){return Cg(e).concat(Ng(e))}function Ng(e){return e.incoming.map(function(t){return t.source})}function Cg(e){return e.outgoing.map(function(t){return t.target})}function Rg(){return!0}var Bg=100;function yu(e,t,n){e.on("autoPlace",Bg,function(i){var o=i.shape,a=i.source;return Ag(a,o)}),e.on("autoPlace.end",function(i){n.scrollToElement(i.shape)}),this.append=function(i,o,a){e.fire("autoPlace.start",{source:i,shape:o});var r=e.fire("autoPlace",{source:i,shape:o}),s=t.appendShape(i,o,r,i.parent,a);return e.fire("autoPlace.end",{source:i,shape:s}),s}}yu.$inject=["eventBus","modeling","canvas"];function Ag(e,t,n){n||(n={});var i=n.defaultDistance||vu,o=Z(e),a=U(e);return{x:a.right+i+t.width/2,y:o.y}}function wu(e,t){e.on("autoPlace.end",500,function(n){t.select(n.shape)})}wu.$inject=["eventBus","selection"];const kg={__init__:["autoPlaceSelectionBehavior"],autoPlace:["type",yu],autoPlaceSelectionBehavior:["type",wu]};function Qn(e,t){for(pa(t)&&(t=[t]);e=e.parent;)if(Q(e,t))return e;return null}function Eu(e,t){var n=Qn(e,"bpmn:Process");if(n)return!0;var i=["bpmn:Participant","bpmn:Lane"];if(n=Qn(e,i),n)return Ze(n);if(Q(e,i))return Ze(e);var o;for(o=G(e);o&&!_(o,"bpmn:Process");o=o.$parent);if(!t)return!0;var a=t.find(function(r){var s=G(r);return s&&s.get("processRef")===o});return a?Ze(a):!0}function xu(e,t,n){var i=Eu(e,n);if(_(t,"bpmn:TextAnnotation"))return Ig(e,t,i);if(Q(t,["bpmn:DataObjectReference","bpmn:DataStoreReference"]))return Fg(e,t,i);if(_(t,"bpmn:FlowNode"))return Dg(e,t,i)}function Dg(e,t,n){var i=U(e),o=Z(e),a=n?{directionHint:"e",minDistance:80,baseOrientation:"left",boundaryOrientation:"top",start:"top",end:"bottom"}:{directionHint:"s",minDistance:90,baseOrientation:"top",boundaryOrientation:"left",start:"left",end:"right"},r=Tg(e,{filter:function(m){return _(m,"bpmn:SequenceFlow")},direction:a.directionHint}),s=30,c=a.minDistance,d=a.baseOrientation;_(e,"bpmn:BoundaryEvent")&&(d=Qe(e,e.host,-25),d.indexOf(a.boundaryOrientation)!==-1&&(s*=-1));var l=n?{x:i.right+r+t.width/2,y:o.y+fd(d,c,a)}:{x:o.x+fd(d,c,a),y:i.bottom+r+t.height/2},p={margin:s,minDistance:c},u=n?{y:p}:{x:p};return Ss(e,t,l,Ts(u))}function fd(e,t,n){return e.includes(n.start)?-1*t:e.includes(n.end)?t:0}function Ig(e,t,n){var i=U(e),o=n?{x:i.right+t.width/2,y:i.top-50-t.height/2}:{x:i.right+50+t.width/2,y:i.bottom+t.height/2};ye(e)&&(o=Z(e),n?(o.x+=100,o.y-=50):(o.x+=100,o.y+=50));var a={margin:n?-30:30,minDistance:20},r=n?{y:a}:{x:a};return Ss(e,t,o,Ts(r))}function Fg(e,t,n){var i=U(e),o=n?{x:i.right-10+t.width/2,y:i.bottom+40+t.width/2}:{x:i.left-40-t.width/2,y:i.bottom-10+t.height/2},a={margin:30,minDistance:30},r=n?{x:a}:{y:a};return Ss(e,t,o,Ts(r))}function Pu(e,t){e.on("autoPlace",function(n){var i=n.shape,o=n.source;return xu(o,i,t)})}Pu.$inject=["eventBus","elementRegistry"];const Ms={__depends__:[kg],__init__:["bpmnAutoPlace"],bpmnAutoPlace:["type",Pu]};function Qt(e,t,n,i){D.call(this,e),this._elementRegistry=t,this._modeling=n,this._rules=i;var o=this;this.postExecuted(["shape.create"],function(a){var r=a.context,s=r.hints||{},c=r.shape,d=r.parent||r.newParent;s.autoResize!==!1&&o._expand([c],d)}),this.postExecuted(["elements.move"],function(a){var r=a.context,s=ss(cs(r.closure.topLevel)),c=r.hints,d=c?c.autoResize:!0;if(d!==!1){var l=la(s,function(p){return p.parent.id});T(l,function(p,u){se(d)&&(p=p.filter(function(m){return Te(d,Ut({id:m.id}))})),o._expand(p,u)})}}),this.postExecuted(["shape.toggleCollapse"],function(a){var r=a.context,s=r.hints,c=r.shape;s&&s.autoResize===!1||c.collapsed||o._expand(c.children||[],c)}),this.postExecuted(["shape.resize"],function(a){var r=a.context,s=r.hints,c=r.shape,d=c.parent;s&&s.autoResize===!1||d&&o._expand([c],d)})}Qt.$inject=["eventBus","elementRegistry","modeling","rules"];z(Qt,D);Qt.prototype._getOptimalBounds=function(e,t){var n=this.getOffset(t),i=this.getPadding(t),o=U(wt(e)),a=U(t),r={};return o.top-a.top<i.top&&(r.top=o.top-n.top),o.left-a.left<i.left&&(r.left=o.left-n.left),a.right-o.right<i.right&&(r.right=o.right+n.right),a.bottom-o.bottom<i.bottom&&(r.bottom=o.bottom+n.bottom),ds(C({},a,r))};Qt.prototype._expand=function(e,t){typeof t=="string"&&(t=this._elementRegistry.get(t));var n=this._rules.allowed("element.autoResize",{elements:e,target:t});if(n){var i=this._getOptimalBounds(e,t);if(Og(i,t)){var o=Lg(fn(t,["x","y","width","height"]),i);this.resize(t,i,{autoResize:o});var a=t.parent;a&&this._expand([t],a)}}};Qt.prototype.getOffset=function(e){return{top:60,bottom:60,left:100,right:100}};Qt.prototype.getPadding=function(e){return{top:2,bottom:2,left:15,right:15}};Qt.prototype.resize=function(e,t,n){this._modeling.resizeShape(e,t,null,n)};function Og(e,t){return e.x!==t.x||e.y!==t.y||e.width!==t.width||e.height!==t.height}function Lg(e,t){var n="";return e=U(e),t=U(t),e.top>t.top&&(n=n.concat("n")),e.right<t.right&&(n=n.concat("w")),e.bottom<t.bottom&&(n=n.concat("s")),e.left>t.left&&(n=n.concat("e")),n}function wa(e){e.invoke(Qt,this)}wa.$inject=["injector"];z(wa,Qt);wa.prototype.resize=function(e,t,n){_(e,"bpmn:Participant")?this._modeling.resizeLane(e,t,null,n):this._modeling.resizeShape(e,t,null,n)};function Hi(e){Pt.call(this,e);var t=this;this.addRule("element.autoResize",function(n){return t.canResize(n.elements,n.target)})}Hi.$inject=["eventBus"];z(Hi,Pt);Hi.prototype.canResize=function(e,t){return!1};function Ea(e,t){Hi.call(this,e),this._modeling=t}z(Ea,Hi);Ea.$inject=["eventBus","modeling"];Ea.prototype.canResize=function(e,t){if(_(t.di,"bpmndi:BPMNPlane")||!_(t,"bpmn:Participant")&&!_(t,"bpmn:Lane")&&!_(t,"bpmn:SubProcess"))return!1;var n=!0;return T(e,function(i){if(_(i,"bpmn:Lane")||ce(i)){n=!1;return}}),n};const Gg={__init__:["bpmnAutoResize","bpmnAutoResizeProvider"],bpmnAutoResize:["type",wa],bpmnAutoResizeProvider:["type",Ea]};var gd=1500;function Su(e,t,n){var i=this,o=n.get("dragging",!1);function a(r){if(!r.hover){var s=r.originalEvent,c=i._findTargetGfx(s),d=c&&e.get(c);c&&d&&(r.stopPropagation(),o.hover({element:d,gfx:c}),o.move(s))}}o&&t.on("drag.start",function(r){t.once("drag.move",gd,function(s){a(s)})}),function(){var r,s;t.on("element.hover",function(c){r=c.gfx,s=c.element}),t.on("element.hover",gd,function(c){s&&t.fire("element.out",{element:s,gfx:r})}),t.on("element.out",function(){r=null,s=null})}(),this._findTargetGfx=function(r){var s,c;if(r instanceof MouseEvent)return s=In(r),c=document.elementFromPoint(s.x,s.y),jg(c)}}Su.$inject=["elementRegistry","eventBus","injector"];function jg(e){return Fn(e,"svg, .djs-element",!0)}const $g={__init__:["hoverFix"],hoverFix:["type",Su]};var $n=Math.round,_d="djs-drag-active";function Cn(e){e.preventDefault()}function qg(e){return typeof TouchEvent<"u"&&e instanceof TouchEvent}function Hg(e){return Math.sqrt(Math.pow(e.x,2)+Math.pow(e.y,2))}function Tu(e,t,n,i){var o={threshold:5,trapClick:!0},a;function r(v){var y=t.viewbox(),P=t._container.getBoundingClientRect();return{x:y.x+(v.x-P.left)/y.scale,y:y.y+(v.y-P.top)/y.scale}}function s(v,y){y=y||a;var P=e.createEvent(C({},y.payload,y.data,{isTouch:y.isTouch}));return e.fire("drag."+v,P)===!1?!1:e.fire(y.prefix+"."+v,P)}function c(v){var y=v.filter(function(P){return i.get(P.id)});y.length&&n.select(y)}function d(v,y){var P=a.payload,x=a.displacement,I=a.globalStart,N=In(v),R=Rt(N,I),B=a.localStart,S=r(N),k=Rt(S,B);if(!a.active&&(y||Hg(R)>a.threshold)){if(C(P,{x:$n(B.x+x.x),y:$n(B.y+x.y),dx:0,dy:0},{originalEvent:v}),s("start")===!1)return f();a.active=!0,a.keepSelection||(P.previousSelection=n.get(),n.select(null)),a.cursor&&fa(a.cursor),t.addMarker(t.getRootElement(),_d)}ir(v),a.active&&(C(P,{x:$n(S.x+x.x),y:$n(S.y+x.y),dx:$n(k.x),dy:$n(k.y)},{originalEvent:v}),s("move"))}function l(v){var y,P=!0;a.active&&(v&&(a.payload.originalEvent=v,ir(v)),P=s("end")),P===!1&&s("rejected"),y=w(P!==!0),s("ended",y)}function p(v){He("Escape",v)&&(Cn(v),f())}function u(v){var y;a.active&&(y=Wl(e),setTimeout(y,400),Cn(v)),l(v)}function m(v){d(v)}function h(v){var y=a.payload;y.hoverGfx=v.gfx,y.hover=v.element,s("hover")}function g(v){s("out");var y=a.payload;y.hoverGfx=null,y.hover=null}function f(v){var y;if(a){var P=a.active;P&&s("cancel"),y=w(v),P&&s("canceled",y)}}function w(v){var y,P;s("cleanup"),Vl(),a.trapClick?P=u:P=l,ue.unbind(document,"mousemove",d),ue.unbind(document,"dragstart",Cn),ue.unbind(document,"selectstart",Cn),ue.unbind(document,"mousedown",P,!0),ue.unbind(document,"mouseup",P,!0),ue.unbind(document,"keyup",p),ue.unbind(document,"touchstart",m,!0),ue.unbind(document,"touchcancel",f,!0),ue.unbind(document,"touchmove",d,!0),ue.unbind(document,"touchend",l,!0),e.off("element.hover",h),e.off("element.out",g),t.removeMarker(t.getRootElement(),_d);var x=a.payload.previousSelection;return v!==!1&&x&&!n.get().length&&c(x),y=a,a=null,y}function E(v,y,P,x){a&&f(!1),typeof y=="string"&&(x=P,P=y,y=null),x=C({},o,x||{});var I=x.data||{},N,R,B,S,k;x.trapClick?S=u:S=l,v?(N=Al(v)||v,R=In(v),ir(v),N.type==="dragstart"&&Cn(N)):(N=null,R={x:0,y:0}),B=r(R),y||(y=B),k=qg(N),a=C({prefix:P,data:I,payload:{},globalStart:R,displacement:Rt(y,B),localStart:B,isTouch:k},x),x.manual||(k?(ue.bind(document,"touchstart",m,!0),ue.bind(document,"touchcancel",f,!0),ue.bind(document,"touchmove",d,!0),ue.bind(document,"touchend",l,!0)):(ue.bind(document,"mousemove",d),ue.bind(document,"dragstart",Cn),ue.bind(document,"selectstart",Cn),ue.bind(document,"mousedown",S,!0),ue.bind(document,"mouseup",S,!0)),ue.bind(document,"keyup",p),e.on("element.hover",h),e.on("element.out",g)),s("init"),x.autoActivate&&d(v,!0)}e.on("diagram.destroy",f),this.init=E,this.move=d,this.hover=h,this.out=g,this.end=l,this.cancel=f,this.context=function(){return a},this.setOptions=function(v){C(o,v)}}Tu.$inject=["eventBus","canvas","selection","elementRegistry"];const en={__depends__:[$g,Jt],dragging:["type",Tu]};function ci(e,t,n){this._canvas=n,this._opts=C({scrollThresholdIn:[20,20,20,20],scrollThresholdOut:[0,0,0,0],scrollRepeatTimeout:15,scrollStep:10},e);var i=this;t.on("drag.move",function(o){var a=i._toBorderPoint(o);i.startScroll(a)}),t.on(["drag.cleanup"],function(){i.stopScroll()})}ci.$inject=["config.autoScroll","eventBus","canvas"];ci.prototype.startScroll=function(e){var t=this._canvas,n=this._opts,i=this,o=t.getContainer().getBoundingClientRect(),a=[e.x,e.y,o.width-e.x,o.height-e.y];this.stopScroll();for(var r=0,s=0,c=0;c<4;c++)zg(a[c],n.scrollThresholdOut[c],n.scrollThresholdIn[c])&&(c===0?r=n.scrollStep:c==1?s=n.scrollStep:c==2?r=-n.scrollStep:c==3&&(s=-n.scrollStep));(r!==0||s!==0)&&(t.scroll({dx:r,dy:s}),this._scrolling=setTimeout(function(){i.startScroll(e)},n.scrollRepeatTimeout))};function zg(e,t,n){return t<e&&e<n}ci.prototype.stopScroll=function(){clearTimeout(this._scrolling)};ci.prototype.setOptions=function(e){this._opts=C({},this._opts,e)};ci.prototype._toBorderPoint=function(e){var t=this._canvas._container.getBoundingClientRect(),n=In(e.originalEvent);return{x:n.x-t.left,y:n.y-t.top}};const Vg={__depends__:[en],__init__:["autoScroll"],autoScroll:["type",ci]};function Ns(e){this._commandStack=e.get("commandStack",!1)}Ns.$inject=["injector"];Ns.prototype.allowed=function(e,t){var n=!0,i=this._commandStack;return i&&(n=i.canExecute(e,t)),n===void 0?!0:n};const $t={__init__:["rules"],rules:["type",Ns]};var ho=Math.round,Wg=Math.max;function Ug(e,t){var n=e.x,i=e.y;return[["M",n,i],["m",0,-t],["a",t,t,0,1,1,0,2*t],["a",t,t,0,1,1,0,-2*t],["z"]]}function Yg(e){var t=[];return e.forEach(function(n,i){t.push([i===0?"M":"L",n.x,n.y])}),t}var Mu=10;function Kg(e,t){var n,i;for(n=0;i=e[n];n++)if(kl(i,t)<=Mu)return{point:e[n],bendpoint:!0,index:n};return null}function Zg(e,t){var n=Xh(Ug(t,Mu),Yg(e)),i=n[0],o=n[n.length-1],a;return i?i!==o?i.segment2!==o.segment2?(a=Wg(i.segment2,o.segment2)-1,{point:e[a],bendpoint:!0,index:a}):{point:{x:ho(i.x+o.x)/2,y:ho(i.y+o.y)/2},index:i.segment2}:{point:{x:ho(i.x),y:ho(i.y)},index:i.segment2}:null}function Fr(e,t){return Kg(e,t)||Zg(e,t)}function Nu(e){return Math.sqrt(Math.pow(e.x,2)+Math.pow(e.y,2))}function bd(e){return Math.atan((e[1].y-e[0].y)/(e[1].x-e[0].x))}function Xg(e,t){return t?{x:Math.cos(t)*e.x-Math.sin(t)*e.y,y:Math.sin(t)*e.x+Math.cos(t)*e.y}:e}function Jg(e,t,n){var i=[{n:e[0]-n[0],lambda:t[0]},{n:e[1]-n[1],lambda:t[1]}],o=i[0].n*t[0]+i[1].n*t[1],a=i[0].lambda*t[0]+i[1].lambda*t[1];return-o/a}function Cs(e,t){var n=t[0],i=t[1],o={x:i.x-n.x,y:i.y-n.y},a=Jg([n.x,n.y],[o.x,o.y],[e.x,e.y]);return{x:n.x+a*o.x,y:n.y+a*o.y}}function Cu(e,t){var n=Cs(e,t),i={x:n.x-e.x,y:n.y-e.y};return Nu(i)}function Zo(e,t){return Nu({x:e.x-t.x,y:e.y-t.y})}var Ru="djs-bendpoint",Bu="djs-segment-dragger";function Qg(e,t){var n=In(t),i=e._container.getBoundingClientRect(),o;o={x:i.left,y:i.top};var a=e.viewbox();return{x:a.x+(n.x-o.x)/a.scale,y:a.y+(n.y-o.y)/a.scale}}function Or(e,t,n){var i=Qg(e,n),o=Fr(t,i);return o}function Lr(e,t){var n=be("g");xe(n).add(Ru),ve(e,n);var i=be("circle");J(i,{cx:0,cy:0,r:4}),xe(i).add("djs-visual"),ve(n,i);var o=be("circle");return J(o,{cx:0,cy:0,r:10}),xe(o).add("djs-hit"),ve(n,o),t&&xe(n).add(t),n}function e_(e,t,n,i){var o=be("g");ve(e,o);var a=18,r=6,s=11,c=n_(t,n,i),d=r+s,l=be("rect");J(l,{x:-a/2,y:-r/2,width:a,height:r}),xe(l).add("djs-visual"),ve(o,l);var p=be("rect");return J(p,{x:-c/2,y:-d/2,width:c,height:d}),xe(p).add("djs-hit"),ve(o,p),Jh(o,i==="v"?90:0),o}function Au(e,t,n){var i=be("g"),o=Pr(t,n),a=Vt(t,n);return ve(e,i),e_(i,t,n,a),xe(i).add(Bu),xe(i).add(a==="h"?"horizontal":"vertical"),it(i,o.x,o.y),i}function Gr(e){return Math.abs(Math.round(e*2/3))}function t_(e,t){var n=i_(e,t);return Cs(e,n)}function n_(e,t,n){var i=t.x-e.x,o=t.y-e.y;return Gr(n==="h"?i:o)}function i_(e,t){for(var n=t.waypoints,i=1/0,o,a=0;a<n.length-1;a++){var r=n[a],s=n[a+1],c=Cu(e,[r,s]);c<i&&(i=c,o=a)}return[n[o],n[o+1]]}function ku(e,t,n,i,o){function a(v,y,P){var x=v.index,I=v.point,N,R,B,S,k,W;return x<=0||v.bendpoint?!1:(N=y[x-1],R=y[x],B=Pr(N,R),S=Vt(N,R),k=Math.abs(I.x-B.x),W=Math.abs(I.y-B.y),S&&k<=P&&W<=P)}function r(v,y){var P=v.waypoints,x,I,N,R;return y.index<=0||y.bendpoint||(x={start:P[y.index-1],end:P[y.index]},I=Vt(x.start,x.end),!I)?null:(I==="h"?N=x.end.x-x.start.x:N=x.end.y-x.start.y,R=Gr(N)/2,R)}function s(v,y){var P=y.waypoints,x=Or(t,P,v),I;if(x)return I=r(y,x),a(x,P,I)?o.start(v,y,x.index):i.start(v,y,x.index,!x.bendpoint),!0}function c(v,y,P){ue.bind(v,y,function(x){n.triggerMouseEvent(y,x,P),x.stopPropagation()})}function d(v,y){var P=t.getLayer("overlays"),x=Ue('.djs-bendpoints[data-element-id="'+Ri(v.id)+'"]',P);return!x&&y&&(x=be("g"),J(x,{"data-element-id":v.id}),xe(x).add("djs-bendpoints"),ve(P,x),c(x,"mousedown",v),c(x,"click",v),c(x,"dblclick",v)),x}function l(v,y){return Ue('.djs-segment-dragger[data-segment-idx="'+v+'"]',y)}function p(v,y){y.waypoints.forEach(function(P,x){var I=Lr(v);ve(v,I),it(I,P.x,P.y)}),Lr(v,"floating")}function u(v,y){for(var P=y.waypoints,x,I,N,R=1;R<P.length;R++)x=P[R-1],I=P[R],Vt(x,I)&&(N=Au(v,x,I),J(N,{"data-segment-idx":R}),c(N,"mousemove",y))}function m(v){T(Vc("."+Ru,v),function(y){ot(y)})}function h(v){T(Vc("."+Bu,v),function(y){ot(y)})}function g(v){var y=d(v);return y||(y=d(v,!0),p(y,v),u(y,v)),y}function f(v){var y=d(v);y&&(h(y),m(y),u(y,v),p(y,v))}function w(v,y){var P=Ue(".floating",v),x=y.point;P&&it(P,x.x,x.y)}function E(v,y,P){var x=l(y.index,v),I=P[y.index-1],N=P[y.index],R=y.point,B=Pr(I,N),S=Vt(I,N),k,W;x&&(k=o_(x),W={x:R.x-B.x,y:R.y-B.y},S==="v"&&(W={x:W.y,y:W.x}),it(k,W.x,W.y))}e.on("connection.changed",function(v){f(v.element)}),e.on("connection.remove",function(v){var y=d(v.element);y&&ot(y)}),e.on("element.marker.update",function(v){var y=v.element,P;y.waypoints&&(P=g(y),v.add?xe(P).add(v.marker):xe(P).remove(v.marker))}),e.on("element.mousemove",function(v){var y=v.element,P=y.waypoints,x,I;if(P){if(x=d(y,!0),I=Or(t,P,v.originalEvent),!I)return;w(x,I),I.bendpoint||E(x,I,P)}}),e.on("element.mousedown",function(v){if(ps(v)){var y=v.originalEvent,P=v.element;if(P.waypoints)return s(y,P)}}),e.on("selection.changed",function(v){var y=v.newSelection,P=y[0];P&&P.waypoints&&g(P)}),e.on("element.hover",function(v){var y=v.element;y.waypoints&&(g(y),n.registerEvent(v.gfx,"mousemove","element.mousemove"))}),e.on("element.out",function(v){n.unregisterEvent(v.gfx,"mousemove","element.mousemove")}),e.on("element.updateId",function(v){var y=v.element,P=v.newId;if(y.waypoints){var x=d(y);x&&J(x,{"data-element-id":P})}}),this.addHandles=g,this.updateHandles=f,this.getBendpointsContainer=d,this.getSegmentDragger=l}ku.$inject=["eventBus","canvas","interactionEvents","bendpointMove","connectionSegmentMove"];function o_(e){return Ue(".djs-visual",e)}var vd=Math.round,Rn="reconnectStart",Bn="reconnectEnd",_i="updateWaypoints";function Rs(e,t,n,i,o,a){this._injector=e,this.start=function(r,s,c,d){var l=n.getGraphics(s),p=s.source,u=s.target,m=s.waypoints,h;!d&&c===0?h=Rn:!d&&c===m.length-1?h=Bn:h=_i;var g=h===_i?"connection.updateWaypoints":"connection.reconnect",f=o.allowed(g,{connection:s,source:p,target:u});f===!1&&(f=o.allowed(g,{connection:s,source:u,target:p})),f!==!1&&i.init(r,"bendpoint.move",{data:{connection:s,connectionGfx:l,context:{allowed:f,bendpointIndex:c,connection:s,source:p,target:u,insert:d,type:h}}})},t.on("bendpoint.move.hover",function(r){var s=r.context,c=s.connection,d=c.source,l=c.target,p=r.hover,u=s.type;s.hover=p;var m;if(p){var h=u===_i?"connection.updateWaypoints":"connection.reconnect";if(m=s.allowed=o.allowed(h,{connection:c,source:u===Rn?p:d,target:u===Bn?p:l}),m){s.source=u===Rn?p:d,s.target=u===Bn?p:l;return}m===!1&&(m=s.allowed=o.allowed(h,{connection:c,source:u===Bn?p:l,target:u===Rn?p:d})),m&&(s.source=u===Bn?p:l,s.target=u===Rn?p:d)}}),t.on(["bendpoint.move.out","bendpoint.move.cleanup"],function(r){var s=r.context,c=s.type;s.hover=null,s.source=null,s.target=null,c!==_i&&(s.allowed=!1)}),t.on("bendpoint.move.end",function(r){var s=r.context,c=s.allowed,d=s.bendpointIndex,l=s.connection,p=s.insert,u=l.waypoints.slice(),m=s.source,h=s.target,g=s.type,f=s.hints||{},w={x:vd(r.x),y:vd(r.y)};if(!c)return!1;g===_i?(p?u.splice(d,0,w):u[d]=w,f.bendpointMove={insert:p,bendpointIndex:d},u=this.cropWaypoints(l,u),a.updateWaypoints(l,Qh(u),f)):(g===Rn?(f.docking="source",Xo(s)&&(f.docking="target",f.newWaypoints=u.reverse())):g===Bn&&(f.docking="target",Xo(s)&&(f.docking="source",f.newWaypoints=u.reverse())),a.reconnect(l,m,h,w,f))},this)}Rs.$inject=["injector","eventBus","canvas","dragging","rules","modeling"];Rs.prototype.cropWaypoints=function(e,t){var n=this._injector.get("connectionDocking",!1);if(!n)return t;var i=e.waypoints;return e.waypoints=t,e.waypoints=n.getCroppedWaypoints(e),t=e.waypoints,e.waypoints=i,t};function Xo(e){var t=e.hover,n=e.source,i=e.target,o=e.type;if(o===Rn)return t&&i&&t===i&&n!==i;if(o===Bn)return t&&n&&t===n&&n!==i}var a_="reconnectStart",r_="reconnectEnd",yd="updateWaypoints",bi="connect-ok",fo="connect-not-ok",wd="connect-hover",Ed="djs-updating",xd="djs-dragging",Pd=1100;function Du(e,t,n,i){this._injector=t;var o=t.get("connectionPreview",!1);n.on("bendpoint.move.start",function(a){var r=a.context,s=r.bendpointIndex,c=r.connection,d=r.insert,l=c.waypoints,p=l.slice();r.waypoints=l,d&&p.splice(s,0,{x:a.x,y:a.y}),c.waypoints=p;var u=r.draggerGfx=Lr(i.getLayer("overlays"));xe(u).add("djs-dragging"),i.addMarker(c,xd),i.addMarker(c,Ed)}),n.on("bendpoint.move.hover",function(a){var r=a.context,s=r.allowed,c=r.hover,d=r.type;if(c){if(i.addMarker(c,wd),d===yd)return;s?(i.removeMarker(c,fo),i.addMarker(c,bi)):s===!1&&(i.removeMarker(c,bi),i.addMarker(c,fo))}}),n.on(["bendpoint.move.out","bendpoint.move.cleanup"],Pd,function(a){var r=a.context,s=r.hover,c=r.target;s&&(i.removeMarker(s,wd),i.removeMarker(s,c?bi:fo))}),n.on("bendpoint.move.move",function(a){var r=a.context,s=r.allowed,c=r.bendpointIndex,d=r.draggerGfx,l=r.hover,p=r.type,u=r.connection,m=u.source,h=u.target,g=u.waypoints.slice(),f={x:a.x,y:a.y},w=r.hints||{},E={};o&&(w.connectionStart&&(E.connectionStart=w.connectionStart),w.connectionEnd&&(E.connectionEnd=w.connectionEnd),p===a_?Xo(r)?(E.connectionEnd=E.connectionEnd||f,E.source=h,E.target=l||m,g=g.reverse()):(E.connectionStart=E.connectionStart||f,E.source=l||m,E.target=h):p===r_?Xo(r)?(E.connectionStart=E.connectionStart||f,E.source=l||h,E.target=m,g=g.reverse()):(E.connectionEnd=E.connectionEnd||f,E.source=m,E.target=l||h):(E.noCropping=!0,E.noLayout=!0,g[c]=f),p===yd&&(g=e.cropWaypoints(u,g)),E.waypoints=g,o.drawPreview(r,s,E)),it(d,a.x,a.y)},this),n.on(["bendpoint.move.end","bendpoint.move.cancel"],Pd,function(a){var r=a.context,s=r.connection,c=r.draggerGfx,d=r.hover,l=r.target,p=r.waypoints;s.waypoints=p,ot(c),i.removeMarker(s,Ed),i.removeMarker(s,xd),d&&(i.removeMarker(d,bi),i.removeMarker(d,l?bi:fo)),o&&o.cleanUp(r)})}Du.$inject=["bendpointMove","injector","eventBus","canvas"];var Sd="connect-hover",Td="djs-updating";function Md(e,t,n){return Bs(e,t,e[t]+n)}function Bs(e,t,n){return{x:t==="x"?n:e.x,y:t==="y"?n:e.y}}function s_(e,t,n,i){var o=Math.max(t[i],n[i]),a=Math.min(t[i],n[i]),r=20,s=Math.min(Math.max(a+r,e[i]),o-r);return Bs(t,i,s)}function Iu(e){return e==="x"?"y":"x"}function Nd(e,t,n){var i,o;return e.original?e.original:(i=Z(t),o=Iu(n),Bs(e,o,i[o]))}function Fu(e,t,n,i,o,a){var r=e.get("connectionDocking",!1);this.start=function(p,u,m){var h,g=n.getGraphics(u),f=m-1,w=m,E=u.waypoints,v=E[f],y=E[w],P=Or(n,E,p),x,I,N;x=Vt(v,y),x&&(I=x==="v"?"x":"y",f===0&&(v=Nd(v,u.source,I)),w===E.length-1&&(y=Nd(y,u.target,I)),P?N=P.point:N={x:(v.x+y.x)/2,y:(v.y+y.y)/2},h={connection:u,segmentStartIndex:f,segmentEndIndex:w,segmentStart:v,segmentEnd:y,axis:I,dragPosition:N},i.init(p,N,"connectionSegment.move",{cursor:I==="x"?"resize-ew":"resize-ns",data:{connection:u,connectionGfx:g,context:h}}))};function s(p,u){if(!r)return u;var m=p.waypoints,h;return p.waypoints=u,h=r.getCroppedWaypoints(p),p.waypoints=m,h}function c(p){o.update("connection",p.connection,p.connectionGfx)}function d(p,u,m){var h=p.newWaypoints,g=p.segmentStartIndex+u,f=h[g],w=p.segmentEndIndex+u,E=h[w],v=Iu(p.axis),y=s_(m,f,E,v);it(p.draggerGfx,y.x,y.y)}function l(p,u){var m=0,h=p.filter(function(g,f){return Dl(p[f-1],p[f+1],g)?(m=f<=u?m-1:m,!1):!0});return{waypoints:h,segmentOffset:m}}t.on("connectionSegment.move.start",function(p){var u=p.context,m=p.connection,h=n.getLayer("overlays");u.originalWaypoints=m.waypoints.slice(),u.draggerGfx=Au(h,u.segmentStart,u.segmentEnd),xe(u.draggerGfx).add("djs-dragging"),n.addMarker(m,Td)}),t.on("connectionSegment.move.move",function(p){var u=p.context,m=u.connection,h=u.segmentStartIndex,g=u.segmentEndIndex,f=u.segmentStart,w=u.segmentEnd,E=u.axis,v=u.originalWaypoints.slice(),y=Md(f,E,p["d"+E]),P=Md(w,E,p["d"+E]),x=v.length,I=0;v[h]=y,v[g]=P;var N,R;h<2&&(N=Qe(m.source,y),h===1?N==="intersect"&&(v.shift(),v[0]=y,I--):N!=="intersect"&&(v.unshift(f),I++)),g>x-3&&(R=Qe(m.target,P),g===x-2?R==="intersect"&&(v.pop(),v[v.length-1]=P):R!=="intersect"&&v.push(w)),u.newWaypoints=m.waypoints=s(m,v),d(u,I,p),u.newSegmentStartIndex=h+I,c(p)}),t.on("connectionSegment.move.hover",function(p){p.context.hover=p.hover,n.addMarker(p.hover,Sd)}),t.on(["connectionSegment.move.out","connectionSegment.move.cleanup"],function(p){var u=p.context.hover;u&&n.removeMarker(u,Sd)}),t.on("connectionSegment.move.cleanup",function(p){var u=p.context,m=u.connection;u.draggerGfx&&ot(u.draggerGfx),n.removeMarker(m,Td)}),t.on(["connectionSegment.move.cancel","connectionSegment.move.end"],function(p){var u=p.context,m=u.connection;m.waypoints=u.originalWaypoints,c(p)}),t.on("connectionSegment.move.end",function(p){var u=p.context,m=u.connection,h=u.newWaypoints,g=u.newSegmentStartIndex;h=h.map(function(P){return{original:P.original,x:Math.round(P.x),y:Math.round(P.y)}});var f=l(h,g),w=f.waypoints,E=s(m,w),v=f.segmentOffset,y={segmentMove:{segmentStartIndex:u.segmentStartIndex,newSegmentStartIndex:g+v}};a.updateWaypoints(m,E,y)})}Fu.$inject=["injector","eventBus","canvas","dragging","graphicsFactory","modeling"];var c_=Math.abs,Cd=Math.round;function d_(e,t,n){n=n===void 0?10:n;var i,o;for(i=0;i<t.length;i++)if(o=t[i],c_(o-e)<=n)return o}function Ou(e){return{x:e.x,y:e.y}}function Lu(e){return{x:e.x+e.width,y:e.y+e.height}}function Et(e,t){return!e||isNaN(e.x)||isNaN(e.y)?t:{x:Cd(e.x+e.width/2),y:Cd(e.y+e.height/2)}}function ei(e,t){var n=e.snapped;return n?typeof t=="string"?n[t]:n.x&&n.y:!1}function Fe(e,t,n){if(typeof t!="string")throw new Error("axis must be in [x, y]");if(typeof n!="number"&&n!==!1)throw new Error("value must be Number or false");var i,o=e[t],a=e.snapped=e.snapped||{};return n===!1?a[t]=!1:(a[t]=!0,i=n-o,e[t]+=i,e["d"+t]+=i),o}function Gu(e){return e.children||[]}var p_=Math.abs,Rd=Math.round,cr=10;function ju(e){function t(a,r){if(se(a)){for(var s=a.length;s--;)if(p_(a[s]-r)<=cr)return a[s]}else{a=+a;var c=r%a;if(c<cr)return r-c;if(c>a-cr)return r-c+a}return r}function n(a,r){if(a.waypoints)return t_(r,a);if(a.width)return{x:Rd(a.width/2+a.x),y:Rd(a.height/2+a.y)}}function i(a){var r=a.context,s=r.snapPoints,c=r.connection,d=c.waypoints,l=r.segmentStart,p=r.segmentStartIndex,u=r.segmentEnd,m=r.segmentEndIndex,h=r.axis;if(s)return s;var g=[d[p-1],l,u,d[m+1]];return p<2&&g.unshift(n(c.source,a)),m>d.length-3&&g.unshift(n(c.target,a)),r.snapPoints=s={horizontal:[],vertical:[]},T(g,function(f){f&&(f=f.original||f,h==="y"&&s.horizontal.push(f.y),h==="x"&&s.vertical.push(f.x))}),s}e.on("connectionSegment.move.move",1500,function(a){var r=i(a),s=a.x,c=a.y,d,l;if(r){d=t(r.vertical,s),l=t(r.horizontal,c);var p=s-d,u=c-l;C(a,{dx:a.dx-p,dy:a.dy-u,x:d,y:l}),(p||r.vertical.indexOf(s)!==-1)&&Fe(a,"x",d),(u||r.horizontal.indexOf(c)!==-1)&&Fe(a,"y",l)}});function o(a){var r=a.snapPoints,s=a.connection.waypoints,c=a.bendpointIndex;if(r)return r;var d=[s[c-1],s[c+1]];return a.snapPoints=r={horizontal:[],vertical:[]},T(d,function(l){l&&(l=l.original||l,r.horizontal.push(l.y),r.vertical.push(l.x))}),r}e.on(["connect.hover","connect.move","connect.end"],1500,function(a){var r=a.context,s=r.hover,c=s&&n(s,a);!ye(s)||!c||!c.x||!c.y||(Fe(a,"x",c.x),Fe(a,"y",c.y))}),e.on(["bendpoint.move.move","bendpoint.move.end"],1500,function(a){var r=a.context,s=o(r),c=r.hover,d=c&&n(c,a),l=a.x,p=a.y,u,m;if(s){u=t(d?s.vertical.concat([d.x]):s.vertical,l),m=t(d?s.horizontal.concat([d.y]):s.horizontal,p);var h=l-u,g=p-m;C(a,{dx:a.dx-h,dy:a.dy-g,x:a.x-h,y:a.y-g}),(h||s.vertical.indexOf(l)!==-1)&&Fe(a,"x",u),(g||s.horizontal.indexOf(p)!==-1)&&Fe(a,"y",m)}})}ju.$inject=["eventBus"];const l_={__depends__:[en,$t],__init__:["bendpoints","bendpointSnapping","bendpointMovePreview"],bendpoints:["type",ku],bendpointMove:["type",Rs],bendpointMovePreview:["type",Du],connectionSegmentMove:["type",Fu],bendpointSnapping:["type",ju]};function $u(e,t,n,i){function o(r,s){return i.allowed("connection.create",{source:r,target:s})}function a(r,s){return o(s,r)}e.on("connect.hover",function(r){var s=r.context,c=s.start,d=r.hover,l;if(s.hover=d,l=s.canExecute=o(c,d),!Sr(l)){if(l!==!1){s.source=c,s.target=d;return}l=s.canExecute=a(c,d),!Sr(l)&&l!==!1&&(s.source=d,s.target=c)}}),e.on(["connect.out","connect.cleanup"],function(r){var s=r.context;s.hover=null,s.source=null,s.target=null,s.canExecute=!1}),e.on("connect.end",function(r){var s=r.context,c=s.canExecute,d=s.connectionStart,l={x:r.x,y:r.y},p=s.source,u=s.target;if(!c)return!1;var m=null,h={connectionStart:jr(s)?l:d,connectionEnd:jr(s)?d:l};Xt(c)&&(m=c),s.connection=n.connect(p,u,m,h)}),this.start=function(r,s,c,d){Xt(c)||(d=c,c=Z(s)),t.init(r,"connect",{autoActivate:d,data:{shape:s,context:{start:s,connectionStart:c}}})}}$u.$inject=["eventBus","dragging","modeling","rules"];function jr(e){var t=e.hover,n=e.source,i=e.target;return t&&n&&t===n&&n!==i}var u_=1100,m_=900,Bd="connect-ok",Ad="connect-not-ok";function qu(e,t,n){var i=e.get("connectionPreview",!1);i&&t.on("connect.move",function(o){var a=o.context,r=a.canExecute,s=a.hover,c=a.source,d=a.start,l=a.startPosition,p=a.target,u=a.connectionStart||l,m=a.connectionEnd||{x:o.x,y:o.y},h=u,g=m;jr(a)&&(h=m,g=u),i.drawPreview(a,r,{source:c||d,target:p||s,connectionStart:h,connectionEnd:g})}),t.on("connect.hover",m_,function(o){var a=o.context,r=o.hover,s=a.canExecute;s!==null&&n.addMarker(r,s?Bd:Ad)}),t.on(["connect.out","connect.cleanup"],u_,function(o){var a=o.hover;a&&(n.removeMarker(a,Bd),n.removeMarker(a,Ad))}),i&&t.on("connect.cleanup",function(o){i.cleanUp(o.context)})}qu.$inject=["injector","eventBus","canvas"];const As={__depends__:[Jt,$t,en],__init__:["connectPreview"],connect:["type",$u],connectPreview:["type",qu]};var h_="djs-dragger";function tn(e,t,n,i){this._canvas=t,this._graphicsFactory=n,this._elementFactory=i,this._connectionDocking=e.get("connectionDocking",!1),this._layouter=e.get("layouter",!1)}tn.$inject=["injector","canvas","graphicsFactory","elementFactory"];tn.prototype.drawPreview=function(e,t,n){n=n||{};var i=e.connectionPreviewGfx,o=e.getConnection,a=n.source,r=n.target,s=n.waypoints,c=n.connectionStart,d=n.connectionEnd,l=n.noLayout,p=n.noCropping,u=n.noNoop,m,h=this;if(i||(i=e.connectionPreviewGfx=this.createConnectionPreviewGfx()),ls(i),o||(o=e.getConnection=f_(function(g,f,w){return h.getConnection(g,f,w)})),t&&(m=o(t,a,r)),!m){!u&&this.drawNoopPreview(i,n);return}m.waypoints=s||[],this._layouter&&!l&&(m.waypoints=this._layouter.layoutConnection(m,{source:a,target:r,connectionStart:c,connectionEnd:d,waypoints:n.waypoints||m.waypoints})),(!m.waypoints||!m.waypoints.length)&&(m.waypoints=[a?Z(a):c,r?Z(r):d]),this._connectionDocking&&(a||r)&&!p&&(m.waypoints=this._connectionDocking.getCroppedWaypoints(m,a,r)),this._graphicsFactory.drawConnection(i,m,{stroke:"var(--element-dragger-color)"})};tn.prototype.drawNoopPreview=function(e,t){var n=t.source,i=t.target,o=t.connectionStart||Z(n),a=t.connectionEnd||Z(i),r=this.cropWaypoints(o,a,n,i),s=this.createNoopConnection(r[0],r[1]);ve(e,s)};tn.prototype.cropWaypoints=function(e,t,n,i){var o=this._graphicsFactory,a=n&&o.getShapePath(n),r=i&&o.getShapePath(i),s=o.getConnectionPath({waypoints:[e,t]});return e=n&&Tr(a,s,!0)||e,t=i&&Tr(r,s,!1)||t,[e,t]};tn.prototype.cleanUp=function(e){e&&e.connectionPreviewGfx&&ot(e.connectionPreviewGfx)};tn.prototype.getConnection=function(e){var t=g_(e);return this._elementFactory.createConnection(t)};tn.prototype.createConnectionPreviewGfx=function(){var e=be("g");return J(e,{pointerEvents:"none"}),xe(e).add(h_),ve(this._canvas.getActiveLayer(),e),e};tn.prototype.createNoopConnection=function(e,t){return ef([e,t],{stroke:"#333",strokeDasharray:[1],strokeWidth:2,"pointer-events":"none"})};function f_(e){var t={};return function(n){var i=JSON.stringify(n),o=t[i];return o||(o=t[i]=e.apply(null,arguments)),o}}function g_(e){return Xt(e)?e:{}}const __={__init__:["connectionPreview"],connectionPreview:["type",tn]},b_=new rs("ps");var v_=["marker-start","marker-mid","marker-end"],y_=["circle","ellipse","line","path","polygon","polyline","path","rect"];function _n(e,t,n,i){this._elementRegistry=e,this._canvas=n,this._styles=i}_n.$inject=["elementRegistry","eventBus","canvas","styles"];_n.prototype.cleanUp=function(){console.warn("PreviewSupport#cleanUp is deprecated and will be removed in future versions. You do not need to manually clean up previews anymore. cf. https://github.com/bpmn-io/diagram-js/pull/906")};_n.prototype.getGfx=function(e){return this._elementRegistry.getGraphics(e)};_n.prototype.addDragger=function(e,t,n,i="djs-dragger"){n=n||this.getGfx(e);var o=Il(n),a=n.getBoundingClientRect();return this._cloneMarkers(Yn(o),i),J(o,this._styles.cls(i,[],{x:a.top,y:a.left})),ve(t,o),J(o,"data-preview-support-element-id",e.id),o};_n.prototype.addFrame=function(e,t){var n=be("rect",{class:"djs-resize-overlay",width:e.width,height:e.height,x:e.x,y:e.y});return ve(t,n),J(n,"data-preview-support-element-id",e.id),n};_n.prototype._cloneMarkers=function(e,t="djs-dragger",n=e){var i=this;if(e.childNodes)for(var o=0;o<e.childNodes.length;o++)i._cloneMarkers(e.childNodes[o],t,n);P_(e)&&v_.forEach(function(a){if(J(e,a)){var r=w_(e,a,i._canvas.getContainer());r&&i._cloneMarker(n,e,r,a,t)}})};_n.prototype._cloneMarker=function(e,t,n,i,o="djs-dragger"){var a=[n.id,o,b_.next()].join("-"),r=Ue("marker#"+n.id,e);e=e||this._canvas._svg;var s=r||Il(n);s.id=a,xe(s).add(o);var c=Ue(":scope > defs",e);c||(c=be("defs"),ve(e,c)),ve(c,s);var d=x_(s.id);J(t,i,d)};function w_(e,t,n){var i=E_(J(e,t));return Ue("marker#"+i,n||document)}function E_(e){return e.match(/url\(['"]?#([^'"]*)['"]?\)/)[1]}function x_(e){return"url(#"+e+")"}function P_(e){return y_.indexOf(e.nodeName)!==-1}const di={__init__:["previewSupport"],previewSupport:["type",_n]},go="complex-preview";class Hu{constructor(t,n,i){this._canvas=t,this._graphicsFactory=n,this._previewSupport=i,this._markers=[]}create(t){this.cleanUp();const{created:n=[],moved:i=[],removed:o=[],resized:a=[]}=t,r=this._canvas.getLayer(go);n.filter(s=>!S_(s)).forEach(s=>{let c;ye(s)?(c=this._graphicsFactory._createContainer("connection",be("g")),this._graphicsFactory.drawConnection(Yn(c),s)):(c=this._graphicsFactory._createContainer("shape",be("g")),this._graphicsFactory.drawShape(Yn(c),s),it(c,s.x,s.y)),this._previewSupport.addDragger(s,r,c)}),i.forEach(({element:s,delta:c})=>{this._previewSupport.addDragger(s,r,void 0,"djs-dragging"),this._canvas.addMarker(s,"djs-element-hidden"),this._markers.push([s,"djs-element-hidden"]);const d=this._previewSupport.addDragger(s,r);ye(s)?it(d,c.x,c.y):it(d,s.x+c.x,s.y+c.y)}),o.forEach(s=>{this._previewSupport.addDragger(s,r,void 0,"djs-dragging"),this._canvas.addMarker(s,"djs-element-hidden"),this._markers.push([s,"djs-element-hidden"])}),a.forEach(({shape:s,bounds:c})=>{this._canvas.addMarker(s,"djs-hidden"),this._markers.push([s,"djs-hidden"]),this._previewSupport.addDragger(s,r,void 0,"djs-dragging");const d=this._graphicsFactory._createContainer("shape",be("g"));this._graphicsFactory.drawShape(Yn(d),s,{width:c.width,height:c.height}),it(d,c.x,c.y),this._previewSupport.addDragger(s,r,d)})}cleanUp(){ls(this._canvas.getLayer(go)),this._markers.forEach(([t,n])=>this._canvas.removeMarker(t,n)),this._markers=[]}show(){this._canvas.showLayer(go)}hide(){this._canvas.hideLayer(go)}}Hu.$inject=["canvas","graphicsFactory","previewSupport"];function S_(e){return e.hidden}const T_={__depends__:[di],__init__:["complexPreview"],complexPreview:["type",Hu]};var ks=["top","bottom","left","right"],_o=10;function Ds(e,t){D.call(this,e),this.postExecuted(["connection.create","connection.layout","connection.updateWaypoints"],function(o){var a=o.context,r=a.connection,s=r.source,c=r.target,d=a.hints||{};d.createElementsBehavior!==!1&&(n(s),n(c))}),this.postExecuted(["label.create"],function(o){var a=o.context,r=a.shape,s=a.hints||{};s.createElementsBehavior!==!1&&n(r.labelTarget)}),this.postExecuted(["elements.create"],function(o){var a=o.context,r=a.elements,s=a.hints||{};s.createElementsBehavior!==!1&&r.forEach(function(c){n(c)})});function n(o){if(ua(o)){var a=C_(o);a&&i(o,a)}}function i(o,a){var r=Z(o),s=o.label,c=Z(s);if(s.parent){var d=U(o),l;switch(a){case"top":l={x:r.x,y:d.top-_o-s.height/2};break;case"left":l={x:d.left-_o-s.width/2,y:r.y};break;case"bottom":l={x:r.x,y:d.bottom+_o+s.height/2};break;case"right":l={x:d.right+_o+s.width/2,y:r.y};break}var p=Rt(l,c);t.moveShape(s,p)}}}z(Ds,D);Ds.$inject=["eventBus","modeling"];function M_(e){var t=e.host,n=Z(e),i=Qe(n,t),o;i.indexOf("-")>=0?o=i.split("-"):o=[i];var a=ks.filter(function(r){return o.indexOf(r)===-1});return a}function N_(e){var t=Z(e),n=[].concat(e.incoming.map(function(i){return i.waypoints[i.waypoints.length-2]}),e.outgoing.map(function(i){return i.waypoints[1]})).map(function(i){return zu(t,i)});return n}function C_(e){var t=Z(e.label),n=Z(e),i=zu(n,t);if(R_(i)){var o=N_(e);if(e.host){var a=M_(e);o=o.concat(a)}var r=ks.filter(function(s){return o.indexOf(s)===-1});if(r.indexOf(i)===-1)return r[0]}}function zu(e,t){return Qe(t,e,5)}function R_(e){return ks.indexOf(e)!==-1}function Is(e){D.call(this,e),this.preExecute("shape.append",function(t){var n=t.source,i=t.shape;t.position||(_(i,"bpmn:TextAnnotation")?t.position={x:n.x+n.width/2+75,y:n.y-50-i.height/2}:t.position={x:n.x+n.width+80+i.width/2,y:n.y+n.height/2})},!0)}z(Is,D);Is.$inject=["eventBus"];function Fs(e,t){e.invoke(D,this),this.postExecute("shape.move",function(n){var i=n.newParent,o=n.shape,a=ae(o.incoming.concat(o.outgoing),function(r){return _(r,"bpmn:Association")});T(a,function(r){t.moveConnection(r,{x:0,y:0},i)})},!0)}z(Fs,D);Fs.$inject=["injector","modeling"];var kd=500;function xa(e,t){t.invoke(D,this),this._bpmnReplace=e;var n=this;this.postExecuted("elements.create",kd,function(i){var o=i.elements;o=o.filter(function(a){var r=a.host;return Dd(a,r)}),o.length===1&&o.map(function(a){return o.indexOf(a)}).forEach(function(a){var r=o[a];i.elements[a]=n._replaceShape(o[a],r)})},!0),this.preExecute("elements.move",kd,function(i){var o=i.shapes,a=i.newHost;if(o.length===1){var r=o[0];Dd(r,a)&&(i.shapes=[n._replaceShape(r,a)])}},!0)}xa.$inject=["bpmnReplace","injector"];z(xa,D);xa.prototype._replaceShape=function(e,t){var n=B_(e),i={type:"bpmn:BoundaryEvent",host:t};return n&&(i.eventDefinitionType=n.$type),this._bpmnReplace.replaceElement(e,i,{layoutConnection:!1})};function B_(e){var t=G(e),n=t.eventDefinitions;return n&&n[0]}function Dd(e,t){return!ce(e)&&Q(e,["bpmn:IntermediateThrowEvent","bpmn:IntermediateCatchEvent"])&&!!t}function Os(e,t){D.call(this,e);function n(i){return ae(i.attachers,function(o){return _(o,"bpmn:BoundaryEvent")})}this.postExecute("connection.create",function(i){var o=i.context.source,a=i.context.target,r=n(a);_(o,"bpmn:EventBasedGateway")&&_(a,"bpmn:ReceiveTask")&&r.length>0&&t.removeElements(r)}),this.postExecute("connection.reconnect",function(i){var o=i.context.oldSource,a=i.context.newSource;_(o,"bpmn:Gateway")&&_(a,"bpmn:EventBasedGateway")&&T(a.outgoing,function(r){var s=r.target,c=n(s);_(s,"bpmn:ReceiveTask")&&c.length>0&&t.removeElements(c)})})}Os.$inject=["eventBus","modeling"];z(Os,D);function Ls(e,t,n){D.call(this,e),this.preExecute("shape.replace",s,!0),this.postExecuted("shape.replace",c,!0),this.preExecute("connection.create",o,!0),this.postExecuted("connection.delete",i,!0),this.postExecuted("connection.reconnect",a,!0),this.postExecuted("element.updateProperties",r,!0);function i(f){const w=f.source,E=f.target;qn(w)&&vi(E)&&l(E)}function o(f){const w=f.connection,E=f.source,v=f.target;qn(E)&&bo(v)&&(d(v),u(E,[w]))}function a(f){const w=f.newTarget,E=f.oldSource,v=f.oldTarget;if(v!==w){const y=E;vi(v)&&l(v),qn(y)&&bo(w)&&d(w)}}function r(f){const{element:w}=f;vi(w)?(p(w),m(w)):bo(w)&&h(w)}function s(f){const{newData:w,oldShape:E}=f;if(qn(f.oldShape)&&w.eventDefinitionType!=="bpmn:CompensateEventDefinition"||w.type!=="bpmn:BoundaryEvent"){const v=E.outgoing.find(({target:y})=>vi(y));v&&v.target&&(f._connectionTarget=v.target)}else if(!qn(f.oldShape)&&w.eventDefinitionType==="bpmn:CompensateEventDefinition"&&w.type==="bpmn:BoundaryEvent"){const v=E.outgoing.find(({target:y})=>bo(y));v&&v.target&&(f._connectionTarget=v.target),g(E)}}function c(f){const{_connectionTarget:w,newShape:E}=f;w&&t.connect(E,w)}function d(f){t.updateProperties(f,{isForCompensation:!0})}function l(f){t.updateProperties(f,{isForCompensation:void 0})}function p(f){for(const w of f.incoming)n.canConnect(w.source,f)||t.removeConnection(w);for(const w of f.outgoing)n.canConnect(f,w.target)||t.removeConnection(w)}function u(f,w){f.outgoing.filter(y=>_(y,"bpmn:Association")).filter(y=>vi(y.target)&&!w.includes(y)).forEach(y=>t.removeConnection(y))}function m(f){const w=f.attachers.slice();w.length&&t.removeElements(w)}function h(f){const w=f.incoming.filter(E=>qn(E.source));t.removeElements(w)}function g(f){const w=f.outgoing.filter(E=>_(E,"bpmn:SequenceFlow"));t.removeElements(w)}}z(Ls,D);Ls.$inject=["eventBus","modeling","bpmnRules"];function vi(e){const t=G(e);return t&&t.get("isForCompensation")}function qn(e){return e&&_(e,"bpmn:BoundaryEvent")&&us(e,"bpmn:CompensateEventDefinition")}function bo(e){return e&&_(e,"bpmn:Activity")&&!rt(e)}function Gs(e){e.invoke(D,this),this.preExecute("shape.create",1500,function(t){var n=t.context,i=n.parent,o=n.shape;_(i,"bpmn:Lane")&&!_(o,"bpmn:Lane")&&(n.parent=Qn(i,"bpmn:Participant"))})}Gs.$inject=["injector"];z(Gs,D);function js(e,t){D.call(this,e),this.preExecute("shape.create",function(n){var i=n.context,o=i.shape;if(_(o,"bpmn:DataObjectReference")&&o.type!=="label"){var a=t.create("bpmn:DataObject");o.businessObject.dataObjectRef=a}})}js.$inject=["eventBus","bpmnFactory"];z(js,D);var $r=20,qr=20,Vu=30,vo=2e3;function $s(e,t,n){D.call(this,t),t.on(["create.start","shape.move.start"],vo,function(o){var a=o.context,r=a.shape,s=e.getRootElement();if(!(!_(r,"bpmn:Participant")||!_(s,"bpmn:Process")||!s.children.length)){var c=s.children.filter(function(p){return!_(p,"bpmn:Group")&&!ce(p)&&!ye(p)});if(c.length){var d=wt(c),l=A_(r,d);C(r,l),a.createConstraints=k_(r,d)}}}),t.on("create.start",vo,function(o){var a=o.context,r=a.shape,s=e.getRootElement(),c=e.getGraphics(s);function d(l){l.element=s,l.gfx=c}_(r,"bpmn:Participant")&&_(s,"bpmn:Process")&&(t.on("element.hover",vo,d),t.once("create.cleanup",function(){t.off("element.hover",d)}))});function i(){var o=e.getRootElement();return _(o,"bpmn:Collaboration")?o:n.makeCollaboration()}this.preExecute("elements.create",vo,function(o){var a=o.elements,r=o.parent,s=D_(a),c;s&&_(r,"bpmn:Process")&&(o.parent=i(),c=o.hints=o.hints||{},c.participant=s,c.process=r,c.processRef=G(s).get("processRef"))},!0),this.preExecute("shape.create",function(o){var a=o.parent,r=o.shape;_(r,"bpmn:Participant")&&_(a,"bpmn:Process")&&(o.parent=i(),o.process=a,o.processRef=G(r).get("processRef"))},!0),this.execute("shape.create",function(o){var a=o.hints||{},r=o.process||a.process,s=o.shape,c=a.participant;r&&(!c||s===c)&&G(s).set("processRef",G(r))},!0),this.revert("shape.create",function(o){var a=o.hints||{},r=o.process||a.process,s=o.processRef||a.processRef,c=o.shape,d=a.participant;r&&(!d||c===d)&&G(c).set("processRef",s)},!0),this.postExecute("shape.create",function(o){var a=o.hints||{},r=o.process||o.hints.process,s=o.shape,c=a.participant;if(r){var d=r.children.slice();c?s===c&&n.moveElements(d,{x:0,y:0},c):n.moveElements(d,{x:0,y:0},s)}},!0)}$s.$inject=["canvas","eventBus","modeling"];z($s,D);function A_(e,t){t={width:t.width+$r*2+Vu,height:t.height+qr*2};var n=Math.max(e.width,t.width),i=Math.max(e.height,t.height);return{x:-n/2,y:-i/2,width:n,height:i}}function k_(e,t){return t=U(t),{bottom:t.top+e.height/2-qr,left:t.right-e.width/2+$r,top:t.bottom-e.height/2+qr,right:t.left+e.width/2-$r-Vu}}function D_(e){return Te(e,function(t){return _(t,"bpmn:Participant")})}var Id="__targetRef_placeholder";function qs(e,t){D.call(this,e),this.executed(["connection.create","connection.delete","connection.move","connection.reconnect"],Fd(a)),this.reverted(["connection.create","connection.delete","connection.move","connection.reconnect"],Fd(a));function n(r,s,c){var d=r.get("dataInputAssociations");return Te(d,function(l){return l!==c&&l.targetRef===s})}function i(r,s){var c=r.get("properties"),d=Te(c,function(l){return l.name===Id});return!d&&s&&(d=t.create("bpmn:Property",{name:Id}),Ve(c,d)),d}function o(r,s){var c=i(r);c&&(n(r,c,s)||qe(r.get("properties"),c))}function a(r){var s=r.context,c=s.connection,d=c.businessObject,l=c.target,p=l&&l.businessObject,u=s.newTarget,m=u&&u.businessObject,h=s.oldTarget||s.target,g=h&&h.businessObject,f=c.businessObject,w;g&&g!==p&&o(g,d),m&&m!==p&&o(m,d),p?(w=i(p,!0),f.targetRef=w):f.targetRef=null}}qs.$inject=["eventBus","bpmnFactory"];z(qs,D);function Fd(e){return function(t){var n=t.context,i=n.connection;if(_(i,"bpmn:DataInputAssociation"))return e(t)}}function Pa(e){this._bpmnUpdater=e}Pa.$inject=["bpmnUpdater"];Pa.prototype.execute=function(e){var t=e.dataStoreBo,n=e.dataStoreDi,i=e.newSemanticParent,o=e.newDiParent;return e.oldSemanticParent=t.$parent,e.oldDiParent=n.$parent,this._bpmnUpdater.updateSemanticParent(t,i),this._bpmnUpdater.updateDiParent(n,o),[]};Pa.prototype.revert=function(e){var t=e.dataStoreBo,n=e.dataStoreDi,i=e.oldSemanticParent,o=e.oldDiParent;return this._bpmnUpdater.updateSemanticParent(t,i),this._bpmnUpdater.updateDiParent(n,o),[]};function Hs(e,t,n,i){D.call(this,i),t.registerHandler("dataStore.updateContainment",Pa);function o(){return n.filter(function(s){return _(s,"bpmn:Participant")&&G(s).processRef})[0]}function a(s){return s.children.filter(function(c){return _(c,"bpmn:DataStoreReference")&&!c.labelTarget})}function r(s,c){var d=s.businessObject||s;if(c=c||o(),c){var l=c.businessObject||c;t.execute("dataStore.updateContainment",{dataStoreBo:d,dataStoreDi:fe(s),newSemanticParent:l.processRef||l,newDiParent:fe(c)})}}this.preExecute("shape.create",function(s){var c=s.context,d=c.shape;_(d,"bpmn:DataStoreReference")&&d.type!=="label"&&(c.hints||(c.hints={}),c.hints.autoResize=!1)}),this.preExecute("elements.move",function(s){var c=s.context,d=c.shapes,l=d.filter(function(p){return _(p,"bpmn:DataStoreReference")});l.length&&(c.hints||(c.hints={}),c.hints.autoResize=d.filter(function(p){return!_(p,"bpmn:DataStoreReference")}))}),this.postExecute("shape.create",function(s){var c=s.context,d=c.shape,l=d.parent;_(d,"bpmn:DataStoreReference")&&d.type!=="label"&&_(l,"bpmn:Collaboration")&&r(d)}),this.postExecute("shape.move",function(s){var c=s.context,d=c.shape,l=c.oldParent,p=d.parent;if(!_(l,"bpmn:Collaboration")&&_(d,"bpmn:DataStoreReference")&&d.type!=="label"&&_(p,"bpmn:Collaboration")){var u=_(l,"bpmn:Participant")?l:F_(l,"bpmn:Participant");r(d,u)}}),this.postExecute("shape.delete",function(s){var c=s.context,d=c.shape,l=e.getRootElement();Q(d,["bpmn:Participant","bpmn:SubProcess"])&&_(l,"bpmn:Collaboration")&&a(l).filter(function(p){return I_(p,d)}).forEach(function(p){r(p)})}),this.postExecute("canvas.updateRoot",function(s){var c=s.context,d=c.oldRoot,l=c.newRoot,p=a(d);p.forEach(function(u){_(l,"bpmn:Process")&&r(u,l)})})}Hs.$inject=["canvas","commandStack","elementRegistry","eventBus"];z(Hs,D);function I_(e,t){for(var n=e.businessObject||e,i=t.businessObject||t;n.$parent;){if(n.$parent===i.processRef||i)return!0;n=n.$parent}return!1}function F_(e,t){for(;e.parent;){if(_(e.parent,t))return e.parent;e=e.parent}}var Jo=Math.max,Qo=Math.min,O_=20;function Wu(e,t){return{top:e.top-t.top,right:e.right-t.right,bottom:e.bottom-t.bottom,left:e.left-t.left}}function L_(e,t,n){var i=n.x,o=n.y,a={x:e.x,y:e.y,width:e.width,height:e.height};return t.indexOf("n")!==-1?(a.y=e.y+o,a.height=e.height-o):t.indexOf("s")!==-1&&(a.height=e.height+o),t.indexOf("e")!==-1?a.width=e.width+i:t.indexOf("w")!==-1&&(a.x=e.x+i,a.width=e.width-i),a}function G_(e,t){return{x:e.x+(t.left||0),y:e.y+(t.top||0),width:e.width-(t.left||0)+(t.right||0),height:e.height-(t.top||0)+(t.bottom||0)}}function yo(e,t,n){var i=t[e],o=n.min&&n.min[e],a=n.max&&n.max[e];return te(o)&&(i=(/top|left/.test(e)?Qo:Jo)(i,o)),te(a)&&(i=(/top|left/.test(e)?Jo:Qo)(i,a)),i}function j_(e,t){if(!t)return e;var n=U(e);return ds({top:yo("top",n,t),right:yo("right",n,t),bottom:yo("bottom",n,t),left:yo("left",n,t)})}function $_(e,t,n,i){var o=U(t),a={top:/n/.test(e)?o.bottom-n.height:o.top,left:/w/.test(e)?o.right-n.width:o.left,bottom:/s/.test(e)?o.top+n.height:o.bottom,right:/e/.test(e)?o.left+n.width:o.right},r=i?U(i):a,s={top:Qo(a.top,r.top),left:Qo(a.left,r.left),bottom:Jo(a.bottom,r.bottom),right:Jo(a.right,r.right)};return ds(s)}function yi(e,t){return typeof e<"u"?e:O_}function q_(e,t){var n,i,o,a;return typeof t=="object"?(n=yi(t.left),i=yi(t.right),o=yi(t.top),a=yi(t.bottom)):n=i=o=a=yi(t),{x:e.x-n,y:e.y-o,width:e.width+n+i,height:e.height+o+a}}function H_(e){return!(e.waypoints||e.type==="label")}function Uu(e,t){var n;if(e.length===void 0?n=ae(e.children,H_):n=e,n.length)return q_(wt(n),t)}var dn=Math.abs;function z_(e,t){return Wu(U(t),U(e))}var V_=["bpmn:Participant","bpmn:Process","bpmn:SubProcess"],vt=30;function Sa(e,t){return t=t||[],e.children.filter(function(n){_(n,"bpmn:Lane")&&(Sa(n,t),t.push(n))}),t}function bn(e){return e.children.filter(function(t){return _(t,"bpmn:Lane")})}function yt(e){return Qn(e,V_)||e}function W_(e,t){var n=yt(e),i=_(n,"bpmn:Process")?[]:[n],o=Sa(n,i),a=U(e),r=U(t),s=z_(e,t),c=[],d=Ze(e);return o.forEach(function(l){if(l!==e){var p=d?0:s.top,u=d?s.right:0,m=d?0:s.bottom,h=d?s.left:0,g=U(l);s.top&&(dn(g.bottom-a.top)<10&&(m=r.top-g.bottom),dn(g.top-a.top)<5&&(p=r.top-g.top)),s.left&&(dn(g.right-a.left)<10&&(u=r.left-g.right),dn(g.left-a.left)<5&&(h=r.left-g.left)),s.bottom&&(dn(g.top-a.bottom)<10&&(p=r.bottom-g.top),dn(g.bottom-a.bottom)<5&&(m=r.bottom-g.bottom)),s.right&&(dn(g.left-a.right)<10&&(h=r.right-g.left),dn(g.right-a.right)<5&&(u=r.right-g.right)),(p||u||m||h)&&c.push({shape:l,newBounds:G_(l,{top:p,right:u,bottom:m,left:h})})}}),c}var U_=500;function zs(e,t){D.call(this,e);function n(i,o){var a=Ze(i),r=bn(o),s=[],c=[],d=[],l=[];if(ma(r,function(f){return a?f.y>i.y?c.push(f):s.push(f):f.x>i.x?l.push(f):d.push(f),f.children}),!!r.length){var p;a?c.length&&s.length?p=i.height/2:p=i.height:l.length&&d.length?p=i.width/2:p=i.width;var u,m,h,g;s.length&&(u=t.calculateAdjustments(s,"y",p,i.y-10),t.makeSpace(u.movingShapes,u.resizingShapes,{x:0,y:p},"s")),c.length&&(m=t.calculateAdjustments(c,"y",-p,i.y+i.height+10),t.makeSpace(m.movingShapes,m.resizingShapes,{x:0,y:-p},"n")),d.length&&(h=t.calculateAdjustments(d,"x",p,i.x-10),t.makeSpace(h.movingShapes,h.resizingShapes,{x:p,y:0},"e")),l.length&&(g=t.calculateAdjustments(l,"x",-p,i.x+i.width+10),t.makeSpace(g.movingShapes,g.resizingShapes,{x:-p,y:0},"w"))}}this.postExecuted("shape.delete",U_,function(i){var o=i.context,a=o.hints,r=o.shape,s=o.oldParent;_(r,"bpmn:Lane")&&(a&&a.nested||n(r,s))})}zs.$inject=["eventBus","spaceTool"];z(zs,D);var Od=500;function Ta(e,t){t.invoke(D,this),this._bpmnReplace=e;var n=this;this.postExecuted("elements.create",Od,function(i){var o=i.elements;o.filter(function(a){var r=a.host;return Ld(a,r)}).map(function(a){return o.indexOf(a)}).forEach(function(a){i.elements[a]=n._replaceShape(o[a])})},!0),this.preExecute("elements.move",Od,function(i){var o=i.shapes,a=i.newHost;o.forEach(function(r,s){var c=r.host;Ld(r,K_(o,c)?c:a)&&(o[s]=n._replaceShape(r))})},!0)}Ta.$inject=["bpmnReplace","injector"];z(Ta,D);Ta.prototype._replaceShape=function(e){var t=Y_(e),n;return t?n={type:"bpmn:IntermediateCatchEvent",eventDefinitionType:t.$type}:n={type:"bpmn:IntermediateThrowEvent"},this._bpmnReplace.replaceElement(e,n,{layoutConnection:!1})};function Y_(e){var t=G(e),n=t.eventDefinitions;return n&&n[0]}function Ld(e,t){return!ce(e)&&_(e,"bpmn:BoundaryEvent")&&!t}function K_(e,t){return e.indexOf(t)!==-1}function Vs(e,t,n){D.call(this,e);function i(o,a,r){var s=a.waypoints,c,d,l,p,u,m,h,g=o.outgoing.slice(),f=o.incoming.slice(),w;te(r.width)?w=Z(r):w=r;var E=Fr(s,w);if(E){if(c=s.slice(0,E.index),d=s.slice(E.index+(E.bendpoint?1:0)),!c.length||!d.length)return;l=E.bendpoint?s[E.index]:w,(c.length===1||!Gd(o,c[c.length-1]))&&c.push(jd(l)),(d.length===1||!Gd(o,d[0]))&&d.unshift(jd(l))}p=a.source,u=a.target,t.canConnect(p,o,a)&&(n.reconnectEnd(a,o,c||w),m=a),t.canConnect(o,u,a)&&(m?h=n.connect(o,u,{type:a.type,waypoints:d}):(n.reconnectStart(a,o,d||w),h=a));var v=[].concat(m&&ae(f,function(y){return y.source===m.source})||[],h&&ae(g,function(y){return y.target===h.target})||[]);v.length&&n.removeElements(v)}this.preExecute("elements.move",function(o){var a=o.newParent,r=o.shapes,s=o.delta,c=r[0];if(!(!c||!a)){a&&a.waypoints&&(o.newParent=a=a.parent);var d=Z(c),l={x:d.x+s.x,y:d.y+s.y},p=Te(a.children,function(u){var m=t.canInsert(r,u);return m&&Fr(u.waypoints,l)});p&&(o.targetFlow=p,o.position=l)}},!0),this.postExecuted("elements.move",function(o){var a=o.shapes,r=o.targetFlow,s=o.position;r&&i(a[0],r,s)},!0),this.preExecute("shape.create",function(o){var a=o.parent,r=o.shape;t.canInsert(r,a)&&(o.targetFlow=a,o.parent=a.parent)},!0),this.postExecuted("shape.create",function(o){var a=o.shape,r=o.targetFlow,s=o.position;r&&i(a,r,s)},!0)}z(Vs,D);Vs.$inject=["eventBus","bpmnRules","modeling"];function Gd(e,t){var n=t.x,i=t.y;return n>=e.x&&n<=e.x+e.width&&i>=e.y&&i<=e.y+e.height}function jd(e){return C({},e)}function Ws(e,t){D.call(this,e),this.preExecuted("connection.create",function(n){var i=n.context,o=i.connection,a=i.source,r=i.target,s=i.hints;if(!(s&&s.createElementsBehavior===!1)&&Hn(o)){var c=[];_(a,"bpmn:EventBasedGateway")?c=r.incoming.filter(d=>d!==o&&Hn(d)):c=r.incoming.filter(d=>d!==o&&Hn(d)&&_(d.source,"bpmn:EventBasedGateway")),c.forEach(function(d){t.removeConnection(d)})}}),this.preExecuted("shape.replace",function(n){var i=n.context,o=i.newShape;if(_(o,"bpmn:EventBasedGateway")){var a=o.outgoing.filter(Hn).reduce(function(r,s){return r.includes(s.target)?r:r.concat(s.target)},[]);a.forEach(function(r){r.incoming.filter(Hn).forEach(function(s){const c=r.incoming.filter(Hn).filter(function(d){return d.source===o});(s.source!==o||c.length>1)&&t.removeConnection(s)})})}})}Ws.$inject=["eventBus","modeling"];z(Ws,D);function Hn(e){return _(e,"bpmn:SequenceFlow")}var wo=1500,$d=2e3;function Yu(e,t,n){t.on(["create.hover","create.move","create.out","create.end","shape.move.hover","shape.move.move","shape.move.out","shape.move.end"],wo,function(i){var o=i.context,a=o.shape||i.shape,r=i.hover;_(r,"bpmn:Lane")&&!Q(a,["bpmn:Lane","bpmn:Participant"])&&(i.hover=yt(r),i.hoverGfx=e.getGraphics(i.hover));var s=n.getRootElement();r!==s&&(a.labelTarget||Q(a,["bpmn:Group","bpmn:TextAnnotation"]))&&(i.hover=s,i.hoverGfx=e.getGraphics(i.hover))}),t.on(["connect.hover","connect.out","connect.end","connect.cleanup","global-connect.hover","global-connect.out","global-connect.end","global-connect.cleanup"],wo,function(i){var o=i.hover;_(o,"bpmn:Lane")&&(i.hover=yt(o)||o,i.hoverGfx=e.getGraphics(i.hover))}),t.on(["bendpoint.move.hover"],wo,function(i){var o=i.context,a=i.hover,r=o.type;_(a,"bpmn:Lane")&&/reconnect/.test(r)&&(i.hover=yt(a)||a,i.hoverGfx=e.getGraphics(i.hover))}),t.on(["connect.start"],wo,function(i){var o=i.context,a=o.start;_(a,"bpmn:Lane")&&(o.start=yt(a)||a)}),t.on("shape.move.start",$d,function(i){var o=i.shape;_(o,"bpmn:Lane")&&(i.shape=yt(o)||o)}),t.on("spaceTool.move",$d,function(i){var o=i.hover;o&&_(o,"bpmn:Lane")&&(i.hover=yt(o))})}Yu.$inject=["elementRegistry","eventBus","canvas"];function Z_(e){return e.create("bpmn:Category")}function X_(e){return e.create("bpmn:CategoryValue")}function J_(e,t,n){return Ve(t.get("categoryValue"),e),e.$parent=t,Ve(n.get("rootElements"),t),t.$parent=n,e}function Q_(e){var t=e.$parent;return t&&(qe(t.get("categoryValue"),e),e.$parent=null),e}function eb(e){var t=e.$parent;return t&&(qe(t.get("rootElements"),e),e.$parent=null),e}var qd=770;function Us(e,t,n,i,o,a){o.invoke(D,this);function r(){return n.filter(function(h){return _(h,"bpmn:Group")})}function s(h,g){return h.some(function(f){var w=G(f),E=w.categoryValueRef&&w.categoryValueRef.$parent;return E===g})}function c(h,g){return h.some(function(f){var w=G(f);return w.categoryValueRef===g})}function d(h,g,f){var w=r().filter(function(E){return E.businessObject!==f});g&&!s(w,g)&&eb(g),h&&!c(w,h)&&Q_(h)}function l(h,g){return J_(h,g,t.getDefinitions())}function p(h,g){var f=G(h),w=f.categoryValueRef;w||(w=f.categoryValueRef=g.categoryValue=g.categoryValue||X_(e));var E=w.$parent;E||(E=w.$parent=g.category=g.category||Z_(e)),l(w,E,t.getDefinitions())}function u(h,g){var f=g.category,w=g.categoryValue,E=G(h);w?(E.categoryValueRef=null,d(w,f,E)):d(null,E.categoryValueRef.$parent,E)}this.execute("label.create",function(h){var g=h.context,f=g.labelTarget;_(f,"bpmn:Group")&&p(f,g)}),this.revert("label.create",function(h){var g=h.context,f=g.labelTarget;_(f,"bpmn:Group")&&u(f,g)}),this.execute("shape.delete",function(h){var g=h.context,f=g.shape,w=G(f);if(!(!_(f,"bpmn:Group")||f.labelTarget)){var E=g.categoryValue=w.categoryValueRef,v;E&&(v=g.category=E.$parent,d(E,v,w),w.categoryValueRef=null)}}),this.reverted("shape.delete",function(h){var g=h.context,f=g.shape;if(!(!_(f,"bpmn:Group")||f.labelTarget)){var w=g.category,E=g.categoryValue,v=G(f);E&&(v.categoryValueRef=E,l(E,w))}}),this.execute("shape.create",function(h){var g=h.context,f=g.shape;!_(f,"bpmn:Group")||f.labelTarget||G(f).categoryValueRef&&p(f,g)}),this.reverted("shape.create",function(h){var g=h.context,f=g.shape;!_(f,"bpmn:Group")||f.labelTarget||G(f).categoryValueRef&&u(f,g)});function m(h,g){var f=e.create(h.$type);return a.copyElement(h,f,null,g)}i.on("copyPaste.copyElement",qd,function(h){var g=h.descriptor,f=h.element;if(!(!_(f,"bpmn:Group")||f.labelTarget)){var w=G(f);if(w.categoryValueRef){var E=w.categoryValueRef;g.categoryValue=m(E,!0),E.$parent&&(g.category=m(E.$parent,!0))}}}),i.on("copyPaste.pasteElement",qd,function(h){var g=h.descriptor,f=g.businessObject,w=g.categoryValue,E=g.category;w&&(w=f.categoryValueRef=m(w)),E&&(w.$parent=m(E)),delete g.category,delete g.categoryValue})}Us.$inject=["bpmnFactory","bpmnjs","elementRegistry","eventBus","injector","moddleCopy"];z(Us,D);function Hr(e,t,n,i){var o,a,r,s,c;return o=(i.y-n.y)*(t.x-e.x)-(i.x-n.x)*(t.y-e.y),o==0?null:(a=e.y-n.y,r=e.x-n.x,c=(i.x-n.x)*a-(i.y-n.y)*r,s=c/o,{x:Math.round(e.x+s*(t.x-e.x)),y:Math.round(e.y+s*(t.y-e.y))})}function Ku(e){function t(i,o,a){var r={x:a.x,y:a.y-50},s={x:a.x-50,y:a.y},c=Hr(i,o,a,r),d=Hr(i,o,a,s),l;c&&d?Hd(c,a)>Hd(d,a)?l=d:l=c:l=c||d,i.original=l}function n(i){var o=i.waypoints;t(o[0],o[1],Z(i.source)),t(o[o.length-1],o[o.length-2],Z(i.target))}e.on("bpmnElement.added",function(i){var o=i.element;o.waypoints&&n(o)})}Ku.$inject=["eventBus"];function Hd(e,t){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function Ys(e){D.call(this,e);var t=["bpmn:Participant","bpmn:Lane"];this.executed(["shape.move","shape.create","shape.resize"],function(n){var i=n.context.shape,o=G(i),a=fe(i);if(Q(o,t)){var r=a.get("isHorizontal");r===void 0&&(r=!0),a.set("isHorizontal",r)}})}Ys.$inject=["eventBus"];z(Ys,D);var Zu=Math.sqrt,Xu=Math.min,tb=Math.max,zd=Math.abs;function Vd(e){return Math.pow(e,2)}function wi(e,t){return Zu(Vd(e.x-t.x)+Vd(e.y-t.y))}function nb(e,t){var n=0,i,o,a,r,s,c,d,l,p,u,m;for(n=0;n<t.length-1;n++){if(i=t[n],o=t[n+1],Ud(i,o)?d=[i]:(a=wi(e,i),r=wi(e,o),c=Xu(a,r),d=ib(i,o,e,c)),d.length<1)throw new Error("expected between [1, 2] circle -> line intersections");d.length===1&&(l={type:"bendpoint",position:d[0],segmentIndex:n,bendpointIndex:Ud(i,d[0])?n:n+1}),d.length===2&&(s=ab(d[0],d[1]),l={type:"segment",position:s,segmentIndex:n,relativeLocation:wi(i,s)/wi(i,o)}),p=wi(l.position,e),(!m||u>p)&&(m=l,u=p)}return m}function ib(e,t,n,i){var o=t.x-e.x,a=t.y-e.y,r=n.x-e.x,s=n.y-e.y,c=o*o+a*a,d=o*r+a*s,l=r*r+s*s-i*i,p=d/c,u=l/c,m=p*p-u;if(m<0&&m>-1e-6&&(m=0),m<0)return[];var h=Zu(m),g=-p+h,f=-p-h,w={x:e.x-o*g,y:e.y-a*g};if(m===0)return[w];var E={x:e.x-o*f,y:e.y-a*f};return[w,E].filter(function(v){return ob(v,e,t)})}function ob(e,t,n){return Wd(e.x,t.x,n.x)&&Wd(e.y,t.y,n.y)}function Wd(e,t,n){return e>=Xu(t,n)-ea&&e<=tb(t,n)+ea}function ab(e,t){return{x:(e.x+t.x)/2,y:(e.y+t.y)/2}}var ea=.1;function Ud(e,t){return zd(e.x-t.x)<=ea&&zd(e.y-t.y)<=ea}function rb(e,t,n,i){var o=n.segmentIndex,a=t.length-e.length;if(i.segmentMove){var r=i.segmentMove.segmentStartIndex,s=i.segmentMove.newSegmentStartIndex;return o===r?s:o>=s?o+a<s?s:o+a:o}if(i.bendpointMove){var c=i.bendpointMove.insert,d=i.bendpointMove.bendpointIndex,l;if(a===0)return o;if(o>=d&&(l=c?o+1:o-1),o<d&&(l=o,c&&n.type!=="bendpoint"&&d-1===o)){var p=Qu(t,d);p<n.relativeLocation&&l++}return l}return a===0?o:i.connectionStart&&o===0?0:i.connectionEnd&&o===e.length-2?t.length-2:Math.floor((t.length-2)/2)}function Ju(e,t,n,i){var o=0,a=0,r={point:e,delta:{x:0,y:0}},s=nb(e,n),c=s.segmentIndex,d=rb(n,t,s,i);if(d<0||d>t.length-2||d===null)return r;var l=Yd(n,c),p=Yd(t,d),u=s.position,m=cb(l,u),h=sb(l,p);if(s.type==="bendpoint"){var g=t.length-n.length,f=s.bendpointIndex,w=n[f];if(t.indexOf(w)!==-1)return r;if(g===0){var E=t[f];return o=E.x-s.position.x,a=E.y-s.position.y,{delta:{x:o,y:a},point:{x:e.x+o,y:e.y+a}}}g<0&&f!==0&&f<n.length-1&&(m=Qu(n,f))}var v={x:(p[1].x-p[0].x)*m+p[0].x,y:(p[1].y-p[0].y)*m+p[0].y},y=Xg({x:e.x-u.x,y:e.y-u.y},h);return o=v.x+y.x-e.x,a=v.y+y.y-e.y,{point:Bi(v),delta:Bi({x:o,y:a})}}function Qu(e,t){var n=Zo(e[t-1],e[t]),i=Zo(e[t],e[t+1]),o=n/(n+i);return o}function sb(e,t){var n=bd(e),i=bd(t);return i-n}function Yd(e,t){return[e[t],e[t+1]]}function cb(e,t){var n=Zo(e[0],e[1]),i=Zo(e[0],t);return n===0?0:i/n}function db(e,t,n,i){var o=Z(e);return Ju(o,t,n,i).delta}function zi(e,t,n){var i=Ti(t),o=Ti(n),a=Rt(e,i),r={x:a.x*(n.width/t.width),y:a.y*(n.height/t.height)};return Bi({x:o.x+r.x,y:o.y+r.y})}function Kd(e,t,n){var i=Ti(e),o=Ti(t),a=Ti(n),r=Rt(e,i),s=Rt(i,o),c=pb(i,t,n);if(c)return c;var d={x:s.x*(n.width/t.width),y:s.y*(n.height/t.height)},l={x:a.x+d.x,y:a.y+d.y};return Bi({x:l.x+r.x-e.x,y:l.y+r.y-e.y})}function pb(e,t,n){var i=U(t),o=U(n);if(lb(i,o))return null;var a=Qe(t,e),r,s,c;if(a==="top")r={x:0,y:o.bottom-i.bottom};else if(a==="bottom")r={x:0,y:o.top-i.top};else if(a==="right")r={x:o.left-i.left,y:0};else if(a==="left")r={x:o.right-i.right,y:0};else return null;return s={x:e.x+r.x,y:e.y+r.y},c=Qe(n,s),c!==a?null:r}function lb(e,t){return ub(e,t)||mb(e,t)}function ub(e,t){return e.right!==t.right&&e.left!==t.left}function mb(e,t){return e.top!==t.top&&e.bottom!==t.bottom}var Zd="name",Xd="text";function Ks(e,t,n,i){D.call(this,e),this.postExecute("element.updateProperties",o),this.postExecute("element.updateModdleProperties",r=>{G(r.context.element)===r.context.moddleElement&&o(r)});function o(r){var s=r.context,c=s.element,d=s.properties;if(Zd in d&&t.updateLabel(c,d[Zd]),Xd in d&&_(c,"bpmn:TextAnnotation")){var l=i.getTextAnnotationBounds({x:c.x,y:c.y,width:c.width,height:c.height},d[Xd]||"");t.updateLabel(c,d.text,l)}}this.postExecute(["shape.create","connection.create"],function(r){var s=r.context,c=s.hints||{};if(c.createElementsBehavior!==!1){var d=s.shape||s.connection;ce(d)||!Kn(d)||Yt(d)&&t.updateLabel(d,Yt(d))}}),this.postExecute("shape.delete",function(r){var s=r.context,c=s.labelTarget,d=s.hints||{};c&&d.unsetLabel!==!1&&t.updateLabel(c,null,null,{removeShape:!1})});function a(r){var s=r.context,c=s.connection,d=c.label,l=C({},s.hints),p=s.newWaypoints||c.waypoints,u=s.oldWaypoints;return typeof l.startChanged>"u"&&(l.startChanged=!!l.connectionStart),typeof l.endChanged>"u"&&(l.endChanged=!!l.connectionEnd),db(d,p,u,l)}this.postExecute(["connection.layout","connection.updateWaypoints"],function(r){var s=r.context,c=s.hints||{};if(c.labelBehavior!==!1){var d=s.connection,l=d.label,p;!l||!l.parent||(p=a(r),t.moveShape(l,p))}}),this.postExecute(["shape.replace"],function(r){var s=r.context,c=s.newShape,d=s.oldShape,l=G(c);l&&Kn(l)&&d.label&&c.label&&(c.label.x=d.label.x,c.label.y=d.label.y)}),this.postExecute("shape.resize",function(r){var s=r.context,c=s.shape,d=s.newBounds,l=s.oldBounds;if(ua(c)){var p=c.label,u=Z(p),m=gb(l),h=fb(u,m),g=hb(h,l,d);t.moveShape(p,g)}})}z(Ks,D);Ks.$inject=["eventBus","modeling","bpmnFactory","textRenderer"];function hb(e,t,n){var i=zi(e,t,n);return Bi(Rt(i,e))}function fb(e,t){if(t.length){var n=_b(e,t);return Cs(e,n)}}function gb(e){return[[{x:e.x,y:e.y},{x:e.x+(e.width||0),y:e.y}],[{x:e.x+(e.width||0),y:e.y},{x:e.x+(e.width||0),y:e.y+(e.height||0)}],[{x:e.x,y:e.y+(e.height||0)},{x:e.x+(e.width||0),y:e.y+(e.height||0)}],[{x:e.x,y:e.y},{x:e.x,y:e.y+(e.height||0)}]]}function _b(e,t){var n=t.map(function(o){return{line:o,distance:Cu(e,o)}}),i=Zt(n,"distance");return i[0].line}function bb(e,t,n,i){return Ju(e,t,n,i).point}function Zs(e,t){D.call(this,e);function n(i,o){var a=i.context,r=a.connection,s=C({},a.hints),c=a.newWaypoints||r.waypoints,d=a.oldWaypoints;return typeof s.startChanged>"u"&&(s.startChanged=!!s.connectionStart),typeof s.endChanged>"u"&&(s.endChanged=!!s.connectionEnd),bb(o,c,d,s)}this.postExecute(["connection.layout","connection.updateWaypoints"],function(i){var o=i.context,a=o.connection,r=a.outgoing,s=a.incoming;s.forEach(function(c){var d=c.waypoints[c.waypoints.length-1],l=n(i,d),p=[].concat(c.waypoints.slice(0,-1),[l]);t.updateWaypoints(c,p)}),r.forEach(function(c){var d=c.waypoints[0],l=n(i,d),p=[].concat([l],c.waypoints.slice(1));t.updateWaypoints(c,p)})}),this.postExecute(["connection.move"],function(i){var o=i.context,a=o.connection,r=a.outgoing,s=a.incoming,c=o.delta;s.forEach(function(d){var l=d.waypoints[d.waypoints.length-1],p={x:l.x+c.x,y:l.y+c.y},u=[].concat(d.waypoints.slice(0,-1),[p]);t.updateWaypoints(d,u)}),r.forEach(function(d){var l=d.waypoints[0],p={x:l.x+c.x,y:l.y+c.y},u=[].concat([p],d.waypoints.slice(1));t.updateWaypoints(d,u)})})}z(Zs,D);Zs.$inject=["eventBus","modeling"];function Ma(e,t,n){var i=Ca(e),o=tm(i,t),a=i[0];return o.length?o[o.length-1]:zi(a.original||a,n,t)}function Na(e,t,n){var i=Ca(e),o=tm(i,t),a=i[i.length-1];return o.length?o[0]:zi(a.original||a,n,t)}function Xs(e,t,n){var i=Ca(e),o=em(t,n),a=i[0];return zi(a.original||a,o,t)}function Js(e,t,n){var i=Ca(e),o=em(t,n),a=i[i.length-1];return zi(a.original||a,o,t)}function em(e,t){return{x:e.x-t.x,y:e.y-t.y,width:e.width,height:e.height}}function Ca(e){var t=e.waypoints;if(!t.length)throw new Error("connection#"+e.id+": no waypoints");return t}function tm(e,t){var n=ht(e,yb);return ae(n,function(i){return vb(i,t)})}function vb(e,t){return Qe(t,e,1)==="intersect"}function yb(e){return e.original||e}function Qs(e,t){D.call(this,e),this.postExecute("shape.replace",function(n){var i=n.oldShape,o=n.newShape;if(wb(i,o)){var a=Eb(i);a.incoming.forEach(function(r){var s=Na(r,o,i);t.reconnectEnd(r,o,s)}),a.outgoing.forEach(function(r){var s=Ma(r,o,i);t.reconnectStart(r,o,s)})}},!0)}Qs.$inject=["eventBus","modeling"];z(Qs,D);function wb(e,t){return _(e,"bpmn:Participant")&&pe(e)&&_(t,"bpmn:Participant")&&!pe(t)}function Eb(e){var t=Gi([e],!1),n=[],i=[];return t.forEach(function(o){o!==e&&(o.incoming.forEach(function(a){_(a,"bpmn:MessageFlow")&&n.push(a)}),o.outgoing.forEach(function(a){_(a,"bpmn:MessageFlow")&&i.push(a)}))},[]),{incoming:n,outgoing:i}}const xb=["bpmn:MessageEventDefinition","bpmn:TimerEventDefinition","bpmn:EscalationEventDefinition","bpmn:ConditionalEventDefinition","bpmn:SignalEventDefinition"];function nm(e){const t=G(e);if(!_(t,"bpmn:BoundaryEvent")&&!(_(t,"bpmn:StartEvent")&&rt(t.$parent)))return!1;const n=t.get("eventDefinitions");return!n||!n.length?!1:xb.some(i=>_(n[0],i))}function im(e){return _(e,"bpmn:BoundaryEvent")?"cancelActivity":"isInterrupting"}function ec(e,t){e.invoke(D,this),this.postExecuted("shape.replace",function(n){const i=n.context.oldShape,o=n.context.newShape,a=n.context.hints;if(!nm(o))return;const r=im(o);if(a.targetElement&&a.targetElement[r]!==void 0)return;const c=G(i).get(r),d=G(o).get(r);c!==d&&t.updateProperties(o,{[r]:c})})}ec.$inject=["injector","modeling"];z(ec,D);function tc(e,t){D.call(this,e),this.preExecute("shape.resize",function(n){var i=n.shape,o=fe(i),a=o&&o.get("label"),r=a&&a.get("bounds");r&&t.updateModdleProperties(i,a,{bounds:void 0})},!0)}z(tc,D);tc.$inject=["eventBus","modeling"];function nc(e,t,n){D.call(this,e),this.preExecute("shape.delete",function(i){var o=i.context.shape;if(!(o.incoming.length!==1||o.outgoing.length!==1)){var a=o.incoming[0],r=o.outgoing[0];if(!(!_(a,"bpmn:SequenceFlow")||!_(r,"bpmn:SequenceFlow"))&&t.canConnect(a.source,r.target,a)){var s=Pb(a.waypoints,r.waypoints);n.reconnectEnd(a,r.target,s)}}})}z(nc,D);nc.$inject=["eventBus","bpmnRules","modeling"];function zn(e){return e.original||e}function Pb(e,t){var n=Hr(zn(e[e.length-2]),zn(e[e.length-1]),zn(t[1]),zn(t[0]));return n?[].concat(e.slice(0,e.length-1),[n],t.slice(1)):[zn(e[0]),zn(t[t.length-1])]}function ic(e,t){D.call(this,e),this.preExecute("shape.delete",function(n){var i=n.shape,o=i.parent;_(i,"bpmn:Participant")&&(n.collaborationRoot=o)},!0),this.postExecute("shape.delete",function(n){var i=n.collaborationRoot;if(i&&!i.businessObject.participants.length){var o=t.makeProcess(),a=i.children.slice();t.moveElements(a,{x:0,y:0},o)}},!0)}ic.$inject=["eventBus","modeling"];z(ic,D);function oc(e,t,n,i){D.call(this,e);var o=i.get("dragging",!1);function a(c){var d=c.source,l=c.target,p=c.parent;if(p){var u,m;_(c,"bpmn:SequenceFlow")&&(n.canConnectSequenceFlow(d,l)||(m=!0),n.canConnectMessageFlow(d,l)&&(u="bpmn:MessageFlow")),_(c,"bpmn:MessageFlow")&&(n.canConnectMessageFlow(d,l)||(m=!0),n.canConnectSequenceFlow(d,l)&&(u="bpmn:SequenceFlow")),m&&t.removeConnection(c),u&&t.connect(d,l,{type:u,waypoints:c.waypoints.slice()})}}function r(c){var d=c.context,l=d.connection,p=d.newSource||l.source,u=d.newTarget||l.target,m,h;m=n.canConnect(p,u),!(!m||m.type===l.type)&&(h=t.connect(p,u,{type:m.type,associationDirection:m.associationDirection,waypoints:l.waypoints.slice()}),l.parent&&t.removeConnection(l),d.connection=h,o&&s(l,h))}function s(c,d){var l=o.context(),p=l&&l.payload.previousSelection,u;!p||!p.length||(u=p.indexOf(c),u!==-1&&p.splice(u,1,d))}this.postExecuted("elements.move",function(c){var d=c.closure,l=d.allConnections;T(l,a)},!0),this.preExecute("connection.reconnect",r),this.postExecuted("element.updateProperties",function(c){var d=c.context,l=d.properties,p=d.element,u=p.businessObject,m;l.default&&(m=Te(p.outgoing,Ut({id:p.businessObject.default.id})),m&&t.updateProperties(m,{conditionExpression:void 0})),l.conditionExpression&&u.sourceRef.default===u&&t.updateProperties(p.source,{default:void 0})})}z(oc,D);oc.$inject=["eventBus","modeling","bpmnRules","injector"];function Ra(e,t,n,i,o,a){i.invoke(D,this),this._bpmnReplace=e,this._elementRegistry=n,this._selection=a,this.postExecuted(["elements.create"],500,function(r){var s=r.context,c=s.parent,d=s.elements,l=gn(d,function(p,u){var m=t.canReplace([u],u.host||u.parent||c);return m?p.concat(m.replacements):p},[]);l.length&&this._replaceElements(d,l)},this),this.postExecuted(["elements.move"],500,function(r){var s=r.context,c=s.newParent,d=s.newHost,l=[];T(s.closure.topLevel,function(u){rt(u)?l=l.concat(u.children):l=l.concat(u)}),l.length===1&&d&&(c=d);var p=t.canReplace(l,c);p&&this._replaceElements(l,p.replacements,d)},this),this.postExecute(["shape.replace"],1500,function(r){var s=r.context,c=s.oldShape,d=s.newShape,l=c.attachers,p;l&&l.length&&(p=t.canReplace(l,d),this._replaceElements(l,p.replacements))},this),this.postExecuted(["shape.replace"],1500,function(r){var s=r.context,c=s.oldShape,d=s.newShape;o.unclaimId(c.businessObject.id,c.businessObject),o.updateProperties(d,{id:c.id})})}z(Ra,D);Ra.prototype._replaceElements=function(e,t){var n=this._elementRegistry,i=this._bpmnReplace,o=this._selection;T(t,function(a){var r={type:a.newElementType},s=n.get(a.oldElementId),c=e.indexOf(s);e[c]=i.replaceElement(s,r,{select:!1})}),t&&o.select(e)};Ra.$inject=["bpmnReplace","bpmnRules","elementRegistry","injector","modeling","selection"];var Sb=1500,Tb={width:140,height:120},ac={width:300,height:60},rc={width:60,height:300},Go={width:300,height:150},jo={width:150,height:300},om={width:140,height:120},am={width:50,height:30};function rm(e){e.on("resize.start",Sb,function(t){var n=t.context,i=n.shape,o=n.direction,a=n.balanced;(_(i,"bpmn:Lane")||_(i,"bpmn:Participant"))&&(n.resizeConstraints=Bb(i,o,a)),_(i,"bpmn:SubProcess")&&pe(i)&&(n.minDimensions=om),_(i,"bpmn:TextAnnotation")&&(n.minDimensions=am)})}rm.$inject=["eventBus"];var pn=Math.abs,Mb=Math.min,Nb=Math.max;function sm(e,t,n,i){var o=e[t];e[t]=o===void 0?n:i(n,o)}function Vn(e,t,n){return sm(e,t,n,Mb)}function Wn(e,t,n){return sm(e,t,n,Nb)}var Cb={top:20,left:50,right:20,bottom:20},Rb={top:50,left:20,right:20,bottom:20};function Bb(e,t,n){var i=yt(e),o=!0,a=!0,r=Sa(i,[i]),s=U(e),c={},d={},l=Ze(e),p=l?ac:rc;/n/.test(t)?d.top=s.bottom-p.height:/e/.test(t)?d.right=s.left+p.width:/s/.test(t)?d.bottom=s.top+p.height:/w/.test(t)&&(d.left=s.right-p.width),r.forEach(function(h){var g=U(h);l?(g.top<s.top-10&&(o=!1),g.bottom>s.bottom+10&&(a=!1)):(g.left<s.left-10&&(o=!1),g.right>s.right+10&&(a=!1)),/n/.test(t)&&(n&&pn(s.top-g.bottom)<10&&Wn(c,"top",g.top+p.height),pn(s.top-g.top)<5&&Vn(d,"top",g.bottom-p.height)),/e/.test(t)&&(n&&pn(s.right-g.left)<10&&Vn(c,"right",g.right-p.width),pn(s.right-g.right)<5&&Wn(d,"right",g.left+p.width)),/s/.test(t)&&(n&&pn(s.bottom-g.top)<10&&Vn(c,"bottom",g.bottom-p.height),pn(s.bottom-g.bottom)<5&&Wn(d,"bottom",g.top+p.height)),/w/.test(t)&&(n&&pn(s.left-g.right)<10&&Wn(c,"left",g.left+p.width),pn(s.left-g.left)<5&&Vn(d,"left",g.right-p.width))});var u=i.children.filter(function(h){return!h.hidden&&!h.waypoints&&(_(h,"bpmn:FlowElement")||_(h,"bpmn:Artifact"))}),m=l?Cb:Rb;return u.forEach(function(h){var g=U(h);/n/.test(t)&&(!l||o)&&Vn(d,"top",g.top-m.top),/e/.test(t)&&(l||a)&&Wn(d,"right",g.right+m.right),/s/.test(t)&&(!l||a)&&Wn(d,"bottom",g.bottom+m.bottom),/w/.test(t)&&(l||o)&&Vn(d,"left",g.left-m.left)}),{min:d,max:c}}var Jd=1001;function cm(e,t){e.on("resize.start",Jd+500,function(n){var i=n.context,o=i.shape;(_(o,"bpmn:Lane")||_(o,"bpmn:Participant"))&&(i.balanced=!Ai(n))}),e.on("resize.end",Jd,function(n){var i=n.context,o=i.shape,a=i.canExecute,r=i.newBounds;if(_(o,"bpmn:Lane")||_(o,"bpmn:Participant"))return a&&(r=Fl(r),t.resizeLane(o,r,i.balanced)),!1})}cm.$inject=["eventBus","modeling"];var Ab=500;function sc(e,t,n,i,o){n.invoke(D,this);function a(l){return Q(l,["bpmn:ReceiveTask","bpmn:SendTask"])||kb(l,["bpmn:ErrorEventDefinition","bpmn:EscalationEventDefinition","bpmn:MessageEventDefinition","bpmn:SignalEventDefinition"])}function r(l){var p=e.getDefinitions(),u=p.get("rootElements");return!!Te(u,Ut({id:l.id}))}function s(l){if(_(l,"bpmn:ErrorEventDefinition"))return"errorRef";if(_(l,"bpmn:EscalationEventDefinition"))return"escalationRef";if(_(l,"bpmn:MessageEventDefinition"))return"messageRef";if(_(l,"bpmn:SignalEventDefinition"))return"signalRef"}function c(l){if(Q(l,["bpmn:ReceiveTask","bpmn:SendTask"]))return l.get("messageRef");var p=l.get("eventDefinitions"),u=p[0];return u.get(s(u))}function d(l,p){if(Q(l,["bpmn:ReceiveTask","bpmn:SendTask"]))return l.set("messageRef",p);var u=l.get("eventDefinitions"),m=u[0];return m.set(s(m),p)}this.executed(["shape.create","element.updateProperties","element.updateModdleProperties"],function(l){var p=l.shape||l.element;if(a(p)){var u=G(p),m=c(u),h;m&&!r(m)&&(h=e.getDefinitions().get("rootElements"),Ve(h,m),l.addedRootElement=m)}},!0),this.reverted(["shape.create","element.updateProperties","element.updateModdleProperties"],function(l){var p=l.addedRootElement;if(p){var u=e.getDefinitions().get("rootElements");qe(u,p)}},!0),t.on("copyPaste.copyElement",function(l){var p=l.descriptor,u=l.element;if(!(u.labelTarget||!a(u))){var m=G(u),h=c(m);h&&(p.referencedRootElement=h)}}),t.on("copyPaste.pasteElement",Ab,function(l){var p=l.descriptor,u=p.businessObject,m=p.referencedRootElement;m&&(r(m)||(m=i.copyElement(m,o.create(m.$type))),d(u,m),delete p.referencedRootElement)})}sc.$inject=["bpmnjs","eventBus","injector","moddleCopy","bpmnFactory"];z(sc,D);function kb(e,t){return se(t)||(t=[t]),ji(t,function(n){return us(e,n)})}var dm=Math.max;function pm(e){e.on("spaceTool.getMinDimensions",function(t){var n=t.shapes,i=t.axis,o=t.start,a={};return T(n,function(r){var s=r.id;_(r,"bpmn:Participant")&&(a[s]=Ib(r,i,o)),_(r,"bpmn:Lane")&&(a[s]=Ze(r)?ac:rc),_(r,"bpmn:SubProcess")&&pe(r)&&(a[s]=om),_(r,"bpmn:TextAnnotation")&&(a[s]=am),_(r,"bpmn:Group")&&(a[s]=Tb)}),a})}pm.$inject=["eventBus"];function Db(e){return e==="x"}function Ib(e,t,n){var i=Ze(e);if(!Lb(e))return i?Go:jo;var o=Db(t),a={};return o?i?a=Go:a={width:Ob(e,n,o),height:jo.height}:i?a={width:Go.width,height:Fb(e,n,o)}:a=jo,a}function Fb(e,t,n){var i;return i=Gb(e,t,n),dm(Go.height,i)}function Ob(e,t,n){var i;return i=jb(e,t,n),dm(jo.width,i)}function Lb(e){return!!bn(e).length}function Gb(e,t,n){var i=bn(e),o;return o=cc(i,t,n),e.height-o.height+ac.height}function jb(e,t,n){var i=bn(e),o;return o=cc(i,t,n),e.width-o.width+rc.width}function cc(e,t,n){var i,o,a;for(i=0;i<e.length;i++)if(o=e[i],!n&&t>=o.y&&t<=o.y+o.height||n&&t>=o.x&&t<=o.x+o.width)return a=bn(o),a.length?cc(a,t,n):o}var Qd=400,$b=600,ep={x:180,y:160};function vn(e,t,n,i,o,a,r){D.call(this,t),this._canvas=e,this._eventBus=t,this._modeling=n,this._elementFactory=i,this._bpmnFactory=o,this._bpmnjs=a,this._elementRegistry=r;var s=this;function c(p){return _(p,"bpmn:SubProcess")&&!pe(p)}function d(p){var u=p.shape,m=p.newRootElement,h=G(u);m=s._addDiagram(m||h),p.newRootElement=e.addRootElement(m)}function l(p){var u=p.shape,m=G(u);s._removeDiagram(m);var h=p.newRootElement=r.get(Un(m));e.removeRootElement(h)}this.executed("shape.create",function(p){var u=p.shape;c(u)&&d(p)},!0),this.postExecuted("shape.create",function(p){var u=p.shape,m=p.newRootElement;!m||!u.children||(s._showRecursively(u.children),s._moveChildrenToShape(u,m))},!0),this.reverted("shape.create",function(p){var u=p.shape;c(u)&&l(p)},!0),this.preExecuted("shape.delete",function(p){var u=p.shape;if(c(u)){var m=r.get(Un(u));m&&n.removeElements(m.children.slice())}},!0),this.executed("shape.delete",function(p){var u=p.shape;c(u)&&l(p)},!0),this.reverted("shape.delete",function(p){var u=p.shape;c(u)&&d(p)},!0),this.preExecuted("shape.replace",function(p){var u=p.oldShape,m=p.newShape;!c(u)||!c(m)||(p.oldRoot=e.removeRootElement(Un(u)))},!0),this.postExecuted("shape.replace",function(p){var u=p.newShape,m=p.oldRoot,h=e.findRoot(Un(u));if(!(!m||!h)){var g=m.children;n.moveElements(g,{x:0,y:0},h)}},!0),this.executed("element.updateProperties",function(p){var u=p.element;if(_(u,"bpmn:SubProcess")){var m=p.properties,h=p.oldProperties,g=h.id,f=m.id;if(g!==f){if(Io(u)){r.updateId(u,Nn(f)),r.updateId(g,f);return}var w=r.get(Nn(g));w&&r.updateId(Nn(g),Nn(f))}}},!0),this.reverted("element.updateProperties",function(p){var u=p.element;if(_(u,"bpmn:SubProcess")){var m=p.properties,h=p.oldProperties,g=h.id,f=m.id;if(g!==f){if(Io(u)){r.updateId(u,Nn(g)),r.updateId(f,g);return}var w=r.get(Nn(f));w&&r.updateId(w,Nn(g))}}},!0),t.on("element.changed",function(p){var u=p.element;if(Io(u)){var m=u,h=r.get(Wc(m));!h||h===m||t.fire("element.changed",{element:h})}}),this.executed("shape.toggleCollapse",Qd,function(p){var u=p.shape;_(u,"bpmn:SubProcess")&&(pe(u)?l(p):(d(p),s._showRecursively(u.children)))},!0),this.reverted("shape.toggleCollapse",Qd,function(p){var u=p.shape;_(u,"bpmn:SubProcess")&&(pe(u)?l(p):(d(p),s._showRecursively(u.children)))},!0),this.postExecuted("shape.toggleCollapse",$b,function(p){var u=p.shape;if(_(u,"bpmn:SubProcess")){var m=p.newRootElement;m&&(pe(u)?s._moveChildrenToShape(m,u):s._moveChildrenToShape(u,m))}},!0),t.on("copyPaste.createTree",function(p){var u=p.element,m=p.children;if(c(u)){var h=Un(u),g=r.get(h);g&&m.push.apply(m,g.children)}}),t.on("copyPaste.copyElement",function(p){var u=p.descriptor,m=p.element,h=p.elements,g=m.parent,f=_(fe(g),"bpmndi:BPMNPlane");if(f){var w=Wc(g),E=Te(h,function(v){return v.id===w});E&&(u.parent=E.id)}}),t.on("copyPaste.pasteElement",function(p){var u=p.descriptor;u.parent&&(c(u.parent)||u.parent.hidden)&&(u.hidden=!0)})}z(vn,D);vn.prototype._moveChildrenToShape=function(e,t){var n=this._modeling,i=e.children,o;if(i){i=i.concat(i.reduce(function(d,l){return l.label&&l.label.parent!==e?d.concat(l.label):d},[]));var a=i.filter(function(d){return!d.hidden});if(!a.length){n.moveElements(i,{x:0,y:0},t,{autoResize:!1});return}var r=wt(a);if(!t.x)o={x:ep.x-r.x,y:ep.y-r.y};else{var s=Z(t),c=Z(r);o={x:s.x-c.x,y:s.y-c.y}}n.moveElements(i,o,t,{autoResize:!1})}};vn.prototype._showRecursively=function(e,t){var n=this,i=[];return e.forEach(function(o){o.hidden=!!t,i=i.concat(o),o.children&&(i=i.concat(n._showRecursively(o.children,o.collapsed||t)))}),i};vn.prototype._addDiagram=function(e){var t=this._bpmnjs,n=t.getDefinitions().diagrams;return e.businessObject||(e=this._createNewDiagram(e)),n.push(e.di.$parent),e};vn.prototype._createNewDiagram=function(e){var t=this._bpmnFactory,n=this._elementFactory,i=t.create("bpmndi:BPMNPlane",{bpmnElement:e}),o=t.create("bpmndi:BPMNDiagram",{plane:i});i.$parent=o;var a=n.createRoot({id:Un(e),type:e.$type,di:i,businessObject:e,collapsed:!0});return a};vn.prototype._removeDiagram=function(e){var t=this._bpmnjs,n=t.getDefinitions().diagrams,i=Te(n,function(o){return o.plane.bpmnElement.id===e.id});return n.splice(n.indexOf(i),1),i};vn.$inject=["canvas","eventBus","modeling","elementFactory","bpmnFactory","bpmnjs","elementRegistry"];function dc(e,t){e.invoke(D,this),this.postExecuted("shape.replace",function(n){var i=n.context.oldShape,o=n.context.newShape;if(!(!_(o,"bpmn:SubProcess")||!(_(i,"bpmn:Task")||_(i,"bpmn:CallActivity"))||!pe(o))){var a=qb(o);t.createShape({type:"bpmn:StartEvent"},a,o)}})}dc.$inject=["injector","modeling"];z(dc,D);function qb(e){return{x:e.x+e.width/6,y:e.y+e.height/2}}function pc(e){D.call(this,e),this.preExecute("connection.create",function(t){const{target:n}=t;_(n,"bpmn:TextAnnotation")&&(t.parent=n.parent)},!0),this.preExecute(["shape.create","shape.resize","elements.move"],function(t){const n=t.shapes||[t.shape];n.length===1&&_(n[0],"bpmn:TextAnnotation")&&(t.hints=t.hints||{},t.hints.autoResize=!1)},!0)}z(pc,D);pc.$inject=["eventBus"];function lc(e,t){D.call(this,e),this.postExecuted("shape.toggleCollapse",1500,function(n){var i=n.shape;if(pe(i))return;var o=Gi(i);o.forEach(function(r){var s=r.incoming.slice(),c=r.outgoing.slice();T(s,function(d){a(d,!0)}),T(c,function(d){a(d,!1)})});function a(r,s){o.indexOf(r.source)!==-1&&o.indexOf(r.target)!==-1||(s?t.reconnectEnd(r,i,Z(i)):t.reconnectStart(r,i,Z(i)))}},!0)}z(lc,D);lc.$inject=["eventBus","modeling"];var dr=500;function uc(e,t,n){D.call(this,e);function i(r){r.length&&r.forEach(function(s){s.type==="label"&&!s.businessObject.name&&(s.hidden=!0)})}function o(r,s){var c=r.children,d=s,l,p;return l=Hb(c).concat([r]),p=Uu(l),p?(d.width=Math.max(p.width,d.width),d.height=Math.max(p.height,d.height),d.x=p.x+(p.width-d.width)/2,d.y=p.y+(p.height-d.height)/2):(d.x=r.x+(r.width-d.width)/2,d.y=r.y+(r.height-d.height)/2),d}function a(r,s){return{x:r.x+(r.width-s.width)/2,y:r.y+(r.height-s.height)/2,width:s.width,height:s.height}}this.executed(["shape.toggleCollapse"],dr,function(r){var s=r.context,c=s.shape;_(c,"bpmn:SubProcess")&&(c.collapsed?fe(c).isExpanded=!1:(i(c.children),fe(c).isExpanded=!0))}),this.reverted(["shape.toggleCollapse"],dr,function(r){var s=r.context,c=s.shape;c.collapsed?fe(c).isExpanded=!1:fe(c).isExpanded=!0}),this.postExecuted(["shape.toggleCollapse"],dr,function(r){var s=r.context.shape,c=t.getDefaultSize(s),d;s.collapsed?d=a(s,c):d=o(s,c),n.resizeShape(s,d,null,{autoResize:s.collapsed?!1:"nwse"})})}z(uc,D);uc.$inject=["eventBus","elementFactory","modeling"];function Hb(e){return e.filter(function(t){return!t.hidden})}function mc(e,t,n,i){t.invoke(D,this),this.preExecute("shape.delete",function(o){var a=o.context,r=a.shape,s=r.businessObject;ce(r)||(_(r,"bpmn:Participant")&&pe(r)&&n.ids.unclaim(s.processRef.id),i.unclaimId(s.id,s))}),this.preExecute("connection.delete",function(o){var a=o.context,r=a.connection,s=r.businessObject;i.unclaimId(s.id,s)}),this.preExecute("canvas.updateRoot",function(){var o=e.getRootElement(),a=o.businessObject;_(o,"bpmn:Collaboration")&&n.ids.unclaim(a.id)})}z(mc,D);mc.$inject=["canvas","injector","moddle","modeling"];function hc(e,t){D.call(this,e),this.preExecute("connection.delete",function(n){var i=n.context,o=i.connection,a=o.source;zb(o,a)&&t.updateProperties(a,{default:null})})}z(hc,D);hc.$inject=["eventBus","modeling"];function zb(e,t){if(!_(e,"bpmn:SequenceFlow"))return!1;var n=G(t),i=G(e);return n.get("default")===i}var Vb=500,Wb=5e3;function fc(e,t){D.call(this,e);var n;function i(){return n=n||new Ub,n.enter(),n}function o(){if(!n)throw new Error("out of bounds release");return n}function a(){if(!n)throw new Error("out of bounds release");var s=n.leave();return s&&(t.updateLaneRefs(n.flowNodes,n.lanes),n=null),s}var r=["spaceTool","lane.add","lane.resize","lane.split","elements.create","elements.delete","elements.move","shape.create","shape.delete","shape.move","shape.resize"];this.preExecute(r,Wb,function(s){i()}),this.postExecuted(r,Vb,function(s){a()}),this.preExecute(["shape.create","shape.move","shape.delete","shape.resize"],function(s){var c=s.context,d=c.shape,l=o();d.labelTarget||(_(d,"bpmn:Lane")&&l.addLane(d),_(d,"bpmn:FlowNode")&&l.addFlowNode(d))})}fc.$inject=["eventBus","modeling"];z(fc,D);function Ub(){this.flowNodes=[],this.lanes=[],this.counter=0,this.addLane=function(e){this.lanes.push(e)},this.addFlowNode=function(e){this.flowNodes.push(e)},this.enter=function(){this.counter++},this.leave=function(){return this.counter--,!this.counter}}function gc(e,t){D.call(this,e),this.postExecuted("elements.create",function(n){const i=n.context,o=i.elements;for(const a of o)Yb(a)&&!Zb(a)&&t.updateProperties(a,{isForCompensation:void 0})})}z(gc,D);gc.$inject=["eventBus","modeling"];function Yb(e){const t=G(e);return t&&t.isForCompensation}function Kb(e){return e&&_(e,"bpmn:BoundaryEvent")&&us(e,"bpmn:CompensateEventDefinition")}function Zb(e){return e.incoming.filter(n=>Kb(n.source)).length>0}const Xb={__init__:["adaptiveLabelPositioningBehavior","appendBehavior","associationBehavior","attachEventBehavior","boundaryEventBehavior","compensateBoundaryEventBehaviour","createBehavior","createDataObjectBehavior","createParticipantBehavior","dataInputAssociationBehavior","dataStoreBehavior","deleteLaneBehavior","detachEventBehavior","dropOnFlowBehavior","eventBasedGatewayBehavior","fixHoverBehavior","groupBehavior","importDockingFix","isHorizontalFix","labelBehavior","layoutConnectionBehavior","messageFlowBehavior","nonInterruptingBehavior","removeElementBehavior","removeEmbeddedLabelBoundsBehavior","removeParticipantBehavior","replaceConnectionBehavior","replaceElementBehaviour","resizeBehavior","resizeLaneBehavior","rootElementReferenceBehavior","spaceToolBehavior","subProcessPlaneBehavior","subProcessStartEventBehavior","textAnnotationBehavior","toggleCollapseConnectionBehaviour","toggleElementCollapseBehaviour","unclaimIdBehavior","updateFlowNodeRefsBehavior","unsetDefaultFlowBehavior","setCompensationActivityAfterPasteBehavior"],adaptiveLabelPositioningBehavior:["type",Ds],appendBehavior:["type",Is],associationBehavior:["type",Fs],attachEventBehavior:["type",xa],boundaryEventBehavior:["type",Os],compensateBoundaryEventBehaviour:["type",Ls],createBehavior:["type",Gs],createDataObjectBehavior:["type",js],createParticipantBehavior:["type",$s],dataInputAssociationBehavior:["type",qs],dataStoreBehavior:["type",Hs],deleteLaneBehavior:["type",zs],detachEventBehavior:["type",Ta],dropOnFlowBehavior:["type",Vs],eventBasedGatewayBehavior:["type",Ws],fixHoverBehavior:["type",Yu],groupBehavior:["type",Us],importDockingFix:["type",Ku],isHorizontalFix:["type",Ys],labelBehavior:["type",Ks],layoutConnectionBehavior:["type",Zs],messageFlowBehavior:["type",Qs],nonInterruptingBehavior:["type",ec],removeElementBehavior:["type",nc],removeEmbeddedLabelBoundsBehavior:["type",tc],removeParticipantBehavior:["type",ic],replaceConnectionBehavior:["type",oc],replaceElementBehaviour:["type",Ra],resizeBehavior:["type",rm],resizeLaneBehavior:["type",cm],rootElementReferenceBehavior:["type",sc],spaceToolBehavior:["type",pm],subProcessPlaneBehavior:["type",vn],subProcessStartEventBehavior:["type",dc],textAnnotationBehavior:["type",pc],toggleCollapseConnectionBehaviour:["type",lc],toggleElementCollapseBehaviour:["type",uc],unclaimIdBehavior:["type",mc],unsetDefaultFlowBehavior:["type",hc],updateFlowNodeRefsBehavior:["type",fc],setCompensationActivityAfterPasteBehavior:["type",gc]};function lm(e,t){var n=Qe(e,t,-15);return n!=="intersect"?n:null}function Je(e){Pt.call(this,e)}z(Je,Pt);Je.$inject=["eventBus"];Je.prototype.init=function(){this.addRule("connection.start",function(e){var t=e.source;return Jb(t)}),this.addRule("connection.create",function(e){var t=e.source,n=e.target,i=e.hints||{},o=i.targetParent,a=i.targetAttach;if(a)return!1;o&&(n.parent=o);try{return $o(t,n)}finally{o&&(n.parent=null)}}),this.addRule("connection.reconnect",function(e){var t=e.connection,n=e.source,i=e.target;return $o(n,i,t)}),this.addRule("connection.updateWaypoints",function(e){return{type:e.connection.type}}),this.addRule("shape.resize",function(e){var t=e.shape,n=e.newBounds;return ym(t,n)}),this.addRule("elements.create",function(e){var t=e.elements,n=e.position,i=e.target;return ye(i)&&!ta(t,i)?!1:ca(t,function(o){return ye(o)?$o(o.source,o.target,o):o.host?Mi(o,o.host,null,n):Ur(o,i,null)})}),this.addRule("elements.move",function(e){var t=e.target,n=e.shapes,i=e.position;return Mi(n,t,null,i)||bm(n,t,i)||vm(n,t)||ta(n,t)}),this.addRule("shape.create",function(e){return Ur(e.shape,e.target,e.source,e.position)}),this.addRule("shape.attach",function(e){return Mi(e.shape,e.target,null,e.position)}),this.addRule("element.copy",function(e){var t=e.element,n=e.elements;return Sm(n,t)})};Je.prototype.canConnectMessageFlow=xm;Je.prototype.canConnectSequenceFlow=Pm;Je.prototype.canConnectDataAssociation=bc;Je.prototype.canConnectAssociation=wm;Je.prototype.canConnectCompensationAssociation=Em;Je.prototype.canMove=vm;Je.prototype.canAttach=Mi;Je.prototype.canReplace=bm;Je.prototype.canDrop=ti;Je.prototype.canInsert=ta;Je.prototype.canCreate=Ur;Je.prototype.canConnect=$o;Je.prototype.canResize=ym;Je.prototype.canCopy=Sm;function Jb(e){return zr(e)?null:Q(e,["bpmn:FlowNode","bpmn:InteractionNode","bpmn:DataObjectReference","bpmn:DataStoreReference","bpmn:Group","bpmn:TextAnnotation"])}function zr(e){return!e||ce(e)}function Qb(e,t){return e===t}function tp(e){do{if(_(e,"bpmn:Process"))return G(e);if(_(e,"bpmn:Participant"))return G(e).processRef||G(e)}while(e=e.parent)}function Vr(e){return _(e,"bpmn:TextAnnotation")}function _c(e){return _(e,"bpmn:Group")&&!e.labelTarget}function um(e){return _(e,"bpmn:BoundaryEvent")&&Lt(e,"bpmn:CompensateEventDefinition")}function Ba(e){return G(e).isForCompensation}function ev(e,t){var n=tp(e),i=tp(t);return n===i}function tv(e){return _(e,"bpmn:InteractionNode")&&!_(e,"bpmn:BoundaryEvent")&&(!_(e,"bpmn:Event")||_(e,"bpmn:ThrowEvent")&&hm(e,"bpmn:MessageEventDefinition"))}function nv(e){return _(e,"bpmn:InteractionNode")&&!Ba(e)&&(!_(e,"bpmn:Event")||_(e,"bpmn:CatchEvent")&&hm(e,"bpmn:MessageEventDefinition"))&&!(_(e,"bpmn:BoundaryEvent")&&!Lt(e,"bpmn:MessageEventDefinition"))}function np(e){for(var t=e;t=t.parent;){if(_(t,"bpmn:FlowElementsContainer"))return G(t);if(_(t,"bpmn:Participant"))return G(t).processRef}return null}function mm(e,t){var n=np(e),i=np(t);return n===i}function Lt(e,t){var n=G(e);return!!Te(n.eventDefinitions||[],function(i){return _(i,t)})}function hm(e,t){var n=G(e);return(n.eventDefinitions||[]).every(function(i){return _(i,t)})}function iv(e){return _(e,"bpmn:FlowNode")&&!_(e,"bpmn:EndEvent")&&!rt(e)&&!(_(e,"bpmn:IntermediateThrowEvent")&&Lt(e,"bpmn:LinkEventDefinition"))&&!um(e)&&!Ba(e)}function ov(e){return _(e,"bpmn:FlowNode")&&!_(e,"bpmn:StartEvent")&&!_(e,"bpmn:BoundaryEvent")&&!rt(e)&&!(_(e,"bpmn:IntermediateCatchEvent")&&Lt(e,"bpmn:LinkEventDefinition"))&&!Ba(e)}function av(e){return _(e,"bpmn:ReceiveTask")||_(e,"bpmn:IntermediateCatchEvent")&&(Lt(e,"bpmn:MessageEventDefinition")||Lt(e,"bpmn:TimerEventDefinition")||Lt(e,"bpmn:ConditionalEventDefinition")||Lt(e,"bpmn:SignalEventDefinition"))}function rv(e){for(var t=[];e;)e=e.parent,e&&t.push(e);return t}function Wr(e,t){var n=rv(t);return n.indexOf(e)!==-1}function $o(e,t,n){if(zr(e)||zr(t))return null;if(!_(n,"bpmn:DataAssociation")){if(xm(e,t))return{type:"bpmn:MessageFlow"};if(Pm(e,t))return{type:"bpmn:SequenceFlow"}}var i=bc(e,t);return i||(Em(e,t)?{type:"bpmn:Association",associationDirection:"One"}:wm(e,t)?{type:"bpmn:Association",associationDirection:"None"}:!1)}function ti(e,t){return ce(e)||_c(e)?!0:_(t,"bpmn:Participant")&&!pe(t)?!1:_(e,"bpmn:Participant")?_(t,"bpmn:Process")||_(t,"bpmn:Collaboration"):Q(e,["bpmn:DataInput","bpmn:DataOutput"])&&e.parent?t===e.parent:_(e,"bpmn:Lane")?_(t,"bpmn:Participant")||_(t,"bpmn:Lane"):_(e,"bpmn:BoundaryEvent")&&!sv(e)?!1:_(e,"bpmn:FlowElement")&&!_(e,"bpmn:DataStoreReference")?_(t,"bpmn:FlowElementsContainer")?pe(t):Q(t,["bpmn:Participant","bpmn:Lane"]):_(e,"bpmn:DataStoreReference")&&_(t,"bpmn:Collaboration")?ji(G(t).get("participants"),function(n){return!!n.get("processRef")}):Q(e,["bpmn:Artifact","bpmn:DataAssociation","bpmn:DataStoreReference"])?Q(t,["bpmn:Collaboration","bpmn:Lane","bpmn:Participant","bpmn:Process","bpmn:SubProcess"]):_(e,"bpmn:MessageFlow")?_(t,"bpmn:Collaboration")||e.source.parent==t||e.target.parent==t:!1}function sv(e){return G(e).cancelActivity&&(fm(e)||gm(e))}function cv(e){return!ce(e)&&_(e,"bpmn:BoundaryEvent")}function dv(e){return _(e,"bpmn:Lane")}function pv(e){return cv(e)||_(e,"bpmn:IntermediateThrowEvent")&&fm(e)?!0:_(e,"bpmn:IntermediateCatchEvent")&&gm(e)}function fm(e){var t=G(e);return t&&!(t.eventDefinitions&&t.eventDefinitions.length)}function gm(e){return _m(e,["bpmn:MessageEventDefinition","bpmn:TimerEventDefinition","bpmn:SignalEventDefinition","bpmn:ConditionalEventDefinition"])}function _m(e,t){return t.some(function(n){return Lt(e,n)})}function lv(e){return _(e,"bpmn:ReceiveTask")&&Te(e.incoming,function(t){return _(t.source,"bpmn:EventBasedGateway")})}function Mi(e,t,n,i){if(Array.isArray(e)||(e=[e]),e.length!==1)return!1;var o=e[0];return ce(o)||!pv(o)||rt(t)||!_(t,"bpmn:Activity")||Ba(t)||i&&!lm(i,t)||lv(t)?!1:"attach"}function bm(e,t,n){if(!t)return!1;var i={replacements:[]};return T(e,function(o){rt(t)||_(o,"bpmn:StartEvent")&&o.type!=="label"&&ti(o,t)&&(tf(o)||i.replacements.push({oldElementId:o.id,newElementType:"bpmn:StartEvent"}),(nf(o)||of(o)||af(o))&&i.replacements.push({oldElementId:o.id,newElementType:"bpmn:StartEvent"}),_m(o,["bpmn:MessageEventDefinition","bpmn:TimerEventDefinition","bpmn:SignalEventDefinition","bpmn:ConditionalEventDefinition"])&&_(t,"bpmn:SubProcess")&&i.replacements.push({oldElementId:o.id,newElementType:"bpmn:StartEvent"})),_(t,"bpmn:Transaction")||Lt(o,"bpmn:CancelEventDefinition")&&o.type!=="label"&&(_(o,"bpmn:EndEvent")&&ti(o,t)&&i.replacements.push({oldElementId:o.id,newElementType:"bpmn:EndEvent"}),_(o,"bpmn:BoundaryEvent")&&Mi(o,t,null,n)&&i.replacements.push({oldElementId:o.id,newElementType:"bpmn:BoundaryEvent"}))}),i.replacements.length?i:!1}function vm(e,t){return ji(e,dv)?!1:t?e.every(function(n){return ti(n,t)}):!0}function Ur(e,t,n,i){return t?ce(e)||_c(e)?!0:Qb(n,t)||n&&Wr(n,t)?!1:ti(e,t)||ta(e,t):!1}function ym(e,t){return _(e,"bpmn:SubProcess")?pe(e)&&(!t||t.width>=100&&t.height>=80):!!(_(e,"bpmn:Lane")||_(e,"bpmn:Participant")||Vr(e)||_c(e))}function uv(e,t){var n=Vr(e),i=Vr(t);return(n||i)&&n!==i}function wm(e,t){return Wr(t,e)||Wr(e,t)?!1:uv(e,t)?!0:!!bc(e,t)}function Em(e,t){return mm(e,t)&&um(e)&&_(t,"bpmn:Activity")&&!hv(t,e)&&!rt(t)}function xm(e,t){return ip(e)&&!ip(t)?!1:tv(e)&&nv(t)&&!ev(e,t)}function Pm(e,t){return iv(e)&&ov(t)&&mm(e,t)&&!(_(e,"bpmn:EventBasedGateway")&&!av(t))}function bc(e,t){return Q(e,["bpmn:DataObjectReference","bpmn:DataStoreReference"])&&Q(t,["bpmn:Activity","bpmn:ThrowEvent"])?{type:"bpmn:DataInputAssociation"}:Q(t,["bpmn:DataObjectReference","bpmn:DataStoreReference"])&&Q(e,["bpmn:Activity","bpmn:CatchEvent"])?{type:"bpmn:DataOutputAssociation"}:!1}function ta(e,t,n){if(!t)return!1;if(Array.isArray(e)){if(e.length!==1)return!1;e=e[0]}return t.source===e||t.target===e?!1:Q(t,["bpmn:SequenceFlow","bpmn:MessageFlow"])&&!ce(t)&&_(e,"bpmn:FlowNode")&&!_(e,"bpmn:BoundaryEvent")&&ti(e,t.parent)}function mv(e,t){return e&&t&&e.indexOf(t)!==-1}function Sm(e,t){return ce(t)?!0:!(_(t,"bpmn:Lane")&&!mv(e,t.parent))}function ip(e){return Qn(e,"bpmn:Process")||Qn(e,"bpmn:Collaboration")}function hv(e,t){return e.attachers.includes(t)}const fv={__depends__:[$t],__init__:["bpmnRules"],bpmnRules:["type",Je]};var gv=2e3;function Tm(e,t){e.on("saveXML.start",gv,n);function n(){var i=t.getRootElements();T(i,function(o){var a=fe(o),r,s;r=Gi([o],!1),r=ae(r,function(c){return c!==o&&!c.labelTarget}),s=ht(r,fe),a.set("planeElement",s)})}}Tm.$inject=["eventBus","canvas"];const _v={__init__:["bpmnDiOrdering"],bpmnDiOrdering:["type",Tm]};function Aa(e){D.call(this,e);var t=this;this.preExecute(["shape.create","connection.create"],function(n){var i=n.context,o=i.shape||i.connection,a=i.parent,r=t.getOrdering(o,a);r&&(r.parent!==void 0&&(i.parent=r.parent),i.parentIndex=r.index)}),this.preExecute(["shape.move","connection.move"],function(n){var i=n.context,o=i.shape||i.connection,a=i.newParent||o.parent,r=t.getOrdering(o,a);r&&(r.parent!==void 0&&(i.newParent=r.parent),i.newParentIndex=r.index)})}Aa.prototype.getOrdering=function(e,t){return null};z(Aa,D);function vc(e,t){Aa.call(this,e);var n=[{type:"bpmn:SubProcess",order:{level:6}},{type:"bpmn:SequenceFlow",order:{level:9,containers:["bpmn:Participant","bpmn:FlowElementsContainer"]}},{type:"bpmn:DataAssociation",order:{level:9,containers:["bpmn:Collaboration","bpmn:FlowElementsContainer"]}},{type:"bpmn:TextAnnotation",order:{level:9}},{type:"bpmn:MessageFlow",order:{level:9,containers:["bpmn:Collaboration"]}},{type:"bpmn:Association",order:{level:6,containers:["bpmn:Participant","bpmn:FlowElementsContainer","bpmn:Collaboration"]}},{type:"bpmn:BoundaryEvent",order:{level:8}},{type:"bpmn:Group",order:{level:10,containers:["bpmn:Collaboration","bpmn:FlowElementsContainer"]}},{type:"bpmn:FlowElement",order:{level:5}},{type:"bpmn:Participant",order:{level:-2}},{type:"bpmn:Lane",order:{level:-1}}];function i(r){if(r.labelTarget)return{level:10};var s=Te(n,function(c){return Q(r,[c.type])});return s&&s.order||{level:1}}function o(r){var s=r.order;if(s||(r.order=s=i(r)),!s)throw new Error(`no order for <${r.id}>`);return s}function a(r,s,c){for(var d=s;d&&!Q(d,c);)d=d.parent;if(!d)throw new Error(`no parent for <${r.id}> in <${s&&s.id}>`);return d}this.getOrdering=function(r,s){if(r.labelTarget||_(r,"bpmn:TextAnnotation"))return{parent:t.findRoot(s)||t.getRootElement(),index:-1};var c=o(r);c.containers&&(s=a(r,s,c.containers));var d=s.children.indexOf(r),l=rf(s.children,function(p){return!r.labelTarget&&p.labelTarget?!1:c.level<o(p).level});return l!==-1&&d!==-1&&d<l&&(l-=1),{index:l,parent:s}}}vc.$inject=["eventBus","canvas"];z(vc,Aa);const bv={__init__:["bpmnOrderingProvider"],bpmnOrderingProvider:["type",vc]};function Vi(){}Vi.prototype.get=function(){return this._data};Vi.prototype.set=function(e){this._data=e};Vi.prototype.clear=function(){var e=this._data;return delete this._data,e};Vi.prototype.isEmpty=function(){return!this._data};const vv={clipboard:["type",Vi]};var yv="drop-ok",op="drop-not-ok",ap="attach-ok",rp="new-parent",sp="create",wv=2e3;function Mm(e,t,n,i,o){function a(c,d,l,p,u){if(!d)return!1;c=ae(c,function(E){var v=E.labelTarget;return!E.parent&&!(ce(E)&&c.indexOf(v)!==-1)});var m=Te(c,function(E){return!ye(E)}),h=!1,g=!1,f=!1;dp(c)&&(h=o.allowed("shape.attach",{position:l,shape:m,target:d})),h||(dp(c)?f=o.allowed("shape.create",{position:l,shape:m,source:p,target:d}):f=o.allowed("elements.create",{elements:c,position:l,target:d}));var w=u.connectionTarget;return f||h?(m&&p&&(g=o.allowed("connection.create",{source:w===p?m:p,target:w===p?p:m,hints:{targetParent:d,targetAttach:h}})),{attach:h,connect:g}):f===null||h===null?null:!1}function r(c,d){[ap,yv,op,rp].forEach(function(l){l===d?e.addMarker(c,l):e.removeMarker(c,l)})}n.on(["create.move","create.hover"],function(c){var d=c.context,l=d.elements,p=c.hover,u=d.source,m=d.hints||{};if(!p){d.canExecute=!1,d.target=null;return}cp(c);var h={x:c.x,y:c.y},g=d.canExecute=p&&a(l,p,h,u,m);p&&g!==null&&(d.target=p,g&&g.attach?r(p,ap):r(p,g?rp:op))}),n.on(["create.end","create.out","create.cleanup"],function(c){var d=c.hover;d&&r(d,null)}),n.on("create.end",function(c){var d=c.context,l=d.source,p=d.shape,u=d.elements,m=d.target,h=d.canExecute,g=h&&h.attach,f=h&&h.connect,w=d.hints||{};if(h===!1||!m)return!1;cp(c);var E={x:c.x,y:c.y};f?p=i.appendShape(l,p,E,m,{attach:g,connection:f===!0?{}:f,connectionTarget:w.connectionTarget}):(u=i.createElements(u,E,m,C({},w,{attach:g})),p=Te(u,function(v){return!ye(v)})),C(d,{elements:u,shape:p}),C(c,{elements:u,shape:p})});function s(){var c=t.context();c&&c.prefix===sp&&t.cancel()}n.on("create.init",function(){n.on("elements.changed",s),n.once(["create.cancel","create.end"],wv,function(){n.off("elements.changed",s)})}),this.start=function(c,d,l){se(d)||(d=[d]);var p=Te(d,function(h){return!ye(h)});if(p){l=C({elements:d,hints:{},shape:p},l||{}),T(d,function(h){te(h.x)||(h.x=0),te(h.y)||(h.y=0)});var u=ae(d,function(h){return!h.hidden}),m=wt(u);T(d,function(h){ye(h)&&(h.waypoints=ht(h.waypoints,function(g){return{x:g.x-m.x-m.width/2,y:g.y-m.y-m.height/2}})),C(h,{x:h.x-m.x-m.width/2,y:h.y-m.y-m.height/2})}),t.init(c,sp,{cursor:"grabbing",autoActivate:!0,data:{shape:p,elements:d,context:l}})}}}Mm.$inject=["canvas","dragging","eventBus","modeling","rules"];function cp(e){var t=e.context,n=t.createConstraints;n&&(n.left&&(e.x=Math.max(e.x,n.left)),n.right&&(e.x=Math.min(e.x,n.right)),n.top&&(e.y=Math.max(e.y,n.top)),n.bottom&&(e.y=Math.min(e.y,n.bottom)))}function dp(e){return e&&e.length===1&&!ye(e[0])}var Ev=750;function Nm(e,t,n,i,o){function a(r){var s=be("g");J(s,o.cls("djs-drag-group",["no-events"]));var c=be("g");return r.forEach(function(d){var l;d.hidden||(d.waypoints?(l=n._createContainer("connection",c),n.drawConnection(Yn(l),d)):(l=n._createContainer("shape",c),n.drawShape(Yn(l),d),it(l,d.x,d.y)),i.addDragger(d,s,l))}),s}t.on("create.move",Ev,function(r){var s=r.hover,c=r.context,d=c.elements,l=c.dragGroup;l||(l=c.dragGroup=a(d));var p;s?(l.parentNode||(p=e.getActiveLayer(),ve(p,l)),it(l,r.x,r.y)):ot(l)}),t.on("create.cleanup",function(r){var s=r.context,c=s.dragGroup;c&&ot(c)})}Nm.$inject=["canvas","eventBus","graphicsFactory","previewSupport","styles"];const ka={__depends__:[en,di,$t,Jt],__init__:["create","createPreview"],create:["type",Mm],createPreview:["type",Nm]};function yc(e){var t=this;this._lastMoveEvent=null;function n(i){t._lastMoveEvent=i}e.on("canvas.init",function(i){var o=t._svg=i.svg;o.addEventListener("mousemove",n)}),e.on("canvas.destroy",function(){t._lastMouseEvent=null,t._svg.removeEventListener("mousemove",n)})}yc.$inject=["eventBus"];yc.prototype.getLastMoveEvent=function(){return this._lastMoveEvent||xv(0,0)};function xv(e,t){var n=document.createEvent("MouseEvent"),i=e,o=t,a=e,r=t;return n.initMouseEvent&&n.initMouseEvent("mousemove",!0,!0,window,0,i,o,a,r,!1,!1,!1,!1,0,null),n}const Wi={__init__:["mouse"],mouse:["type",yc]};function At(e,t,n,i,o,a,r,s){this._canvas=e,this._create=t,this._clipboard=n,this._elementFactory=i,this._eventBus=o,this._modeling=a,this._mouse=r,this._rules=s,o.on("copyPaste.copyElement",function(c){var d=c.descriptor,l=c.element,p=c.elements;d.priority=1,d.id=l.id;var u=Te(p,function(m){return m===l.parent});u&&(d.parent=l.parent.id),Pv(l)&&(d.priority=2,d.host=l.host.id),ye(l)&&(d.priority=3,d.source=l.source.id,d.target=l.target.id,d.waypoints=Sv(l)),ce(l)&&(d.priority=4,d.labelTarget=l.labelTarget.id),T(["x","y","width","height"],function(m){te(l[m])&&(d[m]=l[m])}),d.hidden=l.hidden,d.collapsed=l.collapsed}),o.on("copyPaste.pasteElements",function(c){var d=c.hints;C(d,{createElementsBehavior:!1})})}At.$inject=["canvas","create","clipboard","elementFactory","eventBus","modeling","mouse","rules"];At.prototype.copy=function(e){var t,n;return se(e)||(e=e?[e]:[]),t=this._eventBus.fire("copyPaste.canCopyElements",{elements:e}),t===!1?n={}:n=this.createTree(se(t)?t:e),this._clipboard.set(n),this._eventBus.fire("copyPaste.elementsCopied",{elements:e,tree:n}),n};At.prototype.paste=function(e){var t=this._clipboard.get();if(!this._clipboard.isEmpty()){var n=e&&e.hints||{};this._eventBus.fire("copyPaste.pasteElements",{hints:n});var i=this._createElements(t);if(e&&e.element&&e.point)return this._paste(i,e.element,e.point,n);this._create.start(this._mouse.getLastMoveEvent(),i,{hints:n||{}})}};At.prototype._paste=function(e,t,n,i){T(e,function(a){te(a.x)||(a.x=0),te(a.y)||(a.y=0)});var o=wt(e);return T(e,function(a){ye(a)&&(a.waypoints=ht(a.waypoints,function(r){return{x:r.x-o.x-o.width/2,y:r.y-o.y-o.height/2}})),C(a,{x:a.x-o.x-o.width/2,y:a.y-o.y-o.height/2})}),this._modeling.createElements(e,n,t,C({},i))};At.prototype._createElements=function(e){var t=this,n=this._eventBus,i={},o=[];return T(e,function(a,r){a=Zt(a,"priority"),T(a,function(s){var c=C({},Bt(s,["priority"]));i[s.parent]?c.parent=i[s.parent]:delete c.parent,n.fire("copyPaste.pasteElement",{cache:i,descriptor:c});var d;if(ye(c)){c.source=i[s.source],c.target=i[s.target],d=i[s.id]=t.createConnection(c),o.push(d);return}if(ce(c)){c.labelTarget=i[c.labelTarget],d=i[s.id]=t.createLabel(c),o.push(d);return}c.host&&(c.host=i[c.host]),d=i[s.id]=t.createShape(c),o.push(d)})}),o};At.prototype.createConnection=function(e){var t=this._elementFactory.createConnection(Bt(e,["id"]));return t};At.prototype.createLabel=function(e){var t=this._elementFactory.createLabel(Bt(e,["id"]));return t};At.prototype.createShape=function(e){var t=this._elementFactory.createShape(Bt(e,["id"]));return t};At.prototype.hasRelations=function(e,t){var n,i,o;return!(ye(e)&&(i=Te(t,Ut({id:e.source.id})),o=Te(t,Ut({id:e.target.id})),!i||!o)||ce(e)&&(n=Te(t,Ut({id:e.labelTarget.id})),!n))};At.prototype.createTree=function(e){var t=this._rules,n=this,i={},o=[],a=da(e);function r(d,l){return t.allowed("element.copy",{element:d,elements:l})}function s(d,l){var p=Te(o,function(u){return d===u.element});if(!p){o.push({element:d,depth:l});return}p.depth<l&&(o=c(p,o),o.push({element:p.element,depth:l}))}function c(d,l){var p=l.indexOf(d);return p!==-1&&l.splice(p,1),l}return ma(a,function(d,l,p){if(ce(d))return;T(d.labels,function(h){s(h,p)});function u(h){h&&h.length&&T(h,function(g){T(g.labels,function(f){s(f,p)}),s(g,p)})}T([d.attachers,d.incoming,d.outgoing],u),s(d,p);var m=[];return d.children&&(m=d.children.slice()),n._eventBus.fire("copyPaste.createTree",{element:d,children:m}),m}),e=ht(o,function(d){return d.element}),o=ht(o,function(d){return d.descriptor={},n._eventBus.fire("copyPaste.copyElement",{descriptor:d.descriptor,element:d.element,elements:e}),d}),o=Zt(o,function(d){return d.descriptor.priority}),e=ht(o,function(d){return d.element}),T(o,function(d){var l=d.depth;if(!n.hasRelations(d.element,e)){lp(d.element,e);return}if(!r(d.element,e)){lp(d.element,e);return}i[l]||(i[l]=[]),i[l].push(d.descriptor)}),i};function Pv(e){return!!e.host}function Sv(e){return ht(e.waypoints,function(t){return t=pp(t),t.original&&(t.original=pp(t.original)),t})}function pp(e){return C({},e)}function lp(e,t){var n=t.indexOf(e);return n===-1?t:t.splice(n,1)}const Tv={__depends__:[vv,ka,Wi,$t],__init__:["copyPaste"],copyPaste:["type",At]};function pr(e,t,n){se(n)||(n=[n]),T(n,function(i){Ol(e[i])||(t[i]=e[i])})}var lr=750;function Cm(e,t,n){function i(c,d){var l=e.create(c.$type);return n.copyElement(c,l,null,d)}t.on("copyPaste.copyElement",lr,function(c){var d=c.descriptor,l=c.element,p=G(l);if(ce(l))return d;var u=d.businessObject=i(p,!0),m=d.di=i(fe(l),!0);m.bpmnElement=u,pr(u,d,"name"),pr(m,d,"isExpanded"),p.default&&(d.default=p.default.id)});var o="-bpmn-js-refs";function a(c){return c[o]=c[o]||{}}function r(c,d){c[o]=d}function s(c,d,l){var p=G(c);return c.default&&(l[c.default]={element:p,property:"default"}),c.host&&(G(c).attachedToRef=G(d[c.host])),Bt(l,gn(l,function(u,m,h){var g=m.element,f=m.property;return h===c.id&&(g.set(f,p),u.push(c.id)),u},[]))}t.on("copyPaste.pasteElement",function(c){var d=c.cache,l=c.descriptor,p=l.businessObject,u=l.di;if(ce(l)){l.businessObject=G(d[l.labelTarget]),l.di=fe(d[l.labelTarget]);return}p=l.businessObject=i(p),u=l.di=i(u),u.bpmnElement=p,pr(l,p,["isExpanded","name"]),l.type=p.$type}),t.on("copyPaste.copyElement",lr,function(c){var d=c.descriptor,l=c.element;if(_(l,"bpmn:Participant")){var p=G(l);p.processRef&&(d.processRef=i(p.processRef,!0))}}),t.on("copyPaste.pasteElement",function(c){var d=c.descriptor,l=d.processRef;l&&(d.processRef=i(l))}),t.on("copyPaste.pasteElement",lr,function(c){var d=c.cache,l=c.descriptor;r(d,s(l,d,a(d)))})}Cm.$inject=["bpmnFactory","eventBus","moddleCopy"];var Mv=["artifacts","dataInputAssociations","dataOutputAssociations","default","flowElements","lanes","incoming","outgoing","categoryValue"];function Ui(e,t,n){this._bpmnFactory=t,this._eventBus=e,this._moddle=n,e.on("moddleCopy.canCopyProperties",function(i){var o=i.propertyNames;if(!(!o||!o.length))return Zt(o,function(a){return a==="extensionElements"})}),e.on("moddleCopy.canCopyProperty",function(i){var o=i.parent,a=Xt(o)&&o.$descriptor,r=i.propertyName;if(r&&Mv.indexOf(r)!==-1||r&&a&&!Te(a.properties,Ut({name:r})))return!1}),e.on("moddleCopy.canSetCopiedProperty",function(i){var o=i.property;if(Nv(o,"bpmn:ExtensionElements")&&(!o.values||!o.values.length))return!1})}Ui.$inject=["eventBus","bpmnFactory","moddle"];Ui.prototype.copyElement=function(e,t,n,i=!1){var o=this;n&&!se(n)&&(n=[n]),n=n||Yr(e.$descriptor);var a=this._eventBus.fire("moddleCopy.canCopyProperties",{propertyNames:n,sourceElement:e,targetElement:t,clone:i});return a===!1||(se(a)&&(n=a),T(n,function(r){var s;mn(e,r)&&(s=e.get(r));var c=o.copyProperty(s,t,r,i);if(ut(c)){var d=o._eventBus.fire("moddleCopy.canSetCopiedProperty",{parent:t,property:c,propertyName:r});d!==!1&&t.set(r,c)}})),t};Ui.prototype.copyProperty=function(e,t,n,i=!1){var o=this,a=this._eventBus.fire("moddleCopy.canCopyProperty",{parent:t,property:e,propertyName:n,clone:i});if(a!==!1){if(a)return Xt(a)&&a.$type&&!a.$parent&&(a.$parent=t),a;var r=this._moddle.getPropertyDescriptor(t,n);if(!r.isReference)return r.isId?e&&this._copyId(e,t,i):se(e)?gn(e,function(s,c){return a=o.copyProperty(c,t,n,i),a?s.concat(a):s},[]):Xt(e)&&e.$type?this._moddle.getElementDescriptor(e).isGeneric?void 0:(a=o._bpmnFactory.create(e.$type),a.$parent=t,a=o.copyElement(e,a,null,i),a):e}};Ui.prototype._copyId=function(e,t,n=!1){if(n)return e;if(!this._moddle.ids.assigned(e))return this._moddle.ids.claim(e,t),e};function Yr(e,t){return gn(e.properties,function(n,i){return t&&i.default?n:n.concat(i.name)},[])}function Nv(e,t){return e&&xt(e.$instanceOf)&&e.$instanceOf(t)}const Rm={__depends__:[Tv],__init__:["bpmnCopyPaste","moddleCopy"],bpmnCopyPaste:["type",Cm],moddleCopy:["type",Ui]};var up=Math.round;function wc(e,t){this._modeling=e,this._eventBus=t}wc.$inject=["modeling","eventBus"];wc.prototype.replaceElement=function(e,t,n){if(e.waypoints)return null;var i=this._modeling,o=this._eventBus;o.fire("replace.start",{element:e,attrs:t,hints:n});var a=t.width||e.width,r=t.height||e.height,s=t.x||e.x,c=t.y||e.y,d=up(s+a/2),l=up(c+r/2),p=i.replaceShape(e,C({},t,{x:d,y:l,width:a,height:r}),n);return o.fire("replace.end",{element:e,newElement:p,hints:n}),p};function Bm(e,t){t.on("replace.end",500,function(n){const{newElement:i,hints:o={}}=n;o.select!==!1&&e.select(i)})}Bm.$inject=["selection","eventBus"];const Cv={__init__:["replace","replaceSelectionBehavior"],replaceSelectionBehavior:["type",Bm],replace:["type",wc]};function Rv(e,t,n){se(n)||(n=[n]),T(n,function(i){Ol(e[i])||(t[i]=e[i])})}var Bv=["cancelActivity","instantiate","eventGatewayType","triggeredByEvent","isInterrupting"];function Av(e,t){var n=e&&mn(e,"collapsed")?e.collapsed:!pe(e),i;return t&&(mn(t,"collapsed")||mn(t,"isExpanded"))?i=mn(t,"collapsed")?t.collapsed:!t.isExpanded:i=n,n!==i}function Am(e,t,n,i,o,a){function r(s,c,d){d=d||{};var l=c.type,p=s.businessObject;if(Eo(p)&&l==="bpmn:SubProcess"&&Av(s,c))return i.toggleCollapse(s),s;var u=e.create(l),m={type:l,businessObject:u};m.di={},l==="bpmn:ExclusiveGateway"&&(m.di.isMarkerVisible=!0),Rv(s.di,m.di,["fill","stroke","background-color","border-color","color"]);var h=Yr(p.$descriptor),g=Yr(u.$descriptor,!0),f=kv(h,g);C(u,fn(c,Bv));var w=ae(f,function(y){return y==="eventDefinitions"?mp(s,c.eventDefinitionType):y==="loopCharacteristics"?!rt(u):mn(u,y)||y==="processRef"&&c.isExpanded===!1||y==="triggeredByEvent"?!1:y==="isForCompensation"?!rt(u):!0});if(u=n.copyElement(p,u,w),c.eventDefinitionType&&(mp(u,c.eventDefinitionType)||(m.eventDefinitionType=c.eventDefinitionType,m.eventDefinitionAttrs=c.eventDefinitionAttrs)),_(p,"bpmn:Activity")){if(Eo(p))m.isExpanded=pe(s);else if(c&&mn(c,"isExpanded")){m.isExpanded=c.isExpanded;var E=t.getDefaultSize(u,{isExpanded:m.isExpanded});m.width=E.width,m.height=E.height,m.x=s.x-(m.width-s.width)/2,m.y=s.y-(m.height-s.height)/2}pe(s)&&!_(p,"bpmn:Task")&&m.isExpanded&&(m.width=s.width,m.height=s.height)}if(Eo(p)&&!Eo(u)&&(d.moveChildren=!1),_(p,"bpmn:Participant")){c.isExpanded===!0?u.processRef=e.create("bpmn:Process"):d.moveChildren=!1;var v=Ze(s);fe(s).isHorizontal||(fe(m).isHorizontal=v),m.width=v?s.width:t.getDefaultSize(m).width,m.height=v?t.getDefaultSize(m).height:s.height}return a.allowed("shape.resize",{shape:u})||(m.height=t.getDefaultSize(m).height,m.width=t.getDefaultSize(m).width),u.name=p.name,Q(p,["bpmn:ExclusiveGateway","bpmn:InclusiveGateway","bpmn:Activity"])&&Q(u,["bpmn:ExclusiveGateway","bpmn:InclusiveGateway","bpmn:Activity"])&&(u.default=p.default),c.host&&!_(p,"bpmn:BoundaryEvent")&&_(u,"bpmn:BoundaryEvent")&&(m.host=c.host),(m.type==="bpmn:DataStoreReference"||m.type==="bpmn:DataObjectReference")&&(m.x=s.x+(s.width-m.width)/2),o.replaceElement(s,m,{...d,targetElement:c})}this.replaceElement=r}Am.$inject=["bpmnFactory","elementFactory","moddleCopy","modeling","replace","rules"];function Eo(e){return _(e,"bpmn:SubProcess")}function mp(e,t){var n=G(e);return t&&n.get("eventDefinitions").some(function(i){return _(i,t)})}function kv(e,t){return e.filter(function(n){return t.includes(n)})}const km={__depends__:[Rm,Cv,Jt],bpmnReplace:["type",Am]};var Dv=250;function On(e){this._eventBus=e,this._tools=[],this._active=null}On.$inject=["eventBus"];On.prototype.registerTool=function(e,t){var n=this._tools;if(!t)throw new Error(`A tool has to be registered with it's "events"`);n.push(e),this.bindEvents(e,t)};On.prototype.isActive=function(e){return e&&this._active===e};On.prototype.length=function(e){return this._tools.length};On.prototype.setActive=function(e){var t=this._eventBus;this._active!==e&&(this._active=e,t.fire("tool-manager.update",{tool:e}))};On.prototype.bindEvents=function(e,t){var n=this._eventBus,i=[];n.on(t.tool+".init",function(o){var a=o.context;if(!a.reactivate&&this.isActive(e)){this.setActive(null);return}this.setActive(e)},this),T(t,function(o){i.push(o+".ended"),i.push(o+".canceled")}),n.on(i,Dv,function(o){this._active&&(Iv(o)||this.setActive(null))},this)};function Iv(e){var t=e.originalEvent&&e.originalEvent.target;return t&&Fn(t,'.group[data-group="tools"]')}const Da={__depends__:[en],__init__:["toolManager"],toolManager:["type",On]};function Fv(e,t){if(e==="x"){if(t>0)return"e";if(t<0)return"w"}if(e==="y"){if(t>0)return"s";if(t<0)return"n"}return null}function Ov(e,t){var n=[];return T(e.concat(t),function(i){var o=i.incoming,a=i.outgoing;T(o.concat(a),function(r){var s=r.source,c=r.target;(Ei(e,s)||Ei(e,c)||Ei(t,s)||Ei(t,c))&&(Ei(n,r)||n.push(r))})}),n}function Ei(e,t){return e.indexOf(t)!==-1}function Lv(e,t,n){var i=e.x,o=e.y,a=e.width,r=e.height,s=n.x,c=n.y;switch(t){case"n":return{x:i,y:o+c,width:a,height:r-c};case"s":return{x:i,y:o,width:a,height:r+c};case"w":return{x:i+s,y:o,width:a-s,height:r};case"e":return{x:i,y:o,width:a+s,height:r};default:throw new Error("unknown direction: "+t)}}var ur=Math.abs,Gv=Math.round,zt={x:"width",y:"height"},Dm="crosshair",ln={n:"top",w:"left",s:"bottom",e:"right"},jv=1500,xo={n:"s",w:"e",s:"n",e:"w"},Po=20;function St(e,t,n,i,o,a,r){this._canvas=e,this._dragging=t,this._eventBus=n,this._modeling=i,this._rules=o,this._toolManager=a,this._mouse=r;var s=this;a.registerTool("space",{tool:"spaceTool.selection",dragging:"spaceTool"}),n.on("spaceTool.selection.end",function(c){n.once("spaceTool.selection.ended",function(){s.activateMakeSpace(c.originalEvent)})}),n.on("spaceTool.move",jv,function(c){var d=c.context,l=d.initialized;l||(l=d.initialized=s.init(c,d)),l&&fp(c)}),n.on("spaceTool.end",function(c){var d=c.context,l=d.axis,p=d.direction,u=d.movingShapes,m=d.resizingShapes,h=d.start;if(d.initialized){fp(c);var g={x:0,y:0};g[l]=Gv(c["d"+l]),s.makeSpace(u,m,g,p,h),n.once("spaceTool.ended",function(f){s.activateSelection(f.originalEvent,!0,!0)})}})}St.$inject=["canvas","dragging","eventBus","modeling","rules","toolManager","mouse"];St.prototype.activateSelection=function(e,t,n){this._dragging.init(e,"spaceTool.selection",{autoActivate:t,cursor:Dm,data:{context:{reactivate:n}},trapClick:!1})};St.prototype.activateMakeSpace=function(e){this._dragging.init(e,"spaceTool",{autoActivate:!0,cursor:Dm,data:{context:{}}})};St.prototype.makeSpace=function(e,t,n,i,o){return this._modeling.createSpace(e,t,n,i,o)};St.prototype.init=function(e,t){var n=ur(e.dx)>ur(e.dy)?"x":"y",i=e["d"+n],o=e[n]-i;if(ur(i)<5)return!1;i<0&&(i*=-1),Ai(e)&&(i*=-1);var a=Fv(n,i),r=this._canvas.getRootElement();!Mr(e)&&e.hover&&(r=e.hover);var s=[...Gi(r,!0),...r.attachers||[]],c=this.calculateAdjustments(s,n,i,o),d=this._eventBus.fire("spaceTool.getMinDimensions",{axis:n,direction:a,shapes:c.resizingShapes,start:o}),l=$v(c,n,a,o,d);return C(t,c,{axis:n,direction:a,spaceToolConstraints:l,start:o}),fa("resize-"+(n==="x"?"ew":"ns")),!0};St.prototype.calculateAdjustments=function(e,t,n,i){var o=this._rules,a=[],r=[],s=[],c=[];function d(u){a.includes(u)||a.push(u);var m=u.label;m&&!a.includes(m)&&a.push(m)}function l(u){r.includes(u)||r.push(u)}T(e,function(u){if(!(!u.parent||ce(u))){if(ye(u)){c.push(u);return}var m=u[t],h=m+u[zt[t]];if(qv(u)&&(n>0&&Z(u)[t]>i||n<0&&Z(u)[t]<i)){s.push(u);return}if(n>0&&m>i||n<0&&h<i){d(u);return}if(m<i&&h>i&&o.allowed("shape.resize",{shape:u})){l(u);return}}}),T(a,function(u){var m=u.attachers;m&&T(m,function(h){d(h)})});var p=a.concat(r);return T(s,function(u){var m=u.host;kn(p,m)&&d(u)}),p=a.concat(r),T(c,function(u){var m=u.source,h=u.target,g=u.label;kn(p,m)&&kn(p,h)&&g&&d(g)}),{movingShapes:a,resizingShapes:r}};St.prototype.toggle=function(){if(this.isActive())return this._dragging.cancel();var e=this._mouse.getLastMoveEvent();this.activateSelection(e,!!e)};St.prototype.isActive=function(){var e=this._dragging.context();return e?/^spaceTool/.test(e.prefix):!1};function hp(e){return{top:e.top-Po,right:e.right+Po,bottom:e.bottom+Po,left:e.left-Po}}function fp(e){var t=e.context,n=t.spaceToolConstraints;if(n){var i,o;te(n.left)&&(i=Math.max(e.x,n.left),e.dx=e.dx+i-e.x,e.x=i),te(n.right)&&(i=Math.min(e.x,n.right),e.dx=e.dx+i-e.x,e.x=i),te(n.top)&&(o=Math.max(e.y,n.top),e.dy=e.dy+o-e.y,e.y=o),te(n.bottom)&&(o=Math.min(e.y,n.bottom),e.dy=e.dy+o-e.y,e.y=o)}}function $v(e,t,n,i,o){var a=e.movingShapes,r=e.resizingShapes;if(r.length){var s={},c,d;return T(r,function(l){var p=l.attachers,u=l.children,m=U(l),h=ae(u,function(B){return!ye(B)&&!ce(B)&&!kn(a,B)&&!kn(r,B)}),g=ae(u,function(B){return!ye(B)&&!ce(B)&&kn(a,B)}),f,w,E,v=[],y=[],P,x,I,N;h.length&&(w=hp(U(wt(h))),f=i-m[ln[n]]+w[ln[n]],n==="n"?s.bottom=d=te(d)?Math.min(d,f):f:n==="w"?s.right=d=te(d)?Math.min(d,f):f:n==="s"?s.top=c=te(c)?Math.max(c,f):f:n==="e"&&(s.left=c=te(c)?Math.max(c,f):f)),g.length&&(E=hp(U(wt(g))),f=i-E[ln[xo[n]]]+m[ln[xo[n]]],n==="n"?s.bottom=d=te(d)?Math.min(d,f):f:n==="w"?s.right=d=te(d)?Math.min(d,f):f:n==="s"?s.top=c=te(c)?Math.max(c,f):f:n==="e"&&(s.left=c=te(c)?Math.max(c,f):f)),p&&p.length&&(p.forEach(function(B){kn(a,B)?v.push(B):y.push(B)}),v.length&&(P=U(wt(v.map(Z))),x=m[ln[xo[n]]]-(P[ln[xo[n]]]-i)),y.length&&(I=U(wt(y.map(Z))),N=I[ln[n]]-(m[ln[n]]-i)),n==="n"?(f=Math.min(x||1/0,N||1/0),s.bottom=d=te(d)?Math.min(d,f):f):n==="w"?(f=Math.min(x||1/0,N||1/0),s.right=d=te(d)?Math.min(d,f):f):n==="s"?(f=Math.max(x||-1/0,N||-1/0),s.top=c=te(c)?Math.max(c,f):f):n==="e"&&(f=Math.max(x||-1/0,N||-1/0),s.left=c=te(c)?Math.max(c,f):f));var R=o&&o[l.id];R&&(n==="n"?(f=i+l[zt[t]]-R[zt[t]],s.bottom=d=te(d)?Math.min(d,f):f):n==="w"?(f=i+l[zt[t]]-R[zt[t]],s.right=d=te(d)?Math.min(d,f):f):n==="s"?(f=i-l[zt[t]]+R[zt[t]],s.top=c=te(c)?Math.max(c,f):f):n==="e"&&(f=i-l[zt[t]]+R[zt[t]],s.left=c=te(c)?Math.max(c,f):f))}),s}}function kn(e,t){return e.indexOf(t)!==-1}function qv(e){return!!e.host}var mr="djs-dragging",gp="djs-resizing",Hv=250,So=Math.max;function Im(e,t,n,i,o){function a(r,s){T(r,function(c){o.addDragger(c,s),n.addMarker(c,mr)})}e.on("spaceTool.selection.start",function(r){var s=n.getLayer("space"),c=r.context,d={x:"M 0,-10000 L 0,10000",y:"M -10000,0 L 10000,0"},l=be("g");J(l,i.cls("djs-crosshair-group",["no-events"])),ve(s,l);var p=be("path");J(p,"d",d.x),xe(p).add("djs-crosshair"),ve(l,p);var u=be("path");J(u,"d",d.y),xe(u).add("djs-crosshair"),ve(l,u),c.crosshairGroup=l}),e.on("spaceTool.selection.move",function(r){var s=r.context.crosshairGroup;it(s,r.x,r.y)}),e.on("spaceTool.selection.cleanup",function(r){var s=r.context,c=s.crosshairGroup;c&&ot(c)}),e.on("spaceTool.move",Hv,function(r){var s=r.context,c=s.line,d=s.axis,l=s.movingShapes,p=s.resizingShapes;if(s.initialized){if(!s.dragGroup){var u=n.getLayer("space");c=be("path"),J(c,"d","M0,0 L0,0"),xe(c).add("djs-crosshair"),ve(u,c),s.line=c;var m=be("g");J(m,i.cls("djs-drag-group",["no-events"])),ve(n.getActiveLayer(),m),a(l,m);var h=s.movingConnections=t.filter(function(y){var P=!1;T(l,function(R){T(R.outgoing,function(B){y===B&&(P=!0)})});var x=!1;T(l,function(R){T(R.incoming,function(B){y===B&&(x=!0)})});var I=!1;T(p,function(R){T(R.outgoing,function(B){y===B&&(I=!0)})});var N=!1;return T(p,function(R){T(R.incoming,function(B){y===B&&(N=!0)})}),ye(y)&&(P||I)&&(x||N)});a(h,m),s.dragGroup=m}if(!s.frameGroup){var g=be("g");J(g,i.cls("djs-frame-group",["no-events"])),ve(n.getActiveLayer(),g);var f=[];T(p,function(y){var P=o.addFrame(y,g),x=P.getBBox();f.push({element:P,initialBounds:x}),n.addMarker(y,gp)}),s.frameGroup=g,s.frames=f}var w={x:"M"+r.x+", -10000 L"+r.x+", 10000",y:"M -10000, "+r.y+" L 10000, "+r.y};J(c,{d:w[d]});var E={x:"y",y:"x"},v={x:r.dx,y:r.dy};v[E[s.axis]]=0,it(s.dragGroup,v.x,v.y),T(s.frames,function(y){var P=y.element,x=y.initialBounds,I,N;s.direction==="e"?J(P,{width:So(x.width+v.x,5)}):(I=So(x.width-v.x,5),J(P,{width:I,x:x.x+x.width-I})),s.direction==="s"?J(P,{height:So(x.height+v.y,5)}):(N=So(x.height-v.y,5),J(P,{height:N,y:x.y+x.height-N}))})}}),e.on("spaceTool.cleanup",function(r){var s=r.context,c=s.movingShapes,d=s.movingConnections,l=s.resizingShapes,p=s.line,u=s.dragGroup,m=s.frameGroup;T(c,function(h){n.removeMarker(h,mr)}),T(d,function(h){n.removeMarker(h,mr)}),u&&(ot(p),ot(u)),T(l,function(h){n.removeMarker(h,gp)}),m&&ot(m)})}Im.$inject=["eventBus","elementRegistry","canvas","styles","previewSupport"];const zv={__init__:["spaceToolPreview"],__depends__:[en,$t,Da,di,Wi],spaceTool:["type",St],spaceToolPreview:["type",Im]};function Ia(e){e.invoke(St,this)}Ia.$inject=["injector"];z(Ia,St);Ia.prototype.calculateAdjustments=function(e,t,n,i){var o=St.prototype.calculateAdjustments.call(this,e,t,n,i);return o.resizingShapes=o.resizingShapes.filter(function(a){return!(_(a,"bpmn:TextAnnotation")||Vv(a)&&(t==="y"&&Ze(a)||t==="x"&&!Ze(a)))}),o};function Vv(e){return _(e,"bpmn:Participant")&&!G(e).processRef}const Fm={__depends__:[zv],spaceTool:["type",Ia]};function Ne(e,t){this._handlerMap={},this._stack=[],this._stackIdx=-1,this._currentExecution={actions:[],dirty:[],trigger:null},this._injector=t,this._eventBus=e,this._uid=1,e.on(["diagram.destroy","diagram.clear"],function(){this.clear(!1)},this)}Ne.$inject=["eventBus","injector"];Ne.prototype.execute=function(e,t){if(!e)throw new Error("command required");this._currentExecution.trigger="execute";const n={command:e,context:t};this._pushAction(n),this._internalExecute(n),this._popAction()};Ne.prototype.canExecute=function(e,t){const n={command:e,context:t},i=this._getHandler(e);let o=this._fire(e,"canExecute",n);if(o===void 0){if(!i)return!1;i.canExecute&&(o=i.canExecute(t))}return o};Ne.prototype.clear=function(e){this._stack.length=0,this._stackIdx=-1,e!==!1&&this._fire("changed",{trigger:"clear"})};Ne.prototype.undo=function(){let e=this._getUndoAction(),t;if(e){for(this._currentExecution.trigger="undo",this._pushAction(e);e&&(this._internalUndo(e),t=this._getUndoAction(),!(!t||t.id!==e.id));)e=t;this._popAction()}};Ne.prototype.redo=function(){let e=this._getRedoAction(),t;if(e){for(this._currentExecution.trigger="redo",this._pushAction(e);e&&(this._internalExecute(e,!0),t=this._getRedoAction(),!(!t||t.id!==e.id));)e=t;this._popAction()}};Ne.prototype.register=function(e,t){this._setHandler(e,t)};Ne.prototype.registerHandler=function(e,t){if(!e||!t)throw new Error("command and handlerCls must be defined");const n=this._injector.instantiate(t);this.register(e,n)};Ne.prototype.canUndo=function(){return!!this._getUndoAction()};Ne.prototype.canRedo=function(){return!!this._getRedoAction()};Ne.prototype._getRedoAction=function(){return this._stack[this._stackIdx+1]};Ne.prototype._getUndoAction=function(){return this._stack[this._stackIdx]};Ne.prototype._internalUndo=function(e){const t=e.command,n=e.context,i=this._getHandler(t);this._atomicDo(()=>{this._fire(t,"revert",e),i.revert&&this._markDirty(i.revert(n)),this._revertedAction(e),this._fire(t,"reverted",e)})};Ne.prototype._fire=function(e,t,n){arguments.length<3&&(n=t,t=null);const i=t?[e+"."+t,t]:[e];let o;n=this._eventBus.createEvent(n);for(const a of i)if(o=this._eventBus.fire("commandStack."+a,n),n.cancelBubble)break;return o};Ne.prototype._createId=function(){return this._uid++};Ne.prototype._atomicDo=function(e){const t=this._currentExecution;t.atomic=!0;try{e()}finally{t.atomic=!1}};Ne.prototype._internalExecute=function(e,t){const n=e.command,i=e.context,o=this._getHandler(n);if(!o)throw new Error("no command handler registered for <"+n+">");this._pushAction(e),t||(this._fire(n,"preExecute",e),o.preExecute&&o.preExecute(i),this._fire(n,"preExecuted",e)),this._atomicDo(()=>{this._fire(n,"execute",e),o.execute&&this._markDirty(o.execute(i)),this._executedAction(e,t),this._fire(n,"executed",e)}),t||(this._fire(n,"postExecute",e),o.postExecute&&o.postExecute(i),this._fire(n,"postExecuted",e)),this._popAction()};Ne.prototype._pushAction=function(e){const t=this._currentExecution,n=t.actions,i=n[0];if(t.atomic)throw new Error("illegal invocation in <execute> or <revert> phase (action: "+e.command+")");e.id||(e.id=i&&i.id||this._createId()),n.push(e)};Ne.prototype._popAction=function(){const e=this._currentExecution,t=e.trigger,n=e.actions,i=e.dirty;n.pop(),n.length||(this._eventBus.fire("elements.changed",{elements:sf("id",i.reverse())}),i.length=0,this._fire("changed",{trigger:t}),e.trigger=null)};Ne.prototype._markDirty=function(e){const t=this._currentExecution;e&&(e=se(e)?e:[e],t.dirty=t.dirty.concat(e))};Ne.prototype._executedAction=function(e,t){const n=++this._stackIdx;t||this._stack.splice(n,this._stack.length,e)};Ne.prototype._revertedAction=function(e){this._stackIdx--};Ne.prototype._getHandler=function(e){return this._handlerMap[e]};Ne.prototype._setHandler=function(e,t){if(!e||!t)throw new Error("command and handler required");if(this._handlerMap[e])throw new Error("overriding handler for command <"+e+">");this._handlerMap[e]=t};const Wv={commandStack:["type",Ne]};function hn(e,t){if(typeof t!="function")throw new Error("removeFn iterator must be a function");if(e){for(var n;n=e[0];)t(n);return e}}var Uv=250,_p=1400;function Ec(e,t,n){D.call(this,t);var i=e.get("movePreview",!1);t.on("shape.move.start",_p,function(o){var a=o.context,r=a.shapes,s=a.validatedShapes;a.shapes=bp(r),a.validatedShapes=bp(s)}),i&&t.on("shape.move.start",Uv,function(o){var a=o.context,r=a.shapes,s=[];T(r,function(c){T(c.labels,function(d){!d.hidden&&a.shapes.indexOf(d)===-1&&s.push(d),c.labelTarget&&s.push(c)})}),T(s,function(c){i.makeDraggable(a,c,!0)})}),this.preExecuted("elements.move",_p,function(o){var a=o.context,r=a.closure,s=r.enclosedElements,c=[];T(s,function(d){T(d.labels,function(l){s[l.id]||c.push(l)})}),r.addAll(c)}),this.preExecute(["connection.delete","shape.delete"],function(o){var a=o.context,r=a.connection||a.shape;hn(r.labels,function(s){n.removeShape(s,{nested:!0})})}),this.execute("shape.delete",function(o){var a=o.context,r=a.shape,s=r.labelTarget;s&&(a.labelTargetIndex=ms(s.labels,r),a.labelTarget=s,r.labelTarget=null)}),this.revert("shape.delete",function(o){var a=o.context,r=a.shape,s=a.labelTarget,c=a.labelTargetIndex;s&&(Ve(s.labels,r,c),r.labelTarget=s)})}z(Ec,D);Ec.$inject=["injector","eventBus","modeling"];function bp(e){return ae(e,function(t){return e.indexOf(t.labelTarget)===-1})}const Yv={__init__:["labelSupport"],labelSupport:["type",Ec]};var Kv=251,vp=1401,yp="attach-ok";function xc(e,t,n,i,o){D.call(this,t);var a=e.get("movePreview",!1);t.on("shape.move.start",vp,function(r){var s=r.context,c=s.shapes,d=s.validatedShapes;s.shapes=Zv(c),s.validatedShapes=Xv(d)}),a&&t.on("shape.move.start",Kv,function(r){var s=r.context,c=s.shapes,d=Kr(c);T(d,function(l){a.makeDraggable(s,l,!0),T(l.labels,function(p){a.makeDraggable(s,p,!0)})})}),a&&t.on("shape.move.start",function(r){var s=r.context,c=s.shapes;if(c.length===1){var d=c[0],l=d.host;l&&(n.addMarker(l,yp),t.once(["shape.move.out","shape.move.cleanup"],function(){n.removeMarker(l,yp)}))}}),this.preExecuted("elements.move",vp,function(r){var s=r.context,c=s.closure,d=s.shapes,l=Kr(d);T(l,function(p){c.add(p,c.topLevel[p.host.id])})}),this.postExecuted("elements.move",function(r){var s=r.context,c=s.shapes,d=s.newHost,l;d&&c.length!==1||(d?l=c:l=ae(c,function(p){var u=p.host;return Jv(p)&&!Qv(c,u)}),T(l,function(p){o.updateAttachment(p,d)}))}),this.postExecuted("elements.move",function(r){var s=r.context.shapes;T(s,function(c){T(c.attachers,function(d){T(d.outgoing.slice(),function(l){var p=i.allowed("connection.reconnect",{connection:l,source:l.source,target:l.target});p||o.removeConnection(l)}),T(d.incoming.slice(),function(l){var p=i.allowed("connection.reconnect",{connection:l,source:l.source,target:l.target});p||o.removeConnection(l)})})})}),this.postExecute("shape.create",function(r){var s=r.context,c=s.shape,d=s.host;d&&o.updateAttachment(c,d)}),this.postExecute("shape.replace",function(r){var s=r.context,c=s.oldShape,d=s.newShape;hn(c.attachers,function(l){var p=i.allowed("elements.move",{target:d,shapes:[l]});p==="attach"?o.updateAttachment(l,d):o.removeShape(l)}),d.attachers.length&&T(d.attachers,function(l){var p=Kd(l,c,d);o.moveShape(l,p,l.parent)})}),this.postExecute("shape.resize",function(r){var s=r.context,c=s.shape,d=s.oldBounds,l=s.newBounds,p=c.attachers,u=s.hints||{};u.attachSupport!==!1&&T(p,function(m){var h=Kd(m,d,l);o.moveShape(m,h,m.parent),T(m.labels,function(g){o.moveShape(g,h,g.parent)})})}),this.preExecute("shape.delete",function(r){var s=r.context.shape;hn(s.attachers,function(c){o.removeShape(c)}),s.host&&o.updateAttachment(s,null)})}z(xc,D);xc.$inject=["injector","eventBus","canvas","rules","modeling"];function Kr(e){return ss(ht(e,function(t){return t.attachers||[]}))}function Zv(e){var t=Kr(e);return cf("id",e,t)}function Xv(e){var t=la(e,"id");return ae(e,function(n){for(;n;){if(n.host&&t[n.host.id])return!1;n=n.parent}return!0})}function Jv(e){return!!e.host}function Qv(e,t){return e.indexOf(t)!==-1}const ey={__depends__:[$t],__init__:["attachSupport"],attachSupport:["type",xc]};function Tt(e){this._model=e}Tt.$inject=["moddle"];Tt.prototype._needsId=function(e){return Q(e,["bpmn:RootElement","bpmn:FlowElement","bpmn:MessageFlow","bpmn:DataAssociation","bpmn:Artifact","bpmn:Participant","bpmn:Lane","bpmn:LaneSet","bpmn:Process","bpmn:Collaboration","bpmndi:BPMNShape","bpmndi:BPMNEdge","bpmndi:BPMNDiagram","bpmndi:BPMNPlane","bpmn:Property","bpmn:CategoryValue"])};Tt.prototype._ensureId=function(e){if(e.id){this._model.ids.claim(e.id,e);return}var t;_(e,"bpmn:Activity")?t="Activity":_(e,"bpmn:Event")?t="Event":_(e,"bpmn:Gateway")?t="Gateway":Q(e,["bpmn:SequenceFlow","bpmn:MessageFlow"])?t="Flow":t=(e.$type||"").replace(/^[^:]*:/g,""),t+="_",!e.id&&this._needsId(e)&&(e.id=this._model.ids.nextPrefixed(t,e))};Tt.prototype.create=function(e,t){var n=this._model.create(e,t||{});return this._ensureId(n),n};Tt.prototype.createDiLabel=function(){return this.create("bpmndi:BPMNLabel",{bounds:this.createDiBounds()})};Tt.prototype.createDiShape=function(e,t){return this.create("bpmndi:BPMNShape",C({bpmnElement:e,bounds:this.createDiBounds()},t))};Tt.prototype.createDiBounds=function(e){return this.create("dc:Bounds",e)};Tt.prototype.createDiWaypoints=function(e){var t=this;return ht(e,function(n){return t.createDiWaypoint(n)})};Tt.prototype.createDiWaypoint=function(e){return this.create("dc:Point",fn(e,["x","y"]))};Tt.prototype.createDiEdge=function(e,t){return this.create("bpmndi:BPMNEdge",C({bpmnElement:e,waypoint:this.createDiWaypoints([])},t))};Tt.prototype.createDiPlane=function(e,t){return this.create("bpmndi:BPMNPlane",C({bpmnElement:e},t))};function lt(e,t,n){D.call(this,e),this._bpmnFactory=t;var i=this;function o(m){var h=m.context,g=h.hints||{},f;!h.cropped&&g.createElementsBehavior!==!1&&(f=h.connection,f.waypoints=n.getCroppedWaypoints(f),h.cropped=!0)}this.executed(["connection.layout","connection.create"],o),this.reverted(["connection.layout"],function(m){delete m.context.cropped});function a(m){var h=m.context;i.updateParent(h.shape||h.connection,h.oldParent)}function r(m){var h=m.context,g=h.shape||h.connection,f=h.parent||h.newParent;i.updateParent(g,f)}this.executed(["shape.move","shape.create","shape.delete","connection.create","connection.move","connection.delete"],pt(a)),this.reverted(["shape.move","shape.create","shape.delete","connection.create","connection.move","connection.delete"],pt(r));function s(m){var h=m.context,g=h.oldRoot,f=g.children;T(f,function(w){_(w,"bpmn:BaseElement")&&i.updateParent(w)})}this.executed(["canvas.updateRoot"],s),this.reverted(["canvas.updateRoot"],s);function c(m){var h=m.context.shape;_(h,"bpmn:BaseElement")&&i.updateBounds(h)}this.executed(["shape.move","shape.create","shape.resize"],pt(function(m){m.context.shape.type!=="label"&&c(m)})),this.reverted(["shape.move","shape.create","shape.resize"],pt(function(m){m.context.shape.type!=="label"&&c(m)})),e.on("shape.changed",function(m){m.element.type==="label"&&c({context:{shape:m.element}})});function d(m){i.updateConnection(m.context)}this.executed(["connection.create","connection.move","connection.delete","connection.reconnect"],pt(d)),this.reverted(["connection.create","connection.move","connection.delete","connection.reconnect"],pt(d));function l(m){i.updateConnectionWaypoints(m.context.connection)}this.executed(["connection.layout","connection.move","connection.updateWaypoints"],pt(l)),this.reverted(["connection.layout","connection.move","connection.updateWaypoints"],pt(l)),this.executed("connection.reconnect",pt(function(m){var h=m.context,g=h.connection,f=h.oldSource,w=h.newSource,E=G(g),v=G(f),y=G(w);E.conditionExpression&&!Q(y,["bpmn:Activity","bpmn:ExclusiveGateway","bpmn:InclusiveGateway"])&&(h.oldConditionExpression=E.conditionExpression,delete E.conditionExpression),f!==w&&v.default===E&&(h.oldDefault=v.default,delete v.default)})),this.reverted("connection.reconnect",pt(function(m){var h=m.context,g=h.connection,f=h.oldSource,w=h.newSource,E=G(g),v=G(f),y=G(w);h.oldConditionExpression&&(E.conditionExpression=h.oldConditionExpression),h.oldDefault&&(v.default=h.oldDefault,delete y.default)}));function p(m){i.updateAttachment(m.context)}this.executed(["element.updateAttachment"],pt(p)),this.reverted(["element.updateAttachment"],pt(p)),this.executed("element.updateLabel",pt(u)),this.reverted("element.updateLabel",pt(u));function u(m){const{element:h}=m.context,g=Yt(h),f=fe(h),w=f&&f.get("label");Kn(h)||Io(h)||(g&&!w?f.set("label",t.create("bpmndi:BPMNLabel")):!g&&w&&f.set("label",void 0))}}z(lt,D);lt.$inject=["eventBus","bpmnFactory","connectionDocking"];lt.prototype.updateAttachment=function(e){var t=e.shape,n=t.businessObject,i=t.host;n.attachedToRef=i&&i.businessObject};lt.prototype.updateParent=function(e,t){if(!ce(e)&&!(_(e,"bpmn:DataStoreReference")&&e.parent&&_(e.parent,"bpmn:Collaboration"))){var n=e.parent,i=e.businessObject,o=fe(e),a=n&&n.businessObject,r=fe(n);_(e,"bpmn:FlowNode")&&this.updateFlowNodeRefs(i,a,t&&t.businessObject),_(e,"bpmn:DataOutputAssociation")&&(e.source?a=e.source.businessObject:a=null),_(e,"bpmn:DataInputAssociation")&&(e.target?a=e.target.businessObject:a=null),this.updateSemanticParent(i,a),_(e,"bpmn:DataObjectReference")&&i.dataObjectRef&&this.updateSemanticParent(i.dataObjectRef,a),this.updateDiParent(o,r)}};lt.prototype.updateBounds=function(e){var t=fe(e),n=ny(e);if(n){var i=Rt(n,t.get("bounds"));C(n,{x:e.x+i.x,y:e.y+i.y})}var o=ce(e)?this._getLabel(t):t,a=o.bounds;a||(a=this._bpmnFactory.createDiBounds(),o.set("bounds",a)),C(a,{x:e.x,y:e.y,width:e.width,height:e.height})};lt.prototype.updateFlowNodeRefs=function(e,t,n){if(n!==t){var i,o;_(n,"bpmn:Lane")&&(i=n.get("flowNodeRef"),qe(i,e)),_(t,"bpmn:Lane")&&(o=t.get("flowNodeRef"),Ve(o,e))}};lt.prototype.updateDiConnection=function(e,t,n){var i=fe(e),o=fe(t),a=fe(n);i.sourceElement&&i.sourceElement.bpmnElement!==G(t)&&(i.sourceElement=t&&o),i.targetElement&&i.targetElement.bpmnElement!==G(n)&&(i.targetElement=n&&a)};lt.prototype.updateDiParent=function(e,t){if(t&&!_(t,"bpmndi:BPMNPlane")&&(t=t.$parent),e.$parent!==t){var n=(t||e.$parent).get("planeElement");t?(n.push(e),e.$parent=t):(qe(n,e),e.$parent=null)}};function ty(e){for(;e&&!_(e,"bpmn:Definitions");)e=e.$parent;return e}lt.prototype.getLaneSet=function(e){var t,n;return _(e,"bpmn:Lane")?(t=e.childLaneSet,t||(t=this._bpmnFactory.create("bpmn:LaneSet"),e.childLaneSet=t,t.$parent=e),t):(_(e,"bpmn:Participant")&&(e=e.processRef),n=e.get("laneSets"),t=n[0],t||(t=this._bpmnFactory.create("bpmn:LaneSet"),t.$parent=e,n.push(t)),t)};lt.prototype.updateSemanticParent=function(e,t,n){var i;if(e.$parent!==t&&!((_(e,"bpmn:DataInput")||_(e,"bpmn:DataOutput"))&&(_(t,"bpmn:Participant")&&"processRef"in t&&(t=t.processRef),"ioSpecification"in t&&t.ioSpecification===e.$parent))){if(_(e,"bpmn:Lane"))t&&(t=this.getLaneSet(t)),i="lanes";else if(_(e,"bpmn:FlowElement")){if(t){if(_(t,"bpmn:Participant"))t=t.processRef;else if(_(t,"bpmn:Lane"))do t=t.$parent.$parent;while(_(t,"bpmn:Lane"))}i="flowElements"}else if(_(e,"bpmn:Artifact")){for(;t&&!_(t,"bpmn:Process")&&!_(t,"bpmn:SubProcess")&&!_(t,"bpmn:Collaboration");)if(_(t,"bpmn:Participant")){t=t.processRef;break}else t=t.$parent;i="artifacts"}else if(_(e,"bpmn:MessageFlow"))i="messageFlows";else if(_(e,"bpmn:Participant")){i="participants";var o=e.processRef,a;o&&(a=ty(e.$parent||t),e.$parent&&(qe(a.get("rootElements"),o),o.$parent=null),t&&(Ve(a.get("rootElements"),o),o.$parent=a))}else _(e,"bpmn:DataOutputAssociation")?i="dataOutputAssociations":_(e,"bpmn:DataInputAssociation")&&(i="dataInputAssociations");if(!i)throw new Error(`no parent for <${e.id}> in <${t.id}>`);var r;if(e.$parent&&(r=e.$parent.get(i),qe(r,e)),t?(r=t.get(i),r.push(e),e.$parent=t):e.$parent=null,n){var s=n.get(i);qe(r,e),t&&(s||(s=[],t.set(i,s)),s.push(e))}}};lt.prototype.updateConnectionWaypoints=function(e){var t=fe(e);t.set("waypoint",this._bpmnFactory.createDiWaypoints(e.waypoints))};lt.prototype.updateConnection=function(e){var t=e.connection,n=G(t),i=t.source,o=G(i),a=t.target,r=G(t.target),s;if(_(n,"bpmn:DataAssociation"))_(n,"bpmn:DataInputAssociation")?(n.get("sourceRef")[0]=o,s=e.parent||e.newParent||r,this.updateSemanticParent(n,r,s)):_(n,"bpmn:DataOutputAssociation")&&(s=e.parent||e.newParent||o,this.updateSemanticParent(n,o,s),n.targetRef=r);else{var c=_(n,"bpmn:SequenceFlow");n.sourceRef!==o&&(c&&(qe(n.sourceRef&&n.sourceRef.get("outgoing"),n),o&&o.get("outgoing")&&o.get("outgoing").push(n)),n.sourceRef=o),n.targetRef!==r&&(c&&(qe(n.targetRef&&n.targetRef.get("incoming"),n),r&&r.get("incoming")&&r.get("incoming").push(n)),n.targetRef=r)}this.updateConnectionWaypoints(t),this.updateDiConnection(t,i,a)};lt.prototype._getLabel=function(e){return e.label||(e.label=this._bpmnFactory.createDiLabel()),e.label};function pt(e){return function(t){var n=t.context,i=n.shape||n.connection||n.element;_(i,"bpmn:BaseElement")&&e(t)}}function ny(e){if(_(e,"bpmn:Activity")){var t=fe(e);if(t){var n=t.get("label");if(n)return n.get("bounds")}}}function yn(e,t){hs.call(this),this._bpmnFactory=e,this._moddle=t}z(yn,hs);yn.$inject=["bpmnFactory","moddle"];yn.prototype._baseCreate=hs.prototype.create;yn.prototype.create=function(e,t){if(e==="label"){var n=t.di||this._bpmnFactory.createDiLabel();return this._baseCreate(e,C({type:"label",di:n},df,t))}return this.createElement(e,t)};yn.prototype.createElement=function(e,t){t=C({},t||{});var n,i=t.businessObject,o=t.di;if(!i){if(!t.type)throw new Error("no shape type specified");i=this._bpmnFactory.create(t.type),pf(i)}if(!oy(o)){var a=C({},o||{},{id:i.id+"_di"});e==="root"?o=this._bpmnFactory.createDiPlane(i,a):e==="connection"?o=this._bpmnFactory.createDiEdge(i,a):o=this._bpmnFactory.createDiShape(i,a)}_(i,"bpmn:Group")&&(t=C({isFrame:!0},t)),t=iy(i,t,["processRef","isInterrupting","associationDirection","isForCompensation"]),t.isExpanded&&(t=Zr(o,t,"isExpanded")),Q(i,["bpmn:Lane","bpmn:Participant"])&&(t=Zr(o,t,"isHorizontal")),_(i,"bpmn:SubProcess")&&(t.collapsed=!pe(i,o)),_(i,"bpmn:ExclusiveGateway")&&(mn(o,"isMarkerVisible")?o.isMarkerVisible===void 0&&(o.isMarkerVisible=!1):o.isMarkerVisible=!0),ut(t.triggeredByEvent)&&(i.triggeredByEvent=t.triggeredByEvent,delete t.triggeredByEvent),ut(t.cancelActivity)&&(i.cancelActivity=t.cancelActivity,delete t.cancelActivity);var r,s;return t.eventDefinitionType&&(r=i.get("eventDefinitions")||[],s=this._bpmnFactory.create(t.eventDefinitionType,t.eventDefinitionAttrs),t.eventDefinitionType==="bpmn:ConditionalEventDefinition"&&(s.condition=this._bpmnFactory.create("bpmn:FormalExpression")),r.push(s),s.$parent=i,i.eventDefinitions=r,delete t.eventDefinitionType),n=this.getDefaultSize(i,o),t=C({id:i.id},n,t,{businessObject:i,di:o}),this._baseCreate(e,t)};yn.prototype.getDefaultSize=function(e,t){var n=G(e);if(t=t||fe(e),_(n,"bpmn:SubProcess"))return pe(n,t)?{width:350,height:200}:{width:100,height:80};if(_(n,"bpmn:Task"))return{width:100,height:80};if(_(n,"bpmn:Gateway"))return{width:50,height:50};if(_(n,"bpmn:Event"))return{width:36,height:36};if(_(n,"bpmn:Participant")){var i=t.isHorizontal===void 0||t.isHorizontal===!0;return pe(n,t)?i?{width:600,height:250}:{width:250,height:600}:i?{width:400,height:60}:{width:60,height:400}}return _(n,"bpmn:Lane")?{width:400,height:100}:_(n,"bpmn:DataObjectReference")?{width:36,height:50}:_(n,"bpmn:DataStoreReference")?{width:50,height:50}:_(n,"bpmn:TextAnnotation")?{width:100,height:30}:_(n,"bpmn:Group")?{width:300,height:300}:{width:100,height:80}};yn.prototype.createParticipantShape=function(e){return Xt(e)||(e={isExpanded:e}),e=C({type:"bpmn:Participant"},e||{}),e.isExpanded!==!1&&(e.processRef=this._bpmnFactory.create("bpmn:Process")),this.createShape(e)};function iy(e,t,n){return T(n,function(i){t=Zr(e,t,i)}),t}function Zr(e,t,n){return t[n]===void 0?t:(e[n]=t[n],Bt(t,[n]))}function oy(e){return Q(e,["bpmndi:BPMNShape","bpmndi:BPMNEdge","bpmndi:BPMNDiagram","bpmndi:BPMNPlane"])}function Fa(e,t){this._modeling=e,this._canvas=t}Fa.$inject=["modeling","canvas"];Fa.prototype.preExecute=function(e){var t=this._modeling,n=e.elements,i=e.alignment;T(n,function(o){var a={x:0,y:0};ut(i.left)?a.x=i.left-o.x:ut(i.right)?a.x=i.right-o.width-o.x:ut(i.center)?a.x=i.center-Math.round(o.width/2)-o.x:ut(i.top)?a.y=i.top-o.y:ut(i.bottom)?a.y=i.bottom-o.height-o.y:ut(i.middle)&&(a.y=i.middle-Math.round(o.height/2)-o.y),t.moveElements([o],a,o.parent)})};Fa.prototype.postExecute=function(e){};function Oa(e){this._modeling=e}Oa.$inject=["modeling"];Oa.prototype.preExecute=function(e){var t=e.source;if(!t)throw new Error("source required");var n=e.target||t.parent,i=e.shape,o=e.hints||{};i=e.shape=this._modeling.createShape(i,e.position,n,{attach:o.attach}),e.shape=i};Oa.prototype.postExecute=function(e){var t=e.hints||{};ay(e.source,e.shape)||(t.connectionTarget===e.source?this._modeling.connect(e.shape,e.source,e.connection):this._modeling.connect(e.source,e.shape,e.connection))};function ay(e,t){return ji(e.outgoing,function(n){return n.target===t})}function La(e,t){this._canvas=e,this._layouter=t}La.$inject=["canvas","layouter"];La.prototype.execute=function(e){var t=e.connection,n=e.source,i=e.target,o=e.parent,a=e.parentIndex,r=e.hints;if(!n||!i)throw new Error("source and target required");if(!o)throw new Error("parent required");return t.source=n,t.target=i,t.waypoints||(t.waypoints=this._layouter.layoutConnection(t,r)),this._canvas.addConnection(t,o,a),t};La.prototype.revert=function(e){var t=e.connection;return this._canvas.removeConnection(t),t.source=null,t.target=null,t};var To=Math.round;function Pc(e){this._modeling=e}Pc.$inject=["modeling"];Pc.prototype.preExecute=function(e){var t=e.elements,n=e.parent,i=e.parentIndex,o=e.position,a=e.hints,r=this._modeling;T(t,function(p){te(p.x)||(p.x=0),te(p.y)||(p.y=0)});var s=ae(t,function(p){return!p.hidden}),c=wt(s);T(t,function(p){ye(p)&&(p.waypoints=ht(p.waypoints,function(u){return{x:To(u.x-c.x-c.width/2+o.x),y:To(u.y-c.y-c.height/2+o.y)}})),C(p,{x:To(p.x-c.x-c.width/2+o.x),y:To(p.y-c.y-c.height/2+o.y)})});var d=da(t),l={};T(t,function(p){if(ye(p)){l[p.id]=te(i)?r.createConnection(l[p.source.id],l[p.target.id],i,p,p.parent||n,a):r.createConnection(l[p.source.id],l[p.target.id],p,p.parent||n,a);return}var u=C({},a);d.indexOf(p)===-1&&(u.autoResize=!1),ce(p)&&(u=Bt(u,["attach"])),l[p.id]=te(i)?r.createShape(p,fn(p,["x","y","width","height"]),p.parent||n,i,u):r.createShape(p,fn(p,["x","y","width","height"]),p.parent||n,u)}),e.elements=cs(l)};var wp=Math.round;function wn(e){this._canvas=e}wn.$inject=["canvas"];wn.prototype.execute=function(e){var t=e.shape,n=e.position,i=e.parent,o=e.parentIndex;if(!i)throw new Error("parent required");if(!n)throw new Error("position required");return n.width!==void 0?C(t,n):C(t,{x:n.x-wp(t.width/2),y:n.y-wp(t.height/2)}),this._canvas.addShape(t,i,o),t};wn.prototype.revert=function(e){var t=e.shape;return this._canvas.removeShape(t),t};function Yi(e){wn.call(this,e)}z(Yi,wn);Yi.$inject=["canvas"];var ry=wn.prototype.execute;Yi.prototype.execute=function(e){var t=e.shape;return cy(t),t.labelTarget=e.labelTarget,ry.call(this,e)};var sy=wn.prototype.revert;Yi.prototype.revert=function(e){return e.shape.labelTarget=null,sy.call(this,e)};function cy(e){["width","height"].forEach(function(t){typeof e[t]>"u"&&(e[t]=0)})}function Ki(e,t){this._canvas=e,this._modeling=t}Ki.$inject=["canvas","modeling"];Ki.prototype.preExecute=function(e){var t=this._modeling,n=e.connection;hn(n.incoming,function(i){t.removeConnection(i,{nested:!0})}),hn(n.outgoing,function(i){t.removeConnection(i,{nested:!0})})};Ki.prototype.execute=function(e){var t=e.connection,n=t.parent;return e.parent=n,e.parentIndex=ms(n.children,t),e.source=t.source,e.target=t.target,this._canvas.removeConnection(t),t.source=null,t.target=null,t};Ki.prototype.revert=function(e){var t=e.connection,n=e.parent,i=e.parentIndex;return t.source=e.source,t.target=e.target,Ve(n.children,t,i),this._canvas.addConnection(t,n),t};function Sc(e,t){this._modeling=e,this._elementRegistry=t}Sc.$inject=["modeling","elementRegistry"];Sc.prototype.postExecute=function(e){var t=this._modeling,n=this._elementRegistry,i=e.elements;T(i,function(o){n.get(o.id)&&(o.waypoints?t.removeConnection(o):t.removeShape(o))})};function Zi(e,t){this._canvas=e,this._modeling=t}Zi.$inject=["canvas","modeling"];Zi.prototype.preExecute=function(e){var t=this._modeling,n=e.shape;hn(n.incoming,function(i){t.removeConnection(i,{nested:!0})}),hn(n.outgoing,function(i){t.removeConnection(i,{nested:!0})}),hn(n.children,function(i){ye(i)?t.removeConnection(i,{nested:!0}):t.removeShape(i,{nested:!0})})};Zi.prototype.execute=function(e){var t=this._canvas,n=e.shape,i=n.parent;return e.oldParent=i,e.oldParentIndex=ms(i.children,n),t.removeShape(n),n};Zi.prototype.revert=function(e){var t=this._canvas,n=e.shape,i=e.oldParent,o=e.oldParentIndex;return Ve(i.children,n,o),t.addShape(n,i),n};function Ga(e){this._modeling=e}Ga.$inject=["modeling"];var Ep={x:"y",y:"x"};Ga.prototype.preExecute=function(e){var t=this._modeling,n=e.groups,i=e.axis,o=e.dimension;function a(f,w){f.range.min=Math.min(w[i],f.range.min),f.range.max=Math.max(w[i]+w[o],f.range.max)}function r(f){return f[i]+f[o]/2}function s(f){return f.length-1}function c(f){return f.max-f.min}function d(f,w){var E={y:0};E[i]=f-r(w),E[i]&&(E[Ep[i]]=0,t.moveElements([w],E,w.parent))}var l=n[0],p=s(n),u=n[p],m,h,g=0;T(n,function(f,w){var E,v,y;if(f.elements.length<2){w&&w!==n.length-1&&(a(f,f.elements[0]),g+=c(f.range));return}E=Zt(f.elements,i),v=E[0],w===p&&(v=E[s(E)]),y=r(v),f.range=null,T(E,function(P){if(d(y,P),f.range===null){f.range={min:P[i],max:P[i]+P[o]};return}a(f,P)}),w&&w!==n.length-1&&(g+=c(f.range))}),h=Math.abs(u.range.min-l.range.max),m=Math.round((h-g)/(n.length-1)),!(m<n.length-1)&&T(n,function(f,w){var E={},v;f===l||f===u||(v=n[w-1],f.range.max=0,T(f.elements,function(y,P){E[Ep[i]]=0,E[i]=v.range.max-y[i]+m,f.range.min!==y[i]&&(E[i]+=y[i]-f.range.min),E[i]&&t.moveElements([y],E,y.parent),f.range.max=Math.max(y[i]+y[o],P?f.range.max:0)}))})};Ga.prototype.postExecute=function(e){};function ja(e,t){this._layouter=e,this._canvas=t}ja.$inject=["layouter","canvas"];ja.prototype.execute=function(e){var t=e.connection,n=t.waypoints;return C(e,{oldWaypoints:n}),t.waypoints=this._layouter.layoutConnection(t,e.hints),t};ja.prototype.revert=function(e){var t=e.connection;return t.waypoints=e.oldWaypoints,t};function Tc(){}Tc.prototype.execute=function(e){var t=e.connection,n=e.delta,i=e.newParent||t.parent,o=e.newParentIndex,a=t.parent;return e.oldParent=a,e.oldParentIndex=qe(a.children,t),Ve(i.children,t,o),t.parent=i,T(t.waypoints,function(r){r.x+=n.x,r.y+=n.y,r.original&&(r.original.x+=n.x,r.original.y+=n.y)}),t};Tc.prototype.revert=function(e){var t=e.connection,n=t.parent,i=e.oldParent,o=e.oldParentIndex,a=e.delta;return qe(n.children,t),Ve(i.children,t,o),t.parent=i,T(t.waypoints,function(r){r.x-=a.x,r.y-=a.y,r.original&&(r.original.x-=a.x,r.original.y-=a.y)}),t};function Mc(){this.allShapes={},this.allConnections={},this.enclosedElements={},this.enclosedConnections={},this.topLevel={}}Mc.prototype.add=function(e,t){return this.addAll([e],t)};Mc.prototype.addAll=function(e,t){var n=lf(e,!!t,this);return C(this,n),this};function Xi(e){this._modeling=e}Xi.prototype.moveRecursive=function(e,t,n){return e?this.moveClosure(this.getClosure(e),t,n):[]};Xi.prototype.moveClosure=function(e,t,n,i,o){var a=this._modeling,r=e.allShapes,s=e.allConnections,c=e.enclosedConnections,d=e.topLevel,l=!1;o&&o.parent===n&&(l=!0),T(r,function(p){a.moveShape(p,t,d[p.id]&&!l&&n,{recurse:!1,layout:!1})}),T(s,function(p){var u=!!r[p.source.id],m=!!r[p.target.id];c[p.id]&&u&&m?a.moveConnection(p,t,d[p.id]&&!l&&n):a.layoutConnection(p,{connectionStart:u&&Xs(p,p.source,t),connectionEnd:m&&Js(p,p.target,t)})})};Xi.prototype.getClosure=function(e){return new Mc().addAll(e,!0)};function $a(e){this._helper=new Xi(e)}$a.$inject=["modeling"];$a.prototype.preExecute=function(e){e.closure=this._helper.getClosure(e.shapes)};$a.prototype.postExecute=function(e){var t=e.hints,n;t&&t.primaryShape&&(n=t.primaryShape,t.oldParent=n.parent),this._helper.moveClosure(e.closure,e.delta,e.newParent,e.newHost,n)};function Ln(e){this._modeling=e,this._helper=new Xi(e)}Ln.$inject=["modeling"];Ln.prototype.execute=function(e){var t=e.shape,n=e.delta,i=e.newParent||t.parent,o=e.newParentIndex,a=t.parent;return e.oldBounds=fn(t,["x","y","width","height"]),e.oldParent=a,e.oldParentIndex=qe(a.children,t),Ve(i.children,t,o),C(t,{parent:i,x:t.x+n.x,y:t.y+n.y}),t};Ln.prototype.postExecute=function(e){var t=e.shape,n=e.delta,i=e.hints,o=this._modeling;i.layout!==!1&&(T(t.incoming,function(a){o.layoutConnection(a,{connectionEnd:Js(a,t,n)})}),T(t.outgoing,function(a){o.layoutConnection(a,{connectionStart:Xs(a,t,n)})})),i.recurse!==!1&&this.moveChildren(e)};Ln.prototype.revert=function(e){var t=e.shape,n=e.oldParent,i=e.oldParentIndex,o=e.delta;return Ve(n.children,t,i),C(t,{parent:n,x:t.x-o.x,y:t.y-o.y}),t};Ln.prototype.moveChildren=function(e){var t=e.delta,n=e.shape;this._helper.moveRecursive(n.children,t,null)};Ln.prototype.getNewParent=function(e){return e.newParent||e.shape.parent};function Ji(e){this._modeling=e}Ji.$inject=["modeling"];Ji.prototype.execute=function(e){var t=e.newSource,n=e.newTarget,i=e.connection,o=e.dockingOrPoints;if(!t&&!n)throw new Error("newSource or newTarget required");return se(o)&&(e.oldWaypoints=i.waypoints,i.waypoints=o),t&&(e.oldSource=i.source,i.source=t),n&&(e.oldTarget=i.target,i.target=n),i};Ji.prototype.postExecute=function(e){var t=e.connection,n=e.newSource,i=e.newTarget,o=e.dockingOrPoints,a=e.hints||{},r={};a.connectionStart&&(r.connectionStart=a.connectionStart),a.connectionEnd&&(r.connectionEnd=a.connectionEnd),a.layoutConnection!==!1&&(n&&(!i||a.docking==="source")&&(r.connectionStart=r.connectionStart||xp(se(o)?o[0]:o)),i&&(!n||a.docking==="target")&&(r.connectionEnd=r.connectionEnd||xp(se(o)?o[o.length-1]:o)),a.newWaypoints&&(r.waypoints=a.newWaypoints),this._modeling.layoutConnection(t,r))};Ji.prototype.revert=function(e){var t=e.oldSource,n=e.oldTarget,i=e.oldWaypoints,o=e.connection;return t&&(o.source=t),n&&(o.target=n),i&&(o.waypoints=i),o};function xp(e){return e.original||e}function nn(e,t){this._modeling=e,this._rules=t}nn.$inject=["modeling","rules"];nn.prototype.preExecute=function(e){var t=this,n=this._modeling,i=this._rules,o=e.oldShape,a=e.newData,r=e.hints||{},s;function c(h,g,f){return i.allowed("connection.reconnect",{connection:f,source:h,target:g})}var d={x:a.x,y:a.y},l={x:o.x,y:o.y,width:o.width,height:o.height};s=e.newShape=e.newShape||t.createShape(a,d,o.parent,r),o.host&&n.updateAttachment(s,o.host);var p;r.moveChildren!==!1&&(p=o.children.slice(),n.moveElements(p,{x:0,y:0},s,r));var u=o.incoming.slice(),m=o.outgoing.slice();T(u,function(h){var g=h.source,f=c(g,s,h);f&&t.reconnectEnd(h,s,Na(h,s,l),r)}),T(m,function(h){var g=h.target,f=c(s,g,h);f&&t.reconnectStart(h,s,Ma(h,s,l),r)})};nn.prototype.postExecute=function(e){var t=e.oldShape;this._modeling.removeShape(t)};nn.prototype.execute=function(e){};nn.prototype.revert=function(e){};nn.prototype.createShape=function(e,t,n,i){return this._modeling.createShape(e,t,n,i)};nn.prototype.reconnectStart=function(e,t,n,i){this._modeling.reconnectStart(e,t,n,i)};nn.prototype.reconnectEnd=function(e,t,n,i){this._modeling.reconnectEnd(e,t,n,i)};function Qi(e){this._modeling=e}Qi.$inject=["modeling"];Qi.prototype.execute=function(e){var t=e.shape,n=e.newBounds,i=e.minBounds;if(n.x===void 0||n.y===void 0||n.width===void 0||n.height===void 0)throw new Error("newBounds must have {x, y, width, height} properties");if(i&&(n.width<i.width||n.height<i.height))throw new Error("width and height cannot be less than minimum height and width");if(!i&&n.width<10||n.height<10)throw new Error("width and height cannot be less than 10px");return e.oldBounds={width:t.width,height:t.height,x:t.x,y:t.y},C(t,{width:n.width,height:n.height,x:n.x,y:n.y}),t};Qi.prototype.postExecute=function(e){var t=this._modeling,n=e.shape,i=e.oldBounds,o=e.hints||{};o.layout!==!1&&(T(n.incoming,function(a){t.layoutConnection(a,{connectionEnd:Na(a,n,i)})}),T(n.outgoing,function(a){t.layoutConnection(a,{connectionStart:Ma(a,n,i)})}))};Qi.prototype.revert=function(e){var t=e.shape,n=e.oldBounds;return C(t,{width:n.width,height:n.height,x:n.x,y:n.y}),t};function En(e){this._modeling=e}En.$inject=["modeling"];En.prototype.preExecute=function(e){var t=e.delta,n=e.direction,i=e.movingShapes,o=e.resizingShapes,a=e.start,r={};this.moveShapes(i,t),T(o,function(s){r[s.id]=py(s)}),this.resizeShapes(o,t,n),this.updateConnectionWaypoints(Ov(i,o),t,n,a,i,o,r)};En.prototype.execute=function(){};En.prototype.revert=function(){};En.prototype.moveShapes=function(e,t){var n=this;T(e,function(i){n._modeling.moveShape(i,t,null,{autoResize:!1,layout:!1,recurse:!1})})};En.prototype.resizeShapes=function(e,t,n){var i=this;T(e,function(o){var a=Lv(o,n,t);i._modeling.resizeShape(o,a,null,{attachSupport:!1,autoResize:!1,layout:!1})})};En.prototype.updateConnectionWaypoints=function(e,t,n,i,o,a,r){var s=this,c=o.concat(a);T(e,function(d){var l=d.source,p=d.target,u=dy(d),m=Om(n),h={};un(c,l)&&un(c,p)?(u=ht(u,function(g){return Sp(g,i,n)&&(g[m]=g[m]+t[m]),g.original&&Sp(g.original,i,n)&&(g.original[m]=g.original[m]+t[m]),g}),s._modeling.updateWaypoints(d,u,{labelBehavior:!1})):(un(c,l)||un(c,p))&&(un(o,l)?h.connectionStart=Xs(d,l,t):un(o,p)?h.connectionEnd=Js(d,p,t):un(a,l)?h.connectionStart=Ma(d,l,r[l.id]):un(a,p)&&(h.connectionEnd=Na(d,p,r[p.id])),s._modeling.layoutConnection(d,h))})};function Pp(e){return C({},e)}function dy(e){return ht(e.waypoints,function(t){return t=Pp(t),t.original&&(t.original=Pp(t.original)),t})}function Om(e){switch(e){case"n":return"y";case"w":return"x";case"s":return"y";case"e":return"x"}}function Sp(e,t,n){var i=Om(n);if(/e|s/.test(n))return e[i]>t;if(/n|w/.test(n))return e[i]<t}function un(e,t){return e.indexOf(t)!==-1}function py(e){return{x:e.x,y:e.y,height:e.height,width:e.width}}function qa(e){this._modeling=e}qa.$inject=["modeling"];qa.prototype.execute=function(e){var t=e.shape,n=t.children;e.oldChildrenVisibility=Lm(n),t.collapsed=!t.collapsed;var i=Gm(n,t.collapsed);return[t].concat(i)};qa.prototype.revert=function(e){var t=e.shape,n=e.oldChildrenVisibility,i=t.children,o=jm(i,n);return t.collapsed=!t.collapsed,[t].concat(o)};function Lm(e){var t={};return T(e,function(n){t[n.id]=n.hidden,n.children&&(t=C({},t,Lm(n.children)))}),t}function Gm(e,t){var n=[];return T(e,function(i){i.hidden=t,n=n.concat(i),i.children&&(n=n.concat(Gm(i.children,i.collapsed||t)))}),n}function jm(e,t){var n=[];return T(e,function(i){i.hidden=t[i.id],n=n.concat(i),i.children&&(n=n.concat(jm(i.children,t)))}),n}function Ha(e){this._modeling=e}Ha.$inject=["modeling"];Ha.prototype.execute=function(e){var t=e.shape,n=e.newHost,i=t.host;return e.oldHost=i,e.attacherIdx=$m(i,t),qm(n,t),t.host=n,t};Ha.prototype.revert=function(e){var t=e.shape,n=e.newHost,i=e.oldHost,o=e.attacherIdx;return t.host=i,$m(n,t),qm(i,t,o),t};function $m(e,t){return qe(e&&e.attachers,t)}function qm(e,t,n){if(e){var i=e.attachers;i||(e.attachers=i=[]),Ve(i,t,n)}}function Nc(){}Nc.prototype.execute=function(e){var t=e.connection,n=e.newWaypoints;return e.oldWaypoints=t.waypoints,t.waypoints=n,t};Nc.prototype.revert=function(e){var t=e.connection,n=e.oldWaypoints;return t.waypoints=n,t};function ge(e,t,n){this._eventBus=e,this._elementFactory=t,this._commandStack=n;var i=this;e.on("diagram.init",function(){i.registerHandlers(n)})}ge.$inject=["eventBus","elementFactory","commandStack"];ge.prototype.getHandlers=function(){return{"shape.append":Oa,"shape.create":wn,"shape.delete":Zi,"shape.move":Ln,"shape.resize":Qi,"shape.replace":nn,"shape.toggleCollapse":qa,spaceTool:En,"label.create":Yi,"connection.create":La,"connection.delete":Ki,"connection.move":Tc,"connection.layout":ja,"connection.updateWaypoints":Nc,"connection.reconnect":Ji,"elements.create":Pc,"elements.move":$a,"elements.delete":Sc,"elements.distribute":Ga,"elements.align":Fa,"element.updateAttachment":Ha}};ge.prototype.registerHandlers=function(e){T(this.getHandlers(),function(t,n){e.registerHandler(n,t)})};ge.prototype.moveShape=function(e,t,n,i,o){typeof i=="object"&&(o=i,i=null);var a={shape:e,delta:t,newParent:n,newParentIndex:i,hints:o||{}};this._commandStack.execute("shape.move",a)};ge.prototype.updateAttachment=function(e,t){var n={shape:e,newHost:t};this._commandStack.execute("element.updateAttachment",n)};ge.prototype.moveElements=function(e,t,n,i){i=i||{};var o=i.attach,a=n,r;o===!0?(r=n,a=n.parent):o===!1&&(r=null);var s={shapes:e,delta:t,newParent:a,newHost:r,hints:i};this._commandStack.execute("elements.move",s)};ge.prototype.moveConnection=function(e,t,n,i,o){typeof i=="object"&&(o=i,i=void 0);var a={connection:e,delta:t,newParent:n,newParentIndex:i,hints:o||{}};this._commandStack.execute("connection.move",a)};ge.prototype.layoutConnection=function(e,t){var n={connection:e,hints:t||{}};this._commandStack.execute("connection.layout",n)};ge.prototype.createConnection=function(e,t,n,i,o,a){typeof n=="object"&&(a=o,o=i,i=n,n=void 0),i=this._create("connection",i);var r={source:e,target:t,parent:o,parentIndex:n,connection:i,hints:a};return this._commandStack.execute("connection.create",r),r.connection};ge.prototype.createShape=function(e,t,n,i,o){typeof i!="number"&&(o=i,i=void 0),o=o||{};var a=o.attach,r,s;e=this._create("shape",e),a?(r=n.parent,s=n):r=n;var c={position:t,shape:e,parent:r,parentIndex:i,host:s,hints:o};return this._commandStack.execute("shape.create",c),c.shape};ge.prototype.createElements=function(e,t,n,i,o){se(e)||(e=[e]),typeof i!="number"&&(o=i,i=void 0),o=o||{};var a={position:t,elements:e,parent:n,parentIndex:i,hints:o};return this._commandStack.execute("elements.create",a),a.elements};ge.prototype.createLabel=function(e,t,n,i){n=this._create("label",n);var o={labelTarget:e,position:t,parent:i||e.parent,shape:n};return this._commandStack.execute("label.create",o),o.shape};ge.prototype.appendShape=function(e,t,n,i,o){o=o||{},t=this._create("shape",t);var a={source:e,position:n,target:i,shape:t,connection:o.connection,connectionParent:o.connectionParent,hints:o};return this._commandStack.execute("shape.append",a),a.shape};ge.prototype.removeElements=function(e){var t={elements:e};this._commandStack.execute("elements.delete",t)};ge.prototype.distributeElements=function(e,t,n){var i={groups:e,axis:t,dimension:n};this._commandStack.execute("elements.distribute",i)};ge.prototype.removeShape=function(e,t){var n={shape:e,hints:t||{}};this._commandStack.execute("shape.delete",n)};ge.prototype.removeConnection=function(e,t){var n={connection:e,hints:t||{}};this._commandStack.execute("connection.delete",n)};ge.prototype.replaceShape=function(e,t,n){var i={oldShape:e,newData:t,hints:n||{}};return this._commandStack.execute("shape.replace",i),i.newShape};ge.prototype.alignElements=function(e,t){var n={elements:e,alignment:t};this._commandStack.execute("elements.align",n)};ge.prototype.resizeShape=function(e,t,n,i){var o={shape:e,newBounds:t,minBounds:n,hints:i};this._commandStack.execute("shape.resize",o)};ge.prototype.createSpace=function(e,t,n,i,o){var a={delta:n,direction:i,movingShapes:e,resizingShapes:t,start:o};this._commandStack.execute("spaceTool",a)};ge.prototype.updateWaypoints=function(e,t,n){var i={connection:e,newWaypoints:t,hints:n||{}};this._commandStack.execute("connection.updateWaypoints",i)};ge.prototype.reconnect=function(e,t,n,i,o){var a={connection:e,newSource:t,newTarget:n,dockingOrPoints:i,hints:o||{}};this._commandStack.execute("connection.reconnect",a)};ge.prototype.reconnectStart=function(e,t,n,i){i||(i={}),this.reconnect(e,t,e.target,n,C(i,{docking:"source"}))};ge.prototype.reconnectEnd=function(e,t,n,i){i||(i={}),this.reconnect(e,e.source,t,n,C(i,{docking:"target"}))};ge.prototype.connect=function(e,t,n,i){return this.createConnection(e,t,n||{},e.parent,i)};ge.prototype._create=function(e,t){return uf(t)?t:this._elementFactory.create(e,t)};ge.prototype.toggleCollapse=function(e,t){var n={shape:e,hints:t||{}};this._commandStack.execute("shape.toggleCollapse",n)};function eo(e){this._elementRegistry=e}eo.$inject=["elementRegistry"];eo.prototype.execute=function(e){var t=e.element,n=e.moddleElement,i=e.properties;if(!n)throw new Error("<moddleElement> required");var o=e.changed||this._getVisualReferences(n).concat(t),a=e.oldProperties||ly(n,Nr(i));return Hm(n,i),e.oldProperties=a,e.changed=o,o};eo.prototype.revert=function(e){var t=e.oldProperties,n=e.moddleElement,i=e.changed;return Hm(n,t),i};eo.prototype._getVisualReferences=function(e){var t=this._elementRegistry;return _(e,"bpmn:DataObject")?uy(e,t):[]};function ly(e,t){return gn(t,function(n,i){return n[i]=e.get(i),n},{})}function Hm(e,t){T(t,function(n,i){e.set(i,n)})}function uy(e,t){return t.filter(function(n){return _(n,"bpmn:DataObjectReference")&&G(n).dataObjectRef===e})}var xi="default",Kt="id",zm="di",my={width:0,height:0};function to(e,t,n,i){this._elementRegistry=e,this._moddle=t,this._modeling=n,this._textRenderer=i}to.$inject=["elementRegistry","moddle","modeling","textRenderer"];to.prototype.execute=function(e){var t=e.element,n=[t];if(!t)throw new Error("element required");var i=this._elementRegistry,o=this._moddle.ids,a=t.businessObject,r=by(e.properties),s=e.oldProperties||hy(t,r);return Vm(r,a)&&(o.unclaim(a[Kt]),i.updateId(t,r[Kt]),o.claim(r[Kt],a)),xi in r&&(r[xi]&&n.push(i.get(r[xi].id)),a[xi]&&n.push(i.get(a[xi].id))),Wm(t,r),e.oldProperties=s,e.changed=n,n};to.prototype.postExecute=function(e){var t=e.element,n=t.label,i=n&&G(n).name;if(i){var o=this._textRenderer.getExternalLabelBounds(n,i);this._modeling.resizeShape(n,o,my)}};to.prototype.revert=function(e){var t=e.element,n=e.properties,i=e.oldProperties,o=t.businessObject,a=this._elementRegistry,r=this._moddle.ids;return Wm(t,i),Vm(n,o)&&(r.unclaim(n[Kt]),a.updateId(t,i[Kt]),r.claim(i[Kt],o)),e.changed};function Vm(e,t){return Kt in e&&e[Kt]!==t[Kt]}function hy(e,t){var n=Nr(t),i=e.businessObject,o=fe(e);return gn(n,function(a,r){return r!==zm?a[r]=i.get(r):a[r]=fy(o,Nr(t.di)),a},{})}function fy(e,t){return gn(t,function(n,i){return n[i]=e&&e.get(i),n},{})}function Wm(e,t){var n=e.businessObject,i=fe(e);T(t,function(o,a){a!==zm?n.set(a,o):i&&gy(i,o)})}function gy(e,t){T(t,function(n,i){e.set(i,n)})}var _y=["default"];function by(e){var t=C({},e);return _y.forEach(function(n){n in e&&(t[n]=G(t[n]))}),t}function za(e,t){this._canvas=e,this._modeling=t}za.$inject=["canvas","modeling"];za.prototype.execute=function(e){var t=this._canvas,n=e.newRoot,i=n.businessObject,o=t.getRootElement(),a=o.businessObject,r=a.$parent,s=fe(o);return t.setRootElement(n),t.removeRootElement(o),Ve(r.rootElements,i),i.$parent=r,qe(r.rootElements,a),a.$parent=null,o.di=null,s.bpmnElement=i,n.di=s,e.oldRoot=o,[]};za.prototype.revert=function(e){var t=this._canvas,n=e.newRoot,i=n.businessObject,o=e.oldRoot,a=o.businessObject,r=i.$parent,s=fe(n);return t.setRootElement(o),t.removeRootElement(n),qe(r.rootElements,i),i.$parent=null,Ve(r.rootElements,a),a.$parent=r,n.di=null,s.bpmnElement=a,o.di=s,[]};function Cc(e,t){this._modeling=e,this._spaceTool=t}Cc.$inject=["modeling","spaceTool"];Cc.prototype.preExecute=function(e){var t=this._spaceTool,n=this._modeling,i=e.shape,o=e.location,a=yt(i),r=a===i,s=r?i:i.parent,c=bn(s),d=Ze(i);if(d?o==="left"?o="top":o==="right"&&(o="bottom"):o==="top"?o="left":o==="bottom"&&(o="right"),!c.length){var l=d?{x:i.x+vt,y:i.y,width:i.width-vt,height:i.height}:{x:i.x,y:i.y+vt,width:i.width,height:i.height-vt};n.createShape({type:"bpmn:Lane",isHorizontal:d},l,s)}var p=[];ma(a,function(y){return p.push(y),y.label&&p.push(y.label),y===i?[]:ae(y.children,function(P){return P!==i})});var u,m,h,g,f;o==="top"?(u=-120,m=i.y,h=m+10,g="n",f="y"):o==="left"?(u=-120,m=i.x,h=m+10,g="w",f="x"):o==="bottom"?(u=120,m=i.y+i.height,h=m-10,g="s",f="y"):o==="right"&&(u=120,m=i.x+i.width,h=m-10,g="e",f="x");var w=t.calculateAdjustments(p,f,u,h),E=d?{x:0,y:u}:{x:u,y:0};t.makeSpace(w.movingShapes,w.resizingShapes,E,g,h);var v=d?{x:i.x+(r?vt:0),y:m-(o==="top"?120:0),width:i.width-(r?vt:0),height:120}:{x:m-(o==="left"?120:0),y:i.y+(r?vt:0),width:120,height:i.height-(r?vt:0)};e.newLane=n.createShape({type:"bpmn:Lane",isHorizontal:d},v,s)};function Rc(e){this._modeling=e}Rc.$inject=["modeling"];Rc.prototype.preExecute=function(e){var t=this._modeling,n=e.shape,i=e.count,o=bn(n),a=o.length;if(a>i)throw new Error(`more than <${i}> child lanes`);var r=Ze(n),s=r?n.height:n.width,c=Math.round(s/i),d,l,p,u;for(u=0;u<i;u++)u===i-1?d=s-c*u:d=c,l=r?{x:n.x+vt,y:n.y+u*c,width:n.width-vt,height:d}:{x:n.x+u*c,y:n.y+vt,width:d,height:n.height-vt},u<a?t.resizeShape(o[u],l):(p={type:"bpmn:Lane",isHorizontal:r},t.createShape(p,l,n))};function no(e,t){this._modeling=e,this._spaceTool=t}no.$inject=["modeling","spaceTool"];no.prototype.preExecute=function(e){var t=e.shape,n=e.newBounds,i=e.balanced;i!==!1?this.resizeBalanced(t,n):this.resizeSpace(t,n)};no.prototype.resizeBalanced=function(e,t){var n=this._modeling,i=W_(e,t);n.resizeShape(e,t),i.forEach(function(o){n.resizeShape(o.shape,o.newBounds)})};no.prototype.resizeSpace=function(e,t){var n=this._spaceTool,i=U(e),o=U(t),a=Wu(o,i),r=yt(e),s=[],c=[];ma(r,function(h){return s.push(h),(_(h,"bpmn:Lane")||_(h,"bpmn:Participant"))&&c.push(h),h.children});var d,l,p,u,m;(a.bottom||a.top)&&(d=a.bottom||a.top,l=e.y+(a.bottom?e.height:0)+(a.bottom?-10:10),p=a.bottom?"s":"n",u=a.top>0||a.bottom<0?-d:d,m=n.calculateAdjustments(s,"y",u,l),n.makeSpace(m.movingShapes,m.resizingShapes,{x:0,y:d},p)),(a.left||a.right)&&(d=a.right||a.left,l=e.x+(a.right?e.width:0)+(a.right?-10:100),p=a.right?"e":"w",u=a.left>0||a.right<0?-d:d,m=n.calculateAdjustments(c,"x",u,l),n.makeSpace(m.movingShapes,m.resizingShapes,{x:d,y:0},p))};var Fi="flowNodeRef",Bc="lanes";function io(e){this._elementRegistry=e}io.$inject=["elementRegistry"];io.prototype._computeUpdates=function(e,t){var n=[],i=[],o={},a=[];function r(l,p){var u=U(p),m={x:l.x+l.width/2,y:l.y+l.height/2};return m.x>u.left&&m.x<u.right&&m.y>u.top&&m.y<u.bottom}function s(l){n.indexOf(l)===-1&&(a.push(l),n.push(l))}function c(l){var p=yt(l);return o[p.id]||(o[p.id]=Sa(p)),o[p.id]}function d(l){if(!l.parent)return[];var p=c(l);return p.filter(function(u){return r(l,u)}).map(function(u){return u.businessObject})}return t.forEach(function(l){var p=yt(l);if(!(!p||n.indexOf(p)!==-1)){var u=p.children.filter(function(m){return _(m,"bpmn:FlowNode")});u.forEach(s),n.push(p)}}),e.forEach(s),a.forEach(function(l){var p=l.businessObject,u=p.get(Bc),m=u.slice(),h=d(l);i.push({flowNode:p,remove:m,add:h})}),t.forEach(function(l){var p=l.businessObject;l.parent||p.get(Fi).forEach(function(u){i.push({flowNode:u,remove:[p],add:[]})})}),i};io.prototype.execute=function(e){var t=e.updates;return t||(t=e.updates=this._computeUpdates(e.flowNodeShapes,e.laneShapes)),t.forEach(function(n){var i=n.flowNode,o=i.get(Bc);n.remove.forEach(function(a){qe(o,a),qe(a.get(Fi),i)}),n.add.forEach(function(a){Ve(o,a),Ve(a.get(Fi),i)})}),[]};io.prototype.revert=function(e){var t=e.updates;return t.forEach(function(n){var i=n.flowNode,o=i.get(Bc);n.add.forEach(function(a){qe(o,a),qe(a.get(Fi),i)}),n.remove.forEach(function(a){Ve(o,a),Ve(a.get(Fi),i)})}),[]};function Va(e){this._moddle=e}Va.$inject=["moddle"];Va.prototype.execute=function(e){var t=this._moddle.ids,n=e.id,i=e.element,o=e.claiming;return o?t.claim(n,i):t.unclaim(n),[]};Va.prototype.revert=function(e){var t=this._moddle.ids,n=e.id,i=e.element,o=e.claiming;return o?t.unclaim(n):t.claim(n,i),[]};var vy={fill:void 0,stroke:void 0};function Ac(e){this._commandStack=e,this._normalizeColor=function(t){if(t){if(pa(t)){var n=yy(t);if(n)return n}throw new Error(`invalid color value: ${t}`)}}}Ac.$inject=["commandStack"];Ac.prototype.postExecute=function(e){var t=e.elements,n=e.colors||vy,i=this,o={};"fill"in n&&C(o,{"background-color":this._normalizeColor(n.fill)}),"stroke"in n&&C(o,{"border-color":this._normalizeColor(n.stroke)}),T(t,function(a){var r=ye(a)?fn(o,["border-color"]):o,s=fe(a);if(wy(r),ce(a))i._commandStack.execute("element.updateModdleProperties",{element:a,moddleElement:s.label,properties:{color:o["border-color"]}});else{if(!Q(s,["bpmndi:BPMNEdge","bpmndi:BPMNShape"]))return;i._commandStack.execute("element.updateProperties",{element:a,properties:{di:r}})}})};function yy(e){var t=document.createElement("canvas").getContext("2d");return t.fillStyle="transparent",t.fillStyle=e,/^#[0-9a-fA-F]{6}$/.test(t.fillStyle)?t.fillStyle:null}function wy(e){"border-color"in e&&(e.stroke=e["border-color"]),"background-color"in e&&(e.fill=e["background-color"])}var Ey={width:0,height:0};function Um(e,t,n){function i(c,d){var l=c.label||c,p=c.labelTarget||c;return mf(l,d),[l,p]}function o(c){var d=c.element,l=d.businessObject,p=c.newLabel;if(!ce(d)&&Kn(d)&&!ua(d)&&!Tp(p)){var u=7,m=Ll(d);m={x:m.x,y:m.y+u},e.createLabel(d,m,{id:l.id+"_label",businessObject:l,di:d.di})}}function a(c){return c.oldLabel=Yt(c.element),i(c.element,c.newLabel)}function r(c){return i(c.element,c.oldLabel)}function s(c){var d=c.element,l=d.label||d,p=c.newLabel,u=c.newBounds,m=c.hints||{};if(!(!ce(l)&&!_(l,"bpmn:TextAnnotation"))){if(ce(l)&&Tp(p)){m.removeShape!==!1&&e.removeShape(l,{unsetLabel:!1});return}var h=Yt(d);typeof u>"u"&&(u=t.getExternalLabelBounds(l,h)),u&&e.resizeShape(l,u,Ey)}}this.preExecute=o,this.execute=a,this.revert=r,this.postExecute=s}Um.$inject=["modeling","textRenderer","bpmnFactory"];function Tp(e){return!e||!e.trim()}function et(e,t,n,i){ge.call(this,e,t,n),this._bpmnRules=i}z(et,ge);et.$inject=["eventBus","elementFactory","commandStack","bpmnRules"];et.prototype.getHandlers=function(){var e=ge.prototype.getHandlers.call(this);return e["element.updateModdleProperties"]=eo,e["element.updateProperties"]=to,e["canvas.updateRoot"]=za,e["lane.add"]=Cc,e["lane.resize"]=no,e["lane.split"]=Rc,e["lane.updateRefs"]=io,e["id.updateClaim"]=Va,e["element.setColor"]=Ac,e["element.updateLabel"]=Um,e};et.prototype.updateLabel=function(e,t,n,i){this._commandStack.execute("element.updateLabel",{element:e,newLabel:t,newBounds:n,hints:i||{}})};et.prototype.connect=function(e,t,n,i){var o=this._bpmnRules;if(n||(n=o.canConnect(e,t)),!!n)return this.createConnection(e,t,n,e.parent,i)};et.prototype.updateModdleProperties=function(e,t,n){this._commandStack.execute("element.updateModdleProperties",{element:e,moddleElement:t,properties:n})};et.prototype.updateProperties=function(e,t){this._commandStack.execute("element.updateProperties",{element:e,properties:t})};et.prototype.resizeLane=function(e,t,n){this._commandStack.execute("lane.resize",{shape:e,newBounds:t,balanced:n})};et.prototype.addLane=function(e,t){var n={shape:e,location:t};return this._commandStack.execute("lane.add",n),n.newLane};et.prototype.splitLane=function(e,t){this._commandStack.execute("lane.split",{shape:e,count:t})};et.prototype.makeCollaboration=function(){var e=this._create("root",{type:"bpmn:Collaboration"}),t={newRoot:e};return this._commandStack.execute("canvas.updateRoot",t),e};et.prototype.makeProcess=function(){var e=this._create("root",{type:"bpmn:Process"}),t={newRoot:e};return this._commandStack.execute("canvas.updateRoot",t),e};et.prototype.updateLaneRefs=function(e,t){this._commandStack.execute("lane.updateRefs",{flowNodeShapes:e,laneShapes:t})};et.prototype.claimId=function(e,t){this._commandStack.execute("id.updateClaim",{id:e,element:t,claiming:!0})};et.prototype.unclaimId=function(e,t){this._commandStack.execute("id.updateClaim",{id:e,element:t})};et.prototype.setColor=function(e,t){e.length||(e=[e]),this._commandStack.execute("element.setColor",{elements:e,colors:t})};function Ym(){}Ym.prototype.layoutConnection=function(e,t){return t=t||{},[t.connectionStart||Z(t.source||e.source),t.connectionEnd||Z(t.target||e.target)]};var Mo=20,xy=5,na=Math.round,Mp=20,Py={"h:h":20,"v:v":20,"h:v":-10,"v:h":-10};function Sy(e,t){return!{t:/top/,r:/right/,b:/bottom/,l:/left/,h:/./,v:/./}[t].test(e)}function Ty(e,t){return{t:/top/,r:/right/,b:/bottom/,l:/left/,h:/left|right/,v:/top|bottom/}[e].test(t)}function Km(e,t,n){var i=Qe(t,e,xy),o=n.split(":")[0],a=na((t.x-e.x)/2+e.x),r=na((t.y-e.y)/2+e.y),s,c,d=Ty(o,i),l=/h|r|l/.test(o),p=!1,u=!1;return d?(s=l?{x:a,y:e.y}:{x:e.x,y:r},c=l?"h:h":"v:v"):(p=Sy(i,o),c=l?"h:v":"v:h",p?l?(u=r===e.y,s={x:e.x+Mo*(/l/.test(o)?-1:1),y:u?r+Mo:r}):(u=a===e.x,s={x:u?a+Mo:a,y:e.y+Mo*(/t/.test(o)?-1:1)}):s={x:a,y:r}),{waypoints:kc(e,s,c).concat(s),directions:c,turnNextDirections:u}}function My(e,t,n){return Km(e,t,n)}function Ny(e,t,n){var i=Km(t,e,Np(n));return{waypoints:i.waypoints.slice().reverse(),directions:Np(i.directions),turnNextDirections:i.turnNextDirections}}function Cy(e,t){var n=e.directions.split(":")[1],i=t.directions.split(":")[0];e.turnNextDirections&&(n=n=="h"?"v":"h"),t.turnNextDirections&&(i=i=="h"?"v":"h");var o=n+":"+i,a=kc(e.waypoints[e.waypoints.length-1],t.waypoints[0],o);return{waypoints:a,directions:o}}function Np(e){return e.split(":").reverse().join(":")}function Ry(e,t,n){var i=na((t.x-e.x)/2+e.x),o=na((t.y-e.y)/2+e.y);if(n==="h:v")return[{x:t.x,y:e.y}];if(n==="v:h")return[{x:e.x,y:t.y}];if(n==="h:h")return[{x:i,y:e.y},{x:i,y:t.y}];if(n==="v:v")return[{x:e.x,y:o},{x:t.x,y:o}];throw new Error("invalid directions: can only handle varians of [hv]:[hv]")}function kc(e,t,n){if(n=n||"h:h",!Gy(n))throw new Error("unknown directions: <"+n+">: must be specified as <start>:<end> with start/end in { h,v,t,r,b,l }");if(Zm(n)){var i=My(e,t,n),o=Ny(e,t,n),a=Cy(i,o);return[].concat(i.waypoints,a.waypoints,o.waypoints)}return Ry(e,t,n)}function By(e,t,n){var i=kc(e,t,n);return i.unshift(e),i.push(t),Xm(i)}function Ay(e,t,n,i,o){var a=o&&o.preferredLayouts||[],r=hf(a,"straight")[0]||"h:h",s=Py[r]||0,c=Qe(e,t,s),d=Ly(c,r);n=n||Z(e),i=i||Z(t);var l=d.split(":"),p=Rp(n,e,l[0],jy(c)),u=Rp(i,t,l[1],c);return By(p,u,d)}function ky(e,t,n,i,o,a){se(n)&&(o=n,a=i,n=Z(e),i=Z(t)),a=C({preferredLayouts:[]},a),o=o||[];var r=a.preferredLayouts,s=r.indexOf("straight")!==-1,c;return c=s&&Iy(e,t,n,i,a),c||(c=a.connectionEnd&&Oy(t,e,i,o),c)||(c=a.connectionStart&&Fy(e,t,n,o),c)?c:!a.connectionStart&&!a.connectionEnd&&o&&o.length?o:Ay(e,t,n,i,a)}function Dy(e,t,n){return e>=t&&e<=n}function Cp(e,t,n){var i={x:"width",y:"height"};return Dy(t[e],n[e],n[e]+n[i[e]])}function Iy(e,t,n,i,o){var a={},r,s;return s=Qe(e,t),/^(top|bottom|left|right)$/.test(s)?(/top|bottom/.test(s)&&(r="x"),/left|right/.test(s)&&(r="y"),o.preserveDocking==="target"?Cp(r,i,e)?(a[r]=i[r],[{x:a.x!==void 0?a.x:n.x,y:a.y!==void 0?a.y:n.y,original:{x:a.x!==void 0?a.x:n.x,y:a.y!==void 0?a.y:n.y}},{x:i.x,y:i.y}]):null:Cp(r,n,t)?(a[r]=n[r],[{x:n.x,y:n.y},{x:a.x!==void 0?a.x:i.x,y:a.y!==void 0?a.y:i.y,original:{x:a.x!==void 0?a.x:i.x,y:a.y!==void 0?a.y:i.y}}]):null):null}function Fy(e,t,n,i){return Dc(e,t,n,i)}function Oy(e,t,n,i){var o=i.slice().reverse();return o=Dc(e,t,n,o),o?o.reverse():null}function Dc(e,t,n,i){function o(l){return l.length<3?!0:l.length>4?!1:!!Te(l,function(p,u){var m=l[u-1];return m&&kl(p,m)<3})}function a(l,p,u){var m=Vt(p,l);switch(m){case"v":return{x:u.x,y:l.y};case"h":return{x:l.x,y:u.y}}return{x:l.x,y:l.y}}function r(l,p,u){var m;for(m=l.length-2;m!==0;m--)if(Uc(l[m],p,Mp)||Uc(l[m],u,Mp))return l.slice(m);return l}if(o(i))return null;var s=i[0],c=i.slice(),d;return c[0]=n,c[1]=a(c[1],s,n),d=r(c,e,t),d!==c&&(c=Dc(e,t,n,d)),c&&Vt(c)?null:c}function Ly(e,t){if(Zm(t))return t;switch(e){case"intersect":return"t:t";case"top":case"bottom":return"v:v";case"left":case"right":return"h:h";default:return t}}function Gy(e){return e&&/^h|v|t|r|b|l:h|v|t|r|b|l$/.test(e)}function Zm(e){return e&&/t|r|b|l/.test(e)}function jy(e){return{top:"bottom",bottom:"top",left:"right",right:"left","top-left":"bottom-right","bottom-right":"top-left","top-right":"bottom-left","bottom-left":"top-right"}[e]}function Rp(e,t,n,i){if(n==="h"&&(n=/left/.test(i)?"l":"r"),n==="v"&&(n=/top/.test(i)?"t":"b"),n==="t")return{original:e,x:e.x,y:t.y};if(n==="r")return{original:e,x:t.x+t.width,y:e.y};if(n==="b")return{original:e,x:e.x,y:t.y+t.height};if(n==="l")return{original:e,x:t.x,y:e.y};throw new Error("unexpected dockingDirection: <"+n+">")}function Xm(e){return e.reduce(function(t,n,i){var o=t[t.length-1],a=e[i+1];return Dl(o,a,n,0)||t.push(n),t},[])}var $y=-10,qy=40,Hy={default:["h:h"],fromGateway:["v:h"],toGateway:["h:v"],loop:{fromTop:["t:r"],fromRight:["r:b"],fromLeft:["l:t"],fromBottom:["b:l"]},boundaryLoop:{alternateHorizontalSide:"b",alternateVerticalSide:"l",default:"v"},messageFlow:["straight","v:v"],subProcess:["straight","h:h"],isHorizontal:!0},zy={default:["v:v"],fromGateway:["h:v"],toGateway:["v:h"],loop:{fromTop:["t:l"],fromRight:["r:t"],fromLeft:["l:b"],fromBottom:["b:r"]},boundaryLoop:{alternateHorizontalSide:"t",alternateVerticalSide:"r",default:"h"},messageFlow:["straight","h:h"],subProcess:["straight","v:v"],isHorizontal:!1},Ic={top:"bottom","top-right":"bottom-left","top-left":"bottom-right",right:"left",bottom:"top","bottom-right":"top-left","bottom-left":"top-right",left:"right"},Si={top:"t",right:"r",bottom:"b",left:"l"};function Wa(e){this._elementRegistry=e}z(Wa,Ym);Wa.prototype.layoutConnection=function(e,t){t||(t={});var n=t.source||e.source,i=t.target||e.target,o=t.waypoints||e.waypoints,a=t.connectionStart,r=t.connectionEnd,s=this._elementRegistry,c,d;if(a||(a=Bp(o&&o[0],n)),r||(r=Bp(o&&o[o.length-1],i)),(_(e,"bpmn:Association")||_(e,"bpmn:DataAssociation"))&&o&&!Ap(n,i))return[].concat([a],o.slice(1,-1),[r]);var l=Eu(n,s)?Hy:zy;return _(e,"bpmn:MessageFlow")?c=Wy(n,i,l):(_(e,"bpmn:SequenceFlow")||Ap(n,i))&&(n===i?c={preferredLayouts:Jy(n,e,l)}:_(n,"bpmn:BoundaryEvent")?c={preferredLayouts:Qy(n,i,r,l)}:Oi(n)||Oi(i)?c={preferredLayouts:l.subProcess,preserveDocking:Yy(n)}:_(n,"bpmn:Gateway")?c={preferredLayouts:l.fromGateway}:_(i,"bpmn:Gateway")?c={preferredLayouts:l.toGateway}:c={preferredLayouts:l.default}),c&&(c=C(c,t),d=Xm(ky(n,i,a,r,o,c))),d||[a,r]};function Vy(e){var t=e.host;return Qe(Z(e),t,$y)}function Wy(e,t,n){return{preferredLayouts:n.messageFlow,preserveDocking:Uy(e,t)}}function Uy(e,t){return _(t,"bpmn:Participant")?"source":_(e,"bpmn:Participant")?"target":Oi(t)?"source":Oi(e)||_(t,"bpmn:Event")?"target":_(e,"bpmn:Event")?"source":null}function Yy(e){return Oi(e)?"target":"source"}function Bp(e,t){return e?e.original||e:Z(t)}function Ap(e,t){return _(t,"bpmn:Activity")&&_(e,"bpmn:BoundaryEvent")&&t.businessObject.isForCompensation}function Oi(e){return _(e,"bpmn:SubProcess")&&pe(e)}function Dn(e,t){return e===t}function Ky(e,t){return t.indexOf(e)!==-1}function ni(e){var t=/right|left/.exec(e);return t&&t[0]}function ii(e){var t=/top|bottom/.exec(e);return t&&t[0]}function kp(e,t){return Ic[e]===t}function Zy(e,t){var n=ni(e),i=Ic[n];return t.indexOf(i)!==-1}function Xy(e,t){var n=ii(e),i=Ic[n];return t.indexOf(i)!==-1}function Jm(e){return e==="right"||e==="left"}function Jy(e,t,n){var i=t.waypoints,o=i&&i.length&&Qe(i[0],e);return o==="top"?n.loop.fromTop:o==="right"?n.loop.fromRight:o==="left"?n.loop.fromLeft:n.loop.fromBottom}function Qy(e,t,n,i){var o=Z(e),a=Z(t),r=Vy(e),s,c,d=Dn(e.host,t),l=Ky(r,["top","right","bottom","left"]),p=Qe(a,o,{x:e.width/2+t.width/2,y:e.height/2+t.height/2});return d?ew(r,l,e,t,n,i):(s=tw(r,p,l,i.isHorizontal),c=nw(r,p,l,i.isHorizontal),[s+":"+c])}function ew(e,t,n,i,o,a){var r=t?e:a.isHorizontal?ii(e):ni(e),s=Si[r],c;return t?Jm(e)?c=Dp("y",n,i,o)?"h":a.boundaryLoop.alternateHorizontalSide:c=Dp("x",n,i,o)?"v":a.boundaryLoop.alternateVerticalSide:c=a.boundaryLoop.default,[s+":"+c]}function Dp(e,t,n,i){var o=qy;return!(hr(e,i,n,o)||hr(e,i,{x:n.x+n.width,y:n.y+n.height},o)||hr(e,i,Z(t),o))}function hr(e,t,n,i){return Math.abs(t[e]-n[e])<i}function tw(e,t,n,i){if(n)return Si[e];var o=ii(e),a=ni(e),r=ii(t),s=ni(t);if(i){if(Dn(o,r)||kp(a,s))return Si[o]}else if(Dn(a,s)||kp(o,r))return Si[a];return Si[i?a:o]}function nw(e,t,n,i){return n?Jm(e)?Zy(e,t)||Dn(e,t)?"h":"v":Xy(e,t)||Dn(e,t)?"v":"h":i?Dn(ii(e),ii(t))?"h":"v":Dn(ni(e),ni(t))?"v":"h"}Wa.$inject=["elementRegistry"];function Ip(e){return C({original:e.point.original||e.point},e.actual)}function xn(e,t){this._elementRegistry=e,this._graphicsFactory=t}xn.$inject=["elementRegistry","graphicsFactory"];xn.prototype.getCroppedWaypoints=function(e,t,n){t=t||e.source,n=n||e.target;var i=this.getDockingPoint(e,t,!0),o=this.getDockingPoint(e,n),a=e.waypoints.slice(i.idx+1,o.idx);return a.unshift(Ip(i)),a.push(Ip(o)),a};xn.prototype.getDockingPoint=function(e,t,n){var i=e.waypoints,o,a,r;return o=n?0:i.length-1,a=i[o],r=this._getIntersection(t,e,n),{point:a,actual:r||a,idx:o}};xn.prototype._getIntersection=function(e,t,n){var i=this._getShapePath(e),o=this._getConnectionPath(t);return Tr(i,o,n)};xn.prototype._getConnectionPath=function(e){return this._graphicsFactory.getConnectionPath(e)};xn.prototype._getShapePath=function(e){return this._graphicsFactory.getShapePath(e)};xn.prototype._getGfx=function(e){return this._elementRegistry.getGraphics(e)};const Qm={__init__:["modeling","bpmnUpdater"],__depends__:[Xb,fv,_v,bv,km,Wv,Yv,ey,Jt,Gl,Fm],bpmnFactory:["type",Tt],bpmnUpdater:["type",lt],elementFactory:["type",yn],modeling:["type",et],layouter:["type",Wa],connectionDocking:["type",xn]},Fp=Math.round;function Ua(e,t,n,i,o,a){this._complexPreview=e,this._connectionDocking=t,this._elementFactory=n,this._eventBus=i,this._layouter=o,this._rules=a}Ua.prototype.create=function(e,t,n){const i=this._complexPreview,o=this._connectionDocking,a=this._elementFactory,r=this._eventBus,s=this._layouter,c=this._rules,d=a.createShape(C({type:t},n)),l=r.fire("autoPlace",{source:e,shape:d});if(!l)return;C(d,{x:l.x-Fp(d.width/2),y:l.y-Fp(d.height/2)});const p=c.allowed("connection.create",{source:e,target:d,hints:{targetParent:e.parent}});let u=null;p&&(u=a.createConnection(p),u.waypoints=s.layoutConnection(u,{source:e,target:d}),u.waypoints=o.getCroppedWaypoints(u,e,d)),i.create({created:[d,u].filter(m=>!Sr(m))})};Ua.prototype.cleanUp=function(){this._complexPreview.cleanUp()};Ua.$inject=["complexPreview","connectionDocking","elementFactory","eventBus","layouter","rules"];const iw={__depends__:[Ms,T_,Qm],__init__:["appendPreview"],appendPreview:["type",Ua]},Ya=Object.prototype.toString,ow=Object.prototype.hasOwnProperty;function aw(e){return e===void 0}function rw(e){return e==null}function eh(e){return Ya.call(e)==="[object Array]"}function sw(e){return Ya.call(e)==="[object Object]"}function ia(e){return Ya.call(e)==="[object Number]"}function qo(e){const t=Ya.call(e);return t==="[object Function]"||t==="[object AsyncFunction]"||t==="[object GeneratorFunction]"||t==="[object AsyncGeneratorFunction]"||t==="[object Proxy]"}function cw(e,t){return!rw(e)&&ow.call(e,t)}function Ho(e,t){let n,i;if(aw(e))return;const o=eh(e)?pw:dw;for(let a in e)if(cw(e,a)&&(n=e[a],i=t(n,o(a)),i===!1))return n}function dw(e){return e}function pw(e){return Number(e)}function Op(e,...t){return Object.assign(e,...t)}function lw(e,t){return t.forEach(function(n){n&&typeof n!="string"&&!Array.isArray(n)&&Object.keys(n).forEach(function(i){if(i!=="default"&&!(i in e)){var o=Object.getOwnPropertyDescriptor(n,i);Object.defineProperty(e,i,o.get?o:{enumerable:!0,get:function(){return n[i]}})}})}),Object.freeze(e)}function uw(e,t,n){var i=n?e:e.parentNode;return i&&typeof i.closest=="function"&&i.closest(t)||null}function mw(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var No={},Lp;function hw(){if(Lp)return No;Lp=1;var e,t,n;function i(){e=window.addEventListener?"addEventListener":"attachEvent",t=window.removeEventListener?"removeEventListener":"detachEvent",n=e!=="addEventListener"?"on":""}return No.bind=function(o,a,r,s){return e||i(),o[e](n+a,r,s||!1),r},No.unbind=function(o,a,r,s){return t||i(),o[t](n+a,r,s||!1),r},No}var th=hw(),fw=mw(th),nh=lw({__proto__:null,default:fw},[th]),ih=["focus","blur"];function gw(e,t,n,i,o){return ih.indexOf(n)!==-1&&(o=!0),nh.bind(e,n,function(a){var r=a.target||a.srcElement;a.delegateTarget=uw(r,t,!0),a.delegateTarget&&i.call(e,a)},o)}function _w(e,t,n,i){return ih.indexOf(t)!==-1&&(i=!0),nh.unbind(e,t,n,i)}var Gp={bind:gw,unbind:_w};function bw(e,t){return t=t||document,t.querySelector(e)}function vw(e,t){return t=t||document,t.querySelectorAll(e)}function yw(e){return e.originalEvent||e.srcEvent}function oh(e,t){return(yw(e)||e).button===t}function ah(e){return oh(e,0)}function ww(e){return oh(e,1)}function Ew(e,t){if(e.ownerDocument!==t.ownerDocument)try{return t.ownerDocument.importNode(e,!0)}catch{}return e}function xw(e,t){return t.appendChild(Ew(e,t))}function Pw(e,t){return xw(t,e),e}var Xr=2,rh={"alignment-baseline":1,"baseline-shift":1,clip:1,"clip-path":1,"clip-rule":1,color:1,"color-interpolation":1,"color-interpolation-filters":1,"color-profile":1,"color-rendering":1,cursor:1,direction:1,display:1,"dominant-baseline":1,"enable-background":1,fill:1,"fill-opacity":1,"fill-rule":1,filter:1,"flood-color":1,"flood-opacity":1,font:1,"font-family":1,"font-size":Xr,"font-size-adjust":1,"font-stretch":1,"font-style":1,"font-variant":1,"font-weight":1,"glyph-orientation-horizontal":1,"glyph-orientation-vertical":1,"image-rendering":1,kerning:1,"letter-spacing":1,"lighting-color":1,marker:1,"marker-end":1,"marker-mid":1,"marker-start":1,mask:1,opacity:1,overflow:1,"pointer-events":1,"shape-rendering":1,"stop-color":1,"stop-opacity":1,stroke:1,"stroke-dasharray":1,"stroke-dashoffset":1,"stroke-linecap":1,"stroke-linejoin":1,"stroke-miterlimit":1,"stroke-opacity":1,"stroke-width":Xr,"text-anchor":1,"text-decoration":1,"text-rendering":1,"unicode-bidi":1,visibility:1,"word-spacing":1,"writing-mode":1};function Sw(e,t){return rh[t]?e.style[t]:e.getAttributeNS(null,t)}function Tw(e,t,n){var i=t.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),o=rh[i];o?(o===Xr&&typeof n=="number"&&(n=String(n)+"px"),e.style[i]=n):e.setAttributeNS(null,t,n)}function Mw(e,t){var n=Object.keys(t),i,o;for(i=0,o;o=n[i];i++)Tw(e,o,t[o])}function Ni(e,t,n){return typeof t=="string"?Sw(e,t):(Mw(e,t),e)}var Fc={svg:"http://www.w3.org/2000/svg"},jp='<svg xmlns="'+Fc.svg+'"';function Nw(e){var t=!1;e.substring(0,4)==="<svg"?e.indexOf(Fc.svg)===-1&&(e=jp+e.substring(4)):(e=jp+">"+e+"</svg>",t=!0);var n=Cw(e);if(!t)return n;for(var i=document.createDocumentFragment(),o=n.firstChild;o.firstChild;)i.appendChild(o.firstChild);return i}function Cw(e){var t;return t=new DOMParser,t.async=!1,t.parseFromString(e,"text/xml")}function sh(e,t){var n;return e=e.trim(),e.charAt(0)==="<"?(n=Nw(e).firstChild,n=document.importNode(n,!0)):n=document.createElementNS(Fc.svg,e),t&&Ni(n,t),n}function Rw(e){var t=e.parentNode;return t&&t.removeChild(e),e}function Bw(e){return e.flat().join(",").replace(/,?([A-Za-z]),?/g,"$1")}function Aw(e){return["M",e.x,e.y]}function fr(e){return["L",e.x,e.y]}function kw(e,t,n){return["C",e.x,e.y,t.x,t.y,n.x,n.y]}function Dw(e,t){const n=e.length,i=[Aw(e[0])];for(let o=1;o<n;o++){const a=e[o-1],r=e[o],s=e[o+1];if(!s||!t){i.push(fr(r));continue}const c=Math.min(t,Jr(r.x-a.x,r.y-a.y),Jr(s.x-r.x,s.y-r.y));if(!c){i.push(fr(r));continue}const d=Co(r,a,c),l=Co(r,a,c*.5),p=Co(r,s,c),u=Co(r,s,c*.5);i.push(fr(d)),i.push(kw(l,u,p))}return i}function Co(e,t,n){const i=t.x-e.x,o=t.y-e.y,a=Jr(i,o),r=n/a;return{x:e.x+i*r,y:e.y+o*r}}function Jr(e,t){return Math.sqrt(Math.pow(e,2)+Math.pow(t,2))}function Iw(e,t,n){ia(t)&&(n=t,t=null),t||(t={});const i=sh("path",t);return ia(n)&&(i.dataset.cornerRadius=String(n)),ch(i,e)}function ch(e,t){const n=parseInt(e.dataset.cornerRadius,10)||0;return Ni(e,{d:Bw(Dw(t,n))}),e}function Fw(e){return!0}function Ro(e){return ah(e)||ww(e)}var $p=500;function dh(e,t,n){var i=this;function o(N,R,B){if(!s(N,R)){var S,k,W;B?k=t.getGraphics(B):(S=R.delegateTarget||R.target,S&&(k=S,B=t.get(k))),!(!k||!B)&&(W=e.fire(N,{element:B,gfx:k,originalEvent:R}),W===!1&&(R.stopPropagation(),R.preventDefault()))}}var a={};function r(N){return a[N]}function s(N,R){var B=d[N]||ah;return!B(R)}var c={click:"element.click",contextmenu:"element.contextmenu",dblclick:"element.dblclick",mousedown:"element.mousedown",mousemove:"element.mousemove",mouseover:"element.hover",mouseout:"element.out",mouseup:"element.mouseup"},d={"element.contextmenu":Fw,"element.mousedown":Ro,"element.mouseup":Ro,"element.click":Ro,"element.dblclick":Ro};function l(N,R,B){var S=c[N];if(!S)throw new Error("unmapped DOM event name <"+N+">");return o(S,R,B)}var p="svg, .djs-element";function u(N,R,B,S){var k=a[B]=function(W){o(B,W)};S&&(d[B]=S),k.$delegate=Gp.bind(N,p,R,k)}function m(N,R,B){var S=r(B);S&&Gp.unbind(N,R,S.$delegate)}function h(N){Ho(c,function(R,B){u(N,B,R)})}function g(N){Ho(c,function(R,B){m(N,B,R)})}e.on("canvas.destroy",function(N){g(N.svg)}),e.on("canvas.init",function(N){h(N.svg)}),e.on(["shape.added","connection.added"],function(N){var R=N.element,B=N.gfx;e.fire("interactionEvents.createHit",{element:R,gfx:B})}),e.on(["shape.changed","connection.changed"],$p,function(N){var R=N.element,B=N.gfx;e.fire("interactionEvents.updateHit",{element:R,gfx:B})}),e.on("interactionEvents.createHit",$p,function(N){var R=N.element,B=N.gfx;i.createDefaultHit(R,B)}),e.on("interactionEvents.updateHit",function(N){var R=N.element,B=N.gfx;i.updateDefaultHit(R,B)});var f=P("djs-hit djs-hit-stroke"),w=P("djs-hit djs-hit-click-stroke"),E=P("djs-hit djs-hit-all"),v=P("djs-hit djs-hit-no-move"),y={all:E,"click-stroke":w,stroke:f,"no-move":v};function P(N,R){return R=Op({stroke:"white",strokeWidth:15},R||{}),n.cls(N,["no-fill","no-border"],R)}function x(N,R){var B=y[R];if(!B)throw new Error("invalid hit type <"+R+">");return Ni(N,B),N}function I(N,R){Pw(N,R)}this.removeHits=function(N){var R=vw(".djs-hit",N);Ho(R,Rw)},this.createDefaultHit=function(N,R){var B=N.waypoints,S=N.isFrame,k;return B?this.createWaypointsHit(R,B):(k=S?"stroke":"all",this.createBoxHit(R,k,{width:N.width,height:N.height}))},this.createWaypointsHit=function(N,R){var B=Iw(R);return x(B,"stroke"),I(N,B),B},this.createBoxHit=function(N,R,B){B=Op({x:0,y:0},B);var S=sh("rect");return x(S,R),Ni(S,B),I(N,S),S},this.updateDefaultHit=function(N,R){var B=bw(".djs-hit",R);if(B)return N.waypoints?ch(B,N.waypoints):Ni(B,{width:N.width,height:N.height}),B},this.fire=o,this.triggerMouseEvent=l,this.mouseHandler=r,this.registerEvent=u,this.unregisterEvent=m}dh.$inject=["eventBus","elementRegistry","styles"];const Ow={__init__:["interactionEvents"],interactionEvents:["type",dh]},ph=Object.prototype.toString,Lw=Object.prototype.hasOwnProperty;function Gw(e){return e===void 0}function jw(e){return e==null}function $w(e){return ph.call(e)==="[object Array]"}function qw(e){const t=ph.call(e);return t==="[object Function]"||t==="[object AsyncFunction]"||t==="[object GeneratorFunction]"||t==="[object AsyncGeneratorFunction]"||t==="[object Proxy]"}function Hw(e,t){return!jw(e)&&Lw.call(e,t)}function zw(e,t){const n=Vw(t);let i;return lh(e,function(o,a){if(n(o,a))return i=o,!1}),i}function lh(e,t){let n,i;if(Gw(e))return;const o=$w(e)?Uw:Ww;for(let a in e)if(Hw(e,a)&&(n=e[a],i=t(n,o(a)),i===!1))return n}function Vw(e){return qw(e)?e:t=>t===e}function Ww(e){return e}function Uw(e){return Number(e)}function oa(e,t){return e.bind(t)}function zo(e,...t){return Object.assign(e,...t)}function qp(e,t){let n={},i=Object(e);return lh(t,function(o){o in i&&(n[o]=e[o])}),n}const $e={legend:[1,"<fieldset>","</fieldset>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],_default:[0,"",""]};$e.td=$e.th=[3,"<table><tbody><tr>","</tr></tbody></table>"];$e.option=$e.optgroup=[1,'<select multiple="multiple">',"</select>"];$e.thead=$e.tbody=$e.colgroup=$e.caption=$e.tfoot=[1,"<table>","</table>"];$e.polyline=$e.ellipse=$e.polygon=$e.circle=$e.text=$e.line=$e.path=$e.rect=$e.g=[1,'<svg xmlns="http://www.w3.org/2000/svg" version="1.1">',"</svg>"];function Yw(e,t=globalThis.document){var d;if(typeof e!="string")throw new TypeError("String expected");const n=/^<!--(.*?)-->$/s.exec(e);if(n)return t.createComment(n[1]);const i=(d=/<([\w:]+)/.exec(e))==null?void 0:d[1];if(!i)return t.createTextNode(e);if(e=e.trim(),i==="body"){const l=t.createElement("html");l.innerHTML=e;const{lastChild:p}=l;return p.remove(),p}let[o,a,r]=Object.hasOwn($e,i)?$e[i]:$e._default,s=t.createElement("div");for(s.innerHTML=a+e+r;o--;)s=s.lastChild;if(s.firstChild===s.lastChild){const{firstChild:l}=s;return l.remove(),l}const c=t.createDocumentFragment();return c.append(...s.childNodes),c}var Kw=Yw;const uh=Vh(Kw);function Zw(e,t){return t.forEach(function(n){n&&typeof n!="string"&&!Array.isArray(n)&&Object.keys(n).forEach(function(i){if(i!=="default"&&!(i in e)){var o=Object.getOwnPropertyDescriptor(n,i);Object.defineProperty(e,i,o.get?o:{enumerable:!0,get:function(){return n[i]}})}})}),Object.freeze(e)}function Xw(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Bo={},Hp;function Jw(){if(Hp)return Bo;Hp=1;var e,t,n;function i(){e=window.addEventListener?"addEventListener":"attachEvent",t=window.removeEventListener?"removeEventListener":"detachEvent",n=e!=="addEventListener"?"on":""}return Bo.bind=function(o,a,r,s){return e||i(),o[e](n+a,r,s||!1),r},Bo.unbind=function(o,a,r,s){return t||i(),o[t](n+a,r,s||!1),r},Bo}var mh=Jw(),Qw=Xw(mh),mt=Zw({__proto__:null,default:Qw},[mh]);function e0(e,t){return t=t||document,t.querySelector(e)}function Qr(e){e.parentNode&&e.parentNode.removeChild(e)}var zp=Math.min,Vp=Math.max;function gr(e){e.preventDefault()}function Ci(e){e.stopPropagation()}function t0(e){return e.nodeType===Node.TEXT_NODE}function n0(e){return[].slice.call(e)}function kt(e){this.container=e.container,this.parent=uh('<div class="djs-direct-editing-parent"><div class="djs-direct-editing-content" contenteditable="true"></div></div>'),this.content=e0("[contenteditable]",this.parent),this.keyHandler=e.keyHandler||function(){},this.resizeHandler=e.resizeHandler||function(){},this.autoResize=oa(this.autoResize,this),this.handlePaste=oa(this.handlePaste,this)}kt.prototype.create=function(e,t,n,i){var o=this,a=this.parent,r=this.content,s=this.container;i=this.options=i||{},t=this.style=t||{};var c=qp(t,["width","height","maxWidth","maxHeight","minWidth","minHeight","left","top","backgroundColor","position","overflow","border","wordWrap","textAlign","outline","transform"]);zo(a.style,{width:e.width+"px",height:e.height+"px",maxWidth:e.maxWidth+"px",maxHeight:e.maxHeight+"px",minWidth:e.minWidth+"px",minHeight:e.minHeight+"px",left:e.x+"px",top:e.y+"px",backgroundColor:"#ffffff",position:"absolute",overflow:"visible",border:"1px solid #ccc",boxSizing:"border-box",wordWrap:"normal",textAlign:"center",outline:"none"},c);var d=qp(t,["fontFamily","fontSize","fontWeight","lineHeight","padding","paddingTop","paddingRight","paddingBottom","paddingLeft"]);return zo(r.style,{boxSizing:"border-box",width:"100%",outline:"none",wordWrap:"break-word"},d),i.centerVertically&&zo(r.style,{position:"absolute",top:"50%",transform:"translate(0, -50%)"},d),r.innerText=n,mt.bind(r,"keydown",this.keyHandler),mt.bind(r,"mousedown",Ci),mt.bind(r,"paste",o.handlePaste),i.autoResize&&mt.bind(r,"input",this.autoResize),i.resizable&&this.resizable(t),s.appendChild(a),this.setSelection(r.lastChild,r.lastChild&&r.lastChild.length),a};kt.prototype.handlePaste=function(e){var t=this.options,n=this.style;e.preventDefault();var i;if(e.clipboardData?i=e.clipboardData.getData("text/plain"):i=window.clipboardData.getData("Text"),this.insertText(i),t.autoResize){var o=this.autoResize(n);o&&this.resizeHandler(o)}};kt.prototype.insertText=function(e){e=i0(e);var t=document.execCommand("insertText",!1,e);t||this._insertTextIE(e)};kt.prototype._insertTextIE=function(e){var t=this.getSelection(),n=t.startContainer,i=t.endContainer,o=t.startOffset,a=t.endOffset,r=t.commonAncestorContainer,s=n0(r.childNodes),c,d;if(t0(r)){var l=n.textContent;n.textContent=l.substring(0,o)+e+l.substring(a),c=n,d=o+e.length}else if(n===this.content&&i===this.content){var p=document.createTextNode(e);this.content.insertBefore(p,s[o]),c=p,d=p.textContent.length}else{var u=s.indexOf(n),m=s.indexOf(i);s.forEach(function(h,g){g===u?h.textContent=n.textContent.substring(0,o)+e+i.textContent.substring(a):g>u&&g<=m&&Qr(h)}),c=n,d=o+e.length}c&&d!==void 0&&setTimeout(function(){self.setSelection(c,d)})};kt.prototype.autoResize=function(){var e=this.parent,t=this.content,n=parseInt(this.style.fontSize)||12;if(t.scrollHeight>e.offsetHeight||t.scrollHeight<e.offsetHeight-n){var i=e.getBoundingClientRect(),o=t.scrollHeight;e.style.height=o+"px",this.resizeHandler({width:i.width,height:i.height,dx:0,dy:o-i.height})}};kt.prototype.resizable=function(){var e=this,t=this.parent,n=this.resizeHandle,i=parseInt(this.style.minWidth)||0,o=parseInt(this.style.minHeight)||0,a=parseInt(this.style.maxWidth)||1/0,r=parseInt(this.style.maxHeight)||1/0;if(!n){n=this.resizeHandle=uh('<div class="djs-direct-editing-resize-handle"></div>');var s,c,d,l,p=function(h){gr(h),Ci(h),s=h.clientX,c=h.clientY;var g=t.getBoundingClientRect();d=g.width,l=g.height,mt.bind(document,"mousemove",u),mt.bind(document,"mouseup",m)},u=function(h){gr(h),Ci(h);var g=zp(Vp(d+h.clientX-s,i),a),f=zp(Vp(l+h.clientY-c,o),r);t.style.width=g+"px",t.style.height=f+"px",e.resizeHandler({width:d,height:l,dx:h.clientX-s,dy:h.clientY-c})},m=function(h){gr(h),Ci(h),mt.unbind(document,"mousemove",u,!1),mt.unbind(document,"mouseup",m,!1)};mt.bind(n,"mousedown",p)}zo(n.style,{position:"absolute",bottom:"0px",right:"0px",cursor:"nwse-resize",width:"0",height:"0",borderTop:(parseInt(this.style.fontSize)/4||3)+"px solid transparent",borderRight:(parseInt(this.style.fontSize)/4||3)+"px solid #ccc",borderBottom:(parseInt(this.style.fontSize)/4||3)+"px solid #ccc",borderLeft:(parseInt(this.style.fontSize)/4||3)+"px solid transparent"}),t.appendChild(n)};kt.prototype.destroy=function(){var e=this.parent,t=this.content,n=this.resizeHandle;t.innerText="",e.removeAttribute("style"),t.removeAttribute("style"),mt.unbind(t,"keydown",this.keyHandler),mt.unbind(t,"mousedown",Ci),mt.unbind(t,"input",this.autoResize),mt.unbind(t,"paste",this.handlePaste),n&&(n.removeAttribute("style"),Qr(n)),Qr(e)};kt.prototype.getValue=function(){return this.content.innerText.trim()};kt.prototype.getSelection=function(){var e=window.getSelection(),t=e.getRangeAt(0);return t};kt.prototype.setSelection=function(e,t){var n=document.createRange();e===null?n.selectNodeContents(this.content):(n.setStart(e,t),n.setEnd(e,t));var i=window.getSelection();i.removeAllRanges(),i.addRange(n)};function i0(e){return e.replace(/\r\n|\r|\n/g,`
`)}function Mt(e,t){this._eventBus=e,this._canvas=t,this._providers=[],this._textbox=new kt({container:t.getContainer(),keyHandler:oa(this._handleKey,this),resizeHandler:oa(this._handleResize,this)})}Mt.$inject=["eventBus","canvas"];Mt.prototype.registerProvider=function(e){this._providers.push(e)};Mt.prototype.isActive=function(e){return!!(this._active&&(!e||this._active.element===e))};Mt.prototype.cancel=function(){this._active&&(this._fire("cancel"),this.close())};Mt.prototype._fire=function(e,t){this._eventBus.fire("directEditing."+e,t||{active:this._active})};Mt.prototype.close=function(){this._textbox.destroy(),this._fire("deactivate"),this._active=null,this.resizable=void 0,this._canvas.restoreFocus&&this._canvas.restoreFocus()};Mt.prototype.complete=function(){var e=this._active;if(e){var t,n=e.context.bounds,i=this.$textbox.getBoundingClientRect(),o=this.getValue(),a=e.context.text;(o!==a||i.height!==n.height||i.width!==n.width)&&(t=this._textbox.container.getBoundingClientRect(),e.provider.update(e.element,o,e.context.text,{x:i.left-t.left,y:i.top-t.top,width:i.width,height:i.height})),this._fire("complete"),this.close()}};Mt.prototype.getValue=function(){return this._textbox.getValue()};Mt.prototype._handleKey=function(e){e.stopPropagation();var t=e.keyCode||e.charCode;if(t===27)return e.preventDefault(),this.cancel();if(t===13&&!e.shiftKey)return e.preventDefault(),this.complete()};Mt.prototype._handleResize=function(e){this._fire("resize",e)};Mt.prototype.activate=function(e){this.isActive()&&this.cancel();var t,n=zw(this._providers,function(i){return(t=i.activate(e))?i:null});return t&&(this.$textbox=this._textbox.create(t.bounds,t.style,t.text,t.options),this._active={element:e,context:t,provider:n},t.options&&t.options.resizable&&(this.resizable=!0),this._fire("activate")),!!t};const hh={__depends__:[Ow],__init__:["directEditing"],directEditing:["type",Mt]};function Wp(e){return function(t){var n=t.target,i=G(e),o=i.eventDefinitions&&i.eventDefinitions[0],a=i.$type===n.type,r=(o&&o.$type)===n.eventDefinitionType,s=!!n.triggeredByEvent==!!i.triggeredByEvent,c=n.isExpanded===void 0||n.isExpanded===pe(e);return!a||!r||!s||!c}}var o0=[{label:"Start event",actionName:"replace-with-none-start",className:"bpmn-icon-start-event-none",target:{type:"bpmn:StartEvent"}},{label:"Intermediate throw event",actionName:"replace-with-none-intermediate-throwing",className:"bpmn-icon-intermediate-event-none",target:{type:"bpmn:IntermediateThrowEvent"}},{label:"End event",actionName:"replace-with-none-end",className:"bpmn-icon-end-event-none",target:{type:"bpmn:EndEvent"}},{label:"Message start event",actionName:"replace-with-message-start",className:"bpmn-icon-start-event-message",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:MessageEventDefinition"}},{label:"Timer start event",actionName:"replace-with-timer-start",className:"bpmn-icon-start-event-timer",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:TimerEventDefinition"}},{label:"Conditional start event",actionName:"replace-with-conditional-start",className:"bpmn-icon-start-event-condition",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:ConditionalEventDefinition"}},{label:"Signal start event",actionName:"replace-with-signal-start",className:"bpmn-icon-start-event-signal",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:SignalEventDefinition"}}],a0=[{label:"Start event",actionName:"replace-with-none-start",className:"bpmn-icon-start-event-none",target:{type:"bpmn:StartEvent"}},{label:"Intermediate throw event",actionName:"replace-with-none-intermediate-throwing",className:"bpmn-icon-intermediate-event-none",target:{type:"bpmn:IntermediateThrowEvent"}},{label:"End event",actionName:"replace-with-none-end",className:"bpmn-icon-end-event-none",target:{type:"bpmn:EndEvent"}}],r0=[{label:"Start event",actionName:"replace-with-none-start",className:"bpmn-icon-start-event-none",target:{type:"bpmn:StartEvent"}},{label:"Intermediate throw event",actionName:"replace-with-none-intermediate-throw",className:"bpmn-icon-intermediate-event-none",target:{type:"bpmn:IntermediateThrowEvent"}},{label:"End event",actionName:"replace-with-none-end",className:"bpmn-icon-end-event-none",target:{type:"bpmn:EndEvent"}},{label:"Message intermediate catch event",actionName:"replace-with-message-intermediate-catch",className:"bpmn-icon-intermediate-event-catch-message",target:{type:"bpmn:IntermediateCatchEvent",eventDefinitionType:"bpmn:MessageEventDefinition"}},{label:"Message intermediate throw event",actionName:"replace-with-message-intermediate-throw",className:"bpmn-icon-intermediate-event-throw-message",target:{type:"bpmn:IntermediateThrowEvent",eventDefinitionType:"bpmn:MessageEventDefinition"}},{label:"Timer intermediate catch event",actionName:"replace-with-timer-intermediate-catch",className:"bpmn-icon-intermediate-event-catch-timer",target:{type:"bpmn:IntermediateCatchEvent",eventDefinitionType:"bpmn:TimerEventDefinition"}},{label:"Escalation intermediate throw event",actionName:"replace-with-escalation-intermediate-throw",className:"bpmn-icon-intermediate-event-throw-escalation",target:{type:"bpmn:IntermediateThrowEvent",eventDefinitionType:"bpmn:EscalationEventDefinition"}},{label:"Conditional intermediate catch event",actionName:"replace-with-conditional-intermediate-catch",className:"bpmn-icon-intermediate-event-catch-condition",target:{type:"bpmn:IntermediateCatchEvent",eventDefinitionType:"bpmn:ConditionalEventDefinition"}},{label:"Link intermediate catch event",actionName:"replace-with-link-intermediate-catch",className:"bpmn-icon-intermediate-event-catch-link",target:{type:"bpmn:IntermediateCatchEvent",eventDefinitionType:"bpmn:LinkEventDefinition",eventDefinitionAttrs:{name:""}}},{label:"Link intermediate throw event",actionName:"replace-with-link-intermediate-throw",className:"bpmn-icon-intermediate-event-throw-link",target:{type:"bpmn:IntermediateThrowEvent",eventDefinitionType:"bpmn:LinkEventDefinition",eventDefinitionAttrs:{name:""}}},{label:"Compensation intermediate throw event",actionName:"replace-with-compensation-intermediate-throw",className:"bpmn-icon-intermediate-event-throw-compensation",target:{type:"bpmn:IntermediateThrowEvent",eventDefinitionType:"bpmn:CompensateEventDefinition"}},{label:"Signal intermediate catch event",actionName:"replace-with-signal-intermediate-catch",className:"bpmn-icon-intermediate-event-catch-signal",target:{type:"bpmn:IntermediateCatchEvent",eventDefinitionType:"bpmn:SignalEventDefinition"}},{label:"Signal intermediate throw event",actionName:"replace-with-signal-intermediate-throw",className:"bpmn-icon-intermediate-event-throw-signal",target:{type:"bpmn:IntermediateThrowEvent",eventDefinitionType:"bpmn:SignalEventDefinition"}}],s0=[{label:"Start event",actionName:"replace-with-none-start",className:"bpmn-icon-start-event-none",target:{type:"bpmn:StartEvent"}},{label:"Intermediate throw event",actionName:"replace-with-none-intermediate-throw",className:"bpmn-icon-intermediate-event-none",target:{type:"bpmn:IntermediateThrowEvent"}},{label:"End event",actionName:"replace-with-none-end",className:"bpmn-icon-end-event-none",target:{type:"bpmn:EndEvent"}},{label:"Message end event",actionName:"replace-with-message-end",className:"bpmn-icon-end-event-message",target:{type:"bpmn:EndEvent",eventDefinitionType:"bpmn:MessageEventDefinition"}},{label:"Escalation end event",actionName:"replace-with-escalation-end",className:"bpmn-icon-end-event-escalation",target:{type:"bpmn:EndEvent",eventDefinitionType:"bpmn:EscalationEventDefinition"}},{label:"Error end event",actionName:"replace-with-error-end",className:"bpmn-icon-end-event-error",target:{type:"bpmn:EndEvent",eventDefinitionType:"bpmn:ErrorEventDefinition"}},{label:"Cancel end event",actionName:"replace-with-cancel-end",className:"bpmn-icon-end-event-cancel",target:{type:"bpmn:EndEvent",eventDefinitionType:"bpmn:CancelEventDefinition"}},{label:"Compensation end event",actionName:"replace-with-compensation-end",className:"bpmn-icon-end-event-compensation",target:{type:"bpmn:EndEvent",eventDefinitionType:"bpmn:CompensateEventDefinition"}},{label:"Signal end event",actionName:"replace-with-signal-end",className:"bpmn-icon-end-event-signal",target:{type:"bpmn:EndEvent",eventDefinitionType:"bpmn:SignalEventDefinition"}},{label:"Terminate end event",actionName:"replace-with-terminate-end",className:"bpmn-icon-end-event-terminate",target:{type:"bpmn:EndEvent",eventDefinitionType:"bpmn:TerminateEventDefinition"}}],c0=[{label:"Exclusive gateway",actionName:"replace-with-exclusive-gateway",className:"bpmn-icon-gateway-xor",target:{type:"bpmn:ExclusiveGateway"}},{label:"Parallel gateway",actionName:"replace-with-parallel-gateway",className:"bpmn-icon-gateway-parallel",target:{type:"bpmn:ParallelGateway"}},{label:"Inclusive gateway",actionName:"replace-with-inclusive-gateway",className:"bpmn-icon-gateway-or",target:{type:"bpmn:InclusiveGateway"}},{label:"Complex gateway",actionName:"replace-with-complex-gateway",className:"bpmn-icon-gateway-complex",target:{type:"bpmn:ComplexGateway"}},{label:"Event-based gateway",actionName:"replace-with-event-based-gateway",className:"bpmn-icon-gateway-eventbased",target:{type:"bpmn:EventBasedGateway",instantiate:!1,eventGatewayType:"Exclusive"}}],d0=[{label:"Transaction",actionName:"replace-with-transaction",className:"bpmn-icon-transaction",target:{type:"bpmn:Transaction",isExpanded:!0}},{label:"Event sub-process",actionName:"replace-with-event-subprocess",className:"bpmn-icon-event-subprocess-expanded",target:{type:"bpmn:SubProcess",triggeredByEvent:!0,isExpanded:!0}},{label:"Sub-process (collapsed)",actionName:"replace-with-collapsed-subprocess",className:"bpmn-icon-subprocess-collapsed",target:{type:"bpmn:SubProcess",isExpanded:!1}}],fh=[{label:"Transaction",actionName:"replace-with-transaction",className:"bpmn-icon-transaction",target:{type:"bpmn:Transaction",isExpanded:!0}},{label:"Sub-process",actionName:"replace-with-subprocess",className:"bpmn-icon-subprocess-expanded",target:{type:"bpmn:SubProcess",isExpanded:!0}},{label:"Event sub-process",actionName:"replace-with-event-subprocess",className:"bpmn-icon-event-subprocess-expanded",target:{type:"bpmn:SubProcess",triggeredByEvent:!0,isExpanded:!0}}],p0=fh,Up=[{label:"Task",actionName:"replace-with-task",className:"bpmn-icon-task",target:{type:"bpmn:Task"}},{label:"User task",actionName:"replace-with-user-task",className:"bpmn-icon-user",target:{type:"bpmn:UserTask"}},{label:"Service task",actionName:"replace-with-service-task",className:"bpmn-icon-service",target:{type:"bpmn:ServiceTask"}},{label:"Send task",actionName:"replace-with-send-task",className:"bpmn-icon-send",target:{type:"bpmn:SendTask"}},{label:"Receive task",actionName:"replace-with-receive-task",className:"bpmn-icon-receive",target:{type:"bpmn:ReceiveTask"}},{label:"Manual task",actionName:"replace-with-manual-task",className:"bpmn-icon-manual",target:{type:"bpmn:ManualTask"}},{label:"Business rule task",actionName:"replace-with-rule-task",className:"bpmn-icon-business-rule",target:{type:"bpmn:BusinessRuleTask"}},{label:"Script task",actionName:"replace-with-script-task",className:"bpmn-icon-script",target:{type:"bpmn:ScriptTask"}},{label:"Call activity",actionName:"replace-with-call-activity",className:"bpmn-icon-call-activity",target:{type:"bpmn:CallActivity"}},{label:"Sub-process (collapsed)",actionName:"replace-with-collapsed-subprocess",className:"bpmn-icon-subprocess-collapsed",target:{type:"bpmn:SubProcess",isExpanded:!1}},{label:"Sub-process (expanded)",actionName:"replace-with-expanded-subprocess",className:"bpmn-icon-subprocess-expanded",target:{type:"bpmn:SubProcess",isExpanded:!0}}],l0=[{label:"Data store reference",actionName:"replace-with-data-store-reference",className:"bpmn-icon-data-store",target:{type:"bpmn:DataStoreReference"}}],u0=[{label:"Data object reference",actionName:"replace-with-data-object-reference",className:"bpmn-icon-data-object",target:{type:"bpmn:DataObjectReference"}}],m0=[{label:"Message boundary event",actionName:"replace-with-message-boundary",className:"bpmn-icon-intermediate-event-catch-message",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:MessageEventDefinition",cancelActivity:!0}},{label:"Timer boundary event",actionName:"replace-with-timer-boundary",className:"bpmn-icon-intermediate-event-catch-timer",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:TimerEventDefinition",cancelActivity:!0}},{label:"Escalation boundary event",actionName:"replace-with-escalation-boundary",className:"bpmn-icon-intermediate-event-catch-escalation",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:EscalationEventDefinition",cancelActivity:!0}},{label:"Conditional boundary event",actionName:"replace-with-conditional-boundary",className:"bpmn-icon-intermediate-event-catch-condition",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:ConditionalEventDefinition",cancelActivity:!0}},{label:"Error boundary event",actionName:"replace-with-error-boundary",className:"bpmn-icon-intermediate-event-catch-error",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:ErrorEventDefinition",cancelActivity:!0}},{label:"Cancel boundary event",actionName:"replace-with-cancel-boundary",className:"bpmn-icon-intermediate-event-catch-cancel",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:CancelEventDefinition",cancelActivity:!0}},{label:"Signal boundary event",actionName:"replace-with-signal-boundary",className:"bpmn-icon-intermediate-event-catch-signal",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:SignalEventDefinition",cancelActivity:!0}},{label:"Compensation boundary event",actionName:"replace-with-compensation-boundary",className:"bpmn-icon-intermediate-event-catch-compensation",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:CompensateEventDefinition",cancelActivity:!0}},{label:"Message boundary event (non-interrupting)",actionName:"replace-with-non-interrupting-message-boundary",className:"bpmn-icon-intermediate-event-catch-non-interrupting-message",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:MessageEventDefinition",cancelActivity:!1}},{label:"Timer boundary event (non-interrupting)",actionName:"replace-with-non-interrupting-timer-boundary",className:"bpmn-icon-intermediate-event-catch-non-interrupting-timer",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:TimerEventDefinition",cancelActivity:!1}},{label:"Escalation boundary event (non-interrupting)",actionName:"replace-with-non-interrupting-escalation-boundary",className:"bpmn-icon-intermediate-event-catch-non-interrupting-escalation",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:EscalationEventDefinition",cancelActivity:!1}},{label:"Conditional boundary event (non-interrupting)",actionName:"replace-with-non-interrupting-conditional-boundary",className:"bpmn-icon-intermediate-event-catch-non-interrupting-condition",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:ConditionalEventDefinition",cancelActivity:!1}},{label:"Signal boundary event (non-interrupting)",actionName:"replace-with-non-interrupting-signal-boundary",className:"bpmn-icon-intermediate-event-catch-non-interrupting-signal",target:{type:"bpmn:BoundaryEvent",eventDefinitionType:"bpmn:SignalEventDefinition",cancelActivity:!1}}],h0=[{label:"Message start event",actionName:"replace-with-message-start",className:"bpmn-icon-start-event-message",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:MessageEventDefinition",isInterrupting:!0}},{label:"Timer start event",actionName:"replace-with-timer-start",className:"bpmn-icon-start-event-timer",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:TimerEventDefinition",isInterrupting:!0}},{label:"Conditional start event",actionName:"replace-with-conditional-start",className:"bpmn-icon-start-event-condition",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:ConditionalEventDefinition",isInterrupting:!0}},{label:"Signal start event",actionName:"replace-with-signal-start",className:"bpmn-icon-start-event-signal",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:SignalEventDefinition",isInterrupting:!0}},{label:"Error start event",actionName:"replace-with-error-start",className:"bpmn-icon-start-event-error",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:ErrorEventDefinition",isInterrupting:!0}},{label:"Escalation start event",actionName:"replace-with-escalation-start",className:"bpmn-icon-start-event-escalation",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:EscalationEventDefinition",isInterrupting:!0}},{label:"Compensation start event",actionName:"replace-with-compensation-start",className:"bpmn-icon-start-event-compensation",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:CompensateEventDefinition",isInterrupting:!0}},{label:"Message start event (non-interrupting)",actionName:"replace-with-non-interrupting-message-start",className:"bpmn-icon-start-event-non-interrupting-message",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:MessageEventDefinition",isInterrupting:!1}},{label:"Timer start event (non-interrupting)",actionName:"replace-with-non-interrupting-timer-start",className:"bpmn-icon-start-event-non-interrupting-timer",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:TimerEventDefinition",isInterrupting:!1}},{label:"Conditional start event (non-interrupting)",actionName:"replace-with-non-interrupting-conditional-start",className:"bpmn-icon-start-event-non-interrupting-condition",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:ConditionalEventDefinition",isInterrupting:!1}},{label:"Signal start event (non-interrupting)",actionName:"replace-with-non-interrupting-signal-start",className:"bpmn-icon-start-event-non-interrupting-signal",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:SignalEventDefinition",isInterrupting:!1}},{label:"Escalation start event (non-interrupting)",actionName:"replace-with-non-interrupting-escalation-start",className:"bpmn-icon-start-event-non-interrupting-escalation",target:{type:"bpmn:StartEvent",eventDefinitionType:"bpmn:EscalationEventDefinition",isInterrupting:!1}}],f0=[{label:"Sequence flow",actionName:"replace-with-sequence-flow",className:"bpmn-icon-connection"},{label:"Default flow",actionName:"replace-with-default-flow",className:"bpmn-icon-default-flow"},{label:"Conditional flow",actionName:"replace-with-conditional-flow",className:"bpmn-icon-conditional-flow"}],g0=[{label:"Expanded pool/participant",actionName:"replace-with-expanded-pool",className:"bpmn-icon-participant",target:{type:"bpmn:Participant",isExpanded:!0}},{label:function(e){var t="Empty pool/participant";return e.children&&e.children.length&&(t+=" (removes content)"),t},actionName:"replace-with-collapsed-pool",className:"bpmn-icon-lane",target:{type:"bpmn:Participant",isExpanded:!1}}];const Yp={"start-event-non-interrupting":`
  <svg viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0 995.64)">
      <path d="m1899 28.357c21.545 567.43-598.38 1023.5-1133.6 835.92-548.09-147.21-801.57-873.95-463.59-1330 302.62-480.3 1071.7-507.54 1407.6-49.847 122.14 153.12 190.07 348.07 189.59 543.91z" fill="none" stroke="currentColor" stroke-dasharray="418.310422, 361.2328165" stroke-linecap="round" stroke-width="100"/>
    </g>
  </svg>`,"intermediate-event-non-interrupting":`
  <svg viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg">
     <g transform="translate(0 995.64)" fill="none" stroke="currentColor" stroke-linecap="round">
        <circle cx="1024" cy="28.357" r="875" stroke-dasharray="418.310422, 361.2328165" stroke-width="100"/>
        <circle cx="1024" cy="28.357" r="685" stroke-dasharray="348.31044857,261.23283643" stroke-dashoffset="500" stroke-width="100"/>
     </g>
  </svg>`};function gt(e,t,n,i,o,a,r,s){this._bpmnFactory=e,this._popupMenu=t,this._modeling=n,this._moddle=i,this._bpmnReplace=o,this._rules=a,this._translate=r,this._moddleCopy=s,this._register()}gt.$inject=["bpmnFactory","popupMenu","modeling","moddle","bpmnReplace","rules","translate","moddleCopy"];gt.prototype._register=function(){this._popupMenu.registerProvider("bpmn-replace",this)};gt.prototype.getPopupMenuEntries=function(e){var t=e.businessObject,n=this._rules,i=[];if(se(e)||!n.allowed("shape.replace",{element:e}))return{};var o=Wp(e);return _(t,"bpmn:DataObjectReference")?this._createEntries(e,l0):_(t,"bpmn:DataStoreReference")&&!_(e.parent,"bpmn:Collaboration")?this._createEntries(e,u0):_(t,"bpmn:StartEvent")&&!_(t.$parent,"bpmn:SubProcess")?(i=ae(o0,o),this._createEntries(e,i)):_(t,"bpmn:Participant")?(i=ae(g0,function(a){return pe(e)!==a.target.isExpanded}),this._createEntries(e,i)):_(t,"bpmn:StartEvent")&&rt(t.$parent)?(i=ae(h0,function(a){var r=a.target,s=r.isInterrupting!==!1,c=t.isInterrupting===s;return o(a)||!o(a)&&!c}),this._createEntries(e,i)):_(t,"bpmn:StartEvent")&&!rt(t.$parent)&&_(t.$parent,"bpmn:SubProcess")?(i=ae(a0,o),this._createEntries(e,i)):_(t,"bpmn:EndEvent")?(i=ae(s0,function(a){var r=a.target;return r.eventDefinitionType=="bpmn:CancelEventDefinition"&&!_(t.$parent,"bpmn:Transaction")?!1:o(a)}),this._createEntries(e,i)):_(t,"bpmn:BoundaryEvent")?(i=ae(m0,function(a){var r=a.target;if(r.eventDefinitionType=="bpmn:CancelEventDefinition"&&!_(t.attachedToRef,"bpmn:Transaction"))return!1;var s=r.cancelActivity!==!1,c=t.cancelActivity==s;return o(a)||!o(a)&&!c}),this._createEntries(e,i)):_(t,"bpmn:IntermediateCatchEvent")||_(t,"bpmn:IntermediateThrowEvent")?(i=ae(r0,o),this._createEntries(e,i)):_(t,"bpmn:Gateway")?(i=ae(c0,o),this._createEntries(e,i)):_(t,"bpmn:Transaction")?(i=ae(fh,o),this._createEntries(e,i)):rt(t)&&pe(e)?(i=ae(p0,o),this._createEntries(e,i)):_(t,"bpmn:SubProcess")&&pe(e)?(i=ae(d0,o),this._createEntries(e,i)):_(t,"bpmn:AdHocSubProcess")&&!pe(e)?(i=ae(Up,function(a){var r=a.target,s=r.type==="bpmn:SubProcess",c=r.isExpanded===!0;return Wp(r)&&(!s||c)}),this._createEntries(e,i)):_(t,"bpmn:SequenceFlow")?this._createSequenceFlowEntries(e,f0):_(t,"bpmn:FlowNode")?(i=ae(Up,o),_(t,"bpmn:SubProcess")&&!pe(e)&&(i=ae(i,function(a){return a.label!=="Sub-process (collapsed)"})),this._createEntries(e,i)):{}};gt.prototype.getPopupMenuHeaderEntries=function(e){var t={};return _(e,"bpmn:Activity")&&!rt(e)&&(t={...t,...this._getLoopCharacteristicsHeaderEntries(e)}),_(e,"bpmn:DataObjectReference")&&(t={...t,...this._getCollectionHeaderEntries(e)}),_(e,"bpmn:Participant")&&(t={...t,...this._getParticipantMultiplicityHeaderEntries(e)}),_(e,"bpmn:SubProcess")&&!_(e,"bpmn:Transaction")&&!rt(e)&&(t={...t,...this._getAdHocHeaderEntries(e)}),nm(e)&&(t={...t,...this._getNonInterruptingHeaderEntries(e)}),t};gt.prototype._createEntries=function(e,t){var n={},i=this;return T(t,function(o){n[o.actionName]=i._createEntry(o,e)}),n};gt.prototype._createSequenceFlowEntries=function(e,t){var n=G(e),i={},o=this._modeling,a=this._moddle,r=this;return T(t,function(s){switch(s.actionName){case"replace-with-default-flow":n.sourceRef.default!==n&&(_(n.sourceRef,"bpmn:ExclusiveGateway")||_(n.sourceRef,"bpmn:InclusiveGateway")||_(n.sourceRef,"bpmn:ComplexGateway")||_(n.sourceRef,"bpmn:Activity"))&&(i={...i,[s.actionName]:r._createEntry(s,e,function(){o.updateProperties(e.source,{default:n})})});break;case"replace-with-conditional-flow":!n.conditionExpression&&_(n.sourceRef,"bpmn:Activity")&&(i={...i,[s.actionName]:r._createEntry(s,e,function(){var c=a.create("bpmn:FormalExpression",{body:""});o.updateProperties(e,{conditionExpression:c})})});break;default:_(n.sourceRef,"bpmn:Activity")&&n.conditionExpression&&(i={...i,[s.actionName]:r._createEntry(s,e,function(){o.updateProperties(e,{conditionExpression:void 0})})}),(_(n.sourceRef,"bpmn:ExclusiveGateway")||_(n.sourceRef,"bpmn:InclusiveGateway")||_(n.sourceRef,"bpmn:ComplexGateway")||_(n.sourceRef,"bpmn:Activity"))&&n.sourceRef.default===n&&(i={...i,[s.actionName]:r._createEntry(s,e,function(){o.updateProperties(e.source,{default:void 0})})})}}),i};gt.prototype._createEntry=function(e,t,n){var i=this._translate,o=this._bpmnReplace.replaceElement,a=function(){return o(t,e.target)},r=e.label;return r&&typeof r=="function"&&(r=r(t)),n=n||a,{label:i(r),className:e.className,action:n}};gt.prototype._getLoopCharacteristicsHeaderEntries=function(e){var t=this,n=this._translate;function i(d,l){if(l.active){t._modeling.updateProperties(e,{loopCharacteristics:void 0});return}const p=e.businessObject.get("loopCharacteristics"),u=t._moddle.create(l.options.loopCharacteristics);p&&t._moddleCopy.copyElement(p,u),u.set("isSequential",l.options.isSequential),t._modeling.updateProperties(e,{loopCharacteristics:u})}var o=G(e),a=o.loopCharacteristics,r,s,c;return a&&(r=a.isSequential,s=a.isSequential===void 0,c=a.isSequential!==void 0&&!a.isSequential),{"toggle-parallel-mi":{className:"bpmn-icon-parallel-mi-marker",title:n("Parallel multi-instance"),active:c,action:i,options:{loopCharacteristics:"bpmn:MultiInstanceLoopCharacteristics",isSequential:!1}},"toggle-sequential-mi":{className:"bpmn-icon-sequential-mi-marker",title:n("Sequential multi-instance"),active:r,action:i,options:{loopCharacteristics:"bpmn:MultiInstanceLoopCharacteristics",isSequential:!0}},"toggle-loop":{className:"bpmn-icon-loop-marker",title:n("Loop"),active:s,action:i,options:{loopCharacteristics:"bpmn:StandardLoopCharacteristics"}}}};gt.prototype._getCollectionHeaderEntries=function(e){var t=this,n=this._translate,i=e.businessObject.dataObjectRef;if(!i)return{};function o(r,s){t._modeling.updateModdleProperties(e,i,{isCollection:!s.active})}var a=i.isCollection;return{"toggle-is-collection":{className:"bpmn-icon-parallel-mi-marker",title:n("Collection"),active:a,action:o}}};gt.prototype._getParticipantMultiplicityHeaderEntries=function(e){var t=this,n=this._bpmnFactory,i=this._translate;function o(r,s){var c=s.active,d;c||(d=n.create("bpmn:ParticipantMultiplicity")),t._modeling.updateProperties(e,{participantMultiplicity:d})}var a=e.businessObject.participantMultiplicity;return{"toggle-participant-multiplicity":{className:"bpmn-icon-parallel-mi-marker",title:i("Participant multiplicity"),active:!!a,action:o}}};gt.prototype._getAdHocHeaderEntries=function(e){var t=this._translate,n=G(e),i=_(n,"bpmn:AdHocSubProcess"),o=this._bpmnReplace.replaceElement;return{"toggle-adhoc":{className:"bpmn-icon-ad-hoc-marker",title:t("Ad-hoc"),active:i,action:function(a,r){return i?o(e,{type:"bpmn:SubProcess"},{autoResize:!1,layoutConnection:!1}):o(e,{type:"bpmn:AdHocSubProcess"},{autoResize:!1,layoutConnection:!1})}}}};gt.prototype._getNonInterruptingHeaderEntries=function(e){const t=this._translate,n=G(e),i=this,o=im(e),a=_(e,"bpmn:BoundaryEvent")?Yp["intermediate-event-non-interrupting"]:Yp["start-event-non-interrupting"],r=!n[o];return{"toggle-non-interrupting":{imageHtml:a,title:t("Toggle non-interrupting"),active:r,action:function(){i._modeling.updateProperties(e,{[o]:!!r})}}}};const _0={__depends__:[Ps,km,Ms],__init__:["replaceMenuProvider"],replaceMenuProvider:["type",gt]};function oo(e,t,n,i,o,a,r,s,c,d,l,p,u){e=e||{},i.registerProvider(this),this._contextPad=i,this._modeling=o,this._elementFactory=a,this._connect=r,this._create=s,this._popupMenu=c,this._canvas=d,this._rules=l,this._translate=p,this._eventBus=n,this._appendPreview=u,e.autoPlace!==!1&&(this._autoPlace=t.get("autoPlace",!1)),n.on("create.end",250,function(m){var h=m.context,g=h.shape;if(!(!Ai(m)||!i.isOpen(g))){var f=i.getEntries(g);f.replace&&f.replace.action.click(m,g)}}),n.on("contextPad.close",function(){u.cleanUp()})}oo.$inject=["config.contextPad","injector","eventBus","contextPad","modeling","elementFactory","connect","create","popupMenu","canvas","rules","translate","appendPreview"];oo.prototype.getMultiElementContextPadEntries=function(e){var t=this._modeling,n={};return this._isDeleteAllowed(e)&&C(n,{delete:{group:"edit",className:"bpmn-icon-trash",title:this._translate("Delete"),action:{click:function(i,o){t.removeElements(o.slice())}}}}),n};oo.prototype._isDeleteAllowed=function(e){var t=this._rules.allowed("elements.delete",{elements:e});return se(t)?ca(e,n=>t.includes(n)):t};oo.prototype.getContextPadEntries=function(e){var t=this._contextPad,n=this._modeling,i=this._elementFactory,o=this._connect,a=this._create,r=this._popupMenu,s=this._autoPlace,c=this._translate,d=this._appendPreview,l={};if(e.type==="label")return this._isDeleteAllowed([e])&&C(l,h()),l;var p=e.businessObject;function u(v,y){o.start(v,y)}function m(v,y){n.removeElements([y])}function h(){return{delete:{group:"edit",className:"bpmn-icon-trash",title:c("Delete"),action:{click:m}}}}function g(v){var y=5,P=t.getPad(v).html,x=P.getBoundingClientRect(),I={x:x.left,y:x.bottom+y};return I}function f(v,y,P,x){function I(B,S){var k=i.createShape(C({type:v},x));a.start(B,k,{source:S})}var N=s?function(B,S){var k=i.createShape(C({type:v},x));s.append(S,k)}:I,R=s?function(B,S){return d.create(S,v,x),()=>{d.cleanUp()}}:null;return{group:"model",className:y,title:P,action:{dragstart:I,click:N,hover:R}}}function w(v){return function(y,P){n.splitLane(P,v),t.open(P,!0)}}if(Q(p,["bpmn:Lane","bpmn:Participant"])&&pe(e)){var E=bn(e);C(l,{"lane-insert-above":{group:"lane-insert-above",className:"bpmn-icon-lane-insert-above",title:c("Add lane above"),action:{click:function(v,y){n.addLane(y,"top")}}}}),E.length<2&&((Ze(e)?e.height>=120:e.width>=120)&&C(l,{"lane-divide-two":{group:"lane-divide",className:"bpmn-icon-lane-divide-two",title:c("Divide into two lanes"),action:{click:w(2)}}}),(Ze(e)?e.height>=180:e.width>=180)&&C(l,{"lane-divide-three":{group:"lane-divide",className:"bpmn-icon-lane-divide-three",title:c("Divide into three lanes"),action:{click:w(3)}}})),C(l,{"lane-insert-below":{group:"lane-insert-below",className:"bpmn-icon-lane-insert-below",title:c("Add lane below"),action:{click:function(v,y){n.addLane(y,"bottom")}}}})}return _(p,"bpmn:FlowNode")&&(_(p,"bpmn:EventBasedGateway")?C(l,{"append.receive-task":f("bpmn:ReceiveTask","bpmn-icon-receive-task",c("Append receive task")),"append.message-intermediate-event":f("bpmn:IntermediateCatchEvent","bpmn-icon-intermediate-event-catch-message",c("Append message intermediate catch event"),{eventDefinitionType:"bpmn:MessageEventDefinition"}),"append.timer-intermediate-event":f("bpmn:IntermediateCatchEvent","bpmn-icon-intermediate-event-catch-timer",c("Append timer intermediate catch event"),{eventDefinitionType:"bpmn:TimerEventDefinition"}),"append.condition-intermediate-event":f("bpmn:IntermediateCatchEvent","bpmn-icon-intermediate-event-catch-condition",c("Append conditional intermediate catch event"),{eventDefinitionType:"bpmn:ConditionalEventDefinition"}),"append.signal-intermediate-event":f("bpmn:IntermediateCatchEvent","bpmn-icon-intermediate-event-catch-signal",c("Append signal intermediate catch event"),{eventDefinitionType:"bpmn:SignalEventDefinition"})}):Kp(p,"bpmn:BoundaryEvent","bpmn:CompensateEventDefinition")?C(l,{"append.compensation-activity":f("bpmn:Task","bpmn-icon-task",c("Append compensation activity"),{isForCompensation:!0})}):!_(p,"bpmn:EndEvent")&&!p.isForCompensation&&!Kp(p,"bpmn:IntermediateThrowEvent","bpmn:LinkEventDefinition")&&!rt(p)&&C(l,{"append.end-event":f("bpmn:EndEvent","bpmn-icon-end-event-none",c("Append end event")),"append.gateway":f("bpmn:ExclusiveGateway","bpmn-icon-gateway-none",c("Append gateway")),"append.append-task":f("bpmn:Task","bpmn-icon-task",c("Append task")),"append.intermediate-event":f("bpmn:IntermediateThrowEvent","bpmn-icon-intermediate-event-none",c("Append intermediate/boundary event"))})),r.isEmpty(e,"bpmn-replace")||C(l,{replace:{group:"edit",className:"bpmn-icon-screw-wrench",title:c("Change element"),action:{click:function(v,y){var P=C(g(y),{cursor:{x:v.x,y:v.y}});r.open(y,"bpmn-replace",P,{title:c("Change element"),width:300,search:!0})}}}}),_(p,"bpmn:SequenceFlow")&&C(l,{"append.text-annotation":f("bpmn:TextAnnotation","bpmn-icon-text-annotation",c("Add text annotation"))}),Q(p,["bpmn:FlowNode","bpmn:InteractionNode","bpmn:DataObjectReference","bpmn:DataStoreReference"])&&C(l,{"append.text-annotation":f("bpmn:TextAnnotation","bpmn-icon-text-annotation",c("Add text annotation")),connect:{group:"connect",className:"bpmn-icon-connection-multi",title:c("Connect to other element"),action:{click:u,dragstart:u}}}),_(p,"bpmn:TextAnnotation")&&C(l,{connect:{group:"connect",className:"bpmn-icon-connection-multi",title:c("Connect using association"),action:{click:u,dragstart:u}}}),Q(p,["bpmn:DataObjectReference","bpmn:DataStoreReference"])&&C(l,{connect:{group:"connect",className:"bpmn-icon-connection-multi",title:c("Connect using data input association"),action:{click:u,dragstart:u}}}),_(p,"bpmn:Group")&&C(l,{"append.text-annotation":f("bpmn:TextAnnotation","bpmn-icon-text-annotation",c("Add text annotation"))}),this._isDeleteAllowed([e])&&C(l,h()),l};function Kp(e,t,n){var i=e.$instanceOf(t),o=!1,a=e.eventDefinitions||[];return T(a,function(r){r.$type===n&&(o=!0)}),i&&o}const b0={__depends__:[iw,hh,Jl,Jt,As,ka,_0],__init__:["contextPadProvider"],contextPadProvider:["type",oo]};var v0={horizontal:["x","width"],vertical:["y","height"]},Zp=5;function on(e,t){this._modeling=e,this._filters=[],this.registerFilter(function(n){var i=t.allowed("elements.distribute",{elements:n});return se(i)?i:i?n:[]})}on.$inject=["modeling","rules"];on.prototype.registerFilter=function(e){if(typeof e!="function")throw new Error("the filter has to be a function");this._filters.push(e)};on.prototype.trigger=function(e,t){var n=this._modeling,i,o;if(!(e.length<3)&&(this._setOrientation(t),o=this._filterElements(e),i=this._createGroups(o),!(i.length<=2)))return n.distributeElements(i,this._axis,this._dimension),i};on.prototype._filterElements=function(e){var t=this._filters,n=this._axis,i=this._dimension,o=[].concat(e);return t.length?(T(t,function(a){o=a(o,n,i)}),o):e};on.prototype._createGroups=function(e){var t=[],n=this,i=this._axis,o=this._dimension;if(!i)throw new Error('must have a defined "axis" and "dimension"');var a=Zt(e,i);return T(a,function(r,s){var c=n._findRange(r,i,o),d,l=t[t.length-1];l&&n._hasIntersection(l.range,c)?t[t.length-1].elements.push(r):(d={range:c,elements:[r]},t.push(d))}),t};on.prototype._setOrientation=function(e){var t=v0[e];this._axis=t[0],this._dimension=t[1]};on.prototype._hasIntersection=function(e,t){return Math.max(e.min,e.max)>=Math.min(t.min,t.max)&&Math.min(e.min,e.max)<=Math.max(t.min,t.max)};on.prototype._findRange=function(e){var t=e[this._axis],n=e[this._dimension];return{min:t+Zp,max:t+n-Zp}};const y0={__init__:["distributeElements"],distributeElements:["type",on]};function Ka(e){Pt.call(this,e)}Ka.$inject=["eventBus"];z(Ka,Pt);Ka.prototype.init=function(){this.addRule("elements.distribute",function(e){var t=e.elements;return t=ae(t,function(n){var i=Q(n,["bpmn:Association","bpmn:BoundaryEvent","bpmn:DataInputAssociation","bpmn:DataOutputAssociation","bpmn:Lane","bpmn:MessageFlow","bpmn:SequenceFlow","bpmn:TextAnnotation"]);return!(n.labelTarget||i)}),t=da(t),t.length<3?!1:t})};var Xp={horizontal:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
                <polyline points="450 400 450 150 1350 150 1350 400" style="fill:none;stroke:currentColor;stroke-width:100;stroke-linejoin:round;"/>
                <rect x="150" y="450" width="600" height="1200" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
                <rect x="1050" y="450" width="600" height="800" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
              </svg>`,vertical:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800">
              <polyline points="400 1350 150 1350 150 450 400 450" style="fill:none;stroke:currentColor;stroke-width:100;stroke-linejoin:round;"/>
              <rect x="450" y="150" width="1200" height="600" rx="1" style="fill:none;stroke:currentColor;stroke-width:100;"></rect>
              <rect x="450" y="1050" width="800" height="600" rx="1" style="fill:currentColor;stroke:currentColor;stroke-width:100;opacity:.5;"></rect>
            </svg>`},w0=900;function ao(e,t,n,i){this._distributeElements=t,this._translate=n,this._popupMenu=e,this._rules=i,e.registerProvider("align-elements",w0,this)}ao.$inject=["popupMenu","distributeElements","translate","rules"];ao.prototype.getPopupMenuEntries=function(e){var t={};return this._isAllowed(e)&&C(t,this._getEntries(e)),t};ao.prototype._isAllowed=function(e){return this._rules.allowed("elements.distribute",{elements:e})};ao.prototype._getEntries=function(e){var t=this._distributeElements,n=this._translate,i=this._popupMenu,o={"distribute-elements-horizontal":{group:"distribute",title:n("Distribute elements horizontally"),className:"bjs-align-elements-menu-entry",imageHtml:Xp.horizontal,action:function(a,r){t.trigger(e,"horizontal"),i.close()}},"distribute-elements-vertical":{group:"distribute",title:n("Distribute elements vertically"),imageHtml:Xp.vertical,action:function(a,r){t.trigger(e,"vertical"),i.close()}}};return o};const E0={__depends__:[Ps,y0],__init__:["bpmnDistributeElements","distributeElementsMenuProvider"],bpmnDistributeElements:["type",Ka],distributeElementsMenuProvider:["type",ao]};var gh="is not a registered action",x0="is already registered";function Nt(e,t){this._actions={};var n=this;e.on("diagram.init",function(){n._registerDefaultActions(t),e.fire("editorActions.init",{editorActions:n})})}Nt.$inject=["eventBus","injector"];Nt.prototype._registerDefaultActions=function(e){var t=e.get("commandStack",!1),n=e.get("modeling",!1),i=e.get("selection",!1),o=e.get("zoomScroll",!1),a=e.get("copyPaste",!1),r=e.get("canvas",!1),s=e.get("rules",!1),c=e.get("keyboardMove",!1),d=e.get("keyboardMoveSelection",!1);t&&(this.register("undo",function(){t.undo()}),this.register("redo",function(){t.redo()})),a&&i&&this.register("copy",function(){var l=i.get();if(l.length)return a.copy(l)}),a&&this.register("paste",function(){a.paste()}),o&&this.register("stepZoom",function(l){o.stepZoom(l.value)}),r&&this.register("zoom",function(l){r.zoom(l.value)}),n&&i&&s&&this.register("removeSelection",function(){var l=i.get();if(l.length){var p=s.allowed("elements.delete",{elements:l}),u;p!==!1&&(se(p)?u=p:u=l,u.length&&n.removeElements(u.slice()))}}),c&&this.register("moveCanvas",function(l){c.moveCanvas(l)}),d&&this.register("moveSelection",function(l){d.moveSelection(l.direction,l.accelerated)})};Nt.prototype.trigger=function(e,t){if(!this._actions[e])throw Oc(e,gh);return this._actions[e](t)};Nt.prototype.register=function(e,t){var n=this;if(typeof e=="string")return this._registerAction(e,t);T(e,function(i,o){n._registerAction(o,i)})};Nt.prototype._registerAction=function(e,t){if(this.isRegistered(e))throw Oc(e,x0);this._actions[e]=t};Nt.prototype.unregister=function(e){if(!this.isRegistered(e))throw Oc(e,gh);this._actions[e]=void 0};Nt.prototype.getActions=function(){return Object.keys(this._actions)};Nt.prototype.isRegistered=function(e){return!!this._actions[e]};function Oc(e,t){return new Error(e+" "+t)}const P0={__init__:["editorActions"],editorActions:["type",Nt]};function Za(e){e.invoke(Nt,this)}z(Za,Nt);Za.$inject=["injector"];Za.prototype._registerDefaultActions=function(e){Nt.prototype._registerDefaultActions.call(this,e);var t=e.get("canvas",!1),n=e.get("elementRegistry",!1),i=e.get("selection",!1),o=e.get("spaceTool",!1),a=e.get("lassoTool",!1),r=e.get("handTool",!1),s=e.get("globalConnect",!1),c=e.get("distributeElements",!1),d=e.get("alignElements",!1),l=e.get("directEditing",!1),p=e.get("searchPad",!1),u=e.get("modeling",!1),m=e.get("contextPad",!1);t&&n&&i&&this._registerAction("selectElements",function(){var h=t.getRootElement(),g=n.filter(function(f){return f!==h});return i.select(g),g}),o&&this._registerAction("spaceTool",function(){o.toggle()}),a&&this._registerAction("lassoTool",function(){a.toggle()}),r&&this._registerAction("handTool",function(){r.toggle()}),s&&this._registerAction("globalConnectTool",function(){s.toggle()}),i&&c&&this._registerAction("distributeElements",function(h){var g=i.get(),f=h.type;g.length&&c.trigger(g,f)}),i&&d&&this._registerAction("alignElements",function(h){var g=i.get(),f=[],w=h.type;g.length&&(f=ae(g,function(E){return!_(E,"bpmn:Lane")}),d.trigger(f,w))}),i&&u&&this._registerAction("setColor",function(h){var g=i.get();g.length&&u.setColor(g,h)}),i&&l&&this._registerAction("directEditing",function(){var h=i.get();h.length&&l.activate(h[0])}),p&&this._registerAction("find",function(){p.toggle()}),t&&u&&this._registerAction("moveToOrigin",function(){var h=t.getRootElement(),g,f;_(h,"bpmn:Collaboration")?f=n.filter(function(w){return _(w.parent,"bpmn:Collaboration")}):f=n.filter(function(w){return w!==h&&!_(w.parent,"bpmn:SubProcess")}),g=wt(f),u.moveElements(f,{x:-g.x,y:-g.y},h)}),i&&m&&this._registerAction("replaceElement",function(h){m.triggerEntry("replace","click",h)})};const S0={__depends__:[P0],editorActions:["type",Za]};function _h(e){e.on(["create.init","shape.move.init"],function(t){var n=t.context,i=t.shape;Q(i,["bpmn:Participant","bpmn:SubProcess","bpmn:TextAnnotation"])&&(n.gridSnappingContext||(n.gridSnappingContext={}),n.gridSnappingContext.snapLocation="top-left")})}_h.$inject=["eventBus"];var Vo=10;function _r(e,t,n){return n||(n="round"),Math[n](e/t)*t}var T0=1200,M0=800;function Pn(e,t,n){var i=!n||n.active!==!1;this._eventBus=t;var o=this;t.on("diagram.init",M0,function(){o.setActive(i)}),t.on(["create.move","create.end","bendpoint.move.move","bendpoint.move.end","connect.move","connect.end","connectionSegment.move.move","connectionSegment.move.end","resize.move","resize.end","shape.move.move","shape.move.end"],T0,function(a){var r=a.originalEvent;if(!(!o.active||r&&ft(r))){var s=a.context,c=s.gridSnappingContext;c||(c=s.gridSnappingContext={}),["x","y"].forEach(function(d){var l={},p=C0(a,d,e);p&&(l.offset=p);var u=N0(a,d);u&&C(l,u),ei(a,d)||o.snapEvent(a,d,l)})}})}Pn.prototype.snapEvent=function(e,t,n){var i=this.snapValue(e[t],n);Fe(e,t,i)};Pn.prototype.getGridSpacing=function(){return Vo};Pn.prototype.snapValue=function(e,t){var n=0;t&&t.offset&&(n=t.offset),e+=n,e=_r(e,Vo);var i,o;return t&&t.min&&(i=t.min,te(i)&&(i=_r(i+n,Vo,"ceil"),e=Math.max(e,i))),t&&t.max&&(o=t.max,te(o)&&(o=_r(o+n,Vo,"floor"),e=Math.min(e,o))),e-=n,e};Pn.prototype.isActive=function(){return this.active};Pn.prototype.setActive=function(e){this.active=e,this._eventBus.fire("gridSnapping.toggle",{active:e})};Pn.prototype.toggleActive=function(){this.setActive(!this.active)};Pn.$inject=["elementRegistry","eventBus","config.gridSnapping"];function N0(e,t){var n=e.context,i=n.createConstraints,o=n.resizeConstraints||{},a=n.gridSnappingContext,r=a.snapConstraints;if(r&&r[t])return r[t];r||(r=a.snapConstraints={}),r[t]||(r[t]={});var s=n.direction;i&&(Wo(t)?(r.x.min=i.left,r.x.max=i.right):(r.y.min=i.top,r.y.max=i.bottom));var c=o.min,d=o.max;return c&&(Wo(t)?Qp(s)?r.x.max=c.left:r.x.min=c.right:Jp(s)?r.y.max=c.top:r.y.min=c.bottom),d&&(Wo(t)?Qp(s)?r.x.min=d.left:r.x.max=d.right:Jp(s)?r.y.min=d.top:r.y.max=d.bottom),r[t]}function C0(e,t,n){var i=e.context,o=e.shape,a=i.gridSnappingContext,r=a.snapLocation,s=a.snapOffset;return s&&te(s[t])||(s||(s=a.snapOffset={}),te(s[t])||(s[t]=0),!o)||(n.get(o.id)||(Wo(t)?s[t]+=o[t]+o.width/2:s[t]+=o[t]+o.height/2),!r)||(t==="x"?/left/.test(r)?s[t]-=o.width/2:/right/.test(r)&&(s[t]+=o.width/2):/top/.test(r)?s[t]-=o.height/2:/bottom/.test(r)&&(s[t]+=o.height/2)),s[t]}function Wo(e){return e==="x"}function Jp(e){return e.indexOf("n")!==-1}function Qp(e){return e.indexOf("w")!==-1}function Gn(e,t){D.call(this,e),this._gridSnapping=t;var n=this;this.preExecute("shape.resize",function(i){var o=i.context,a=o.hints||{},r=a.autoResize;if(r){var s=o.shape,c=o.newBounds;pa(r)?o.newBounds=n.snapComplex(c,r):o.newBounds=n.snapSimple(s,c)}})}Gn.$inject=["eventBus","gridSnapping","modeling"];z(Gn,D);Gn.prototype.snapSimple=function(e,t){var n=this._gridSnapping;return t.width=n.snapValue(t.width,{min:t.width}),t.height=n.snapValue(t.height,{min:t.height}),t.x=e.x+e.width/2-t.width/2,t.y=e.y+e.height/2-t.height/2,t};Gn.prototype.snapComplex=function(e,t){return/w|e/.test(t)&&(e=this.snapHorizontally(e,t)),/n|s/.test(t)&&(e=this.snapVertically(e,t)),e};Gn.prototype.snapHorizontally=function(e,t){var n=this._gridSnapping,i=/w/.test(t),o=/e/.test(t),a={};return a.width=n.snapValue(e.width,{min:e.width}),o&&(i?(a.x=n.snapValue(e.x,{max:e.x}),a.width+=n.snapValue(e.x-a.x,{min:e.x-a.x})):e.x=e.x+e.width-a.width),C(e,a),e};Gn.prototype.snapVertically=function(e,t){var n=this._gridSnapping,i=/n/.test(t),o=/s/.test(t),a={};return a.height=n.snapValue(e.height,{min:e.height}),i&&(o?(a.y=n.snapValue(e.y,{max:e.y}),a.height+=n.snapValue(e.y-a.y,{min:e.y-a.y})):e.y=e.y+e.height-a.height),C(e,a),e};var R0=2e3;function bh(e,t){e.on(["spaceTool.move","spaceTool.end"],R0,function(n){var i=n.context;if(i.initialized){var o=i.axis,a;o==="x"?(a=t.snapValue(n.dx),n.x=n.x+a-n.dx,n.dx=a):(a=t.snapValue(n.dy),n.y=n.y+a-n.dy,n.dy=a)}})}bh.$inject=["eventBus","gridSnapping"];const B0={__init__:["gridSnappingResizeBehavior","gridSnappingSpaceToolBehavior"],gridSnappingResizeBehavior:["type",Gn],gridSnappingSpaceToolBehavior:["type",bh]},A0={__depends__:[B0],__init__:["gridSnapping"],gridSnapping:["type",Pn]};var k0=2e3;function vh(e,t,n){e.on("autoPlace",k0,function(i){var o=i.source,a=Z(o),r=i.shape,s=xu(o,r,n);return["x","y"].forEach(function(c){var d={};s[c]!==a[c]&&(s[c]>a[c]?d.min=s[c]:d.max=s[c],_(r,"bpmn:TextAnnotation")&&(D0(c)?d.offset=-r.width/2:d.offset=-r.height/2),s[c]=t.snapValue(s[c],d))}),s})}vh.$inject=["eventBus","gridSnapping","elementRegistry"];function D0(e){return e==="x"}var I0=1750;function yh(e,t,n){t.on(["create.start","shape.move.start"],I0,function(i){var o=i.context,a=o.shape,r=e.getRootElement();if(!(!_(a,"bpmn:Participant")||!_(r,"bpmn:Process")||!r.children.length)){var s=o.createConstraints;s&&(a.width=n.snapValue(a.width,{min:a.width}),a.height=n.snapValue(a.height,{min:a.height}))}})}yh.$inject=["canvas","eventBus","gridSnapping"];var F0=3e3;function Xa(e,t,n){D.call(this,e),this._gridSnapping=t;var i=this;this.postExecuted(["connection.create","connection.layout"],F0,function(o){var a=o.context,r=a.connection,s=a.hints||{},c=r.waypoints;s.connectionStart||s.connectionEnd||s.createElementsBehavior===!1||O0(c)&&n.updateWaypoints(r,i.snapMiddleSegments(c))})}Xa.$inject=["eventBus","gridSnapping","modeling"];z(Xa,D);Xa.prototype.snapMiddleSegments=function(e){var t=this._gridSnapping,n;e=e.slice();for(var i=1;i<e.length-2;i++)n=j0(t,e[i],e[i+1]),e[i]=n[0],e[i+1]=n[1];return e};function O0(e){return e.length>3}function L0(e){return e==="h"}function G0(e){return e==="v"}function j0(e,t,n){var i=Vt(t,n),o={};return L0(i)&&(o.y=e.snapValue(t.y)),G0(i)&&(o.x=e.snapValue(t.x)),("x"in o||"y"in o)&&(t=C({},t,o),n=C({},n,o)),[t,n]}const $0={__init__:["gridSnappingAutoPlaceBehavior","gridSnappingParticipantBehavior","gridSnappingLayoutConnectionBehavior"],gridSnappingAutoPlaceBehavior:["type",vh],gridSnappingParticipantBehavior:["type",yh],gridSnappingLayoutConnectionBehavior:["type",Xa]},q0={__depends__:[A0,$0],__init__:["bpmnGridSnapping"],bpmnGridSnapping:["type",_h]};var H0=30,wh=30;function ro(e,t){this._interactionEvents=t;var n=this;e.on(["interactionEvents.createHit","interactionEvents.updateHit"],function(i){var o=i.element,a=i.gfx;if(_(o,"bpmn:Lane"))return n._createParticipantHit(o,a);if(_(o,"bpmn:Participant"))return pe(o)?n._createParticipantHit(o,a):n._createDefaultHit(o,a);if(_(o,"bpmn:SubProcess"))return pe(o)?n._createSubProcessHit(o,a):n._createDefaultHit(o,a)})}ro.$inject=["eventBus","interactionEvents"];ro.prototype._createDefaultHit=function(e,t){return this._interactionEvents.removeHits(t),this._interactionEvents.createDefaultHit(e,t),!0};ro.prototype._createParticipantHit=function(e,t){this._interactionEvents.removeHits(t),this._interactionEvents.createBoxHit(t,"no-move",{width:e.width,height:e.height}),this._interactionEvents.createBoxHit(t,"click-stroke",{width:e.width,height:e.height});var n=Ze(e)?{width:H0,height:e.height}:{width:e.width,height:wh};return this._interactionEvents.createBoxHit(t,"all",n),!0};ro.prototype._createSubProcessHit=function(e,t){return this._interactionEvents.removeHits(t),this._interactionEvents.createBoxHit(t,"no-move",{width:e.width,height:e.height}),this._interactionEvents.createBoxHit(t,"click-stroke",{width:e.width,height:e.height}),this._interactionEvents.createBoxHit(t,"all",{width:e.width,height:wh}),!0};const z0={__init__:["bpmnInteractionEvents"],bpmnInteractionEvents:["type",ro]};function Ja(e){e.invoke(oi,this)}z(Ja,oi);Ja.$inject=["injector"];Ja.prototype.registerBindings=function(e,t){oi.prototype.registerBindings.call(this,e,t);function n(i,o){t.isRegistered(i)&&e.addListener(o)}n("selectElements",function(i){var o=i.keyEvent;if(e.isKey(["a","A"],o)&&e.isCmd(o))return t.trigger("selectElements"),!0}),n("find",function(i){var o=i.keyEvent;if(e.isKey(["f","F"],o)&&e.isCmd(o))return t.trigger("find"),!0}),n("spaceTool",function(i){var o=i.keyEvent;if(!e.hasModifier(o)&&e.isKey(["s","S"],o))return t.trigger("spaceTool"),!0}),n("lassoTool",function(i){var o=i.keyEvent;if(!e.hasModifier(o)&&e.isKey(["l","L"],o))return t.trigger("lassoTool"),!0}),n("handTool",function(i){var o=i.keyEvent;if(!e.hasModifier(o)&&e.isKey(["h","H"],o))return t.trigger("handTool"),!0}),n("globalConnectTool",function(i){var o=i.keyEvent;if(!e.hasModifier(o)&&e.isKey(["c","C"],o))return t.trigger("globalConnectTool"),!0}),n("directEditing",function(i){var o=i.keyEvent;if(!e.hasModifier(o)&&e.isKey(["e","E"],o))return t.trigger("directEditing"),!0}),n("replaceElement",function(i){var o=i.keyEvent;if(!e.hasModifier(o)&&e.isKey(["r","R"],o))return t.trigger("replaceElement",o),!0})};const V0={__depends__:[_s],__init__:["keyboardBindings"],keyboardBindings:["type",Ja]};var W0={moveSpeed:1,moveSpeedAccelerated:10},U0=1500,el="left",tl="up",nl="right",il="down",Y0={ArrowLeft:el,Left:el,ArrowUp:tl,Up:tl,ArrowRight:nl,Right:nl,ArrowDown:il,Down:il},K0={left:function(e){return{x:-e,y:0}},up:function(e){return{x:0,y:-e}},right:function(e){return{x:e,y:0}},down:function(e){return{x:0,y:e}}};function Eh(e,t,n,i,o){var a=this;this._config=C({},W0,e||{}),t.addListener(U0,function(r){var s=r.keyEvent,c=Y0[s.key];if(c&&!t.isCmd(s)){var d=t.isShift(s);return a.moveSelection(c,d),!0}}),this.moveSelection=function(r,s){var c=o.get();if(c.length){var d=this._config[s?"moveSpeedAccelerated":"moveSpeed"],l=K0[r](d),p=i.allowed("elements.move",{shapes:c});p&&n.moveElements(c,l)}}}Eh.$inject=["config.keyboardMoveSelection","keyboard","modeling","rules","selection"];const Z0={__depends__:[_s,Jt],__init__:["keyboardMoveSelection"],keyboardMoveSelection:["type",Eh]};var ol=10;function so(e,t,n,i){this._dragging=i,this._rules=t;var o=this;function a(c,d){var l=c.shape,p=c.direction,u=c.resizeConstraints,m;c.delta=d,m=L_(l,p,d),c.newBounds=j_(m,u),c.canExecute=o.canResize(c)}function r(c){var d=c.resizeConstraints,l=c.minBounds;d===void 0&&(l===void 0&&(l=o.computeMinResizeBox(c)),c.resizeConstraints={min:U(l)})}function s(c){var d=c.shape,l=c.canExecute,p=c.newBounds;if(l){if(p=Fl(p),!X0(d,p))return;n.resizeShape(d,p)}}e.on("resize.start",function(c){r(c.context)}),e.on("resize.move",function(c){var d={x:c.dx,y:c.dy};a(c.context,d)}),e.on("resize.end",function(c){s(c.context)})}so.prototype.canResize=function(e){var t=this._rules,n=fn(e,["newBounds","shape","delta","direction"]);return t.allowed("shape.resize",n)};so.prototype.activate=function(e,t,n){var i=this._dragging,o,a;if(typeof n=="string"&&(n={direction:n}),o=C({shape:t},n),a=o.direction,!a)throw new Error("must provide a direction (n|w|s|e|nw|se|ne|sw)");i.init(e,xh(t,a),"resize",{autoActivate:!0,cursor:J0(a),data:{shape:t,context:o}})};so.prototype.computeMinResizeBox=function(e){var t=e.shape,n=e.direction,i,o;return i=e.minDimensions||{width:ol,height:ol},o=Uu(t,e.childrenBoxPadding),$_(n,t,i,o)};so.$inject=["eventBus","rules","modeling","dragging"];function X0(e,t){return e.x!==t.x||e.y!==t.y||e.width!==t.width||e.height!==t.height}function xh(e,t){var n=Z(e),i=U(e),o={x:n.x,y:n.y};return t.indexOf("n")!==-1?o.y=i.top:t.indexOf("s")!==-1&&(o.y=i.bottom),t.indexOf("e")!==-1?o.x=i.right:t.indexOf("w")!==-1&&(o.x=i.left),o}function J0(e){var t="resize-";return e==="n"||e==="s"?t+"ns":e==="e"||e==="w"?t+"ew":e==="nw"||e==="se"?t+"nwse":t+"nesw"}var al="djs-resizing",rl="resize-not-ok",Q0=500;function Ph(e,t,n){function i(a){var r=a.shape,s=a.newBounds,c=a.frame;c||(c=a.frame=n.addFrame(r,t.getActiveLayer()),t.addMarker(r,al)),s.width>5&&J(c,{x:s.x,width:s.width}),s.height>5&&J(c,{y:s.y,height:s.height}),a.canExecute?xe(c).remove(rl):xe(c).add(rl)}function o(a){var r=a.shape,s=a.frame;s&&ot(a.frame),t.removeMarker(r,al)}e.on("resize.move",Q0,function(a){i(a.context)}),e.on("resize.cleanup",function(a){o(a.context)})}Ph.$inject=["eventBus","canvas","previewSupport"];var Ao=-6,ko=8,Do=20,Pi="djs-resizer",eE=["n","w","s","e","nw","ne","se","sw"];function Sn(e,t,n,i){this._resize=i,this._canvas=t;var o=this;e.on("selection.changed",function(a){var r=a.newSelection;o.removeResizers(),r.length===1&&T(r,as(o.addResizer,o))}),e.on("shape.changed",function(a){var r=a.element;n.isSelected(r)&&(o.removeResizers(),o.addResizer(r))})}Sn.prototype.makeDraggable=function(e,t,n){var i=this._resize;function o(a){ps(a)&&i.activate(a,e,n)}ue.bind(t,"mousedown",o),ue.bind(t,"touchstart",o)};Sn.prototype._createResizer=function(e,t,n,i){var o=this._getResizersParent(),a=tE(i),r=be("g");xe(r).add(Pi),xe(r).add(Pi+"-"+e.id),xe(r).add(Pi+"-"+i),ve(o,r);var s=be("rect");J(s,{x:-ko/2+a.x,y:-ko/2+a.y,width:ko,height:ko}),xe(s).add(Pi+"-visual"),ve(r,s);var c=be("rect");return J(c,{x:-Do/2+a.x,y:-Do/2+a.y,width:Do,height:Do}),xe(c).add(Pi+"-hit"),ve(r,c),ff(r,t,n),r};Sn.prototype.createResizer=function(e,t){var n=xh(e,t),i=this._createResizer(e,n.x,n.y,t);this.makeDraggable(e,i,t)};Sn.prototype.addResizer=function(e){var t=this;ye(e)||!this._resize.canResize({shape:e})||T(eE,function(n){t.createResizer(e,n)})};Sn.prototype.removeResizers=function(){var e=this._getResizersParent();ls(e)};Sn.prototype._getResizersParent=function(){return this._canvas.getLayer("resizers")};Sn.$inject=["eventBus","canvas","selection","resize"];function tE(e){var t={x:0,y:0};return e.indexOf("e")!==-1?t.x=-Ao:e.indexOf("w")!==-1&&(t.x=Ao),e.indexOf("s")!==-1?t.y=-Ao:e.indexOf("n")!==-1&&(t.y=Ao),t}const Sh={__depends__:[$t,en,di],__init__:["resize","resizePreview","resizeHandles"],resize:["type",so],resizePreview:["type",Ph],resizeHandles:["type",Sn]};var nE=2e3;function co(e,t,n,i,o,a,r){this._bpmnFactory=t,this._canvas=n,this._modeling=o,this._textRenderer=r,i.registerProvider(this),e.on("element.dblclick",function(c){s(c.element,!0)}),e.on(["autoPlace.start","canvas.viewbox.changing","drag.init","element.mousedown","popupMenu.open","root.set","selection.changed"],function(){i.isActive()&&i.complete()}),e.on(["shape.remove","connection.remove"],nE,function(c){i.isActive(c.element)&&i.cancel()}),e.on(["commandStack.changed"],function(c){i.isActive()&&i.cancel()}),e.on("directEditing.activate",function(c){a.removeResizers()}),e.on("create.end",500,function(c){var d=c.context,l=d.shape,p=c.context.canExecute,u=c.isTouch;u||p&&(d.hints&&d.hints.createElementsBehavior===!1||s(l))}),e.on("autoPlace.end",500,function(c){s(c.shape)});function s(c,d){(d||Q(c,["bpmn:Task","bpmn:TextAnnotation","bpmn:Participant"])||Lc(c))&&i.activate(c)}}co.$inject=["eventBus","bpmnFactory","canvas","directEditing","modeling","resizeHandles","textRenderer"];co.prototype.activate=function(e){var t=Yt(e);if(t!==void 0){var n={text:t},i=this.getEditingBBox(e);C(n,i);var o={},a=n.style||{};return C(a,{backgroundColor:null,border:null}),(Q(e,["bpmn:Task","bpmn:Participant","bpmn:Lane","bpmn:CallActivity"])||Lc(e))&&C(o,{centerVertically:!0}),Kn(e)&&(C(o,{autoResize:!0}),C(a,{backgroundColor:"#ffffff",border:"1px solid #ccc"})),_(e,"bpmn:TextAnnotation")&&(C(o,{resizable:!0,autoResize:!0}),C(a,{backgroundColor:"#ffffff",border:"1px solid #ccc"})),C(n,{options:o,style:a}),n}};co.prototype.getEditingBBox=function(e){var t=this._canvas,n=e.label||e,i=t.getAbsoluteBBox(n),o={x:i.x+i.width/2,y:i.y+i.height/2},a={x:i.x,y:i.y},r=t.zoom(),s=this._textRenderer.getDefaultStyle(),c=this._textRenderer.getExternalStyle(),d=c.fontSize*r,l=c.lineHeight,p=s.fontSize*r,u=s.lineHeight,m={fontFamily:this._textRenderer.getDefaultStyle().fontFamily,fontWeight:this._textRenderer.getDefaultStyle().fontWeight};if(_(e,"bpmn:Lane")||aE(e)){var h=Ze(e),g=h?{width:i.height,height:30*r,x:i.x-i.height/2+15*r,y:o.y-30*r/2}:{width:i.width,height:30*r};C(a,g),C(m,{fontSize:p+"px",lineHeight:u,paddingTop:7*r+"px",paddingBottom:7*r+"px",paddingLeft:5*r+"px",paddingRight:5*r+"px",transform:h?"rotate(-90deg)":null})}if(oE(e)){var f=Ze(e),w=f?{width:i.width,height:i.height}:{width:i.height,height:i.width,x:o.x-i.height/2,y:o.y-i.width/2};C(a,w),C(m,{fontSize:p+"px",lineHeight:u,paddingTop:7*r+"px",paddingBottom:7*r+"px",paddingLeft:5*r+"px",paddingRight:5*r+"px",transform:f?null:"rotate(-90deg)"})}(Q(e,["bpmn:Task","bpmn:CallActivity"])||Lc(e))&&(C(a,{width:i.width,height:i.height}),C(m,{fontSize:p+"px",lineHeight:u,paddingTop:7*r+"px",paddingBottom:7*r+"px",paddingLeft:5*r+"px",paddingRight:5*r+"px"})),iE(e)&&(C(a,{width:i.width,x:i.x}),C(m,{fontSize:p+"px",lineHeight:u,paddingTop:7*r+"px",paddingBottom:7*r+"px",paddingLeft:5*r+"px",paddingRight:5*r+"px"}));var E=90*r,v=7*r,y=4*r;if(n.labelTarget&&(C(a,{width:E,height:i.height+v+y,x:o.x-E/2,y:i.y-v}),C(m,{fontSize:d+"px",lineHeight:l,paddingTop:v+"px",paddingBottom:y+"px"})),Kn(n)&&!ua(n)&&!ce(n)){var P=Ll(e),x=t.getAbsoluteBBox({x:P.x,y:P.y,width:0,height:0}),I=d+v+y;C(a,{width:E,height:I,x:x.x-E/2,y:x.y-I/2}),C(m,{fontSize:d+"px",lineHeight:l,paddingTop:v+"px",paddingBottom:y+"px"})}return _(e,"bpmn:TextAnnotation")&&(C(a,{width:i.width,height:i.height,minWidth:30*r,minHeight:10*r}),C(m,{textAlign:"left",paddingTop:5*r+"px",paddingBottom:7*r+"px",paddingLeft:7*r+"px",paddingRight:5*r+"px",fontSize:p+"px",lineHeight:u})),{bounds:a,style:m}};co.prototype.update=function(e,t,n,i){var o,a;_(e,"bpmn:TextAnnotation")&&(a=this._canvas.getAbsoluteBBox(e),o={x:e.x,y:e.y,width:e.width/a.width*i.width,height:e.height/a.height*i.height}),rE(t)&&(t=null),this._modeling.updateLabel(e,t,o)};function Lc(e){return _(e,"bpmn:SubProcess")&&!pe(e)}function iE(e){return _(e,"bpmn:SubProcess")&&pe(e)}function oE(e){return _(e,"bpmn:Participant")&&!pe(e)}function aE(e){return _(e,"bpmn:Participant")&&pe(e)}function rE(e){return!e||!e.trim()}var sl="djs-element-hidden",cl="djs-label-hidden";function Th(e,t,n){var i=this,o=t.getDefaultLayer(),a,r,s;e.on("directEditing.activate",function(c){var d=c.active;if(a=d.element.label||d.element,_(a,"bpmn:TextAnnotation")){r=t.getAbsoluteBBox(a),s=be("g");var l=n.getScaledPath("TEXT_ANNOTATION",{xScaleFactor:1,yScaleFactor:1,containerWidth:a.width,containerHeight:a.height,position:{mx:0,my:0}}),p=i.path=be("path");J(p,{d:l,strokeWidth:2,stroke:sE(a)}),ve(s,p),ve(o,s),it(s,a.x,a.y)}_(a,"bpmn:TextAnnotation")||a.labelTarget?t.addMarker(a,sl):(_(a,"bpmn:Task")||_(a,"bpmn:CallActivity")||_(a,"bpmn:SubProcess")||_(a,"bpmn:Participant")||_(a,"bpmn:Lane"))&&t.addMarker(a,cl)}),e.on("directEditing.resize",function(c){if(_(a,"bpmn:TextAnnotation")){var d=c.height,l=c.dy,p=Math.max(a.height/r.height*(d+l),0),u=n.getScaledPath("TEXT_ANNOTATION",{xScaleFactor:1,yScaleFactor:1,containerWidth:a.width,containerHeight:p,position:{mx:0,my:0}});J(i.path,{d:u})}}),e.on(["directEditing.complete","directEditing.cancel"],function(c){var d=c.active;d&&(t.removeMarker(d.element.label||d.element,sl),t.removeMarker(a,cl)),a=void 0,r=void 0,s&&(ot(s),s=void 0)})}Th.$inject=["eventBus","canvas","pathMap"];function sE(e,t){var n=fe(e);return n.get("stroke")||t||"black"}const cE={__depends__:[Gl,Sh,hh],__init__:["labelEditingProvider","labelEditingPreview"],labelEditingProvider:["type",co],labelEditingPreview:["type",Th]};var dE=new rs("tt");function pE(e){var t=at('<div class="djs-tooltip-container" />');return fs(t,{position:"absolute",width:"0",height:"0"}),e.insertBefore(t,e.firstChild),t}function lE(e,t,n){fs(e,{left:t+"px",top:n+"px"})}function Gc(e,t){e.style.display=t===!1?"none":""}var Mh="djs-tooltip",br="."+Mh;function dt(e,t){this._eventBus=e,this._canvas=t,this._ids=dE,this._tooltipDefaults={show:{minZoom:.7,maxZoom:5}},this._tooltips={},this._tooltipRoot=pE(t.getContainer());var n=this;Ct.bind(this._tooltipRoot,br,"mousedown",function(i){i.stopPropagation()}),Ct.bind(this._tooltipRoot,br,"mouseover",function(i){n.trigger("mouseover",i)}),Ct.bind(this._tooltipRoot,br,"mouseout",function(i){n.trigger("mouseout",i)}),this._init()}dt.$inject=["eventBus","canvas"];dt.prototype.add=function(e){if(!e.position)throw new Error("must specifiy tooltip position");if(!e.html)throw new Error("must specifiy tooltip html");var t=this._ids.next();return e=C({},this._tooltipDefaults,e,{id:t}),this._addTooltip(e),e.timeout&&this.setTimeout(e),t};dt.prototype.trigger=function(e,t){var n=t.delegateTarget||t.target,i=this.get(ct(n,"data-tooltip-id"));i&&(e==="mouseover"&&i.timeout&&this.clearTimeout(i),e==="mouseout"&&i.timeout&&(i.timeout=1e3,this.setTimeout(i)))};dt.prototype.get=function(e){return typeof e!="string"&&(e=e.id),this._tooltips[e]};dt.prototype.clearTimeout=function(e){if(e=this.get(e),!!e){var t=e.removeTimer;t&&(clearTimeout(t),e.removeTimer=null)}};dt.prototype.setTimeout=function(e){if(e=this.get(e),!!e){this.clearTimeout(e);var t=this;e.removeTimer=setTimeout(function(){t.remove(e)},e.timeout)}};dt.prototype.remove=function(e){var t=this.get(e);t&&(xr(t.html),xr(t.htmlContainer),delete t.htmlContainer,delete this._tooltips[t.id])};dt.prototype.show=function(){Gc(this._tooltipRoot)};dt.prototype.hide=function(){Gc(this._tooltipRoot,!1)};dt.prototype._updateRoot=function(e){var t=e.scale||1,n=e.scale||1,i="matrix("+t+",0,0,"+n+","+-1*e.x*t+","+-1*e.y*n+")";this._tooltipRoot.style.transform=i,this._tooltipRoot.style["-ms-transform"]=i};dt.prototype._addTooltip=function(e){var t=e.id,n=e.html,i,o=this._tooltipRoot;n.get&&n.constructor.prototype.jquery&&(n=n.get(0)),pa(n)&&(n=at(n)),i=at('<div data-tooltip-id="'+t+'" class="'+Mh+'">'),fs(i,{position:"absolute"}),i.appendChild(n),e.type&&ze(i).add("djs-tooltip-"+e.type),e.className&&ze(i).add(e.className),e.htmlContainer=i,o.appendChild(i),this._tooltips[t]=e,this._updateTooltip(e)};dt.prototype._updateTooltip=function(e){var t=e.position,n=e.htmlContainer;lE(n,t.x,t.y)};dt.prototype._updateTooltipVisibilty=function(e){T(this._tooltips,function(t){var n=t.show,i=t.htmlContainer,o=!0;n&&((n.minZoom>e.scale||n.maxZoom<e.scale)&&(o=!1),Gc(i,o))})};dt.prototype._init=function(){var e=this;function t(n){e._updateRoot(n),e._updateTooltipVisibilty(n),e.show()}this._eventBus.on("canvas.viewbox.changing",function(n){e.hide()}),this._eventBus.on("canvas.viewbox.changed",function(n){t(n.viewbox)})};const uE={__init__:["tooltips"],tooltips:["type",dt]};var mE="flow elements must be children of pools/participants";function Nh(e,t,n){function i(o,a,r){t.add({position:{x:o.x+5,y:o.y+5},type:"error",timeout:2e3,html:"<div>"+a+"</div>"})}e.on(["shape.move.rejected","create.rejected"],function(o){var a=o.context,r=a.shape,s=a.target;_(s,"bpmn:Collaboration")&&_(r,"bpmn:FlowNode")&&i(o,n(mE))})}Nh.$inject=["eventBus","tooltips","translate"];const hE={__depends__:[uE],__init__:["modelingFeedback"],modelingFeedback:["type",Nh]};var fE=500,gE=1250,_E=1500,aa=Math.round;function bE(e){return{x:e.x+aa(e.width/2),y:e.y+aa(e.height/2)}}function Ch(e,t,n,i,o){function a(s,c,d,l){return o.allowed("elements.move",{shapes:s,delta:c,position:d,target:l})}e.on("shape.move.start",_E,function(s){var c=s.context,d=s.shape,l=i.get().slice();l.indexOf(d)===-1&&(l=[d]),l=vE(l),C(c,{shapes:l,validatedShapes:l,shape:d})}),e.on("shape.move.start",gE,function(s){var c=s.context,d=c.validatedShapes,l;if(l=c.canExecute=a(d),!l)return!1}),e.on("shape.move.move",fE,function(s){var c=s.context,d=c.validatedShapes,l=s.hover,p={x:s.dx,y:s.dy},u={x:s.x,y:s.y},m;if(m=a(d,p,u,l),c.delta=p,c.canExecute=m,m===null){c.target=null;return}c.target=l}),e.on("shape.move.end",function(s){var c=s.context,d=c.delta,l=c.canExecute,p=l==="attach",u=c.shapes;if(l===!1)return!1;d.x=aa(d.x),d.y=aa(d.y),!(d.x===0&&d.y===0)&&n.moveElements(u,d,c.target,{primaryShape:c.shape,attach:p})}),e.on("element.mousedown",function(s){if(ps(s)){var c=Al(s);if(!c)throw new Error("must supply DOM mousedown event");return r(c,s.element)}});function r(s,c,d,l){if(Xt(d)&&(l=d,d=!1),!(c.waypoints||!c.parent)&&!xe(s.target).has("djs-hit-no-move")){var p=bE(c);return t.init(s,p,"shape.move",{cursor:"grabbing",autoActivate:d,data:{shape:c,context:l||{}}}),!0}}this.start=r}Ch.$inject=["eventBus","dragging","modeling","selection","rules"];function vE(e){var t=la(e,"id");return ae(e,function(n){for(;n=n.parent;)if(t[n.id])return!1;return!0})}var dl=499,vr="djs-dragging",pl="drop-ok",ll="drop-not-ok",ul="new-parent",ml="attach-ok";function Rh(e,t,n,i){function o(c){var d=a(c),l=yE(d);return l}function a(c){var d=Gi(c,!0),l=d.flatMap(m=>(m.incoming||[]).concat(m.outgoing||[])),p=d.concat(l),u=[...new Set(p)];return u}function r(c,d){[ml,pl,ll,ul].forEach(function(l){l===d?t.addMarker(c,l):t.removeMarker(c,l)})}function s(c,d,l){i.addDragger(d,c.dragGroup),l&&t.addMarker(d,vr),c.allDraggedElements?c.allDraggedElements.push(d):c.allDraggedElements=[d]}e.on("shape.move.start",dl,function(c){var d=c.context,l=d.shapes,p=d.allDraggedElements,u=o(l);if(!d.dragGroup){var m=be("g");J(m,n.cls("djs-drag-group",["no-events"]));var h=t.getActiveLayer();ve(h,m),d.dragGroup=m}u.forEach(function(g){i.addDragger(g,d.dragGroup)}),p?p=ss([p,a(l)]):p=a(l),T(p,function(g){t.addMarker(g,vr)}),d.allDraggedElements=p,d.differentParents=wE(l)}),e.on("shape.move.move",dl,function(c){var d=c.context,l=d.dragGroup,p=d.target,u=d.shape.parent,m=d.canExecute;p&&(m==="attach"?r(p,ml):d.canExecute&&u&&p.id!==u.id?r(p,ul):r(p,d.canExecute?pl:ll)),it(l,c.dx,c.dy)}),e.on(["shape.move.out","shape.move.cleanup"],function(c){var d=c.context,l=d.target;l&&r(l,null)}),e.on("shape.move.cleanup",function(c){var d=c.context,l=d.allDraggedElements,p=d.dragGroup;T(l,function(u){t.removeMarker(u,vr)}),p&&ot(p)}),this.makeDraggable=s}Rh.$inject=["eventBus","canvas","styles","previewSupport"];function yE(e){var t=ae(e,function(n){return ye(n)?Te(e,Ut({id:n.source.id}))&&Te(e,Ut({id:n.target.id})):!0});return t}function wE(e){return gf(la(e,function(t){return t.parent&&t.parent.id}))!==1}const EE={__depends__:[Rl,Jt,_f,$t,en,di],__init__:["move","movePreview"],move:["type",Ch],movePreview:["type",Rh]};var Bh=".djs-palette-toggle",Ah=".entry",xE=Bh+", "+Ah,es="djs-palette-",PE="shown",ts="open",hl="two-column",SE=1e3;function Oe(e,t){this._eventBus=e,this._canvas=t;var n=this;e.on("tool-manager.update",function(i){var o=i.tool;n.updateToolHighlight(o)}),e.on("i18n.changed",function(){n._update()}),e.on("diagram.init",function(){n._diagramInitialized=!0,n._rebuild()})}Oe.$inject=["eventBus","canvas"];Oe.prototype.registerProvider=function(e,t){t||(t=e,e=SE),this._eventBus.on("palette.getProviders",e,function(n){n.providers.push(t)}),this._rebuild()};Oe.prototype.getEntries=function(){var e=this._getProviders();return e.reduce(ME,{})};Oe.prototype._rebuild=function(){if(this._diagramInitialized){var e=this._getProviders();e.length&&(this._container||this._init(),this._update())}};Oe.prototype._init=function(){var e=this,t=this._eventBus,n=this._getParentContainer(),i=this._container=at(Oe.HTML_MARKUP);n.appendChild(i),ze(n).add(es+PE),Ct.bind(i,xE,"click",function(o){var a=o.delegateTarget;if(sa(a,Bh))return e.toggle();e.trigger("click",o)}),ue.bind(i,"mousedown",function(o){o.stopPropagation()}),Ct.bind(i,Ah,"dragstart",function(o){e.trigger("dragstart",o)}),t.on("canvas.resized",this._layoutChanged,this),t.fire("palette.create",{container:i})};Oe.prototype._getProviders=function(e){var t=this._eventBus.createEvent({type:"palette.getProviders",providers:[]});return this._eventBus.fire(t),t.providers};Oe.prototype._toggleState=function(e){e=e||{};var t=this._getParentContainer(),n=this._container,i=this._eventBus,o,a=ze(n),r=ze(t);"twoColumn"in e?o=e.twoColumn:o=this._needsCollapse(t.clientHeight,this._entries||{}),a.toggle(hl,o),r.toggle(es+hl,o),"open"in e&&(a.toggle(ts,e.open),r.toggle(es+ts,e.open)),i.fire("palette.changed",{twoColumn:o,open:this.isOpen()})};Oe.prototype._update=function(){var e=Ue(".djs-palette-entries",this._container),t=this._entries=this.getEntries();jl(e),T(t,function(n,i){var o=n.group||"default",a=Ue("[data-group="+Ri(o)+"]",e);a||(a=at('<div class="group"></div>'),ct(a,"data-group",o),e.appendChild(a));var r=n.html||(n.separator?'<hr class="separator" />':'<div class="entry" draggable="true"></div>'),s=at(r);if(a.appendChild(s),!n.separator&&(ct(s,"data-action",i),n.title&&ct(s,"title",n.title),n.className&&TE(s,n.className),n.imageUrl)){var c=at("<img>");ct(c,"src",n.imageUrl),s.appendChild(c)}}),this.open()};Oe.prototype.trigger=function(e,t,n){var i,o,a=t.delegateTarget||t.target;return a?(i=ct(a,"data-action"),o=t.originalEvent||t,this.triggerEntry(i,e,o,n)):t.preventDefault()};Oe.prototype.triggerEntry=function(e,t,n,i){var o=this._entries,a,r;if(a=o[e],!!a&&(r=a.action,this._eventBus.fire("palette.trigger",{entry:a,event:n})!==!1)){if(xt(r)){if(t==="click")return r(n,i)}else if(r[t])return r[t](n,i);n.preventDefault()}};Oe.prototype._layoutChanged=function(){this._toggleState({})};Oe.prototype._needsCollapse=function(e,t){var n=50,i=Object.keys(t).length*46;return e<i+n};Oe.prototype.close=function(){this._toggleState({open:!1,twoColumn:!1})};Oe.prototype.open=function(){this._toggleState({open:!0})};Oe.prototype.toggle=function(){this.isOpen()?this.close():this.open()};Oe.prototype.isActiveTool=function(e){return e&&this._activeTool===e};Oe.prototype.updateToolHighlight=function(e){var t,n;this._toolsContainer||(t=Ue(".djs-palette-entries",this._container),this._toolsContainer=Ue("[data-group=tools]",t)),n=this._toolsContainer,T(n.children,function(i){var o=i.getAttribute("data-action");if(o){var a=ze(i);o=o.replace("-tool",""),a.contains("entry")&&o===e?a.add("highlighted-entry"):a.remove("highlighted-entry")}})};Oe.prototype.isOpen=function(){return ze(this._container).has(ts)};Oe.prototype._getParentContainer=function(){return this._canvas.getContainer()};Oe.HTML_MARKUP='<div class="djs-palette"><div class="djs-palette-entries"></div><div class="djs-palette-toggle"></div></div>';function TE(e,t){var n=ze(e),i=se(t)?t:t.split(/\s+/g);i.forEach(function(o){n.add(o)})}function ME(e,t){var n=t.getPaletteEntries();return xt(n)?n(e):(T(n,function(i,o){e[o]=i}),e)}const NE={__init__:["palette"],palette:["type",Oe]};var kh="crosshair";function jn(e,t,n,i,o,a,r){this._selection=o,this._dragging=n,this._mouse=r;var s=this,c={create:function(d){var l=t.getActiveLayer(),p;p=d.frame=be("rect"),J(p,{class:"djs-lasso-overlay",width:1,height:1,x:0,y:0}),ve(l,p)},update:function(d){var l=d.frame,p=d.bbox;J(l,{x:p.x,y:p.y,width:p.width,height:p.height})},remove:function(d){d.frame&&ot(d.frame)}};a.registerTool("lasso",{tool:"lasso.selection",dragging:"lasso"}),e.on("lasso.selection.end",function(d){var l=d.originalEvent.target;!d.hover&&!(l instanceof SVGElement)||e.once("lasso.selection.ended",function(){s.activateLasso(d.originalEvent,!0)})}),e.on("lasso.end",0,function(d){var l=d.context,p=yr(d),u=i.filter(function(h){return h}),m=Mr(d);s.select(u,p,m?l.selection:[])}),e.on("lasso.start",function(d){var l=d.context;l.bbox=yr(d),c.create(l),l.selection=o.get()}),e.on("lasso.move",function(d){var l=d.context;l.bbox=yr(d),c.update(l)}),e.on("lasso.cleanup",function(d){var l=d.context;c.remove(l)}),e.on("element.mousedown",1500,function(d){if(Mr(d))return s.activateLasso(d.originalEvent),!0})}jn.$inject=["eventBus","canvas","dragging","elementRegistry","selection","toolManager","mouse"];jn.prototype.activateLasso=function(e,t){this._dragging.init(e,"lasso",{autoActivate:t,cursor:kh,data:{context:{}}})};jn.prototype.activateSelection=function(e,t){this._dragging.init(e,"lasso.selection",{trapClick:!1,autoActivate:t,cursor:kh,data:{context:{}},keepSelection:!0})};jn.prototype.select=function(e,t,n=[]){var i=bf(e,t);this._selection.select([...n,...cs(i)])};jn.prototype.toggle=function(){if(this.isActive())return this._dragging.cancel();var e=this._mouse.getLastMoveEvent();this.activateSelection(e,!!e)};jn.prototype.isActive=function(){var e=this._dragging.context();return e&&/^lasso/.test(e.prefix)};function yr(e){var t={x:e.x-e.dx,y:e.y-e.dy},n={x:e.x,y:e.y},i;return t.x<=n.x&&t.y<n.y||t.x<n.x&&t.y<=n.y?i={x:t.x,y:t.y,width:n.x-t.x,height:n.y-t.y}:t.x>=n.x&&t.y<n.y||t.x>n.x&&t.y<=n.y?i={x:n.x,y:t.y,width:t.x-n.x,height:n.y-t.y}:t.x<=n.x&&t.y>n.y||t.x<n.x&&t.y>=n.y?i={x:t.x,y:n.y,width:n.x-t.x,height:t.y-n.y}:t.x>=n.x&&t.y>n.y||t.x>n.x&&t.y>=n.y?i={x:n.x,y:n.y,width:t.x-n.x,height:t.y-n.y}:i={x:n.x,y:n.y,width:0,height:0},i}const CE={__depends__:[Da,Wi],__init__:["lassoTool"],lassoTool:["type",jn]};var wr=1500,Dh="grab";function pi(e,t,n,i,o,a){this._dragging=n,this._mouse=a;var r=this,s=i.get("keyboard",!1);o.registerTool("hand",{tool:"hand",dragging:"hand.move"}),e.on("element.mousedown",wr,function(c){if(Ai(c))return r.activateMove(c.originalEvent,!0),!1}),s&&s.addListener(wr,function(c){if(!(!fl(c.keyEvent)||r.isActive())){var d=r._mouse.getLastMoveEvent();r.activateMove(d,!!d)}},"keyboard.keydown"),s&&s.addListener(wr,function(c){!fl(c.keyEvent)||!r.isActive()||r.toggle()},"keyboard.keyup"),e.on("hand.end",function(c){var d=c.originalEvent.target;if(!c.hover&&!(d instanceof SVGElement))return!1;e.once("hand.ended",function(){r.activateMove(c.originalEvent,{reactivate:!0})})}),e.on("hand.move.move",function(c){var d=t.viewbox().scale;t.scroll({dx:c.dx*d,dy:c.dy*d})}),e.on("hand.move.end",function(c){var d=c.context,l=d.reactivate;return!Ai(c)&&l&&e.once("hand.move.ended",function(p){r.activateHand(p.originalEvent,!0,!0)}),!1})}pi.$inject=["eventBus","canvas","dragging","injector","toolManager","mouse"];pi.prototype.activateMove=function(e,t,n){typeof t=="object"&&(n=t,t=!1),this._dragging.init(e,"hand.move",{autoActivate:t,cursor:Dh,data:{context:n||{}}})};pi.prototype.activateHand=function(e,t,n){this._dragging.init(e,"hand",{trapClick:!1,autoActivate:t,cursor:Dh,data:{context:{reactivate:n}}})};pi.prototype.toggle=function(){if(this.isActive())return this._dragging.cancel();var e=this._mouse.getLastMoveEvent();this.activateHand(e,!!e)};pi.prototype.isActive=function(){var e=this._dragging.context();return e?/^(hand|hand\.move)$/.test(e.prefix):!1};function fl(e){return He("Space",e)}const RE={__depends__:[Da,Wi],__init__:["handTool"],handTool:["type",pi]};var gl="connect-ok",_l="connect-not-ok";function li(e,t,n,i,o,a,r){var s=this;this._dragging=t,this._rules=a,this._mouse=r,o.registerTool("global-connect",{tool:"global-connect",dragging:"global-connect.drag"}),e.on("global-connect.hover",function(c){var d=c.context,l=c.hover,p=d.canStartConnect=s.canStartConnect(l);p!==null&&(d.startTarget=l,i.addMarker(l,p?gl:_l))}),e.on(["global-connect.out","global-connect.cleanup"],function(c){var d=c.context.startTarget,l=c.context.canStartConnect;d&&i.removeMarker(d,l?gl:_l)}),e.on(["global-connect.ended"],function(c){var d=c.context,l=d.startTarget,p={x:c.x,y:c.y},u=s.canStartConnect(l);if(u)return e.once("element.out",function(){e.once(["connect.ended","connect.canceled"],function(){e.fire("global-connect.drag.ended")}),n.start(null,l,p)}),!1})}li.$inject=["eventBus","dragging","connect","canvas","toolManager","rules","mouse"];li.prototype.start=function(e,t){this._dragging.init(e,"global-connect",{autoActivate:t,trapClick:!1,data:{context:{}}})};li.prototype.toggle=function(){if(this.isActive())return this._dragging.cancel();var e=this._mouse.getLastMoveEvent();return this.start(e,!!e)};li.prototype.isActive=function(){var e=this._dragging.context();return e&&/^global-connect/.test(e.prefix)};li.prototype.canStartConnect=function(e){return this._rules.allowed("connection.start",{source:e})};const BE={__depends__:[As,$t,en,Da,Wi],globalConnect:["type",li]};function jc(e,t,n,i,o,a,r,s){this._palette=e,this._create=t,this._elementFactory=n,this._spaceTool=i,this._lassoTool=o,this._handTool=a,this._globalConnect=r,this._translate=s,e.registerProvider(this)}jc.$inject=["palette","create","elementFactory","spaceTool","lassoTool","handTool","globalConnect","translate"];jc.prototype.getPaletteEntries=function(){var e={},t=this._create,n=this._elementFactory,i=this._spaceTool,o=this._lassoTool,a=this._handTool,r=this._globalConnect,s=this._translate;function c(p,u,m,h,g){function f(w){var E=n.createShape(C({type:p},g));t.start(w,E)}return{group:u,className:m,title:h,action:{dragstart:f,click:f}}}function d(p){var u=n.createShape({type:"bpmn:SubProcess",x:0,y:0,isExpanded:!0}),m=n.createShape({type:"bpmn:StartEvent",x:40,y:82,parent:u});t.start(p,[u,m],{hints:{autoSelect:[u]}})}function l(p){t.start(p,n.createParticipantShape())}return C(e,{"hand-tool":{group:"tools",className:"bpmn-icon-hand-tool",title:s("Activate hand tool"),action:{click:function(p){a.activateHand(p)}}},"lasso-tool":{group:"tools",className:"bpmn-icon-lasso-tool",title:s("Activate lasso tool"),action:{click:function(p){o.activateSelection(p)}}},"space-tool":{group:"tools",className:"bpmn-icon-space-tool",title:s("Activate create/remove space tool"),action:{click:function(p){i.activateSelection(p)}}},"global-connect-tool":{group:"tools",className:"bpmn-icon-connection-multi",title:s("Activate global connect tool"),action:{click:function(p){r.start(p)}}},"tool-separator":{group:"tools",separator:!0},"create.start-event":c("bpmn:StartEvent","event","bpmn-icon-start-event-none",s("Create start event")),"create.intermediate-event":c("bpmn:IntermediateThrowEvent","event","bpmn-icon-intermediate-event-none",s("Create intermediate/boundary event")),"create.end-event":c("bpmn:EndEvent","event","bpmn-icon-end-event-none",s("Create end event")),"create.exclusive-gateway":c("bpmn:ExclusiveGateway","gateway","bpmn-icon-gateway-none",s("Create gateway")),"create.task":c("bpmn:Task","activity","bpmn-icon-task",s("Create task")),"create.data-object":c("bpmn:DataObjectReference","data-object","bpmn-icon-data-object",s("Create data object reference")),"create.data-store":c("bpmn:DataStoreReference","data-store","bpmn-icon-data-store",s("Create data store reference")),"create.subprocess-expanded":{group:"activity",className:"bpmn-icon-subprocess-expanded",title:s("Create expanded sub-process"),action:{dragstart:d,click:d}},"create.participant-expanded":{group:"collaboration",className:"bpmn-icon-participant",title:s("Create pool/participant"),action:{dragstart:l,click:l}},"create.group":c("bpmn:Group","artifact","bpmn-icon-group",s("Create group"))}),e};const AE={__depends__:[NE,ka,Fm,CE,RE,BE,$l],__init__:["paletteProvider"],paletteProvider:["type",jc]};var kE=250;function $c(e,t,n,i,o){D.call(this,e);function a(s){var c=s.canExecute.replacements;T(c,function(d){var l=d.oldElementId,p={type:d.newElementType};if(!s.visualReplacements[l]){var u=t.get(l);C(p,{x:u.x,y:u.y});var m=n.createShape(p);i.addShape(m,u.parent);var h=Ue('[data-element-id="'+Ri(u.id)+'"]',s.dragGroup);h&&J(h,{display:"none"});var g=o.addDragger(m,s.dragGroup);s.visualReplacements[l]=g,i.removeShape(m)}})}function r(s){var c=s.visualReplacements;T(c,function(d,l){var p=Ue('[data-element-id="'+Ri(l)+'"]',s.dragGroup);p&&J(p,{display:"inline"}),d.remove(),c[l]&&delete c[l]})}e.on("shape.move.move",kE,function(s){var c=s.context,d=c.canExecute;c.visualReplacements||(c.visualReplacements={}),d&&d.replacements?a(c):r(c)})}$c.$inject=["eventBus","elementRegistry","elementFactory","canvas","previewSupport"];z($c,D);const DE={__depends__:[di],__init__:["bpmnReplacePreview"],bpmnReplacePreview:["type",$c]};var IE=1250,Er=40,FE=20,OE=10,bl=20,Ih=["x","y"],LE=Math.abs;function Fh(e){e.on(["connect.hover","connect.move","connect.end"],IE,function(t){var n=t.context,i=n.canExecute,o=n.start,a=n.hover,r=n.source,s=n.target;t.originalEvent&&ft(t.originalEvent)||(n.initialConnectionStart||(n.initialConnectionStart=n.connectionStart),i&&a&&GE(t,a,HE(a)),a&&qE(i,["bpmn:Association","bpmn:DataInputAssociation","bpmn:DataOutputAssociation","bpmn:SequenceFlow"])?(n.connectionStart=Et(o),Q(a,["bpmn:Event","bpmn:Gateway"])&&vl(t,Et(a)),Q(a,["bpmn:Task","bpmn:SubProcess"])&&jE(t,a),_(r,"bpmn:BoundaryEvent")&&s===r.host&&$E(t)):Oh(i,"bpmn:MessageFlow")?(_(o,"bpmn:Event")&&(n.connectionStart=Et(o)),_(a,"bpmn:Event")&&vl(t,Et(a))):n.connectionStart=n.initialConnectionStart)})}Fh.$inject=["eventBus"];function GE(e,t,n){Ih.forEach(function(i){var o=Lh(i,t);e[i]<t[i]+n?Fe(e,i,t[i]+n):e[i]>t[i]+o-n&&Fe(e,i,t[i]+o-n)})}function jE(e,t){var n=Et(t);Ih.forEach(function(i){zE(e,t,i)&&Fe(e,i,n[i])})}function $E(e){var t=e.context,n=t.source,i=t.target;if(!VE(t)){var o=Et(n),a=Qe(o,i,-10),r=[];/top|bottom/.test(a)&&r.push("x"),/left|right/.test(a)&&r.push("y"),r.forEach(function(s){var c=e[s],d;LE(c-o[s])<Er&&(c>o[s]?d=o[s]+Er:d=o[s]-Er,Fe(e,s,d))})}}function vl(e,t){Fe(e,"x",t.x),Fe(e,"y",t.y)}function Oh(e,t){return e&&e.type===t}function qE(e,t){return ji(t,function(n){return Oh(e,n)})}function Lh(e,t){return e==="x"?t.width:t.height}function HE(e){return _(e,"bpmn:Task")?OE:FE}function zE(e,t,n){return e[n]>t[n]+bl&&e[n]<t[n]+Lh(n,t)-bl}function VE(e){var t=e.hover,n=e.source;return t&&n&&t===n}function Tn(){this._targets={},this._snapOrigins={},this._snapLocations=[],this._defaultSnaps={}}Tn.prototype.getSnapOrigin=function(e){return this._snapOrigins[e]};Tn.prototype.setSnapOrigin=function(e,t){this._snapOrigins[e]=t,this._snapLocations.indexOf(e)===-1&&this._snapLocations.push(e)};Tn.prototype.addDefaultSnap=function(e,t){var n=this._defaultSnaps[e];n||(n=this._defaultSnaps[e]=[]),n.push(t)};Tn.prototype.getSnapLocations=function(){return this._snapLocations};Tn.prototype.setSnapLocations=function(e){this._snapLocations=e};Tn.prototype.pointsForTarget=function(e){var t=e.id||e,n=this._targets[t];return n||(n=this._targets[t]=new Qa,n.initDefaults(this._defaultSnaps)),n};function Qa(){this._snapValues={}}Qa.prototype.add=function(e,t){var n=this._snapValues[e];n||(n=this._snapValues[e]={x:[],y:[]}),n.x.indexOf(t.x)===-1&&n.x.push(t.x),n.y.indexOf(t.y)===-1&&n.y.push(t.y)};Qa.prototype.snap=function(e,t,n,i){var o=this._snapValues[t];return o&&d_(e[n],o[n],i)};Qa.prototype.initDefaults=function(e){var t=this;T(e||{},function(n,i){T(n,function(o){t.add(i,o)})})};var WE=1250;function qt(e,t,n){var i=this;this._elementRegistry=e,t.on(["create.start","shape.move.start"],function(o){i.initSnap(o)}),t.on(["create.move","create.end","shape.move.move","shape.move.end"],WE,function(o){var a=o.context,r=a.shape,s=a.snapContext,c=a.target;if(!(o.originalEvent&&ft(o.originalEvent))&&!(ei(o)||!c)){var d=s.pointsForTarget(c);d.initialized||(d=i.addSnapTargetPoints(d,r,c),d.initialized=!0),n.snap(o,d)}}),t.on(["create.cleanup","shape.move.cleanup"],function(){n.hide()})}qt.$inject=["elementRegistry","eventBus","snapping"];qt.prototype.initSnap=function(e){var t=this._elementRegistry,n=e.context,i=n.shape,o=n.snapContext;o||(o=n.snapContext=new Tn);var a;t.get(i.id)?a=Et(i,e):a={x:e.x+Et(i).x,y:e.y+Et(i).y};var r={x:a.x-i.width/2,y:a.y-i.height/2},s={x:a.x+i.width/2,y:a.y+i.height/2};return o.setSnapOrigin("mid",{x:a.x-e.x,y:a.y-e.y}),ce(i)||(o.setSnapOrigin("top-left",{x:r.x-e.x,y:r.y-e.y}),o.setSnapOrigin("bottom-right",{x:s.x-e.x,y:s.y-e.y})),o};qt.prototype.addSnapTargetPoints=function(e,t,n){var i=this.getSnapTargets(t,n);return T(i,function(o){if(ce(o)){ce(t)&&e.add("mid",Et(o));return}if(ye(o)){if(o.waypoints.length<3)return;var a=o.waypoints.slice(1,-1);T(a,function(r){e.add("mid",r)});return}e.add("mid",Et(o))}),!te(t.x)||!te(t.y)||this._elementRegistry.get(t.id)&&e.add("mid",Et(t)),e};qt.prototype.getSnapTargets=function(e,t){return Gu(t).filter(function(n){return!UE(n)})};function UE(e){return!!e.hidden}var yl=1500;function ui(e,t){t.invoke(qt,this),e.on(["create.move","create.end"],yl,XE),e.on(["create.move","create.end","shape.move.move","shape.move.end"],yl,function(n){var i=n.context,o=i.canExecute,a=i.target,r=o&&(o==="attach"||o.attach);r&&!ei(n)&&YE(n,a)})}z(ui,qt);ui.$inject=["eventBus","injector"];ui.prototype.initSnap=function(e){var t=qt.prototype.initSnap.call(this,e),n=e.shape,i=!!this._elementRegistry.get(n.id);return T(n.outgoing,function(o){var a=o.waypoints[0];a=a.original||a,t.setSnapOrigin(o.id+"-docking",El(a,i,e))}),T(n.incoming,function(o){var a=o.waypoints[o.waypoints.length-1];a=a.original||a,t.setSnapOrigin(o.id+"-docking",El(a,i,e))}),_(n,"bpmn:Participant")&&t.setSnapLocations(["top-left","bottom-right","mid"]),t};ui.prototype.addSnapTargetPoints=function(e,t,n){qt.prototype.addSnapTargetPoints.call(this,e,t,n);var i=this.getSnapTargets(t,n);T(i,function(a){(ZE(a)||KE([t,a],"bpmn:TextAnnotation"))&&(e.add("top-left",Ou(a)),e.add("bottom-right",Lu(a)))});var o=this._elementRegistry;return T(t.incoming,function(a){if(o.get(t.id)){wl(i,a.source)||e.add("mid",Z(a.source));var r=a.waypoints[0];e.add(a.id+"-docking",r.original||r)}}),T(t.outgoing,function(a){if(o.get(t.id)){wl(i,a.target)||e.add("mid",Z(a.target));var r=a.waypoints[a.waypoints.length-1];e.add(a.id+"-docking",r.original||r)}}),_(n,"bpmn:SequenceFlow")&&(e=this.addSnapTargetPoints(e,t,n.parent)),e};ui.prototype.getSnapTargets=function(e,t){return qt.prototype.getSnapTargets.call(this,e,t).filter(function(n){return!_(n,"bpmn:Lane")})};function YE(e,t){var n=U(t),i=lm(e,t),o=e.context,a=o.shape,r;a.parent?r={x:0,y:0}:r=Z(a),/top/.test(i)?Fe(e,"y",n.top-r.y):/bottom/.test(i)&&Fe(e,"y",n.bottom-r.y),/left/.test(i)?Fe(e,"x",n.left-r.x):/right/.test(i)&&Fe(e,"x",n.right-r.x)}function KE(e,t){return e.every(function(n){return _(n,t)})}function ZE(e){return _(e,"bpmn:SubProcess")&&pe(e)?!0:_(e,"bpmn:Participant")}function XE(e){var t=e.context,n=t.createConstraints;if(n){var i=n.top,o=n.right,a=n.bottom,r=n.left;(r&&r>=e.x||o&&o<=e.x)&&Fe(e,"x",e.x),(i&&i>=e.y||a&&a<=e.y)&&Fe(e,"y",e.y)}}function wl(e,t){return e.indexOf(t)!==-1}function El(e,t,n){return t?{x:e.x-n.x,y:e.y-n.y}:{x:e.x,y:e.y}}var JE=1250;function po(e,t){var n=this;e.on(["resize.start"],function(i){n.initSnap(i)}),e.on(["resize.move","resize.end"],JE,function(i){var o=i.context,a=o.shape,r=a.parent,s=o.direction,c=o.snapContext;if(!(i.originalEvent&&ft(i.originalEvent))&&!ei(i)){var d=c.pointsForTarget(r);d.initialized||(d=n.addSnapTargetPoints(d,a,r,s),d.initialized=!0),t2(s)&&Fe(i,"x",i.x),n2(s)&&Fe(i,"y",i.y),t.snap(i,d)}}),e.on(["resize.cleanup"],function(){t.hide()})}po.prototype.initSnap=function(e){var t=e.context,n=t.shape,i=t.direction,o=t.snapContext;o||(o=t.snapContext=new Tn);var a=Gh(n,i);return o.setSnapOrigin("corner",{x:a.x-e.x,y:a.y-e.y}),o};po.prototype.addSnapTargetPoints=function(e,t,n,i){var o=this.getSnapTargets(t,n);return T(o,function(a){e.add("corner",Lu(a)),e.add("corner",Ou(a))}),e.add("corner",Gh(t,i)),e};po.$inject=["eventBus","snapping"];po.prototype.getSnapTargets=function(e,t){return Gu(t).filter(function(n){return!QE(n,e)&&!ye(n)&&!e2(n)&&!ce(n)})};function Gh(e,t){var n=Z(e),i=U(e),o={x:n.x,y:n.y};return t.indexOf("n")!==-1?o.y=i.top:t.indexOf("s")!==-1&&(o.y=i.bottom),t.indexOf("e")!==-1?o.x=i.right:t.indexOf("w")!==-1&&(o.x=i.left),o}function QE(e,t){return e.host===t}function e2(e){return!!e.hidden}function t2(e){return e==="n"||e==="s"}function n2(e){return e==="e"||e==="w"}var i2=7,o2=1e3;function Mn(e){this._canvas=e,this._asyncHide=vf(as(this.hide,this),o2)}Mn.$inject=["canvas"];Mn.prototype.snap=function(e,t){var n=e.context,i=n.snapContext,o=i.getSnapLocations(),a={x:ei(e,"x"),y:ei(e,"y")};T(o,function(r){var s=i.getSnapOrigin(r),c={x:e.x+s.x,y:e.y+s.y};if(T(["x","y"],function(d){var l;a[d]||(l=t.snap(c,r,d,i2),l!==void 0&&(a[d]={value:l,originValue:l-s[d]}))}),a.x&&a.y)return!1}),this.showSnapLine("vertical",a.x&&a.x.value),this.showSnapLine("horizontal",a.y&&a.y.value),T(["x","y"],function(r){var s=a[r];Xt(s)&&Fe(e,r,s.originValue)})};Mn.prototype._createLine=function(e){var t=this._canvas.getLayer("snap"),n=be("path");return J(n,{d:"M0,0 L0,0"}),xe(n).add("djs-snap-line"),ve(t,n),{update:function(i){te(i)?e==="horizontal"?J(n,{d:"M-100000,"+i+" L+100000,"+i,display:""}):J(n,{d:"M "+i+",-100000 L "+i+", +100000",display:""}):J(n,{display:"none"})}}};Mn.prototype._createSnapLines=function(){this._snapLines={horizontal:this._createLine("horizontal"),vertical:this._createLine("vertical")}};Mn.prototype.showSnapLine=function(e,t){var n=this.getSnapLine(e);n&&n.update(t),this._asyncHide()};Mn.prototype.getSnapLine=function(e){return this._snapLines||this._createSnapLines(),this._snapLines[e]};Mn.prototype.hide=function(){T(this._snapLines,function(e){e.update()})};const a2={__init__:["createMoveSnapping","resizeSnapping","snapping"],createMoveSnapping:["type",qt],resizeSnapping:["type",po],snapping:["type",Mn]},r2={__depends__:[a2],__init__:["connectSnapping","createMoveSnapping"],connectSnapping:["type",Fh],createMoveSnapping:["type",ui]};var jh=300;function K(e,t,n,i){this._open=!1,this._results={},this._eventMaps=[],this._cachedRootElement=null,this._cachedSelection=null,this._cachedViewbox=null,this._canvas=e,this._eventBus=t,this._selection=n,this._translate=i,this._container=this._getBoxHtml(),this._searchInput=Ue(K.INPUT_SELECTOR,this._container),this._resultsContainer=Ue(K.RESULTS_CONTAINER_SELECTOR,this._container),this._canvas.getContainer().appendChild(this._container),t.on(["canvas.destroy","diagram.destroy","drag.init","elements.changed"],this.close,this)}K.$inject=["canvas","eventBus","selection","translate"];K.prototype._bindEvents=function(){var e=this;function t(n,i,o,a){e._eventMaps.push({el:n,type:o,listener:Ct.bind(n,i,o,a)})}t(document,"html","click",function(n){e.close(!1)}),t(this._container,K.INPUT_SELECTOR,"click",function(n){n.stopPropagation(),n.delegateTarget.focus()}),t(this._container,K.RESULT_SELECTOR,"mouseover",function(n){n.stopPropagation(),e._scrollToNode(n.delegateTarget),e._preselect(n.delegateTarget)}),t(this._container,K.RESULT_SELECTOR,"click",function(n){n.stopPropagation(),e._select(n.delegateTarget)}),t(this._container,K.INPUT_SELECTOR,"keydown",function(n){He("ArrowUp",n)&&n.preventDefault(),He("ArrowDown",n)&&n.preventDefault()}),t(this._container,K.INPUT_SELECTOR,"keyup",function(n){if(He("Escape",n))return e.close();if(He("Enter",n)){var i=e._getCurrentResult();return i?e._select(i):e.close(!1)}if(He("ArrowUp",n))return e._scrollToDirection(!0);if(He("ArrowDown",n))return e._scrollToDirection();He(["ArrowLeft","ArrowRight"],n)||e._search(n.delegateTarget.value)})};K.prototype._unbindEvents=function(){this._eventMaps.forEach(function(e){Ct.unbind(e.el,e.type,e.listener)})};K.prototype._search=function(e){var t=this;if(this._clearResults(),!(!e||e==="")){var n=this._searchProvider.find(e);if(n=n.filter(function(o){return!t._canvas.getRootElements().includes(o.element)}),!n.length){this._clearMarkers(),this._selection.select(null);return}n.forEach(function(o){var a=o.element.id,r=t._createResultNode(o,a);t._results[a]={element:o.element,node:r}});var i=Ue(K.RESULT_SELECTOR,this._resultsContainer);this._scrollToNode(i),this._preselect(i)}};K.prototype._scrollToDirection=function(e){var t=this._getCurrentResult();if(t){var n=e?t.previousElementSibling:t.nextElementSibling;n&&(this._scrollToNode(n),this._preselect(n))}};K.prototype._scrollToNode=function(e){if(!(!e||e===this._getCurrentResult())){var t=e.offsetTop,n=this._resultsContainer.scrollTop,i=t-this._resultsContainer.clientHeight+e.clientHeight;t<n?this._resultsContainer.scrollTop=t:n<i&&(this._resultsContainer.scrollTop=i)}};K.prototype._clearResults=function(){jl(this._resultsContainer),this._results={},this._eventBus.fire("searchPad.cleared")};K.prototype._clearMarkers=function(){for(var e in this._results)this._canvas.removeMarker(this._results[e].element,"djs-search-preselected")};K.prototype._getCurrentResult=function(){return Ue(K.RESULT_SELECTED_SELECTOR,this._resultsContainer)};K.prototype._createResultNode=function(e,t){var n=at(K.RESULT_HTML);return e.primaryTokens.length>0&&xl(n,e.primaryTokens,K.RESULT_PRIMARY_HTML),xl(n,e.secondaryTokens,K.RESULT_SECONDARY_HTML),ct(n,K.RESULT_ID_ATTRIBUTE,t),this._resultsContainer.appendChild(n),n};K.prototype.registerProvider=function(e){this._searchProvider=e};K.prototype.open=function(){if(!this._searchProvider)throw new Error("no search provider registered");this.isOpen()||(this._cachedRootElement=this._canvas.getRootElement(),this._cachedSelection=this._selection.get(),this._cachedViewbox=this._canvas.viewbox(),this._bindEvents(),this._open=!0,ze(this._canvas.getContainer()).add("djs-search-open"),ze(this._container).add("open"),this._searchInput.focus(),this._eventBus.fire("searchPad.opened"))};K.prototype.close=function(e=!0){this.isOpen()&&(e&&(this._cachedRootElement&&this._canvas.setRootElement(this._cachedRootElement),this._cachedSelection&&this._selection.select(this._cachedSelection),this._cachedViewbox&&this._canvas.viewbox(this._cachedViewbox),this._eventBus.fire("searchPad.restored")),this._cachedRootElement=null,this._cachedSelection=null,this._cachedViewbox=null,this._unbindEvents(),this._open=!1,ze(this._canvas.getContainer()).remove("djs-search-open"),ze(this._container).remove("open"),this._clearMarkers(),this._clearResults(),this._searchInput.value="",this._searchInput.blur(),this._eventBus.fire("searchPad.closed"))};K.prototype.toggle=function(){this.isOpen()?this.close():this.open()};K.prototype.isOpen=function(){return this._open};K.prototype._preselect=function(e){var t=this._getCurrentResult();if(e!==t){this._clearMarkers(),t&&ze(t).remove(K.RESULT_SELECTED_CLASS);var n=ct(e,K.RESULT_ID_ATTRIBUTE),i=this._results[n].element;ze(e).add(K.RESULT_SELECTED_CLASS),this._canvas.scrollToElement(i,{top:jh}),this._selection.select(i),this._canvas.addMarker(i,"djs-search-preselected"),this._eventBus.fire("searchPad.preselected",i)}};K.prototype._select=function(e){var t=ct(e,K.RESULT_ID_ATTRIBUTE),n=this._results[t].element;this._cachedSelection=null,this._cachedViewbox=null,this.close(!1),this._canvas.scrollToElement(n,{top:jh}),this._selection.select(n),this._eventBus.fire("searchPad.selected",n)};K.prototype._getBoxHtml=function(){const e=at(K.BOX_HTML),t=Ue(K.INPUT_SELECTOR,e);return t&&t.setAttribute("aria-label",this._translate("Search in diagram")),e};function xl(e,t,n){var i=s2(t),o=at(n);o.innerHTML=i,e.appendChild(o)}function s2(e){var t="";return e.forEach(function(n){n.matched?t+='<b class="'+K.RESULT_HIGHLIGHT_CLASS+'">'+Yc(n.matched)+"</b>":t+=Yc(n.normal)}),t!==""?t:null}K.CONTAINER_SELECTOR=".djs-search-container";K.INPUT_SELECTOR=".djs-search-input input";K.RESULTS_CONTAINER_SELECTOR=".djs-search-results";K.RESULT_SELECTOR=".djs-search-result";K.RESULT_SELECTED_CLASS="djs-search-result-selected";K.RESULT_SELECTED_SELECTOR="."+K.RESULT_SELECTED_CLASS;K.RESULT_ID_ATTRIBUTE="data-result-id";K.RESULT_HIGHLIGHT_CLASS="djs-search-highlight";K.BOX_HTML=`<div class="djs-search-container djs-scrollable">
  <div class="djs-search-input">
    <svg class="djs-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
    </svg>
    <input type="text" spellcheck="false" />
  </div>
  <div class="djs-search-results" />
</div>`;K.RESULT_HTML='<div class="djs-search-result"></div>';K.RESULT_PRIMARY_HTML='<div class="djs-search-result-primary"></div>';K.RESULT_SECONDARY_HTML='<p class="djs-search-result-secondary"></p>';const c2={__depends__:[$l,Bl,Jt],searchPad:["type",K]};function qc(e,t,n){this._elementRegistry=e,this._canvas=n,t.registerProvider(this)}qc.$inject=["elementRegistry","searchPad","canvas"];qc.prototype.find=function(e){var t=this._canvas.getRootElements(),n=this._elementRegistry.filter(function(i){return!ce(i)&&!t.includes(i)});return n.reduce(function(i,o){var a=Yt(o),r=Tl(a,e),s=Tl(o.id,e);return ra(r)||ra(s)?[...i,{primaryTokens:r,secondaryTokens:s,element:o}]:i},[]).sort(function(i,o){return Pl(i.primaryTokens,o.primaryTokens)||Pl(i.secondaryTokens,o.secondaryTokens)||Sl(Yt(i.element),Yt(o.element))||Sl(i.element.id,o.element.id)}).map(function(i){return{element:i.element,primaryTokens:i.primaryTokens.map(function(o){return Bt(o,["index"])}),secondaryTokens:i.secondaryTokens.map(function(o){return Bt(o,["index"])})}})};function ns(e){return"matched"in e}function ra(e){return e.find(ns)}function Pl(e,t){const n=ra(e),i=ra(t);if(n&&!i)return-1;if(!n&&i)return 1;if(!n&&!i)return 0;const o=e.find(ns),a=t.find(ns);return o.index<a.index?-1:o.index>a.index?1:0}function Sl(e="",t=""){return e.localeCompare(t)}function Tl(e,t){var n=[],i=e;if(!e)return n;e=e.toLowerCase(),t=t.toLowerCase();var o=e.indexOf(t);return o>-1?(o!==0&&n.push({normal:i.slice(0,o),index:0}),n.push({matched:i.slice(o,o+t.length),index:o}),t.length+o<e.length&&n.push({normal:i.slice(o+t.length),index:o+t.length})):n.push({normal:i,index:0}),n}const d2={__depends__:[c2],__init__:["bpmnSearch"],bpmnSearch:["type",qc]};var p2='<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_1"><bpmn:process id="Process_1" isExecutable="false"><bpmn:startEvent id="StartEvent_1"/></bpmn:process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"><bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1"><dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>';function Gt(e){$i.call(this,e)}z(Gt,$i);Gt.Viewer=Li;Gt.NavigatedViewer=ki;Gt.prototype.createDiagram=function(){return this.importXML(p2)};Gt.prototype._interactionModules=[zl,Yl,Xl];Gt.prototype._modelingModules=[Eg,Ms,Vg,Gg,l_,As,__,b0,Rm,ka,E0,S0,q0,z0,V0,Z0,cE,Qm,hE,EE,AE,DE,Sh,r2,d2];Gt.prototype._modules=[].concat(Li.prototype._modules,Gt.prototype._interactionModules,Gt.prototype._modelingModules);const Ml={"Activate the hand tool":"Ativar ferramenta de mão","Activate hand tool":"Ativar ferramenta de mão","Hand tool":"Ferramenta de mão","Activate the lasso tool":"Ativar ferramenta de laço","Activate lasso tool":"Ativar ferramenta de laço","Lasso tool":"Ferramenta de laço","Activate the create/remove space tool":"Ativar ferramenta de criar/remover espaço","Activate create/remove space tool":"Ativar ferramenta de criar/remover espaço","Create/remove space tool":"Ferramenta de criar/remover espaço","Space tool":"Ferramenta de espaço","Activate the global connect tool":"Ativar ferramenta de conexão global","Activate global connect tool":"Ativar ferramenta de conexão global","Global connect tool":"Ferramenta de conexão global","Connect tool":"Ferramenta de conexão","Create StartEvent":"Criar Evento de Início","Create EndEvent":"Criar Evento de Fim","Create Task":"Criar Tarefa","Create Gateway":"Criar Gateway","Create Intermediate/Boundary Event":"Criar Evento Intermediário","Create Pool/Participant":"Criar Pool/Participante","Create DataObjectReference":"Criar Objeto de Dados","Create DataStoreReference":"Criar Armazém de Dados","Create Group":"Criar Grupo","Create expanded SubProcess":"Criar Sub-Processo expandido","Create CallActivity":"Criar Atividade de Chamada","Append Task":"Adicionar Tarefa","Append EndEvent":"Adicionar Evento de Fim","Append Gateway":"Adicionar Gateway","Append Intermediate/Boundary Event":"Adicionar Evento Intermediário","Append TextAnnotation":"Adicionar Anotação","Connect using Sequence/MessageFlow or Association":"Conectar usando Fluxo de Sequência/Mensagem","Connect using DataInputAssociation":"Conectar usando Associação de Entrada","Change type":"Alterar tipo",Delete:"Excluir",Remove:"Remover",Task:"Tarefa","Send Task":"Tarefa de Envio","Receive Task":"Tarefa de Recebimento","User Task":"Tarefa de Usuário","Manual Task":"Tarefa Manual","Business Rule Task":"Tarefa de Regra de Negócio","Service Task":"Tarefa de Serviço","Script Task":"Tarefa de Script","Call Activity":"Atividade de Chamada","Sub Process (collapsed)":"Sub-Processo (recolhido)","Sub Process (expanded)":"Sub-Processo (expandido)","Exclusive Gateway":"Gateway Exclusivo","Parallel Gateway":"Gateway Paralelo","Inclusive Gateway":"Gateway Inclusivo","Complex Gateway":"Gateway Complexo","Event based Gateway":"Gateway baseado em Evento","Start Event":"Evento de Início","Intermediate Throw Event":"Evento Intermediário de Envio","End Event":"Evento de Fim","Message Start Event":"Evento de Início por Mensagem","Timer Start Event":"Evento de Início por Temporizador","Conditional Start Event":"Evento de Início Condicional","Signal Start Event":"Evento de Início por Sinal","Message Intermediate Catch Event":"Evento Intermediário de Captura de Mensagem","Message Intermediate Throw Event":"Evento Intermediário de Envio de Mensagem","Timer Intermediate Catch Event":"Evento Intermediário de Temporizador","Escalation Intermediate Throw Event":"Evento Intermediário de Escalação","Conditional Intermediate Catch Event":"Evento Intermediário Condicional","Link Intermediate Catch Event":"Evento Intermediário de Link (Captura)","Link Intermediate Throw Event":"Evento Intermediário de Link (Envio)","Compensation Intermediate Throw Event":"Evento Intermediário de Compensação","Signal Intermediate Catch Event":"Evento Intermediário de Captura de Sinal","Signal Intermediate Throw Event":"Evento Intermediário de Envio de Sinal","Message End Event":"Evento de Fim por Mensagem","Escalation End Event":"Evento de Fim por Escalação","Error End Event":"Evento de Fim por Erro","Cancel End Event":"Evento de Fim por Cancelamento","Compensation End Event":"Evento de Fim por Compensação","Signal End Event":"Evento de Fim por Sinal","Terminate End Event":"Evento de Fim por Terminação","Message Boundary Event":"Evento de Limite por Mensagem","Timer Boundary Event":"Evento de Limite por Temporizador","Escalation Boundary Event":"Evento de Limite por Escalação","Conditional Boundary Event":"Evento de Limite Condicional","Error Boundary Event":"Evento de Limite por Erro","Cancel Boundary Event":"Evento de Limite por Cancelamento","Signal Boundary Event":"Evento de Limite por Sinal","Compensation Boundary Event":"Evento de Limite por Compensação","Non-interrupting Message Boundary Event":"Evento de Limite por Mensagem (Não-interruptivo)","Non-interrupting Timer Boundary Event":"Evento de Limite por Temporizador (Não-interruptivo)","Non-interrupting Escalation Boundary Event":"Evento de Limite por Escalação (Não-interruptivo)","Non-interrupting Conditional Boundary Event":"Evento de Limite Condicional (Não-interruptivo)","Non-interrupting Signal Boundary Event":"Evento de Limite por Sinal (Não-interruptivo)",Participant:"Participante",Pool:"Pool",Lane:"Raia","Data Object":"Objeto de Dados","Data Store":"Armazém de Dados","Text Annotation":"Anotação de Texto",Group:"Grupo","Sequence Flow":"Fluxo de Sequência","Message Flow":"Fluxo de Mensagem",Association:"Associação","Data Association":"Associação de Dados","Append {type}":"Adicionar {type}","Add Lane above":"Adicionar Raia acima","Add Lane below":"Adicionar Raia abaixo","Divide into two Lanes":"Dividir em duas Raias","Divide into three Lanes":"Dividir em três Raias","element name":"nome do elemento","no parent for {element} in {parent}":"sem pai para {element} em {parent}","no shape type specified":"tipo de forma não especificado","flow elements must be children of pools/participants":"elementos de fluxo devem ser filhos de pools/participantes","no process or collaboration to display":"nenhum processo ou colaboração para exibir","element {element} referenced by {referenced}#{property} not yet drawn":"elemento {element} referenciado por {referenced}#{property} ainda não desenhado","out of bounds release":"liberação fora dos limites","more than {count} child lanes":"mais de {count} raias filhas"};function is(e,t){return t=t||{},(Ml[e]||e).replace(/{([^}]+)}/g,function(i,o){const a=t[o];return a!==void 0?Ml[a]||a:"{"+o+"}"})}const l2={translate:["value",is]};var u2=1e3;function _t(e){this._eventBus=e}_t.$inject=["eventBus"];function m2(e,t){return function(n){return e.call(t||null,n.context,n.command,n)}}_t.prototype.on=function(e,t,n,i,o,a){if((qo(t)||ia(t))&&(a=o,o=i,i=n,n=t,t=null),qo(n)&&(a=o,o=i,i=n,n=u2),sw(o)&&(a=o,o=!1),!qo(i))throw new Error("handlerFn must be a function");eh(e)||(e=[e]);var r=this._eventBus;Ho(e,function(s){var c=["commandStack",s,t].filter(function(d){return d}).join(".");r.on(c,n,o?m2(i,a):i,a)})};_t.prototype.canExecute=an("canExecute");_t.prototype.preExecute=an("preExecute");_t.prototype.preExecuted=an("preExecuted");_t.prototype.execute=an("execute");_t.prototype.executed=an("executed");_t.prototype.postExecute=an("postExecute");_t.prototype.postExecuted=an("postExecuted");_t.prototype.revert=an("revert");_t.prototype.reverted=an("reverted");function an(e){return function(n,i,o,a,r){(qo(n)||ia(n))&&(r=a,a=o,o=i,i=n,n=null),this.on(n,e,i,o,a,r)}}function mi(e){_t.call(this,e),this.init()}mi.$inject=["eventBus"];z(mi,_t);mi.prototype.addRule=function(e,t,n){var i=this;typeof e=="string"&&(e=[e]),e.forEach(function(o){i.canExecute(o,t,function(a,r,s){return n(a)},!0)})};mi.prototype.init=function(){};function er(e){mi.call(this,e)}z(er,mi);er.$inject=["eventBus"];er.prototype.init=function(){this.addRule("shape.resize",1500,function(e){const t=e.shape;if(t&&t.type==="bpmn:Task"){const n=t.businessObject;if(n&&n.name&&n.name.startsWith("__IMAGE__:"))return{minBounds:{width:50,height:50}}}})};const h2={__init__:["customResizeProvider"],customResizeProvider:["type",er]};function f2(e,t,n,i){const o=e.x,a=e.y,r=t.x,s=t.y,c=n.x,d=n.y,l=i.x,p=i.y,u=(o-r)*(d-p)-(a-s)*(c-l);if(Math.abs(u)<1e-4)return null;const m=((o-c)*(d-p)-(a-d)*(c-l))/u,h=-((o-r)*(a-d)-(a-s)*(o-c))/u;return m>.01&&m<.99&&h>.01&&h<.99?{x:o+m*(r-o),y:a+m*(s-a)}:null}function g2(e,t){const n=[],i=e.waypoints;return!i||i.length<2||(t.forEach(o=>{if(o!==e&&!(!o.waypoints||o.waypoints.length<2))for(let a=0;a<i.length-1;a++){const r=i[a],s=i[a+1];for(let c=0;c<o.waypoints.length-1;c++){const d=o.waypoints[c],l=o.waypoints[c+1],p=f2(r,s,d,l);p&&n.push({point:p,segmentIndex:a})}}}),n.sort((o,a)=>{if(o.segmentIndex!==a.segmentIndex)return o.segmentIndex-a.segmentIndex;const r=i[o.segmentIndex],s=i[a.segmentIndex],c=Math.hypot(o.point.x-r.x,o.point.y-r.y),d=Math.hypot(a.point.x-s.x,a.point.y-s.y);return c-d})),n}function _2(e,t,n=8){if(!e||e.length<2)return"";if(!t||t.length===0){let a=`M ${e[0].x} ${e[0].y}`;for(let r=1;r<e.length;r++)a+=` L ${e[r].x} ${e[r].y}`;return a}let i=`M ${e[0].x} ${e[0].y}`,o=0;for(let a=0;a<e.length-1;a++){const r=e[a],s=e[a+1],c=[];for(;o<t.length&&t[o].segmentIndex===a;)c.push(t[o].point),o++;if(c.length===0)i+=` L ${s.x} ${s.y}`;else{const d=s.x-r.x,l=s.y-r.y,p=Math.hypot(d,l),u=d/p,m=l/p;c.forEach(h=>{const g={x:h.x-u*n,y:h.y-m*n},f={x:h.x+u*n,y:h.y+m*n};i+=` L ${g.x} ${g.y}`,i+=` A ${n} ${n} 0 0 1 ${f.x} ${f.y}`}),i+=` L ${s.x} ${s.y}`}}return i}function $h(e,t,n){const i=()=>{const o=t.filter(a=>a.waypoints);o.forEach(a=>{const r=g2(a,o);if(r.length>0){const s=n.getGraphics(a);if(s){const c=s.querySelector("path.djs-visual");if(c){const d=_2(a.waypoints,r);c.setAttribute("d",d)}}}})};e.on("connection.changed",i),e.on("connection.added",i),e.on("shape.move.end",i),e.on("commandStack.changed",i),e.on("import.done",()=>{setTimeout(i,100)})}$h.$inject=["eventBus","elementRegistry","canvas"];const b2={__init__:["connectionCrossings"],connectionCrossings:["type",$h]},v2=`<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0" id="Definitions_ComercialV9" targetNamespace="http://fyness.com/bpmn/comercial-v9">
  <bpmn2:collaboration id="Collaboration_Comercial">
    <bpmn2:participant id="Participant_Educacao" name="EDUCAÇÃO" processRef="Process_Educacao" />
    <bpmn2:participant id="Participant_Indicacao" name="INDICAÇÃO" processRef="Process_Indicacao" />
    <bpmn2:participant id="Participant_Conteudo" name="PRODUÇÃO De CONTEÚDO" processRef="Process_Conteudo" />
    <bpmn2:participant id="Participant_Prospeccao" name="🎯 PROSPECÇÃO ATIVA - Redes Sociais" processRef="Process_Prospeccao" />
    <bpmn2:participant id="Participant_Google" name="GOOGLE" processRef="Process_Google" />
    <bpmn2:participant id="Participant_Nucleo" name="Gateway Asaas" processRef="Process_Nucleo" />
    <bpmn2:participant id="Participant_Meta" name="META ADS" processRef="Process_Meta" />
    <bpmn2:textAnnotation id="TextAnnotation_0576fl5">
      <bpmn2:text>colocar em grupo de nutricao</bpmn2:text>
    </bpmn2:textAnnotation>
    <bpmn2:association id="Association_01m1lt7" associationDirection="None" sourceRef="End_Cliente_Perdido_Educacao" targetRef="TextAnnotation_0576fl5" />
  </bpmn2:collaboration>
  <bpmn2:process id="Process_Educacao" isExecutable="false">
    <bpmn2:startEvent id="Start_Educacao_Software" name="Comprou Software (Semestral)">
      <bpmn2:documentation>PORTA A: Comprou o SOFTWARE (plano semestral)
Mentalidade: "Comprei a FERRAMENTA"
Bônus: Ganha Curso de Gestão Completo</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_Soft_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:startEvent id="Start_Educacao_Curso" name="Comprou Curso (Método)">
      <bpmn2:documentation>PORTA B: Comprou o CURSO (método)
Mentalidade: "Comprei o CONHECIMENTO"
Bônus: Ganha 6 Meses Fyness Grátis</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_Curso_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="End_Cliente_Ativo_Educacao" name="Cliente Ativo (Renovado)">
      <bpmn2:incoming>Flow_Edu_Renov_Anual</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Renov_Mensal</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Cliente_Perdido_Educacao" name="Cliente Perdido (Churn)">
      <bpmn2:documentation>CHURN - MOTIVOS PROVÁVEIS:
- Não viu valor
- Não criou hábito
- Problema financeiro
- Voltou para planilha

AÇÃO PÓS-CHURN: Grupo de nurturing de longo prazo (conteúdo educativo)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Recuperou_Nao</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:task id="Task_Aula_Setup" name="Dica de uso">
      <bpmn2:documentation>🎯 AULA INAUGURAL (TRAVA-ZAP):

ESTRATÉGIA: Aula curta e direta ao ponto
DURAÇÃO: 10 minutos máximo

CONTEÚDO:
1. Login no Fyness
2. Conectar WhatsApp
3. Fazer 1 lançamento de teste
4. Ver o gráfico aparecer

GANCHO: "Você vai lançar SUA primeira receita agora."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Email_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Setup_1</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_CS_Liga_Ativacao" name="Ligacao">
      <bpmn2:documentation>📞 LIGAÇÃO CS (D+7 - NÃO ATIVOU):

SCRIPT:
"Oi [Nome], vi que você garantiu os 6 meses mas ainda não fez o setup.
Tem algo travando?

Posso te ajudar no Zoom agora em 15 minutos?"

OBJETIVO: Destravar. Se recusar 2x, marcar como "risco de cancelamento".</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Ativou_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_CS_Ativa</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_M1_Desafio_DRE" name="M1: Interacao na comunidade &#10;Desafios+sorteios">
      <bpmn2:documentation>🏆 MÊS 1 - DESAFIO PRIMEIRO DRE:

MENSAGEM COMUNIDADE:
"Pessoal, quem vai postar o primeiro DRE do mês até sexta?
Quem postar ganha um Relatório Personalizado comigo."

PSICOLOGIA: Gamificação + Prova Social
OBJETIVO: Criar hábito de uso mensal</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Merge_Ativa</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M1</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Renovacao_Anual" name="Anual: 20% desconto &#10;+Caixa fundador">
      <bpmn2:documentation>🎉 RENOVAÇÃO ANUAL (IDEAL):

BENEFÍCIOS:
- 20% de desconto
- Acesso ao Curso 2.0 (Gestão Avançada)
- Suporte prioritário
- Garantia de histórico vitalício

MENSAGEM:
"Parabéns! Você garantiu mais 12 meses de tranquilidade.
Seu histórico está seguro e você agora tem acesso ao módulo avançado."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Tipo_Anual</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Renov_Anual</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Renovacao_Mensal" name="Mensal: Preço cheio recorrente">
      <bpmn2:documentation>💳 RENOVAÇÃO MENSAL:

CONDIÇÕES:
- Preço cheio mensal
- Mantém histórico
- Pode mudar para anual a qualquer momento

MENSAGEM:
"Seu plano mensal está ativo. Você mantém todo o histórico.
Dica: Mudando para anual você economiza 20%."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Tipo_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Renov_Mensal</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Bloqueio_Leitura" name="Bloqueio Lógico: Modo Leitura com Cadeado">
      <bpmn2:documentation>🔒 BLOQUEIO LÓGICO (MODO LEITURA):

O QUE ACONTECE:
- Ele entra no Fyness
- Vê os gráficos lindos dele
- Mas o botão de microfone (áudio) está bloqueado com cadeado
- Botão "Novo Lançamento" também bloqueado

MENSAGEM NA TELA:
"Sua licença expirou. Renove para continuar controlando seu lucro."

OBJETIVO: Mostrar o que ele vai PERDER se não renovar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Renovou_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Bloqueio</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_CS_Recuperacao" name="CS Liga Final: Vai jogar 6 meses fora?">
      <bpmn2:documentation>📞 LIGAÇÃO CS (RECOVERY FINAL):

SCRIPT:
"[Nome], vi que sua licença expirou.

Você tem 6 meses de histórico valioso aí.
Vai jogar isso fora e voltar pra planilha?

Consegui liberar uma condição especial pra você renovar agora."

URGÊNCIA: Última chance antes de perder os dados.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Bloqueio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_CS_Recovery</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:serviceTask id="Task_Tag_Software" name="CRM">
      <bpmn2:documentation>CRM ACTION:
Tag: [CLIENTE_BUNDLE_SOFT]
Perfil: Comprou ferramenta, ganhou método
Bônus: Curso Completo de Gestão Financeira</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Soft_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Soft_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_Tag_Curso" name="CRM">
      <bpmn2:documentation>CRM ACTION:
Tag: [ALUNO_BUNDLE_CURSO]
Perfil: Comprou método, ganhou ferramenta
Bônus: 6 Meses Fyness Free</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Curso_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Curso_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sendTask id="Task_Email_BoasVindas" name="E-mail/Whats Acesso Liberado (Curso + Software)">
      <bpmn2:documentation>📧 E-MAIL DE BOAS-VINDAS HÍBRIDO:

ASSUNTO: "Acesso Liberado: Sua Máquina de Lucro (Curso + Software)"

CORPO:
"Parabéns! Você garantiu 6 meses de tranquilidade.

Sua Ferramenta (Fyness): [Link de Ativação]
Seu Manual (Curso): [Link da Área de Membros]

Missão #1: Assista agora à 'Aula Inaugural' no curso para configurar o Fyness em 10 minutos."

OBJETIVO: Instalação Imediata. Se não configurar na 1ª semana, cancela.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Merge_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Email_1</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_M3_Checkpoint" name="M3: E-mail/zap de Progresso - Economizou R$ X">
      <bpmn2:documentation>📊 MÊS 3 - CHECKPOINT DE VALOR:

E-MAIL PERSONALIZADO:
"[Nome], você já tem 90 dias de histórico no Fyness.

Nesse período você:
- Lançou R$ [X] em receitas
- Evitou R$ [Y] em vazamentos
- Economizou [Z] horas de planilha

Nos próximos 3 meses, vamos te mostrar como dobrar esse controle."

OBJETIVO: Mostrar ROI tangível</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_M2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M3</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D150_Aviso" name="D+150 (30 dias antes): Aviso Perda de Histórico">
      <bpmn2:documentation>⚠️ D+150 - AVISO DE PERDA (30 DIAS ANTES):

PSICOLOGIA: Aversão à Perda. Ninguém quer perder os dados.

MENSAGEM:
"Fala [Nome]. Faltam 30 dias para encerrar seu ciclo de 6 meses.

Você tem um banco de dados valioso da sua empresa aqui.

Pra você não perder esse histórico e ter que voltar pra planilha,
o [Sócio] liberou uma condição de renovação exclusiva."

CTA: "Quero Garantir Minha Renovação"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_M5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_D150</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:exclusiveGateway id="Gateway_Merge_Entrada" name="">
      <bpmn2:incoming>Flow_Edu_Soft_2</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Curso_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Merge_1</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Ativou_D7" name="Fez 1 lançamento?">
      <bpmn2:documentation>CHECKPOINT D+7:
Métrica: Pelo menos 1 lançamento no sistema?
SIM → Continua jornada
NÃO → CS Liga para Ativar</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Timer_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Ativou_Nao</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Ativou_Sim</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Merge_Ativacao">
      <bpmn2:incoming>Flow_Edu_Ativou_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_CS_Ativa</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Merge_Ativa</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Renovou" name="Renovou?">
      <bpmn2:documentation>CHECKPOINT D+180:
Renovou o plano?
SIM → Qual tipo de renovação?
NÃO → Recovery Flow</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_30d</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Renovou_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Renovou_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Tipo_Renovacao" name="Tipo?">
      <bpmn2:documentation>Tipo de Renovação:
- Anual (ideal)
- Mensal (aceitável)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Renovou_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Recuperou_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Tipo_Anual</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Tipo_Mensal</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Recuperou" name="Recuperou?">
      <bpmn2:documentation>RESULTADO RECOVERY:
SIM → Volta para renovação
NÃO → Cliente perdido</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_CS_Recovery</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Recuperou_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Recuperou_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_D7" name="7 dias">
      <bpmn2:incoming>Flow_Edu_Setup_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Timer_D7</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_M2" name="60 dias">
      <bpmn2:incoming>Flow_Edu_M1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M2</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P60D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_M5" name="90 dias">
      <bpmn2:incoming>Flow_Edu_M3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M5</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P90D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_30d" name="30 dias">
      <bpmn2:incoming>Flow_Edu_D150</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_30d</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Edu_Soft_1" sourceRef="Start_Educacao_Software" targetRef="Task_Tag_Software" />
    <bpmn2:sequenceFlow id="Flow_Edu_Soft_2" sourceRef="Task_Tag_Software" targetRef="Gateway_Merge_Entrada" />
    <bpmn2:sequenceFlow id="Flow_Edu_Curso_1" sourceRef="Start_Educacao_Curso" targetRef="Task_Tag_Curso" />
    <bpmn2:sequenceFlow id="Flow_Edu_Curso_2" sourceRef="Task_Tag_Curso" targetRef="Gateway_Merge_Entrada" />
    <bpmn2:sequenceFlow id="Flow_Edu_Merge_1" sourceRef="Gateway_Merge_Entrada" targetRef="Task_Email_BoasVindas" />
    <bpmn2:sequenceFlow id="Flow_Edu_Email_1" sourceRef="Task_Email_BoasVindas" targetRef="Task_Aula_Setup" />
    <bpmn2:sequenceFlow id="Flow_Edu_Setup_1" sourceRef="Task_Aula_Setup" targetRef="IntermediateTimer_D7" />
    <bpmn2:sequenceFlow id="Flow_Edu_Timer_D7" sourceRef="IntermediateTimer_D7" targetRef="Gateway_Ativou_D7" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ativou_Nao" name="NÃO" sourceRef="Gateway_Ativou_D7" targetRef="Task_CS_Liga_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ativou_Sim" name="SIM" sourceRef="Gateway_Ativou_D7" targetRef="Gateway_Merge_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_CS_Ativa" sourceRef="Task_CS_Liga_Ativacao" targetRef="Gateway_Merge_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Merge_Ativa" sourceRef="Gateway_Merge_Ativacao" targetRef="Task_M1_Desafio_DRE" />
    <bpmn2:sequenceFlow id="Flow_Edu_M1" sourceRef="Task_M1_Desafio_DRE" targetRef="IntermediateTimer_M2" />
    <bpmn2:sequenceFlow id="Flow_Edu_M2" sourceRef="IntermediateTimer_M2" targetRef="Task_M3_Checkpoint" />
    <bpmn2:sequenceFlow id="Flow_Edu_M3" sourceRef="Task_M3_Checkpoint" targetRef="IntermediateTimer_M5" />
    <bpmn2:sequenceFlow id="Flow_Edu_M5" sourceRef="IntermediateTimer_M5" targetRef="Task_D150_Aviso" />
    <bpmn2:sequenceFlow id="Flow_Edu_D150" sourceRef="Task_D150_Aviso" targetRef="IntermediateTimer_30d" />
    <bpmn2:sequenceFlow id="Flow_Edu_30d" sourceRef="IntermediateTimer_30d" targetRef="Gateway_Renovou" />
    <bpmn2:sequenceFlow id="Flow_Edu_Renovou_Sim" name="SIM" sourceRef="Gateway_Renovou" targetRef="Gateway_Tipo_Renovacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Renovou_Nao" name="NÃO" sourceRef="Gateway_Renovou" targetRef="Task_Bloqueio_Leitura" />
    <bpmn2:sequenceFlow id="Flow_Edu_Tipo_Anual" name="Anual" sourceRef="Gateway_Tipo_Renovacao" targetRef="Task_Renovacao_Anual" />
    <bpmn2:sequenceFlow id="Flow_Edu_Tipo_Mensal" name="Mensal" sourceRef="Gateway_Tipo_Renovacao" targetRef="Task_Renovacao_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Edu_Renov_Anual" sourceRef="Task_Renovacao_Anual" targetRef="End_Cliente_Ativo_Educacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Renov_Mensal" sourceRef="Task_Renovacao_Mensal" targetRef="End_Cliente_Ativo_Educacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Bloqueio" sourceRef="Task_Bloqueio_Leitura" targetRef="Task_CS_Recuperacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_CS_Recovery" sourceRef="Task_CS_Recuperacao" targetRef="Gateway_Recuperou" />
    <bpmn2:sequenceFlow id="Flow_Edu_Recuperou_Sim" name="SIM" sourceRef="Gateway_Recuperou" targetRef="Gateway_Tipo_Renovacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Recuperou_Nao" name="NÃO" sourceRef="Gateway_Recuperou" targetRef="End_Cliente_Perdido_Educacao" />
  </bpmn2:process>
  <bpmn2:process id="Process_Indicacao" isExecutable="false">
    <bpmn2:startEvent id="Start_Indicacao_Ativo" name="Parceiro Entrega Contato">
      <bpmn2:documentation>CENÁRIO A (ATIVO): O parceiro entrega o contato do lead.
SLA: &lt; 30 minutos para primeiro contato.
Moeda de troca: Reputação do parceiro.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Ind_Ativo_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:startEvent id="Start_Indicacao_Passivo" name="Lead Procura (Indicação)">
      <bpmn2:documentation>CENÁRIO B (PASSIVO): O lead procura você mencionando o parceiro.
Resposta: Tempo real (não usar automação burra).</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Ind_Passivo_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="End_Perdido_Motivo_Indicacao" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Ind_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Bloqueio_Indicacao" name="Bloqueou/Saiu do Grupo">
      <bpmn2:incoming>Flow_Ind_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:serviceTask id="Task_Tag_Ativo" name="CRM">
      <bpmn2:documentation>CRM ACTION:
1. Cadastrar lead no sistema
2. Adicionar tag obrigatória: [INDICAÇÃO: NOME_DO_PARCEIRO]
3. Definir prioridade: SLA &lt; 30 min
4. Notificar vendedor responsável</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Ativo_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Ativo_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_Tag_Passivo" name="CRM">
      <bpmn2:documentation>CRM ACTION:
1. Perguntar: "Qual nome do parceiro que te indicou?"
2. Cadastrar lead
3. Adicionar tag: [INDICAÇÃO: NOME_DO_PARCEIRO]
4. Resposta em tempo real (WhatsApp/Instagram)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Passivo_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Passivo_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_D0_Instagram_Indicacao" name="D0 - Instagram (Final do Dia) - Social Selling">
      <bpmn2:documentation>📱 FINAL DO DIA - SOCIAL SELLING:

AÇÃO MANUAL DO VENDEDOR:
1. Seguir a empresa/perfil do lead no Instagram
2. Curtir 2 fotos recentes (não mais que isso)

POR QUÊ?
- Mostra que você é real
- Mostra interesse genuíno
- Cria proximidade social antes da venda

IMPORTANTE: Não mandar DM no Instagram. Isso é só warming.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Zap1</bpmn2:incoming>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_Trial7d_Indicacao" name="Liberação Trial 7d VIP">
      <bpmn2:documentation>AÇÃO:
1. Cadastro simplificado
2. Vendedor libera acesso e manda link de login

DIFERENCIAL:
"Tô liberando seu acesso aqui. Já deixei configurado do jeito que o [Parceiro] usa."

MONITORAMENTO: Sistema monitora uso em 48h.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Demo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Trial</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_GrupoNurturing_Indicacao" name="Grupo WhatsApp Nurturing">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que não converteu é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Ver casos de sucesso do parceiro
- Ofertas de reativação

CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sendTask id="Task_D0_WhatsApp1_Indicacao" name="D0 - WhatsApp 1 (Min 15) - Áudio Pessoal">
      <bpmn2:documentation>⏱️ MINUTO 15 (Sem resposta na ligação):

MENSAGEM:
"Fala [Nome], tudo bem? O [Nome do Parceiro] me passou seu contato e disse que você precisava organizar o financeiro aí urgente. Ele me fez prometer que eu ia te dar um atendimento VIP. Pode falar?"

OBJETIVO: Reforçar autoridade emprestada via áudio pessoal.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_NaoAtendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Zap1</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D1_WhatsApp2_Indicacao" name="D1 - WhatsApp 2 (Tarde) - Cobrança do Amigo">
      <bpmn2:documentation>📅 DIA 1 - TARDE (Se visualizou e não respondeu):

MENSAGEM:
"Opa [Nome]. O [Parceiro] me mandou msg aqui perguntando se a gente já tinha conseguido se falar. Disse pra ele que você devia estar na correria.

Consegue ouvir um áudio de 30s se eu te mandar? Só pra eu te mostrar o que ele viu aqui que mudou o jogo pra ele."

GATILHO MENTAL: Compromisso social + Prova de que o parceiro está acompanhando.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D1_Zap2</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D3_WhatsApp3_Indicacao" name="D3 - WhatsApp 3 (Manhã) - Bastidor do Parceiro">
      <bpmn2:documentation>💼 DIA 3 - MANHÃ (Ainda está morno):

MENSAGEM:
"Lembrei de você. O [Parceiro] adora essa função aqui de DRE no WhatsApp [Mandar Print/Vídeo].

Imagina você tendo essa clareza na sexta-feira à tarde? Tenho um horário livre às 15h, bora?"

GATILHO MENTAL: Espelhamento - "Se funciona pro parceiro, funciona pra mim"
PROVA SOCIAL: Print/vídeo real do parceiro usando.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D1_Zap2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D3_Zap3</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D6_WhatsApp4_Indicacao" name="D6 - WhatsApp 4 (Tarde) - Ultimato VIP">
      <bpmn2:documentation>⚠️ DIA 6 - TARDE (A semana virou e nada):

MENSAGEM:
"Fala [Nome]. Seguinte: como você veio pelo [Parceiro], eu tinha separado a isenção da taxa de adesão + o bônus de implantação pra você.

Mas o sistema vai resetar essa condição amanhã.

Você quer segurar essa vaga ou posso liberar pra outro? Sem pressão, só pra eu não segurar à toa."

GATILHO MENTAL: Escassez de relacionamento + Benefício exclusivo + Elegância no ultimato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D3_Zap3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D6_Zap4</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D10_WhatsApp5_Indicacao" name="D10 - WhatsApp 5 (Manhã) - Break-up Elegante">
      <bpmn2:documentation>☠️ DIA 10 - MANHÃ (O BREAK-UP ELEGANTE):

MENSAGEM:
"Vou assumir que a rotina te engoliu ou você resolveu continuar como está.

Vou encerrar seu atendimento por aqui para não ficar te incomodando e não chatear o [Parceiro].

Se o caos voltar, meu número é esse. Um abraço e sucesso!"

OBJETIVO: Encerrar o ciclo de venda ativa sem queimar a ponte.
DIFERENCIAL: Menciona o parceiro para não queimar o relacionamento dele também.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D6_Zap4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D10_Check</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_AvisaParceiro" name="Avisar Parceiro (Validar Ego)">
      <bpmn2:documentation>SCRIPT:
"Grande [Parceiro]! Só pra avisar que o [Lead] já é nosso cliente e tá sendo super bem cuidado. Obrigado pela confiança!

Se tiver mais alguém sofrendo com planilha, manda pra cá."

POR QUE ISSO É VITAL?
- Valida o ego do parceiro
- Estimula novas indicações</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Aviso</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:userTask id="Task_QuebraGelo_Ativo" name="WhatsApp Áudio - Script Ativo">
      <bpmn2:documentation>SCRIPT CENÁRIO A (Você chama):

"Fala [Nome do Lead], tudo bem? Aqui é o [Seu Nome] da Fyness.

O [Nome do Parceiro] me passou seu contato agora há pouco e me disse que você é um cara 100%, mas que a gestão financeira aí tá tirando seu sono, igual tirava o dele.

Ele me fez prometer que eu ia te dar uma atenção VIP aqui. Pode falar 2 minutinhos?"

OBJETIVO: Transferir confiança do parceiro para você.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Ativo_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Ativo_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_QuebraGelo_Passivo" name="WhatsApp Áudio - Script Passivo">
      <bpmn2:documentation>SCRIPT CENÁRIO B (Ele chama):

"Opa [Nome], que honra! O [Nome do Parceiro] é um grande parceiro nosso.

Se você é amigo dele, já é de casa. Me conta, ele te mostrou como a gente organizou o caixa dele?"

OBJETIVO: Validar a relação e mostrar resultado do parceiro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Passivo_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Passivo_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D0_Ligacao_Indicacao" name="D0 - Ligação (Min 0)">
      <bpmn2:documentation>📞 AUTORIDADE EMPRESTADA - MINUTO 0:

SCRIPT SE ATENDER:
"Fala [Nome]! Aqui é o [Vendedor]. O [Parceiro] me falou muito bem da sua empresa e disse que você precisava organizar o financeiro. Tá na frente do computador?"

OBJETIVO: Transferir a autoridade do parceiro imediatamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Merged</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Lig</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D0_Qualifica_Indicacao" name="D0 - Qualifica (Autoridade Parceiro)">
      <bpmn2:documentation>✅ ATENDEU - CARTEIRADA:

SCRIPT:
"O [Parceiro] me fez prometer que eu ia te dar um atendimento VIP aqui. Ele me disse que o financeiro aí tá tirando seu sono, igual tirava o dele antes.

Você tá usando planilha hoje ou caderno?"

OBJETIVO: Qualificar usando a confiança do parceiro como moeda.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Atendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Check</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_SelecaoMotivo_Indicacao" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):
Vendedor deve selecionar o motivo real da perda:

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu
□ Preço - Achou caro
□ Concorrência - Fechou com outro
□ Desqualificado - Não é decisor / Curioso
□ Timing - "Não é o momento"
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo + TAG [INDICAÇÃO: NOME_DO_PARCEIRO].

IMPORTANTE: Avisar o parceiro que o lead não converteu (para não cobrar comissão inexistente).</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_FlashDemo_Indicacao" name="Demo Contextualizada">
      <bpmn2:documentation>AÇÃO: Gravar tela do celular ou mandar áudio simulando a dor específica que o parceiro comentou.

SCRIPT VISUAL:
"Olha [Nome], o [Parceiro] gosta disso aqui ó: ele manda o áudio 'Gastei 100 reais no almoço' e a IA já lança. É essa agilidade que você busca?"

NÃO mostre demo genérica. Mostre o que o PARCEIRO gosta.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Demo</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_PressaoSocial" name="Ligação - Pressão Social">
      <bpmn2:documentation>SCRIPT (Ligação ou Áudio):

"Fala [Lead]! O sistema me avisou aqui que você ainda não lançou nada.

Cara, não deixa o [Parceiro] ficar na sua frente na organização! Rs.

Tem alguma dúvida ou foi só a correria? Vamos lançar o primeiro juntos agora?"

GATILHO MENTAL: Compromisso social com o parceiro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_NaoUsou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Pressao</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D1_Lembrete" name="D+1 - Lembrete (Compromisso)">
      <bpmn2:documentation>SCRIPT:
"E aí [Lead], conseguiu ver o vídeo que te mandei? O [Parceiro] me perguntou hoje se a gente já tinha se falado."

GATILHO MENTAL: Compromisso.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Pressao</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Usou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D1</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D3_ProvaSocial" name="D+3 - Prova Social">
      <bpmn2:documentation>SCRIPT:
"Olha esse resultado aqui de uma empresa do mesmo ramo que o seu. Imagina você tendo esse controle..."

Anexar print ou vídeo de caso de sucesso similar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D5_Ultimato" name="D+5 - Ultimato">
      <bpmn2:documentation>SCRIPT:
"Vou imaginar que a semana tá caótica aí. Vou segurar sua condição especial de indicação até amanhã, beleza? Depois volta pro preço normal."

ESCASSEZ + ELEGÂNCIA.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D5</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Atendeu_D0_Indicacao" name="Atendeu?">
      <bpmn2:incoming>Flow_Ind_D0_Lig</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Atendeu</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_D0_NaoAtendeu</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_D0_Indicacao" name="Fechou na hora?">
      <bpmn2:incoming>Flow_Ind_D0_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Converteu_Nao</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_1kc5wwv</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Merge_D0_Indicacao" name="Merge D0">
      <bpmn2:incoming>Flow_1kc5wwv</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Merge</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Indicacao" name="Converteu?">
      <bpmn2:incoming>Flow_Ind_D10_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Breakup_Indicacao" name="Respondeu?">
      <bpmn2:incoming>Flow_Ind_Check_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_MergeIndicacao">
      <bpmn2:incoming>Flow_Ind_Ativo_3</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Passivo_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Merged</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_UsouEm48h" name="Usou o sistema?">
      <bpmn2:incoming>Flow_Ind_Timer_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_NaoUsou</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Usou</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Breakup_Indicacao" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato elegante.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Check_Breakup</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_48h" name="48h">
      <bpmn2:documentation>O GUARDIÃO DE 48H:
Sistema detecta se houve 0 lançamentos em 48h.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Trial</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Timer_Check</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Indicacao" name="→ Checkout">
      <bpmn2:incoming>Flow_Ind_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_1" sourceRef="Start_Indicacao_Ativo" targetRef="Task_Tag_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_2" sourceRef="Task_Tag_Ativo" targetRef="Task_QuebraGelo_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_3" sourceRef="Task_QuebraGelo_Ativo" targetRef="Gateway_MergeIndicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_1" sourceRef="Start_Indicacao_Passivo" targetRef="Task_Tag_Passivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_2" sourceRef="Task_Tag_Passivo" targetRef="Task_QuebraGelo_Passivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_3" sourceRef="Task_QuebraGelo_Passivo" targetRef="Gateway_MergeIndicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Merged" sourceRef="Gateway_MergeIndicacao" targetRef="Task_D0_Ligacao_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Demo" sourceRef="Task_FlashDemo_Indicacao" targetRef="Task_Trial7d_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trial" sourceRef="Task_Trial7d_Indicacao" targetRef="IntermediateTimer_48h" />
    <bpmn2:sequenceFlow id="Flow_Ind_Timer_Check" sourceRef="IntermediateTimer_48h" targetRef="Gateway_UsouEm48h" />
    <bpmn2:sequenceFlow id="Flow_Ind_NaoUsou" name="Não" sourceRef="Gateway_UsouEm48h" targetRef="Task_PressaoSocial" />
    <bpmn2:sequenceFlow id="Flow_Ind_Usou" name="Sim" sourceRef="Gateway_UsouEm48h" targetRef="Task_D1_Lembrete" />
    <bpmn2:sequenceFlow id="Flow_Ind_Pressao" sourceRef="Task_PressaoSocial" targetRef="Task_D1_Lembrete" />
    <bpmn2:sequenceFlow id="Flow_Ind_D1" sourceRef="Task_D1_Lembrete" targetRef="Task_D3_ProvaSocial" />
    <bpmn2:sequenceFlow id="Flow_Ind_D3" sourceRef="Task_D3_ProvaSocial" targetRef="Task_D5_Ultimato" />
    <bpmn2:sequenceFlow id="Flow_Ind_D5" sourceRef="Task_D5_Ultimato" targetRef="Gateway_Converteu_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Sim" name="Sim" sourceRef="Gateway_Converteu_Indicacao" targetRef="Task_AvisaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Aviso" sourceRef="Task_AvisaParceiro" targetRef="LinkThrow_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Nao" name="Não" sourceRef="Gateway_Converteu_Indicacao" targetRef="Task_GrupoNurturing_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Nurturing" sourceRef="Task_GrupoNurturing_Indicacao" targetRef="End_Bloqueio_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Lig" sourceRef="Task_D0_Ligacao_Indicacao" targetRef="Gateway_Atendeu_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Atendeu" name="Sim" sourceRef="Gateway_Atendeu_D0_Indicacao" targetRef="Task_D0_Qualifica_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_NaoAtendeu" name="Não" sourceRef="Gateway_Atendeu_D0_Indicacao" targetRef="Task_D0_WhatsApp1_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Check" sourceRef="Task_D0_Qualifica_Indicacao" targetRef="Gateway_Converteu_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_D0_Indicacao" targetRef="Task_FlashDemo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Zap1" sourceRef="Task_D0_WhatsApp1_Indicacao" targetRef="Task_D0_Instagram_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Merge" sourceRef="Gateway_Merge_D0_Indicacao" targetRef="Task_D1_WhatsApp2_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D1_Zap2" sourceRef="Task_D1_WhatsApp2_Indicacao" targetRef="Task_D3_WhatsApp3_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D3_Zap3" sourceRef="Task_D3_WhatsApp3_Indicacao" targetRef="Task_D6_WhatsApp4_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D6_Zap4" sourceRef="Task_D6_WhatsApp4_Indicacao" targetRef="Task_D10_WhatsApp5_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D10_Check" sourceRef="Task_D10_WhatsApp5_Indicacao" targetRef="Gateway_Converteu_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Indicacao" targetRef="LinkThrow_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Indicacao" targetRef="IntermediateTimer_24h_Breakup_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Check_Breakup" sourceRef="IntermediateTimer_24h_Breakup_Indicacao" targetRef="Gateway_Respondeu_Breakup_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Breakup_Indicacao" targetRef="Task_SelecaoMotivo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Motivo" sourceRef="Task_SelecaoMotivo_Indicacao" targetRef="End_Perdido_Motivo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Breakup_Indicacao" targetRef="Task_GrupoNurturing_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_1kc5wwv" name="Sim" sourceRef="Gateway_Converteu_D0_Indicacao" targetRef="Gateway_Merge_D0_Indicacao" />
  </bpmn2:process>
  <bpmn2:process id="Process_Conteudo" isExecutable="false">
    <bpmn2:startEvent id="Start_Conteudo_Pessoal" name="Pessoal">
      <bpmn2:documentation>ENTRADA: Lead comenta/interage no story de um SÓCIO/PARCEIRO.

CONTEXTO: É um seguidor do perfil pessoal que confia no indivíduo, não na marca.

GATILHO MENTAL: Autoridade emprestada do líder.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Cont_Pessoal_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:startEvent id="Start_Conteudo_Empresa" name="Fyness">
      <bpmn2:documentation>ENTRADA: Lead comenta/envia direct no perfil OFICIAL da Fyness.

CONTEXTO: É um seguidor frio que busca PRODUTO, não pessoa.

GATILHO MENTAL: Solução de problema (dor funcional).</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Cont_Empresa_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="End_Bloqueio_Conteudo" name="Bloqueou/Saiu do Grupo">
      <bpmn2:incoming>Flow_Cont_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Perdido_Conteudo" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Cont_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:serviceTask id="Task_ManyChat_Pessoal" name="Responde Comentário + Pede Zap">
      <bpmn2:documentation>AUTOMAÇÃO MANYCHAT:
1. Detecta comentário no story do sócio
2. Responde automaticamente via Direct:
   "Opa! Vi que você curtiu o story. Vou te chamar no Zap, beleza?"
3. Captura número de telefone
4. Tag no CRM: [CONTEÚDO: PESSOAL]

IMPORTANTE: Sócio não faz venda. Transfere para SDR/Closer.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_GrupoNurturing_Conteudo" name="Grupo WhatsApp Nurturing">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que respondeu mas não converteu é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Ver cases de sucesso de seguidores que viraram clientes
- Ofertas de reativação (Black Friday, Ano Novo, etc.)

CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo.

CRM ACTION: Tag [NURTURING: CONTEÚDO]</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Respondeu_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:userTask id="Task_WhatsApp_Pessoal" name="D0 - WhatsApp - Autoridade">
      <bpmn2:documentation>SCRIPT - AUTORIDADE EMPRESTADA:
"Fala [Nome]! Aqui é o [Vendedor] da equipe do [Nome do Sócio].

Ele viu que você interagiu no Story dele sobre [Assunto X] e me pediu pra te dar uma atenção VIP aqui.

Você quer organizar o financeiro igual ele faz ou só estava curioso?"

GATILHO: Ele é FÃ. Quer o MÉTODO e o SUCESSO do sócio.

PRÓXIMO PASSO:
- Se engajou → Flash Demo
- Se ghostou → Cadência D1-D3-D7</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_FlashDemo_Pessoal" name="D0 - Demo - Bastidor (Espelho)">
      <bpmn2:documentation>ABORDAGEM: ESPELHO DO SÓCIO.

SCRIPT VISUAL (Vídeo/Áudio):
"Olha [Nome], o [Sócio] usa assim: ele grava um áudio 'Gastei 300 reais no almoço da equipe' e a IA já lança automático. É essa agilidade que você busca?"

GATILHO: Lead quer ser igual ao ídolo.

IMPORTANTE: Não mostra todos os recursos. Mostra apenas o QUE O SÓCIO USA.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_Merge</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_SDR_Empresa" name="Qualificacao via dm">
      <bpmn2:documentation>QUALIFICAÇÃO MANUAL:
SDR responde manualmente no Direct para QUALIFICAR antes de passar pro Zap.

SCRIPT:
"Oi [Nome], vi sua mensagem! Só pra eu te ajudar melhor: você é o dono do negócio ou cuida da parte financeira?"

OBJETIVO:
- Desqualificar curiosos
- Identificar decisor
- Capturar número de WhatsApp

Tag no CRM: [CONTEÚDO: EMPRESA]</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_WhatsApp_Empresa" name="D0 - WhatsApp - Abordagem Consultiva">
      <bpmn2:documentation>SCRIPT - ABORDAGEM CONSULTIVA:
"Oi [Nome], recebi seu contato pelo Instagram da Fyness.

Vi que você perguntou sobre o preço. Antes de te passar, deixa eu te perguntar: hoje você usa planilha ou caderno?"

GATILHO: Ele é COMPRADOR FRIO. Quer a FERRAMENTA.

OBJETIVO: Descobrir a dor para contextualizar demo.

PRÓXIMO PASSO: Flash Demo focada na DOR.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_FlashDemo_Empresa" name="D0 - Demo - Função (Dor)">
      <bpmn2:documentation>ABORDAGEM: SOLUÇÃO DE DOR.

SCRIPT VISUAL (Vídeo/Áudio):
"Você falou que usa planilha, né? Então olha esse recurso: você manda um áudio 'Vendi 500 reais' e o sistema já lança. Sem digitar nada."

GATILHO: Lead quer RESOLVER o problema, não copiar ninguém.

IMPORTANTE: Mostra apenas a função que RESOLVE A DOR dele. Nada mais.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_Merge</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D1_Repost_Conteudo" name="D1 - Repost do Story do Sócio">
      <bpmn2:documentation>ESTRATÉGIA: Prova social + FOMO.

SCRIPT:
"[Nome], acabei de ver o [Sócio] postando mais um story usando o sistema. Você viu? Ele falou que não consegue mais viver sem rs.

Quer que eu te mostre de novo como funciona?"

GATILHO MENTAL:
- Prova social (sócio usa diariamente)
- FOMO (você tá ficando pra trás)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Imediato_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_D1</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D3_Prova_Conteudo" name="D3 - Print: Seguidor que Virou Cliente">
      <bpmn2:documentation>ESTRATÉGIA: Prova social irrefutável.

SCRIPT:
"Olha esse print que recebi ontem: é um seguidor do [Sócio] igual você que tava na dúvida. Olha o que ele mandou depois de 2 dias usando:

[PRINT DE DEPOIMENTO REAL]

Quer testar também ou prefere continuar na planilha?"

GATILHO MENTAL: Ele vai se arrepender se não testar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_D3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D7_Fechamento_Conteudo" name="D7 - Fechamento com Bônus">
      <bpmn2:documentation>ESTRATÉGIA: Ultimato elegante + Bônus.

SCRIPT:
"Fala [Nome]! Vou imaginar que a semana tá caótica aí.

Consegui segurar um bônus VIP pra você até amanhã:
- Onboarding prioritário comigo
- Configuração inicial inclusa

Depois disso volta pro atendimento normal. Bora garantir?"

GATILHO MENTAL:
- Escassez (prazo até amanhã)
- Exclusividade (bônus VIP)
- Elegância (não culpa o lead)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1un3847</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_SelecaoMotivo_Conteudo" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):
Vendedor deve selecionar o motivo real da perda:

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu após D7
□ Preço - Achou caro
□ Concorrência - Fechou com outro
□ Desqualificado - Não é decisor / Curioso
□ Timing - "Não é o momento"
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo + TAG:
- [CONTEÚDO: PESSOAL] ou [CONTEÚDO: EMPRESA]
- Canal de origem (Instagram do Sócio X ou Instagram Fyness)

IMPORTANTE: Dados vão para análise de performance de conteúdo.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Merge_Conteudo">
      <bpmn2:incoming>Flow_Cont_Pessoal_Merge</bpmn2:incoming>
      <bpmn2:incoming>Flow_Cont_Empresa_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Merged</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Imediato_Conteudo" name="Fechou na hora?">
      <bpmn2:documentation>DECISÃO: Lead converteu imediatamente após Flash Demo?

SIM → Checkout
NÃO → Cadência de follow-up (D1, D3, D7)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Merged</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Imediato_Nao</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0c7r836</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Conteudo" name="Converteu?">
      <bpmn2:documentation>DECISÃO: Lead converteu após cadência D1-D3-D7?

SIM → Checkout
NÃO → Break-up (24h para responder)</bpmn2:documentation>
      <bpmn2:incoming>Flow_1un3847</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Cont_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Conteudo" name="Respondeu?">
      <bpmn2:documentation>DECISÃO: Lead respondeu após as 24h?

SIM → Grupo Nurturing (mantém aquecido)
NÃO → Selecionar Motivo da Perda (LOST)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Cont_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Conteudo" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato elegante do D7.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Timer</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Conteudo" name="→ Checkout">
      <bpmn2:incoming>Flow_Cont_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_1" sourceRef="Start_Conteudo_Pessoal" targetRef="Task_ManyChat_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_2" sourceRef="Task_ManyChat_Pessoal" targetRef="Task_WhatsApp_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_3" sourceRef="Task_WhatsApp_Pessoal" targetRef="Task_FlashDemo_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_Merge" sourceRef="Task_FlashDemo_Pessoal" targetRef="Gateway_Merge_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_1" sourceRef="Start_Conteudo_Empresa" targetRef="Task_SDR_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_2" sourceRef="Task_SDR_Empresa" targetRef="Task_WhatsApp_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_3" sourceRef="Task_WhatsApp_Empresa" targetRef="Task_FlashDemo_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_Merge" sourceRef="Task_FlashDemo_Empresa" targetRef="Gateway_Merge_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Merged" sourceRef="Gateway_Merge_Conteudo" targetRef="Gateway_Converteu_Imediato_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Imediato_Nao" name="Não" sourceRef="Gateway_Converteu_Imediato_Conteudo" targetRef="Task_D1_Repost_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_D1" sourceRef="Task_D1_Repost_Conteudo" targetRef="Task_D3_Prova_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_D3" sourceRef="Task_D3_Prova_Conteudo" targetRef="Task_D7_Fechamento_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Conteudo" targetRef="LinkThrow_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Conteudo" targetRef="IntermediateTimer_24h_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Timer" sourceRef="IntermediateTimer_24h_Conteudo" targetRef="Gateway_Respondeu_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Conteudo" targetRef="Task_GrupoNurturing_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Nurturing" sourceRef="Task_GrupoNurturing_Conteudo" targetRef="End_Bloqueio_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Conteudo" targetRef="Task_SelecaoMotivo_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Motivo" sourceRef="Task_SelecaoMotivo_Conteudo" targetRef="End_Perdido_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_1un3847" sourceRef="Task_D7_Fechamento_Conteudo" targetRef="Gateway_Converteu_Conteudo" />
    <bpmn2:intermediateThrowEvent id="Event_1iw749o" name="→ Checkout">
      <bpmn2:incoming>Flow_0c7r836</bpmn2:incoming>
      <bpmn2:linkEventDefinition id="LinkEventDefinition_1xn0hg8" name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:sequenceFlow id="Flow_0c7r836" name="SIM" sourceRef="Gateway_Converteu_Imediato_Conteudo" targetRef="Event_1iw749o" />
  </bpmn2:process>
  <bpmn2:process id="Process_Prospeccao" isExecutable="false">
    <bpmn2:startEvent id="Start_Prospeccao" name="Prospecção">
      <bpmn2:outgoing>Flow_Prosp_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:task id="Task_Prosp_Placeholder" name="[EXPANDIR] Redes Sociais">
      <bpmn2:incoming>Flow_Prosp_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_2</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Prospeccao" name="→ Checkout">
      <bpmn2:incoming>Flow_Prosp_2</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:sequenceFlow id="Flow_Prosp_1" sourceRef="Start_Prospeccao" targetRef="Task_Prosp_Placeholder" />
    <bpmn2:sequenceFlow id="Flow_Prosp_2" sourceRef="Task_Prosp_Placeholder" targetRef="LinkThrow_Prospeccao" />
  </bpmn2:process>
  <bpmn2:process id="Process_Google" isExecutable="false">
    <bpmn2:startEvent id="Start_Google" name="Landing Page (Google Ads)">
      <bpmn2:documentation>Lead pesquisou "Gestão Financeira PME" e clicou no anúncio.
Alta intenção de compra.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Goo_Start</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="End_Perdido_Motivo_Google" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Goo_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Pago_Google" name="✓ Pagou (Ativo)">
      <bpmn2:incoming>Flow_Goo_Mandou</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Alerta</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:serviceTask id="Task_AutomacaoBoasVindas" name="Automação D0 - Boas-vindas">
      <bpmn2:documentation>AUTOMAÇÃO IMEDIATA (D0):
1. Criação da conta no sistema
2. Envio de WhatsApp automático

MENSAGEM:
"Parabéns [Nome]! 🚀 Sua IA tá pronta.

Salva meu número e manda o primeiro áudio: 'Gastei 50 reais de almoço'."

OBJETIVO: Primeira vitória rápida.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Sucesso</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_BoasVindas</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_RecuperacaoCarrinho" name="Recuperação (10 min)">
      <bpmn2:documentation>AUTOMAÇÃO (10 MIN DEPOIS):
Disparo de recuperação se cartão recusou ou fechou a aba.

MENSAGEM:
"Oi [Nome], vi que deu erro no pagamento do Anual.

O banco às vezes barra o limite. Tenta esse link do Semestral que costuma passar direto: [Link]"

DOWNSELL: Anual → Semestral → Trimestral</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Falha</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Recuperacao</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:subProcess id="SubProcess_Trial_Google" name="Trial 7 Dias - Cadência de Ativação">
      <bpmn2:documentation>SUB-PROCESSO TRIAL 7 DIAS:
Cadência de nurturing ativa durante o período trial.
Objetivo: garantir o "aha moment" nos primeiros 2-3 dias
e maximizar conversão ao fim dos 7 dias.

CADÊNCIA INTERNA:
D0: Boas-vindas + Guia Rápido (primeiro valor em 5 min)
D1: Check de uso + Dica feature-chave (ativar aha moment)
D2: Case de sucesso de cliente similar (prova social)
D3: Check 48h de uso profundo (ponto de decisão)
D5: "Faltam 2 dias" + suporte (urgência)
D6: Oferta de conversão (incentivo final)
D7: Expiração → merge com fechamento principal</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Goo_Trial_End</bpmn2:outgoing>
      <bpmn2:startEvent id="Start_Trial" name="Trial Ativado">
        <bpmn2:outgoing>Flow_Trial_D0</bpmn2:outgoing>
      </bpmn2:startEvent>
      <bpmn2:serviceTask id="Task_Trial_D0_BoasVindas" name="D0 - Boas-vindas + Guia Rápido">
        <bpmn2:documentation>ONBOARDING IMEDIATO:
- E-mail/WhatsApp de boas-vindas com vídeo de 2 min
- Guia rápido: "3 passos para seu primeiro lançamento"
- CTA: "Faça seu primeiro lançamento agora"

OBJETIVO: Primeiro valor em menos de 5 minutos.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D0</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D0_D1</bpmn2:outgoing>
      </bpmn2:serviceTask>
      <bpmn2:intermediateCatchEvent id="Timer_Trial_24h" name="24h">
        <bpmn2:incoming>Flow_Trial_D0_D1</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_Check</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>
      <bpmn2:exclusiveGateway id="Gateway_Trial_D1_Uso" name="Usou D0?">
        <bpmn2:incoming>Flow_Trial_D1_Check</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_Sim</bpmn2:outgoing>
        <bpmn2:outgoing>Flow_Trial_D1_Nao</bpmn2:outgoing>
      </bpmn2:exclusiveGateway>
      <bpmn2:sendTask id="Task_Trial_D1_Dica" name="D1 - Dica Feature-Chave">
        <bpmn2:documentation>SE USOU:
"Vi que você já fez seu primeiro lançamento! 🎉
Agora experimenta [feature-chave] — é onde a mágica acontece."

SE NÃO USOU:
"Ainda não testou? Normal, a rotina engole. Olha só como é rápido: [vídeo 60s]
Leva 2 minutos pra sentir a diferença."</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D1_Sim</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_Merge</bpmn2:outgoing>
      </bpmn2:sendTask>
      <bpmn2:sendTask id="Task_Trial_D1_Reengajamento" name="D1 - Reengajamento (Não Usou)">
        <bpmn2:documentation>REENGAJAMENTO SUAVE:
"Ainda não testou? Normal, a rotina engole.
Olha só como é rápido: [vídeo 60s]
Leva 2 minutos pra sentir a diferença."

INCLUI: Link direto para primeiro lançamento.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D1_Nao</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_Merge2</bpmn2:outgoing>
      </bpmn2:sendTask>
      <bpmn2:exclusiveGateway id="Gateway_Trial_D1_Merge">
        <bpmn2:incoming>Flow_Trial_D1_Merge</bpmn2:incoming>
        <bpmn2:incoming>Flow_Trial_D1_Merge2</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_D2</bpmn2:outgoing>
      </bpmn2:exclusiveGateway>
      <bpmn2:intermediateCatchEvent id="Timer_Trial_D2" name="24h">
        <bpmn2:incoming>Flow_Trial_D1_D2</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D2_Start</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>
      <bpmn2:sendTask id="Task_Trial_D2_Case" name="D2 - Case de Sucesso">
        <bpmn2:documentation>PROVA SOCIAL:
"O [Cliente X] do mesmo ramo que você economizou 4h/semana
no primeiro mês. Olha o depoimento dele: [link/print]

Você tá no caminho certo. Qualquer dúvida, me chama!"</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D2_Start</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D2_D3</bpmn2:outgoing>
      </bpmn2:sendTask>
      <bpmn2:intermediateCatchEvent id="Timer_Trial_D3" name="24h">
        <bpmn2:incoming>Flow_Trial_D2_D3</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_Check</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>
      <bpmn2:exclusiveGateway id="Gateway_Trial_D3_Uso" name="Usou em 48h?">
        <bpmn2:incoming>Flow_Trial_D3_Check</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_Sim</bpmn2:outgoing>
        <bpmn2:outgoing>Flow_Trial_D3_Nao</bpmn2:outgoing>
      </bpmn2:exclusiveGateway>
      <bpmn2:sendTask id="Task_Trial_D3_Parabens" name="D3 - Parabéns + Próximo Nível">
        <bpmn2:documentation>REFORÇO POSITIVO (SE USOU):
"Show! Vi que você já tá usando [feature X]. 💪
Agora experimenta [feature Y] — os clientes que usam convertem 2x mais."</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D3_Sim</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_Merge1</bpmn2:outgoing>
      </bpmn2:sendTask>
      <bpmn2:userTask id="Task_Trial_D3_Resgate" name="D3 - Ligação de Resgate">
        <bpmn2:documentation>AÇÃO HUMANA (SE NÃO USOU EM 48H):
"Você buscou no Google porque tinha um problema urgente.
O problema sumiu ou a rotina te engoliu?
Vamos lançar o primeiro gasto agora na linha?"

OBJETIVO: Resgatar antes de perder. Se não ativar até D3,
a chance de conversão cai drasticamente.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D3_Nao</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_Merge2</bpmn2:outgoing>
      </bpmn2:userTask>
      <bpmn2:exclusiveGateway id="Gateway_Trial_D3_Merge">
        <bpmn2:incoming>Flow_Trial_D3_Merge1</bpmn2:incoming>
        <bpmn2:incoming>Flow_Trial_D3_Merge2</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_D5</bpmn2:outgoing>
      </bpmn2:exclusiveGateway>
      <bpmn2:intermediateCatchEvent id="Timer_Trial_D5" name="48h">
        <bpmn2:incoming>Flow_Trial_D3_D5</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D5_Start</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>
      <bpmn2:sendTask id="Task_Trial_D5_Urgencia" name="D5 - Faltam 2 Dias + Suporte">
        <bpmn2:documentation>URGÊNCIA + SUPORTE:
"Seu trial expira em 2 dias! ⏰
Quer que eu te ajude a configurar algo específico antes?
Agenda 15 min comigo e resolvo qualquer dúvida: [link agenda]"

OBJETIVO: Criar senso de urgência + oferecer ajuda genuína.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D5_Start</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D5_D6</bpmn2:outgoing>
      </bpmn2:sendTask>
      <bpmn2:intermediateCatchEvent id="Timer_Trial_D6" name="24h">
        <bpmn2:incoming>Flow_Trial_D5_D6</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D6_Start</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>
      <bpmn2:sendTask id="Task_Trial_D6_Oferta" name="D6 - Oferta de Conversão">
        <bpmn2:documentation>INCENTIVO FINAL:
"Amanhã seu trial acaba. Pra quem converte ANTES de expirar,
tenho uma condição especial:
🎁 20% OFF no primeiro trimestre + Onboarding VIP grátis.

Esse desconto some amanhã às 23:59. Bora?"

INCLUI: Link direto para checkout com cupom aplicado.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D6_Start</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D6_D7</bpmn2:outgoing>
      </bpmn2:sendTask>
      <bpmn2:intermediateCatchEvent id="Timer_Trial_D7" name="24h">
        <bpmn2:incoming>Flow_Trial_D6_D7</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D7_End</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>
      <bpmn2:endEvent id="End_Trial" name="Trial Expirado">
        <bpmn2:incoming>Flow_Trial_D7_End</bpmn2:incoming>
      </bpmn2:endEvent>
      <bpmn2:sequenceFlow id="Flow_Trial_D0" sourceRef="Start_Trial" targetRef="Task_Trial_D0_BoasVindas" />
      <bpmn2:sequenceFlow id="Flow_Trial_D0_D1" sourceRef="Task_Trial_D0_BoasVindas" targetRef="Timer_Trial_24h" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Check" sourceRef="Timer_Trial_24h" targetRef="Gateway_Trial_D1_Uso" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Sim" name="Sim" sourceRef="Gateway_Trial_D1_Uso" targetRef="Task_Trial_D1_Dica" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Nao" name="Não" sourceRef="Gateway_Trial_D1_Uso" targetRef="Task_Trial_D1_Reengajamento" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Merge" sourceRef="Task_Trial_D1_Dica" targetRef="Gateway_Trial_D1_Merge" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Merge2" sourceRef="Task_Trial_D1_Reengajamento" targetRef="Gateway_Trial_D1_Merge" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_D2" sourceRef="Gateway_Trial_D1_Merge" targetRef="Timer_Trial_D2" />
      <bpmn2:sequenceFlow id="Flow_Trial_D2_Start" sourceRef="Timer_Trial_D2" targetRef="Task_Trial_D2_Case" />
      <bpmn2:sequenceFlow id="Flow_Trial_D2_D3" sourceRef="Task_Trial_D2_Case" targetRef="Timer_Trial_D3" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Check" sourceRef="Timer_Trial_D3" targetRef="Gateway_Trial_D3_Uso" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Sim" name="Sim" sourceRef="Gateway_Trial_D3_Uso" targetRef="Task_Trial_D3_Parabens" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Nao" name="Não" sourceRef="Gateway_Trial_D3_Uso" targetRef="Task_Trial_D3_Resgate" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Merge1" sourceRef="Task_Trial_D3_Parabens" targetRef="Gateway_Trial_D3_Merge" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Merge2" sourceRef="Task_Trial_D3_Resgate" targetRef="Gateway_Trial_D3_Merge" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_D5" sourceRef="Gateway_Trial_D3_Merge" targetRef="Timer_Trial_D5" />
      <bpmn2:sequenceFlow id="Flow_Trial_D5_Start" sourceRef="Timer_Trial_D5" targetRef="Task_Trial_D5_Urgencia" />
      <bpmn2:sequenceFlow id="Flow_Trial_D5_D6" sourceRef="Task_Trial_D5_Urgencia" targetRef="Timer_Trial_D6" />
      <bpmn2:sequenceFlow id="Flow_Trial_D6_Start" sourceRef="Timer_Trial_D6" targetRef="Task_Trial_D6_Oferta" />
      <bpmn2:sequenceFlow id="Flow_Trial_D6_D7" sourceRef="Task_Trial_D6_Oferta" targetRef="Timer_Trial_D7" />
      <bpmn2:sequenceFlow id="Flow_Trial_D7_End" sourceRef="Timer_Trial_D7" targetRef="End_Trial" />
    </bpmn2:subProcess>
    <bpmn2:userTask id="Task_ClickCheckout_Self" name="Clica &#39;Testar Agora/Assinar&#39;">
      <bpmn2:documentation>PERFIL APRESSADO:
Já comparou, gostou da promessa, quer resolver agora (mesmo que seja 3 da manhã).

CTA na LP: "Testar Agora" ou "Assinar Anual"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Self</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self_1</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_PreencheDados_Self" name="Preenche Dados + Cartão">
      <bpmn2:documentation>FORMULÁRIO DE CHECKOUT:
- Nome completo
- E-mail
- Telefone (WhatsApp)
- CPF/CNPJ
- Dados do cartão

MONITORAMENTO: Tempo no formulário (abandono &gt; 2 min)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Self_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_AlertaHumano_Google" name="Alerta Humano - Ligar AGORA">
      <bpmn2:documentation>ALERTA PARA VENDEDOR:
"Cliente [Nome] pagou e não usou. Ligar agora."

SCRIPT LIGAÇÃO:
"[Nome], vi que você assinou mas ainda não mandou o primeiro áudio.

Tá com dúvida de como funciona? Vamos fazer juntos agora na linha?"

OBJETIVO: Ativação forçada antes de pedir chargeback.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_NaoMandou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Alerta</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_ClickWhatsApp" name="Clica WhatsApp">
      <bpmn2:documentation>PERFIL DESCONFIADO:
Gostou mas tem dúvida se funciona pro nicho dele ou quer negociar.

CTA na LP: "Falar com Especialista"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_1</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_SpeedToLead_Google" name="Responsta &#60; 5 min">
      <bpmn2:documentation>REGRA DE OURO: Vendedor responde em &lt; 5 minutos.

SCRIPT ABERTURA:
"Opa, tudo bem? Vi que veio do Google. Você tá usando planilha hoje ou o caderno?"

OBJETIVO: Qualificar rapidamente a dor.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_SelecaoMotivo_Google" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):
Vendedor deve selecionar o motivo real da perda:

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu
□ Preço - Achou caro e não aceitou Downsell
□ Concorrência - Fechou com outro
□ Desqualificado - Não é dono de empresa / Curioso
□ Timing - "Não é o momento" (válido)
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo selecionado.

MÉTRICA CRÍTICA: Taxa de conversão por motivo de perda.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_CaminhoGoogle" name="Qual botão clicou?">
      <bpmn2:incoming>Flow_Goo_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Zap</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Self" name="Pagamento?">
      <bpmn2:incoming>Flow_Goo_Self_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Sucesso</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Falha</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_PrimeiroAudio" name="Mandou áudio?">
      <bpmn2:incoming>Flow_Goo_Check24h</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_NaoMandou</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Mandou</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Google" name="24h">
      <bpmn2:documentation>O GUARDIÃO DE ATIVAÇÃO:
Monitora se cliente pagou mas NÃO usou em 24h.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_BoasVindas</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Check24h</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Goo_Start" sourceRef="Start_Google" targetRef="Gateway_CaminhoGoogle" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self" name="Checkout Direto" sourceRef="Gateway_CaminhoGoogle" targetRef="Task_ClickCheckout_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self_1" sourceRef="Task_ClickCheckout_Self" targetRef="Task_PreencheDados_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self_2" sourceRef="Task_PreencheDados_Self" targetRef="Gateway_Pagamento_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Sucesso" name="Sucesso" sourceRef="Gateway_Pagamento_Self" targetRef="Task_AutomacaoBoasVindas" />
    <bpmn2:sequenceFlow id="Flow_Goo_Falha" name="Falha/Abandono" sourceRef="Gateway_Pagamento_Self" targetRef="Task_RecuperacaoCarrinho" />
    <bpmn2:sequenceFlow id="Flow_Goo_BoasVindas" sourceRef="Task_AutomacaoBoasVindas" targetRef="IntermediateTimer_24h_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Recuperacao" sourceRef="Task_RecuperacaoCarrinho" targetRef="Gateway_AceitouTrial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Check24h" sourceRef="IntermediateTimer_24h_Google" targetRef="Gateway_PrimeiroAudio" />
    <bpmn2:sequenceFlow id="Flow_Goo_NaoMandou" name="Não" sourceRef="Gateway_PrimeiroAudio" targetRef="Task_AlertaHumano_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Mandou" name="Sim" sourceRef="Gateway_PrimeiroAudio" targetRef="End_Pago_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Alerta" sourceRef="Task_AlertaHumano_Google" targetRef="End_Pago_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap" name="WhatsApp" sourceRef="Gateway_CaminhoGoogle" targetRef="Task_ClickWhatsApp" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_1" sourceRef="Task_ClickWhatsApp" targetRef="Task_SpeedToLead_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_2" sourceRef="Task_SpeedToLead_Google" targetRef="Task_FlashDemo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_3" sourceRef="Task_FlashDemo_Google" targetRef="Task_OfertaTrial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_ToGatewayTrial" sourceRef="Task_OfertaTrial_Google" targetRef="Gateway_AceitouTrial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Trial_End" sourceRef="SubProcess_Trial_Google" targetRef="Task_D7_Fechamento_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Breakup_Google" targetRef="Task_SelecaoMotivo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Motivo" sourceRef="Task_SelecaoMotivo_Google" targetRef="End_Perdido_Motivo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Trial_Nao" name="Não (Recusou)" sourceRef="Gateway_AceitouTrial_Google" targetRef="Gateway_Merge_D0_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Check_Breakup" sourceRef="IntermediateTimer_24h_Breakup_Google" targetRef="Gateway_Respondeu_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Google" targetRef="LinkThrow_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D7" sourceRef="Task_D7_Fechamento_Google" targetRef="Gateway_Converteu_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D5_Lig3" sourceRef="Task_D5_Ligacao3_Google" targetRef="Task_D7_Fechamento_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Breakup" sourceRef="Task_D7_WhatsApp6_Breakup_Google" targetRef="IntermediateTimer_24h_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Google" targetRef="Task_D7_WhatsApp6_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D5_Zap5" sourceRef="Task_D5_WhatsApp5_Pressao_Google" targetRef="Task_D5_Ligacao3_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D3_Zap4" sourceRef="Task_D3_WhatsApp4_Case_Google" targetRef="Task_D5_WhatsApp5_Pressao_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D1_Lig2" sourceRef="Task_D1_Ligacao2_Google" targetRef="Task_D3_WhatsApp4_Case_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D1_Zap3" sourceRef="Task_D1_WhatsApp3_Diferenca_Google" targetRef="Task_D1_Ligacao2_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_Merge" sourceRef="Gateway_Merge_D0_Google" targetRef="Task_D1_WhatsApp3_Diferenca_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Breakup_Google" targetRef="Task_GrupoNurturing_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Nurturing" sourceRef="Task_GrupoNurturing_Google" targetRef="End_Bloqueio_Google" />
    <bpmn2:exclusiveGateway id="Gateway_Merge_D0_Google" name="Juncao Follow">
      <bpmn2:incoming>Flow_Goo_Trial_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D0_Merge</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Google" name="→ Checkout">
      <bpmn2:incoming>Flow_Goo_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Breakup_Google" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Check_Breakup</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Breakup_Google" name="Respondeu?">
      <bpmn2:incoming>Flow_Goo_Check_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Google" name="Converteu?">
      <bpmn2:incoming>Flow_Goo_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:userTask id="Task_D5_Ligacao3_Google" name="D5 - Ligação 3 (Última Tentativa)">
      <bpmn2:documentation>📞 DIA 5 - ÚLTIMA TENTATIVA DE VOZ:

SCRIPT:
"[Nome], vi que você ainda não definiu. Tá com alguma dúvida ou quer que eu te mostre algo específico do seu ramo?"

OBJETIVO: Última chance de falar antes do ultimato D7.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D5_Zap5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D5_Lig3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D1_Ligacao2_Google" name="D1 - Ligação 2 (Tarde)">
      <bpmn2:documentation>📞 DIA 1 - TARDE:

SCRIPT:
"Tô com a sua ficha de pré-cadastro aqui. Só falta um 'ok' pra eu liberar seu teste. Tá na correria?"

OBJETIVO: Mostrar que ele está sendo acompanhado pessoalmente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D1_Zap3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D1_Lig2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D7_Fechamento_Google" name="D7 - Fechamento (Escada Downsell)">
      <bpmn2:documentation>O FECHAMENTO BINÁRIO (D7 - FINAL DO TRIAL):

ESCADA DE DOWNSELL:

Tentativa 1: Plano Anual (R$ 1.497)
- Foco: Maior desconto + Caixa antecipado
- Script: "Você testou, viu que funciona. Vou te dar 40% de desconto no anual."

Tentativa 2 (Se recusar/falhar): Plano Semestral (R$ 997)
- Argumento: "O limite do cartão não passou? Faz o semestral que alivia a parcela."

Tentativa 3 (Misericórdia): Plano Trimestral (R$ 561)
- Argumento: "Faz o seguinte: não casa comigo. Namora por 3 meses. É um teste pago pra você organizar a casa."

OBJETIVO: Não perder o cliente. Se ele não pode pagar o ideal, ele paga o possível.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D5_Lig3</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Trial_End</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D7</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sendTask id="Task_D7_WhatsApp6_Breakup_Google" name="D7 - WhatsApp 6 - Break-up (Ultimato)">
      <bpmn2:documentation>☠️ DIA 7 - O ULTIMATO (BREAK-UP):
Tudo ou nada. Técnica de "retirar a oferta".

MENSAGEM:
"Fala [Nome]. Como não tivemos retorno, vou assumir que organizar o financeiro não é prioridade agora ou você decidiu continuar com as planilhas.

Vou encerrar seu processo por aqui para não te incomodar mais.

Se no futuro o caos voltar, meu contato é esse. Abraço!"

OBJETIVO: Provocar reação ou confirmar desinteresse.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Breakup</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D5_WhatsApp5_Pressao_Google" name="D5 - WhatsApp 5 - A Pressão">
      <bpmn2:documentation>⚠️ DIA 5 - PRESSÃO DO BENEFÍCIO:
Lead está morno. Hora de provocar.

MENSAGEM:
"[Nome], o sistema segura seu pré-cadastro com a condição de isenção de taxa de adesão até amanhã. Depois volta pro preço cheio. Consegue falar hoje à tarde?"

GATILHO MENTAL: Escassez + Benefício.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D3_Zap4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D5_Zap5</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D3_WhatsApp4_Case_Google" name="D3 - WhatsApp 4 - A Cobrança Social">
      <bpmn2:documentation>💼 DIA 3 - COBRANÇA SOCIAL (Se ele sumiu/Ghosting):

MENSAGEM:
"Lembrei de você. Esse cliente aqui é do seu ramo [Mandar Print de Relatório/Depoimento]. Ele organizou o caixa em 2 dias. Falta o que pra gente fazer o mesmo aí?"

CRM: Mover para etapa "Tentativa de Contato 3".

OBJETIVO: Soft touch mostrando prova social do nicho dele.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D1_Lig2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D3_Zap4</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D1_WhatsApp3_Diferenca_Google" name="D1 - WhatsApp 3 (Manhã) - A Diferença">
      <bpmn2:documentation>📊 DIA 1 - MANHÃ:
Ele provavelmente está cotando Conta Azul ou Omie.

MENSAGEM:
"E aí [Nome]. Uma dúvida rápida: você prefere ficar preenchendo formulário chato (igual nos outros sistemas) ou prefere mandar áudio no Zap? Só pra eu saber o que te mostrar."

OBJETIVO: Matar a concorrência mostrando a diferença.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D0_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D1_Zap3</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:serviceTask id="Task_GrupoNurturing_Google" name="Grupo Promoções + Remarketing">
      <bpmn2:documentation>NURTURING - LISTA PROMOÇÕES:
Lead Google que não converteu vai para lista de:
- Remarketing via Google Ads
- E-mails com promoções especiais
- WhatsApp com ofertas relâmpago

CONSIDERADO PERDIDO: Apenas se descadastrar/bloquear</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Respondeu_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:endEvent id="End_Bloqueio_Google" name="Descadastrou/Bloqueou">
      <bpmn2:incoming>Flow_Goo_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:exclusiveGateway id="Gateway_AceitouTrial_Google" name="Aceitou Trial?">
      <bpmn2:incoming>Flow_Goo_ToGatewayTrial</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Recuperacao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Trial_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:userTask id="Task_FlashDemo_Google" name="Flash Demo (Áudio + Print)">
      <bpmn2:documentation>A PROVA REAL:
Para matar objeção "será que funciona?", vendedor faz a mágica.

AÇÃO:
Manda áudio simulando gasto do nicho dele + Print do relatório pronto.

SCRIPT:
"Olha a mágica: eu mandei esse áudio de 3s e o sistema já gerou o DRE. É essa liberdade que você quer?"

GATILHO MENTAL: Prova social + Facilidade.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_OfertaTrial_Google" name="Oferta Trial 7d">
      <bpmn2:documentation>O GANCHO:

SCRIPT:
"Vou liberar 7 dias grátis pra você brincar. Se a IA não te economizar 2 horas na semana, você nem precisa assinar."

OBJEÇÃO ELIMINADA: "E se não der certo?" → Risco zero.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_ToGatewayTrial</bpmn2:outgoing>
    </bpmn2:userTask>
  </bpmn2:process>
  <bpmn2:process id="Process_Nucleo" isExecutable="false">
    <bpmn2:endEvent id="End_Cliente_Ativo" name="✅ Cliente Ativo">
      <bpmn2:documentation>CLIENTE CONVERTIDO E ATIVO
Acesso liberado
Receita capturada
Onboarding em andamento</bpmn2:documentation>
      <bpmn2:incoming>Flow_Para_Cliente_Ativo</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Pagamento_Falhou" name="❌ Pagamento Falhou">
      <bpmn2:documentation>LEAD PERDIDO POR PAGAMENTO
Tentativas esgotadas:
- Anual: Recusado
- Semestral: Recusado
- Trimestral: Recusado

Próximas ações:
- Adicionar ao grupo de nurturing
- Remarketing futuro
- Possível follow-up em 30 dias</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trimestral_Recusado</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:task id="Task_Checkout_Anual" name="Checkout: Plano Anual (R$ 1.497)">
      <bpmn2:documentation>DEGRAU 1: OFERTA PRINCIPAL
Valor: R$ 1.497/ano (R$ 124,75/mês)
Estratégia: Máximo cashflow antecipado
Parcelamento: Até 12x no cartão (juros por conta do cliente)
Link: hotmart.com/fyness-anual
Gateway: Hotmart + Asaas (fallback)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Para_Anual</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Anual_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Split_Parceiro" name="Split: 30% Comissão Parceiro">
      <bpmn2:documentation>SPLIT AUTOMÁTICO (SE TAG: INDICACAO)
Gateway: Asaas Split Payments
Parceiro recebe: 30% do valor (R$ 449,10 no Anual)
Timing: D+30 (após garantia)
Nota: Apenas para leads vindos de Lane_Indicacao</bpmn2:documentation>
      <bpmn2:incoming>Flow_Anual_Aprovado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Split_Para_Onboarding</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Onboarding_Pago" name="Onboarding: Acesso Imediato">
      <bpmn2:documentation>ONBOARDING CLIENTE PAGANTE:
1. E-mail de boas-vindas com credenciais
2. Acesso liberado ao sistema Fyness
3. WhatsApp de boas-vindas + link de suporte
4. Adiciona ao grupo VIP de clientes
5. Envia tutorial de primeiros passos
Timing: Imediato (webhook pós-pagamento)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Split_Para_Onboarding</bpmn2:incoming>
      <bpmn2:incoming>Flow_Semestral_Aprovado</bpmn2:incoming>
      <bpmn2:incoming>Flow_0na0lv9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Para_Cliente_Ativo</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Webhook_Falha" name="Webhook: Detecta Falha no Pagamento">
      <bpmn2:documentation>DETECÇÃO AUTOMÁTICA DE RECUSA
Sistema: Webhook do gateway de pagamento
Trigger: Cartão recusado por:
- Limite insuficiente
- Segurança do banco
- Dados incorretos
Ação: Dispara sequência de downsell automático</bpmn2:documentation>
      <bpmn2:incoming>Flow_Anual_Recusado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Falha_Para_WhatsApp</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_WhatsApp_5min" name="WhatsApp Automático: Link Semestral (5min)">
      <bpmn2:documentation>DOWNSELL AUTOMÁTICO (5 MINUTOS APÓS FALHA)
Via: WhatsApp (ManyChat ou Evolution API)
Script:
"Oi [Nome], vi aqui que o banco barrou a transação do plano Anual por segurança ou limite.

Isso é super comum com valores maiores!

Tenta esse link do Semestral que costuma passar direto (valor menor, mesmo benefício):
[Link Semestral]

Qualquer coisa me chama! 💚"

Link: hotmart.com/fyness-semestral</bpmn2:documentation>
      <bpmn2:incoming>Flow_Falha_Para_WhatsApp</bpmn2:incoming>
      <bpmn2:outgoing>Flow_WhatsApp_Para_Semestral</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Checkout_Semestral" name="Checkout: Plano Semestral (R$ 997)">
      <bpmn2:documentation>DEGRAU 2: DOWNSELL AUTOMÁTICO
Valor: R$ 997/semestre (R$ 166,17/mês)
Estratégia: Ticket menor, mais fácil de passar no cartão
Parcelamento: Até 12x no cartão
Link: hotmart.com/fyness-semestral
Nota: NÃO fica exposto no site principal</bpmn2:documentation>
      <bpmn2:incoming>Flow_WhatsApp_Para_Semestral</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Semestral_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Vendedor_Trimestral" name="Vendedor: Oferta Trimestral">
      <bpmn2:documentation>DEGRAU 3: CARTA NA MANGA DO VENDEDOR
Timing: D+2 após falha do Semestral
Responsável: SDR/Closer
Canal: WhatsApp ou ligação
Argumento:
"[Nome], entendo que o timing não está ideal agora.

Não casa comigo. Que tal namorar por 3 meses?

É um teste pago de R$ 561 pra você organizar a casa e decidir se vale continuar.

Se em 90 dias não mudou nada, cancela. Sem problema.

Bora testar?"

Link: hotmart.com/fyness-trimestral (NÃO EXPOSTO NO SITE)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Timer_Para_Vendedor</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Vendedor_Para_Trimestral</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Checkout_Trimestral" name="Checkout: Plano Trimestral (R$ 561)">
      <bpmn2:documentation>DEGRAU 3: LAST RESORT (NÃO PÚBLICO)
Valor: R$ 561/trimestre (R$ 187/mês)
Estratégia: Teste pago, menor compromisso
Parcelamento: Até 3x no cartão
Link: hotmart.com/fyness-trimestral (privado)
Uso: Apenas para recuperação manual via vendedor</bpmn2:documentation>
      <bpmn2:incoming>Flow_Vendedor_Para_Trimestral</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trimestral_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:exclusiveGateway id="Gateway_Checkout_Merge" name="Direciona Checkout">
      <bpmn2:outgoing>Flow_Para_Anual</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0m1sjfy</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Anual" name="Pagamento Anual Aprovado?">
      <bpmn2:incoming>Flow_Anual_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Anual_Aprovado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Anual_Recusado</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Semestral" name="Pagamento Semestral Aprovado?">
      <bpmn2:incoming>Flow_Semestral_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Semestral_Aprovado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Semestral_Recusado</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Trimestral" name="Pagamento Trimestral Aprovado?">
      <bpmn2:incoming>Flow_Trimestral_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trimestral_Recusado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0na0lv9</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_D2" name="⏱ Timer: 48h">
      <bpmn2:documentation>COOLING OFF PERIOD
Aguarda 2 dias antes da última tentativa
Permite que cliente resolva questões bancárias
Evita spam excessivo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Semestral_Recusado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Timer_Para_Vendedor</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Para_Cliente_Ativo" sourceRef="Task_Onboarding_Pago" targetRef="End_Cliente_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Trimestral_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Trimestral" targetRef="End_Pagamento_Falhou" />
    <bpmn2:sequenceFlow id="Flow_Para_Anual" sourceRef="Gateway_Checkout_Merge" targetRef="Task_Checkout_Anual" />
    <bpmn2:sequenceFlow id="Flow_Anual_Para_Gateway" sourceRef="Task_Checkout_Anual" targetRef="Gateway_Pagamento_Anual" />
    <bpmn2:sequenceFlow id="Flow_Anual_Aprovado" name="SIM" sourceRef="Gateway_Pagamento_Anual" targetRef="Task_Split_Parceiro" />
    <bpmn2:sequenceFlow id="Flow_Split_Para_Onboarding" sourceRef="Task_Split_Parceiro" targetRef="Task_Onboarding_Pago" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Aprovado" name="SIM" sourceRef="Gateway_Pagamento_Semestral" targetRef="Task_Onboarding_Pago" />
    <bpmn2:sequenceFlow id="Flow_Anual_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Anual" targetRef="Task_Webhook_Falha" />
    <bpmn2:sequenceFlow id="Flow_Falha_Para_WhatsApp" sourceRef="Task_Webhook_Falha" targetRef="Task_WhatsApp_5min" />
    <bpmn2:sequenceFlow id="Flow_WhatsApp_Para_Semestral" sourceRef="Task_WhatsApp_5min" targetRef="Task_Checkout_Semestral" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Para_Gateway" sourceRef="Task_Checkout_Semestral" targetRef="Gateway_Pagamento_Semestral" />
    <bpmn2:sequenceFlow id="Flow_Timer_Para_Vendedor" sourceRef="IntermediateTimer_D2" targetRef="Task_Vendedor_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Vendedor_Para_Trimestral" sourceRef="Task_Vendedor_Trimestral" targetRef="Task_Checkout_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Trimestral_Para_Gateway" sourceRef="Task_Checkout_Trimestral" targetRef="Gateway_Pagamento_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Semestral" targetRef="IntermediateTimer_D2" />
    <bpmn2:intermediateThrowEvent id="Event_0u9h6ak">
      <bpmn2:incoming>Flow_0m1sjfy</bpmn2:incoming>
      <bpmn2:linkEventDefinition id="LinkEventDefinition_0jv44ni" name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:sequenceFlow id="Flow_0m1sjfy" sourceRef="Gateway_Checkout_Merge" targetRef="Event_0u9h6ak" />
    <bpmn2:sequenceFlow id="Flow_0na0lv9" name="sim" sourceRef="Gateway_Pagamento_Trimestral" targetRef="Task_Onboarding_Pago" />
  </bpmn2:process>
  <bpmn2:process id="Process_Meta" isExecutable="false">
    <bpmn2:intermediateThrowEvent id="Event_1q9m63q" name="→ Checkout">
      <bpmn2:incoming>Flow_0lfarjy</bpmn2:incoming>
      <bpmn2:linkEventDefinition id="LinkEventDefinition_1cr0lzg" name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:intermediateCatchEvent id="Event_1qdcr1f" name="Grupo de nutricao">
      <bpmn2:incoming>Flow_0fm6hqw</bpmn2:incoming>
      <bpmn2:conditionalEventDefinition id="ConditionalEventDefinition_028jq8q">
        <bpmn2:condition xsi:type="bpmn2:tFormalExpression" />
      </bpmn2:conditionalEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Meta" name="→ Checkout">
      <bpmn2:incoming>Flow_Meta_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Meta" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Timer24h</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Meta" name="Respondeu?">
      <bpmn2:incoming>Flow_Meta_Timer24h</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Respondeu_Nao</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Respondeu_Sim</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_Meta_Timer24h" sourceRef="IntermediateTimer_24h_Meta" targetRef="Gateway_Respondeu_Meta" />
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Meta" name="Converteu?">
      <bpmn2:incoming>Flow_Meta_D14</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Converteu_Nao</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Converteu_Sim</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_Meta_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Meta" targetRef="IntermediateTimer_24h_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Meta" targetRef="LinkThrow_Meta" />
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Imediato_Meta" name="Fechou na hora?">
      <bpmn2:incoming>Flow_Meta_Interessado_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0lfarjy</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_1qdoel0</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_0lfarjy" sourceRef="Gateway_Converteu_Imediato_Meta" targetRef="Event_1q9m63q" />
    <bpmn2:sequenceFlow id="Flow_1qdoel0" name="nao" sourceRef="Gateway_Converteu_Imediato_Meta" targetRef="Task_D1_WhatsApp_Meta" />
    <bpmn2:exclusiveGateway id="Gateway_Interessado_D0_Meta" name="Interessado?">
      <bpmn2:incoming>Flow_Meta_FlashDemo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0fm6hqw</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Interessado_Sim</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_0fm6hqw" name="Nao" sourceRef="Gateway_Interessado_D0_Meta" targetRef="Event_1qdcr1f" />
    <bpmn2:sequenceFlow id="Flow_Meta_Interessado_Sim" name="Sim" sourceRef="Gateway_Interessado_D0_Meta" targetRef="Gateway_Converteu_Imediato_Meta" />
    <bpmn2:userTask id="Task_SelecaoMotivo_Meta" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu
□ Preço - Achou caro
□ Não é Público-Alvo - Curioso/Estudante
□ Concorrência - Fechou com outro
□ Timing - "Não é o momento"
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo.

MÉTRICA: Taxa de conversão Meta Ads por motivo de perda.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_Meta_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Meta" targetRef="Task_SelecaoMotivo_Meta" />
    <bpmn2:userTask id="Task_PaginaFiltro_Meta" name="Página Captura">
      <bpmn2:documentation>🎯 PÁGINA DE FILTRO META ADS:

Lead vem de anúncio de descoberta (topo de funil).

LANDING PAGE:
- Título: "Transforme áudios em organização financeira"
- Filtro de qualificação: "Você é dono/gestor?"
- Formulário: Nome, WhatsApp, Segmento

OBJETIVO: Capturar contato qualificado antes da abordagem.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Filtro</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_Meta_Filtro" sourceRef="Task_PaginaFiltro_Meta" targetRef="Task_WhatsApp_D0_Meta" />
    <bpmn2:sendTask id="Task_D14_WhatsApp_Meta" name="D14 - WhatsApp - Break-up">
      <bpmn2:documentation>👋 DIA 14 - BREAK-UP ELEGANTE:

Técnica de "take away" sem queimar a ponte.

MENSAGEM:
"Fala [Nome]!

Como não tivemos retorno, vou assumir que organizar o financeiro não é prioridade agora ou você já resolveu de outra forma.

Vou parar de te cutucar por aqui pra não incomodar 😅

Mas fica o meu contato. Se um dia o caos voltar (e ele sempre volta haha), é só chamar.

Sucesso aí! 🚀"

OBJETIVO: Dar a última chance de resposta ou encerrar educadamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D14</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_D14" sourceRef="Task_D14_WhatsApp_Meta" targetRef="Gateway_Converteu_Meta" />
    <bpmn2:sendTask id="Task_D9_WhatsApp_Meta" name="D9 - WhatsApp (Tarde) - Oferta Irresistível">
      <bpmn2:documentation>💰 DIA 9 - A OFERTA IRRESISTÍVEL:

Hora de fazer a oferta com escassez.

MENSAGEM:
"E aí [Nome], vou te fazer uma proposta:

Tô com 5 vagas essa semana pra liberar teste de 7 dias GRÁTIS + Onboarding personalizado (valor R$ 497) sem custo.

Mas só até sexta.

Se organizar o financeiro é prioridade, me confirma que eu separo uma vaga pra você. Se não for, sem problema, a gente se fala mais pra frente.

Bora?"

OBJETIVO: Criar senso de urgência e oportunidade limitada.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D9</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_D9" sourceRef="Task_D9_WhatsApp_Meta" targetRef="Task_D14_WhatsApp_Meta" />
    <bpmn2:sendTask id="Task_D6_WhatsApp_Meta" name="D6 - WhatsApp (Manhã) - Conteúdo Educativo">
      <bpmn2:documentation>📚 DIA 6 - EDUCAÇÃO (Soft Touch):

Lead ainda não comprou. Hora de educar sem vender.

MENSAGEM:
"Bom dia [Nome]!

Fiz esse vídeo rápido mostrando os 3 erros que TODO dono de [Segmento] comete no controle financeiro (e como evitar):

[Link para Vídeo Curto 2-3min]

Vale a pena assistir. Abraço!"

OBJETIVO: Gerar valor sem pedir nada em troca. Construir autoridade.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D6</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_D6" sourceRef="Task_D6_WhatsApp_Meta" targetRef="Task_D9_WhatsApp_Meta" />
    <bpmn2:sendTask id="Task_D3_WhatsApp_Meta" name="D3 - WhatsApp (Tarde) - A Prova Social">
      <bpmn2:documentation>👥 DIA 3 - PROVA SOCIAL:

MENSAGEM:
"[Nome], lembrei de você hoje.

Esse cliente aqui é do ramo de [Segmento] também. Olha o antes e depois dele em 7 dias:

[Print de Depoimento/Resultado]

Muita gente do seu ramo tá usando. Você já organizou aí ou continua no improviso?"

OBJETIVO: Mostrar que o nicho dele já usa e tem resultados.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D3</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_D3" sourceRef="Task_D3_WhatsApp_Meta" targetRef="Task_D6_WhatsApp_Meta" />
    <bpmn2:sendTask id="Task_D1_WhatsApp_Meta" name="D1 - WhatsApp (Manhã) - A Curiosidade">
      <bpmn2:documentation>🧠 DIA 1 - A CURIOSIDADE:

Lead Meta é frio. Precisa de nutrição antes de venda.

MENSAGEM:
"Bom dia [Nome]!

Você usa planilha, caderno ou já tem algum sistema hoje pra controlar o caixa?"

OBJETIVO: Entender a dor atual e gerar engajamento através da pergunta.</bpmn2:documentation>
      <bpmn2:incoming>Flow_1qdoel0</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D1</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_D1" sourceRef="Task_D1_WhatsApp_Meta" targetRef="Task_D3_WhatsApp_Meta" />
    <bpmn2:sendTask id="Task_FlashDemo_D0_Meta" name="D0 - Demo - Áudio + Print">
      <bpmn2:documentation>🎬 FLASH DEMO - PROVA IMEDIATA:

MENSAGEM (após resposta ou 15min):
"Olha só que demais. Você manda um áudio falando o que precisa lançar e a IA já organiza tudo.

[Áudio Flash Demo 20s]
[Print de resultado]

Testou algo parecido antes ou é a primeira vez vendo isso?"

OBJETIVO: Mostrar o produto funcionando antes de qualquer pitch.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D0_Zap</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_FlashDemo</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_FlashDemo" sourceRef="Task_FlashDemo_D0_Meta" targetRef="Gateway_Interessado_D0_Meta" />
    <bpmn2:sendTask id="Task_WhatsApp_D0_Meta" name="D0 - WhatsApp (Min 0-5) - Abordagem Ativa">
      <bpmn2:documentation>⚡ SPEED TO LEAD - META ADS (0-5 MINUTOS):

MENSAGEM INICIAL:
"Oi [Nome]! Vi que você acabou de preencher o formulário sobre gestão financeira.

Trabalha com [Segmento] mesmo? 🤔"

OBJETIVO: Quebra de gelo e confirmação de interesse real.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Filtro</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D0_Zap</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_D0_Zap" sourceRef="Task_WhatsApp_D0_Meta" targetRef="Task_FlashDemo_D0_Meta" />
    <bpmn2:serviceTask id="Task_GrupoNurturing_Meta" name="Grupo de Nurturing">
      <bpmn2:documentation>📢 NURTURING - LISTA DE AQUECIMENTO:

Lead Meta que não converteu mas respondeu vai para:
- Lista de e-mail marketing
- Grupo de promoções no WhatsApp
- Campanhas de remarketing Meta Ads

CONSIDERADO PERDIDO: Apenas se bloquear ou descadastrar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Respondeu_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sequenceFlow id="Flow_Meta_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Meta" targetRef="Task_GrupoNurturing_Meta" />
    <bpmn2:endEvent id="End_Bloqueio_Meta" name="Descadastrou/Bloqueou">
      <bpmn2:incoming>Flow_Meta_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_Meta_Nurturing" sourceRef="Task_GrupoNurturing_Meta" targetRef="End_Bloqueio_Meta" />
    <bpmn2:endEvent id="End_Perdido_Meta" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Meta_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_Meta_Motivo" sourceRef="Task_SelecaoMotivo_Meta" targetRef="End_Perdido_Meta" />
    <bpmn2:startEvent id="Start_Meta" name="Meta Ads">
      <bpmn2:outgoing>Flow_Meta_Start</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="Flow_Meta_Start" sourceRef="Start_Meta" targetRef="Task_PaginaFiltro_Meta" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_Comercial">
      <bpmndi:BPMNShape id="Shape_Participant_Educacao" bpmnElement="Participant_Educacao" isHorizontal="true" bioc:stroke="#51cf66" bioc:fill="#e0ffe0">
        <dc:Bounds x="160" y="80" width="4400" height="520" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Educacao_Software" bpmnElement="Start_Educacao_Software">
        <dc:Bounds x="232" y="332" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Educacao_Curso" bpmnElement="Start_Educacao_Curso">
        <dc:Bounds x="232" y="112" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cliente_Ativo_Educacao" bpmnElement="End_Cliente_Ativo_Educacao">
        <dc:Bounds x="3022" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cliente_Perdido_Educacao" bpmnElement="End_Cliente_Perdido_Educacao">
        <dc:Bounds x="3022" y="442" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Aula_Setup" bpmnElement="Task_Aula_Setup">
        <dc:Bounds x="820" y="200" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_CS_Liga_Ativacao" bpmnElement="Task_CS_Liga_Ativacao">
        <dc:Bounds x="1285" y="310" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_M1_Desafio_DRE" bpmnElement="Task_M1_Desafio_DRE">
        <dc:Bounds x="1595" y="200" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Renovacao_Anual" bpmnElement="Task_Renovacao_Anual">
        <dc:Bounds x="2835" y="200" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Renovacao_Mensal" bpmnElement="Task_Renovacao_Mensal">
        <dc:Bounds x="2835" y="310" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Bloqueio_Leitura" bpmnElement="Task_Bloqueio_Leitura">
        <dc:Bounds x="2525" y="420" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_CS_Recuperacao" bpmnElement="Task_CS_Recuperacao">
        <dc:Bounds x="2680" y="420" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Software" bpmnElement="Task_Tag_Software">
        <dc:Bounds x="355" y="310" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Curso" bpmnElement="Task_Tag_Curso">
        <dc:Bounds x="355" y="90" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Email_BoasVindas" bpmnElement="Task_Email_BoasVindas">
        <dc:Bounds x="665" y="200" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_M3_Checkpoint" bpmnElement="Task_M3_Checkpoint">
        <dc:Bounds x="1905" y="200" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D150_Aviso" bpmnElement="Task_D150_Aviso">
        <dc:Bounds x="2215" y="200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_Entrada" bpmnElement="Gateway_Merge_Entrada" isMarkerVisible="true">
        <dc:Bounds x="535" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Ativou_D7" bpmnElement="Gateway_Ativou_D7" isMarkerVisible="true">
        <dc:Bounds x="1155" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_Ativacao" bpmnElement="Gateway_Merge_Ativacao" isMarkerVisible="true">
        <dc:Bounds x="1465" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Renovou" bpmnElement="Gateway_Renovou" isMarkerVisible="true">
        <dc:Bounds x="2550" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Tipo_Renovacao" bpmnElement="Gateway_Tipo_Renovacao" isMarkerVisible="true">
        <dc:Bounds x="2705" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Recuperou" bpmnElement="Gateway_Recuperou" isMarkerVisible="true">
        <dc:Bounds x="2860" y="435" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_D7" bpmnElement="IntermediateTimer_D7">
        <dc:Bounds x="1007" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_M2" bpmnElement="IntermediateTimer_M2">
        <dc:Bounds x="1782" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_M5" bpmnElement="IntermediateTimer_M5">
        <dc:Bounds x="2092" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_30d" bpmnElement="IntermediateTimer_30d">
        <dc:Bounds x="2402" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Soft_1" bpmnElement="Flow_Edu_Soft_1">
        <di:waypoint x="268" y="350" />
        <di:waypoint x="355" y="350" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Soft_2" bpmnElement="Flow_Edu_Soft_2">
        <di:waypoint x="455" y="350" />
        <di:waypoint x="485" y="350" />
        <di:waypoint x="485" y="240" />
        <di:waypoint x="535" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Curso_1" bpmnElement="Flow_Edu_Curso_1">
        <di:waypoint x="268" y="130" />
        <di:waypoint x="355" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Curso_2" bpmnElement="Flow_Edu_Curso_2">
        <di:waypoint x="455" y="130" />
        <di:waypoint x="485" y="130" />
        <di:waypoint x="485" y="240" />
        <di:waypoint x="535" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Merge_1" bpmnElement="Flow_Edu_Merge_1">
        <di:waypoint x="585" y="240" />
        <di:waypoint x="665" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Email_1" bpmnElement="Flow_Edu_Email_1">
        <di:waypoint x="765" y="240" />
        <di:waypoint x="820" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Setup_1" bpmnElement="Flow_Edu_Setup_1">
        <di:waypoint x="920" y="240" />
        <di:waypoint x="1007" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Timer_D7" bpmnElement="Flow_Edu_Timer_D7">
        <di:waypoint x="1043" y="240" />
        <di:waypoint x="1155" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ativou_Nao" bpmnElement="Flow_Edu_Ativou_Nao">
        <di:waypoint x="1205" y="240" />
        <di:waypoint x="1235" y="240" />
        <di:waypoint x="1235" y="350" />
        <di:waypoint x="1285" y="350" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ativou_Sim" bpmnElement="Flow_Edu_Ativou_Sim">
        <di:waypoint x="1205" y="240" />
        <di:waypoint x="1465" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_CS_Ativa" bpmnElement="Flow_Edu_CS_Ativa">
        <di:waypoint x="1385" y="350" />
        <di:waypoint x="1415" y="350" />
        <di:waypoint x="1415" y="240" />
        <di:waypoint x="1465" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Merge_Ativa" bpmnElement="Flow_Edu_Merge_Ativa">
        <di:waypoint x="1515" y="240" />
        <di:waypoint x="1595" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_M1" bpmnElement="Flow_Edu_M1">
        <di:waypoint x="1695" y="240" />
        <di:waypoint x="1782" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_M2" bpmnElement="Flow_Edu_M2">
        <di:waypoint x="1818" y="240" />
        <di:waypoint x="1905" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_M3" bpmnElement="Flow_Edu_M3">
        <di:waypoint x="2005" y="240" />
        <di:waypoint x="2092" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_M5" bpmnElement="Flow_Edu_M5">
        <di:waypoint x="2128" y="240" />
        <di:waypoint x="2215" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_D150" bpmnElement="Flow_Edu_D150">
        <di:waypoint x="2315" y="240" />
        <di:waypoint x="2402" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_30d" bpmnElement="Flow_Edu_30d">
        <di:waypoint x="2438" y="240" />
        <di:waypoint x="2550" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Renovou_Sim" bpmnElement="Flow_Edu_Renovou_Sim">
        <di:waypoint x="2600" y="240" />
        <di:waypoint x="2705" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Renovou_Nao" bpmnElement="Flow_Edu_Renovou_Nao">
        <di:waypoint x="2575" y="265" />
        <di:waypoint x="2575" y="420" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Tipo_Anual" bpmnElement="Flow_Edu_Tipo_Anual">
        <di:waypoint x="2755" y="240" />
        <di:waypoint x="2835" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Tipo_Mensal" bpmnElement="Flow_Edu_Tipo_Mensal">
        <di:waypoint x="2755" y="240" />
        <di:waypoint x="2785" y="240" />
        <di:waypoint x="2785" y="350" />
        <di:waypoint x="2835" y="350" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2792" y="313" width="36" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Renov_Anual" bpmnElement="Flow_Edu_Renov_Anual">
        <di:waypoint x="2935" y="240" />
        <di:waypoint x="3022" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Renov_Mensal" bpmnElement="Flow_Edu_Renov_Mensal">
        <di:waypoint x="2935" y="350" />
        <di:waypoint x="2965" y="350" />
        <di:waypoint x="2965" y="240" />
        <di:waypoint x="3022" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Bloqueio" bpmnElement="Flow_Edu_Bloqueio">
        <di:waypoint x="2625" y="460" />
        <di:waypoint x="2680" y="460" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_CS_Recovery" bpmnElement="Flow_Edu_CS_Recovery">
        <di:waypoint x="2780" y="460" />
        <di:waypoint x="2860" y="460" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Recuperou_Sim" bpmnElement="Flow_Edu_Recuperou_Sim">
        <di:waypoint x="2885" y="435" />
        <di:waypoint x="2885" y="399" />
        <di:waypoint x="2730" y="399" />
        <di:waypoint x="2730" y="265" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Recuperou_Nao" bpmnElement="Flow_Edu_Recuperou_Nao">
        <di:waypoint x="2910" y="460" />
        <di:waypoint x="3022" y="460" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Indicacao" bpmnElement="Participant_Indicacao" isHorizontal="true" bioc:stroke="#ff6b6b" bioc:fill="#ffe0e0">
        <dc:Bounds x="160" y="650" width="4400" height="630" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Indicacao_Ativo" bpmnElement="Start_Indicacao_Ativo">
        <dc:Bounds x="232" y="682" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Indicacao_Passivo" bpmnElement="Start_Indicacao_Passivo">
        <dc:Bounds x="232" y="902" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Motivo_Indicacao" bpmnElement="End_Perdido_Motivo_Indicacao">
        <dc:Bounds x="2867" y="1122" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Indicacao" bpmnElement="End_Bloqueio_Indicacao">
        <dc:Bounds x="2867" y="1012" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Ativo" bpmnElement="Task_Tag_Ativo">
        <dc:Bounds x="355" y="660" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Passivo" bpmnElement="Task_Tag_Passivo">
        <dc:Bounds x="355" y="880" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Instagram_Indicacao" bpmnElement="Task_D0_Instagram_Indicacao">
        <dc:Bounds x="1130" y="880" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Trial7d_Indicacao" bpmnElement="Task_Trial7d_Indicacao">
        <dc:Bounds x="1580" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Indicacao" bpmnElement="Task_GrupoNurturing_Indicacao">
        <dc:Bounds x="2680" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_WhatsApp1_Indicacao" bpmnElement="Task_D0_WhatsApp1_Indicacao">
        <dc:Bounds x="975" y="880" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_WhatsApp2_Indicacao" bpmnElement="Task_D1_WhatsApp2_Indicacao">
        <dc:Bounds x="1750" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_WhatsApp3_Indicacao" bpmnElement="Task_D3_WhatsApp3_Indicacao">
        <dc:Bounds x="1905" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D6_WhatsApp4_Indicacao" bpmnElement="Task_D6_WhatsApp4_Indicacao">
        <dc:Bounds x="2060" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D10_WhatsApp5_Indicacao" bpmnElement="Task_D10_WhatsApp5_Indicacao">
        <dc:Bounds x="2215" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_AvisaParceiro" bpmnElement="Task_AvisaParceiro">
        <dc:Bounds x="2680" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_QuebraGelo_Ativo" bpmnElement="Task_QuebraGelo_Ativo">
        <dc:Bounds x="510" y="660" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_QuebraGelo_Passivo" bpmnElement="Task_QuebraGelo_Passivo">
        <dc:Bounds x="510" y="880" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Ligacao_Indicacao" bpmnElement="Task_D0_Ligacao_Indicacao">
        <dc:Bounds x="820" y="770" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Qualifica_Indicacao" bpmnElement="Task_D0_Qualifica_Indicacao">
        <dc:Bounds x="1130" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SelecaoMotivo_Indicacao" bpmnElement="Task_SelecaoMotivo_Indicacao">
        <dc:Bounds x="2680" y="1100" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Indicacao" bpmnElement="Task_FlashDemo_Indicacao">
        <dc:Bounds x="1440" y="990" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_PressaoSocial" bpmnElement="Task_PressaoSocial">
        <dc:Bounds x="1940" y="1100" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_Lembrete" bpmnElement="Task_D1_Lembrete">
        <dc:Bounds x="1960" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_ProvaSocial" bpmnElement="Task_D3_ProvaSocial">
        <dc:Bounds x="2100" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D5_Ultimato" bpmnElement="Task_D5_Ultimato">
        <dc:Bounds x="2240" y="990" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Atendeu_D0_Indicacao" bpmnElement="Gateway_Atendeu_D0_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="1000" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_D0_Indicacao" bpmnElement="Gateway_Converteu_D0_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="1310" y="785" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1293" y="761" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_D0_Indicacao" bpmnElement="Gateway_Merge_D0_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="1620" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Indicacao" bpmnElement="Gateway_Converteu_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="2395" y="785" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2391" y="761" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu_Breakup_Indicacao" bpmnElement="Gateway_Respondeu_Breakup_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="2550" y="1115" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_MergeIndicacao" bpmnElement="Gateway_MergeIndicacao" isMarkerVisible="true">
        <dc:Bounds x="690" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_UsouEm48h" bpmnElement="Gateway_UsouEm48h" isMarkerVisible="true">
        <dc:Bounds x="1820" y="1005" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_24h_Breakup_Indicacao" bpmnElement="IntermediateTimer_24h_Breakup_Indicacao">
        <dc:Bounds x="2402" y="1122" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_48h" bpmnElement="IntermediateTimer_48h">
        <dc:Bounds x="1702" y="1012" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Indicacao" bpmnElement="LinkThrow_Indicacao">
        <dc:Bounds x="2557" y="792" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_1" bpmnElement="Flow_Ind_Ativo_1">
        <di:waypoint x="268" y="700" />
        <di:waypoint x="355" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_2" bpmnElement="Flow_Ind_Ativo_2">
        <di:waypoint x="455" y="700" />
        <di:waypoint x="510" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_3" bpmnElement="Flow_Ind_Ativo_3">
        <di:waypoint x="610" y="700" />
        <di:waypoint x="640" y="700" />
        <di:waypoint x="640" y="810" />
        <di:waypoint x="690" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_1" bpmnElement="Flow_Ind_Passivo_1">
        <di:waypoint x="268" y="920" />
        <di:waypoint x="355" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_2" bpmnElement="Flow_Ind_Passivo_2">
        <di:waypoint x="455" y="920" />
        <di:waypoint x="510" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_3" bpmnElement="Flow_Ind_Passivo_3">
        <di:waypoint x="610" y="920" />
        <di:waypoint x="640" y="920" />
        <di:waypoint x="640" y="810" />
        <di:waypoint x="690" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Merged" bpmnElement="Flow_Ind_Merged">
        <di:waypoint x="740" y="810" />
        <di:waypoint x="820" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Demo" bpmnElement="Flow_Ind_Demo">
        <di:waypoint x="1540" y="1030" />
        <di:waypoint x="1580" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trial" bpmnElement="Flow_Ind_Trial">
        <di:waypoint x="1680" y="1030" />
        <di:waypoint x="1702" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Timer_Check" bpmnElement="Flow_Ind_Timer_Check">
        <di:waypoint x="1738" y="1030" />
        <di:waypoint x="1820" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_NaoUsou" bpmnElement="Flow_Ind_NaoUsou">
        <di:waypoint x="1845" y="1055" />
        <di:waypoint x="1845" y="1140" />
        <di:waypoint x="1940" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Usou" bpmnElement="Flow_Ind_Usou">
        <di:waypoint x="1870" y="1030" />
        <di:waypoint x="1960" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Pressao" bpmnElement="Flow_Ind_Pressao">
        <di:waypoint x="2010" y="1100" />
        <di:waypoint x="2010" y="1070" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D1" bpmnElement="Flow_Ind_D1">
        <di:waypoint x="2060" y="1030" />
        <di:waypoint x="2100" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D3" bpmnElement="Flow_Ind_D3">
        <di:waypoint x="2200" y="1030" />
        <di:waypoint x="2240" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D5" bpmnElement="Flow_Ind_D5">
        <di:waypoint x="2340" y="1030" />
        <di:waypoint x="2420" y="1030" />
        <di:waypoint x="2420" y="835" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Sim" bpmnElement="Flow_Ind_Sim">
        <di:waypoint x="2445" y="810" />
        <di:waypoint x="2680" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Aviso" bpmnElement="Flow_Ind_Aviso">
        <di:waypoint x="2730" y="850" />
        <di:waypoint x="2730" y="870" />
        <di:waypoint x="2575" y="870" />
        <di:waypoint x="2575" y="828" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Nao" bpmnElement="Flow_Ind_Nao">
        <di:waypoint x="2445" y="810" />
        <di:waypoint x="2475" y="810" />
        <di:waypoint x="2475" y="1030" />
        <di:waypoint x="2680" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Nurturing" bpmnElement="Flow_Ind_Nurturing">
        <di:waypoint x="2780" y="1030" />
        <di:waypoint x="2867" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Lig" bpmnElement="Flow_Ind_D0_Lig">
        <di:waypoint x="920" y="810" />
        <di:waypoint x="1000" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Atendeu" bpmnElement="Flow_Ind_D0_Atendeu">
        <di:waypoint x="1050" y="810" />
        <di:waypoint x="1130" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_NaoAtendeu" bpmnElement="Flow_Ind_D0_NaoAtendeu">
        <di:waypoint x="1025" y="835" />
        <di:waypoint x="1025" y="880" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1059" y="853" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Check" bpmnElement="Flow_Ind_D0_Check">
        <di:waypoint x="1230" y="810" />
        <di:waypoint x="1310" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Converteu_Nao" bpmnElement="Flow_Ind_D0_Converteu_Nao">
        <di:waypoint x="1335" y="835" />
        <di:waypoint x="1335" y="1030" />
        <di:waypoint x="1440" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Zap1" bpmnElement="Flow_Ind_D0_Zap1">
        <di:waypoint x="1075" y="920" />
        <di:waypoint x="1130" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Merge" bpmnElement="Flow_Ind_D0_Merge">
        <di:waypoint x="1670" y="810" />
        <di:waypoint x="1750" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D1_Zap2" bpmnElement="Flow_Ind_D1_Zap2">
        <di:waypoint x="1850" y="810" />
        <di:waypoint x="1905" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D3_Zap3" bpmnElement="Flow_Ind_D3_Zap3">
        <di:waypoint x="2005" y="810" />
        <di:waypoint x="2060" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D6_Zap4" bpmnElement="Flow_Ind_D6_Zap4">
        <di:waypoint x="2160" y="810" />
        <di:waypoint x="2215" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D10_Check" bpmnElement="Flow_Ind_D10_Check">
        <di:waypoint x="2315" y="810" />
        <di:waypoint x="2395" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Converteu_Sim" bpmnElement="Flow_Ind_Converteu_Sim">
        <di:waypoint x="2445" y="810" />
        <di:waypoint x="2557" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Converteu_Nao" bpmnElement="Flow_Ind_Converteu_Nao">
        <di:waypoint x="2420" y="835" />
        <di:waypoint x="2420" y="1122" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Check_Breakup" bpmnElement="Flow_Ind_Check_Breakup">
        <di:waypoint x="2438" y="1140" />
        <di:waypoint x="2550" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Respondeu_Nao" bpmnElement="Flow_Ind_Respondeu_Nao">
        <di:waypoint x="2600" y="1140" />
        <di:waypoint x="2680" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Motivo" bpmnElement="Flow_Ind_Motivo">
        <di:waypoint x="2780" y="1140" />
        <di:waypoint x="2867" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Respondeu_Sim" bpmnElement="Flow_Ind_Respondeu_Sim">
        <di:waypoint x="2600" y="1140" />
        <di:waypoint x="2630" y="1140" />
        <di:waypoint x="2630" y="1030" />
        <di:waypoint x="2680" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1kc5wwv_di" bpmnElement="Flow_1kc5wwv">
        <di:waypoint x="1360" y="810" />
        <di:waypoint x="1620" y="810" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1481" y="792" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Conteudo" bpmnElement="Participant_Conteudo" isHorizontal="true" bioc:stroke="#9775fa" bioc:fill="#f0e0ff">
        <dc:Bounds x="160" y="1330" width="4400" height="520" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Conteudo_Pessoal" bpmnElement="Start_Conteudo_Pessoal">
        <dc:Bounds x="232" y="1582" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="231" y="1618" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Conteudo_Empresa" bpmnElement="Start_Conteudo_Empresa">
        <dc:Bounds x="232" y="1362" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="233" y="1398" width="36" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Conteudo" bpmnElement="End_Bloqueio_Conteudo">
        <dc:Bounds x="2092" y="1692" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Conteudo" bpmnElement="End_Perdido_Conteudo">
        <dc:Bounds x="2092" y="1582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ManyChat_Pessoal" bpmnElement="Task_ManyChat_Pessoal">
        <dc:Bounds x="355" y="1560" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Conteudo" bpmnElement="Task_GrupoNurturing_Conteudo">
        <dc:Bounds x="1905" y="1670" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_Pessoal" bpmnElement="Task_WhatsApp_Pessoal">
        <dc:Bounds x="510" y="1560" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Pessoal" bpmnElement="Task_FlashDemo_Pessoal">
        <dc:Bounds x="665" y="1560" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SDR_Empresa" bpmnElement="Task_SDR_Empresa">
        <dc:Bounds x="355" y="1340" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_Empresa" bpmnElement="Task_WhatsApp_Empresa">
        <dc:Bounds x="510" y="1340" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Empresa" bpmnElement="Task_FlashDemo_Empresa">
        <dc:Bounds x="665" y="1340" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_Repost_Conteudo" bpmnElement="Task_D1_Repost_Conteudo">
        <dc:Bounds x="1130" y="1450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_Prova_Conteudo" bpmnElement="Task_D3_Prova_Conteudo">
        <dc:Bounds x="1285" y="1450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D7_Fechamento_Conteudo" bpmnElement="Task_D7_Fechamento_Conteudo">
        <dc:Bounds x="1440" y="1450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SelecaoMotivo_Conteudo" bpmnElement="Task_SelecaoMotivo_Conteudo">
        <dc:Bounds x="1905" y="1560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_Conteudo" bpmnElement="Gateway_Merge_Conteudo" isMarkerVisible="true">
        <dc:Bounds x="845" y="1465" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Imediato_Conteudo" bpmnElement="Gateway_Converteu_Imediato_Conteudo" isMarkerVisible="true">
        <dc:Bounds x="1000" y="1465" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="983" y="1441" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Conteudo" bpmnElement="Gateway_Converteu_Conteudo" isMarkerVisible="true">
        <dc:Bounds x="1620" y="1465" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1616" y="1441" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu_Conteudo" bpmnElement="Gateway_Respondeu_Conteudo" isMarkerVisible="true">
        <dc:Bounds x="1775" y="1685" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_24h_Conteudo" bpmnElement="IntermediateTimer_24h_Conteudo">
        <dc:Bounds x="1627" y="1692" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Conteudo" bpmnElement="LinkThrow_Conteudo">
        <dc:Bounds x="1782" y="1472" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_1em5f2z" bpmnElement="Event_1iw749o">
        <dc:Bounds x="1007" y="1622" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="995" y="1658" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_1" bpmnElement="Flow_Cont_Pessoal_1">
        <di:waypoint x="268" y="1600" />
        <di:waypoint x="355" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_2" bpmnElement="Flow_Cont_Pessoal_2">
        <di:waypoint x="455" y="1600" />
        <di:waypoint x="510" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_3" bpmnElement="Flow_Cont_Pessoal_3">
        <di:waypoint x="610" y="1600" />
        <di:waypoint x="665" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_Merge" bpmnElement="Flow_Cont_Pessoal_Merge">
        <di:waypoint x="765" y="1600" />
        <di:waypoint x="795" y="1600" />
        <di:waypoint x="795" y="1490" />
        <di:waypoint x="845" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_1" bpmnElement="Flow_Cont_Empresa_1">
        <di:waypoint x="268" y="1380" />
        <di:waypoint x="355" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_2" bpmnElement="Flow_Cont_Empresa_2">
        <di:waypoint x="455" y="1380" />
        <di:waypoint x="510" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_3" bpmnElement="Flow_Cont_Empresa_3">
        <di:waypoint x="610" y="1380" />
        <di:waypoint x="665" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_Merge" bpmnElement="Flow_Cont_Empresa_Merge">
        <di:waypoint x="765" y="1380" />
        <di:waypoint x="795" y="1380" />
        <di:waypoint x="795" y="1490" />
        <di:waypoint x="845" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Merged" bpmnElement="Flow_Cont_Merged">
        <di:waypoint x="895" y="1490" />
        <di:waypoint x="1000" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Imediato_Nao" bpmnElement="Flow_Cont_Imediato_Nao">
        <di:waypoint x="1050" y="1490" />
        <di:waypoint x="1130" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_D1" bpmnElement="Flow_Cont_D1">
        <di:waypoint x="1230" y="1490" />
        <di:waypoint x="1285" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_D3" bpmnElement="Flow_Cont_D3">
        <di:waypoint x="1385" y="1490" />
        <di:waypoint x="1440" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Converteu_Sim" bpmnElement="Flow_Cont_Converteu_Sim">
        <di:waypoint x="1670" y="1490" />
        <di:waypoint x="1782" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Converteu_Nao" bpmnElement="Flow_Cont_Converteu_Nao">
        <di:waypoint x="1645" y="1515" />
        <di:waypoint x="1645" y="1692" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Timer" bpmnElement="Flow_Cont_Timer">
        <di:waypoint x="1663" y="1710" />
        <di:waypoint x="1775" y="1710" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Respondeu_Sim" bpmnElement="Flow_Cont_Respondeu_Sim">
        <di:waypoint x="1825" y="1710" />
        <di:waypoint x="1905" y="1710" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Nurturing" bpmnElement="Flow_Cont_Nurturing">
        <di:waypoint x="2005" y="1710" />
        <di:waypoint x="2092" y="1710" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Respondeu_Nao" bpmnElement="Flow_Cont_Respondeu_Nao">
        <di:waypoint x="1825" y="1710" />
        <di:waypoint x="1855" y="1710" />
        <di:waypoint x="1855" y="1600" />
        <di:waypoint x="1905" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Motivo" bpmnElement="Flow_Cont_Motivo">
        <di:waypoint x="2005" y="1600" />
        <di:waypoint x="2092" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1un3847_di" bpmnElement="Flow_1un3847">
        <di:waypoint x="1540" y="1490" />
        <di:waypoint x="1620" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0c7r836_di" bpmnElement="Flow_0c7r836">
        <di:waypoint x="1025" y="1515" />
        <di:waypoint x="1025" y="1622" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1030" y="1566" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Prospeccao" bpmnElement="Participant_Prospeccao" isHorizontal="true" bioc:stroke="#fa5252" bioc:fill="#ffe0e0">
        <dc:Bounds x="160" y="1900" width="4400" height="160" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Prospeccao" bpmnElement="Start_Prospeccao">
        <dc:Bounds x="232" y="1932" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_Placeholder" bpmnElement="Task_Prosp_Placeholder">
        <dc:Bounds x="355" y="1910" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Prospeccao" bpmnElement="LinkThrow_Prospeccao">
        <dc:Bounds x="542" y="1932" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_1" bpmnElement="Flow_Prosp_1">
        <di:waypoint x="268" y="1950" />
        <di:waypoint x="355" y="1950" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_2" bpmnElement="Flow_Prosp_2">
        <di:waypoint x="455" y="1950" />
        <di:waypoint x="542" y="1950" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Google" bpmnElement="Participant_Google" isHorizontal="true" bioc:stroke="#4dabf7" bioc:fill="#e0f0ff">
        <dc:Bounds x="160" y="2110" width="4400" height="660" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_Google_di" bpmnElement="Start_Google">
        <dc:Bounds x="250" y="2302" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Perdido_Motivo_Google_di" bpmnElement="End_Perdido_Motivo_Google">
        <dc:Bounds x="3282" y="2522" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Pago_Google_di" bpmnElement="End_Pago_Google">
        <dc:Bounds x="1332" y="2192" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AutomacaoBoasVindas_di" bpmnElement="Task_AutomacaoBoasVindas">
        <dc:Bounds x="870" y="2170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RecuperacaoCarrinho_di" bpmnElement="Task_RecuperacaoCarrinho">
        <dc:Bounds x="870" y="2500" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_AceitouTrial_Google_di" bpmnElement="Gateway_AceitouTrial_Google" isMarkerVisible="true">
        <dc:Bounds x="1105" y="2405" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1096" y="2381" width="67" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FlashDemo_Google_di" bpmnElement="Task_FlashDemo_Google">
        <dc:Bounds x="820" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_OfertaTrial_Google_di" bpmnElement="Task_OfertaTrial_Google">
        <dc:Bounds x="960" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SubProcess_Trial_Google_di" bpmnElement="SubProcess_Trial_Google" isExpanded="true" bioc:stroke="#4dabf7" bioc:fill="#e0f0ff">
        <dc:Bounds x="1010" y="2490" width="1540" height="220" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_Trial_di" bpmnElement="Start_Trial">
        <dc:Bounds x="1030" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D0_BoasVindas_di" bpmnElement="Task_Trial_D0_BoasVindas">
        <dc:Bounds x="1090" y="2560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_24h_di" bpmnElement="Timer_Trial_24h">
        <dc:Bounds x="1212" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D1_Uso_di" bpmnElement="Gateway_Trial_D1_Uso" isMarkerVisible="true">
        <dc:Bounds x="1270" y="2575" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D1_Dica_di" bpmnElement="Task_Trial_D1_Dica">
        <dc:Bounds x="1345" y="2510" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D1_Reengajamento_di" bpmnElement="Task_Trial_D1_Reengajamento">
        <dc:Bounds x="1345" y="2620" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D1_Merge_di" bpmnElement="Gateway_Trial_D1_Merge" isMarkerVisible="true">
        <dc:Bounds x="1470" y="2575" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D2_di" bpmnElement="Timer_Trial_D2">
        <dc:Bounds x="1542" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D2_Case_di" bpmnElement="Task_Trial_D2_Case">
        <dc:Bounds x="1600" y="2560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D3_di" bpmnElement="Timer_Trial_D3">
        <dc:Bounds x="1722" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D3_Uso_di" bpmnElement="Gateway_Trial_D3_Uso" isMarkerVisible="true">
        <dc:Bounds x="1780" y="2575" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D3_Parabens_di" bpmnElement="Task_Trial_D3_Parabens">
        <dc:Bounds x="1855" y="2510" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D3_Resgate_di" bpmnElement="Task_Trial_D3_Resgate">
        <dc:Bounds x="1855" y="2620" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D3_Merge_di" bpmnElement="Gateway_Trial_D3_Merge" isMarkerVisible="true">
        <dc:Bounds x="1980" y="2575" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D5_di" bpmnElement="Timer_Trial_D5">
        <dc:Bounds x="2052" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D5_Urgencia_di" bpmnElement="Task_Trial_D5_Urgencia">
        <dc:Bounds x="2110" y="2560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D6_di" bpmnElement="Timer_Trial_D6">
        <dc:Bounds x="2232" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D6_Oferta_di" bpmnElement="Task_Trial_D6_Oferta">
        <dc:Bounds x="2290" y="2560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D7_di" bpmnElement="Timer_Trial_D7">
        <dc:Bounds x="2412" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Trial_di" bpmnElement="End_Trial">
        <dc:Bounds x="2472" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_Trial_D0_di" bpmnElement="Flow_Trial_D0">
        <di:waypoint x="1066" y="2600" />
        <di:waypoint x="1090" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D0_D1_di" bpmnElement="Flow_Trial_D0_D1">
        <di:waypoint x="1190" y="2600" />
        <di:waypoint x="1212" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Check_di" bpmnElement="Flow_Trial_D1_Check">
        <di:waypoint x="1248" y="2600" />
        <di:waypoint x="1270" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Sim_di" bpmnElement="Flow_Trial_D1_Sim">
        <di:waypoint x="1295" y="2575" />
        <di:waypoint x="1295" y="2550" />
        <di:waypoint x="1345" y="2550" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1301" y="2523" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Nao_di" bpmnElement="Flow_Trial_D1_Nao">
        <di:waypoint x="1295" y="2625" />
        <di:waypoint x="1295" y="2660" />
        <di:waypoint x="1345" y="2660" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1300" y="2663" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Merge_di" bpmnElement="Flow_Trial_D1_Merge">
        <di:waypoint x="1445" y="2550" />
        <di:waypoint x="1495" y="2550" />
        <di:waypoint x="1495" y="2575" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Merge2_di" bpmnElement="Flow_Trial_D1_Merge2">
        <di:waypoint x="1445" y="2660" />
        <di:waypoint x="1495" y="2660" />
        <di:waypoint x="1495" y="2625" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_D2_di" bpmnElement="Flow_Trial_D1_D2">
        <di:waypoint x="1520" y="2600" />
        <di:waypoint x="1542" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D2_Start_di" bpmnElement="Flow_Trial_D2_Start">
        <di:waypoint x="1578" y="2600" />
        <di:waypoint x="1600" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D2_D3_di" bpmnElement="Flow_Trial_D2_D3">
        <di:waypoint x="1700" y="2600" />
        <di:waypoint x="1722" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Check_di" bpmnElement="Flow_Trial_D3_Check">
        <di:waypoint x="1758" y="2600" />
        <di:waypoint x="1780" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Sim_di" bpmnElement="Flow_Trial_D3_Sim">
        <di:waypoint x="1805" y="2575" />
        <di:waypoint x="1805" y="2550" />
        <di:waypoint x="1855" y="2550" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1811" y="2523" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Nao_di" bpmnElement="Flow_Trial_D3_Nao">
        <di:waypoint x="1805" y="2625" />
        <di:waypoint x="1805" y="2660" />
        <di:waypoint x="1855" y="2660" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1819" y="2673" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Merge1_di" bpmnElement="Flow_Trial_D3_Merge1">
        <di:waypoint x="1955" y="2550" />
        <di:waypoint x="2005" y="2550" />
        <di:waypoint x="2005" y="2575" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Merge2_di" bpmnElement="Flow_Trial_D3_Merge2">
        <di:waypoint x="1955" y="2660" />
        <di:waypoint x="2005" y="2660" />
        <di:waypoint x="2005" y="2625" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_D5_di" bpmnElement="Flow_Trial_D3_D5">
        <di:waypoint x="2030" y="2600" />
        <di:waypoint x="2052" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D5_Start_di" bpmnElement="Flow_Trial_D5_Start">
        <di:waypoint x="2088" y="2600" />
        <di:waypoint x="2110" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D5_D6_di" bpmnElement="Flow_Trial_D5_D6">
        <di:waypoint x="2210" y="2600" />
        <di:waypoint x="2232" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D6_Start_di" bpmnElement="Flow_Trial_D6_Start">
        <di:waypoint x="2268" y="2600" />
        <di:waypoint x="2290" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D6_D7_di" bpmnElement="Flow_Trial_D6_D7">
        <di:waypoint x="2390" y="2600" />
        <di:waypoint x="2412" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D7_End_di" bpmnElement="Flow_Trial_D7_End">
        <di:waypoint x="2448" y="2600" />
        <di:waypoint x="2472" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Task_ClickCheckout_Self_di" bpmnElement="Task_ClickCheckout_Self">
        <dc:Bounds x="500" y="2170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PreencheDados_Self_di" bpmnElement="Task_PreencheDados_Self">
        <dc:Bounds x="640" y="2170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AlertaHumano_Google_di" bpmnElement="Task_AlertaHumano_Google">
        <dc:Bounds x="1180" y="2170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ClickWhatsApp_di" bpmnElement="Task_ClickWhatsApp">
        <dc:Bounds x="500" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SpeedToLead_Google_di" bpmnElement="Task_SpeedToLead_Google">
        <dc:Bounds x="640" y="2390" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SelecaoMotivo_Google_di" bpmnElement="Task_SelecaoMotivo_Google">
        <dc:Bounds x="3140" y="2500" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_CaminhoGoogle_di" bpmnElement="Gateway_CaminhoGoogle" isMarkerVisible="true">
        <dc:Bounds x="370" y="2295" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Pagamento_Self_di" bpmnElement="Gateway_Pagamento_Self" isMarkerVisible="true">
        <dc:Bounds x="780" y="2185" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_PrimeiroAudio_di" bpmnElement="Gateway_PrimeiroAudio" isMarkerVisible="true">
        <dc:Bounds x="1090" y="2185" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="IntermediateTimer_24h_Google_di" bpmnElement="IntermediateTimer_24h_Google">
        <dc:Bounds x="1010" y="2192" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Merge_D0_Google_di" bpmnElement="Gateway_Merge_D0_Google" isMarkerVisible="true">
        <dc:Bounds x="1750" y="2295" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1740" y="2352" width="71" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LinkThrow_Google_di" bpmnElement="LinkThrow_Google">
        <dc:Bounds x="2830" y="2302" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2818" y="2338" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="IntermediateTimer_24h_Breakup_Google_di" bpmnElement="IntermediateTimer_24h_Breakup_Google">
        <dc:Bounds x="2972" y="2412" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2981" y="2448" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Respondeu_Breakup_Google_di" bpmnElement="Gateway_Respondeu_Breakup_Google" isMarkerVisible="true">
        <dc:Bounds x="3050" y="2405" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3044" y="2455" width="63" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Converteu_Google_di" bpmnElement="Gateway_Converteu_Google" isMarkerVisible="true">
        <dc:Bounds x="2720" y="2295" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2717" y="2345" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D5_Ligacao3_Google_di" bpmnElement="Task_D5_Ligacao3_Google">
        <dc:Bounds x="2440" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D1_Ligacao2_Google_di" bpmnElement="Task_D1_Ligacao2_Google">
        <dc:Bounds x="2020" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D7_Fechamento_Google_di" bpmnElement="Task_D7_Fechamento_Google">
        <dc:Bounds x="2580" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D7_WhatsApp6_Breakup_Google_di" bpmnElement="Task_D7_WhatsApp6_Breakup_Google">
        <dc:Bounds x="2830" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D5_WhatsApp5_Pressao_Google_di" bpmnElement="Task_D5_WhatsApp5_Pressao_Google">
        <dc:Bounds x="2300" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D3_WhatsApp4_Case_Google_di" bpmnElement="Task_D3_WhatsApp4_Case_Google">
        <dc:Bounds x="2160" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D1_WhatsApp3_Diferenca_Google_di" bpmnElement="Task_D1_WhatsApp3_Diferenca_Google">
        <dc:Bounds x="1880" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_GrupoNurturing_Google_di" bpmnElement="Task_GrupoNurturing_Google">
        <dc:Bounds x="3140" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Bloqueio_Google_di" bpmnElement="End_Bloqueio_Google">
        <dc:Bounds x="3282" y="2412" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3260" y="2448" width="81" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_Goo_Start_di" bpmnElement="Flow_Goo_Start">
        <di:waypoint x="286" y="2320" />
        <di:waypoint x="370" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_di" bpmnElement="Flow_Goo_Self">
        <di:waypoint x="395" y="2295" />
        <di:waypoint x="395" y="2210" />
        <di:waypoint x="500" y="2210" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="400" y="2173" width="79" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_1_di" bpmnElement="Flow_Goo_Self_1">
        <di:waypoint x="600" y="2210" />
        <di:waypoint x="640" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_2_di" bpmnElement="Flow_Goo_Self_2">
        <di:waypoint x="740" y="2210" />
        <di:waypoint x="780" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Sucesso_di" bpmnElement="Flow_Goo_Sucesso">
        <di:waypoint x="830" y="2210" />
        <di:waypoint x="870" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Falha_di" bpmnElement="Flow_Goo_Falha">
        <di:waypoint x="805" y="2235" />
        <di:waypoint x="805" y="2540" />
        <di:waypoint x="870" y="2540" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="699" y="2533" width="81" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_BoasVindas_di" bpmnElement="Flow_Goo_BoasVindas">
        <di:waypoint x="970" y="2210" />
        <di:waypoint x="1010" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Recuperacao_di" bpmnElement="Flow_Goo_Recuperacao">
        <di:waypoint x="970" y="2540" />
        <di:waypoint x="1130" y="2540" />
        <di:waypoint x="1130" y="2455" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Check24h_di" bpmnElement="Flow_Goo_Check24h">
        <di:waypoint x="1046" y="2210" />
        <di:waypoint x="1090" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_NaoMandou_di" bpmnElement="Flow_Goo_NaoMandou">
        <di:waypoint x="1140" y="2210" />
        <di:waypoint x="1180" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Mandou_di" bpmnElement="Flow_Goo_Mandou">
        <di:waypoint x="1115" y="2185" />
        <di:waypoint x="1115" y="2155" />
        <di:waypoint x="1350" y="2155" />
        <di:waypoint x="1350" y="2192" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Alerta_di" bpmnElement="Flow_Goo_Alerta">
        <di:waypoint x="1280" y="2210" />
        <di:waypoint x="1332" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_di" bpmnElement="Flow_Goo_Zap">
        <di:waypoint x="395" y="2345" />
        <di:waypoint x="395" y="2430" />
        <di:waypoint x="500" y="2430" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="404" y="2433" width="51" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_1_di" bpmnElement="Flow_Goo_Zap_1">
        <di:waypoint x="600" y="2430" />
        <di:waypoint x="640" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_2_di" bpmnElement="Flow_Goo_Zap_2">
        <di:waypoint x="740" y="2430" />
        <di:waypoint x="820" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_3_di" bpmnElement="Flow_Goo_Zap_3">
        <di:waypoint x="920" y="2430" />
        <di:waypoint x="960" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_ToGatewayTrial_di" bpmnElement="Flow_Goo_ToGatewayTrial">
        <di:waypoint x="1060" y="2430" />
        <di:waypoint x="1105" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Trial_End_di" bpmnElement="Flow_Goo_Trial_End">
        <di:waypoint x="2550" y="2600" />
        <di:waypoint x="2630" y="2600" />
        <di:waypoint x="2630" y="2360" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Respondeu_Nao_di" bpmnElement="Flow_Goo_Respondeu_Nao">
        <di:waypoint x="3075" y="2455" />
        <di:waypoint x="3075" y="2540" />
        <di:waypoint x="3140" y="2540" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3080" y="2488" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Motivo_di" bpmnElement="Flow_Goo_Motivo">
        <di:waypoint x="3240" y="2540" />
        <di:waypoint x="3282" y="2540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Trial_Nao_di" bpmnElement="Flow_Goo_Trial_Nao">
        <di:waypoint x="1155" y="2430" />
        <di:waypoint x="1200" y="2430" />
        <di:waypoint x="1200" y="2320" />
        <di:waypoint x="1750" y="2320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1178" y="2365" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Check_Breakup_di" bpmnElement="Flow_Goo_Check_Breakup">
        <di:waypoint x="3008" y="2430" />
        <di:waypoint x="3050" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Converteu_Sim_di" bpmnElement="Flow_Goo_Converteu_Sim">
        <di:waypoint x="2770" y="2320" />
        <di:waypoint x="2830" y="2320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2791" y="2295" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D7_di" bpmnElement="Flow_Goo_D7">
        <di:waypoint x="2680" y="2320" />
        <di:waypoint x="2720" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D5_Lig3_di" bpmnElement="Flow_Goo_D5_Lig3">
        <di:waypoint x="2540" y="2320" />
        <di:waypoint x="2580" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Breakup_di" bpmnElement="Flow_Goo_Breakup">
        <di:waypoint x="2930" y="2430" />
        <di:waypoint x="2972" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Converteu_Nao_di" bpmnElement="Flow_Goo_Converteu_Nao">
        <di:waypoint x="2745" y="2345" />
        <di:waypoint x="2745" y="2430" />
        <di:waypoint x="2830" y="2430" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2750" y="2378" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D5_Zap5_di" bpmnElement="Flow_Goo_D5_Zap5">
        <di:waypoint x="2400" y="2320" />
        <di:waypoint x="2440" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D3_Zap4_di" bpmnElement="Flow_Goo_D3_Zap4">
        <di:waypoint x="2260" y="2320" />
        <di:waypoint x="2300" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D1_Lig2_di" bpmnElement="Flow_Goo_D1_Lig2">
        <di:waypoint x="2120" y="2320" />
        <di:waypoint x="2160" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D1_Zap3_di" bpmnElement="Flow_Goo_D1_Zap3">
        <di:waypoint x="1980" y="2320" />
        <di:waypoint x="2020" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_Merge_di" bpmnElement="Flow_Goo_D0_Merge">
        <di:waypoint x="1800" y="2320" />
        <di:waypoint x="1880" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Respondeu_Sim_di" bpmnElement="Flow_Goo_Respondeu_Sim">
        <di:waypoint x="3100" y="2430" />
        <di:waypoint x="3140" y="2430" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3111" y="2405" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Nurturing_di" bpmnElement="Flow_Goo_Nurturing">
        <di:waypoint x="3240" y="2430" />
        <di:waypoint x="3282" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Meta" bpmnElement="Participant_Meta" isHorizontal="true" bioc:stroke="#cc5de8" bioc:fill="#f3e0ff">
        <dc:Bounds x="160" y="2820" width="4400" height="410" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Meta" bpmnElement="Start_Meta">
        <dc:Bounds x="232" y="2852" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="227" y="2888" width="46" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Meta" bpmnElement="End_Perdido_Meta">
        <dc:Bounds x="2402" y="3072" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2390" y="3108" width="60" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Meta" bpmnElement="End_Bloqueio_Meta">
        <dc:Bounds x="2402" y="2962" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2380" y="2998" width="81" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Meta" bpmnElement="Task_GrupoNurturing_Meta">
        <dc:Bounds x="2215" y="2940" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_D0_Meta" bpmnElement="Task_WhatsApp_D0_Meta">
        <dc:Bounds x="510" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_D0_Meta" bpmnElement="Task_FlashDemo_D0_Meta">
        <dc:Bounds x="665" y="2830" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_WhatsApp_Meta" bpmnElement="Task_D1_WhatsApp_Meta">
        <dc:Bounds x="1130" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_WhatsApp_Meta" bpmnElement="Task_D3_WhatsApp_Meta">
        <dc:Bounds x="1285" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D6_WhatsApp_Meta" bpmnElement="Task_D6_WhatsApp_Meta">
        <dc:Bounds x="1440" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D9_WhatsApp_Meta" bpmnElement="Task_D9_WhatsApp_Meta">
        <dc:Bounds x="1595" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D14_WhatsApp_Meta" bpmnElement="Task_D14_WhatsApp_Meta">
        <dc:Bounds x="1750" y="2830" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_PaginaFiltro_Meta" bpmnElement="Task_PaginaFiltro_Meta">
        <dc:Bounds x="355" y="2830" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SelecaoMotivo_Meta" bpmnElement="Task_SelecaoMotivo_Meta">
        <dc:Bounds x="2215" y="3050" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Interessado_D0_Meta" bpmnElement="Gateway_Interessado_D0_Meta" isMarkerVisible="true">
        <dc:Bounds x="845" y="2845" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="838" y="2821" width="64" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Imediato_Meta" bpmnElement="Gateway_Converteu_Imediato_Meta" isMarkerVisible="true">
        <dc:Bounds x="1000" y="2845" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="983" y="2821" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Meta" bpmnElement="Gateway_Converteu_Meta" isMarkerVisible="true">
        <dc:Bounds x="1930" y="2845" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1927" y="2895" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu_Meta" bpmnElement="Gateway_Respondeu_Meta" isMarkerVisible="true">
        <dc:Bounds x="2085" y="2955" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2079" y="3005" width="63" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_24h_Meta" bpmnElement="IntermediateTimer_24h_Meta">
        <dc:Bounds x="1937" y="2962" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1946" y="2998" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Meta" bpmnElement="LinkThrow_Meta">
        <dc:Bounds x="2092" y="2852" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2080" y="2888" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0ck18uw_di" bpmnElement="Event_1qdcr1f">
        <dc:Bounds x="852" y="2982" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="826" y="3018" width="89" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_0vgh499" bpmnElement="Event_1q9m63q">
        <dc:Bounds x="1007" y="2982" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="995" y="3018" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Start" bpmnElement="Flow_Meta_Start">
        <di:waypoint x="268" y="2870" />
        <di:waypoint x="355" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Filtro" bpmnElement="Flow_Meta_Filtro">
        <di:waypoint x="455" y="2870" />
        <di:waypoint x="510" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D0_Zap" bpmnElement="Flow_Meta_D0_Zap">
        <di:waypoint x="610" y="2870" />
        <di:waypoint x="665" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_FlashDemo" bpmnElement="Flow_Meta_FlashDemo">
        <di:waypoint x="765" y="2870" />
        <di:waypoint x="845" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Interessado_Sim" bpmnElement="Flow_Meta_Interessado_Sim">
        <di:waypoint x="895" y="2870" />
        <di:waypoint x="1000" y="2870" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="938" y="2845" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D1" bpmnElement="Flow_Meta_D1">
        <di:waypoint x="1230" y="2870" />
        <di:waypoint x="1285" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D3" bpmnElement="Flow_Meta_D3">
        <di:waypoint x="1385" y="2870" />
        <di:waypoint x="1440" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D6" bpmnElement="Flow_Meta_D6">
        <di:waypoint x="1540" y="2870" />
        <di:waypoint x="1595" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D9" bpmnElement="Flow_Meta_D9">
        <di:waypoint x="1695" y="2870" />
        <di:waypoint x="1750" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D14" bpmnElement="Flow_Meta_D14">
        <di:waypoint x="1850" y="2870" />
        <di:waypoint x="1930" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Converteu_Sim" bpmnElement="Flow_Meta_Converteu_Sim">
        <di:waypoint x="1980" y="2870" />
        <di:waypoint x="2092" y="2870" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2027" y="2845" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Converteu_Nao" bpmnElement="Flow_Meta_Converteu_Nao">
        <di:waypoint x="1955" y="2895" />
        <di:waypoint x="1955" y="2962" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1960" y="2919" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Timer24h" bpmnElement="Flow_Meta_Timer24h">
        <di:waypoint x="1973" y="2980" />
        <di:waypoint x="2085" y="2980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Respondeu_Sim" bpmnElement="Flow_Meta_Respondeu_Sim">
        <di:waypoint x="2135" y="2980" />
        <di:waypoint x="2215" y="2980" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2166" y="2955" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Respondeu_Nao" bpmnElement="Flow_Meta_Respondeu_Nao">
        <di:waypoint x="2135" y="2980" />
        <di:waypoint x="2165" y="2980" />
        <di:waypoint x="2165" y="3090" />
        <di:waypoint x="2215" y="3090" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2170" y="3025" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Nurturing" bpmnElement="Flow_Meta_Nurturing">
        <di:waypoint x="2315" y="2980" />
        <di:waypoint x="2402" y="2980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Motivo" bpmnElement="Flow_Meta_Motivo">
        <di:waypoint x="2315" y="3090" />
        <di:waypoint x="2402" y="3090" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0fm6hqw_di" bpmnElement="Flow_0fm6hqw">
        <di:waypoint x="870" y="2895" />
        <di:waypoint x="870" y="2982" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="875" y="2936" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1qdoel0_di" bpmnElement="Flow_1qdoel0">
        <di:waypoint x="1050" y="2870" />
        <di:waypoint x="1130" y="2870" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1081" y="2852" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0lfarjy_di" bpmnElement="Flow_0lfarjy">
        <di:waypoint x="1025" y="2895" />
        <di:waypoint x="1025" y="2982" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Nucleo" bpmnElement="Participant_Nucleo" isHorizontal="true" bioc:stroke="#868e96" bioc:fill="#f0f0f0">
        <dc:Bounds x="160" y="3280" width="4400" height="410" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cliente_Ativo" bpmnElement="End_Cliente_Ativo">
        <dc:Bounds x="1187" y="3352" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1167" y="3388" width="76" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Pagamento_Falhou" bpmnElement="End_Pagamento_Falhou">
        <dc:Bounds x="1807" y="3572" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1790" y="3608" width="71" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Anual" bpmnElement="Task_Checkout_Anual">
        <dc:Bounds x="535" y="3330" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Split_Parceiro" bpmnElement="Task_Split_Parceiro">
        <dc:Bounds x="845" y="3330" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Onboarding_Pago" bpmnElement="Task_Onboarding_Pago">
        <dc:Bounds x="1000" y="3330" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Webhook_Falha" bpmnElement="Task_Webhook_Falha">
        <dc:Bounds x="690" y="3440" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_5min" bpmnElement="Task_WhatsApp_5min">
        <dc:Bounds x="845" y="3440" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Semestral" bpmnElement="Task_Checkout_Semestral">
        <dc:Bounds x="1000" y="3440" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Vendedor_Trimestral" bpmnElement="Task_Vendedor_Trimestral">
        <dc:Bounds x="1310" y="3550" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Trimestral" bpmnElement="Task_Checkout_Trimestral">
        <dc:Bounds x="1465" y="3550" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Checkout_Merge" bpmnElement="Gateway_Checkout_Merge" isMarkerVisible="true">
        <dc:Bounds x="405" y="3345" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="407" y="3395" width="47" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Anual" bpmnElement="Gateway_Pagamento_Anual" isMarkerVisible="true">
        <dc:Bounds x="715" y="3345" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="656" y="3316" width="87" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Semestral" bpmnElement="Gateway_Pagamento_Semestral" isMarkerVisible="true">
        <dc:Bounds x="1180" y="3455" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1241" y="3450" width="57" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Trimestral" bpmnElement="Gateway_Pagamento_Trimestral" isMarkerVisible="true">
        <dc:Bounds x="1645" y="3565" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1642" y="3615" width="57" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_D2" bpmnElement="IntermediateTimer_D2">
        <dc:Bounds x="1187" y="3572" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1172" y="3608" width="67" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_1hfrp4l" bpmnElement="Event_0u9h6ak">
        <dc:Bounds x="302" y="3352" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="290" y="3388" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Para_Cliente_Ativo" bpmnElement="Flow_Para_Cliente_Ativo">
        <di:waypoint x="1100" y="3370" />
        <di:waypoint x="1187" y="3370" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Trimestral_Recusado" bpmnElement="Flow_Trimestral_Recusado">
        <di:waypoint x="1695" y="3590" />
        <di:waypoint x="1807" y="3590" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1739" y="3565" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Para_Anual" bpmnElement="Flow_Para_Anual">
        <di:waypoint x="455" y="3370" />
        <di:waypoint x="535" y="3370" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Para_Gateway" bpmnElement="Flow_Anual_Para_Gateway">
        <di:waypoint x="635" y="3370" />
        <di:waypoint x="715" y="3370" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Aprovado" bpmnElement="Flow_Anual_Aprovado">
        <di:waypoint x="765" y="3370" />
        <di:waypoint x="845" y="3370" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="795" y="3345" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Split_Para_Onboarding" bpmnElement="Flow_Split_Para_Onboarding">
        <di:waypoint x="945" y="3370" />
        <di:waypoint x="1000" y="3370" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Aprovado" bpmnElement="Flow_Semestral_Aprovado">
        <di:waypoint x="1205" y="3455" />
        <di:waypoint x="1205" y="3419" />
        <di:waypoint x="1050" y="3419" />
        <di:waypoint x="1050" y="3410" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1118" y="3394" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Recusado" bpmnElement="Flow_Anual_Recusado">
        <di:waypoint x="740" y="3395" />
        <di:waypoint x="740" y="3440" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="743" y="3408" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Falha_Para_WhatsApp" bpmnElement="Flow_Falha_Para_WhatsApp">
        <di:waypoint x="790" y="3480" />
        <di:waypoint x="845" y="3480" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_WhatsApp_Para_Semestral" bpmnElement="Flow_WhatsApp_Para_Semestral">
        <di:waypoint x="945" y="3480" />
        <di:waypoint x="1000" y="3480" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Para_Gateway" bpmnElement="Flow_Semestral_Para_Gateway">
        <di:waypoint x="1100" y="3480" />
        <di:waypoint x="1180" y="3480" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Timer_Para_Vendedor" bpmnElement="Flow_Timer_Para_Vendedor">
        <di:waypoint x="1223" y="3590" />
        <di:waypoint x="1310" y="3590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Vendedor_Para_Trimestral" bpmnElement="Flow_Vendedor_Para_Trimestral">
        <di:waypoint x="1410" y="3590" />
        <di:waypoint x="1465" y="3590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Trimestral_Para_Gateway" bpmnElement="Flow_Trimestral_Para_Gateway">
        <di:waypoint x="1565" y="3590" />
        <di:waypoint x="1645" y="3590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Recusado" bpmnElement="Flow_Semestral_Recusado">
        <di:waypoint x="1205" y="3505" />
        <di:waypoint x="1205" y="3572" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1208" y="3529" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0m1sjfy_di" bpmnElement="Flow_0m1sjfy">
        <di:waypoint x="405" y="3370" />
        <di:waypoint x="338" y="3370" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0na0lv9_di" bpmnElement="Flow_0na0lv9">
        <di:waypoint x="1670" y="3565" />
        <di:waypoint x="1670" y="3340" />
        <di:waypoint x="1100" y="3340" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1676" y="3450" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="TextAnnotation_0576fl5_di" bpmnElement="TextAnnotation_0576fl5">
        <dc:Bounds x="3060" y="360" width="99.99156545209178" height="55.330634278002705" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Association_01m1lt7_di" bpmnElement="Association_01m1lt7">
        <di:waypoint x="3051" y="446" />
        <di:waypoint x="3077" y="415" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`,y2=v2,Nl=`<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   id="Definitions_Indicacoes"
                   targetNamespace="http://fyness.com/bpmn/indicacoes">

  <bpmn2:collaboration id="Collaboration_Indicacoes">
    <bpmn2:participant id="Participant_Indicacoes" name="INDICACOES - O FUNIL DA CONFIANCA" processRef="Process_Indicacoes" />
  </bpmn2:collaboration>

  <bpmn2:process id="Process_Indicacoes" name="Fluxo de Indicacoes" isExecutable="false">

    <bpmn2:laneSet id="LaneSet_Indicacoes">
      <bpmn2:lane id="Lane_Indicacoes" name="INDICACOES - Funil da Confianca (7d Trial + Bonus Parceiro)">
        <!-- GATEWAY DE ENTRADA -->
        <bpmn2:flowNodeRef>Start_Indicacao</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_TipoEntrada</bpmn2:flowNodeRef>
        <!-- CENARIO A: ATIVO (Parceiro entrega contato) -->
        <bpmn2:flowNodeRef>Task_TagIndicacao</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_ContatoAtivo</bpmn2:flowNodeRef>
        <!-- CENARIO B: PASSIVO (Lead te procura) -->
        <bpmn2:flowNodeRef>Task_TagPassivo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_ContatoPassivo</bpmn2:flowNodeRef>
        <!-- MERGE E LIGACAO -->
        <bpmn2:flowNodeRef>Gateway_MergeContato</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LigacaoParceiro</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Atendeu</bpmn2:flowNodeRef>
        <!-- PATH NAO ATENDEU - CADENCIA DO PARCEIRO -->
        <bpmn2:flowNodeRef>Task_D1_ParceiroPerguntou</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D3_VideoBastidor</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D5_BonusExpirando</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D7_Despedida</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Respondeu</bpmn2:flowNodeRef>
        <!-- FLASH DEMO -->
        <bpmn2:flowNodeRef>Task_FlashDemo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_QuerTrial</bpmn2:flowNodeRef>
        <!-- TRIAL 7 DIAS COM GUARDIAO -->
        <bpmn2:flowNodeRef>Task_AtivarTrial</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_Guardiao_Ind</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_AlertaInativo</bpmn2:flowNodeRef>
        <!-- VITRINE BINARIA D7 -->
        <bpmn2:flowNodeRef>Task_OfertaAnual</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_FechouAnual</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_OfertaSemestral</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_FechouSemestral</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_OfertaTrimestral</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_FechouTrimestral</bpmn2:flowNodeRef>
        <!-- POS-CONVERSAO -->
        <bpmn2:flowNodeRef>Task_NotificaParceiro</bpmn2:flowNodeRef>
        <!-- FINALIZACOES -->
        <bpmn2:flowNodeRef>End_Checkout_Ind</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_Perdido_Ind</bpmn2:flowNodeRef>
      </bpmn2:lane>
    </bpmn2:laneSet>

    <!-- ==================== GATEWAY DE ENTRADA ==================== -->

    <bpmn2:startEvent id="Start_Indicacao" name="Lead Indicado">
      <bpmn2:documentation>ENTRADA DO LEAD INDICADO:
O lead entra por um de dois caminhos:
- Cenario A: Parceiro te entrega o contato (ATIVO)
- Cenario B: Lead te procura dizendo que conhece o parceiro (PASSIVO)</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Ind_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:exclusiveGateway id="Gateway_TipoEntrada" name="Como Chegou?">
      <bpmn2:documentation>GATEWAY DE ENTRADA:

CENARIO A - ATIVO:
Parceiro te manda o Zap do lead.
Voce precisa dar o "Oi" inicial com autoridade emprestada.

CENARIO B - PASSIVO:
Lead clica no link ou te chama dizendo "O [Parceiro] me falou de voce".
Tratamento VIP imediato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Ativo</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Passivo</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== CENARIO A: ATIVO (Parceiro entrega contato) ==================== -->

    <bpmn2:serviceTask id="Task_TagIndicacao" name="Tag [INDICACAO: PARCEIRO]">
      <bpmn2:documentation>TAGUEAMENTO DO LEAD:
- Tag: [INDICACAO: NOME_DO_PARCEIRO]
- Origem: ATIVO (parceiro entregou)
- Medir qual parceiro traz os melhores clientes</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Ativo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_2A</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_ContatoAtivo" name="Oi Inicial (Autoridade Emprestada)">
      <bpmn2:documentation>PRIMEIRO CONTATO - CENARIO ATIVO:

SCRIPT WHATSAPP:
"Oi [Lead], aqui e o [Vendedor] da Fyness!

O [Parceiro] me passou seu contato e pediu MUITO
pra eu falar contigo. Ele ta usando o sistema
na [Empresa dele] e quis que voce visse tambem.

Posso te ligar rapidinho pra te mostrar o que ele viu?"

OBJETIVO: Usar autoridade do parceiro para abrir conversa</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_2A</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_3A</bpmn2:outgoing>
    </bpmn2:sendTask>

    <!-- ==================== CENARIO B: PASSIVO (Lead te procura) ==================== -->

    <bpmn2:serviceTask id="Task_TagPassivo" name="Tag [INDICACAO: PARCEIRO]">
      <bpmn2:documentation>TAGUEAMENTO DO LEAD:
- Tag: [INDICACAO: NOME_DO_PARCEIRO]
- Origem: PASSIVO (lead veio sozinho)
- Identificar qual parceiro indicou</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Passivo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_2B</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_ContatoPassivo" name="Resposta VIP Imediata">
      <bpmn2:documentation>PRIMEIRO CONTATO - CENARIO PASSIVO:

SCRIPT WHATSAPP:
"[Lead]! Que bom que voce veio!

O [Parceiro] ja tinha me falado de voce,
tava te esperando! Ele me contou que voce
tambem ta na correria com a gestao da [Empresa].

Deixa eu te mostrar rapidinho o que ele viu
e curtiu tanto. Posso te ligar agora?"

OBJETIVO: Tratamento VIP, valorizar que veio por indicacao</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_2B</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_3B</bpmn2:outgoing>
    </bpmn2:sendTask>

    <!-- ==================== MERGE E LIGACAO ==================== -->

    <bpmn2:exclusiveGateway id="Gateway_MergeContato" name="Merge">
      <bpmn2:incoming>Flow_Ind_3A</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_3B</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_4</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:userTask id="Task_LigacaoParceiro" name="Ligacao (Cita Parceiro no 1o Segundo)">
      <bpmn2:documentation>LIGACAO COM AUTORIDADE EMPRESTADA:

ABRIR A LIGACAO CITANDO O PARCEIRO NO 1o SEGUNDO!

SCRIPT:
"[Lead]! Aqui e o [Vendedor], o [PARCEIRO] me cobrou
pra te ligar! Ele ficou empolgado com o que a gente
fez pra academia dele e insistiu que eu te mostrasse."

"Ele comentou que voce sofre com [DOR ESPECIFICA].
Deixa eu te mostrar em 2 minutinhos o que ele viu
aqui no Zap... e voce me diz se faz sentido pra voce."

OBJETIVO: Quebrar o gelo usando confianca do parceiro</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_5</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_Atendeu" name="Atendeu?">
      <bpmn2:documentation>DECISAO: Lead atendeu a ligacao?

SIM -> Flash Demo imediata
NAO -> Cadencia do Parceiro (D1 a D7)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Atendeu</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_NaoAtendeu</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== PATH NAO ATENDEU - CADENCIA DO PARCEIRO ==================== -->

    <bpmn2:sendTask id="Task_D1_ParceiroPerguntou" name="D+1: [Parceiro] Perguntou se Ja Mostrei">
      <bpmn2:documentation>CADENCIA D+1 - PRESSAO SOCIAL POSITIVA:

WHATSAPP:
"Fala [Lead], o [Parceiro] me perguntou se eu ja
tinha te mostrado o sistema. Ta na correria?

Me da um toque quando tiver 5 minutinhos
que te mostro rapidinho!"

OBJETIVO: Usar nome do parceiro como alavanca (sem ser chato)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_NaoAtendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_6</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D3_VideoBastidor" name="D+3: Video de Bastidor">
      <bpmn2:documentation>CADENCIA D+3 - VIDEO DE BASTIDOR:

WHATSAPP + VIDEO CURTO:
"[Lead], gravei esse video rapidinho mostrando
um resultado foda que a gente fez essa semana.

O [Parceiro] ja viu e curtiu demais.
Da uma olhada quando puder!"

[ANEXAR VIDEO DE 30-60 SEG MOSTRANDO RESULTADO]

OBJETIVO: Prova social em video, resultado real</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_7</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D5_BonusExpirando" name="D+5: Bonus do Parceiro Expirando">
      <bpmn2:documentation>CADENCIA D+5 - URGENCIA DO BONUS:

WHATSAPP:
"[Lead], nao quero que voce perca o bonus
que o [Parceiro] conseguiu pra voce!

Ele me pediu pra garantir que voce testasse
antes de expirar. Conseguiu dar uma olhada?"

OBJETIVO: Criar urgencia usando o nome do parceiro</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_8</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D7_Despedida" name="D+7: Mensagem de Despedida">
      <bpmn2:documentation>CADENCIA D+7 - DESPEDIDA ELEGANTE:

WHATSAPP:
"[Lead], vou liberar o link pro bonus expirar.

Nao quero te encher, mas se precisar de mim
no futuro, o contato e este. O [Parceiro]
sabe me achar tambem!

Sucesso ai na [Empresa]! Abraco"

OBJETIVO: Fechar ciclo com elegancia, nao queimar ponte</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_8</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_9</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:exclusiveGateway id="Gateway_Respondeu" name="Respondeu na Cadencia?">
      <bpmn2:documentation>DECISAO: Lead respondeu durante a cadencia D1-D7?

SIM -> Flash Demo
NAO -> Lead Perdido (mas nao descartado)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Respondeu</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_NaoRespondeu</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== FLASH DEMO ==================== -->

    <bpmn2:userTask id="Task_FlashDemo" name="Flash Demo (IA Processando Gasto Real)">
      <bpmn2:documentation>FLASH DEMO COM PROVA DE VALOR:

SCRIPT DE ABERTURA:
"O [Parceiro] me disse que voce queria ver isso...
Deixa eu te mostrar a IA processando um gasto real."

DURANTE A DEMO:
- Mostrar IA categorizando despesa em tempo real
- Usar exemplo similar ao do parceiro
- "Isso aqui o [Parceiro] usa todo dia..."

FECHAMENTO:
"Faz sentido pra [Empresa]? Quer testar 7 dias
com o bonus que o [Parceiro] conseguiu pra voce?"

OBJETIVO: Prova de valor INSTANTANEA</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Atendeu</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Respondeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_10</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_QuerTrial" name="Quer Trial?">
      <bpmn2:incoming>Flow_Ind_10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Trial_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Trial_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== TRIAL 7 DIAS COM GUARDIAO ==================== -->

    <bpmn2:serviceTask id="Task_AtivarTrial" name="Ativar Trial 7 Dias">
      <bpmn2:documentation>ATIVACAO DO TRIAL:
- Liberar acesso completo por 7 dias
- Tag: [TRIAL_INDICACAO: PARCEIRO]
- Configurar Guardiao para monitorar uso
- Agendar cadencia de fechamento D7

OBJETIVO: Fazer o lead "sentir o gosto" da organizacao</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Trial_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_11</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_Guardiao_Ind" name="Guardiao: Monitorar Uso no Trial">
      <bpmn2:documentation>GUARDIAO DO TRIAL INDICACAO:

MONITORAR:
- Login diario
- Funcionalidades usadas
- Tempo na plataforma
- Dados cadastrados

REGRA DE ALERTA:
Se nao logar em 48h -> Dispara alerta de inatividade

OBJETIVO: Nao deixar o lead esfriar durante o trial</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_11</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_12</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Inativo</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_AlertaInativo" name="Alerta: Ta Conseguindo Acessar?">
      <bpmn2:documentation>ALERTA DE INATIVIDADE (48H SEM LOGIN):

WHATSAPP:
"[Lead], vi que voce nao conseguiu entrar ainda.
Ta conseguindo acessar?

O [Parceiro] me pediu pra garantir que voce
testasse direitinho. Quer que eu te ajude?"

OBJETIVO: Reengajar lead inativo antes de esfriar</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Inativo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_VoltaGuardiao</bpmn2:outgoing>
    </bpmn2:sendTask>

    <!-- ==================== VITRINE BINARIA D7 ==================== -->

    <bpmn2:userTask id="Task_OfertaAnual" name="D7: Oferta Anual R$1.497 + Bonus Parceiro">
      <bpmn2:documentation>VITRINE BINARIA - OFERTA PRINCIPAL:

LIGACAO D7:
"[Lead], seu trial termina hoje! Antes de falar
de planos, me conta: o que voce mais curtiu?"

[OUVIR E VALIDAR]

OFERTA PRINCIPAL:
"Como voce veio pela indicacao do [Parceiro],
tenho uma condicao especial:

PLANO ANUAL: R$ 1.497 (12x R$ 124,75)
+ BONUS DO PARCEIRO: 1 mes extra gratis!
+ Consultoria de setup inclusa

O [Parceiro] fechou esse mesmo plano.
Faz sentido pra voce?"

OBJETIVO: Fechar no plano de maior valor</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_12</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_VoltaGuardiao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_13</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_FechouAnual" name="Fechou Anual?">
      <bpmn2:incoming>Flow_Ind_13</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Anual_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Anual_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:userTask id="Task_OfertaSemestral" name="Recuperacao: Semestral R$997">
      <bpmn2:documentation>VITRINE BINARIA - RECUPERACAO:

SE RESISTIR AO ANUAL:
"Entendo! Olha, se o anual pesa agora,
tenho o SEMESTRAL por R$ 997 (6x R$ 166).

Voce ainda ganha o bonus do [Parceiro]
e pode fazer upgrade depois se quiser.

O que acha?"

OBJETIVO: Oferecer alternativa sem perder a venda</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Anual_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_14</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_FechouSemestral" name="Fechou Semestral?">
      <bpmn2:incoming>Flow_Ind_14</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Semestral_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Semestral_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:userTask id="Task_OfertaTrimestral" name="Downsell Final: Trimestral R$561">
      <bpmn2:documentation>VITRINE BINARIA - DOWNSELL FINAL:

ULTIMA TENTATIVA (VENDEDOR):
"[Lead], ultima opcao que consigo fazer:
TRIMESTRAL por R$ 561 (3x R$ 187).

E o minimo pra voce comecar a organizar
a [Empresa] e sentir o resultado.

Depois voce decide se quer continuar.
Topa testar por 3 meses?"

OBJETIVO: Nao perder o lead, converter no minimo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Semestral_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_15</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_FechouTrimestral" name="Fechou Trimestral?">
      <bpmn2:incoming>Flow_Ind_15</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Trimestral_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Trimestral_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== POS-CONVERSAO ==================== -->

    <bpmn2:sendTask id="Task_NotificaParceiro" name="Notifica Parceiro: Indicado Fechou!">
      <bpmn2:documentation>NOTIFICACAO AO PARCEIRO:

WHATSAPP PARA O PARCEIRO:
"[Parceiro], boa noticia!

O [Lead] que voce indicou FECHOU com a gente!
Muito obrigado pela indicacao, voce e demais!

Sua comissao de 30% ja ta garantida no sistema.
Valeu mesmo! Manda mais que a gente cuida!"

OBJETIVO:
- Agradecer e fortalecer relacionamento
- Lembrar da comissao (30% split automatico)
- Incentivar mais indicacoes</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Anual_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Semestral_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Trimestral_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Checkout</bpmn2:outgoing>
    </bpmn2:sendTask>

    <!-- ==================== FINALIZACOES ==================== -->

    <bpmn2:endEvent id="End_Checkout_Ind" name="Vai pro Checkout">
      <bpmn2:documentation>LEAD CONVERTIDO - VAI PRO CHECKOUT:
- Direcionar para Gateway Checkout (Centro)
- Split 30% automatico para o parceiro via Asaas
- Onboarding de cliente pago</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Checkout</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Perdido_Ind" name="Lead Nao Converteu">
      <bpmn2:documentation>LEAD NAO CONVERTEU:

IMPORTANTE: Nao descartar completamente!
- Manter em lista de remarketing
- Notificar parceiro com cuidado
- Deixar porta aberta

MSG PARA PARCEIRO:
"[Parceiro], o [Lead] decidiu esperar um pouco.
Valeu pela indicacao! Se ele mudar de ideia,
a gente atende na hora."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_NaoRespondeu</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Trial_Nao</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Trimestral_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- ==================== SEQUENCE FLOWS ==================== -->

    <!-- Gateway de Entrada -->
    <bpmn2:sequenceFlow id="Flow_Ind_Start" sourceRef="Start_Indicacao" targetRef="Gateway_TipoEntrada" />
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo" name="Ativo (Parceiro Entregou)" sourceRef="Gateway_TipoEntrada" targetRef="Task_TagIndicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo" name="Passivo (Lead Veio)" sourceRef="Gateway_TipoEntrada" targetRef="Task_TagPassivo" />

    <!-- Cenario A -->
    <bpmn2:sequenceFlow id="Flow_Ind_2A" sourceRef="Task_TagIndicacao" targetRef="Task_ContatoAtivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_3A" sourceRef="Task_ContatoAtivo" targetRef="Gateway_MergeContato" />

    <!-- Cenario B -->
    <bpmn2:sequenceFlow id="Flow_Ind_2B" sourceRef="Task_TagPassivo" targetRef="Task_ContatoPassivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_3B" sourceRef="Task_ContatoPassivo" targetRef="Gateway_MergeContato" />

    <!-- Merge e Ligacao -->
    <bpmn2:sequenceFlow id="Flow_Ind_4" sourceRef="Gateway_MergeContato" targetRef="Task_LigacaoParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_5" sourceRef="Task_LigacaoParceiro" targetRef="Gateway_Atendeu" />
    <bpmn2:sequenceFlow id="Flow_Ind_Atendeu" name="Sim" sourceRef="Gateway_Atendeu" targetRef="Task_FlashDemo" />
    <bpmn2:sequenceFlow id="Flow_Ind_NaoAtendeu" name="Nao" sourceRef="Gateway_Atendeu" targetRef="Task_D1_ParceiroPerguntou" />

    <!-- Cadencia do Parceiro -->
    <bpmn2:sequenceFlow id="Flow_Ind_6" sourceRef="Task_D1_ParceiroPerguntou" targetRef="Task_D3_VideoBastidor" />
    <bpmn2:sequenceFlow id="Flow_Ind_7" sourceRef="Task_D3_VideoBastidor" targetRef="Task_D5_BonusExpirando" />
    <bpmn2:sequenceFlow id="Flow_Ind_8" sourceRef="Task_D5_BonusExpirando" targetRef="Task_D7_Despedida" />
    <bpmn2:sequenceFlow id="Flow_Ind_9" sourceRef="Task_D7_Despedida" targetRef="Gateway_Respondeu" />
    <bpmn2:sequenceFlow id="Flow_Ind_Respondeu" name="Sim" sourceRef="Gateway_Respondeu" targetRef="Task_FlashDemo" />
    <bpmn2:sequenceFlow id="Flow_Ind_NaoRespondeu" name="Nao" sourceRef="Gateway_Respondeu" targetRef="End_Perdido_Ind" />

    <!-- Flash Demo -->
    <bpmn2:sequenceFlow id="Flow_Ind_10" sourceRef="Task_FlashDemo" targetRef="Gateway_QuerTrial" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trial_Sim" name="Sim" sourceRef="Gateway_QuerTrial" targetRef="Task_AtivarTrial" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trial_Nao" name="Nao" sourceRef="Gateway_QuerTrial" targetRef="End_Perdido_Ind" />

    <!-- Trial com Guardiao -->
    <bpmn2:sequenceFlow id="Flow_Ind_11" sourceRef="Task_AtivarTrial" targetRef="Task_Guardiao_Ind" />
    <bpmn2:sequenceFlow id="Flow_Ind_12" name="Usando" sourceRef="Task_Guardiao_Ind" targetRef="Task_OfertaAnual" />
    <bpmn2:sequenceFlow id="Flow_Ind_Inativo" name="48h Sem Login" sourceRef="Task_Guardiao_Ind" targetRef="Task_AlertaInativo" />
    <bpmn2:sequenceFlow id="Flow_Ind_VoltaGuardiao" sourceRef="Task_AlertaInativo" targetRef="Task_OfertaAnual" />

    <!-- Vitrine Binaria -->
    <bpmn2:sequenceFlow id="Flow_Ind_13" sourceRef="Task_OfertaAnual" targetRef="Gateway_FechouAnual" />
    <bpmn2:sequenceFlow id="Flow_Ind_Anual_Sim" name="Sim" sourceRef="Gateway_FechouAnual" targetRef="Task_NotificaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Anual_Nao" name="Nao" sourceRef="Gateway_FechouAnual" targetRef="Task_OfertaSemestral" />
    <bpmn2:sequenceFlow id="Flow_Ind_14" sourceRef="Task_OfertaSemestral" targetRef="Gateway_FechouSemestral" />
    <bpmn2:sequenceFlow id="Flow_Ind_Semestral_Sim" name="Sim" sourceRef="Gateway_FechouSemestral" targetRef="Task_NotificaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Semestral_Nao" name="Nao" sourceRef="Gateway_FechouSemestral" targetRef="Task_OfertaTrimestral" />
    <bpmn2:sequenceFlow id="Flow_Ind_15" sourceRef="Task_OfertaTrimestral" targetRef="Gateway_FechouTrimestral" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trimestral_Sim" name="Sim" sourceRef="Gateway_FechouTrimestral" targetRef="Task_NotificaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trimestral_Nao" name="Nao" sourceRef="Gateway_FechouTrimestral" targetRef="End_Perdido_Ind" />

    <!-- Checkout -->
    <bpmn2:sequenceFlow id="Flow_Ind_Checkout" sourceRef="Task_NotificaParceiro" targetRef="End_Checkout_Ind" />

  </bpmn2:process>

  <!-- ==================== DIAGRAMA VISUAL (BPMNDI) ==================== -->

  <bpmndi:BPMNDiagram id="BPMNDiagram_Indicacoes">
    <bpmndi:BPMNPlane id="BPMNPlane_Indicacoes" bpmnElement="Collaboration_Indicacoes">

      <!-- Participant e Lane -->
      <bpmndi:BPMNShape id="Shape_Participant_Ind" bpmnElement="Participant_Indicacoes" isHorizontal="true">
        <dc:Bounds x="120" y="60" width="2600" height="520" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Lane_Indicacoes" bpmnElement="Lane_Indicacoes" isHorizontal="true">
        <dc:Bounds x="150" y="60" width="2570" height="520" />
      </bpmndi:BPMNShape>

      <!-- Gateway de Entrada -->
      <bpmndi:BPMNShape id="Shape_Start_Indicacao" bpmnElement="Start_Indicacao">
        <dc:Bounds x="200" y="282" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_TipoEntrada" bpmnElement="Gateway_TipoEntrada" isMarkerVisible="true">
        <dc:Bounds x="275" y="275" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Cenario A: Ativo (linha superior y=160) -->
      <bpmndi:BPMNShape id="Shape_Task_TagIndicacao" bpmnElement="Task_TagIndicacao">
        <dc:Bounds x="360" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ContatoAtivo" bpmnElement="Task_ContatoAtivo">
        <dc:Bounds x="490" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Cenario B: Passivo (linha inferior y=380) -->
      <bpmndi:BPMNShape id="Shape_Task_TagPassivo" bpmnElement="Task_TagPassivo">
        <dc:Bounds x="360" y="370" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ContatoPassivo" bpmnElement="Task_ContatoPassivo">
        <dc:Bounds x="490" y="370" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Merge e Ligacao (linha principal y=270) -->
      <bpmndi:BPMNShape id="Shape_Gateway_MergeContato" bpmnElement="Gateway_MergeContato" isMarkerVisible="true">
        <dc:Bounds x="625" y="275" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LigacaoParceiro" bpmnElement="Task_LigacaoParceiro">
        <dc:Bounds x="710" y="270" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Atendeu" bpmnElement="Gateway_Atendeu" isMarkerVisible="true">
        <dc:Bounds x="845" y="275" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Cadencia do Parceiro (linha inferior y=420) -->
      <bpmndi:BPMNShape id="Shape_Task_D1_ParceiroPerguntou" bpmnElement="Task_D1_ParceiroPerguntou">
        <dc:Bounds x="820" y="420" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_VideoBastidor" bpmnElement="Task_D3_VideoBastidor">
        <dc:Bounds x="950" y="420" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D5_BonusExpirando" bpmnElement="Task_D5_BonusExpirando">
        <dc:Bounds x="1080" y="420" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D7_Despedida" bpmnElement="Task_D7_Despedida">
        <dc:Bounds x="1210" y="420" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu" bpmnElement="Gateway_Respondeu" isMarkerVisible="true">
        <dc:Bounds x="1345" y="425" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Flash Demo (linha principal y=270) -->
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo" bpmnElement="Task_FlashDemo">
        <dc:Bounds x="930" y="270" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_QuerTrial" bpmnElement="Gateway_QuerTrial" isMarkerVisible="true">
        <dc:Bounds x="1065" y="275" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Trial com Guardiao (linha superior y=140) -->
      <bpmndi:BPMNShape id="Shape_Task_AtivarTrial" bpmnElement="Task_AtivarTrial">
        <dc:Bounds x="1150" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Guardiao_Ind" bpmnElement="Task_Guardiao_Ind">
        <dc:Bounds x="1280" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_AlertaInativo" bpmnElement="Task_AlertaInativo">
        <dc:Bounds x="1280" y="270" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Vitrine Binaria (linha superior y=140) -->
      <bpmndi:BPMNShape id="Shape_Task_OfertaAnual" bpmnElement="Task_OfertaAnual">
        <dc:Bounds x="1420" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_FechouAnual" bpmnElement="Gateway_FechouAnual" isMarkerVisible="true">
        <dc:Bounds x="1555" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_OfertaSemestral" bpmnElement="Task_OfertaSemestral">
        <dc:Bounds x="1640" y="220" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_FechouSemestral" bpmnElement="Gateway_FechouSemestral" isMarkerVisible="true">
        <dc:Bounds x="1775" y="225" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_OfertaTrimestral" bpmnElement="Task_OfertaTrimestral">
        <dc:Bounds x="1860" y="300" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_FechouTrimestral" bpmnElement="Gateway_FechouTrimestral" isMarkerVisible="true">
        <dc:Bounds x="1995" y="305" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Pos-Conversao -->
      <bpmndi:BPMNShape id="Shape_Task_NotificaParceiro" bpmnElement="Task_NotificaParceiro">
        <dc:Bounds x="2100" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Finalizacoes -->
      <bpmndi:BPMNShape id="Shape_End_Checkout_Ind" bpmnElement="End_Checkout_Ind">
        <dc:Bounds x="2262" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Ind" bpmnElement="End_Perdido_Ind">
        <dc:Bounds x="2132" y="432" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- ===== EDGES ===== -->

      <!-- Gateway de Entrada -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Start" bpmnElement="Flow_Ind_Start">
        <di:waypoint x="236" y="300" />
        <di:waypoint x="275" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo" bpmnElement="Flow_Ind_Ativo">
        <di:waypoint x="300" y="275" />
        <di:waypoint x="300" y="170" />
        <di:waypoint x="360" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo" bpmnElement="Flow_Ind_Passivo">
        <di:waypoint x="300" y="325" />
        <di:waypoint x="300" y="400" />
        <di:waypoint x="360" y="400" />
      </bpmndi:BPMNEdge>

      <!-- Cenario A -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_2A" bpmnElement="Flow_Ind_2A">
        <di:waypoint x="460" y="170" />
        <di:waypoint x="490" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_3A" bpmnElement="Flow_Ind_3A">
        <di:waypoint x="590" y="170" />
        <di:waypoint x="650" y="170" />
        <di:waypoint x="650" y="275" />
      </bpmndi:BPMNEdge>

      <!-- Cenario B -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_2B" bpmnElement="Flow_Ind_2B">
        <di:waypoint x="460" y="400" />
        <di:waypoint x="490" y="400" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_3B" bpmnElement="Flow_Ind_3B">
        <di:waypoint x="590" y="400" />
        <di:waypoint x="650" y="400" />
        <di:waypoint x="650" y="325" />
      </bpmndi:BPMNEdge>

      <!-- Merge e Ligacao -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_4" bpmnElement="Flow_Ind_4">
        <di:waypoint x="675" y="300" />
        <di:waypoint x="710" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_5" bpmnElement="Flow_Ind_5">
        <di:waypoint x="810" y="300" />
        <di:waypoint x="845" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Atendeu" bpmnElement="Flow_Ind_Atendeu">
        <di:waypoint x="895" y="300" />
        <di:waypoint x="930" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_NaoAtendeu" bpmnElement="Flow_Ind_NaoAtendeu">
        <di:waypoint x="870" y="325" />
        <di:waypoint x="870" y="420" />
      </bpmndi:BPMNEdge>

      <!-- Cadencia do Parceiro -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_6" bpmnElement="Flow_Ind_6">
        <di:waypoint x="920" y="450" />
        <di:waypoint x="950" y="450" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_7" bpmnElement="Flow_Ind_7">
        <di:waypoint x="1050" y="450" />
        <di:waypoint x="1080" y="450" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_8" bpmnElement="Flow_Ind_8">
        <di:waypoint x="1180" y="450" />
        <di:waypoint x="1210" y="450" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_9" bpmnElement="Flow_Ind_9">
        <di:waypoint x="1310" y="450" />
        <di:waypoint x="1345" y="450" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Respondeu" bpmnElement="Flow_Ind_Respondeu">
        <di:waypoint x="1370" y="425" />
        <di:waypoint x="1370" y="300" />
        <di:waypoint x="1030" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_NaoRespondeu" bpmnElement="Flow_Ind_NaoRespondeu">
        <di:waypoint x="1395" y="450" />
        <di:waypoint x="2132" y="450" />
      </bpmndi:BPMNEdge>

      <!-- Flash Demo -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_10" bpmnElement="Flow_Ind_10">
        <di:waypoint x="1030" y="300" />
        <di:waypoint x="1065" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trial_Sim" bpmnElement="Flow_Ind_Trial_Sim">
        <di:waypoint x="1090" y="275" />
        <di:waypoint x="1090" y="170" />
        <di:waypoint x="1150" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trial_Nao" bpmnElement="Flow_Ind_Trial_Nao">
        <di:waypoint x="1090" y="325" />
        <di:waypoint x="1090" y="450" />
        <di:waypoint x="2132" y="450" />
      </bpmndi:BPMNEdge>

      <!-- Trial com Guardiao -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_11" bpmnElement="Flow_Ind_11">
        <di:waypoint x="1250" y="170" />
        <di:waypoint x="1280" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_12" bpmnElement="Flow_Ind_12">
        <di:waypoint x="1380" y="170" />
        <di:waypoint x="1420" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Inativo" bpmnElement="Flow_Ind_Inativo">
        <di:waypoint x="1330" y="200" />
        <di:waypoint x="1330" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_VoltaGuardiao" bpmnElement="Flow_Ind_VoltaGuardiao">
        <di:waypoint x="1380" y="300" />
        <di:waypoint x="1400" y="300" />
        <di:waypoint x="1400" y="170" />
        <di:waypoint x="1420" y="170" />
      </bpmndi:BPMNEdge>

      <!-- Vitrine Binaria -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_13" bpmnElement="Flow_Ind_13">
        <di:waypoint x="1520" y="170" />
        <di:waypoint x="1555" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Anual_Sim" bpmnElement="Flow_Ind_Anual_Sim">
        <di:waypoint x="1605" y="170" />
        <di:waypoint x="2100" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Anual_Nao" bpmnElement="Flow_Ind_Anual_Nao">
        <di:waypoint x="1580" y="195" />
        <di:waypoint x="1580" y="250" />
        <di:waypoint x="1640" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_14" bpmnElement="Flow_Ind_14">
        <di:waypoint x="1740" y="250" />
        <di:waypoint x="1775" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Semestral_Sim" bpmnElement="Flow_Ind_Semestral_Sim">
        <di:waypoint x="1800" y="225" />
        <di:waypoint x="1800" y="170" />
        <di:waypoint x="2100" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Semestral_Nao" bpmnElement="Flow_Ind_Semestral_Nao">
        <di:waypoint x="1800" y="275" />
        <di:waypoint x="1800" y="330" />
        <di:waypoint x="1860" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_15" bpmnElement="Flow_Ind_15">
        <di:waypoint x="1960" y="330" />
        <di:waypoint x="1995" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trimestral_Sim" bpmnElement="Flow_Ind_Trimestral_Sim">
        <di:waypoint x="2020" y="305" />
        <di:waypoint x="2020" y="170" />
        <di:waypoint x="2100" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trimestral_Nao" bpmnElement="Flow_Ind_Trimestral_Nao">
        <di:waypoint x="2020" y="355" />
        <di:waypoint x="2020" y="450" />
        <di:waypoint x="2132" y="450" />
      </bpmndi:BPMNEdge>

      <!-- Checkout -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Checkout" bpmnElement="Flow_Ind_Checkout">
        <di:waypoint x="2200" y="170" />
        <di:waypoint x="2262" y="170" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

</bpmn2:definitions>`,Cl={"Activate global connect tool":"Ativar conexão global","Activate the global connect tool":"Ativar conexão global","Activate hand tool":"Mover canvas","Activate the hand tool":"Mover canvas","Activate lasso tool":"Selecionar múltiplos","Activate the lasso tool":"Selecionar múltiplos","Activate create/remove space tool":"Criar/remover espaço","Activate the create/remove space tool":"Criar/remover espaço","Create StartEvent":"Criar Início","Create start event":"Criar Início","Create Start Event":"Criar Início","Create EndEvent":"Criar Fim","Create end event":"Criar Fim","Create End Event":"Criar Fim","Create Task":"Criar Tarefa","Create task":"Criar Tarefa","Create Gateway":"Criar Gateway","Create gateway":"Criar Gateway","Create exclusive gateway":"Criar Gateway Exclusivo","Create Exclusive Gateway":"Criar Gateway Exclusivo","Create parallel gateway":"Criar Gateway Paralelo","Create Parallel Gateway":"Criar Gateway Paralelo","Create Intermediate/Boundary Event":"Criar Evento Intermediário","Create intermediate/boundary event":"Criar Evento Intermediário","Create IntermediateThrowEvent":"Criar Evento Intermediário","Create Pool/Participant":"Criar Pool","Create pool/participant":"Criar Pool","Create Participant":"Criar Participante","Create participant":"Criar Participante","Create DataObjectReference":"Criar Dados","Create data object reference":"Criar Dados","Create Data Object Reference":"Criar Dados","Create DataStoreReference":"Criar Armazém","Create data store reference":"Criar Armazém","Create Data Store Reference":"Criar Armazém","Create Group":"Criar Grupo","Create group":"Criar Grupo","Create expanded SubProcess":"Criar Sub-Processo","Create expanded sub-process":"Criar Sub-Processo","Create Expanded SubProcess":"Criar Sub-Processo","Create SubProcess":"Criar Sub-Processo","Create CallActivity":"Criar Chamada Externa","Create call activity":"Criar Chamada Externa","Create Call Activity":"Criar Chamada Externa","Append Task":"Adicionar Tarefa","Append task":"Adicionar Tarefa","Append EndEvent":"Adicionar Fim","Append end event":"Adicionar Fim","Append End Event":"Adicionar Fim","Append Gateway":"Adicionar Gateway","Append gateway":"Adicionar Gateway","Append Intermediate/Boundary Event":"Adicionar Evento","Append intermediate/boundary event":"Adicionar Evento","Append TextAnnotation":"Adicionar Anotação","Append text annotation":"Adicionar Anotação","Connect using Sequence/MessageFlow or Association":"Conectar","Connect using sequence/message flow or association":"Conectar","Connect using DataInputAssociation":"Conectar Dados",Connect:"Conectar","Change type":"Alterar tipo","Change element":"Alterar elemento",Delete:"Excluir",Remove:"Remover","Edit label":"Editar rótulo",Copy:"Copiar",Paste:"Colar",Undo:"Desfazer",Redo:"Refazer"},w2=q.forwardRef(function({xml:t,onXmlChange:n,onElementSelect:i,onFluxosClick:o,showGrid:a=!0,onGridToggle:r,onAddImage:s,onCommandStackChanged:c},d){const l=q.useRef(null),p=q.useRef(null),u=q.useRef(t),[m,h]=q.useState(!0),[g,f]=q.useState(null),[w,E]=q.useState(100),[v,y]=q.useState(!1);q.useImperativeHandle(d,()=>({async saveSVG(){if(p.current)try{const{svg:S}=await p.current.saveSVG();return S}catch(S){return console.error("Erro ao exportar SVG:",S),null}return null},undo(){if(p.current)try{p.current.get("commandStack").undo()}catch(S){console.error("Erro ao desfazer:",S)}},redo(){if(p.current)try{p.current.get("commandStack").redo()}catch(S){console.error("Erro ao refazer:",S)}},setElementColor(S,k){if(p.current&&S)try{p.current.get("modeling").setColor([S],{fill:k.fill,stroke:k.stroke})}catch(W){console.error("Erro ao mudar cor:",W)}},addCallActivity(S,k){if(!p.current)return console.error("Modeler não disponível"),null;try{const W=p.current,O=W.get("modeling"),ne=W.get("elementFactory"),me=W.get("canvas"),Pe=W.get("elementRegistry"),we=me.getRootElement();if(!we||!we.businessObject)return console.error("RootElement inválido"),null;let re=we;if((we.businessObject.$type||we.type)==="bpmn:Collaboration"){const Ge=Pe.filter(de=>de.type==="bpmn:Lane");if(Ge.length>0)re=Ge[0];else{const de=Pe.filter(le=>le.type==="bpmn:Participant");if(de.length>0)re=de[0];else return console.error("Colaboração sem participantes"),alert("Adicione uma Pool/Participante ao diagrama antes de adicionar fluxos."),null}}const Ae="CallActivity_"+S.replace(/-/g,"").substring(0,8),he=ne.createShape({type:"bpmn:CallActivity"}),Ce={x:250,y:200};return O.createShape(he,Ce,re),O.updateProperties(he,{name:k}),he.flowId=S,setTimeout(()=>{try{O.setColor([he],{fill:"#fef3c7",stroke:"#f59e0b"})}catch(Ge){console.warn("Não foi possível aplicar cor:",Ge)}},200),console.log("CallActivity criado com sucesso:",he.id,"para flowId:",S),he}catch(W){return console.error("Erro ao criar CallActivity:",W),alert("Erro ao criar elemento: "+W.message),null}},hasFlowElement(S){if(!p.current)return!1;try{return p.current.get("elementRegistry").filter(O=>O.type==="bpmn:CallActivity"&&O.flowId===S).length>0}catch{return!1}},removeFlowElement(S){if(!p.current)return!1;try{const k=p.current.get("modeling"),O=p.current.get("elementRegistry").filter(ne=>ne.type==="bpmn:CallActivity"&&ne.flowId===S);return O.length>0?(k.removeElements(O),!0):!1}catch(k){return console.error("Erro ao remover elemento:",k),!1}},createImageOverlayForElement(S,k,W){if(!p.current)return;const O=p.current,ne=O.get("overlays"),me=W==="circle"?"50%":W==="rounded"?"12px":"4px",Pe=document.createElement("div");Pe.className="bpmn-image-overlay",Pe.setAttribute("data-format",W),Pe.style.cssText=`
        width: ${S.width}px;
        height: ${S.height}px;
        overflow: hidden;
        border-radius: ${me};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        pointer-events: none;
        background: white;
      `;const we=document.createElement("img");we.src=k,we.draggable=!1,we.style.cssText=`
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      `,Pe.appendChild(we),ne.add(S.id,{position:{top:0,left:0},html:Pe});const re=()=>{const le=document.querySelector(`[data-element-id="${S.id}"]`);le&&(le.setAttribute("data-image-element","true"),le.setAttribute("data-image-format",W),le.querySelectorAll("text, tspan").forEach(Re=>{Re.style.display="none",Re.style.visibility="hidden"}))};setTimeout(re,50),setTimeout(re,200);const ie=O.get("eventBus"),Ee=O.get("modeling"),Ae=(le,X)=>{Pe.style.width=le+"px",Pe.style.height=X+"px"},he=le=>{try{const X=le.businessObject;if(X&&X.name&&X.name.startsWith("__IMAGE__:")){const Re=X.name.substring(10),ke=JSON.parse(Re);ke.width=le.width,ke.height=le.height,Ee.updateProperties(le,{name:"__IMAGE__:"+JSON.stringify(ke)})}}catch(X){console.error("Erro ao salvar dimensões:",X)}},Ce=le=>{if(le.shape&&le.shape.id===S.id){const X=le.newBounds;X&&Ae(X.width,X.height)}},Ge=le=>{const X=le.element;X&&X.id===S.id&&(Ae(X.width,X.height),setTimeout(re,10))},de=le=>{var Re;const X=(Re=le.context)==null?void 0:Re.shape;X&&X.id===S.id&&(Ae(X.width,X.height),he(X))};ie.on("resize.move",Ce),ie.on("shape.changed",Ge),ie.on("commandStack.shape.resize.postExecuted",de)},restoreImageOverlays(){if(!p.current)return;p.current.get("elementRegistry").forEach(W=>{if(W.businessObject&&W.businessObject.name)try{if(W.businessObject.name.startsWith("__IMAGE__:")){const O=W.businessObject.name.substring(10),ne=JSON.parse(O);this.createImageOverlayForElement(W,ne.url,ne.format)}}catch{}})},addImageOverlay(S,k=300,W=300,O="square"){if(console.log("addImageOverlay chamado:",{imageUrl:S==null?void 0:S.substring(0,50),x:k,y:W,format:O}),!p.current)return console.error("modelerRef.current é null"),null;try{const ne=p.current,me=ne.get("modeling"),Pe=ne.get("elementFactory"),we=ne.get("canvas"),re=ne.get("elementRegistry"),ie=we.getRootElement();if(!ie||!ie.businessObject)return console.error("RootElement inválido"),null;let Ee=ie;const he=ie.businessObject.$type||ie.type;if(console.log("Root type:",he),he==="bpmn:Collaboration"){const st=re.filter(Ye=>Ye.type==="bpmn:Lane");if(st.length>0)Ee=st[0],console.log("Usando Lane como pai:",Ee.id);else{const Ye=re.filter(tt=>tt.type==="bpmn:Participant");if(Ye.length>0)Ee=Ye[0],console.log("Usando Participant como pai:",Ee.id);else return console.error("Colaboração sem participantes - não é possível adicionar elementos"),alert("Adicione uma Pool/Participante ao diagrama antes de inserir imagens."),null}}const Ce=120,Ge=Pe.createShape({type:"bpmn:Task",width:Ce,height:Ce}),de=we.viewbox(),le={x:de.x+de.width/2,y:de.y+de.height/2};console.log("Criando shape em:",Ee.id,"posição:",le),me.createShape(Ge,le,Ee);const X=Ge.id;console.log("Shape criado com sucesso, ID:",X);let Re=1;re.forEach(st=>{var Ye,tt;(tt=(Ye=st.businessObject)==null?void 0:Ye.name)!=null&&tt.startsWith("__IMAGE__:")&&Re++});const ke=JSON.stringify({url:S,format:O,displayName:`Imagem ${Re}`});return me.updateProperties(Ge,{name:"__IMAGE__:"+ke}),this.createImageOverlayForElement(Ge,S,O),X}catch(ne){return console.error("Erro ao adicionar imagem:",ne),console.error("Stack:",ne.stack),null}},getModeler(){return p.current},updateElementProperties(S,k){if(!p.current||!S)return!1;try{return p.current.get("modeling").updateProperties(S,k),!0}catch(W){return console.error("Erro ao atualizar propriedades:",W),!1}},async loadComercialTemplate(){if(!p.current)return!1;try{await p.current.importXML(y2);const S=p.current.get("canvas");S.zoom(.7);const k=S.viewbox(),W=p.current.get("elementRegistry");let O=1/0,ne=1/0,me=-1/0,Pe=-1/0;if(W.forEach(re=>{re.x!==void 0&&re.y!==void 0&&(O=Math.min(O,re.x),ne=Math.min(ne,re.y),me=Math.max(me,re.x+(re.width||0)),Pe=Math.max(Pe,re.y+(re.height||0)))}),O!==1/0){const re=(O+me)/2,ie=(ne+Pe)/2;S.viewbox({x:re-k.width/2,y:ie-k.height/2,width:k.width,height:k.height})}setTimeout(()=>{const re=p.current.get("overlays");W.forEach(ie=>{var Ae,he;if((he=(Ae=ie.businessObject)==null?void 0:Ae.name)==null?void 0:he.includes("[ROBO]")){const Ce=document.querySelector(`[data-element-id="${ie.id}"]`);if(Ce){Ce.setAttribute("data-robot-task","true");const de=Ce.querySelector(".djs-visual");de&&(de.querySelectorAll("circle").forEach(X=>{X.style.display="none"}),de.querySelectorAll("path").forEach((X,Re)=>{Re>0&&(X.style.display="none")}));const le=Ce.querySelector(".djs-label text");if(le&&ie.businessObject.name){const X=ie.businessObject.name;if(X.includes("[ROBO]")){const Re=X.replace(/\[ROBO\]\s*/g,"");le.textContent=Re}}}try{re.remove({element:ie.id,type:"robot-icon"})}catch{}const Ge=document.createElement("div");Ge.className="robot-icon-overlay",Ge.innerHTML=`
                <svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <line x1="12" y1="7" x2="12" y2="11" />
                  <circle cx="8" cy="16" r="1" />
                  <circle cx="16" cy="16" r="1" />
                </svg>
              `,re.add(ie.id,"robot-icon",{position:{top:5,left:5},html:Ge})}})},300);const{xml:we}=await p.current.saveXML({format:!0});return n&&n(we),!0}catch(S){return console.error("Erro ao carregar template comercial:",S),!1}}}),[n]);const P=q.useCallback(()=>{if(p.current)try{const k=p.current.get("canvas").zoom();E(Math.round(k*100))}catch{}},[]),x=q.useCallback(async()=>{if(!p.current){console.error("modelerRef.current não disponível");return}console.log("=== INICIANDO ADIÇÃO DE RAIA INDICAÇÕES ===");try{const{xml:S}=await p.current.saveXML({format:!0});console.log("XML atual obtido, tamanho:",S.length);const k=new DOMParser,W=new XMLSerializer,O=k.parseFromString(S,"text/xml"),ne=O.querySelector("parsererror");if(ne){console.error("Erro ao parsear XML atual:",ne.textContent),alert("Erro ao processar diagrama atual");return}console.log("Template indicações tamanho:",Nl.length);const me=k.parseFromString(Nl,"text/xml"),Pe=me.querySelector("parsererror");if(Pe){console.error("Erro ao parsear template indicações:",Pe.textContent),alert("Erro no template de indicações");return}let we=O.querySelector("process");we||(we=O.getElementsByTagName("bpmn2:process")[0]),we||(we=O.getElementsByTagName("bpmn:process")[0]);let re=O.querySelector("laneSet");re||(re=O.getElementsByTagName("bpmn2:laneSet")[0]),re||(re=O.getElementsByTagName("bpmn:laneSet")[0]);let ie=O.querySelector("BPMNPlane");if(ie||(ie=O.getElementsByTagName("bpmndi:BPMNPlane")[0]),console.log("Elementos encontrados no diagrama atual:",{process:!!we,laneSet:!!re,diagram:!!ie}),!we||!re||!ie){alert("Por favor, carregue um diagrama com Lanes primeiro (ex: Comercial)");return}let Ee=me.querySelector("process");Ee||(Ee=me.getElementsByTagName("bpmn2:process")[0]);let Ae=me.querySelector("lane");Ae||(Ae=me.getElementsByTagName("bpmn2:lane")[0]);let he=me.querySelector("BPMNPlane");if(he||(he=me.getElementsByTagName("bpmndi:BPMNPlane")[0]),console.log("Elementos encontrados no template indicações:",{process:!!Ee,lane:!!Ae,diagram:!!he}),!Ae||!Ee||!he){console.error("Elementos de indicações não encontrados"),alert("Erro: template de indicações inválido");return}let Ce=0;const Ge=Array.from(ie.childNodes).filter(M=>M.nodeName&&(M.nodeName.includes("BPMNShape")||M.nodeName==="bpmndi:BPMNShape"));console.log("Shapes existentes encontrados:",Ge.length),Ge.forEach(M=>{const $=M.querySelector("Bounds")||M.getElementsByTagName("dc:Bounds")[0]||M.getElementsByTagName("Bounds")[0];if($){const ee=parseFloat($.getAttribute("y"))||0,_e=parseFloat($.getAttribute("height"))||0;ee+_e>Ce&&(Ce=ee+_e)}}),console.log("MaxY calculado:",Ce);const de=Ce+80;console.log("OffsetY para nova raia:",de),console.log("Copiando Lane para LaneSet...");const le=O.importNode(Ae,!0);re.appendChild(le),console.log("Lane adicionada ao LaneSet");const X=[],Re=[],ke=Array.from(Ee.childNodes).filter(M=>M.nodeType===1);console.log("Filhos do processo de indicações:",ke.length),ke.forEach(M=>{const $=(M.tagName||M.nodeName||"").toLowerCase();$.includes("laneset")||($.includes("sequenceflow")?Re.push(M):X.push(M))}),console.log("Elementos não-flow:",X.length),console.log("Elementos flow:",Re.length),X.forEach(M=>{const $=O.importNode(M,!0);we.appendChild($)}),console.log("Elementos não-flow adicionados"),Re.forEach(M=>{const $=O.importNode(M,!0);we.appendChild($)}),console.log("Elementos flow adicionados");const st=Array.from(he.childNodes).filter(M=>M.nodeName&&(M.nodeName.includes("BPMNShape")||M.nodeName==="bpmndi:BPMNShape")),Ye=Array.from(he.childNodes).filter(M=>M.nodeName&&(M.nodeName.includes("BPMNEdge")||M.nodeName==="bpmndi:BPMNEdge"));console.log("Shapes no template indicações:",st.length),console.log("Edges no template indicações:",Ye.length);const tt=Array.from(ie.childNodes).filter(M=>M.nodeName&&(M.nodeName.includes("BPMNEdge")||M.nodeName==="bpmndi:BPMNEdge")),Dt=tt.length>0?tt[0]:null;console.log("Edges existentes:",tt.length);const It=O.createElementNS("http://www.omg.org/spec/BPMN/20100524/DI","bpmndi:BPMNShape");It.setAttribute("id","Shape_Lane_Indicacoes_Added"),It.setAttribute("bpmnElement","Lane_Indicacoes"),It.setAttribute("isHorizontal","true");const Ft=O.createElementNS("http://www.omg.org/spec/DD/20100524/DC","dc:Bounds");Ft.setAttribute("x","150"),Ft.setAttribute("y",String(de)),Ft.setAttribute("width","2570"),Ft.setAttribute("height","520"),It.appendChild(Ft),Dt?ie.insertBefore(It,Dt):ie.appendChild(It);let rn=0;st.forEach(M=>{const $=M.getAttribute("bpmnElement");if($&&!$.includes("Participant")&&!$.includes("Lane")){const ee=O.importNode(M,!0),_e=ee.querySelector("Bounds")||ee.getElementsByTagName("dc:Bounds")[0];if(_e){const nt=parseFloat(_e.getAttribute("y"))||0;_e.setAttribute("y",String(nt+de))}Dt?ie.insertBefore(ee,Dt):ie.appendChild(ee),rn++}}),console.log("Shapes adicionados ao diagrama:",rn);let j=0;Ye.forEach(M=>{const $=O.importNode(M,!0);Array.from($.childNodes).filter(_e=>_e.nodeName&&(_e.nodeName.includes("waypoint")||_e.nodeName==="di:waypoint")).forEach(_e=>{const nt=parseFloat(_e.getAttribute("y"))||0;_e.setAttribute("y",String(nt+de))}),ie.appendChild($),j++}),console.log("Edges adicionados ao diagrama:",j);const L=Array.from(ie.childNodes).filter(M=>M.nodeName&&(M.nodeName.includes("BPMNShape")||M.nodeName==="bpmndi:BPMNShape")).find(M=>{var $;return M.getAttribute&&(($=M.getAttribute("bpmnElement"))==null?void 0:$.includes("Participant"))});if(L){const M=L.querySelector("Bounds")||L.getElementsByTagName("dc:Bounds")[0];if(M){const $=parseFloat(M.getAttribute("height"))||2e3,ee=$+600;M.setAttribute("height",String(ee)),console.log("Altura do Participant atualizada:",$,"->",ee)}}else console.warn("Participant shape não encontrado");let H=W.serializeToString(O);console.log("XML serializado, tamanho:",H.length),H=H.replace(/xmlns:ns\d+="[^"]*"/g,""),H=H.replace(/ns\d+:/g,""),console.log("XML mesclado gerado, importando..."),console.log("Primeiros 500 chars do XML:",H.substring(0,500));try{const M=await p.current.importXML(H);M.warnings&&M.warnings.length>0&&console.warn("Warnings ao importar:",M.warnings),console.log("XML importado com sucesso!"),p.current.get("canvas").zoom(.4);const{xml:ee}=await p.current.saveXML({format:!0});n&&n(ee),console.log("=== RAIA INDICAÇÕES ADICIONADA COM SUCESSO ==="),alert("Raia de Indicações adicionada com sucesso!")}catch(M){console.error("Erro ao importar XML:",M),console.error("Mensagem:",M.message),console.log("XML completo para debug (primeiros 2000 chars):",H.substring(0,2e3)),alert("Erro ao importar diagrama: "+M.message)}}catch(S){console.error("Erro ao adicionar raia de indicações:",S),console.error("Stack:",S.stack),alert("Erro ao adicionar raia: "+S.message)}},[n]);q.useEffect(()=>{const S=l.current;if(!S)return;const k=S.querySelector(".bjs-container");k&&(a?k.classList.add("grid-enabled"):k.classList.remove("grid-enabled"))},[a]),q.useEffect(()=>{const S=k=>{v&&!k.target.closest("[data-raia-menu]")&&y(!1)};return document.addEventListener("click",S),()=>document.removeEventListener("click",S)},[v]),q.useEffect(()=>{const S=l.current;if(!S||!u.current)return;const W=setTimeout(async()=>{h(!0),f(null);try{const O=new Gt({container:S,keyboard:{bindTo:document},additionalModules:[l2,h2,b2]});p.current=O,await O.importXML(u.current);const ne=O.get("canvas");ne.zoom(1);const me=ne.viewbox();if(ne.getRootElement()){const j=O.get("elementRegistry");let F=1/0,L=1/0,H=-1/0,M=-1/0;if(j.forEach($=>{$.x!==void 0&&$.y!==void 0&&(F=Math.min(F,$.x),L=Math.min(L,$.y),H=Math.max(H,$.x+($.width||0)),M=Math.max(M,$.y+($.height||0)))}),F!==1/0){const $=(F+H)/2,ee=(L+M)/2;ne.viewbox({x:$-me.width/2,y:ee-me.height/2,width:me.width,height:me.height})}}E(100),(()=>{const j={Participant_Educacao:{stroke:"#51cf66",fill:"#e0ffe0"},Participant_Indicacao:{stroke:"#ff6b6b",fill:"#ffe0e0"},Participant_Conteudo:{stroke:"#9775fa",fill:"#f0e0ff"},Participant_Prospeccao:{stroke:"#fa5252",fill:"#ffe0e0"},Participant_Google:{stroke:"#4dabf7",fill:"#e0f0ff"},Participant_Meta:{stroke:"#cc5de8",fill:"#f3e0ff"},Participant_Nucleo:{stroke:"#868e96",fill:"#f0f0f0"}};setTimeout(()=>{Object.keys(j).forEach(F=>{var H;const L=(H=l.current)==null?void 0:H.querySelector(`[data-element-id="${F}"]`);if(L){const M=L.querySelector("rect");M?(M.setAttribute("fill",j[F].fill),M.setAttribute("stroke",j[F].stroke),M.setAttribute("stroke-width","2"),console.log(`✅ Cor SVG aplicada à lane: ${F}`,j[F])):console.warn(`⚠️ Rect não encontrado para lane: ${F}`)}else console.warn(`⚠️ Elemento não encontrado para lane: ${F}`)})},500)})(),(()=>{const j={Participant_Educacao:"🎓 EDUCAÇÃO - Alunos (6 Meses Grátis)",Participant_Indicacao:"🤝 INDICAÇÃO - Parceiro (Ativo + Passivo)",Participant_Conteudo:"📱 PRODUÇÃO CONTEÚDO - Instagram",Participant_Prospeccao:"🎯 PROSPECÇÃO ATIVA - Redes Sociais",Participant_Google:"🔍 GOOGLE ADS - Alta Intenção",Participant_Meta:"📘 META ADS - Descoberta",Participant_Nucleo:"💰 NÚCLEO FINANCEIRO - Gateway Asaas"};setTimeout(()=>{Object.keys(j).forEach(F=>{var H;const L=(H=l.current)==null?void 0:H.querySelector(`[data-element-id="${F}"]`);if(L){let M=L.querySelector(".djs-label");M||(M=document.createElementNS("http://www.w3.org/2000/svg","g"),M.setAttribute("class","djs-label"),L.appendChild(M));let $=M.querySelector("text");$||($=document.createElementNS("http://www.w3.org/2000/svg","text"),M.appendChild($)),$.setAttribute("x","10"),$.setAttribute("y","20"),$.setAttribute("style","font-family: Inter, sans-serif; font-size: 13px; font-weight: 700; fill: #1e293b; writing-mode: tb; text-orientation: upright;"),$.textContent=j[F],console.log(`✅ Label aplicada à lane: ${F}`)}else console.warn(`⚠️ Lane não encontrada: ${F}`)})},600)})(),setTimeout(()=>{const j=O.get("elementRegistry"),F=O.get("overlays"),L=O.get("eventBus"),H=O.get("modeling");j.forEach(M=>{if(M.businessObject&&M.businessObject.name)try{if(M.businessObject.name.startsWith("__IMAGE__:")){const $=M.businessObject.name.substring(10),ee=JSON.parse($),_e=ee.width||M.width,nt=ee.height||M.height;ee.width&&ee.height&&(M.width!==ee.width||M.height!==ee.height)&&H.resizeShape(M,{x:M.x,y:M.y,width:ee.width,height:ee.height});const We=ee.format==="circle"?"50%":ee.format==="rounded"?"12px":"4px",Ke=document.createElement("div");Ke.className="bpmn-image-overlay",Ke.style.cssText=`
                    width: ${_e}px;
                    height: ${nt}px;
                    overflow: hidden;
                    border-radius: ${We};
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    pointer-events: none;
                    background: white;
                  `;const Ht=document.createElement("img");Ht.src=ee.url,Ht.draggable=!1,Ht.style.cssText=`
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                  `,Ke.appendChild(Ht),F.add(M.id,{position:{top:0,left:0},html:Ke});const sn=()=>{const oe=document.querySelector(`[data-element-id="${M.id}"]`);oe&&(oe.setAttribute("data-image-element","true"),oe.setAttribute("data-image-format",ee.format),oe.querySelectorAll("text, tspan").forEach(De=>{De.style.display="none",De.style.visibility="hidden"}))};setTimeout(sn,50),setTimeout(sn,200),setTimeout(sn,500);const Ot=(oe,Y)=>{Ke.style.width=oe+"px",Ke.style.height=Y+"px"},cn=oe=>{try{const Y=oe.businessObject;if(Y&&Y.name&&Y.name.startsWith("__IMAGE__:")){const De=JSON.parse(Y.name.substring(10));De.width=oe.width,De.height=oe.height,H.updateProperties(oe,{name:"__IMAGE__:"+JSON.stringify(De)})}}catch(Y){console.error("Erro ao salvar dimensões:",Y)}},hi=oe=>{if(oe.shape&&oe.shape.id===M.id){const Y=oe.newBounds;Y&&Ot(Y.width,Y.height)}},A=oe=>{const Y=oe.element;Y&&Y.id===M.id&&(Ot(Y.width,Y.height),setTimeout(sn,10))},V=oe=>{var De;const Y=(De=oe.context)==null?void 0:De.shape;Y&&Y.id===M.id&&(Ot(Y.width,Y.height),cn(Y))};L.on("resize.move",hi),L.on("shape.changed",A),L.on("commandStack.shape.resize.postExecuted",V),console.log("Imagem restaurada:",M.id,"dimensões:",_e,"x",nt)}}catch{}})},200);const Ee=()=>{const j=O.get("elementRegistry"),F=O.get("overlays");j.forEach(L=>{var M,$;if(($=(M=L.businessObject)==null?void 0:M.name)==null?void 0:$.includes("[ROBO]")){const ee=document.querySelector(`[data-element-id="${L.id}"]`);if(ee){ee.setAttribute("data-robot-task","true");const We=ee.querySelector(".djs-visual");We&&(We.querySelectorAll("circle").forEach(Ke=>{Ke.style.display="none"}),We.querySelectorAll("path").forEach((Ke,Ht)=>{Ht>0&&(Ke.style.display="none")}))}try{F.remove({element:L.id,type:"robot-icon"})}catch{}const _e=document.createElement("div");_e.className="robot-icon-overlay",_e.innerHTML=`
                <svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <line x1="12" y1="7" x2="12" y2="11" />
                  <circle cx="8" cy="16" r="1" />
                  <circle cx="16" cy="16" r="1" />
                </svg>
              `,F.add(L.id,"robot-icon",{position:{top:5,left:5},html:_e});const nt=ee.querySelector(".djs-label text");if(nt&&L.businessObject.name){const We=L.businessObject.name;if(We.includes("[ROBO]")){const Ke=We.replace(/\[ROBO\]\s*/g,"");nt.textContent=Ke}}}})};setTimeout(Ee,300);const Ae=O.get("eventBus");Ae.on("shape.added",({element:j})=>{var F,L;(L=(F=j.businessObject)==null?void 0:F.name)!=null&&L.includes("[ROBO]")&&setTimeout(Ee,50)}),Ae.on("shape.changed",({element:j})=>{var F,L;(L=(F=j.businessObject)==null?void 0:F.name)!=null&&L.includes("[ROBO]")&&setTimeout(Ee,50)});const he=S.querySelector(".bjs-container");he&&a&&he.classList.add("grid-enabled"),Ae.on("canvas.viewbox.changed",P),new MutationObserver(()=>{const j=document.querySelector(".djs-popup-body");if(!j||document.querySelector('[data-action="replace-with-robot-task"]')||j.querySelectorAll(".entry").length===0)return;console.log('🤖 Adicionando opção "Tarefa Automatizada" ao menu...');const L=O.get("selection").get()[0];if(!L)return;if(L.type&&(L.type.includes("Task")||L.type==="bpmn:Task")){const M=document.createElement("div");M.className="entry",M.setAttribute("data-action","replace-with-robot-task"),M.innerHTML=`
              <svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; margin-right: 8px; flex-shrink: 0;">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <line x1="12" y1="7" x2="12" y2="11" />
                <circle cx="8" cy="16" r="1" />
                <circle cx="16" cy="16" r="1" />
              </svg>
              <span>Tarefa Automatizada</span>
            `,M.style.cursor="pointer",M.style.padding="8px 12px",M.style.display="flex",M.style.alignItems="center",M.addEventListener("mouseenter",()=>{M.style.backgroundColor="#f3f4f6"}),M.addEventListener("mouseleave",()=>{M.style.backgroundColor=""}),M.addEventListener("click",()=>{const $=O.get("bpmnReplace"),ee=O.get("modeling");let _e=L.businessObject.name||"Automação";_e.includes("[ROBO]")||(_e="[ROBO] "+_e);const nt=$.replaceElement(L,{type:"bpmn:ServiceTask"});ee.updateProperties(nt,{name:_e});const We=document.querySelector(".djs-popup");We&&We.remove()}),j.appendChild(M)}}).observe(document.body,{childList:!0,subtree:!0}),O.on("commandStack.changed",async()=>{try{const{xml:j}=await O.saveXML({format:!0});n&&n(j)}catch(j){console.error("Erro ao exportar:",j)}if(c)try{const j=O.get("commandStack");c({canUndo:j.canUndo(),canRedo:j.canRedo()})}catch{}}),O.on("selection.changed",j=>{var F;i&&i(((F=j.newSelection)==null?void 0:F[0])||null)});const Ge=O.get("editorActions"),de=O.get("copyPaste"),le=O.get("selection"),X=O.get("clipboard"),Re=j=>{if(j.target.tagName==="INPUT"||j.target.tagName==="TEXTAREA")return;const L=navigator.platform.toUpperCase().indexOf("MAC")>=0?j.metaKey:j.ctrlKey;if(L&&j.key==="c"){const H=le.get();H.length>0&&(j.preventDefault(),de.copy(H),console.log("Elementos copiados:",H.length))}else if(L&&j.key==="v"){if(j.preventDefault(),X.isEmpty&&X.isEmpty()){console.log("Clipboard vazio");return}de.paste(),console.log("Elementos colados")}else if(L&&j.key==="x"){const H=le.get();H.length>0&&(j.preventDefault(),de.copy(H),O.get("modeling").removeElements(H),console.log("Elementos recortados:",H.length))}};document.addEventListener("keydown",Re),p.current._copyPasteHandler=Re;let ke=document.getElementById("bpmn-tooltip");ke||(ke=document.createElement("div"),ke.id="bpmn-tooltip",ke.style.cssText=`
            position: fixed;
            background: #1e293b;
            color: white;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            z-index: 100000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.1s ease;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          `,document.body.appendChild(ke));const st=j=>{const F=j.currentTarget,L=F.getAttribute("data-tooltip");if(!L)return;const H=F.getBoundingClientRect();ke.textContent=L,ke.style.opacity="1",ke.style.left=H.right+12+"px",ke.style.top=H.top+H.height/2+"px",ke.style.transform="translateY(-50%)"},Ye=()=>{ke.style.opacity="0"},tt=()=>{S.querySelectorAll(".djs-palette .entry, .djs-context-pad .entry").forEach(F=>{const L=F.getAttribute("title");if(!L||F.hasAttribute("data-tooltip-setup"))return;const H=Cl[L]||is(L);F.setAttribute("data-tooltip",H),F.removeAttribute("title"),F.setAttribute("data-tooltip-setup","true"),F.addEventListener("mouseenter",st),F.addEventListener("mouseleave",Ye)})},Dt=setInterval(()=>{S.querySelectorAll(".djs-palette .entry[title], .djs-context-pad .entry[title]").length>0&&tt()},100);setTimeout(()=>clearInterval(Dt),5e3),new MutationObserver(j=>{let F=!1;j.forEach(L=>{if(L.addedNodes.length>0&&(F=!0),L.type==="attributes"&&L.attributeName==="title"){const H=L.target;if(H.hasAttribute("title")&&!H.hasAttribute("data-tooltip-setup")){const M=H.getAttribute("title"),$=Cl[M]||is(M);H.setAttribute("data-tooltip",$),H.removeAttribute("title"),H.setAttribute("data-tooltip-setup","true"),H.addEventListener("mouseenter",st),H.addEventListener("mouseleave",Ye)}}}),F&&setTimeout(tt,50)}).observe(S,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["title"]}),setTimeout(tt,200),setTimeout(tt,500),setTimeout(tt,1e3);const Ft=()=>{const j=S.querySelector(".djs-palette");!j||j.hasAttribute("data-scroll-setup")||(j.setAttribute("data-scroll-setup","true"),j.addEventListener("wheel",F=>{if(j.scrollHeight>j.clientHeight){F.stopPropagation();const H=j.scrollTop===0,M=j.scrollTop+j.clientHeight>=j.scrollHeight;(H&&F.deltaY<0||M&&F.deltaY>0)&&F.preventDefault()}},{passive:!1}))};setTimeout(Ft,300),setTimeout(Ft,600);const rn=()=>{const j=S.querySelector(".djs-palette");if(!j||j.querySelector(".fluxos-entry"))return;const F=document.createElement("div");F.className="separator",F.style.cssText=`
            margin: 6px 8px;
            width: calc(100% - 16px);
            height: 1px;
            background: #e2e8f0;
            border: none;
          `;const L=document.createElement("div");L.className="entry fluxos-entry",L.setAttribute("data-tooltip","Gerenciar Fluxos"),L.setAttribute("data-tooltip-setup","true"),L.style.cssText=`
            width: 36px;
            height: 36px;
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin: 2px auto;
            transition: all 0.15s ease;
            cursor: pointer;
          `,L.innerHTML=`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8;">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          `,L.addEventListener("mouseenter",$=>{L.style.background="#f1f5f9",L.style.transform="scale(1.05)",st($)}),L.addEventListener("mouseleave",()=>{L.style.background="",L.style.transform="",Ye()}),L.addEventListener("click",()=>{o&&o()});const H=document.createElement("div");H.className="entry image-entry",H.setAttribute("data-tooltip","Adicionar Imagem"),H.setAttribute("data-tooltip-setup","true"),H.style.cssText=`
            width: 36px;
            height: 36px;
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin: 2px auto;
            transition: all 0.15s ease;
            cursor: pointer;
          `,H.innerHTML=`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8;">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          `,H.addEventListener("mouseenter",$=>{H.style.background="#f1f5f9",H.style.transform="scale(1.05)",st($)}),H.addEventListener("mouseleave",()=>{H.style.background="",H.style.transform="",Ye()}),H.addEventListener("click",()=>{s&&s()});const M=document.createElement("div");M.className="entry robot-entry",M.setAttribute("data-tooltip","Tarefa Automatizada (Robô)"),M.setAttribute("data-tooltip-setup","true"),M.style.cssText=`
            width: 36px;
            height: 36px;
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin: 2px auto;
            transition: all 0.15s ease;
            cursor: pointer;
          `,M.innerHTML=`
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <line x1="12" y1="7" x2="12" y2="11" />
              <circle cx="8" cy="16" r="1" />
              <circle cx="16" cy="16" r="1" />
            </svg>
          `,M.addEventListener("mouseenter",$=>{M.style.background="#f1f5f9",M.style.transform="scale(1.05)",st($)}),M.addEventListener("mouseleave",()=>{M.style.background="",M.style.transform="",Ye()}),M.addEventListener("click",()=>{try{const $=O.get("modeling"),ee=O.get("elementFactory"),_e=O.get("canvas"),nt=O.get("elementRegistry"),We=_e.getRootElement();let Ke=We;if((We.businessObject.$type||We.type)==="bpmn:Collaboration"){const A=nt.filter(V=>V.type==="bpmn:Lane");if(A.length>0)Ke=A[0];else{const V=nt.filter(oe=>oe.type==="bpmn:Participant");V.length>0&&(Ke=V[0])}}const Ot=ee.createShape({type:"bpmn:ServiceTask"}),cn=_e.viewbox(),hi={x:cn.x+cn.width/2,y:cn.y+cn.height/2};$.createShape(Ot,hi,Ke),$.updateProperties(Ot,{name:"[ROBO] Nova Automação"}),setTimeout(()=>{$.setColor([Ot],{fill:"#f8fafc",stroke:"#475569"})},100),console.log("Tarefa automatizada criada:",Ot.id)}catch($){console.error("Erro ao criar tarefa automatizada:",$)}}),j.appendChild(F),j.appendChild(L),j.appendChild(H)};setTimeout(rn,300),setTimeout(rn,600),h(!1)}catch(O){console.error("Erro BPMN:",O),f(O.message||"Erro ao carregar diagrama"),h(!1)}},100);return()=>{clearTimeout(W),p.current&&(p.current._copyPasteHandler&&document.removeEventListener("keydown",p.current._copyPasteHandler),p.current.destroy(),p.current=null)}},[P]);const I=q.useCallback(()=>{var k;const S=(k=p.current)==null?void 0:k.get("canvas");S&&(S.zoom(S.zoom()*1.2),P())},[P]),N=q.useCallback(()=>{var k;const S=(k=p.current)==null?void 0:k.get("canvas");S&&(S.zoom(S.zoom()/1.2),P())},[P]),R=q.useCallback(()=>{var k;const S=(k=p.current)==null?void 0:k.get("canvas");S&&(S.zoom("fit-viewport"),P())},[P]),B=q.useCallback(()=>{var k;const S=(k=p.current)==null?void 0:k.get("canvas");S&&(S.zoom(1),P())},[P]);return b.jsxs("div",{className:"relative w-full h-full",style:{minHeight:"500px"},children:[m&&b.jsx("div",{className:"absolute inset-0 bg-white/90 flex items-center justify-center z-10",children:b.jsxs("div",{className:"flex flex-col items-center gap-3",children:[b.jsx("div",{className:"w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"}),b.jsx("span",{className:"text-slate-600",children:"Carregando..."})]})}),g&&b.jsx("div",{className:"absolute inset-0 bg-red-50 flex items-center justify-center z-10",children:b.jsxs("div",{className:"bg-white p-6 rounded-lg shadow-lg max-w-md text-center",children:[b.jsx("h3",{className:"text-red-600 font-bold mb-2",children:"Erro ao carregar diagrama"}),b.jsx("p",{className:"text-slate-600 text-sm",children:g})]})}),!m&&!g&&b.jsxs("div",{className:"absolute top-3 right-3 z-20 flex items-center gap-2",children:[b.jsxs("div",{className:"bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center px-1 py-0.5 border border-slate-200/60",children:[b.jsx("button",{onClick:N,className:"w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors",title:"Diminuir zoom",children:b.jsx("svg",{className:"w-3.5 h-3.5 text-slate-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:2.5,children:b.jsx("path",{strokeLinecap:"round",d:"M5 12h14"})})}),b.jsxs("button",{onClick:B,className:"px-2 h-7 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-colors min-w-[44px] text-center",title:"Resetar para 100%",children:[w,"%"]}),b.jsx("button",{onClick:I,className:"w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors",title:"Aumentar zoom",children:b.jsx("svg",{className:"w-3.5 h-3.5 text-slate-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:2.5,children:b.jsx("path",{strokeLinecap:"round",d:"M12 5v14M5 12h14"})})})]}),b.jsxs("div",{className:"bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center px-1 py-0.5 border border-slate-200/60",children:[b.jsx("button",{onClick:R,className:"w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors",title:"Ajustar à tela",children:b.jsx("svg",{className:"w-3.5 h-3.5 text-slate-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:2,children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"})})}),b.jsx("button",{onClick:r,className:`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${a?"bg-blue-100":"hover:bg-slate-100"}`,title:a?"Desativar grade":"Ativar grade",children:b.jsx("svg",{className:`w-3.5 h-3.5 ${a?"text-blue-600":"text-slate-400"}`,fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:2,children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"})})})]}),b.jsxs("div",{className:"relative","data-raia-menu":!0,children:[b.jsxs("button",{onClick:()=>y(!v),className:`h-8 px-2.5 rounded-full shadow-sm border flex items-center gap-1.5 transition-colors text-[11px] font-medium ${v?"bg-emerald-50 border-emerald-300 text-emerald-700":"bg-white/90 backdrop-blur-sm border-slate-200/60 text-slate-600 hover:bg-slate-50"}`,title:"Adicionar Raia",children:[b.jsx("svg",{className:"w-3.5 h-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:2.5,children:b.jsx("path",{strokeLinecap:"round",d:"M12 5v14M5 12h14"})}),"Raia"]}),v&&b.jsxs("div",{className:"absolute top-full right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[180px] z-50",children:[b.jsxs("button",{onClick:async()=>{y(!1),await x()},className:"w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center gap-2 text-sm",children:[b.jsx("svg",{className:"w-4 h-4 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"})}),b.jsxs("div",{children:[b.jsx("div",{className:"font-medium text-slate-700 text-xs",children:"Indicações"}),b.jsx("div",{className:"text-[10px] text-slate-500",children:"Funil da Confiança"})]})]}),b.jsx("div",{className:"border-t border-slate-100 my-1"}),b.jsx("div",{className:"px-3 py-1.5 text-[10px] text-slate-400 italic",children:"Mais raias em breve..."})]})]})]}),b.jsx("div",{ref:l,className:"w-full h-full bg-white",style:{minHeight:"500px"}})]})}),E2=[{name:"Azul",fill:"#dbeafe",stroke:"#3b82f6"},{name:"Verde",fill:"#dcfce7",stroke:"#22c55e"},{name:"Roxo",fill:"#ede9fe",stroke:"#8b5cf6"},{name:"Laranja",fill:"#ffedd5",stroke:"#f97316"},{name:"Cyan",fill:"#cffafe",stroke:"#06b6d4"},{name:"Rosa",fill:"#fce7f3",stroke:"#ec4899"},{name:"Amarelo",fill:"#fef3c7",stroke:"#f59e0b"},{name:"Vermelho",fill:"#fecaca",stroke:"#ef4444"},{name:"Teal",fill:"#ccfbf1",stroke:"#14b8a6"},{name:"Indigo",fill:"#e0e7ff",stroke:"#6366f1"}],Uo=e=>{var t,n;return(n=(t=e==null?void 0:e.businessObject)==null?void 0:t.name)==null?void 0:n.startsWith("__IMAGE__:")},x2=e=>{try{if(Uo(e)){const t=e.businessObject.name.substring(10);return JSON.parse(t)}}catch(t){console.error("Erro ao parsear dados de imagem:",t)}return null};function P2({element:e,onUpdate:t,onColorChange:n}){var P;const[i,o]=q.useState(""),[a,r]=q.useState(""),[s,c]=q.useState(null),[d,l]=q.useState(null);q.useEffect(()=>{if(e){const x=e.businessObject;if(Uo(e)){const N=x2(e);l(N),o((N==null?void 0:N.displayName)||"Imagem")}else l(null),o(x.name||"");const I=x.documentation;I&&I.length>0?r(I[0].text||""):r(""),c(null)}else o(""),r(""),c(null),l(null)},[e]);const p=x=>{c(x),n&&e&&n(e,x)},u=x=>{o(x.target.value)},m=()=>{if(t&&e)if(d){const x={...d,displayName:i};t(e,{name:"__IMAGE__:"+JSON.stringify(x)})}else t(e,{name:i})},h=()=>{m()},g=x=>{x.key==="Enter"&&(x.preventDefault(),m(),x.target.blur())},f=x=>{r(x.target.value)},w=()=>{t&&e&&t(e,{documentation:a?[{text:a}]:[]})},E=()=>{w()},v=x=>{var R;if(!x)return"";if(Uo(x))return"Imagem";const I=x.type||((R=x.businessObject)==null?void 0:R.$type)||"";return{"bpmn:Task":"Tarefa","bpmn:UserTask":"Tarefa de Usuário","bpmn:ServiceTask":"Tarefa de Serviço","bpmn:ScriptTask":"Tarefa de Script","bpmn:ManualTask":"Tarefa Manual","bpmn:BusinessRuleTask":"Tarefa de Regra","bpmn:SendTask":"Tarefa de Envio","bpmn:ReceiveTask":"Tarefa de Recebimento","bpmn:StartEvent":"Evento de Início","bpmn:EndEvent":"Evento de Fim","bpmn:IntermediateCatchEvent":"Evento Intermediário","bpmn:IntermediateThrowEvent":"Evento Intermediário","bpmn:BoundaryEvent":"Evento de Limite","bpmn:ExclusiveGateway":"Gateway Exclusivo","bpmn:ParallelGateway":"Gateway Paralelo","bpmn:InclusiveGateway":"Gateway Inclusivo","bpmn:EventBasedGateway":"Gateway de Evento","bpmn:SubProcess":"Sub-Processo","bpmn:CallActivity":"Atividade de Chamada","bpmn:Participant":"Pool","bpmn:Lane":"Raia","bpmn:SequenceFlow":"Fluxo de Sequência","bpmn:MessageFlow":"Fluxo de Mensagem","bpmn:DataObject":"Objeto de Dados","bpmn:DataStore":"Armazém de Dados","bpmn:TextAnnotation":"Anotação"}[I]||I.replace("bpmn:","")},y=x=>{var N;if(!x)return null;if(Uo(x))return b.jsxs("svg",{className:"w-5 h-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[b.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",ry:"2",strokeWidth:2}),b.jsx("circle",{cx:"8.5",cy:"8.5",r:"1.5",fill:"currentColor"}),b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 15l-5-5L5 21"})]});const I=x.type||((N=x.businessObject)==null?void 0:N.$type)||"";return I.includes("Task")?b.jsx("svg",{className:"w-5 h-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})}):I.includes("Event")?b.jsx("svg",{className:"w-5 h-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("circle",{cx:"12",cy:"12",r:"9",strokeWidth:2})}):I.includes("Gateway")?b.jsx("svg",{className:"w-5 h-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 3l9 9-9 9-9-9 9-9z"})}):I.includes("SubProcess")?b.jsxs("svg",{className:"w-5 h-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[b.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",strokeWidth:2}),b.jsx("path",{strokeLinecap:"round",strokeWidth:2,d:"M12 8v8M8 12h8"})]}):I.includes("Participant")||I.includes("Lane")?b.jsxs("svg",{className:"w-5 h-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[b.jsx("rect",{x:"2",y:"4",width:"20",height:"16",rx:"1",strokeWidth:2}),b.jsx("line",{x1:"6",y1:"4",x2:"6",y2:"20",strokeWidth:2})]}):b.jsx("svg",{className:"w-5 h-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 6h16M4 12h16M4 18h16"})})};return e?b.jsxs("div",{className:"w-80 bg-white border-l border-slate-200 flex flex-col overflow-hidden",children:[b.jsx("div",{className:"p-4 border-b border-slate-200 bg-slate-50",children:b.jsx("h2",{className:"font-semibold text-slate-700",children:"Propriedades"})}),b.jsx("div",{className:"p-4 border-b border-slate-200 bg-fyness-light",children:b.jsxs("div",{className:"flex items-center gap-3",children:[b.jsx("div",{className:"w-10 h-10 bg-fyness-primary/10 rounded-lg flex items-center justify-center text-fyness-primary",children:y(e)}),b.jsxs("div",{children:[b.jsx("p",{className:"text-xs text-slate-500 uppercase tracking-wide",children:"Tipo"}),b.jsx("p",{className:"font-medium text-slate-700",children:v(e)})]})]})}),b.jsxs("div",{className:"flex-1 overflow-y-auto p-4 space-y-4",children:[b.jsxs("div",{children:[b.jsx("label",{className:"block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1",children:"ID"}),b.jsx("input",{type:"text",value:e.id||"",readOnly:!0,className:"w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600 cursor-not-allowed"})]}),b.jsxs("div",{children:[b.jsx("label",{className:"block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1",children:"Nome"}),b.jsx("input",{type:"text",value:i,onChange:u,onBlur:h,onKeyDown:g,placeholder:"Digite o nome do elemento...",className:"w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"}),b.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Pressione Enter para salvar"})]}),b.jsxs("div",{children:[b.jsx("label",{className:"block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1",children:"Documentação"}),b.jsx("textarea",{value:a,onChange:f,onBlur:E,placeholder:"Adicione uma descrição ou notas...",rows:4,className:"w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent resize-none"}),b.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Clique fora para salvar"})]}),e.type&&!e.type.includes("Flow")&&!e.type.includes("Association")&&b.jsxs("div",{className:"pt-4 border-t border-slate-200",children:[b.jsx("label",{className:"block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2",children:"Cor do Elemento"}),b.jsx("div",{className:"grid grid-cols-5 gap-2",children:E2.map(x=>b.jsx("button",{onClick:()=>p(x),title:x.name,className:`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${(s==null?void 0:s.name)===x.name?"ring-2 ring-offset-2 ring-slate-400":""}`,style:{backgroundColor:x.fill,borderColor:x.stroke}},x.name))}),s&&b.jsxs("p",{className:"text-xs text-slate-500 mt-2 text-center",children:["Cor selecionada: ",s.name]})]}),((P=e.type)==null?void 0:P.includes("SequenceFlow"))&&b.jsxs("div",{className:"pt-4 border-t border-slate-200",children:[b.jsx("label",{className:"block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1",children:"Condição (Expressão)"}),b.jsx("input",{type:"text",placeholder:"Ex: ${approved == true}",className:"w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent font-mono"})]})]}),b.jsx("div",{className:"p-4 border-t border-slate-200 bg-slate-50",children:b.jsx("p",{className:"text-xs text-slate-400 text-center",children:"Use o canvas para editar visualmente"})})]}):b.jsxs("div",{className:"w-80 bg-white border-l border-slate-200 flex flex-col",children:[b.jsx("div",{className:"p-4 border-b border-slate-200 bg-slate-50",children:b.jsx("h2",{className:"font-semibold text-slate-700",children:"Propriedades"})}),b.jsx("div",{className:"flex-1 flex items-center justify-center p-6",children:b.jsxs("div",{className:"text-center text-slate-400",children:[b.jsx("svg",{className:"w-12 h-12 mx-auto mb-3 text-slate-300",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"})}),b.jsx("p",{className:"text-sm",children:"Selecione um elemento no diagrama para editar suas propriedades"})]})})]})}function A2(){const{id:e}=Wh(),t=Uh(),[n,i]=q.useState(null),[o,a]=q.useState(null),[r,s]=q.useState(null),[c,d]=q.useState(!1),[l,p]=q.useState(!1),[u,m]=q.useState(!1),[h,g]=q.useState(""),[f,w]=q.useState(!1),[E,v]=q.useState(!0),y=q.useRef(null),P=q.useRef(e),x=q.useRef(null),[I,N]=q.useState(!1),[R,B]=q.useState(!1),[S,k]=q.useState([]),[W,O]=q.useState(!1),[ne,me]=q.useState(""),[Pe,we]=q.useState(!0),[re,ie]=q.useState(!1),[Ee,Ae]=q.useState(""),[he,Ce]=q.useState("square"),[Ge,de]=q.useState(!1),[le,X]=q.useState(""),[Re,ke]=q.useState(!1),[st,Ye]=q.useState(!1),[tt,Dt]=q.useState(!1),[It,Ft]=q.useState("auto"),[rn,j]=q.useState(2);q.useEffect(()=>{(async()=>{const V=await lo();k(V)})()},[]);const F=q.useMemo(()=>{if(!n||!S.length)return null;const A=n.parentId?S.find(Y=>Y.id===n.parentId):null,V=S.filter(Y=>Y.parentId===n.id),oe=(Y,De=[])=>{if(!(Y!=null&&Y.parentId))return De;const bt=S.find(tr=>tr.id===Y.parentId);return bt?(De.unshift(bt),oe(bt,De)):De};return{parent:A,children:V,ancestors:oe(n),level:n.level||0,isRoot:n.isRoot||!n.parentId}},[n,S]),L=A=>{const V=[{bg:"bg-green-500",text:"text-green-600",light:"bg-green-50",border:"border-green-400"},{bg:"bg-blue-500",text:"text-blue-600",light:"bg-blue-50",border:"border-blue-400"},{bg:"bg-purple-500",text:"text-purple-600",light:"bg-purple-50",border:"border-purple-400"},{bg:"bg-orange-500",text:"text-orange-600",light:"bg-orange-50",border:"border-orange-400"},{bg:"bg-pink-500",text:"text-pink-600",light:"bg-pink-50",border:"border-pink-400"}];return V[A%V.length]};q.useEffect(()=>{(async()=>{if(v(!0),e){const V=await yf(e);V?(i(V),a(V.xml),g(V.name),y.current=V.xml,P.current=V.id):(console.warn("Projeto não encontrado:",e),t("/"))}else{const V=Kc;a(V),g("Novo Diagrama"),y.current=V}v(!1)})()},[e,t]),q.useEffect(()=>{o&&y.current&&p(o!==y.current)},[o]),q.useEffect(()=>{if(!o||!l||!n)return;const A=setTimeout(async()=>{d(!0);try{P.current&&(await fi(P.current,{xml:o,name:h})?(y.current=o,p(!1),m(!0),setTimeout(()=>m(!1),2e3)):(X("Falha ao salvar automaticamente."),de(!0),setTimeout(()=>de(!1),4e3)))}catch(V){console.error("Erro no auto-save:",V),X("Erro de conexão ao salvar."),de(!0),setTimeout(()=>de(!1),4e3)}finally{d(!1)}},500);return()=>clearTimeout(A)},[o,l,n,h]);const H=q.useCallback(A=>{a(A)},[]),M=q.useCallback(A=>{s(A)},[]),$=q.useCallback(async()=>{if(o){d(!0);try{if(P.current&&n)await fi(P.current,{xml:o,name:h})&&(y.current=o,p(!1));else{const A=await Zc({name:h,xml:o,isTemplate:!1});A&&(i(A),P.current=A.id,y.current=o,p(!1),window.history.replaceState(null,"",`/editor/${A.id}`))}m(!0),setTimeout(()=>m(!1),2e3)}catch(A){console.error("Erro ao salvar:",A),X("Erro ao salvar projeto."),de(!0),setTimeout(()=>de(!1),4e3)}finally{d(!1)}}},[o,n,h]);q.useEffect(()=>{const A=V=>{(V.ctrlKey||V.metaKey)&&V.key==="s"&&(V.preventDefault(),$())};return window.addEventListener("keydown",A),()=>window.removeEventListener("keydown",A)},[$]),q.useEffect(()=>{const A=V=>{l&&(V.preventDefault(),V.returnValue="")};return window.addEventListener("beforeunload",A),()=>window.removeEventListener("beforeunload",A)},[l]);const ee=q.useCallback(()=>{l?window.confirm("Você tem alterações não salvas. Deseja sair sem salvar?")&&t("/"):t("/")},[l,t]),_e=q.useCallback(()=>{x.current&&x.current.undo()},[]),nt=q.useCallback(()=>{x.current&&x.current.redo()},[]),We=async()=>{P.current&&n&&await fi(P.current,{name:h}),w(!1)},Ke=q.useCallback((A,V)=>{x.current&&x.current.setElementColor(A,V)},[]),Ht=q.useCallback((A,V)=>{x.current&&x.current.updateElementProperties(A,V)},[]),sn=async()=>{if(!ne.trim()||!n)return;if(await Zc({name:ne.trim(),xml:Kc,companyId:n.companyId,parentId:n.id,level:(n.level||0)+1,isRoot:!1,isTemplate:!1})){const V=await lo();k(V),O(!1),me("")}},Ot=async A=>{if(!n||!A||!x.current)return;if(x.current.hasFlowElement(A.id)){alert("Este fluxo já foi adicionado ao canvas!");return}if(x.current.addCallActivity(A.id,A.name)){const oe=(A.level||0)+1;if(await fi(n.id,{parentId:A.id,level:oe,isRoot:!1})){i(bt=>({...bt,parentId:A.id,level:oe,isRoot:!1}));const De=await lo();k(De)}}},cn=async()=>{if(!n||!x.current)return;if(F!=null&&F.parent&&x.current.removeFlowElement(F.parent.id),await fi(n.id,{parentId:null,level:0,isRoot:!0})){i(oe=>({...oe,parentId:null,level:0,isRoot:!0}));const V=await lo();k(V)}},hi=async(A="auto",V=2)=>{if(x.current){N(!0),Dt(!1);try{const oe=await x.current.saveSVG();if(!oe)throw new Error("Não foi possível exportar o diagrama");const Y=document.createElement("canvas"),De=Y.getContext("2d"),bt=new Image,tr=new Blob([oe],{type:"image/svg+xml;charset=utf-8"}),Hc=URL.createObjectURL(tr);await new Promise((qh,Hh)=>{bt.onload=()=>{Y.width=bt.width*V,Y.height=bt.height*V,De.fillStyle="#ffffff",De.fillRect(0,0,Y.width,Y.height),De.drawImage(bt,0,0,Y.width,Y.height);const zh=Y.toDataURL("image/png");let nr;A==="auto"?nr=Y.width>Y.height?"landscape":"portrait":nr=A;const zc=new Yh({orientation:nr,unit:"px",format:[Y.width,Y.height]});zc.addImage(zh,"PNG",0,0,Y.width,Y.height),zc.save(`${h.replace(/\s+/g,"_")}.pdf`),URL.revokeObjectURL(Hc),qh()},bt.onerror=Hh,bt.src=Hc})}catch(oe){console.error("Erro ao exportar PDF:",oe),X("Erro ao gerar PDF. Tente novamente."),de(!0),setTimeout(()=>de(!1),4e3)}finally{N(!1)}}};return E||!o?b.jsx("div",{className:"h-screen flex items-center justify-center bg-slate-100",children:b.jsxs("div",{className:"flex flex-col items-center gap-3",children:[b.jsx("div",{className:"w-10 h-10 border-4 border-fyness-primary border-t-transparent rounded-full animate-spin"}),b.jsx("span",{className:"text-slate-600",children:"Carregando editor..."})]})}):b.jsxs("div",{className:"h-screen flex flex-col bg-slate-100 overflow-hidden",children:[b.jsx("header",{className:"bg-white border-b border-slate-200 shadow-sm flex-shrink-0 z-30",children:b.jsxs("div",{className:"px-4 py-3 flex items-center justify-between",children:[b.jsxs("div",{className:"flex items-center gap-4",children:[b.jsx("button",{onClick:ee,className:"p-2 hover:bg-slate-100 rounded-lg transition-colors",title:"Voltar ao Dashboard",children:b.jsx("svg",{className:"w-5 h-5 text-slate-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 19l-7-7m0 0l7-7m-7 7h18"})})}),b.jsxs("div",{className:"flex items-center gap-2",children:[b.jsx("div",{className:"w-8 h-8 bg-gradient-to-br from-fyness-primary to-fyness-secondary rounded-lg flex items-center justify-center",children:b.jsx("svg",{className:"w-4 h-4 text-white",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"})})}),b.jsxs("button",{onClick:()=>w(!0),className:"group flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors",children:[b.jsx("h1",{className:"text-lg font-semibold text-slate-800",children:h}),b.jsx("svg",{className:"w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})]}),l&&b.jsx("span",{className:"text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full",children:"Não salvo"})]})]}),b.jsxs("div",{className:"flex items-center gap-1",children:[b.jsx("button",{onClick:_e,disabled:!Re,className:"p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed",title:"Desfazer (Ctrl+Z)",children:b.jsx("svg",{className:"w-5 h-5 text-slate-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"})})}),b.jsx("button",{onClick:nt,disabled:!st,className:"p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed",title:"Refazer (Ctrl+Shift+Z)",children:b.jsx("svg",{className:"w-5 h-5 text-slate-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4"})})})]}),b.jsxs("div",{className:"flex items-center gap-2",children:[b.jsx("button",{onClick:()=>Dt(!0),disabled:I,className:"flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed",title:"Exportar PDF",children:I?b.jsxs(b.Fragment,{children:[b.jsx("div",{className:"w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"}),b.jsx("span",{children:"Gerando..."})]}):b.jsxs(b.Fragment,{children:[b.jsx("svg",{className:"w-4 h-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"})}),b.jsx("span",{children:"PDF"})]})}),b.jsx("button",{onClick:$,disabled:c||!l,className:"flex items-center gap-2 px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium",children:c?b.jsxs(b.Fragment,{children:[b.jsx("div",{className:"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"}),b.jsx("span",{children:"Salvando..."})]}):b.jsxs(b.Fragment,{children:[b.jsx("svg",{className:"w-4 h-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"})}),b.jsx("span",{children:"Salvar"})]})})]})]})}),F&&(F.ancestors.length>0||F.children.length>0)&&b.jsxs("div",{className:"bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto",children:[b.jsx("span",{className:"text-xs text-slate-500 flex-shrink-0",children:"Hierarquia:"}),F.ancestors.map((A,V)=>b.jsxs("span",{className:"flex items-center gap-1 flex-shrink-0",children:[b.jsx("button",{onClick:()=>t(`/editor/${A.id}`),className:`text-xs px-2 py-1 rounded ${L(V).light} ${L(V).text} hover:opacity-80 transition-opacity`,children:A.name}),b.jsx("svg",{className:"w-3 h-3 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})})]},A.id)),b.jsxs("span",{className:`text-xs px-2 py-1 rounded font-semibold ${L(F.level).bg} text-white flex-shrink-0`,children:[h," (Atual)"]}),F.children.length>0&&b.jsxs(b.Fragment,{children:[b.jsx("svg",{className:"w-3 h-3 text-slate-400 flex-shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})}),b.jsxs("span",{className:"text-xs text-slate-500 flex-shrink-0",children:[F.children.length," fluxo",F.children.length!==1?"s":""," dependente",F.children.length!==1?"s":""]})]})]}),b.jsxs("div",{className:"flex-1 flex overflow-hidden",style:{height:F&&(F.ancestors.length>0||F.children.length>0)?"calc(100vh - 104px)":"calc(100vh - 64px)"},children:[b.jsx("div",{className:`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${R?"w-64":"w-0"} overflow-hidden`,children:R&&b.jsxs(b.Fragment,{children:[b.jsxs("div",{className:"p-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50",children:[b.jsxs("div",{className:"flex items-center gap-2",children:[b.jsx("div",{className:"w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center",children:b.jsx("svg",{className:"w-4 h-4 text-white",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"})})}),b.jsx("h3",{className:"font-bold text-slate-800 text-sm",children:"Fluxos"})]}),b.jsx("button",{onClick:()=>B(!1),className:"p-1 hover:bg-white/50 rounded",children:b.jsx("svg",{className:"w-4 h-4 text-slate-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),b.jsxs("div",{className:"flex-1 overflow-y-auto",children:[b.jsx("div",{className:"p-3 bg-blue-50 border-b border-blue-100",children:b.jsxs("p",{className:"text-[11px] text-blue-700",children:[b.jsx("strong",{children:"Clique"})," em um fluxo para adicioná-lo ao canvas como pré-requisito deste fluxo."]})}),b.jsxs("div",{className:"p-2",children:[b.jsx("h4",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1",children:"Adicionar Pré-requisito"}),b.jsxs("div",{className:"space-y-1",children:[S.filter(A=>A.id!==(n==null?void 0:n.id)&&A.companyId===(n==null?void 0:n.companyId)).map(A=>{const V=A.id===(n==null?void 0:n.parentId);return b.jsx("button",{onClick:()=>!V&&Ot(A),disabled:V,className:`w-full p-2 rounded-lg border-2 text-left transition-all group ${V?"bg-amber-50 border-amber-300 cursor-default":"bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50 hover:shadow-md cursor-pointer"}`,children:b.jsxs("div",{className:"flex items-center gap-2",children:[b.jsx("div",{className:`w-8 h-8 rounded border-2 flex items-center justify-center flex-shrink-0 ${V?"bg-amber-100 border-amber-400":"bg-slate-50 border-slate-300 group-hover:bg-amber-100 group-hover:border-amber-400"}`,children:b.jsx("div",{className:`w-5 h-5 rounded-sm border ${V?"border-amber-500":"border-slate-400 group-hover:border-amber-500"}`,children:b.jsx("div",{className:`w-full h-full rounded-sm border ${V?"border-amber-400":"border-slate-300 group-hover:border-amber-400"}`})})}),b.jsxs("div",{className:"flex-1 min-w-0",children:[b.jsx("p",{className:"text-xs font-semibold text-slate-700 truncate",children:A.name}),V&&b.jsx("p",{className:"text-[10px] text-amber-600 font-medium",children:"Pré-requisito atual"})]}),!V&&b.jsx("svg",{className:"w-4 h-4 text-slate-300 group-hover:text-amber-500 flex-shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v16m8-8H4"})})]})},A.id)}),S.filter(A=>A.id!==(n==null?void 0:n.id)&&A.companyId===(n==null?void 0:n.companyId)).length===0&&b.jsx("div",{className:"p-3 bg-slate-50 rounded-lg text-center",children:b.jsx("p",{className:"text-xs text-slate-500",children:"Nenhum outro fluxo disponível"})})]})]}),b.jsx("div",{className:"border-t border-slate-200 my-2"}),b.jsxs("div",{className:"p-2",children:[b.jsx("h4",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1",children:"Status Atual"}),F!=null&&F.parent?b.jsxs("div",{className:"p-3 bg-amber-50 rounded-lg border border-amber-200",children:[b.jsxs("div",{className:"flex items-center justify-between mb-2",children:[b.jsx("span",{className:"text-[10px] font-bold text-amber-700 uppercase",children:"Pré-requisito:"}),b.jsx("button",{onClick:cn,className:"text-[10px] text-red-500 hover:text-red-700 hover:underline",children:"Remover"})]}),b.jsxs("button",{onClick:()=>t(`/editor/${F.parent.id}`),className:"w-full p-2 bg-white rounded border border-amber-300 hover:shadow-md transition-all text-left",children:[b.jsx("p",{className:"text-sm font-bold text-slate-800",children:F.parent.name}),b.jsx("p",{className:"text-[10px] text-slate-500",children:"Clique para abrir"})]})]}):b.jsxs("div",{className:"p-3 bg-green-50 rounded-lg border border-green-200",children:[b.jsxs("div",{className:"flex items-center gap-2",children:[b.jsx("div",{className:"w-3 h-3 bg-green-500 rounded-full"}),b.jsx("span",{className:"text-sm font-bold text-green-700",children:"Fluxo Raiz"})]}),b.jsx("p",{className:"text-[10px] text-green-600 mt-1",children:"Este fluxo não tem pré-requisitos"})]})]}),(F==null?void 0:F.children.length)>0&&b.jsxs("div",{className:"p-2 border-t border-slate-200",children:[b.jsxs("h4",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1",children:["Fluxos que dependem deste (",F.children.length,")"]}),b.jsx("div",{className:"space-y-1",children:F.children.map(A=>b.jsx("button",{onClick:()=>t(`/editor/${A.id}`),className:"w-full p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 text-left transition-all",children:b.jsx("p",{className:"text-xs font-medium text-slate-700 truncate",children:A.name})},A.id))})]})]})]})}),b.jsx("div",{className:"flex-1 relative h-full",children:b.jsx(w2,{ref:x,xml:o,onXmlChange:H,onElementSelect:M,onFluxosClick:()=>B(!R),showGrid:Pe,onGridToggle:()=>we(!Pe),onAddImage:()=>ie(!0),onCommandStackChanged:({canUndo:A,canRedo:V})=>{ke(A),Ye(V)}})}),b.jsx(P2,{element:r,onUpdate:Ht,onColorChange:Ke})]}),u&&b.jsxs("div",{className:"fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in",children:[b.jsx("svg",{className:"w-5 h-5 text-green-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M5 13l4 4L19 7"})}),b.jsx("span",{children:"Projeto salvo com sucesso!"})]}),Ge&&b.jsxs("div",{className:"fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in",children:[b.jsx("svg",{className:"w-5 h-5 text-red-200",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"})}),b.jsx("span",{children:le}),b.jsx("button",{onClick:()=>{de(!1),$()},className:"ml-2 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors",children:"Tentar novamente"})]}),f&&b.jsx("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50",children:b.jsxs("div",{className:"bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden",children:[b.jsx("div",{className:"p-6 border-b border-slate-200",children:b.jsx("h3",{className:"text-lg font-semibold text-slate-800",children:"Renomear Projeto"})}),b.jsxs("div",{className:"p-6",children:[b.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-2",children:"Nome do Projeto"}),b.jsx("input",{type:"text",value:h,onChange:A=>g(A.target.value),className:"w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent",placeholder:"Digite o nome do projeto...",autoFocus:!0,onKeyDown:A=>{A.key==="Enter"&&We(),A.key==="Escape"&&w(!1)}})]}),b.jsxs("div",{className:"p-6 bg-slate-50 flex gap-3 justify-end",children:[b.jsx("button",{onClick:()=>w(!1),className:"px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors",children:"Cancelar"}),b.jsx("button",{onClick:We,disabled:!h.trim(),className:"px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed",children:"Salvar"})]})]})}),W&&b.jsx("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50",children:b.jsxs("div",{className:"bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden",children:[b.jsx("div",{className:"p-6 border-b border-slate-200",children:b.jsxs("div",{className:"flex items-center gap-3",children:[b.jsx("div",{className:"w-10 h-10 bg-fyness-primary/10 rounded-lg flex items-center justify-center",children:b.jsx("svg",{className:"w-5 h-5 text-fyness-primary",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 13l-5 5m0 0l-5-5m5 5V6"})})}),b.jsxs("div",{children:[b.jsx("h3",{className:"text-lg font-semibold text-slate-800",children:"Criar Sub-Fluxo"}),b.jsxs("p",{className:"text-sm text-slate-500",children:["Dentro de: ",h]})]})]})}),b.jsxs("div",{className:"p-6",children:[b.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-2",children:"Nome do Sub-Fluxo"}),b.jsx("input",{type:"text",value:ne,onChange:A=>me(A.target.value),className:"w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent",placeholder:"Ex: Validação de Documentos...",autoFocus:!0,onKeyDown:A=>{A.key==="Enter"&&ne.trim()&&sn(),A.key==="Escape"&&(O(!1),me(""))}}),b.jsxs("p",{className:"mt-2 text-xs text-slate-500",children:["Este fluxo será criado como dependente do fluxo atual (Nível ",((F==null?void 0:F.level)||0)+1,")"]})]}),b.jsxs("div",{className:"p-6 bg-slate-50 flex gap-3 justify-end",children:[b.jsx("button",{onClick:()=>{O(!1),me("")},className:"px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors",children:"Cancelar"}),b.jsxs("button",{onClick:sn,disabled:!ne.trim(),className:"px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",children:[b.jsx("svg",{className:"w-4 h-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v16m8-8H4"})}),"Criar Sub-Fluxo"]})]})]})}),re&&b.jsx("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50",children:b.jsxs("div",{className:"bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden",children:[b.jsx("div",{className:"p-6 border-b border-slate-200",children:b.jsxs("div",{className:"flex items-center gap-3",children:[b.jsx("div",{className:"w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center",children:b.jsxs("svg",{className:"w-5 h-5 text-green-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[b.jsx("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",ry:"2",strokeWidth:2}),b.jsx("circle",{cx:"8.5",cy:"8.5",r:"1.5",strokeWidth:2}),b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 15l-5-5L5 21"})]})}),b.jsxs("div",{children:[b.jsx("h3",{className:"text-lg font-semibold text-slate-800",children:"Adicionar Imagem"}),b.jsx("p",{className:"text-sm text-slate-500",children:"Selecione uma imagem do computador"})]})]})}),b.jsxs("div",{className:"p-6 space-y-4",children:[b.jsxs("div",{children:[b.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-2",children:"Selecionar Imagem"}),b.jsxs("div",{className:"relative",children:[b.jsx("input",{type:"file",accept:"image/*",onChange:A=>{var oe;const V=(oe=A.target.files)==null?void 0:oe[0];if(V){if(V.size>2*1024*1024){alert("Imagem muito grande! Tamanho máximo: 2MB."),A.target.value="";return}const Y=new FileReader;Y.onload=De=>{Ae(De.target.result)},Y.readAsDataURL(V)}},className:"hidden",id:"image-upload"}),b.jsx("label",{htmlFor:"image-upload",className:"flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors",children:Ee?b.jsxs("div",{className:"flex items-center gap-2 text-green-600",children:[b.jsx("svg",{className:"w-5 h-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M5 13l4 4L19 7"})}),b.jsx("span",{className:"text-sm font-medium",children:"Imagem selecionada - clique para trocar"})]}):b.jsxs(b.Fragment,{children:[b.jsx("svg",{className:"w-8 h-8 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"})}),b.jsxs("div",{className:"text-center",children:[b.jsx("p",{className:"text-sm font-medium text-slate-700",children:"Clique para selecionar"}),b.jsx("p",{className:"text-xs text-slate-500",children:"PNG, JPG, GIF até 2MB"})]})]})})]})]}),b.jsxs("div",{children:[b.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-2",children:"Formato"}),b.jsxs("div",{className:"grid grid-cols-3 gap-3",children:[b.jsxs("button",{type:"button",onClick:()=>Ce("square"),className:`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${he==="square"?"border-green-500 bg-green-50":"border-slate-200 hover:border-slate-300"}`,children:[b.jsx("div",{className:"w-10 h-10 bg-slate-300 rounded-none"}),b.jsx("span",{className:"text-xs font-medium text-slate-700",children:"Quadrado"})]}),b.jsxs("button",{type:"button",onClick:()=>Ce("rounded"),className:`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${he==="rounded"?"border-green-500 bg-green-50":"border-slate-200 hover:border-slate-300"}`,children:[b.jsx("div",{className:"w-10 h-10 bg-slate-300 rounded-lg"}),b.jsx("span",{className:"text-xs font-medium text-slate-700",children:"Arredondado"})]}),b.jsxs("button",{type:"button",onClick:()=>Ce("circle"),className:`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${he==="circle"?"border-green-500 bg-green-50":"border-slate-200 hover:border-slate-300"}`,children:[b.jsx("div",{className:"w-10 h-10 bg-slate-300 rounded-full"}),b.jsx("span",{className:"text-xs font-medium text-slate-700",children:"Redondo"})]})]})]}),Ee&&b.jsxs("div",{className:"mt-4",children:[b.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-2",children:"Pré-visualização"}),b.jsx("div",{className:"border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center justify-center",children:b.jsx("img",{src:Ee,alt:"Preview",className:`w-24 h-24 object-cover ${he==="circle"?"rounded-full":he==="rounded"?"rounded-xl":"rounded-none"}`})}),b.jsx("p",{className:"text-xs text-slate-500 mt-2 text-center",children:"Arraste os cantos da imagem no canvas para redimensionar"})]})]}),b.jsxs("div",{className:"p-6 bg-slate-50 flex gap-3 justify-end",children:[b.jsx("button",{onClick:()=>{ie(!1),Ae(""),Ce("square")},className:"px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors",children:"Cancelar"}),b.jsxs("button",{onClick:()=>{x.current&&Ee&&x.current.addImageOverlay(Ee,300,300,he),ie(!1),Ae(""),Ce("square")},disabled:!Ee,className:"px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",children:[b.jsx("svg",{className:"w-4 h-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v16m8-8H4"})}),"Adicionar Imagem"]})]})]})}),tt&&b.jsx("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50",children:b.jsxs("div",{className:"bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden",children:[b.jsx("div",{className:"p-6 border-b border-slate-200",children:b.jsxs("div",{className:"flex items-center gap-3",children:[b.jsx("div",{className:"w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center",children:b.jsx("svg",{className:"w-5 h-5 text-red-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"})})}),b.jsxs("div",{children:[b.jsx("h3",{className:"text-lg font-semibold text-slate-800",children:"Exportar PDF"}),b.jsx("p",{className:"text-sm text-slate-500",children:"Configure as opções de exportação"})]})]})}),b.jsxs("div",{className:"p-6 space-y-5",children:[b.jsxs("div",{children:[b.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-2",children:"Orientação"}),b.jsx("div",{className:"grid grid-cols-3 gap-3",children:[{value:"auto",label:"Auto",icon:"M4 5h16M4 12h16M4 19h16"},{value:"landscape",label:"Paisagem",icon:"M3 6h18v12H3z"},{value:"portrait",label:"Retrato",icon:"M6 3h12v18H6z"}].map(A=>b.jsxs("button",{onClick:()=>Ft(A.value),className:`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${It===A.value?"border-red-500 bg-red-50":"border-slate-200 hover:border-slate-300"}`,children:[b.jsx("svg",{className:"w-8 h-8 text-slate-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.5,children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:A.icon})}),b.jsx("span",{className:"text-xs font-medium text-slate-700",children:A.label})]},A.value))})]}),b.jsxs("div",{children:[b.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-2",children:"Qualidade"}),b.jsx("div",{className:"grid grid-cols-3 gap-3",children:[{value:1,label:"Normal",desc:"Menor arquivo"},{value:2,label:"Alta",desc:"Recomendado"},{value:3,label:"Ultra",desc:"Maior qualidade"}].map(A=>b.jsxs("button",{onClick:()=>j(A.value),className:`p-3 border-2 rounded-lg flex flex-col items-center gap-1 transition-all ${rn===A.value?"border-red-500 bg-red-50":"border-slate-200 hover:border-slate-300"}`,children:[b.jsx("span",{className:"text-sm font-semibold text-slate-700",children:A.label}),b.jsx("span",{className:"text-[10px] text-slate-500",children:A.desc})]},A.value))})]})]}),b.jsxs("div",{className:"p-6 bg-slate-50 flex gap-3 justify-end",children:[b.jsx("button",{onClick:()=>Dt(!1),className:"px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors",children:"Cancelar"}),b.jsxs("button",{onClick:()=>hi(It,rn),className:"px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2",children:[b.jsx("svg",{className:"w-4 h-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:b.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Exportar PDF"]})]})]})}),b.jsxs("div",{className:"fixed bottom-4 right-4 text-xs text-slate-400 z-20",children:[b.jsx("kbd",{className:"px-1.5 py-0.5 bg-slate-200 rounded text-slate-600",children:"Ctrl"})," + ",b.jsx("kbd",{className:"px-1.5 py-0.5 bg-slate-200 rounded text-slate-600",children:"S"})," para salvar"]})]})}export{A2 as default};
