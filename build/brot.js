/*! brot.js - v0.0.1 */
(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                throw new Error("Cannot find module '" + o + "'");
            }
            var f = n[o] = {
                exports: {}
            };
            t[o][0].call(f.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, f, f.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        module.exports = require("./vendor/dat.gui");
        module.exports.color = require("./vendor/dat.color");
    }, {
        "./vendor/dat.color": 2,
        "./vendor/dat.gui": 3
    } ],
    2: [ function(require, module, exports) {
        var dat = module.exports = dat || {};
        dat.color = dat.color || {};
        dat.utils = dat.utils || {};
        dat.utils.common = function() {
            var ARR_EACH = Array.prototype.forEach;
            var ARR_SLICE = Array.prototype.slice;
            return {
                BREAK: {},
                extend: function(target) {
                    this.each(ARR_SLICE.call(arguments, 1), function(obj) {
                        for (var key in obj) if (!this.isUndefined(obj[key])) target[key] = obj[key];
                    }, this);
                    return target;
                },
                defaults: function(target) {
                    this.each(ARR_SLICE.call(arguments, 1), function(obj) {
                        for (var key in obj) if (this.isUndefined(target[key])) target[key] = obj[key];
                    }, this);
                    return target;
                },
                compose: function() {
                    var toCall = ARR_SLICE.call(arguments);
                    return function() {
                        var args = ARR_SLICE.call(arguments);
                        for (var i = toCall.length - 1; i >= 0; i--) {
                            args = [ toCall[i].apply(this, args) ];
                        }
                        return args[0];
                    };
                },
                each: function(obj, itr, scope) {
                    if (ARR_EACH && obj.forEach === ARR_EACH) {
                        obj.forEach(itr, scope);
                    } else if (obj.length === obj.length + 0) {
                        for (var key = 0, l = obj.length; key < l; key++) if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) return;
                    } else {
                        for (var key in obj) if (itr.call(scope, obj[key], key) === this.BREAK) return;
                    }
                },
                defer: function(fnc) {
                    setTimeout(fnc, 0);
                },
                toArray: function(obj) {
                    if (obj.toArray) return obj.toArray();
                    return ARR_SLICE.call(obj);
                },
                isUndefined: function(obj) {
                    return obj === undefined;
                },
                isNull: function(obj) {
                    return obj === null;
                },
                isNaN: function(obj) {
                    return obj !== obj;
                },
                isArray: Array.isArray || function(obj) {
                    return obj.constructor === Array;
                },
                isObject: function(obj) {
                    return obj === Object(obj);
                },
                isNumber: function(obj) {
                    return obj === obj + 0;
                },
                isString: function(obj) {
                    return obj === obj + "";
                },
                isBoolean: function(obj) {
                    return obj === false || obj === true;
                },
                isFunction: function(obj) {
                    return Object.prototype.toString.call(obj) === "[object Function]";
                }
            };
        }();
        dat.color.toString = function(common) {
            return function(color) {
                if (color.a == 1 || common.isUndefined(color.a)) {
                    var s = color.hex.toString(16);
                    while (s.length < 6) {
                        s = "0" + s;
                    }
                    return "#" + s;
                } else {
                    return "rgba(" + Math.round(color.r) + "," + Math.round(color.g) + "," + Math.round(color.b) + "," + color.a + ")";
                }
            };
        }(dat.utils.common);
        dat.Color = dat.color.Color = function(interpret, math, toString, common) {
            var Color = function() {
                this.__state = interpret.apply(this, arguments);
                if (this.__state === false) {
                    throw "Failed to interpret color arguments";
                }
                this.__state.a = this.__state.a || 1;
            };
            Color.COMPONENTS = [ "r", "g", "b", "h", "s", "v", "hex", "a" ];
            common.extend(Color.prototype, {
                toString: function() {
                    return toString(this);
                },
                toOriginal: function() {
                    return this.__state.conversion.write(this);
                }
            });
            defineRGBComponent(Color.prototype, "r", 2);
            defineRGBComponent(Color.prototype, "g", 1);
            defineRGBComponent(Color.prototype, "b", 0);
            defineHSVComponent(Color.prototype, "h");
            defineHSVComponent(Color.prototype, "s");
            defineHSVComponent(Color.prototype, "v");
            Object.defineProperty(Color.prototype, "a", {
                get: function() {
                    return this.__state.a;
                },
                set: function(v) {
                    this.__state.a = v;
                }
            });
            Object.defineProperty(Color.prototype, "hex", {
                get: function() {
                    if (!this.__state.space !== "HEX") {
                        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
                    }
                    return this.__state.hex;
                },
                set: function(v) {
                    this.__state.space = "HEX";
                    this.__state.hex = v;
                }
            });
            function defineRGBComponent(target, component, componentHexIndex) {
                Object.defineProperty(target, component, {
                    get: function() {
                        if (this.__state.space === "RGB") {
                            return this.__state[component];
                        }
                        recalculateRGB(this, component, componentHexIndex);
                        return this.__state[component];
                    },
                    set: function(v) {
                        if (this.__state.space !== "RGB") {
                            recalculateRGB(this, component, componentHexIndex);
                            this.__state.space = "RGB";
                        }
                        this.__state[component] = v;
                    }
                });
            }
            function defineHSVComponent(target, component) {
                Object.defineProperty(target, component, {
                    get: function() {
                        if (this.__state.space === "HSV") return this.__state[component];
                        recalculateHSV(this);
                        return this.__state[component];
                    },
                    set: function(v) {
                        if (this.__state.space !== "HSV") {
                            recalculateHSV(this);
                            this.__state.space = "HSV";
                        }
                        this.__state[component] = v;
                    }
                });
            }
            function recalculateRGB(color, component, componentHexIndex) {
                if (color.__state.space === "HEX") {
                    color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);
                } else if (color.__state.space === "HSV") {
                    common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
                } else {
                    throw "Corrupted color state";
                }
            }
            function recalculateHSV(color) {
                var result = math.rgb_to_hsv(color.r, color.g, color.b);
                common.extend(color.__state, {
                    s: result.s,
                    v: result.v
                });
                if (!common.isNaN(result.h)) {
                    color.__state.h = result.h;
                } else if (common.isUndefined(color.__state.h)) {
                    color.__state.h = 0;
                }
            }
            return Color;
        }(dat.color.interpret = function(toString, common) {
            var result, toReturn;
            var interpret = function() {
                toReturn = false;
                var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];
                common.each(INTERPRETATIONS, function(family) {
                    if (family.litmus(original)) {
                        common.each(family.conversions, function(conversion, conversionName) {
                            result = conversion.read(original);
                            if (toReturn === false && result !== false) {
                                toReturn = result;
                                result.conversionName = conversionName;
                                result.conversion = conversion;
                                return common.BREAK;
                            }
                        });
                        return common.BREAK;
                    }
                });
                return toReturn;
            };
            var INTERPRETATIONS = [ {
                litmus: common.isString,
                conversions: {
                    THREE_CHAR_HEX: {
                        read: function(original) {
                            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
                            if (test === null) return false;
                            return {
                                space: "HEX",
                                hex: parseInt("0x" + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString())
                            };
                        },
                        write: toString
                    },
                    SIX_CHAR_HEX: {
                        read: function(original) {
                            var test = original.match(/^#([A-F0-9]{6})$/i);
                            if (test === null) return false;
                            return {
                                space: "HEX",
                                hex: parseInt("0x" + test[1].toString())
                            };
                        },
                        write: toString
                    },
                    CSS_RGB: {
                        read: function(original) {
                            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
                            if (test === null) return false;
                            return {
                                space: "RGB",
                                r: parseFloat(test[1]),
                                g: parseFloat(test[2]),
                                b: parseFloat(test[3])
                            };
                        },
                        write: toString
                    },
                    CSS_RGBA: {
                        read: function(original) {
                            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
                            if (test === null) return false;
                            return {
                                space: "RGB",
                                r: parseFloat(test[1]),
                                g: parseFloat(test[2]),
                                b: parseFloat(test[3]),
                                a: parseFloat(test[4])
                            };
                        },
                        write: toString
                    }
                }
            }, {
                litmus: common.isNumber,
                conversions: {
                    HEX: {
                        read: function(original) {
                            return {
                                space: "HEX",
                                hex: original,
                                conversionName: "HEX"
                            };
                        },
                        write: function(color) {
                            return color.hex;
                        }
                    }
                }
            }, {
                litmus: common.isArray,
                conversions: {
                    RGB_ARRAY: {
                        read: function(original) {
                            if (original.length != 3) return false;
                            return {
                                space: "RGB",
                                r: original[0],
                                g: original[1],
                                b: original[2]
                            };
                        },
                        write: function(color) {
                            return [ color.r, color.g, color.b ];
                        }
                    },
                    RGBA_ARRAY: {
                        read: function(original) {
                            if (original.length != 4) return false;
                            return {
                                space: "RGB",
                                r: original[0],
                                g: original[1],
                                b: original[2],
                                a: original[3]
                            };
                        },
                        write: function(color) {
                            return [ color.r, color.g, color.b, color.a ];
                        }
                    }
                }
            }, {
                litmus: common.isObject,
                conversions: {
                    RGBA_OBJ: {
                        read: function(original) {
                            if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b) && common.isNumber(original.a)) {
                                return {
                                    space: "RGB",
                                    r: original.r,
                                    g: original.g,
                                    b: original.b,
                                    a: original.a
                                };
                            }
                            return false;
                        },
                        write: function(color) {
                            return {
                                r: color.r,
                                g: color.g,
                                b: color.b,
                                a: color.a
                            };
                        }
                    },
                    RGB_OBJ: {
                        read: function(original) {
                            if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b)) {
                                return {
                                    space: "RGB",
                                    r: original.r,
                                    g: original.g,
                                    b: original.b
                                };
                            }
                            return false;
                        },
                        write: function(color) {
                            return {
                                r: color.r,
                                g: color.g,
                                b: color.b
                            };
                        }
                    },
                    HSVA_OBJ: {
                        read: function(original) {
                            if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v) && common.isNumber(original.a)) {
                                return {
                                    space: "HSV",
                                    h: original.h,
                                    s: original.s,
                                    v: original.v,
                                    a: original.a
                                };
                            }
                            return false;
                        },
                        write: function(color) {
                            return {
                                h: color.h,
                                s: color.s,
                                v: color.v,
                                a: color.a
                            };
                        }
                    },
                    HSV_OBJ: {
                        read: function(original) {
                            if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v)) {
                                return {
                                    space: "HSV",
                                    h: original.h,
                                    s: original.s,
                                    v: original.v
                                };
                            }
                            return false;
                        },
                        write: function(color) {
                            return {
                                h: color.h,
                                s: color.s,
                                v: color.v
                            };
                        }
                    }
                }
            } ];
            return interpret;
        }(dat.color.toString, dat.utils.common), dat.color.math = function() {
            var tmpComponent;
            return {
                hsv_to_rgb: function(h, s, v) {
                    var hi = Math.floor(h / 60) % 6;
                    var f = h / 60 - Math.floor(h / 60);
                    var p = v * (1 - s);
                    var q = v * (1 - f * s);
                    var t = v * (1 - (1 - f) * s);
                    var c = [ [ v, t, p ], [ q, v, p ], [ p, v, t ], [ p, q, v ], [ t, p, v ], [ v, p, q ] ][hi];
                    return {
                        r: c[0] * 255,
                        g: c[1] * 255,
                        b: c[2] * 255
                    };
                },
                rgb_to_hsv: function(r, g, b) {
                    var min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s;
                    if (max != 0) {
                        s = delta / max;
                    } else {
                        return {
                            h: NaN,
                            s: 0,
                            v: 0
                        };
                    }
                    if (r == max) {
                        h = (g - b) / delta;
                    } else if (g == max) {
                        h = 2 + (b - r) / delta;
                    } else {
                        h = 4 + (r - g) / delta;
                    }
                    h /= 6;
                    if (h < 0) {
                        h += 1;
                    }
                    return {
                        h: h * 360,
                        s: s,
                        v: max / 255
                    };
                },
                rgb_to_hex: function(r, g, b) {
                    var hex = this.hex_with_component(0, 2, r);
                    hex = this.hex_with_component(hex, 1, g);
                    hex = this.hex_with_component(hex, 0, b);
                    return hex;
                },
                component_from_hex: function(hex, componentIndex) {
                    return hex >> componentIndex * 8 & 255;
                },
                hex_with_component: function(hex, componentIndex, value) {
                    return value << (tmpComponent = componentIndex * 8) | hex & ~(255 << tmpComponent);
                }
            };
        }(), dat.color.toString, dat.utils.common);
    }, {} ],
    3: [ function(require, module, exports) {
        var dat = module.exports = dat || {};
        dat.gui = dat.gui || {};
        dat.utils = dat.utils || {};
        dat.controllers = dat.controllers || {};
        dat.dom = dat.dom || {};
        dat.color = dat.color || {};
        dat.utils.css = function() {
            return {
                load: function(url, doc) {
                    doc = doc || document;
                    var link = doc.createElement("link");
                    link.type = "text/css";
                    link.rel = "stylesheet";
                    link.href = url;
                    doc.getElementsByTagName("head")[0].appendChild(link);
                },
                inject: function(css, doc) {
                    doc = doc || document;
                    var injected = document.createElement("style");
                    injected.type = "text/css";
                    injected.innerHTML = css;
                    doc.getElementsByTagName("head")[0].appendChild(injected);
                }
            };
        }();
        dat.utils.common = function() {
            var ARR_EACH = Array.prototype.forEach;
            var ARR_SLICE = Array.prototype.slice;
            return {
                BREAK: {},
                extend: function(target) {
                    this.each(ARR_SLICE.call(arguments, 1), function(obj) {
                        for (var key in obj) if (!this.isUndefined(obj[key])) target[key] = obj[key];
                    }, this);
                    return target;
                },
                defaults: function(target) {
                    this.each(ARR_SLICE.call(arguments, 1), function(obj) {
                        for (var key in obj) if (this.isUndefined(target[key])) target[key] = obj[key];
                    }, this);
                    return target;
                },
                compose: function() {
                    var toCall = ARR_SLICE.call(arguments);
                    return function() {
                        var args = ARR_SLICE.call(arguments);
                        for (var i = toCall.length - 1; i >= 0; i--) {
                            args = [ toCall[i].apply(this, args) ];
                        }
                        return args[0];
                    };
                },
                each: function(obj, itr, scope) {
                    if (ARR_EACH && obj.forEach === ARR_EACH) {
                        obj.forEach(itr, scope);
                    } else if (obj.length === obj.length + 0) {
                        for (var key = 0, l = obj.length; key < l; key++) if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) return;
                    } else {
                        for (var key in obj) if (itr.call(scope, obj[key], key) === this.BREAK) return;
                    }
                },
                defer: function(fnc) {
                    setTimeout(fnc, 0);
                },
                toArray: function(obj) {
                    if (obj.toArray) return obj.toArray();
                    return ARR_SLICE.call(obj);
                },
                isUndefined: function(obj) {
                    return obj === undefined;
                },
                isNull: function(obj) {
                    return obj === null;
                },
                isNaN: function(obj) {
                    return obj !== obj;
                },
                isArray: Array.isArray || function(obj) {
                    return obj.constructor === Array;
                },
                isObject: function(obj) {
                    return obj === Object(obj);
                },
                isNumber: function(obj) {
                    return obj === obj + 0;
                },
                isString: function(obj) {
                    return obj === obj + "";
                },
                isBoolean: function(obj) {
                    return obj === false || obj === true;
                },
                isFunction: function(obj) {
                    return Object.prototype.toString.call(obj) === "[object Function]";
                }
            };
        }();
        dat.controllers.Controller = function(common) {
            var Controller = function(object, property) {
                this.initialValue = object[property];
                this.domElement = document.createElement("div");
                this.object = object;
                this.property = property;
                this.__onChange = undefined;
                this.__onFinishChange = undefined;
            };
            common.extend(Controller.prototype, {
                onChange: function(fnc) {
                    this.__onChange = fnc;
                    return this;
                },
                onFinishChange: function(fnc) {
                    this.__onFinishChange = fnc;
                    return this;
                },
                setValue: function(newValue) {
                    this.object[this.property] = newValue;
                    if (this.__onChange) {
                        this.__onChange.call(this, newValue);
                    }
                    this.updateDisplay();
                    return this;
                },
                getValue: function() {
                    return this.object[this.property];
                },
                updateDisplay: function() {
                    return this;
                },
                isModified: function() {
                    return this.initialValue !== this.getValue();
                }
            });
            return Controller;
        }(dat.utils.common);
        dat.dom.dom = function(common) {
            var EVENT_MAP = {
                HTMLEvents: [ "change" ],
                MouseEvents: [ "click", "mousemove", "mousedown", "mouseup", "mouseover" ],
                KeyboardEvents: [ "keydown" ]
            };
            var EVENT_MAP_INV = {};
            common.each(EVENT_MAP, function(v, k) {
                common.each(v, function(e) {
                    EVENT_MAP_INV[e] = k;
                });
            });
            var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
            function cssValueToPixels(val) {
                if (val === "0" || common.isUndefined(val)) return 0;
                var match = val.match(CSS_VALUE_PIXELS);
                if (!common.isNull(match)) {
                    return parseFloat(match[1]);
                }
                return 0;
            }
            var dom = {
                makeSelectable: function(elem, selectable) {
                    if (elem === undefined || elem.style === undefined) return;
                    elem.onselectstart = selectable ? function() {
                        return false;
                    } : function() {};
                    elem.style.MozUserSelect = selectable ? "auto" : "none";
                    elem.style.KhtmlUserSelect = selectable ? "auto" : "none";
                    elem.unselectable = selectable ? "on" : "off";
                },
                makeFullscreen: function(elem, horizontal, vertical) {
                    if (common.isUndefined(horizontal)) horizontal = true;
                    if (common.isUndefined(vertical)) vertical = true;
                    elem.style.position = "absolute";
                    if (horizontal) {
                        elem.style.left = 0;
                        elem.style.right = 0;
                    }
                    if (vertical) {
                        elem.style.top = 0;
                        elem.style.bottom = 0;
                    }
                },
                fakeEvent: function(elem, eventType, params, aux) {
                    params = params || {};
                    var className = EVENT_MAP_INV[eventType];
                    if (!className) {
                        throw new Error("Event type " + eventType + " not supported.");
                    }
                    var evt = document.createEvent(className);
                    switch (className) {
                      case "MouseEvents":
                        var clientX = params.x || params.clientX || 0;
                        var clientY = params.y || params.clientY || 0;
                        evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0, 0, clientX, clientY, false, false, false, false, 0, null);
                        break;

                      case "KeyboardEvents":
                        var init = evt.initKeyboardEvent || evt.initKeyEvent;
                        common.defaults(params, {
                            cancelable: true,
                            ctrlKey: false,
                            altKey: false,
                            shiftKey: false,
                            metaKey: false,
                            keyCode: undefined,
                            charCode: undefined
                        });
                        init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
                        break;

                      default:
                        evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
                        break;
                    }
                    common.defaults(evt, aux);
                    elem.dispatchEvent(evt);
                },
                bind: function(elem, event, func, bool) {
                    bool = bool || false;
                    if (elem.addEventListener) elem.addEventListener(event, func, bool); else if (elem.attachEvent) elem.attachEvent("on" + event, func);
                    return dom;
                },
                unbind: function(elem, event, func, bool) {
                    bool = bool || false;
                    if (elem.removeEventListener) elem.removeEventListener(event, func, bool); else if (elem.detachEvent) elem.detachEvent("on" + event, func);
                    return dom;
                },
                addClass: function(elem, className) {
                    if (elem.className === undefined) {
                        elem.className = className;
                    } else if (elem.className !== className) {
                        var classes = elem.className.split(/ +/);
                        if (classes.indexOf(className) == -1) {
                            classes.push(className);
                            elem.className = classes.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
                        }
                    }
                    return dom;
                },
                removeClass: function(elem, className) {
                    if (className) {
                        if (elem.className === undefined) {} else if (elem.className === className) {
                            elem.removeAttribute("class");
                        } else {
                            var classes = elem.className.split(/ +/);
                            var index = classes.indexOf(className);
                            if (index != -1) {
                                classes.splice(index, 1);
                                elem.className = classes.join(" ");
                            }
                        }
                    } else {
                        elem.className = undefined;
                    }
                    return dom;
                },
                hasClass: function(elem, className) {
                    return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(elem.className) || false;
                },
                getWidth: function(elem) {
                    var style = getComputedStyle(elem);
                    return cssValueToPixels(style["border-left-width"]) + cssValueToPixels(style["border-right-width"]) + cssValueToPixels(style["padding-left"]) + cssValueToPixels(style["padding-right"]) + cssValueToPixels(style["width"]);
                },
                getHeight: function(elem) {
                    var style = getComputedStyle(elem);
                    return cssValueToPixels(style["border-top-width"]) + cssValueToPixels(style["border-bottom-width"]) + cssValueToPixels(style["padding-top"]) + cssValueToPixels(style["padding-bottom"]) + cssValueToPixels(style["height"]);
                },
                getOffset: function(elem) {
                    var offset = {
                        left: 0,
                        top: 0
                    };
                    if (elem.offsetParent) {
                        do {
                            offset.left += elem.offsetLeft;
                            offset.top += elem.offsetTop;
                        } while (elem = elem.offsetParent);
                    }
                    return offset;
                },
                isActive: function(elem) {
                    return elem === document.activeElement && (elem.type || elem.href);
                }
            };
            return dom;
        }(dat.utils.common);
        dat.controllers.OptionController = function(Controller, dom, common) {
            var OptionController = function(object, property, options) {
                OptionController.superclass.call(this, object, property);
                var _this = this;
                this.__select = document.createElement("select");
                if (common.isArray(options)) {
                    var map = {};
                    common.each(options, function(element) {
                        map[element] = element;
                    });
                    options = map;
                }
                common.each(options, function(value, key) {
                    var opt = document.createElement("option");
                    opt.innerHTML = key;
                    opt.setAttribute("value", value);
                    _this.__select.appendChild(opt);
                });
                this.updateDisplay();
                dom.bind(this.__select, "change", function() {
                    var desiredValue = this.options[this.selectedIndex].value;
                    _this.setValue(desiredValue);
                });
                this.domElement.appendChild(this.__select);
            };
            OptionController.superclass = Controller;
            common.extend(OptionController.prototype, Controller.prototype, {
                setValue: function(v) {
                    var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
                    if (this.__onFinishChange) {
                        this.__onFinishChange.call(this, this.getValue());
                    }
                    return toReturn;
                },
                updateDisplay: function() {
                    this.__select.value = this.getValue();
                    return OptionController.superclass.prototype.updateDisplay.call(this);
                }
            });
            return OptionController;
        }(dat.controllers.Controller, dat.dom.dom, dat.utils.common);
        dat.controllers.NumberController = function(Controller, common) {
            var NumberController = function(object, property, params) {
                NumberController.superclass.call(this, object, property);
                params = params || {};
                this.__min = params.min;
                this.__max = params.max;
                this.__step = params.step;
                if (common.isUndefined(this.__step)) {
                    if (this.initialValue == 0) {
                        this.__impliedStep = 1;
                    } else {
                        this.__impliedStep = Math.pow(10, Math.floor(Math.log(this.initialValue) / Math.LN10)) / 10;
                    }
                } else {
                    this.__impliedStep = this.__step;
                }
                this.__precision = numDecimals(this.__impliedStep);
            };
            NumberController.superclass = Controller;
            common.extend(NumberController.prototype, Controller.prototype, {
                setValue: function(v) {
                    if (this.__min !== undefined && v < this.__min) {
                        v = this.__min;
                    } else if (this.__max !== undefined && v > this.__max) {
                        v = this.__max;
                    }
                    if (this.__step !== undefined && v % this.__step != 0) {
                        v = Math.round(v / this.__step) * this.__step;
                    }
                    return NumberController.superclass.prototype.setValue.call(this, v);
                },
                min: function(v) {
                    this.__min = v;
                    return this;
                },
                max: function(v) {
                    this.__max = v;
                    return this;
                },
                step: function(v) {
                    this.__step = v;
                    return this;
                }
            });
            function numDecimals(x) {
                x = x.toString();
                if (x.indexOf(".") > -1) {
                    return x.length - x.indexOf(".") - 1;
                } else {
                    return 0;
                }
            }
            return NumberController;
        }(dat.controllers.Controller, dat.utils.common);
        dat.controllers.NumberControllerBox = function(NumberController, dom, common) {
            var NumberControllerBox = function(object, property, params) {
                this.__truncationSuspended = false;
                NumberControllerBox.superclass.call(this, object, property, params);
                var _this = this;
                var prev_y;
                this.__input = document.createElement("input");
                this.__input.setAttribute("type", "text");
                dom.bind(this.__input, "change", onChange);
                dom.bind(this.__input, "blur", onBlur);
                dom.bind(this.__input, "mousedown", onMouseDown);
                dom.bind(this.__input, "keydown", function(e) {
                    if (e.keyCode === 13) {
                        _this.__truncationSuspended = true;
                        this.blur();
                        _this.__truncationSuspended = false;
                    }
                });
                function onChange() {
                    var attempted = parseFloat(_this.__input.value);
                    if (!common.isNaN(attempted)) _this.setValue(attempted);
                }
                function onBlur() {
                    onChange();
                    if (_this.__onFinishChange) {
                        _this.__onFinishChange.call(_this, _this.getValue());
                    }
                }
                function onMouseDown(e) {
                    dom.bind(window, "mousemove", onMouseDrag);
                    dom.bind(window, "mouseup", onMouseUp);
                    prev_y = e.clientY;
                }
                function onMouseDrag(e) {
                    var diff = prev_y - e.clientY;
                    _this.setValue(_this.getValue() + diff * _this.__impliedStep);
                    prev_y = e.clientY;
                }
                function onMouseUp() {
                    dom.unbind(window, "mousemove", onMouseDrag);
                    dom.unbind(window, "mouseup", onMouseUp);
                }
                this.updateDisplay();
                this.domElement.appendChild(this.__input);
            };
            NumberControllerBox.superclass = NumberController;
            common.extend(NumberControllerBox.prototype, NumberController.prototype, {
                updateDisplay: function() {
                    this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
                    return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
                }
            });
            function roundToDecimal(value, decimals) {
                var tenTo = Math.pow(10, decimals);
                return Math.round(value * tenTo) / tenTo;
            }
            return NumberControllerBox;
        }(dat.controllers.NumberController, dat.dom.dom, dat.utils.common);
        dat.controllers.NumberControllerSlider = function(NumberController, dom, css, common, styleSheet) {
            var NumberControllerSlider = function(object, property, min, max, step) {
                NumberControllerSlider.superclass.call(this, object, property, {
                    min: min,
                    max: max,
                    step: step
                });
                var _this = this;
                this.__background = document.createElement("div");
                this.__foreground = document.createElement("div");
                dom.bind(this.__background, "mousedown", onMouseDown);
                dom.addClass(this.__background, "slider");
                dom.addClass(this.__foreground, "slider-fg");
                function onMouseDown(e) {
                    dom.bind(window, "mousemove", onMouseDrag);
                    dom.bind(window, "mouseup", onMouseUp);
                    onMouseDrag(e);
                }
                function onMouseDrag(e) {
                    e.preventDefault();
                    var offset = dom.getOffset(_this.__background);
                    var width = dom.getWidth(_this.__background);
                    _this.setValue(map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max));
                    return false;
                }
                function onMouseUp() {
                    dom.unbind(window, "mousemove", onMouseDrag);
                    dom.unbind(window, "mouseup", onMouseUp);
                    if (_this.__onFinishChange) {
                        _this.__onFinishChange.call(_this, _this.getValue());
                    }
                }
                this.updateDisplay();
                this.__background.appendChild(this.__foreground);
                this.domElement.appendChild(this.__background);
            };
            NumberControllerSlider.superclass = NumberController;
            NumberControllerSlider.useDefaultStyles = function() {
                css.inject(styleSheet);
            };
            common.extend(NumberControllerSlider.prototype, NumberController.prototype, {
                updateDisplay: function() {
                    var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
                    this.__foreground.style.width = pct * 100 + "%";
                    return NumberControllerSlider.superclass.prototype.updateDisplay.call(this);
                }
            });
            function map(v, i1, i2, o1, o2) {
                return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
            }
            return NumberControllerSlider;
        }(dat.controllers.NumberController, dat.dom.dom, dat.utils.css, dat.utils.common, ".slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");
        dat.controllers.FunctionController = function(Controller, dom, common) {
            var FunctionController = function(object, property, text) {
                FunctionController.superclass.call(this, object, property);
                var _this = this;
                this.__button = document.createElement("div");
                this.__button.innerHTML = text === undefined ? "Fire" : text;
                dom.bind(this.__button, "click", function(e) {
                    e.preventDefault();
                    _this.fire();
                    return false;
                });
                dom.addClass(this.__button, "button");
                this.domElement.appendChild(this.__button);
            };
            FunctionController.superclass = Controller;
            common.extend(FunctionController.prototype, Controller.prototype, {
                fire: function() {
                    if (this.__onChange) {
                        this.__onChange.call(this);
                    }
                    if (this.__onFinishChange) {
                        this.__onFinishChange.call(this, this.getValue());
                    }
                    this.getValue().call(this.object);
                }
            });
            return FunctionController;
        }(dat.controllers.Controller, dat.dom.dom, dat.utils.common);
        dat.controllers.BooleanController = function(Controller, dom, common) {
            var BooleanController = function(object, property) {
                BooleanController.superclass.call(this, object, property);
                var _this = this;
                this.__prev = this.getValue();
                this.__checkbox = document.createElement("input");
                this.__checkbox.setAttribute("type", "checkbox");
                dom.bind(this.__checkbox, "change", onChange, false);
                this.domElement.appendChild(this.__checkbox);
                this.updateDisplay();
                function onChange() {
                    _this.setValue(!_this.__prev);
                }
            };
            BooleanController.superclass = Controller;
            common.extend(BooleanController.prototype, Controller.prototype, {
                setValue: function(v) {
                    var toReturn = BooleanController.superclass.prototype.setValue.call(this, v);
                    if (this.__onFinishChange) {
                        this.__onFinishChange.call(this, this.getValue());
                    }
                    this.__prev = this.getValue();
                    return toReturn;
                },
                updateDisplay: function() {
                    if (this.getValue() === true) {
                        this.__checkbox.setAttribute("checked", "checked");
                        this.__checkbox.checked = true;
                    } else {
                        this.__checkbox.checked = false;
                    }
                    return BooleanController.superclass.prototype.updateDisplay.call(this);
                }
            });
            return BooleanController;
        }(dat.controllers.Controller, dat.dom.dom, dat.utils.common);
        dat.color.toString = function(common) {
            return function(color) {
                if (color.a == 1 || common.isUndefined(color.a)) {
                    var s = color.hex.toString(16);
                    while (s.length < 6) {
                        s = "0" + s;
                    }
                    return "#" + s;
                } else {
                    return "rgba(" + Math.round(color.r) + "," + Math.round(color.g) + "," + Math.round(color.b) + "," + color.a + ")";
                }
            };
        }(dat.utils.common);
        dat.color.interpret = function(toString, common) {
            var result, toReturn;
            var interpret = function() {
                toReturn = false;
                var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];
                common.each(INTERPRETATIONS, function(family) {
                    if (family.litmus(original)) {
                        common.each(family.conversions, function(conversion, conversionName) {
                            result = conversion.read(original);
                            if (toReturn === false && result !== false) {
                                toReturn = result;
                                result.conversionName = conversionName;
                                result.conversion = conversion;
                                return common.BREAK;
                            }
                        });
                        return common.BREAK;
                    }
                });
                return toReturn;
            };
            var INTERPRETATIONS = [ {
                litmus: common.isString,
                conversions: {
                    THREE_CHAR_HEX: {
                        read: function(original) {
                            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
                            if (test === null) return false;
                            return {
                                space: "HEX",
                                hex: parseInt("0x" + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString())
                            };
                        },
                        write: toString
                    },
                    SIX_CHAR_HEX: {
                        read: function(original) {
                            var test = original.match(/^#([A-F0-9]{6})$/i);
                            if (test === null) return false;
                            return {
                                space: "HEX",
                                hex: parseInt("0x" + test[1].toString())
                            };
                        },
                        write: toString
                    },
                    CSS_RGB: {
                        read: function(original) {
                            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
                            if (test === null) return false;
                            return {
                                space: "RGB",
                                r: parseFloat(test[1]),
                                g: parseFloat(test[2]),
                                b: parseFloat(test[3])
                            };
                        },
                        write: toString
                    },
                    CSS_RGBA: {
                        read: function(original) {
                            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
                            if (test === null) return false;
                            return {
                                space: "RGB",
                                r: parseFloat(test[1]),
                                g: parseFloat(test[2]),
                                b: parseFloat(test[3]),
                                a: parseFloat(test[4])
                            };
                        },
                        write: toString
                    }
                }
            }, {
                litmus: common.isNumber,
                conversions: {
                    HEX: {
                        read: function(original) {
                            return {
                                space: "HEX",
                                hex: original,
                                conversionName: "HEX"
                            };
                        },
                        write: function(color) {
                            return color.hex;
                        }
                    }
                }
            }, {
                litmus: common.isArray,
                conversions: {
                    RGB_ARRAY: {
                        read: function(original) {
                            if (original.length != 3) return false;
                            return {
                                space: "RGB",
                                r: original[0],
                                g: original[1],
                                b: original[2]
                            };
                        },
                        write: function(color) {
                            return [ color.r, color.g, color.b ];
                        }
                    },
                    RGBA_ARRAY: {
                        read: function(original) {
                            if (original.length != 4) return false;
                            return {
                                space: "RGB",
                                r: original[0],
                                g: original[1],
                                b: original[2],
                                a: original[3]
                            };
                        },
                        write: function(color) {
                            return [ color.r, color.g, color.b, color.a ];
                        }
                    }
                }
            }, {
                litmus: common.isObject,
                conversions: {
                    RGBA_OBJ: {
                        read: function(original) {
                            if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b) && common.isNumber(original.a)) {
                                return {
                                    space: "RGB",
                                    r: original.r,
                                    g: original.g,
                                    b: original.b,
                                    a: original.a
                                };
                            }
                            return false;
                        },
                        write: function(color) {
                            return {
                                r: color.r,
                                g: color.g,
                                b: color.b,
                                a: color.a
                            };
                        }
                    },
                    RGB_OBJ: {
                        read: function(original) {
                            if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b)) {
                                return {
                                    space: "RGB",
                                    r: original.r,
                                    g: original.g,
                                    b: original.b
                                };
                            }
                            return false;
                        },
                        write: function(color) {
                            return {
                                r: color.r,
                                g: color.g,
                                b: color.b
                            };
                        }
                    },
                    HSVA_OBJ: {
                        read: function(original) {
                            if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v) && common.isNumber(original.a)) {
                                return {
                                    space: "HSV",
                                    h: original.h,
                                    s: original.s,
                                    v: original.v,
                                    a: original.a
                                };
                            }
                            return false;
                        },
                        write: function(color) {
                            return {
                                h: color.h,
                                s: color.s,
                                v: color.v,
                                a: color.a
                            };
                        }
                    },
                    HSV_OBJ: {
                        read: function(original) {
                            if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v)) {
                                return {
                                    space: "HSV",
                                    h: original.h,
                                    s: original.s,
                                    v: original.v
                                };
                            }
                            return false;
                        },
                        write: function(color) {
                            return {
                                h: color.h,
                                s: color.s,
                                v: color.v
                            };
                        }
                    }
                }
            } ];
            return interpret;
        }(dat.color.toString, dat.utils.common);
        dat.GUI = dat.gui.GUI = function(css, saveDialogueContents, styleSheet, controllerFactory, Controller, BooleanController, FunctionController, NumberControllerBox, NumberControllerSlider, OptionController, ColorController, requestAnimationFrame, CenteredDiv, dom, common) {
            css.inject(styleSheet);
            var CSS_NAMESPACE = "dg";
            var HIDE_KEY_CODE = 72;
            var CLOSE_BUTTON_HEIGHT = 20;
            var DEFAULT_DEFAULT_PRESET_NAME = "Default";
            var SUPPORTS_LOCAL_STORAGE = function() {
                try {
                    return "localStorage" in window && window["localStorage"] !== null;
                } catch (e) {
                    return false;
                }
            }();
            var SAVE_DIALOGUE;
            var auto_place_virgin = true;
            var auto_place_container;
            var hide = false;
            var hideable_guis = [];
            var GUI = function(params) {
                var _this = this;
                this.domElement = document.createElement("div");
                this.__ul = document.createElement("ul");
                this.domElement.appendChild(this.__ul);
                dom.addClass(this.domElement, CSS_NAMESPACE);
                this.__folders = {};
                this.__controllers = [];
                this.__rememberedObjects = [];
                this.__rememberedObjectIndecesToControllers = [];
                this.__listening = [];
                params = params || {};
                params = common.defaults(params, {
                    autoPlace: true,
                    width: GUI.DEFAULT_WIDTH
                });
                params = common.defaults(params, {
                    resizable: params.autoPlace,
                    hideable: params.autoPlace
                });
                if (!common.isUndefined(params.load)) {
                    if (params.preset) params.load.preset = params.preset;
                } else {
                    params.load = {
                        preset: DEFAULT_DEFAULT_PRESET_NAME
                    };
                }
                if (common.isUndefined(params.parent) && params.hideable) {
                    hideable_guis.push(this);
                }
                params.resizable = common.isUndefined(params.parent) && params.resizable;
                if (params.autoPlace && common.isUndefined(params.scrollable)) {
                    params.scrollable = true;
                }
                var use_local_storage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";
                Object.defineProperties(this, {
                    parent: {
                        get: function() {
                            return params.parent;
                        }
                    },
                    scrollable: {
                        get: function() {
                            return params.scrollable;
                        }
                    },
                    autoPlace: {
                        get: function() {
                            return params.autoPlace;
                        }
                    },
                    preset: {
                        get: function() {
                            if (_this.parent) {
                                return _this.getRoot().preset;
                            } else {
                                return params.load.preset;
                            }
                        },
                        set: function(v) {
                            if (_this.parent) {
                                _this.getRoot().preset = v;
                            } else {
                                params.load.preset = v;
                            }
                            setPresetSelectIndex(this);
                            _this.revert();
                        }
                    },
                    width: {
                        get: function() {
                            return params.width;
                        },
                        set: function(v) {
                            params.width = v;
                            setWidth(_this, v);
                        }
                    },
                    name: {
                        get: function() {
                            return params.name;
                        },
                        set: function(v) {
                            params.name = v;
                            if (title_row_name) {
                                title_row_name.innerHTML = params.name;
                            }
                        }
                    },
                    closed: {
                        get: function() {
                            return params.closed;
                        },
                        set: function(v) {
                            params.closed = v;
                            if (params.closed) {
                                dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
                            } else {
                                dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
                            }
                            this.onResize();
                            if (_this.__closeButton) {
                                _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
                            }
                        }
                    },
                    load: {
                        get: function() {
                            return params.load;
                        }
                    },
                    useLocalStorage: {
                        get: function() {
                            return use_local_storage;
                        },
                        set: function(bool) {
                            if (SUPPORTS_LOCAL_STORAGE) {
                                use_local_storage = bool;
                                if (bool) {
                                    dom.bind(window, "unload", saveToLocalStorage);
                                } else {
                                    dom.unbind(window, "unload", saveToLocalStorage);
                                }
                                localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
                            }
                        }
                    }
                });
                if (common.isUndefined(params.parent)) {
                    params.closed = false;
                    dom.addClass(this.domElement, GUI.CLASS_MAIN);
                    dom.makeSelectable(this.domElement, false);
                    if (SUPPORTS_LOCAL_STORAGE) {
                        if (use_local_storage) {
                            _this.useLocalStorage = true;
                            var saved_gui = localStorage.getItem(getLocalStorageHash(this, "gui"));
                            if (saved_gui) {
                                params.load = JSON.parse(saved_gui);
                            }
                        }
                    }
                    this.__closeButton = document.createElement("div");
                    this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
                    dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
                    this.domElement.appendChild(this.__closeButton);
                    dom.bind(this.__closeButton, "click", function() {
                        _this.closed = !_this.closed;
                    });
                } else {
                    if (params.closed === undefined) {
                        params.closed = true;
                    }
                    var title_row_name = document.createTextNode(params.name);
                    dom.addClass(title_row_name, "controller-name");
                    var title_row = addRow(_this, title_row_name);
                    var on_click_title = function(e) {
                        e.preventDefault();
                        _this.closed = !_this.closed;
                        return false;
                    };
                    dom.addClass(this.__ul, GUI.CLASS_CLOSED);
                    dom.addClass(title_row, "title");
                    dom.bind(title_row, "click", on_click_title);
                    if (!params.closed) {
                        this.closed = false;
                    }
                }
                if (params.autoPlace) {
                    if (common.isUndefined(params.parent)) {
                        if (auto_place_virgin) {
                            auto_place_container = document.createElement("div");
                            dom.addClass(auto_place_container, CSS_NAMESPACE);
                            dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
                            document.body.appendChild(auto_place_container);
                            auto_place_virgin = false;
                        }
                        auto_place_container.appendChild(this.domElement);
                        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
                    }
                    if (!this.parent) setWidth(_this, params.width);
                }
                dom.bind(window, "resize", function() {
                    _this.onResize();
                });
                dom.bind(this.__ul, "webkitTransitionEnd", function() {
                    _this.onResize();
                });
                dom.bind(this.__ul, "transitionend", function() {
                    _this.onResize();
                });
                dom.bind(this.__ul, "oTransitionEnd", function() {
                    _this.onResize();
                });
                this.onResize();
                if (params.resizable) {
                    addResizeHandle(this);
                }
                function saveToLocalStorage() {
                    localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
                }
                var root = _this.getRoot();
                function resetWidth() {
                    var root = _this.getRoot();
                    root.width += 1;
                    common.defer(function() {
                        root.width -= 1;
                    });
                }
                if (!params.parent) {
                    resetWidth();
                }
            };
            GUI.toggleHide = function() {
                hide = !hide;
                common.each(hideable_guis, function(gui) {
                    gui.domElement.style.zIndex = hide ? -999 : 999;
                    gui.domElement.style.opacity = hide ? 0 : 1;
                });
            };
            GUI.CLASS_AUTO_PLACE = "a";
            GUI.CLASS_AUTO_PLACE_CONTAINER = "ac";
            GUI.CLASS_MAIN = "main";
            GUI.CLASS_CONTROLLER_ROW = "cr";
            GUI.CLASS_TOO_TALL = "taller-than-window";
            GUI.CLASS_CLOSED = "closed";
            GUI.CLASS_CLOSE_BUTTON = "close-button";
            GUI.CLASS_DRAG = "drag";
            GUI.DEFAULT_WIDTH = 245;
            GUI.TEXT_CLOSED = "Close Controls";
            GUI.TEXT_OPEN = "Open Controls";
            dom.bind(window, "keydown", function(e) {
                if (document.activeElement.type !== "text" && (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)) {
                    GUI.toggleHide();
                }
            }, false);
            common.extend(GUI.prototype, {
                add: function(object, property) {
                    return add(this, object, property, {
                        factoryArgs: Array.prototype.slice.call(arguments, 2)
                    });
                },
                addColor: function(object, property) {
                    return add(this, object, property, {
                        color: true
                    });
                },
                remove: function(controller) {
                    this.__ul.removeChild(controller.__li);
                    this.__controllers.slice(this.__controllers.indexOf(controller), 1);
                    var _this = this;
                    common.defer(function() {
                        _this.onResize();
                    });
                },
                destroy: function() {
                    if (this.autoPlace) {
                        auto_place_container.removeChild(this.domElement);
                    }
                },
                addFolder: function(name) {
                    if (this.__folders[name] !== undefined) {
                        throw new Error("You already have a folder in this GUI by the" + ' name "' + name + '"');
                    }
                    var new_gui_params = {
                        name: name,
                        parent: this
                    };
                    new_gui_params.autoPlace = this.autoPlace;
                    if (this.load && this.load.folders && this.load.folders[name]) {
                        new_gui_params.closed = this.load.folders[name].closed;
                        new_gui_params.load = this.load.folders[name];
                    }
                    var gui = new GUI(new_gui_params);
                    this.__folders[name] = gui;
                    var li = addRow(this, gui.domElement);
                    dom.addClass(li, "folder");
                    return gui;
                },
                open: function() {
                    this.closed = false;
                },
                close: function() {
                    this.closed = true;
                },
                onResize: function() {
                    var root = this.getRoot();
                    if (root.scrollable) {
                        var top = dom.getOffset(root.__ul).top;
                        var h = 0;
                        common.each(root.__ul.childNodes, function(node) {
                            if (!(root.autoPlace && node === root.__save_row)) h += dom.getHeight(node);
                        });
                        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
                            dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
                            root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
                        } else {
                            dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
                            root.__ul.style.height = "auto";
                        }
                    }
                    if (root.__resize_handle) {
                        common.defer(function() {
                            root.__resize_handle.style.height = root.__ul.offsetHeight + "px";
                        });
                    }
                    if (root.__closeButton) {
                        root.__closeButton.style.width = root.width + "px";
                    }
                },
                remember: function() {
                    if (common.isUndefined(SAVE_DIALOGUE)) {
                        SAVE_DIALOGUE = new CenteredDiv();
                        SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
                    }
                    if (this.parent) {
                        throw new Error("You can only call remember on a top level GUI.");
                    }
                    var _this = this;
                    common.each(Array.prototype.slice.call(arguments), function(object) {
                        if (_this.__rememberedObjects.length == 0) {
                            addSaveMenu(_this);
                        }
                        if (_this.__rememberedObjects.indexOf(object) == -1) {
                            _this.__rememberedObjects.push(object);
                        }
                    });
                    if (this.autoPlace) {
                        setWidth(this, this.width);
                    }
                },
                getRoot: function() {
                    var gui = this;
                    while (gui.parent) {
                        gui = gui.parent;
                    }
                    return gui;
                },
                getSaveObject: function() {
                    var toReturn = this.load;
                    toReturn.closed = this.closed;
                    if (this.__rememberedObjects.length > 0) {
                        toReturn.preset = this.preset;
                        if (!toReturn.remembered) {
                            toReturn.remembered = {};
                        }
                        toReturn.remembered[this.preset] = getCurrentPreset(this);
                    }
                    toReturn.folders = {};
                    common.each(this.__folders, function(element, key) {
                        toReturn.folders[key] = element.getSaveObject();
                    });
                    return toReturn;
                },
                save: function() {
                    if (!this.load.remembered) {
                        this.load.remembered = {};
                    }
                    this.load.remembered[this.preset] = getCurrentPreset(this);
                    markPresetModified(this, false);
                },
                saveAs: function(presetName) {
                    if (!this.load.remembered) {
                        this.load.remembered = {};
                        this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
                    }
                    this.load.remembered[presetName] = getCurrentPreset(this);
                    this.preset = presetName;
                    addPresetOption(this, presetName, true);
                },
                revert: function(gui) {
                    common.each(this.__controllers, function(controller) {
                        if (!this.getRoot().load.remembered) {
                            controller.setValue(controller.initialValue);
                        } else {
                            recallSavedValue(gui || this.getRoot(), controller);
                        }
                    }, this);
                    common.each(this.__folders, function(folder) {
                        folder.revert(folder);
                    });
                    if (!gui) {
                        markPresetModified(this.getRoot(), false);
                    }
                },
                listen: function(controller) {
                    var init = this.__listening.length == 0;
                    this.__listening.push(controller);
                    if (init) updateDisplays(this.__listening);
                }
            });
            function add(gui, object, property, params) {
                if (object[property] === undefined) {
                    throw new Error("Object " + object + ' has no property "' + property + '"');
                }
                var controller;
                if (params.color) {
                    controller = new ColorController(object, property);
                } else {
                    var factoryArgs = [ object, property ].concat(params.factoryArgs);
                    controller = controllerFactory.apply(gui, factoryArgs);
                }
                if (params.before instanceof Controller) {
                    params.before = params.before.__li;
                }
                recallSavedValue(gui, controller);
                dom.addClass(controller.domElement, "c");
                var name = document.createElement("span");
                dom.addClass(name, "property-name");
                name.innerHTML = controller.property;
                var container = document.createElement("div");
                container.appendChild(name);
                container.appendChild(controller.domElement);
                var li = addRow(gui, container, params.before);
                dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
                dom.addClass(li, typeof controller.getValue());
                augmentController(gui, li, controller);
                gui.__controllers.push(controller);
                return controller;
            }
            function addRow(gui, dom, liBefore) {
                var li = document.createElement("li");
                if (dom) li.appendChild(dom);
                if (liBefore) {
                    gui.__ul.insertBefore(li, params.before);
                } else {
                    gui.__ul.appendChild(li);
                }
                gui.onResize();
                return li;
            }
            function augmentController(gui, li, controller) {
                controller.__li = li;
                controller.__gui = gui;
                common.extend(controller, {
                    options: function(options) {
                        if (arguments.length > 1) {
                            controller.remove();
                            return add(gui, controller.object, controller.property, {
                                before: controller.__li.nextElementSibling,
                                factoryArgs: [ common.toArray(arguments) ]
                            });
                        }
                        if (common.isArray(options) || common.isObject(options)) {
                            controller.remove();
                            return add(gui, controller.object, controller.property, {
                                before: controller.__li.nextElementSibling,
                                factoryArgs: [ options ]
                            });
                        }
                    },
                    name: function(v) {
                        controller.__li.firstElementChild.firstElementChild.innerHTML = v;
                        return controller;
                    },
                    listen: function() {
                        controller.__gui.listen(controller);
                        return controller;
                    },
                    remove: function() {
                        controller.__gui.remove(controller);
                        return controller;
                    }
                });
                if (controller instanceof NumberControllerSlider) {
                    var box = new NumberControllerBox(controller.object, controller.property, {
                        min: controller.__min,
                        max: controller.__max,
                        step: controller.__step
                    });
                    common.each([ "updateDisplay", "onChange", "onFinishChange" ], function(method) {
                        var pc = controller[method];
                        var pb = box[method];
                        controller[method] = box[method] = function() {
                            var args = Array.prototype.slice.call(arguments);
                            pc.apply(controller, args);
                            return pb.apply(box, args);
                        };
                    });
                    dom.addClass(li, "has-slider");
                    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
                } else if (controller instanceof NumberControllerBox) {
                    var r = function(returned) {
                        if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {
                            controller.remove();
                            return add(gui, controller.object, controller.property, {
                                before: controller.__li.nextElementSibling,
                                factoryArgs: [ controller.__min, controller.__max, controller.__step ]
                            });
                        }
                        return returned;
                    };
                    controller.min = common.compose(r, controller.min);
                    controller.max = common.compose(r, controller.max);
                } else if (controller instanceof BooleanController) {
                    dom.bind(li, "click", function() {
                        dom.fakeEvent(controller.__checkbox, "click");
                    });
                    dom.bind(controller.__checkbox, "click", function(e) {
                        e.stopPropagation();
                    });
                } else if (controller instanceof FunctionController) {
                    dom.bind(li, "click", function() {
                        dom.fakeEvent(controller.__button, "click");
                    });
                    dom.bind(li, "mouseover", function() {
                        dom.addClass(controller.__button, "hover");
                    });
                    dom.bind(li, "mouseout", function() {
                        dom.removeClass(controller.__button, "hover");
                    });
                } else if (controller instanceof ColorController) {
                    dom.addClass(li, "color");
                    controller.updateDisplay = common.compose(function(r) {
                        li.style.borderLeftColor = controller.__color.toString();
                        return r;
                    }, controller.updateDisplay);
                    controller.updateDisplay();
                }
                controller.setValue = common.compose(function(r) {
                    if (gui.getRoot().__preset_select && controller.isModified()) {
                        markPresetModified(gui.getRoot(), true);
                    }
                    return r;
                }, controller.setValue);
            }
            function recallSavedValue(gui, controller) {
                var root = gui.getRoot();
                var matched_index = root.__rememberedObjects.indexOf(controller.object);
                if (matched_index != -1) {
                    var controller_map = root.__rememberedObjectIndecesToControllers[matched_index];
                    if (controller_map === undefined) {
                        controller_map = {};
                        root.__rememberedObjectIndecesToControllers[matched_index] = controller_map;
                    }
                    controller_map[controller.property] = controller;
                    if (root.load && root.load.remembered) {
                        var preset_map = root.load.remembered;
                        var preset;
                        if (preset_map[gui.preset]) {
                            preset = preset_map[gui.preset];
                        } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {
                            preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];
                        } else {
                            return;
                        }
                        if (preset[matched_index] && preset[matched_index][controller.property] !== undefined) {
                            var value = preset[matched_index][controller.property];
                            controller.initialValue = value;
                            controller.setValue(value);
                        }
                    }
                }
            }
            function getLocalStorageHash(gui, key) {
                return document.location.href + "." + key;
            }
            function addSaveMenu(gui) {
                var div = gui.__save_row = document.createElement("li");
                dom.addClass(gui.domElement, "has-save");
                gui.__ul.insertBefore(div, gui.__ul.firstChild);
                dom.addClass(div, "save-row");
                var gears = document.createElement("span");
                gears.innerHTML = "&nbsp;";
                dom.addClass(gears, "button gears");
                var button = document.createElement("span");
                button.innerHTML = "Save";
                dom.addClass(button, "button");
                dom.addClass(button, "save");
                var button2 = document.createElement("span");
                button2.innerHTML = "New";
                dom.addClass(button2, "button");
                dom.addClass(button2, "save-as");
                var button3 = document.createElement("span");
                button3.innerHTML = "Revert";
                dom.addClass(button3, "button");
                dom.addClass(button3, "revert");
                var select = gui.__preset_select = document.createElement("select");
                if (gui.load && gui.load.remembered) {
                    common.each(gui.load.remembered, function(value, key) {
                        addPresetOption(gui, key, key == gui.preset);
                    });
                } else {
                    addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
                }
                dom.bind(select, "change", function() {
                    for (var index = 0; index < gui.__preset_select.length; index++) {
                        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
                    }
                    gui.preset = this.value;
                });
                div.appendChild(select);
                div.appendChild(gears);
                div.appendChild(button);
                div.appendChild(button2);
                div.appendChild(button3);
                if (SUPPORTS_LOCAL_STORAGE) {
                    var saveLocally = document.getElementById("dg-save-locally");
                    var explain = document.getElementById("dg-local-explain");
                    saveLocally.style.display = "block";
                    var localStorageCheckBox = document.getElementById("dg-local-storage");
                    if (localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
                        localStorageCheckBox.setAttribute("checked", "checked");
                    }
                    function showHideExplain() {
                        explain.style.display = gui.useLocalStorage ? "block" : "none";
                    }
                    showHideExplain();
                    dom.bind(localStorageCheckBox, "change", function() {
                        gui.useLocalStorage = !gui.useLocalStorage;
                        showHideExplain();
                    });
                }
                var newConstructorTextArea = document.getElementById("dg-new-constructor");
                dom.bind(newConstructorTextArea, "keydown", function(e) {
                    if (e.metaKey && (e.which === 67 || e.keyCode == 67)) {
                        SAVE_DIALOGUE.hide();
                    }
                });
                dom.bind(gears, "click", function() {
                    newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
                    SAVE_DIALOGUE.show();
                    newConstructorTextArea.focus();
                    newConstructorTextArea.select();
                });
                dom.bind(button, "click", function() {
                    gui.save();
                });
                dom.bind(button2, "click", function() {
                    var presetName = prompt("Enter a new preset name.");
                    if (presetName) gui.saveAs(presetName);
                });
                dom.bind(button3, "click", function() {
                    gui.revert();
                });
            }
            function addResizeHandle(gui) {
                gui.__resize_handle = document.createElement("div");
                common.extend(gui.__resize_handle.style, {
                    width: "6px",
                    marginLeft: "-3px",
                    height: "200px",
                    cursor: "ew-resize",
                    position: "absolute"
                });
                var pmouseX;
                dom.bind(gui.__resize_handle, "mousedown", dragStart);
                dom.bind(gui.__closeButton, "mousedown", dragStart);
                gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
                function dragStart(e) {
                    e.preventDefault();
                    pmouseX = e.clientX;
                    dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
                    dom.bind(window, "mousemove", drag);
                    dom.bind(window, "mouseup", dragStop);
                    return false;
                }
                function drag(e) {
                    e.preventDefault();
                    gui.width += pmouseX - e.clientX;
                    gui.onResize();
                    pmouseX = e.clientX;
                    return false;
                }
                function dragStop() {
                    dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
                    dom.unbind(window, "mousemove", drag);
                    dom.unbind(window, "mouseup", dragStop);
                }
            }
            function setWidth(gui, w) {
                gui.domElement.style.width = w + "px";
                if (gui.__save_row && gui.autoPlace) {
                    gui.__save_row.style.width = w + "px";
                }
                if (gui.__closeButton) {
                    gui.__closeButton.style.width = w + "px";
                }
            }
            function getCurrentPreset(gui, useInitialValues) {
                var toReturn = {};
                common.each(gui.__rememberedObjects, function(val, index) {
                    var saved_values = {};
                    var controller_map = gui.__rememberedObjectIndecesToControllers[index];
                    common.each(controller_map, function(controller, property) {
                        saved_values[property] = useInitialValues ? controller.initialValue : controller.getValue();
                    });
                    toReturn[index] = saved_values;
                });
                return toReturn;
            }
            function addPresetOption(gui, name, setSelected) {
                var opt = document.createElement("option");
                opt.innerHTML = name;
                opt.value = name;
                gui.__preset_select.appendChild(opt);
                if (setSelected) {
                    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
                }
            }
            function setPresetSelectIndex(gui) {
                for (var index = 0; index < gui.__preset_select.length; index++) {
                    if (gui.__preset_select[index].value == gui.preset) {
                        gui.__preset_select.selectedIndex = index;
                    }
                }
            }
            function markPresetModified(gui, modified) {
                var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
                if (modified) {
                    opt.innerHTML = opt.value + "*";
                } else {
                    opt.innerHTML = opt.value;
                }
            }
            function updateDisplays(controllerArray) {
                if (controllerArray.length != 0) {
                    requestAnimationFrame(function() {
                        updateDisplays(controllerArray);
                    });
                }
                common.each(controllerArray, function(c) {
                    c.updateDisplay();
                });
            }
            return GUI;
        }(dat.utils.css, '<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>', ".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear;border:0;position:absolute;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-x:hidden}.dg.a.has-save ul{margin-top:27px}.dg.a.has-save ul.closed{margin-top:0}.dg.a .save-row{position:fixed;top:0;z-index:1002}.dg li{-webkit-transition:height 0.1s ease-out;-o-transition:height 0.1s ease-out;-moz-transition:height 0.1s ease-out;transition:height 0.1s ease-out}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;overflow:hidden;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li > *{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:9px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2fa1d6}.dg .cr.number input[type=text]{color:#2fa1d6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2fa1d6}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n", dat.controllers.factory = function(OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {
            return function(object, property) {
                var initialValue = object[property];
                if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
                    return new OptionController(object, property, arguments[2]);
                }
                if (common.isNumber(initialValue)) {
                    if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {
                        return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
                    } else {
                        return new NumberControllerBox(object, property, {
                            min: arguments[2],
                            max: arguments[3]
                        });
                    }
                }
                if (common.isString(initialValue)) {
                    return new StringController(object, property);
                }
                if (common.isFunction(initialValue)) {
                    return new FunctionController(object, property, "");
                }
                if (common.isBoolean(initialValue)) {
                    return new BooleanController(object, property);
                }
            };
        }(dat.controllers.OptionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.StringController = function(Controller, dom, common) {
            var StringController = function(object, property) {
                StringController.superclass.call(this, object, property);
                var _this = this;
                this.__input = document.createElement("input");
                this.__input.setAttribute("type", "text");
                dom.bind(this.__input, "keyup", onChange);
                dom.bind(this.__input, "change", onChange);
                dom.bind(this.__input, "blur", onBlur);
                dom.bind(this.__input, "keydown", function(e) {
                    if (e.keyCode === 13) {
                        this.blur();
                    }
                });
                function onChange() {
                    _this.setValue(_this.__input.value);
                }
                function onBlur() {
                    if (_this.__onFinishChange) {
                        _this.__onFinishChange.call(_this, _this.getValue());
                    }
                }
                this.updateDisplay();
                this.domElement.appendChild(this.__input);
            };
            StringController.superclass = Controller;
            common.extend(StringController.prototype, Controller.prototype, {
                updateDisplay: function() {
                    if (!dom.isActive(this.__input)) {
                        this.__input.value = this.getValue();
                    }
                    return StringController.superclass.prototype.updateDisplay.call(this);
                }
            });
            return StringController;
        }(dat.controllers.Controller, dat.dom.dom, dat.utils.common), dat.controllers.FunctionController, dat.controllers.BooleanController, dat.utils.common), dat.controllers.Controller, dat.controllers.BooleanController, dat.controllers.FunctionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.OptionController, dat.controllers.ColorController = function(Controller, dom, Color, interpret, common) {
            var ColorController = function(object, property) {
                ColorController.superclass.call(this, object, property);
                this.__color = new Color(this.getValue());
                this.__temp = new Color(0);
                var _this = this;
                this.domElement = document.createElement("div");
                dom.makeSelectable(this.domElement, false);
                this.__selector = document.createElement("div");
                this.__selector.className = "selector";
                this.__saturation_field = document.createElement("div");
                this.__saturation_field.className = "saturation-field";
                this.__field_knob = document.createElement("div");
                this.__field_knob.className = "field-knob";
                this.__field_knob_border = "2px solid ";
                this.__hue_knob = document.createElement("div");
                this.__hue_knob.className = "hue-knob";
                this.__hue_field = document.createElement("div");
                this.__hue_field.className = "hue-field";
                this.__input = document.createElement("input");
                this.__input.type = "text";
                this.__input_textShadow = "0 1px 1px ";
                dom.bind(this.__input, "keydown", function(e) {
                    if (e.keyCode === 13) {
                        onBlur.call(this);
                    }
                });
                dom.bind(this.__input, "blur", onBlur);
                dom.bind(this.__selector, "mousedown", function(e) {
                    dom.addClass(this, "drag").bind(window, "mouseup", function(e) {
                        dom.removeClass(_this.__selector, "drag");
                    });
                });
                var value_field = document.createElement("div");
                common.extend(this.__selector.style, {
                    width: "122px",
                    height: "102px",
                    padding: "3px",
                    backgroundColor: "#222",
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
                });
                common.extend(this.__field_knob.style, {
                    position: "absolute",
                    width: "12px",
                    height: "12px",
                    border: this.__field_knob_border + (this.__color.v < .5 ? "#fff" : "#000"),
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
                    borderRadius: "12px",
                    zIndex: 1
                });
                common.extend(this.__hue_knob.style, {
                    position: "absolute",
                    width: "15px",
                    height: "2px",
                    borderRight: "4px solid #fff",
                    zIndex: 1
                });
                common.extend(this.__saturation_field.style, {
                    width: "100px",
                    height: "100px",
                    border: "1px solid #555",
                    marginRight: "3px",
                    display: "inline-block",
                    cursor: "pointer"
                });
                common.extend(value_field.style, {
                    width: "100%",
                    height: "100%",
                    background: "none"
                });
                linearGradient(value_field, "top", "rgba(0,0,0,0)", "#000");
                common.extend(this.__hue_field.style, {
                    width: "15px",
                    height: "100px",
                    display: "inline-block",
                    border: "1px solid #555",
                    cursor: "ns-resize"
                });
                hueGradient(this.__hue_field);
                common.extend(this.__input.style, {
                    outline: "none",
                    textAlign: "center",
                    color: "#fff",
                    border: 0,
                    fontWeight: "bold",
                    textShadow: this.__input_textShadow + "rgba(0,0,0,0.7)"
                });
                dom.bind(this.__saturation_field, "mousedown", fieldDown);
                dom.bind(this.__field_knob, "mousedown", fieldDown);
                dom.bind(this.__hue_field, "mousedown", function(e) {
                    setH(e);
                    dom.bind(window, "mousemove", setH);
                    dom.bind(window, "mouseup", unbindH);
                });
                function fieldDown(e) {
                    setSV(e);
                    dom.bind(window, "mousemove", setSV);
                    dom.bind(window, "mouseup", unbindSV);
                }
                function unbindSV() {
                    dom.unbind(window, "mousemove", setSV);
                    dom.unbind(window, "mouseup", unbindSV);
                }
                function onBlur() {
                    var i = interpret(this.value);
                    if (i !== false) {
                        _this.__color.__state = i;
                        _this.setValue(_this.__color.toOriginal());
                    } else {
                        this.value = _this.__color.toString();
                    }
                }
                function unbindH() {
                    dom.unbind(window, "mousemove", setH);
                    dom.unbind(window, "mouseup", unbindH);
                }
                this.__saturation_field.appendChild(value_field);
                this.__selector.appendChild(this.__field_knob);
                this.__selector.appendChild(this.__saturation_field);
                this.__selector.appendChild(this.__hue_field);
                this.__hue_field.appendChild(this.__hue_knob);
                this.domElement.appendChild(this.__input);
                this.domElement.appendChild(this.__selector);
                this.updateDisplay();
                function setSV(e) {
                    e.preventDefault();
                    var w = dom.getWidth(_this.__saturation_field);
                    var o = dom.getOffset(_this.__saturation_field);
                    var s = (e.clientX - o.left + document.body.scrollLeft) / w;
                    var v = 1 - (e.clientY - o.top + document.body.scrollTop) / w;
                    if (v > 1) v = 1; else if (v < 0) v = 0;
                    if (s > 1) s = 1; else if (s < 0) s = 0;
                    _this.__color.v = v;
                    _this.__color.s = s;
                    _this.setValue(_this.__color.toOriginal());
                    return false;
                }
                function setH(e) {
                    e.preventDefault();
                    var s = dom.getHeight(_this.__hue_field);
                    var o = dom.getOffset(_this.__hue_field);
                    var h = 1 - (e.clientY - o.top + document.body.scrollTop) / s;
                    if (h > 1) h = 1; else if (h < 0) h = 0;
                    _this.__color.h = h * 360;
                    _this.setValue(_this.__color.toOriginal());
                    return false;
                }
            };
            ColorController.superclass = Controller;
            common.extend(ColorController.prototype, Controller.prototype, {
                updateDisplay: function() {
                    var i = interpret(this.getValue());
                    if (i !== false) {
                        var mismatch = false;
                        common.each(Color.COMPONENTS, function(component) {
                            if (!common.isUndefined(i[component]) && !common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
                                mismatch = true;
                                return {};
                            }
                        }, this);
                        if (mismatch) {
                            common.extend(this.__color.__state, i);
                        }
                    }
                    common.extend(this.__temp.__state, this.__color.__state);
                    this.__temp.a = 1;
                    var flip = this.__color.v < .5 || this.__color.s > .5 ? 255 : 0;
                    var _flip = 255 - flip;
                    common.extend(this.__field_knob.style, {
                        marginLeft: 100 * this.__color.s - 7 + "px",
                        marginTop: 100 * (1 - this.__color.v) - 7 + "px",
                        backgroundColor: this.__temp.toString(),
                        border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")"
                    });
                    this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
                    this.__temp.s = 1;
                    this.__temp.v = 1;
                    linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toString());
                    common.extend(this.__input.style, {
                        backgroundColor: this.__input.value = this.__color.toString(),
                        color: "rgb(" + flip + "," + flip + "," + flip + ")",
                        textShadow: this.__input_textShadow + "rgba(" + _flip + "," + _flip + "," + _flip + ",.7)"
                    });
                }
            });
            var vendors = [ "-moz-", "-o-", "-webkit-", "-ms-", "" ];
            function linearGradient(elem, x, a, b) {
                elem.style.background = "";
                common.each(vendors, function(vendor) {
                    elem.style.cssText += "background: " + vendor + "linear-gradient(" + x + ", " + a + " 0%, " + b + " 100%); ";
                });
            }
            function hueGradient(elem) {
                elem.style.background = "";
                elem.style.cssText += "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
                elem.style.cssText += "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
                elem.style.cssText += "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
                elem.style.cssText += "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
                elem.style.cssText += "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
            }
            return ColorController;
        }(dat.controllers.Controller, dat.dom.dom, dat.color.Color = function(interpret, math, toString, common) {
            var Color = function() {
                this.__state = interpret.apply(this, arguments);
                if (this.__state === false) {
                    throw "Failed to interpret color arguments";
                }
                this.__state.a = this.__state.a || 1;
            };
            Color.COMPONENTS = [ "r", "g", "b", "h", "s", "v", "hex", "a" ];
            common.extend(Color.prototype, {
                toString: function() {
                    return toString(this);
                },
                toOriginal: function() {
                    return this.__state.conversion.write(this);
                }
            });
            defineRGBComponent(Color.prototype, "r", 2);
            defineRGBComponent(Color.prototype, "g", 1);
            defineRGBComponent(Color.prototype, "b", 0);
            defineHSVComponent(Color.prototype, "h");
            defineHSVComponent(Color.prototype, "s");
            defineHSVComponent(Color.prototype, "v");
            Object.defineProperty(Color.prototype, "a", {
                get: function() {
                    return this.__state.a;
                },
                set: function(v) {
                    this.__state.a = v;
                }
            });
            Object.defineProperty(Color.prototype, "hex", {
                get: function() {
                    if (!this.__state.space !== "HEX") {
                        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
                    }
                    return this.__state.hex;
                },
                set: function(v) {
                    this.__state.space = "HEX";
                    this.__state.hex = v;
                }
            });
            function defineRGBComponent(target, component, componentHexIndex) {
                Object.defineProperty(target, component, {
                    get: function() {
                        if (this.__state.space === "RGB") {
                            return this.__state[component];
                        }
                        recalculateRGB(this, component, componentHexIndex);
                        return this.__state[component];
                    },
                    set: function(v) {
                        if (this.__state.space !== "RGB") {
                            recalculateRGB(this, component, componentHexIndex);
                            this.__state.space = "RGB";
                        }
                        this.__state[component] = v;
                    }
                });
            }
            function defineHSVComponent(target, component) {
                Object.defineProperty(target, component, {
                    get: function() {
                        if (this.__state.space === "HSV") return this.__state[component];
                        recalculateHSV(this);
                        return this.__state[component];
                    },
                    set: function(v) {
                        if (this.__state.space !== "HSV") {
                            recalculateHSV(this);
                            this.__state.space = "HSV";
                        }
                        this.__state[component] = v;
                    }
                });
            }
            function recalculateRGB(color, component, componentHexIndex) {
                if (color.__state.space === "HEX") {
                    color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);
                } else if (color.__state.space === "HSV") {
                    common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
                } else {
                    throw "Corrupted color state";
                }
            }
            function recalculateHSV(color) {
                var result = math.rgb_to_hsv(color.r, color.g, color.b);
                common.extend(color.__state, {
                    s: result.s,
                    v: result.v
                });
                if (!common.isNaN(result.h)) {
                    color.__state.h = result.h;
                } else if (common.isUndefined(color.__state.h)) {
                    color.__state.h = 0;
                }
            }
            return Color;
        }(dat.color.interpret, dat.color.math = function() {
            var tmpComponent;
            return {
                hsv_to_rgb: function(h, s, v) {
                    var hi = Math.floor(h / 60) % 6;
                    var f = h / 60 - Math.floor(h / 60);
                    var p = v * (1 - s);
                    var q = v * (1 - f * s);
                    var t = v * (1 - (1 - f) * s);
                    var c = [ [ v, t, p ], [ q, v, p ], [ p, v, t ], [ p, q, v ], [ t, p, v ], [ v, p, q ] ][hi];
                    return {
                        r: c[0] * 255,
                        g: c[1] * 255,
                        b: c[2] * 255
                    };
                },
                rgb_to_hsv: function(r, g, b) {
                    var min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s;
                    if (max != 0) {
                        s = delta / max;
                    } else {
                        return {
                            h: NaN,
                            s: 0,
                            v: 0
                        };
                    }
                    if (r == max) {
                        h = (g - b) / delta;
                    } else if (g == max) {
                        h = 2 + (b - r) / delta;
                    } else {
                        h = 4 + (r - g) / delta;
                    }
                    h /= 6;
                    if (h < 0) {
                        h += 1;
                    }
                    return {
                        h: h * 360,
                        s: s,
                        v: max / 255
                    };
                },
                rgb_to_hex: function(r, g, b) {
                    var hex = this.hex_with_component(0, 2, r);
                    hex = this.hex_with_component(hex, 1, g);
                    hex = this.hex_with_component(hex, 0, b);
                    return hex;
                },
                component_from_hex: function(hex, componentIndex) {
                    return hex >> componentIndex * 8 & 255;
                },
                hex_with_component: function(hex, componentIndex, value) {
                    return value << (tmpComponent = componentIndex * 8) | hex & ~(255 << tmpComponent);
                }
            };
        }(), dat.color.toString, dat.utils.common), dat.color.interpret, dat.utils.common), dat.utils.requestAnimationFrame = function() {
            return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
                window.setTimeout(callback, 1e3 / 60);
            };
        }(), dat.dom.CenteredDiv = function(dom, common) {
            var CenteredDiv = function() {
                this.backgroundElement = document.createElement("div");
                common.extend(this.backgroundElement.style, {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    top: 0,
                    left: 0,
                    display: "none",
                    zIndex: "1000",
                    opacity: 0,
                    WebkitTransition: "opacity 0.2s linear"
                });
                dom.makeFullscreen(this.backgroundElement);
                this.backgroundElement.style.position = "fixed";
                this.domElement = document.createElement("div");
                common.extend(this.domElement.style, {
                    position: "fixed",
                    display: "none",
                    zIndex: "1001",
                    opacity: 0,
                    WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear"
                });
                document.body.appendChild(this.backgroundElement);
                document.body.appendChild(this.domElement);
                var _this = this;
                dom.bind(this.backgroundElement, "click", function() {
                    _this.hide();
                });
            };
            CenteredDiv.prototype.show = function() {
                var _this = this;
                this.backgroundElement.style.display = "block";
                this.domElement.style.display = "block";
                this.domElement.style.opacity = 0;
                this.domElement.style.webkitTransform = "scale(1.1)";
                this.layout();
                common.defer(function() {
                    _this.backgroundElement.style.opacity = 1;
                    _this.domElement.style.opacity = 1;
                    _this.domElement.style.webkitTransform = "scale(1)";
                });
            };
            CenteredDiv.prototype.hide = function() {
                var _this = this;
                var hide = function() {
                    _this.domElement.style.display = "none";
                    _this.backgroundElement.style.display = "none";
                    dom.unbind(_this.domElement, "webkitTransitionEnd", hide);
                    dom.unbind(_this.domElement, "transitionend", hide);
                    dom.unbind(_this.domElement, "oTransitionEnd", hide);
                };
                dom.bind(this.domElement, "webkitTransitionEnd", hide);
                dom.bind(this.domElement, "transitionend", hide);
                dom.bind(this.domElement, "oTransitionEnd", hide);
                this.backgroundElement.style.opacity = 0;
                this.domElement.style.opacity = 0;
                this.domElement.style.webkitTransform = "scale(1.1)";
            };
            CenteredDiv.prototype.layout = function() {
                this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + "px";
                this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + "px";
            };
            function lockScroll(e) {
                console.log(e);
            }
            return CenteredDiv;
        }(dat.dom.dom, dat.utils.common), dat.dom.dom, dat.utils.common);
    }, {} ],
    4: [ function(require, module, exports) {
        (function() {
            "use strict";
            var dat = require("dat-gui");
            var _ = require("./polyfills");
            var Buddhabrot = require("./buddhabrot");
            var setupCanvas = function() {
                var canvas = document.getElementById("main");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                return canvas;
            };
            var featureDetection = {};
            featureDetection.downloadAttribute = function() {
                var a = document.createElement("a");
                return typeof a.download === "string";
            }();
            var BrotJS = function(canvas) {
                this.canvas = canvas;
                this.count = 0;
                this.buddhas = [];
                this.states = [];
                this.windowSize = 3;
                this.setupGUI();
            };
            BrotJS.prototype.run = function() {
                this.addBuddhabrot();
                this.draw = this.createDrawHandler();
                this.draw();
            };
            BrotJS.prototype.addBuddhabrot = function() {
                this.count++;
                var buddha = new Buddhabrot({
                    width: this.canvas.width,
                    height: this.canvas.height,
                    batched: true,
                    infinite: true
                });
                this.buddhas.push(buddha);
                var state = {
                    paused: false,
                    sqrtNormalize: false,
                    autoNormalize: true,
                    maxEscapeIter: 8.6,
                    red: 0,
                    green: 255,
                    blue: 255,
                    alpha: 1
                };
                this.states.push(state);
                this.addToGUI(buddha, state, this.count);
                buddha.run();
            };
            BrotJS.prototype.setupGUI = function() {
                var self = this;
                self.gui = new dat.GUI();
                self.gui.add(self, "addBuddhabrot");
                if (featureDetection.downloadAttribute) {
                    self.gui.add(self, "saveImage");
                }
            };
            BrotJS.prototype.addToGUI = function(buddha, state, n) {
                var self = this;
                var coreFolder = self.gui.addFolder("Config " + n);
                var setConfigChanged = function() {
                    self.configChanged = true;
                };
                var pausedCtrl = coreFolder.add(state, "paused");
                pausedCtrl.onChange(function(paused) {
                    if (paused) {
                        buddha.pause();
                    } else {
                        buddha.resume();
                    }
                });
                coreFolder.add(buddha, "resetImage").onChange(setConfigChanged);
                var escapeCtrl = coreFolder.add(state, "maxEscapeIter", 1, 30);
                escapeCtrl.onChange(function(value) {
                    value = Math.pow(2, value / 2) + 2 | 0;
                    buddha.config.maxEscapeIter = value;
                });
                coreFolder.add(buddha.config, "batchSize", 1e3, 1e5);
                coreFolder.add(buddha.config, "anti");
                var sqrtNormalizeCtrl = coreFolder.add(state, "sqrtNormalize");
                sqrtNormalizeCtrl.onChange(function(sqrtNormalize) {
                    setConfigChanged();
                    buddha.data.sqrtNormalize = sqrtNormalize;
                });
                var autoNormalizeCtrl = coreFolder.add(state, "autoNormalize");
                autoNormalizeCtrl.onChange(function(autoNormalize) {
                    setConfigChanged();
                    if (autoNormalize && coreFolder.normalizerCtrl) {
                        coreFolder.normalizerCtrl.remove();
                        buddha.data.userNormalizer = null;
                        buddha.data.normalizeImage();
                    } else {
                        buddha.data.userNormalizer = buddha.data.maxHits || 1;
                        coreFolder.normalizerCtrl = coreFolder.add(buddha.data, "userNormalizer").min(1);
                        coreFolder.normalizerCtrl.onChange(function(normalizer) {
                            setConfigChanged();
                            buddha.data.normalizeImage();
                        });
                    }
                });
                coreFolder.open();
                var colorFolder = self.gui.addFolder("Color " + n);
                colorFolder.add(state, "red", 0, 255).onChange(setConfigChanged);
                colorFolder.add(state, "green", 0, 255).onChange(setConfigChanged);
                colorFolder.add(state, "blue", 0, 255).onChange(setConfigChanged);
                colorFolder.add(state, "alpha", 0, 1).onChange(setConfigChanged);
            };
            BrotJS.prototype.saveImage = function() {
                var data = this.canvas.toDataURL("image/png");
                var a = document.createElement("a");
                a.style.display = "none";
                document.body.appendChild(a);
                a.download = "buddhabrot.png";
                a.href = data;
                a.click();
                document.body.removeChild(a);
            };
            BrotJS.prototype.createDrawHandler = function() {
                var self = this;
                var canvas = self.canvas;
                var ctx = canvas.getContext("2d");
                var imageData = ctx.createImageData(canvas.width, canvas.height);
                var pixels = imageData.data;
                var states = self.states;
                var pixLen = imageData.width * imageData.height;
                (function() {
                    for (var i = 0; i < pixLen; i++) {
                        var idx = i * 4;
                        pixels[idx + 3] = 255;
                    }
                })();
                var batchAvailable = function() {
                    var res = false, i, buddha;
                    for (i = 0; i < self.count; i++) {
                        buddha = self.buddhas[i];
                        if (buddha.batchAvailable) {
                            res = true;
                            buddha.batchAvailable = false;
                        }
                    }
                    return res;
                };
                var getImages = function() {
                    var images = [], i, image;
                    for (i = 0; i < self.count; i++) {
                        image = self.buddhas[i].getImage();
                        if (image) {
                            images.push(image);
                        }
                    }
                    return images;
                };
                var draw = function() {
                    if (!batchAvailable() && !self.configChanged) {
                        self.requestID = requestAnimationFrame(draw);
                        return;
                    }
                    self.configChanged = false;
                    var images = getImages(), imgLen = images.length, red, green, blue, i, j, idx, image, state, alpha, alphaImgLen = 1;
                    if (imgLen > 1) {
                        alphaImgLen = 0;
                        for (j = 0; j < imgLen; j++) {
                            alphaImgLen += states[j].alpha;
                        }
                    }
                    image = images[0];
                    state = states[0];
                    alpha = state.alpha;
                    for (i = 0; i < pixLen; i++) {
                        idx = i * 4;
                        pixels[idx] = state.red * image[i] * alpha / alphaImgLen;
                        pixels[idx + 1] = state.green * image[i] * alpha / alphaImgLen;
                        pixels[idx + 2] = state.blue * image[i] * alpha / alphaImgLen;
                    }
                    for (j = 1; j < imgLen; j++) {
                        image = images[j];
                        state = states[j];
                        alpha = state.alpha;
                        for (i = 0; i < pixLen; i++) {
                            idx = i * 4;
                            pixels[idx] += state.red * image[i] * alpha / alphaImgLen;
                            pixels[idx + 1] += state.green * image[i] * alpha / alphaImgLen;
                            pixels[idx + 2] += state.blue * image[i] * alpha / alphaImgLen;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                    self.requestID = requestAnimationFrame(draw);
                };
                return draw;
            };
            window.onload = function() {
                var canvas = setupCanvas();
                var brot = new BrotJS(canvas);
                brot.run();
            };
        })();
    }, {
        "./buddhabrot": 5,
        "./polyfills": 8,
        "dat-gui": 1
    } ],
    5: [ function(require, module, exports) {
        (function() {
            "use strict";
            var BuddhaConfig = require("./buddhaconfig");
            var BuddhaData = require("./buddhadata");
            var Buddhabrot = function(options) {
                if (!(this instanceof Buddhabrot)) {
                    return new Buddhabrot(options);
                }
                this.config = new BuddhaConfig(options);
                this.config.computeConfig();
                this.data = new BuddhaData(this.config);
                this.callback = options.callback || function() {};
                this.i = 0;
                this.allocated = false;
                this.paused = false;
                this.complete = false;
                this.batchAvailable = false;
                this._scheduleBatchBound = this._scheduleBatch.bind(this);
            };
            Buddhabrot.prototype.run = function(callback) {
                this.callback = callback || this.callback;
                this.data.allocate();
                this.allocated = true;
                if (this.config.batched) {
                    this.timeoutID = setTimeout(this._scheduleBatchBound);
                } else {
                    this._computeTrajectories();
                    this.callback(this.getImage());
                }
            };
            Buddhabrot.prototype.pause = function() {
                this.paused = true;
                clearTimeout(this.timeoutID);
            };
            Buddhabrot.prototype.resume = function() {
                if (this.paused) {
                    this.timeoutID = setTimeout(this._scheduleBatchBound);
                    this.paused = false;
                }
            };
            Buddhabrot.prototype.getImage = function() {
                if (!this.allocated) {
                    return undefined;
                }
                return this.data.normedImage;
            };
            Buddhabrot.prototype.resetImage = function() {
                if (!this.allocated) {
                    return;
                }
                this.data.resetImage();
            };
            Buddhabrot.prototype._scheduleBatch = function() {
                this._computeTrajectories();
                if (!this.complete) {
                    if (!this.paused) {
                        this.batchAvailable = true;
                        this.timeoutID = setTimeout(this._scheduleBatchBound);
                    }
                } else {
                    this.callback(this.getImage());
                }
            };
            Buddhabrot.prototype._computeTrajectories = function() {
                var i = this.i, l = this.config.iterations, batchend = i + this.config.batchSize, end = batchend < l || this.config.infinite ? batchend : l, xstart = this.config.xstart, xlength = this.config.xlength, ystart = this.config.ystart, ylength = this.config.ylength, cx, cy;
                for (;i < end; i++) {
                    cx = xstart + Math.random() * xlength;
                    cy = ystart + Math.random() * ylength;
                    this._traceTrajectory(cx, cy);
                }
                this.i = i;
                this.data.normalizeImage();
                if (this.i === l && !this.config.infinite) {
                    this.complete = true;
                }
            };
            Buddhabrot.prototype._traceTrajectory = function(cx, cy) {
                var real = cy, imag = cx, real0 = real, imag0 = imag, i = 0, maxEscapeIter = this.config.maxEscapeIter, data = this.data, realPrime, imagPrime;
                while (this._isBounded(real, imag) && i < maxEscapeIter) {
                    data.cacheTrajectory(real, imag, i);
                    realPrime = real * real - imag * imag + real0;
                    imagPrime = 2 * imag * real + imag0;
                    real = realPrime;
                    imag = imagPrime;
                    i++;
                }
                if (this._checkCriteria(i)) {
                    data.saveTrajectory(i);
                }
            };
            Buddhabrot.prototype._isBounded = function(real, imag) {
                return !(real < this.config.ystart || real > this.config.yend || imag < this.config.xstart || imag > this.config.xend);
            };
            Buddhabrot.prototype._checkCriteria = function(iteration) {
                if (this.config.anti) {
                    return iteration === this.config.maxEscapeIter;
                } else {
                    return iteration < this.config.maxEscapeIter;
                }
            };
            module.exports = Buddhabrot;
        })();
    }, {
        "./buddhaconfig": 6,
        "./buddhadata": 7
    } ],
    6: [ function(require, module, exports) {
        (function() {
            "use strict";
            var BuddhaConfig = function(options) {
                if (!(this instanceof BuddhaConfig)) {
                    return new BuddhaConfig(options);
                }
                this.width = options.width || options.w;
                this.height = options.height || options.h;
                if (options.infinite && !options.batched) {
                    throw new Error("An infinite BuddhaBrot must be batched");
                }
                this.infinite = options.infinite || false;
                this.iterations = options.iterations || 1e9;
                this.maxEscapeIter = options.maxEscapeIter || options.max || 20;
                this.batched = !options.batched ? false : true;
                this.batchSize = (options.batchSize < 0 ? null : options.batchSize) || 5e4;
                this.anti = options.anti || false;
                if (!this.batched) {
                    this.batchSize = this.iterations;
                }
            };
            BuddhaConfig.prototype.computeConfig = function() {
                var INT_BYTES = 4, FLOAT_BYTES = 4;
                this.pixels = this.width * this.height;
                var spaceSize = this.pixels % 2 === 0 ? this.pixels : this.pixels + 1;
                this.imageProcBytes = spaceSize * INT_BYTES + spaceSize * FLOAT_BYTES;
                this.bufLength = this.imageProcBytes * 2;
                var remainder = this.bufLength - this.imageProcBytes;
                while (remainder < this.maxEscapeIter * FLOAT_BYTES * 2) {
                    this.bufLength = this.bufLength * 2;
                    remainder = this.bufLength - this.imageProcBytes;
                }
                this.imageStart = 0;
                this.imageLength = spaceSize;
                this.normedImageStart = this.imageLength * INT_BYTES;
                this.normedImageLength = spaceSize;
                this.cacheStart = this.normedImageStart + this.normedImageLength * FLOAT_BYTES;
                this.cacheLength = (this.bufLength - this.cacheStart) / FLOAT_BYTES;
                var MANDEL_REAL_LOWER = -2.5, MANDEL_REAL_UPPER = 1, MANDEL_IMAG_LOWER = -1, MANDEL_IMAG_UPPER = 1, MANDEL_REAL_LENGTH = MANDEL_REAL_UPPER - MANDEL_REAL_LOWER, MANDEL_IMAG_LENGTH = MANDEL_IMAG_UPPER - MANDEL_IMAG_LOWER, MANDEL_RATIO = MANDEL_REAL_LENGTH / MANDEL_IMAG_LENGTH;
                var heightToWidthRatio = this.height / this.width;
                if (heightToWidthRatio <= MANDEL_RATIO) {
                    this.ystart = MANDEL_REAL_LOWER;
                    this.ylength = MANDEL_REAL_LENGTH;
                    this.xlength = this.ylength / heightToWidthRatio;
                    this.xstart = 0 - this.xlength / 2;
                } else {
                    this.xstart = MANDEL_IMAG_LOWER;
                    this.xlength = MANDEL_IMAG_LENGTH;
                    this.ylength = this.xlength * heightToWidthRatio;
                    this.ystart = MANDEL_REAL_LOWER + MANDEL_REAL_LENGTH / 2 - this.ylength / 2;
                }
                this.xend = this.xstart + this.xlength;
                this.yend = this.ystart + this.ylength;
                this.dx = this.xlength / this.width;
                this.dy = this.ylength / this.height;
                this.initialized = true;
            };
            module.exports = BuddhaConfig;
        })();
    }, {} ],
    7: [ function(require, module, exports) {
        (function() {
            "use strict";
            var BuddhaData = function(config) {
                if (!(this instanceof BuddhaData)) {
                    return new BuddhaData(config);
                }
                this.config = config;
                this.maxHits = 0;
                this.sqrtNormalize = false;
                this.userNormalizer = null;
            };
            BuddhaData.prototype.allocate = function() {
                if (!this.config.initialized) {
                    throw new Error("BuddhaConfig has not been initialized");
                }
                this.buf = new ArrayBuffer(this.config.bufLength);
                this.image = new Int32Array(this.buf, this.config.imageStart, this.config.imageLength);
                this.normedImage = new Float32Array(this.buf, this.config.normedImageStart, this.config.normedImageLength);
                this.cache = new Float32Array(this.buf, this.config.cacheStart, this.config.cacheLength);
            };
            BuddhaData.prototype.resetImage = function() {
                var i, l;
                for (i = 0, l = this.config.pixels; i < l; i++) {
                    this.image[i] = 0;
                    this.normedImage[i] = 0;
                }
                this.maxHits = 0;
            };
            BuddhaData.prototype.normalizeImage = function() {
                var normalizer = this.userNormalizer || this.maxHits || 1, i, l;
                if (this.sqrtNormalize) {
                    normalizer = Math.sqrt(normalizer);
                    for (i = 0, l = this.config.pixels; i < l; i++) {
                        this.normedImage[i] = Math.sqrt(this.image[i]) / normalizer;
                    }
                } else {
                    for (i = 0, l = this.config.pixels; i < l; i++) {
                        this.normedImage[i] = this.image[i] / normalizer;
                    }
                }
            };
            BuddhaData.prototype.cacheTrajectory = function(real, imag, i) {
                var offset = 2 * i;
                this.cache[offset] = real;
                this.cache[offset + 1] = imag;
            };
            BuddhaData.prototype.saveTrajectory = function(iterationCount) {
                var xstart = this.config.xstart, xend = this.config.xend, ystart = this.config.ystart, yend = this.config.yend, dx = this.config.dx, dy = this.config.dy, width = this.config.width, i, offset, x, y, row, col, index, hits;
                for (i = 0; i < iterationCount; i++) {
                    offset = 2 * i;
                    y = this.cache[offset];
                    x = this.cache[offset + 1];
                    if (x < xstart || x > xend || y < ystart || y > yend) {
                        continue;
                    }
                    row = (y - ystart) / dy | 0;
                    col = (x - xstart) / dx | 0;
                    index = row * width + col;
                    hits = ++this.image[index];
                    col = (-x - xstart) / dx | 0;
                    index = row * width + col;
                    this.image[index]++;
                    if (this.maxHits < hits) {
                        this.maxHits = hits;
                    }
                }
            };
            module.exports = BuddhaData;
        })();
    }, {} ],
    8: [ function(require, module, exports) {
        (function() {
            "use strict";
            (function() {
                var lastTime = 0, vendors = [ "ms", "moz", "webkit", "o" ], i;
                for (i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
                    window.requestAnimationFrame = window[vendors[i] + "RequestAnimationFrame"];
                    window.cancelAnimationFrame = window[vendors[i] + "CancelAnimationFrame"] || window[vendors[i] + "CancelRequestAnimationFrame"];
                }
                if (!window.requestAnimationFrame) {
                    window.requestAnimationFrame = function(callback, element) {
                        var currTime = new Date().getTime();
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                        var id = setTimeout(function() {
                            callback(currTime + timeToCall);
                        }, timeToCall);
                        lastTime = currTime + timeToCall;
                        return id;
                    };
                }
                if (!window.cancelAnimationFrame) {
                    window.cancelAnimationFrame = function(id) {
                        clearTimeout(id);
                    };
                }
            })();
            (function() {
                if (!("bind" in Function.prototype)) {
                    Function.prototype.bind = function(to) {
                        var splice = Array.prototype.splice, partialArgs = splice.call(arguments, 1), fn = this;
                        var bound = function() {
                            var args = partialArgs.concat(splice.call(arguments, 0));
                            if (!(this instanceof bound)) {
                                return fn.apply(to, args);
                            }
                            fn.apply(this, args);
                        };
                        bound.prototype = fn.prototype;
                        return bound;
                    };
                }
            })();
        })();
    }, {} ]
}, {}, [ 4 ]);