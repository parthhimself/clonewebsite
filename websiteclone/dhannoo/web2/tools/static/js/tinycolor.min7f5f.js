!function(t){var e=/^\s+/,r=/\s+$/,n=0,a=t.round,i=t.min,s=t.max,o=t.random;function f(o,h){if(h=h||{},(o=o||"")instanceof f)return o;if(!(this instanceof f))return new f(o,h);var l=function(n){var a={r:0,g:0,b:0},o=1,f=null,h=null,l=null,u=!1,c=!1;"string"==typeof n&&(n=function(t){t=t.replace(e,"").replace(r,"").toLowerCase();var n,a=!1;if(H[t])t=H[t],a=!0;else if("transparent"==t)return{r:0,g:0,b:0,a:0,format:"name"};if(n=O.rgb.exec(t))return{r:n[1],g:n[2],b:n[3]};if(n=O.rgba.exec(t))return{r:n[1],g:n[2],b:n[3],a:n[4]};if(n=O.hsl.exec(t))return{h:n[1],s:n[2],l:n[3]};if(n=O.hsla.exec(t))return{h:n[1],s:n[2],l:n[3],a:n[4]};if(n=O.hsv.exec(t))return{h:n[1],s:n[2],v:n[3]};if(n=O.hsva.exec(t))return{h:n[1],s:n[2],v:n[3],a:n[4]};if(n=O.hex8.exec(t))return{r:M(n[1]),g:M(n[2]),b:M(n[3]),a:z(n[4]),format:a?"name":"hex8"};if(n=O.hex6.exec(t))return{r:M(n[1]),g:M(n[2]),b:M(n[3]),format:a?"name":"hex"};if(n=O.hex4.exec(t))return{r:M(n[1]+""+n[1]),g:M(n[2]+""+n[2]),b:M(n[3]+""+n[3]),a:z(n[4]+""+n[4]),format:a?"name":"hex8"};if(n=O.hex3.exec(t))return{r:M(n[1]+""+n[1]),g:M(n[2]+""+n[2]),b:M(n[3]+""+n[3]),format:a?"name":"hex"};return!1}(n));"object"==typeof n&&(P(n.r)&&P(n.g)&&P(n.b)?(g=n.r,b=n.g,d=n.b,a={r:255*C(g,255),g:255*C(b,255),b:255*C(d,255)},u=!0,c="%"===String(n.r).substr(-1)?"prgb":"rgb"):P(n.h)&&P(n.s)&&P(n.v)?(f=L(n.s),h=L(n.v),a=function(e,r,n){e=6*C(e,360),r=C(r,100),n=C(n,100);var a=t.floor(e),i=e-a,s=n*(1-r),o=n*(1-i*r),f=n*(1-(1-i)*r),h=a%6;return{r:255*[n,o,s,s,f,n][h],g:255*[f,n,n,o,s,s][h],b:255*[s,s,f,n,n,o][h]}}(n.h,f,h),u=!0,c="hsv"):P(n.h)&&P(n.s)&&P(n.l)&&(f=L(n.s),l=L(n.l),a=function(t,e,r){var n,a,i;function s(t,e,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?t+6*(e-t)*r:r<.5?e:r<2/3?t+(e-t)*(2/3-r)*6:t}if(t=C(t,360),e=C(e,100),r=C(r,100),0===e)n=a=i=r;else{var o=r<.5?r*(1+e):r+e-r*e,f=2*r-o;n=s(f,o,t+1/3),a=s(f,o,t),i=s(f,o,t-1/3)}return{r:255*n,g:255*a,b:255*i}}(n.h,f,l),u=!0,c="hsl"),n.hasOwnProperty("a")&&(o=n.a));var g,b,d;return o=F(o),{ok:u,format:n.format||c,r:i(255,s(a.r,0)),g:i(255,s(a.g,0)),b:i(255,s(a.b,0)),a:o}}(o);this._originalInput=o,this._r=l.r,this._g=l.g,this._b=l.b,this._a=l.a,this._roundA=a(100*this._a)/100,this._format=h.format||l.format,this._gradientType=h.gradientType,this._r<1&&(this._r=a(this._r)),this._g<1&&(this._g=a(this._g)),this._b<1&&(this._b=a(this._b)),this._ok=l.ok,this._tc_id=n++}function h(t,e,r){t=C(t,255),e=C(e,255),r=C(r,255);var n,a,o=s(t,e,r),f=i(t,e,r),h=(o+f)/2;if(o==f)n=a=0;else{var l=o-f;switch(a=h>.5?l/(2-o-f):l/(o+f),o){case t:n=(e-r)/l+(e<r?6:0);break;case e:n=(r-t)/l+2;break;case r:n=(t-e)/l+4}n/=6}return{h:n,s:a,l:h}}function l(t,e,r){t=C(t,255),e=C(e,255),r=C(r,255);var n,a,o=s(t,e,r),f=i(t,e,r),h=o,l=o-f;if(a=0===o?0:l/o,o==f)n=0;else{switch(o){case t:n=(e-r)/l+(e<r?6:0);break;case e:n=(r-t)/l+2;break;case r:n=(t-e)/l+4}n/=6}return{h:n,s:a,v:h}}function u(t,e,r,n){var i=[I(a(t).toString(16)),I(a(e).toString(16)),I(a(r).toString(16))];return n&&i[0].charAt(0)==i[0].charAt(1)&&i[1].charAt(0)==i[1].charAt(1)&&i[2].charAt(0)==i[2].charAt(1)?i[0].charAt(0)+i[1].charAt(0)+i[2].charAt(0):i.join("")}function c(t,e,r,n){return[I(N(n)),I(a(t).toString(16)),I(a(e).toString(16)),I(a(r).toString(16))].join("")}function g(t,e){e=0===e?0:e||10;var r=f(t).toHsl();return r.s-=e/100,r.s=q(r.s),f(r)}function b(t,e){e=0===e?0:e||10;var r=f(t).toHsl();return r.s+=e/100,r.s=q(r.s),f(r)}function d(t){return f(t).desaturate(100)}function _(t,e){e=0===e?0:e||10;var r=f(t).toHsl();return r.l+=e/100,r.l=q(r.l),f(r)}function p(t,e){e=0===e?0:e||10;var r=f(t).toRgb();return r.r=s(0,i(255,r.r-a(-e/100*255))),r.g=s(0,i(255,r.g-a(-e/100*255))),r.b=s(0,i(255,r.b-a(-e/100*255))),f(r)}function m(t,e){e=0===e?0:e||10;var r=f(t).toHsl();return r.l-=e/100,r.l=q(r.l),f(r)}function v(t,e){var r=f(t).toHsl(),n=(r.h+e)%360;return r.h=n<0?360+n:n,f(r)}function y(t){var e=f(t).toHsl();return e.h=(e.h+180)%360,f(e)}function A(t){var e=f(t).toHsl(),r=e.h;return[f(t),f({h:(r+120)%360,s:e.s,l:e.l}),f({h:(r+240)%360,s:e.s,l:e.l})]}function x(t){var e=f(t).toHsl(),r=e.h;return[f(t),f({h:(r+90)%360,s:e.s,l:e.l}),f({h:(r+180)%360,s:e.s,l:e.l}),f({h:(r+270)%360,s:e.s,l:e.l})]}function k(t){var e=f(t).toHsl(),r=e.h;return[f(t),f({h:(r+72)%360,s:e.s,l:e.l}),f({h:(r+216)%360,s:e.s,l:e.l})]}function w(t,e,r){e=e||6,r=r||30;var n=f(t).toHsl(),a=360/r,i=[f(t)];for(n.h=(n.h-(a*e>>1)+720)%360;--e;)n.h=(n.h+a)%360,i.push(f(n));return i}function S(t,e){e=e||6;for(var r=f(t).toHsv(),n=r.h,a=r.s,i=r.v,s=[],o=1/e;e--;)s.push(f({h:n,s:a,v:i})),i=(i+o)%1;return s}f.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var t=this.toRgb();return(299*t.r+587*t.g+114*t.b)/1e3},getLuminance:function(){var e,r,n,a=this.toRgb();return e=a.r/255,r=a.g/255,n=a.b/255,.2126*(e<=.03928?e/12.92:t.pow((e+.055)/1.055,2.4))+.7152*(r<=.03928?r/12.92:t.pow((r+.055)/1.055,2.4))+.0722*(n<=.03928?n/12.92:t.pow((n+.055)/1.055,2.4))},setAlpha:function(t){return this._a=F(t),this._roundA=a(100*this._a)/100,this},toHsv:function(){var t=l(this._r,this._g,this._b);return{h:360*t.h,s:t.s,v:t.v,a:this._a}},toHsvString:function(){var t=l(this._r,this._g,this._b),e=a(360*t.h),r=a(100*t.s),n=a(100*t.v);return 1==this._a?"hsv("+e+", "+r+"%, "+n+"%)":"hsva("+e+", "+r+"%, "+n+"%, "+this._roundA+")"},toHsl:function(){var t=h(this._r,this._g,this._b);return{h:360*t.h,s:t.s,l:t.l,a:this._a}},toHslString:function(){var t=h(this._r,this._g,this._b),e=a(360*t.h),r=a(100*t.s),n=a(100*t.l);return 1==this._a?"hsl("+e+", "+r+"%, "+n+"%)":"hsla("+e+", "+r+"%, "+n+"%, "+this._roundA+")"},toHex:function(t){return u(this._r,this._g,this._b,t)},toHexString:function(t){return"#"+this.toHex(t)},toHex8:function(t){return function(t,e,r,n,i){var s=[I(a(t).toString(16)),I(a(e).toString(16)),I(a(r).toString(16)),I(N(n))];if(i&&s[0].charAt(0)==s[0].charAt(1)&&s[1].charAt(0)==s[1].charAt(1)&&s[2].charAt(0)==s[2].charAt(1)&&s[3].charAt(0)==s[3].charAt(1))return s[0].charAt(0)+s[1].charAt(0)+s[2].charAt(0)+s[3].charAt(0);return s.join("")}(this._r,this._g,this._b,this._a,t)},toHex8String:function(t){return"#"+this.toHex8(t)},toRgb:function(){return{r:a(this._r),g:a(this._g),b:a(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+a(this._r)+", "+a(this._g)+", "+a(this._b)+")":"rgba("+a(this._r)+", "+a(this._g)+", "+a(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:a(100*C(this._r,255))+"%",g:a(100*C(this._g,255))+"%",b:a(100*C(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+a(100*C(this._r,255))+"%, "+a(100*C(this._g,255))+"%, "+a(100*C(this._b,255))+"%)":"rgba("+a(100*C(this._r,255))+"%, "+a(100*C(this._g,255))+"%, "+a(100*C(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":!(this._a<1)&&(R[u(this._r,this._g,this._b,!0)]||!1)},toFilter:function(t){var e="#"+c(this._r,this._g,this._b,this._a),r=e,n=this._gradientType?"GradientType = 1, ":"";if(t){var a=f(t);r="#"+c(a._r,a._g,a._b,a._a)}return"progid:DXImageTransform.Microsoft.gradient("+n+"startColorstr="+e+",endColorstr="+r+")"},toString:function(t){var e=!!t;t=t||this._format;var r=!1,n=this._a<1&&this._a>=0;return e||!n||"hex"!==t&&"hex6"!==t&&"hex3"!==t&&"hex4"!==t&&"hex8"!==t&&"name"!==t?("rgb"===t&&(r=this.toRgbString()),"prgb"===t&&(r=this.toPercentageRgbString()),"hex"!==t&&"hex6"!==t||(r=this.toHexString()),"hex3"===t&&(r=this.toHexString(!0)),"hex4"===t&&(r=this.toHex8String(!0)),"hex8"===t&&(r=this.toHex8String()),"name"===t&&(r=this.toName()),"hsl"===t&&(r=this.toHslString()),"hsv"===t&&(r=this.toHsvString()),r||this.toHexString()):"name"===t&&0===this._a?this.toName():this.toRgbString()},clone:function(){return f(this.toString())},_applyModification:function(t,e){var r=t.apply(null,[this].concat([].slice.call(e)));return this._r=r._r,this._g=r._g,this._b=r._b,this.setAlpha(r._a),this},lighten:function(){return this._applyModification(_,arguments)},brighten:function(){return this._applyModification(p,arguments)},darken:function(){return this._applyModification(m,arguments)},desaturate:function(){return this._applyModification(g,arguments)},saturate:function(){return this._applyModification(b,arguments)},greyscale:function(){return this._applyModification(d,arguments)},spin:function(){return this._applyModification(v,arguments)},_applyCombination:function(t,e){return t.apply(null,[this].concat([].slice.call(e)))},analogous:function(){return this._applyCombination(w,arguments)},complement:function(){return this._applyCombination(y,arguments)},monochromatic:function(){return this._applyCombination(S,arguments)},splitcomplement:function(){return this._applyCombination(k,arguments)},triad:function(){return this._applyCombination(A,arguments)},tetrad:function(){return this._applyCombination(x,arguments)}},f.fromRatio=function(t,e){if("object"==typeof t){var r={};for(var n in t)t.hasOwnProperty(n)&&(r[n]="a"===n?t[n]:L(t[n]));t=r}return f(t,e)},f.equals=function(t,e){return!(!t||!e)&&f(t).toRgbString()==f(e).toRgbString()},f.random=function(){return f.fromRatio({r:o(),g:o(),b:o()})},f.mix=function(t,e,r){r=0===r?0:r||50;var n=f(t).toRgb(),a=f(e).toRgb(),i=r/100;return f({r:(a.r-n.r)*i+n.r,g:(a.g-n.g)*i+n.g,b:(a.b-n.b)*i+n.b,a:(a.a-n.a)*i+n.a})},f.readability=function(e,r){var n=f(e),a=f(r);return(t.max(n.getLuminance(),a.getLuminance())+.05)/(t.min(n.getLuminance(),a.getLuminance())+.05)},f.isReadable=function(t,e,r){var n,a,i=f.readability(t,e);switch(a=!1,(n=function(t){var e,r;e=((t=t||{level:"AA",size:"small"}).level||"AA").toUpperCase(),r=(t.size||"small").toLowerCase(),"AA"!==e&&"AAA"!==e&&(e="AA");"small"!==r&&"large"!==r&&(r="small");return{level:e,size:r}}(r)).level+n.size){case"AAsmall":case"AAAlarge":a=i>=4.5;break;case"AAlarge":a=i>=3;break;case"AAAsmall":a=i>=7}return a},f.mostReadable=function(t,e,r){var n,a,i,s,o=null,h=0;a=(r=r||{}).includeFallbackColors,i=r.level,s=r.size;for(var l=0;l<e.length;l++)(n=f.readability(t,e[l]))>h&&(h=n,o=f(e[l]));return f.isReadable(t,o,{level:i,size:s})||!a?o:(r.includeFallbackColors=!1,f.mostReadable(t,["#fff","#000"],r))};var H=f.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},R=f.hexNames=function(t){var e={};for(var r in t)t.hasOwnProperty(r)&&(e[t[r]]=r);return e}(H);function F(t){return t=parseFloat(t),(isNaN(t)||t<0||t>1)&&(t=1),t}function C(e,r){var n;"string"==typeof(n=e)&&-1!=n.indexOf(".")&&1===parseFloat(n)&&(e="100%");var a,o="string"==typeof(a=e)&&-1!=a.indexOf("%");return e=i(r,s(0,parseFloat(e))),o&&(e=parseInt(e*r,10)/100),t.abs(e-r)<1e-6?1:e%r/parseFloat(r)}function q(t){return i(1,s(0,t))}function M(t){return parseInt(t,16)}function I(t){return 1==t.length?"0"+t:""+t}function L(t){return t<=1&&(t=100*t+"%"),t}function N(e){return t.round(255*parseFloat(e)).toString(16)}function z(t){return M(t)/255}var E,T,j,O=(T="[\\s|\\(]+("+(E="(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)")+")[,|\\s]+("+E+")[,|\\s]+("+E+")\\s*\\)?",j="[\\s|\\(]+("+E+")[,|\\s]+("+E+")[,|\\s]+("+E+")[,|\\s]+("+E+")\\s*\\)?",{CSS_UNIT:new RegExp(E),rgb:new RegExp("rgb"+T),rgba:new RegExp("rgba"+j),hsl:new RegExp("hsl"+T),hsla:new RegExp("hsla"+j),hsv:new RegExp("hsv"+T),hsva:new RegExp("hsva"+j),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex4:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/});function P(t){return!!O.CSS_UNIT.exec(t)}"undefined"!=typeof module&&module.exports?module.exports=f:"function"==typeof define&&define.amd?define(function(){return f}):window.tinycolor=f}(Math);