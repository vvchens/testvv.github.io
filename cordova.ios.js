// Platform: ios
// 91157c2e1bf3eb098c7e2ab31404e895ccb0df2a
/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */
;(function() {
  var PLATFORM_VERSION_BUILD_LABEL = '3.7.0';
  // file: src/scripts/require.js
  
/*jshint -W079 */
/*jshint -W020 */
  
  var require,
  define;
  
  (function () {
   var modules = {},
   // Stack of moduleIds currently being built.
   requireStack = [],
   // Map of module ID -> index into requireStack of modules currently being built.
   inProgressModules = {},
   SEPARATOR = ".";
   
   
   
   function build(module) {
   var factory = module.factory,
   localRequire = function (id) {
   var resultantId = id;
   //Its a relative path, so lop off the last portion and add the id (minus "./")
   if (id.charAt(0) === ".") {
   resultantId = module.id.slice(0, module.id.lastIndexOf(SEPARATOR)) + SEPARATOR + id.slice(2);
   }
   return require(resultantId);
   };
   module.exports = {};
   delete module.factory;
   factory(localRequire, module.exports, module);
   return module.exports;
   }
   
   require = function (id) {
   if (!modules[id]) {
   throw "module " + id + " not found";
   } else if (id in inProgressModules) {
   var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
   throw "Cycle in require graph: " + cycle;
   }
   if (modules[id].factory) {
   try {
   inProgressModules[id] = requireStack.length;
   requireStack.push(id);
   return build(modules[id]);
   } finally {
   delete inProgressModules[id];
   requireStack.pop();
   }
   }
   return modules[id].exports;
   };
   
   define = function (id, factory) {
   if (modules[id]) {
   throw "module " + id + " already defined";
   }
   
   modules[id] = {
   id: id,
   factory: factory
   };
   };
   
   define.remove = function (id) {
   delete modules[id];
   };
   
   define.moduleMap = modules;
   })();
  
  //Export for use in node
  if (typeof module === "object" && typeof require === "function") {
  module.exports.require = require;
  module.exports.define = define;
  }
  
  // file: src/cordova.js
  define("cordova", function(require, exports, module) {
         
         
         var channel = require('cordova/channel');
         var platform = require('cordova/platform');
         
/**
 * Intercept calls to addEventListener + removeEventListener and handle deviceready,
 * resume, and pause events.
 */
         var m_document_addEventListener = document.addEventListener;
         var m_document_removeEventListener = document.removeEventListener;
         var m_window_addEventListener = window.addEventListener;
         var m_window_removeEventListener = window.removeEventListener;
         
/**
 * Houses custom event handlers to intercept on document + window event listeners.
 */
         var documentEventHandlers = {},
         windowEventHandlers = {};
         
         document.addEventListener = function(evt, handler, capture) {
         var e = evt.toLowerCase();
         if (typeof documentEventHandlers[e] != 'undefined') {
         documentEventHandlers[e].subscribe(handler);
         } else {
         m_document_addEventListener.call(document, evt, handler, capture);
         }
         };
         
         window.addEventListener = function(evt, handler, capture) {
         var e = evt.toLowerCase();
         if (typeof windowEventHandlers[e] != 'undefined') {
         windowEventHandlers[e].subscribe(handler);
         } else {
         m_window_addEventListener.call(window, evt, handler, capture);
         }
         };
         
         document.removeEventListener = function(evt, handler, capture) {
         var e = evt.toLowerCase();
         // If unsubscribing from an event that is handled by a plugin
         if (typeof documentEventHandlers[e] != "undefined") {
         documentEventHandlers[e].unsubscribe(handler);
         } else {
         m_document_removeEventListener.call(document, evt, handler, capture);
         }
         };
         
         window.removeEventListener = function(evt, handler, capture) {
         var e = evt.toLowerCase();
         // If unsubscribing from an event that is handled by a plugin
         if (typeof windowEventHandlers[e] != "undefined") {
         windowEventHandlers[e].unsubscribe(handler);
         } else {
         m_window_removeEventListener.call(window, evt, handler, capture);
         }
         };
         
         function createEvent(type, data) {
         var event = document.createEvent('Events');
         event.initEvent(type, false, false);
         if (data) {
         for (var i in data) {
         if (data.hasOwnProperty(i)) {
         event[i] = data[i];
         }
         }
         }
         return event;
         }
         
         
         var cordova = {
         define:define,
         require:require,
         version:PLATFORM_VERSION_BUILD_LABEL,
         platformVersion:PLATFORM_VERSION_BUILD_LABEL,
         platformId:platform.id,
         /**
          * Methods to add/remove your own addEventListener hijacking on document + window.
          */
         addWindowEventHandler:function(event) {
         return (windowEventHandlers[event] = channel.create(event));
         },
         addStickyDocumentEventHandler:function(event) {
         return (documentEventHandlers[event] = channel.createSticky(event));
         },
         addDocumentEventHandler:function(event) {
         return (documentEventHandlers[event] = channel.create(event));
         },
         removeWindowEventHandler:function(event) {
         delete windowEventHandlers[event];
         },
         removeDocumentEventHandler:function(event) {
         delete documentEventHandlers[event];
         },
         /**
          * Retrieve original event handlers that were replaced by Cordova
          *
          * @return object
          */
         getOriginalHandlers: function() {
         return {'document': {'addEventListener': m_document_addEventListener, 'removeEventListener': m_document_removeEventListener},
         'window': {'addEventListener': m_window_addEventListener, 'removeEventListener': m_window_removeEventListener}};
         },
         /**
          * Method to fire event from native code
          * bNoDetach is required for events which cause an exception which needs to be caught in native code
          */
         fireDocumentEvent: function(type, data, bNoDetach) {
         var evt = createEvent(type, data);
         if (typeof documentEventHandlers[type] != 'undefined') {
         if( bNoDetach ) {
         documentEventHandlers[type].fire(evt);
         }
         else {
         setTimeout(function() {
                    // Fire deviceready on listeners that were registered before cordova.js was loaded.
                    if (type == 'deviceready') {
                    console.log("deviceready event is triging");
                    document.dispatchEvent(evt);
                    }
                    documentEventHandlers[type].fire(evt);
                    }, 0);
         }
         } else {
         document.dispatchEvent(evt);
         }
         },
         fireWindowEvent: function(type, data) {
         var evt = createEvent(type,data);
         if (typeof windowEventHandlers[type] != 'undefined') {
         setTimeout(function() {
                    windowEventHandlers[type].fire(evt);
                    }, 0);
         } else {
         window.dispatchEvent(evt);
         }
         },
         
         /**
          * Plugin callback mechanism.
          */
         // Randomize the starting callbackId to avoid collisions after refreshing or navigating.
         // This way, it's very unlikely that any new callback would get the same callbackId as an old callback.
         callbackId: Math.floor(Math.random() * 2000000000),
         callbacks:  {},
         callbackStatus: {
         NO_RESULT: 0,
         OK: 1,
         CLASS_NOT_FOUND_EXCEPTION: 2,
         ILLEGAL_ACCESS_EXCEPTION: 3,
         INSTANTIATION_EXCEPTION: 4,
         MALFORMED_URL_EXCEPTION: 5,
         IO_EXCEPTION: 6,
         INVALID_ACTION: 7,
         JSON_EXCEPTION: 8,
         ERROR: 9
         },
         
         /**
          * Called by native code when returning successful result from an action.
          */
         callbackSuccess: function(callbackId, args) {
         cordova.callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
         },
         
         /**
          * Called by native code when returning error result from an action.
          */
         callbackError: function(callbackId, args) {
         // TODO: Deprecate callbackSuccess and callbackError in favour of callbackFromNative.
         // Derive success from status.
         cordova.callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
         },
         
         /**
          * Called by native code when returning the result from an action.
          */
         callbackFromNative: function(callbackId, isSuccess, status, args, keepCallback) {
         try {
         var callback = cordova.callbacks[callbackId];
         if (callback) {
         if (isSuccess && status == cordova.callbackStatus.OK) {
         callback.success && callback.success.apply(null, args);
         } else {
         callback.fail && callback.fail.apply(null, args);
         }
         
         // Clear callback if not expecting any more results
         if (!keepCallback) {
         delete cordova.callbacks[callbackId];
         }
         }
         }
         catch (err) {
         var msg = "Error in " + (isSuccess ? "Success" : "Error") + " callbackId: " + callbackId + " : " + err;
         console && console.log && console.log(msg);
         cordova.fireWindowEvent("cordovacallbackerror", { 'message': msg });
         throw err;
         }
         },
         addConstructor: function(func) {
         channel.onCordovaReady.subscribe(function() {
                                          try {
                                          func();
                                          } catch(e) {
                                          console.log("Failed to run constructor: " + e);
                                          }
                                          });
         }
         };
         
         
         module.exports = cordova;
         
         });
  
  // file: src/common/argscheck.js
  define("cordova/argscheck", function(require, exports, module) {
         
         var exec = require('cordova/exec');
         var utils = require('cordova/utils');
         
         var moduleExports = module.exports;
         
         var typeMap = {
         'A': 'Array',
         'D': 'Date',
         'N': 'Number',
         'S': 'String',
         'F': 'Function',
         'O': 'Object'
         };
         
         function extractParamName(callee, argIndex) {
         return (/.*?\((.*?)\)/).exec(callee)[1].split(', ')[argIndex];
         }
         
         function checkArgs(spec, functionName, args, opt_callee) {
         if (!moduleExports.enableChecks) {
         return;
         }
         var errMsg = null;
         var typeName;
         for (var i = 0; i < spec.length; ++i) {
         var c = spec.charAt(i),
         cUpper = c.toUpperCase(),
         arg = args[i];
         // Asterix means allow anything.
         if (c == '*') {
         continue;
         }
         typeName = utils.typeName(arg);
         if ((arg === null || arg === undefined) && c == cUpper) {
         continue;
         }
         if (typeName != typeMap[cUpper]) {
         errMsg = 'Expected ' + typeMap[cUpper];
         break;
         }
         }
         if (errMsg) {
         errMsg += ', but got ' + typeName + '.';
         errMsg = 'Wrong type for parameter "' + extractParamName(opt_callee || args.callee, i) + '" of ' + functionName + ': ' + errMsg;
         // Don't log when running unit tests.
         if (typeof jasmine == 'undefined') {
         console.error(errMsg);
         }
         throw TypeError(errMsg);
         }
         }
         
         function getValue(value, defaultValue) {
         return value === undefined ? defaultValue : value;
         }
         
         moduleExports.checkArgs = checkArgs;
         moduleExports.getValue = getValue;
         moduleExports.enableChecks = true;
         
         
         });
  
  // file: src/common/base64.js
  define("cordova/base64", function(require, exports, module) {
         
         var base64 = exports;
         
         base64.fromArrayBuffer = function(arrayBuffer) {
         var array = new Uint8Array(arrayBuffer);
         return uint8ToBase64(array);
         };
         
         base64.toArrayBuffer = function(str) {
         var decodedStr = typeof atob != 'undefined' ? atob(str) : new Buffer(str,'base64').toString('binary');
         var arrayBuffer = new ArrayBuffer(decodedStr.length);
         var array = new Uint8Array(arrayBuffer);
         for (var i=0, len=decodedStr.length; i < len; i++) {
         array[i] = decodedStr.charCodeAt(i);
         }
         return arrayBuffer;
         };
         
         //------------------------------------------------------------------------------
         
/* This code is based on the performance tests at http://jsperf.com/b64tests
 * This 12-bit-at-a-time algorithm was the best performing version on all
 * platforms tested.
 */
         
         var b64_6bit = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
         var b64_12bit;
         
         var b64_12bitTable = function() {
         b64_12bit = [];
         for (var i=0; i<64; i++) {
         for (var j=0; j<64; j++) {
         b64_12bit[i*64+j] = b64_6bit[i] + b64_6bit[j];
         }
         }
         b64_12bitTable = function() { return b64_12bit; };
         return b64_12bit;
         };
         
         function uint8ToBase64(rawData) {
         var numBytes = rawData.byteLength;
         var output="";
         var segment;
         var table = b64_12bitTable();
         for (var i=0;i<numBytes-2;i+=3) {
         segment = (rawData[i] << 16) + (rawData[i+1] << 8) + rawData[i+2];
         output += table[segment >> 12];
         output += table[segment & 0xfff];
         }
         if (numBytes - i == 2) {
         segment = (rawData[i] << 16) + (rawData[i+1] << 8);
         output += table[segment >> 12];
         output += b64_6bit[(segment & 0xfff) >> 6];
         output += '=';
         } else if (numBytes - i == 1) {
         segment = (rawData[i] << 16);
         output += table[segment >> 12];
         output += '==';
         }
         return output;
         }
         
         });
  
  // file: src/common/builder.js
  define("cordova/builder", function(require, exports, module) {
         
         var utils = require('cordova/utils');
         
         function each(objects, func, context) {
         for (var prop in objects) {
         if (objects.hasOwnProperty(prop)) {
         func.apply(context, [objects[prop], prop]);
         }
         }
         }
         
         function clobber(obj, key, value) {
         exports.replaceHookForTesting(obj, key);
         obj[key] = value;
         // Getters can only be overridden by getters.
         if (obj[key] !== value) {
         utils.defineGetter(obj, key, function() {
                            return value;
                            });
         }
         }
         
         function assignOrWrapInDeprecateGetter(obj, key, value, message) {
         if (message) {
         utils.defineGetter(obj, key, function() {
                            console.log(message);
                            delete obj[key];
                            clobber(obj, key, value);
                            return value;
                            });
         } else {
         clobber(obj, key, value);
         }
         }
         
         function include(parent, objects, clobber, merge) {
         each(objects, function (obj, key) {
              try {
              var result = obj.path ? require(obj.path) : {};
              
              if (clobber) {
              // Clobber if it doesn't exist.
              if (typeof parent[key] === 'undefined') {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
              } else if (typeof obj.path !== 'undefined') {
              // If merging, merge properties onto parent, otherwise, clobber.
              if (merge) {
              recursiveMerge(parent[key], result);
              } else {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
              }
              }
              result = parent[key];
              } else {
              // Overwrite if not currently defined.
              if (typeof parent[key] == 'undefined') {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
              } else {
              // Set result to what already exists, so we can build children into it if they exist.
              result = parent[key];
              }
              }
              
              if (obj.children) {
              include(result, obj.children, clobber, merge);
              }
              } catch(e) {
              utils.alert('Exception building Cordova JS globals: ' + e + ' for key "' + key + '"');
              }
              });
         }
         
/**
 * Merge properties from one object onto another recursively.  Properties from
 * the src object will overwrite existing target property.
 *
 * @param target Object to merge properties into.
 * @param src Object to merge properties from.
 */
         function recursiveMerge(target, src) {
         for (var prop in src) {
         if (src.hasOwnProperty(prop)) {
         if (target.prototype && target.prototype.constructor === target) {
         // If the target object is a constructor override off prototype.
         clobber(target.prototype, prop, src[prop]);
         } else {
         if (typeof src[prop] === 'object' && typeof target[prop] === 'object') {
         recursiveMerge(target[prop], src[prop]);
         } else {
         clobber(target, prop, src[prop]);
         }
         }
         }
         }
         }
         
         exports.buildIntoButDoNotClobber = function(objects, target) {
         include(target, objects, false, false);
         };
         exports.buildIntoAndClobber = function(objects, target) {
         include(target, objects, true, false);
         };
         exports.buildIntoAndMerge = function(objects, target) {
         include(target, objects, true, true);
         };
         exports.recursiveMerge = recursiveMerge;
         exports.assignOrWrapInDeprecateGetter = assignOrWrapInDeprecateGetter;
         exports.replaceHookForTesting = function() {};
         
         });
  
  // file: src/common/channel.js
  define("cordova/channel", function(require, exports, module) {
         
         var utils = require('cordova/utils'),
         nextGuid = 1;
         
/**
 * Custom pub-sub "channel" that can have functions subscribed to it
 * This object is used to define and control firing of events for
 * cordova initialization, as well as for custom events thereafter.
 *
 * The order of events during page load and Cordova startup is as follows:
 *
 * onDOMContentLoaded*         Internal event that is received when the web page is loaded and parsed.
 * onNativeReady*              Internal event that indicates the Cordova native side is ready.
 * onCordovaReady*             Internal event fired when all Cordova JavaScript objects have been created.
 * onDeviceReady*              User event fired to indicate that Cordova is ready
 * onResume                    User event fired to indicate a start/resume lifecycle event
 * onPause                     User event fired to indicate a pause lifecycle event
 * onDestroy*                  Internal event fired when app is being destroyed (User should use window.onunload event, not this one).
 *
 * The events marked with an * are sticky. Once they have fired, they will stay in the fired state.
 * All listeners that subscribe after the event is fired will be executed right away.
 *
 * The only Cordova events that user code should register for are:
 *      deviceready           Cordova native code is initialized and Cordova APIs can be called from JavaScript
 *      pause                 App has moved to background
 *      resume                App has returned to foreground
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 *      document.addEventListener("pause", myPauseListener, false);
 *
 * The DOM lifecycle events should be used for saving and restoring state
 *      window.onload
 *      window.onunload
 *
 */
         
/**
 * Channel
 * @constructor
 * @param type  String the channel name
 */
         var Channel = function(type, sticky) {
         this.type = type;
         // Map of guid -> function.
         this.handlers = {};
         // 0 = Non-sticky, 1 = Sticky non-fired, 2 = Sticky fired.
         this.state = sticky ? 1 : 0;
         // Used in sticky mode to remember args passed to fire().
         this.fireArgs = null;
         // Used by onHasSubscribersChange to know if there are any listeners.
         this.numHandlers = 0;
         // Function that is called when the first listener is subscribed, or when
         // the last listener is unsubscribed.
         this.onHasSubscribersChange = null;
         },
         channel = {
         /**
          * Calls the provided function only after all of the channels specified
          * have been fired. All channels must be sticky channels.
          */
         join: function(h, c) {
         var len = c.length,
         i = len,
         f = function() {
         if (!(--i)) h();
         };
         for (var j=0; j<len; j++) {
         if (c[j].state === 0) {
         throw Error('Can only use join with sticky channels.');
         }
         c[j].subscribe(f);
         }
         if (!len) h();
         },
         create: function(type) {
         return channel[type] = new Channel(type, false);
         },
         createSticky: function(type) {
         return channel[type] = new Channel(type, true);
         },
         
         /**
          * cordova Channels that must fire before "deviceready" is fired.
          */
         deviceReadyChannelsArray: [],
         deviceReadyChannelsMap: {},
         
         /**
          * Indicate that a feature needs to be initialized before it is ready to be used.
          * This holds up Cordova's "deviceready" event until the feature has been initialized
          * and Cordova.initComplete(feature) is called.
          *
          * @param feature {String}     The unique feature name
          */
         waitForInitialization: function(feature) {
         if (feature) {
         var c = channel[feature] || this.createSticky(feature);
         this.deviceReadyChannelsMap[feature] = c;
         this.deviceReadyChannelsArray.push(c);
         }
         },
         
         /**
          * Indicate that initialization code has completed and the feature is ready to be used.
          *
          * @param feature {String}     The unique feature name
          */
         initializationComplete: function(feature) {
         var c = this.deviceReadyChannelsMap[feature];
         if (c) {
         c.fire();
         }
         }
         };
         
         function forceFunction(f) {
         if (typeof f != 'function') throw "Function required as first argument!";
         }
         
/**
 * Subscribes the given function to the channel. Any time that
 * Channel.fire is called so too will the function.
 * Optionally specify an execution context for the function
 * and a guid that can be used to stop subscribing to the channel.
 * Returns the guid.
 */
         Channel.prototype.subscribe = function(f, c) {
         // need a function to call
         forceFunction(f);
         if (this.state == 2) {
         f.apply(c || this, this.fireArgs);
         return;
         }
         
         var func = f,
         guid = f.observer_guid;
         if (typeof c == "object") { func = utils.close(c, f); }
         
         if (!guid) {
         // first time any channel has seen this subscriber
         guid = '' + nextGuid++;
         }
         func.observer_guid = guid;
         f.observer_guid = guid;
         
         // Don't add the same handler more than once.
         if (!this.handlers[guid]) {
         this.handlers[guid] = func;
         this.numHandlers++;
         if (this.numHandlers == 1) {
         this.onHasSubscribersChange && this.onHasSubscribersChange();
         }
         }
         };
         
/**
 * Unsubscribes the function with the given guid from the channel.
 */
         Channel.prototype.unsubscribe = function(f) {
         // need a function to unsubscribe
         forceFunction(f);
         
         var guid = f.observer_guid,
         handler = this.handlers[guid];
         if (handler) {
         delete this.handlers[guid];
         this.numHandlers--;
         if (this.numHandlers === 0) {
         this.onHasSubscribersChange && this.onHasSubscribersChange();
         }
         }
         };
         
/**
 * Calls all functions subscribed to this channel.
 */
         Channel.prototype.fire = function(e) {
         var fail = false,
         fireArgs = Array.prototype.slice.call(arguments);
         // Apply stickiness.
         if (this.state == 1) {
         this.state = 2;
         this.fireArgs = fireArgs;
         }
         if (this.numHandlers) {
         // Copy the values first so that it is safe to modify it from within
         // callbacks.
         var toCall = [];
         for (var item in this.handlers) {
         toCall.push(this.handlers[item]);
         }
         for (var i = 0; i < toCall.length; ++i) {
         toCall[i].apply(this, fireArgs);
         }
         if (this.state == 2 && this.numHandlers) {
         this.numHandlers = 0;
         this.handlers = {};
         this.onHasSubscribersChange && this.onHasSubscribersChange();
         }
         }
         };
         
         
         // defining them here so they are ready super fast!
         // DOM event that is received when the web page is loaded and parsed.
         channel.createSticky('onDOMContentLoaded');
         
         // Event to indicate the Cordova native side is ready.
         channel.createSticky('onNativeReady');
         
         // Event to indicate that all Cordova JavaScript objects have been created
         // and it's time to run plugin constructors.
         channel.createSticky('onCordovaReady');
         
         // Event to indicate that all automatically loaded JS plugins are loaded and ready.
         // FIXME remove this
         channel.createSticky('onPluginsReady');
         
         // Event to indicate that Cordova is ready
         channel.createSticky('onDeviceReady');
         
         // Event to indicate a resume lifecycle event
         channel.create('onResume');
         
         // Event to indicate a pause lifecycle event
         channel.create('onPause');
         
         // Event to indicate a destroy lifecycle event
         channel.createSticky('onDestroy');
         
         // Channels that must fire before "deviceready" is fired.
         channel.waitForInitialization('onCordovaReady');
         channel.waitForInitialization('onDOMContentLoaded');
         
         module.exports = channel;
         
         });
  
  // file: src/ios/exec.js
  define("cordova/exec", function(require, exports, module) {
         
/**
 * Creates a gap bridge iframe used to notify the native code about queued
 * commands.
 */
         var cordova = require('cordova'),
         channel = require('cordova/channel'),
         utils = require('cordova/utils'),
         base64 = require('cordova/base64'),
         // XHR mode does not work on iOS 4.2.
         // XHR mode's main advantage is working around a bug in -webkit-scroll, which
         // doesn't exist only on iOS 5.x devices.
         // IFRAME_NAV is the fastest.
         // IFRAME_HASH could be made to enable synchronous bridge calls if we wanted this feature.
         jsToNativeModes = {
         IFRAME_NAV: 0,
         XHR_NO_PAYLOAD: 1,
         XHR_WITH_PAYLOAD: 2,
         XHR_OPTIONAL_PAYLOAD: 3,
         IFRAME_HASH_NO_PAYLOAD: 4,
         // Bundling the payload turns out to be slower. Probably since it has to be URI encoded / decoded.
         IFRAME_HASH_WITH_PAYLOAD: 5,
         WK_WEBVIEW_BINDING: 6
         },
         bridgeMode,
         execIframe,
         execHashIframe,
         hashToggle = 1,
         execXhr,
         requestCount = 0,
         vcHeaderValue = null,
         commandQueue = [], // Contains pending JS->Native messages.
         isInContextOfEvalJs = 0;
         
         function createExecIframe(src, unloadListener) {
         var iframe = document.createElement("iframe");
         iframe.style.display = 'none';
         // Both the unload listener and the src must be set before adding the iframe
         // to the document in order to avoid race conditions. Callbacks from native
         // can happen within the appendChild() call!
         iframe.onunload = unloadListener;
         iframe.src = src;
         document.body.appendChild(iframe);
         return iframe;
         }
         
         function createHashIframe() {
         var ret = createExecIframe('about:blank');
         // Hash changes don't work on about:blank, so switch it to file:///.
         ret.contentWindow.history.replaceState(null, null, 'file:///#');
         return ret;
         }
         
         function shouldBundleCommandJson() {
         if (bridgeMode === jsToNativeModes.XHR_WITH_PAYLOAD) {
         return true;
         }
         if (bridgeMode === jsToNativeModes.XHR_OPTIONAL_PAYLOAD) {
         var payloadLength = 0;
         for (var i = 0; i < commandQueue.length; ++i) {
         payloadLength += commandQueue[i].length;
         }
         // The value here was determined using the benchmark within CordovaLibApp on an iPad 3.
         return payloadLength < 4500;
         }
         return false;
         }
         
         function massageArgsJsToNative(args) {
         if (!args || utils.typeName(args) != 'Array') {
         return args;
         }
         var ret = [];
         args.forEach(function(arg, i) {
                      if (utils.typeName(arg) == 'ArrayBuffer') {
                      ret.push({
                               'CDVType': 'ArrayBuffer',
                               'data': base64.fromArrayBuffer(arg)
                               });
                      } else {
                      ret.push(arg);
                      }
                      });
         return ret;
         }
         
         function massageMessageNativeToJs(message) {
         if (message.CDVType == 'ArrayBuffer') {
         var stringToArrayBuffer = function(str) {
         var ret = new Uint8Array(str.length);
         for (var i = 0; i < str.length; i++) {
         ret[i] = str.charCodeAt(i);
         }
         return ret.buffer;
         };
         var base64ToArrayBuffer = function(b64) {
         return stringToArrayBuffer(atob(b64));
         };
         message = base64ToArrayBuffer(message.data);
         }
         return message;
         }
         
         function convertMessageToArgsNativeToJs(message) {
         var args = [];
         if (!message || !message.hasOwnProperty('CDVType')) {
         args.push(message);
         } else if (message.CDVType == 'MultiPart') {
         message.messages.forEach(function(e) {
                                  args.push(massageMessageNativeToJs(e));
                                  });
         } else {
         args.push(massageMessageNativeToJs(message));
         }
         return args;
         }
         
         function iOSExec() {
         if (bridgeMode === undefined) {
         bridgeMode = jsToNativeModes.IFRAME_NAV;
         }
         
         if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cordova && window.webkit.messageHandlers.cordova.postMessage) {
         bridgeMode = jsToNativeModes.WK_WEBVIEW_BINDING;
         }
         
         var successCallback, failCallback, service, action, actionArgs, splitCommand;
         var callbackId = null;
         if (typeof arguments[0] !== "string") {
         // FORMAT ONE
         successCallback = arguments[0];
         failCallback = arguments[1];
         service = arguments[2];
         action = arguments[3];
         actionArgs = arguments[4];
         
         // Since we need to maintain backwards compatibility, we have to pass
         // an invalid callbackId even if no callback was provided since plugins
         // will be expecting it. The Cordova.exec() implementation allocates
         // an invalid callbackId and passes it even if no callbacks were given.
         callbackId = 'INVALID';
         } else {
         // FORMAT TWO, REMOVED
         try {
         splitCommand = arguments[0].split(".");
         action = splitCommand.pop();
         service = splitCommand.join(".");
         actionArgs = Array.prototype.splice.call(arguments, 1);
         
         console.log('The old format of this exec call has been removed (deprecated since 2.1). Change to: ' +
                     "cordova.exec(null, null, \"" + service + "\", \"" + action + "\"," + JSON.stringify(actionArgs) + ");"
                     );
         return;
         } catch (e) {}
         }
         
         // If actionArgs is not provided, default to an empty array
         actionArgs = actionArgs || [];
         
         // Register the callbacks and add the callbackId to the positional
         // arguments if given.
         if (successCallback || failCallback) {
         callbackId = service + cordova.callbackId++;
         cordova.callbacks[callbackId] =
         {success:successCallback, fail:failCallback};
         }
         
         actionArgs = massageArgsJsToNative(actionArgs);
         
         var command = [callbackId, service, action, actionArgs];
         
         // Stringify and queue the command. We stringify to command now to
         // effectively clone the command arguments in case they are mutated before
         // the command is executed.
         commandQueue.push(JSON.stringify(command));
         
         if (bridgeMode === jsToNativeModes.WK_WEBVIEW_BINDING) {
         window.webkit.messageHandlers.cordova.postMessage(command);
         } else {
         // If we're in the context of a stringByEvaluatingJavaScriptFromString call,
         // then the queue will be flushed when it returns; no need for a poke.
         // Also, if there is already a command in the queue, then we've already
         // poked the native side, so there is no reason to do so again.
         if (!isInContextOfEvalJs && commandQueue.length == 1) {
         switch (bridgeMode) {
         case jsToNativeModes.XHR_NO_PAYLOAD:
         case jsToNativeModes.XHR_WITH_PAYLOAD:
         case jsToNativeModes.XHR_OPTIONAL_PAYLOAD:
         pokeNativeViaXhr();
         break;
         default: // iframe-based.
         pokeNativeViaIframe();
         }
         }
         }
         }
         
         function pokeNativeViaXhr() {
         // This prevents sending an XHR when there is already one being sent.
         // This should happen only in rare circumstances (refer to unit tests).
         if (execXhr && execXhr.readyState != 4) {
         execXhr = null;
         }
         // Re-using the XHR improves exec() performance by about 10%.
         execXhr = execXhr || new XMLHttpRequest();
         // Changing this to a GET will make the XHR reach the URIProtocol on 4.2.
         // For some reason it still doesn't work though...
         // Add a timestamp to the query param to prevent caching.
         execXhr.open('HEAD', "/!gap_exec?" + (+new Date()), true);
         if (!vcHeaderValue) {
         vcHeaderValue = /.*\((.*)\)$/.exec(navigator.userAgent)[1];
         }
         execXhr.setRequestHeader('vc', vcHeaderValue);
         execXhr.setRequestHeader('rc', ++requestCount);
         if (shouldBundleCommandJson()) {
         execXhr.setRequestHeader('cmds', iOSExec.nativeFetchMessages());
         }
         execXhr.send(null);
         }
         
         function onIframeUnload() {
         execIframe = null;
         setTimeout(pokeNativeViaIframe, 0);
         }
         
         function pokeNativeViaIframe() {
         // CB-5488 - Don't attempt to create iframe before document.body is available.
         if (!document.body) {
         setTimeout(pokeNativeViaIframe);
         return;
         }
         if (bridgeMode === jsToNativeModes.IFRAME_HASH_NO_PAYLOAD || bridgeMode === jsToNativeModes.IFRAME_HASH_WITH_PAYLOAD) {
         // TODO: This bridge mode doesn't properly support being removed from the DOM (CB-7735)
         execHashIframe = execHashIframe || createHashIframe();
         // Check if they've removed it from the DOM, and put it back if so.
         if (!execHashIframe.contentWindow) {
         execHashIframe = createHashIframe();
         }
         // The delegate method is called only when the hash changes, so toggle it back and forth.
         hashToggle = hashToggle ^ 3;
         var hashValue = '%0' + hashToggle;
         if (bridgeMode === jsToNativeModes.IFRAME_HASH_WITH_PAYLOAD) {
         hashValue += iOSExec.nativeFetchMessages();
         }
         execHashIframe.contentWindow.location.hash = hashValue;
         } else {
         // Check if they've removed it from the DOM, and put it back if so.
         if (execIframe && execIframe.contentWindow) {
         // Listen for unload, since it can happen (CB-7735) that the iframe gets
         // removed from the DOM before it gets a chance to poke the native side.
         execIframe.contentWindow.onunload = onIframeUnload;
         execIframe.src = 'gap://ready';
         } else {
         execIframe = createExecIframe('gap://ready', onIframeUnload);
         }
         }
         }
         
         iOSExec.jsToNativeModes = jsToNativeModes;
         
         iOSExec.setJsToNativeBridgeMode = function(mode) {
         // Remove the iFrame since it may be no longer required, and its existence
         // can trigger browser bugs.
         // https://issues.apache.org/jira/browse/CB-593
         if (execIframe) {
         execIframe.parentNode.removeChild(execIframe);
         execIframe = null;
         }
         bridgeMode = mode;
         };
         
         iOSExec.nativeFetchMessages = function() {
         // Stop listing for window detatch once native side confirms poke.
         if (execIframe && execIframe.contentWindow) {
         execIframe.contentWindow.onunload = null;
         }
         // Each entry in commandQueue is a JSON string already.
         if (!commandQueue.length) {
         return '';
         }
         var json = '[' + commandQueue.join(',') + ']';
         commandQueue.length = 0;
         return json;
         };
         
         iOSExec.nativeCallback = function(callbackId, status, message, keepCallback) {
         return iOSExec.nativeEvalAndFetch(function() {
                                           var success = status === 0 || status === 1;
                                           var args = convertMessageToArgsNativeToJs(message);
                                           cordova.callbackFromNative(callbackId, success, status, args, keepCallback);
                                           });
         };
         
         iOSExec.nativeEvalAndFetch = function(func) {
         // This shouldn't be nested, but better to be safe.
         isInContextOfEvalJs++;
         try {
         func();
         return iOSExec.nativeFetchMessages();
         } finally {
         isInContextOfEvalJs--;
         }
         };
         
         module.exports = iOSExec;
         
         });
  
  // file: src/common/exec/proxy.js
  define("cordova/exec/proxy", function(require, exports, module) {
         
         
         // internal map of proxy function
         var CommandProxyMap = {};
         
         module.exports = {
         
         // example: cordova.commandProxy.add("Accelerometer",{getCurrentAcceleration: function(successCallback, errorCallback, options) {...},...);
         add:function(id,proxyObj) {
         console.log("adding proxy for " + id);
         CommandProxyMap[id] = proxyObj;
         return proxyObj;
         },
         
         // cordova.commandProxy.remove("Accelerometer");
         remove:function(id) {
         var proxy = CommandProxyMap[id];
         delete CommandProxyMap[id];
         CommandProxyMap[id] = null;
         return proxy;
         },
         
         get:function(service,action) {
         return ( CommandProxyMap[service] ? CommandProxyMap[service][action] : null );
         }
         };
         });
  
  // file: src/common/init.js
  define("cordova/init", function(require, exports, module) {
         
         var channel = require('cordova/channel');
         var cordova = require('cordova');
         var modulemapper = require('cordova/modulemapper');
         var platform = require('cordova/platform');
         var pluginloader = require('cordova/pluginloader');
         var utils = require('cordova/utils');
         
         var platformInitChannelsArray = [channel.onNativeReady, channel.onPluginsReady];
         
         function logUnfiredChannels(arr) {
         for (var i = 0; i < arr.length; ++i) {
         if (arr[i].state != 2) {
         console.log('Channel not fired: ' + arr[i].type);
         }
         }
         }
         
         window.setTimeout(function() {
                           if (channel.onDeviceReady.state != 2) {
                           console.log('deviceready has not fired after 5 seconds.');
                           logUnfiredChannels(platformInitChannelsArray);
                           logUnfiredChannels(channel.deviceReadyChannelsArray);
                           }
                           }, 5000);
         
         // Replace navigator before any modules are required(), to ensure it happens as soon as possible.
         // We replace it so that properties that can't be clobbered can instead be overridden.
         function replaceNavigator(origNavigator) {
         var CordovaNavigator = function() {};
         CordovaNavigator.prototype = origNavigator;
         var newNavigator = new CordovaNavigator();
         // This work-around really only applies to new APIs that are newer than Function.bind.
         // Without it, APIs such as getGamepads() break.
         if (CordovaNavigator.bind) {
         for (var key in origNavigator) {
         if (typeof origNavigator[key] == 'function') {
         newNavigator[key] = origNavigator[key].bind(origNavigator);
         }
         else {
         (function(k) {
          utils.defineGetterSetter(newNavigator,key,function() {
                                   return origNavigator[k];
                                   });
          })(key);
         }
         }
         }
         return newNavigator;
         }
         
         if (window.navigator) {
         window.navigator = replaceNavigator(window.navigator);
         }
         
         if (!window.console) {
         window.console = {
         log: function(){}
         };
         }
         if (!window.console.warn) {
         window.console.warn = function(msg) {
         this.log("warn: " + msg);
         };
         }
         
         // Register pause, resume and deviceready channels as events on document.
         channel.onPause = cordova.addDocumentEventHandler('pause');
         channel.onResume = cordova.addDocumentEventHandler('resume');
         channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');
         
         // Listen for DOMContentLoaded and notify our channel subscribers.
         if (document.readyState == 'complete' || document.readyState == 'interactive') {
         channel.onDOMContentLoaded.fire();
         } else {
         document.addEventListener('DOMContentLoaded', function() {
                                   channel.onDOMContentLoaded.fire();
                                   }, false);
         }
         
         // _nativeReady is global variable that the native side can set
         // to signify that the native code is ready. It is a global since
         // it may be called before any cordova JS is ready.
         if (window._nativeReady) {
         channel.onNativeReady.fire();
         }
         
         modulemapper.clobbers('cordova', 'cordova');
         modulemapper.clobbers('cordova/exec', 'cordova.exec');
         modulemapper.clobbers('cordova/exec', 'Cordova.exec');
         
         // Call the platform-specific initialization.
         platform.bootstrap && platform.bootstrap();
         
         // Wrap in a setTimeout to support the use-case of having plugin JS appended to cordova.js.
         // The delay allows the attached modules to be defined before the plugin loader looks for them.
         setTimeout(function() {
                    pluginloader.load(function() {
                                      channel.onPluginsReady.fire();
                                      });
                    }, 0);
         
/**
 * Create all cordova objects once native side is ready.
 */
         channel.join(function() {
                      modulemapper.mapModules(window);
                      
                      platform.initialize && platform.initialize();
                      
                      // Fire event to notify that all objects are created
                      channel.onCordovaReady.fire();
                      
                      // Fire onDeviceReady event once page has fully loaded, all
                      // constructors have run and cordova info has been received from native
                      // side.
                      channel.join(function() {
                                   require('cordova').fireDocumentEvent('deviceready');
                                   }, channel.deviceReadyChannelsArray);
                      
                      }, platformInitChannelsArray);
         
         
         });
  
  // file: src/common/init_b.js
  define("cordova/init_b", function(require, exports, module) {
         
         var channel = require('cordova/channel');
         var cordova = require('cordova');
         var platform = require('cordova/platform');
         var utils = require('cordova/utils');
         
         var platformInitChannelsArray = [channel.onDOMContentLoaded, channel.onNativeReady];
         
         // setting exec
         cordova.exec = require('cordova/exec');
         
         function logUnfiredChannels(arr) {
         for (var i = 0; i < arr.length; ++i) {
         if (arr[i].state != 2) {
         console.log('Channel not fired: ' + arr[i].type);
         }
         }
         }
         
         window.setTimeout(function() {
                           if (channel.onDeviceReady.state != 2) {
                           console.log('deviceready has not fired after 5 seconds.');
                           logUnfiredChannels(platformInitChannelsArray);
                           logUnfiredChannels(channel.deviceReadyChannelsArray);
                           }
                           }, 5000);
         
         // Replace navigator before any modules are required(), to ensure it happens as soon as possible.
         // We replace it so that properties that can't be clobbered can instead be overridden.
         function replaceNavigator(origNavigator) {
         var CordovaNavigator = function() {};
         CordovaNavigator.prototype = origNavigator;
         var newNavigator = new CordovaNavigator();
         // This work-around really only applies to new APIs that are newer than Function.bind.
         // Without it, APIs such as getGamepads() break.
         if (CordovaNavigator.bind) {
         for (var key in origNavigator) {
         if (typeof origNavigator[key] == 'function') {
         newNavigator[key] = origNavigator[key].bind(origNavigator);
         }
         else {
         (function(k) {
          utils.defineGetterSetter(newNavigator,key,function() {
                                   return origNavigator[k];
                                   });
          })(key);
         }
         }
         }
         return newNavigator;
         }
         if (window.navigator) {
         window.navigator = replaceNavigator(window.navigator);
         }
         
         if (!window.console) {
         window.console = {
         log: function(){}
         };
         }
         if (!window.console.warn) {
         window.console.warn = function(msg) {
         this.log("warn: " + msg);
         };
         }
         
         // Register pause, resume and deviceready channels as events on document.
         channel.onPause = cordova.addDocumentEventHandler('pause');
         channel.onResume = cordova.addDocumentEventHandler('resume');
         channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');
         
         // Listen for DOMContentLoaded and notify our channel subscribers.
         if (document.readyState == 'complete' || document.readyState == 'interactive') {
         channel.onDOMContentLoaded.fire();
         } else {
         document.addEventListener('DOMContentLoaded', function() {
                                   channel.onDOMContentLoaded.fire();
                                   }, false);
         }
         
         // _nativeReady is global variable that the native side can set
         // to signify that the native code is ready. It is a global since
         // it may be called before any cordova JS is ready.
         if (window._nativeReady) {
         channel.onNativeReady.fire();
         }
         
         // Call the platform-specific initialization.
         platform.bootstrap && platform.bootstrap();
         
/**
 * Create all cordova objects once native side is ready.
 */
         channel.join(function() {
                      
                      platform.initialize && platform.initialize();
                      
                      // Fire event to notify that all objects are created
                      channel.onCordovaReady.fire();
                      
                      // Fire onDeviceReady event once page has fully loaded, all
                      // constructors have run and cordova info has been received from native
                      // side.
                      channel.join(function() {
                                   require('cordova').fireDocumentEvent('deviceready');
                                   }, channel.deviceReadyChannelsArray);
                      
                      }, platformInitChannelsArray);
         
         });
  
  // file: src/common/modulemapper.js
  define("cordova/modulemapper", function(require, exports, module) {
         
         var builder = require('cordova/builder'),
         moduleMap = define.moduleMap,
         symbolList,
         deprecationMap;
         
         exports.reset = function() {
         symbolList = [];
         deprecationMap = {};
         };
         
         function addEntry(strategy, moduleName, symbolPath, opt_deprecationMessage) {
         if (!(moduleName in moduleMap)) {
         throw new Error('Module ' + moduleName + ' does not exist.');
         }
         symbolList.push(strategy, moduleName, symbolPath);
         if (opt_deprecationMessage) {
         deprecationMap[symbolPath] = opt_deprecationMessage;
         }
         }
         
         // Note: Android 2.3 does have Function.bind().
         exports.clobbers = function(moduleName, symbolPath, opt_deprecationMessage) {
         addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
         };
         
         exports.merges = function(moduleName, symbolPath, opt_deprecationMessage) {
         addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
         };
         
         exports.defaults = function(moduleName, symbolPath, opt_deprecationMessage) {
         addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
         };
         
         exports.runs = function(moduleName) {
         addEntry('r', moduleName, null);
         };
         
         function prepareNamespace(symbolPath, context) {
         if (!symbolPath) {
         return context;
         }
         var parts = symbolPath.split('.');
         var cur = context;
         for (var i = 0, part; part = parts[i]; ++i) {
         cur = cur[part] = cur[part] || {};
         }
         return cur;
         }
         
         exports.mapModules = function(context) {
         var origSymbols = {};
         context.CDV_origSymbols = origSymbols;
         for (var i = 0, len = symbolList.length; i < len; i += 3) {
         var strategy = symbolList[i];
         var moduleName = symbolList[i + 1];
         var module = require(moduleName);
         // <runs/>
         if (strategy == 'r') {
         continue;
         }
         var symbolPath = symbolList[i + 2];
         var lastDot = symbolPath.lastIndexOf('.');
         var namespace = symbolPath.substr(0, lastDot);
         var lastName = symbolPath.substr(lastDot + 1);
         
         var deprecationMsg = symbolPath in deprecationMap ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg : null;
         var parentObj = prepareNamespace(namespace, context);
         var target = parentObj[lastName];
         
         if (strategy == 'm' && target) {
         builder.recursiveMerge(target, module);
         } else if ((strategy == 'd' && !target) || (strategy != 'd')) {
         if (!(symbolPath in origSymbols)) {
         origSymbols[symbolPath] = target;
         }
         builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
         }
         }
         };
         
         exports.getOriginalSymbol = function(context, symbolPath) {
         var origSymbols = context.CDV_origSymbols;
         if (origSymbols && (symbolPath in origSymbols)) {
         return origSymbols[symbolPath];
         }
         var parts = symbolPath.split('.');
         var obj = context;
         for (var i = 0; i < parts.length; ++i) {
         obj = obj && obj[parts[i]];
         }
         return obj;
         };
         
         exports.reset();
         
         
         });
  
  // file: src/ios/platform.js
  define("cordova/platform", function(require, exports, module) {
         
         module.exports = {
         id: 'ios',
         bootstrap: function() {
         require('cordova/channel').onNativeReady.fire();
         }
         };
         
         
         });
  
  // file: src/common/pluginloader.js
  define("cordova/pluginloader", function(require, exports, module) {
         
         var modulemapper = require('cordova/modulemapper');
         var urlutil = require('cordova/urlutil');
         
         // Helper function to inject a <script> tag.
         // Exported for testing.
         exports.injectScript = function(url, onload, onerror) {
         var script = document.createElement("script");
         // onload fires even when script fails loads with an error.
         script.onload = onload;
         // onerror fires for malformed URLs.
         script.onerror = onerror;
         script.src = url;
         document.head.appendChild(script);
         };
         
         function injectIfNecessary(id, url, onload, onerror) {
         onerror = onerror || onload;
         if (id in define.moduleMap) {
         onload();
         } else {
         exports.injectScript(url, function() {
                              if (id in define.moduleMap) {
                              onload();
                              } else {
                              onerror();
                              }
                              }, onerror);
         }
         }
         
         function onScriptLoadingComplete(moduleList, finishPluginLoading) {
         // Loop through all the plugins and then through their clobbers and merges.
         for (var i = 0, module; module = moduleList[i]; i++) {
         if (module.clobbers && module.clobbers.length) {
         for (var j = 0; j < module.clobbers.length; j++) {
         modulemapper.clobbers(module.id, module.clobbers[j]);
         }
         }
         
         if (module.merges && module.merges.length) {
         for (var k = 0; k < module.merges.length; k++) {
         modulemapper.merges(module.id, module.merges[k]);
         }
         }
         
         // Finally, if runs is truthy we want to simply require() the module.
         if (module.runs) {
         modulemapper.runs(module.id);
         }
         }
         
         finishPluginLoading();
         }
         
         // Handler for the cordova_plugins.js content.
         // See plugman's plugin_loader.js for the details of this object.
         // This function is only called if the really is a plugins array that isn't empty.
         // Otherwise the onerror response handler will just call finishPluginLoading().
         function handlePluginsObject(path, moduleList, finishPluginLoading) {
         // Now inject the scripts.
         var scriptCounter = moduleList.length;
         
         if (!scriptCounter) {
         finishPluginLoading();
         return;
         }
         function scriptLoadedCallback() {
         if (!--scriptCounter) {
         onScriptLoadingComplete(moduleList, finishPluginLoading);
         }
         }
         
         for (var i = 0; i < moduleList.length; i++) {
         injectIfNecessary(moduleList[i].id, path + moduleList[i].file, scriptLoadedCallback);
         }
         }
         
         function findCordovaPath() {
         var path = null;
         var scripts = document.getElementsByTagName('script');
         var term = '/cordova.js';
         for (var n = scripts.length-1; n>-1; n--) {
         var src = scripts[n].src.replace(/\?.*$/, ''); // Strip any query param (CB-6007).
         if (src.indexOf(term) == (src.length - term.length)) {
         path = src.substring(0, src.length - term.length) + '/';
         break;
         }
         }
         return path;
         }
         
         // Tries to load all plugins' js-modules.
         // This is an async process, but onDeviceReady is blocked on onPluginsReady.
         // onPluginsReady is fired when there are no plugins to load, or they are all done.
         exports.load = function(callback) {
         var pathPrefix = findCordovaPath();
         if (pathPrefix === null) {
         console.log('Could not find cordova.js script tag. Plugin loading may fail.');
         pathPrefix = '';
         }
         injectIfNecessary('cordova/plugin_list', pathPrefix + 'cordova_plugins.js', function() {
                           var moduleList = require("cordova/plugin_list");
                           handlePluginsObject(pathPrefix, moduleList, callback);
                           }, callback);
         };
         
         
         });
  
  // file: src/common/urlutil.js
  define("cordova/urlutil", function(require, exports, module) {
         
         
/**
 * For already absolute URLs, returns what is passed in.
 * For relative URLs, converts them to absolute ones.
 */
         exports.makeAbsolute = function makeAbsolute(url) {
         var anchorEl = document.createElement('a');
         anchorEl.href = url;
         return anchorEl.href;
         };
         
         
         });
  
  // file: src/common/utils.js
  define("cordova/utils", function(require, exports, module) {
         
         var utils = exports;
         
/**
 * Defines a property getter / setter for obj[key].
 */
         utils.defineGetterSetter = function(obj, key, getFunc, opt_setFunc) {
         if (Object.defineProperty) {
         var desc = {
         get: getFunc,
         configurable: true
         };
         if (opt_setFunc) {
         desc.set = opt_setFunc;
         }
         Object.defineProperty(obj, key, desc);
         } else {
         obj.__defineGetter__(key, getFunc);
         if (opt_setFunc) {
         obj.__defineSetter__(key, opt_setFunc);
         }
         }
         };
         
/**
 * Defines a property getter for obj[key].
 */
         utils.defineGetter = utils.defineGetterSetter;
         
         utils.arrayIndexOf = function(a, item) {
         if (a.indexOf) {
         return a.indexOf(item);
         }
         var len = a.length;
         for (var i = 0; i < len; ++i) {
         if (a[i] == item) {
         return i;
         }
         }
         return -1;
         };
         
/**
 * Returns whether the item was found in the array.
 */
         utils.arrayRemove = function(a, item) {
         var index = utils.arrayIndexOf(a, item);
         if (index != -1) {
         a.splice(index, 1);
         }
         return index != -1;
         };
         
         utils.typeName = function(val) {
         return Object.prototype.toString.call(val).slice(8, -1);
         };
         
/**
 * Returns an indication of whether the argument is an array or not
 */
         utils.isArray = function(a) {
         return utils.typeName(a) == 'Array';
         };
         
/**
 * Returns an indication of whether the argument is a Date or not
 */
         utils.isDate = function(d) {
         return utils.typeName(d) == 'Date';
         };
         
/**
 * Does a deep clone of the object.
 */
         utils.clone = function(obj) {
         if(!obj || typeof obj == 'function' || utils.isDate(obj) || typeof obj != 'object') {
         return obj;
         }
         
         var retVal, i;
         
         if(utils.isArray(obj)){
         retVal = [];
         for(i = 0; i < obj.length; ++i){
         retVal.push(utils.clone(obj[i]));
         }
         return retVal;
         }
         
         retVal = {};
         for(i in obj){
         if(!(i in retVal) || retVal[i] != obj[i]) {
         retVal[i] = utils.clone(obj[i]);
         }
         }
         return retVal;
         };
         
/**
 * Returns a wrapped version of the function
 */
         utils.close = function(context, func, params) {
         if (typeof params == 'undefined') {
         return function() {
         return func.apply(context, arguments);
         };
         } else {
         return function() {
         return func.apply(context, params);
         };
         }
         };
         
/**
 * Create a UUID
 */
         utils.createUUID = function() {
         return UUIDcreatePart(4) + '-' +
         UUIDcreatePart(2) + '-' +
         UUIDcreatePart(2) + '-' +
         UUIDcreatePart(2) + '-' +
         UUIDcreatePart(6);
         };
         
/**
 * Extends a child object from a parent object using classical inheritance
 * pattern.
 */
         utils.extend = (function() {
                         // proxy used to establish prototype chain
                         var F = function() {};
                         // extend Child from Parent
                         return function(Child, Parent) {
                         F.prototype = Parent.prototype;
                         Child.prototype = new F();
                         Child.__super__ = Parent.prototype;
                         Child.prototype.constructor = Child;
                         };
                         }());
         
/**
 * Alerts a message in any available way: alert or console.log.
 */
         utils.alert = function(msg) {
         if (window.alert) {
         window.alert(msg);
         } else if (console && console.log) {
         console.log(msg);
         }
         };
         
         
         //------------------------------------------------------------------------------
         function UUIDcreatePart(length) {
         var uuidpart = "";
         for (var i=0; i<length; i++) {
         var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
         if (uuidchar.length == 1) {
         uuidchar = "0" + uuidchar;
         }
         uuidpart += uuidchar;
         }
         return uuidpart;
         }
         
         
         });
  
  window.cordova = require('cordova');
  // file: src/scripts/bootstrap.js
  
  require('cordova/init');
  
  })();

// COMPRESSED CORDOVA PLUGIN CODE
// Note: this must be generated and included anytime we update cordova (along with the rest of cordova js)
// see our wiki on how to do this
cordova.define("cordova/plugin_list",function(a,b,c){c.exports=[{file:"plugins/org.apache.cordova.device/www/device.js",id:"org.apache.cordova.device.device",clobbers:["device"]},{file:"plugins/org.apache.cordova.network-information/www/network.js",id:"org.apache.cordova.network-information.network",clobbers:["navigator.connection","navigator.network.connection"]},{file:"plugins/org.apache.cordova.network-information/www/Connection.js",id:"org.apache.cordova.network-information.Connection",clobbers:["Connection"]},{file:"plugins/org.apache.cordova.battery-status/www/battery.js",id:"org.apache.cordova.battery-status.battery",clobbers:["navigator.battery"]},{file:"plugins/org.apache.cordova.device-motion/www/Acceleration.js",id:"org.apache.cordova.device-motion.Acceleration",clobbers:["Acceleration"]},{file:"plugins/org.apache.cordova.device-motion/www/accelerometer.js",id:"org.apache.cordova.device-motion.accelerometer",clobbers:["navigator.accelerometer"]},{file:"plugins/org.apache.cordova.device-orientation/www/CompassError.js",id:"org.apache.cordova.device-orientation.CompassError",clobbers:["CompassError"]},{file:"plugins/org.apache.cordova.device-orientation/www/CompassHeading.js",id:"org.apache.cordova.device-orientation.CompassHeading",clobbers:["CompassHeading"]},{file:"plugins/org.apache.cordova.device-orientation/www/compass.js",id:"org.apache.cordova.device-orientation.compass",clobbers:["navigator.compass"]},{file:"plugins/org.apache.cordova.geolocation/www/Coordinates.js",id:"org.apache.cordova.geolocation.Coordinates",clobbers:["Coordinates"]},{file:"plugins/org.apache.cordova.geolocation/www/PositionError.js",id:"org.apache.cordova.geolocation.PositionError",clobbers:["PositionError"]},{file:"plugins/org.apache.cordova.geolocation/www/Position.js",id:"org.apache.cordova.geolocation.Position",clobbers:["Position"]},{file:"plugins/org.apache.cordova.geolocation/www/geolocation.js",id:"org.apache.cordova.geolocation.geolocation",clobbers:["navigator.geolocation"]},{file:"plugins/org.apache.cordova.camera/www/CameraConstants.js",id:"org.apache.cordova.camera.Camera",clobbers:["Camera"]},{file:"plugins/org.apache.cordova.camera/www/CameraPopoverOptions.js",id:"org.apache.cordova.camera.CameraPopoverOptions",clobbers:["CameraPopoverOptions"]},{file:"plugins/org.apache.cordova.camera/www/Camera.js",id:"org.apache.cordova.camera.camera",clobbers:["navigator.camera"]},{file:"plugins/org.apache.cordova.camera/www/ios/CameraPopoverHandle.js",id:"org.apache.cordova.camera.CameraPopoverHandle",clobbers:["CameraPopoverHandle"]},{file:"plugins/org.apache.cordova.media-capture/www/CaptureAudioOptions.js",id:"org.apache.cordova.media-capture.CaptureAudioOptions",clobbers:["CaptureAudioOptions"]},{file:"plugins/org.apache.cordova.media-capture/www/CaptureImageOptions.js",id:"org.apache.cordova.media-capture.CaptureImageOptions",clobbers:["CaptureImageOptions"]},{file:"plugins/org.apache.cordova.media-capture/www/CaptureVideoOptions.js",id:"org.apache.cordova.media-capture.CaptureVideoOptions",clobbers:["CaptureVideoOptions"]},{file:"plugins/org.apache.cordova.media-capture/www/CaptureError.js",id:"org.apache.cordova.media-capture.CaptureError",clobbers:["CaptureError"]},{file:"plugins/org.apache.cordova.media-capture/www/MediaFileData.js",id:"org.apache.cordova.media-capture.MediaFileData",clobbers:["MediaFileData"]},{file:"plugins/org.apache.cordova.media-capture/www/MediaFile.js",id:"org.apache.cordova.media-capture.MediaFile",clobbers:["MediaFile"]},{file:"plugins/org.apache.cordova.media-capture/www/capture.js",id:"org.apache.cordova.media-capture.capture",clobbers:["navigator.device.capture"]},{file:"plugins/org.apache.cordova.media/www/MediaError.js",id:"org.apache.cordova.media.MediaError",clobbers:["window.MediaError"]},{file:"plugins/org.apache.cordova.media/www/Media.js",id:"org.apache.cordova.media.Media",clobbers:["window.Media"]},{file:"plugins/org.apache.cordova.file-transfer/www/FileTransferError.js",id:"org.apache.cordova.file-transfer.FileTransferError",clobbers:["window.FileTransferError"]},{file:"plugins/org.apache.cordova.file-transfer/www/FileTransfer.js",id:"org.apache.cordova.file-transfer.FileTransfer",clobbers:["window.FileTransfer"]},{file:"plugins/org.apache.cordova.dialogs/www/notification.js",id:"org.apache.cordova.dialogs.notification",merges:["navigator.notification"]},{file:"plugins/org.apache.cordova.vibration/www/vibration.js",id:"org.apache.cordova.vibration.notification",merges:["navigator.notification","navigator"]},{file:"plugins/org.apache.cordova.contacts/www/contacts.js",id:"org.apache.cordova.contacts.contacts",clobbers:["navigator.contacts"]},{file:"plugins/org.apache.cordova.contacts/www/Contact.js",id:"org.apache.cordova.contacts.Contact",clobbers:["Contact"]},{file:"plugins/org.apache.cordova.contacts/www/ContactAddress.js",id:"org.apache.cordova.contacts.ContactAddress",clobbers:["ContactAddress"]},{file:"plugins/org.apache.cordova.contacts/www/ContactError.js",id:"org.apache.cordova.contacts.ContactError",clobbers:["ContactError"]},{file:"plugins/org.apache.cordova.contacts/www/ContactField.js",id:"org.apache.cordova.contacts.ContactField",clobbers:["ContactField"]},{file:"plugins/org.apache.cordova.contacts/www/ContactFindOptions.js",id:"org.apache.cordova.contacts.ContactFindOptions",clobbers:["ContactFindOptions"]},{file:"plugins/org.apache.cordova.contacts/www/ContactName.js",id:"org.apache.cordova.contacts.ContactName",clobbers:["ContactName"]},{file:"plugins/org.apache.cordova.contacts/www/ContactOrganization.js",id:"org.apache.cordova.contacts.ContactOrganization",clobbers:["ContactOrganization"]},{file:"plugins/org.apache.cordova.contacts/www/ContactFieldType.js",id:"org.apache.cordova.contacts.ContactFieldType",merges:[""]},{file:"plugins/org.apache.cordova.contacts/www/ios/contacts.js",id:"org.apache.cordova.contacts.contacts-ios",merges:["navigator.contacts"]},{file:"plugins/org.apache.cordova.contacts/www/ios/Contact.js",id:"org.apache.cordova.contacts.Contact-iOS",merges:["Contact"]},{file:"plugins/org.apache.cordova.globalization/www/GlobalizationError.js",id:"org.apache.cordova.globalization.GlobalizationError",clobbers:["window.GlobalizationError"]},{file:"plugins/org.apache.cordova.globalization/www/globalization.js",id:"org.apache.cordova.globalization.globalization",clobbers:["navigator.globalization"]},{file:"plugins/org.apache.cordova.splashscreen/www/splashscreen.js",id:"org.apache.cordova.splashscreen.SplashScreen",clobbers:["navigator.splashscreen"]},{file:"plugins/org.apache.cordova.inappbrowser/www/inappbrowser.js",id:"org.apache.cordova.inappbrowser.inappbrowser",clobbers:["window.open"]},{file:"plugins/org.apache.cordova.console/www/console-via-logger.js",id:"org.apache.cordova.console.console",clobbers:["console"]},{file:"plugins/org.apache.cordova.console/www/logger.js",id:"org.apache.cordova.console.logger",clobbers:["cordova.logger"]},{file:"plugins/org.apache.cordova.file/www/DirectoryEntry.js",id:"org.apache.cordova.file.DirectoryEntry",clobbers:["window.DirectoryEntry"]},{file:"plugins/org.apache.cordova.file/www/DirectoryReader.js",id:"org.apache.cordova.file.DirectoryReader",clobbers:["window.DirectoryReader"]},{file:"plugins/org.apache.cordova.file/www/Entry.js",id:"org.apache.cordova.file.Entry",clobbers:["window.Entry"]},{file:"plugins/org.apache.cordova.file/www/File.js",id:"org.apache.cordova.file.File",clobbers:["window.File"]},{file:"plugins/org.apache.cordova.file/www/FileEntry.js",id:"org.apache.cordova.file.FileEntry",clobbers:["window.FileEntry"]},{file:"plugins/org.apache.cordova.file/www/FileError.js",id:"org.apache.cordova.file.FileError",clobbers:["window.FileError"]},{file:"plugins/org.apache.cordova.file/www/FileReader.js",id:"org.apache.cordova.file.FileReader",clobbers:["window.FileReader"]},{file:"plugins/org.apache.cordova.file/www/FileSystem.js",id:"org.apache.cordova.file.FileSystem",clobbers:["window.FileSystem"]},{file:"plugins/org.apache.cordova.file/www/FileUploadOptions.js",id:"org.apache.cordova.file.FileUploadOptions",clobbers:["window.FileUploadOptions"]},{file:"plugins/org.apache.cordova.file/www/FileUploadResult.js",id:"org.apache.cordova.file.FileUploadResult",clobbers:["window.FileUploadResult"]},{file:"plugins/org.apache.cordova.file/www/FileWriter.js",id:"org.apache.cordova.file.FileWriter",clobbers:["window.FileWriter"]},{file:"plugins/org.apache.cordova.file/www/Flags.js",id:"org.apache.cordova.file.Flags",clobbers:["window.Flags"]},{file:"plugins/org.apache.cordova.file/www/LocalFileSystem.js",id:"org.apache.cordova.file.LocalFileSystem",clobbers:["window.LocalFileSystem"],merges:["window"]},{file:"plugins/org.apache.cordova.file/www/Metadata.js",id:"org.apache.cordova.file.Metadata",clobbers:["window.Metadata"]},{file:"plugins/org.apache.cordova.file/www/ProgressEvent.js",id:"org.apache.cordova.file.ProgressEvent",clobbers:["window.ProgressEvent"]},{file:"plugins/org.apache.cordova.file/www/fileSystems.js",id:"org.apache.cordova.file.fileSystems"},{file:"plugins/org.apache.cordova.file/www/requestFileSystem.js",id:"org.apache.cordova.file.requestFileSystem",clobbers:["window.requestFileSystem"]},{file:"plugins/org.apache.cordova.file/www/resolveLocalFileSystemURI.js",id:"org.apache.cordova.file.resolveLocalFileSystemURI",merges:["window"]},{file:"plugins/org.apache.cordova.file/www/ios/FileSystem.js",id:"org.apache.cordova.file.iosFileSystem",merges:["FileSystem"]},{file:"plugins/org.apache.cordova.file/www/fileSystems-roots.js",id:"org.apache.cordova.file.fileSystems-roots",runs:!0},{file:"plugins/org.apache.cordova.file/www/fileSystemPaths.js",id:"org.apache.cordova.file.fileSystemPaths",merges:["cordova"],runs:!0}],c.exports.metadata={"org.apache.cordova.device":"0.2.13","org.apache.cordova.network-information":"0.2.14","org.apache.cordova.battery-status":"0.2.12","org.apache.cordova.device-motion":"0.2.11","org.apache.cordova.device-orientation":"0.3.10","org.apache.cordova.geolocation":"0.3.11","org.apache.cordova.camera":"0.3.4","org.apache.cordova.media-capture":"0.3.5","org.apache.cordova.media":"0.2.15","org.apache.cordova.file-transfer":"0.4.8","org.apache.cordova.dialogs":"0.2.11","org.apache.cordova.vibration":"0.3.12","org.apache.cordova.contacts":"0.2.15","org.apache.cordova.globalization":"0.3.3","org.apache.cordova.splashscreen":"0.3.5","org.apache.cordova.inappbrowser":"0.5.4","org.apache.cordova.console":"0.2.12","org.apache.cordova.file":"1.3.2"}}),cordova.define("org.apache.cordova.battery-status.battery",function(a,b,c){function f(){return j.channels.batterystatus.numHandlers+j.channels.batterylow.numHandlers+j.channels.batterycritical.numHandlers}var d=a("cordova"),e=a("cordova/exec"),g=5,h=20,i=function(){this._level=null,this._isPlugged=null,this.channels={batterystatus:d.addWindowEventHandler("batterystatus"),batterylow:d.addWindowEventHandler("batterylow"),batterycritical:d.addWindowEventHandler("batterycritical")};for(var a in this.channels)this.channels[a].onHasSubscribersChange=i.onHasSubscribersChange};i.onHasSubscribersChange=function(){1===this.numHandlers&&1===f()?e(j._status,j._error,"Battery","start",[]):0===f()&&e(null,null,"Battery","stop",[])},i.prototype._status=function(a){if(a&&(j._level!==a.level||j._isPlugged!==a.isPlugged)){if(null==a.level&&null!=j._level)return;d.fireWindowEvent("batterystatus",a),a.isPlugged||(j._level>g&&a.level<=g?d.fireWindowEvent("batterycritical",a):j._level>h&&a.level<=h&&d.fireWindowEvent("batterylow",a)),j._level=a.level,j._isPlugged=a.isPlugged}},i.prototype._error=function(a){console.log("Error initializing Battery: "+a)};var j=new i;c.exports=j}),cordova.define("org.apache.cordova.camera.camera",function(a,b,c){var d=a("cordova/argscheck"),e=a("cordova/exec"),f=a("./Camera"),g={};for(var h in f)g[h]=f[h];g.getPicture=function(a,b,c){d.checkArgs("fFO","Camera.getPicture",arguments),c=c||{};var g=d.getValue,h=g(c.quality,50),i=g(c.destinationType,f.DestinationType.FILE_URI),j=g(c.sourceType,f.PictureSourceType.CAMERA),k=g(c.targetWidth,-1),l=g(c.targetHeight,-1),m=g(c.encodingType,f.EncodingType.JPEG),n=g(c.mediaType,f.MediaType.PICTURE),o=!!c.allowEdit,p=!!c.correctOrientation,q=!!c.saveToPhotoAlbum,r=g(c.popoverOptions,null),s=g(c.cameraDirection,f.Direction.BACK),t=[h,i,j,k,l,m,n,o,p,q,r,s];e(a,b,"Camera","takePicture",t)},g.cleanup=function(a,b){e(a,b,"Camera","cleanup",[])},c.exports=g}),cordova.define("org.apache.cordova.camera.Camera",function(a,b,c){c.exports={DestinationType:{DATA_URL:0,FILE_URI:1,NATIVE_URI:2},EncodingType:{JPEG:0,PNG:1},MediaType:{PICTURE:0,VIDEO:1,ALLMEDIA:2},PictureSourceType:{PHOTOLIBRARY:0,CAMERA:1,SAVEDPHOTOALBUM:2},PopoverArrowDirection:{ARROW_UP:1,ARROW_DOWN:2,ARROW_LEFT:4,ARROW_RIGHT:8,ARROW_ANY:15},Direction:{BACK:0,FRONT:1}}}),cordova.define("org.apache.cordova.camera.CameraPopoverOptions",function(a,b,c){var d=a("./Camera"),e=function(a,b,c,e,f){this.x=a||0,this.y=b||32,this.width=c||320,this.height=e||480,this.arrowDir=f||d.PopoverArrowDirection.ARROW_ANY};c.exports=e}),cordova.define("org.apache.cordova.contacts.Contact",function(a,b,c){function h(a){var b=a.birthday;try{a.birthday=new Date(parseFloat(b))}catch(c){console.log("Cordova Contact convertIn error: exception creating date.")}return a}function i(a){var b=a.birthday;if(null!==b){if(!g.isDate(b))try{b=new Date(b)}catch(c){b=null}g.isDate(b)&&(b=b.valueOf()),a.birthday=b}return a}var d=a("cordova/argscheck"),e=a("cordova/exec"),f=a("./ContactError"),g=a("cordova/utils"),j=function(a,b,c,d,e,f,g,h,i,j,k,l,m,n){this.id=a||null,this.rawId=null,this.displayName=b||null,this.name=c||null,this.nickname=d||null,this.phoneNumbers=e||null,this.emails=f||null,this.addresses=g||null,this.ims=h||null,this.organizations=i||null,this.birthday=j||null,this.note=k||null,this.photos=l||null,this.categories=m||null,this.urls=n||null};j.prototype.remove=function(a,b){d.checkArgs("FF","Contact.remove",arguments);var c=b&&function(a){b(new f(a))};null===this.id?c(f.UNKNOWN_ERROR):e(a,c,"Contacts","remove",[this.id])},j.prototype.clone=function(){function b(a){if(a)for(var b=0;b<a.length;++b)a[b].id=null}var a=g.clone(this);return a.id=null,a.rawId=null,b(a.phoneNumbers),b(a.emails),b(a.addresses),b(a.ims),b(a.organizations),b(a.categories),b(a.photos),b(a.urls),a},j.prototype.save=function(b,c){d.checkArgs("FFO","Contact.save",arguments);var j=c&&function(a){c(new f(a))},k=function(c){if(c){if(b){var d=a("./contacts").create(c);b(h(d))}}else j(f.UNKNOWN_ERROR)},l=i(g.clone(this));e(k,j,"Contacts","save",[l])},c.exports=j}),cordova.define("org.apache.cordova.contacts.ContactAddress",function(a,b,c){var d=function(a,b,c,d,e,f,g,h){this.id=null,this.pref="undefined"!=typeof a?a:!1,this.type=b||null,this.formatted=c||null,this.streetAddress=d||null,this.locality=e||null,this.region=f||null,this.postalCode=g||null,this.country=h||null};c.exports=d}),cordova.define("org.apache.cordova.contacts.ContactError",function(a,b,c){var d=function(a){this.code="undefined"!=typeof a?a:null};d.UNKNOWN_ERROR=0,d.INVALID_ARGUMENT_ERROR=1,d.TIMEOUT_ERROR=2,d.PENDING_OPERATION_ERROR=3,d.IO_ERROR=4,d.NOT_SUPPORTED_ERROR=5,d.PERMISSION_DENIED_ERROR=20,c.exports=d}),cordova.define("org.apache.cordova.contacts.ContactField",function(a,b,c){var d=function(a,b,c){this.id=null,this.type=a&&a.toString()||null,this.value=b&&b.toString()||null,this.pref="undefined"!=typeof c?c:!1};c.exports=d}),cordova.define("org.apache.cordova.contacts.ContactFieldType",function(a,b,c){var d={addresses:"addresses",birthday:"birthday",categories:"categories",country:"country",department:"department",displayName:"displayName",emails:"emails",familyName:"familyName",formatted:"formatted",givenName:"givenName",honorificPrefix:"honorificPrefix",honorificSuffix:"honorificSuffix",id:"id",ims:"ims",locality:"locality",middleName:"middleName",name:"name",nickname:"nickname",note:"note",organizations:"organizations",phoneNumbers:"phoneNumbers",photos:"photos",postalCode:"postalCode",region:"region",streetAddress:"streetAddress",title:"title",urls:"urls"};c.exports=d}),cordova.define("org.apache.cordova.contacts.ContactFindOptions",function(a,b,c){var d=function(a,b,c){this.filter=a||"",this.multiple="undefined"!=typeof b?b:!1,this.desiredFields="undefined"!=typeof c?c:[]};c.exports=d}),cordova.define("org.apache.cordova.contacts.ContactName",function(a,b,c){var d=function(a,b,c,d,e,f){this.formatted=a||null,this.familyName=b||null,this.givenName=c||null,this.middleName=d||null,this.honorificPrefix=e||null,this.honorificSuffix=f||null};c.exports=d}),cordova.define("org.apache.cordova.contacts.ContactOrganization",function(a,b,c){var d=function(a,b,c,d,e){this.id=null,this.pref="undefined"!=typeof a?a:!1,this.type=b||null,this.name=c||null,this.department=d||null,this.title=e||null};c.exports=d}),cordova.define("org.apache.cordova.contacts.contacts",function(a,b,c){var d=a("cordova/argscheck"),e=a("cordova/exec"),f=a("./ContactError"),h=(a("cordova/utils"),a("./Contact")),i=a("./ContactFieldType"),j={fieldType:i,find:function(a,b,c,g){if(d.checkArgs("afFO","contacts.find",arguments),a.length){g=g||{filter:"",multiple:!0};var h=function(a){for(var c=[],d=0,e=a.length;e>d;d++)c.push(j.create(a[d]));b(c)};e(h,c,"Contacts","search",[a,g])}else c&&c(new f(f.INVALID_ARGUMENT_ERROR))},pickContact:function(a,b){d.checkArgs("fF","contacts.pick",arguments);var c=function(b){var c=b instanceof h?b:j.create(b);a(c)};e(c,b,"Contacts","pickContact",[])},create:function(a){d.checkArgs("O","contacts.create",arguments);var b=new h;for(var c in a)"undefined"!=typeof b[c]&&a.hasOwnProperty(c)&&(b[c]=a[c]);return b}};c.exports=j}),cordova.define("org.apache.cordova.device.device",function(a,b,c){function i(){this.available=!1,this.platform=null,this.version=null,this.uuid=null,this.cordova=null,this.model=null;var a=this;e.onCordovaReady.subscribe(function(){a.getInfo(function(b){var c=h.version;a.available=!0,a.platform=b.platform,a.version=b.version,a.uuid=b.uuid,a.cordova=c,a.model=b.model,e.onCordovaInfoReady.fire()},function(b){a.available=!1,f.alert("[ERROR] Error initializing Cordova: "+b)})})}var d=a("cordova/argscheck"),e=a("cordova/channel"),f=a("cordova/utils"),g=a("cordova/exec"),h=a("cordova");e.createSticky("onCordovaInfoReady"),e.waitForInitialization("onCordovaInfoReady"),i.prototype.getInfo=function(a,b){d.checkArgs("fF","Device.getInfo",arguments),g(a,b,"Device","getDeviceInfo",[])},c.exports=new i}),cordova.define("org.apache.cordova.device-motion.Acceleration",function(a,b,c){var d=function(a,b,c,d){this.x=a,this.y=b,this.z=c,this.timestamp=d||(new Date).getTime()};c.exports=d}),cordova.define("org.apache.cordova.device-motion.accelerometer",function(a,b,c){function l(){f(function(a){var b=j.slice(0);k=new g(a.x,a.y,a.z,a.timestamp);for(var c=0,d=b.length;d>c;c++)b[c].win(k)},function(a){for(var b=j.slice(0),c=0,d=b.length;d>c;c++)b[c].fail(a)},"Accelerometer","start",[]),h=!0}function m(){f(null,null,"Accelerometer","stop",[]),h=!1}function n(a,b){return{win:a,fail:b}}function o(a){var b=j.indexOf(a);b>-1&&(j.splice(b,1),0===j.length&&m())}var d=a("cordova/argscheck"),e=a("cordova/utils"),f=a("cordova/exec"),g=a("./Acceleration"),h=!1,i={},j=[],k=null,p={getCurrentAcceleration:function(a,b){d.checkArgs("fFO","accelerometer.getCurrentAcceleration",arguments);var e,f=function(b){o(e),a(b)},g=function(a){o(e),b&&b(a)};e=n(f,g),j.push(e),h||l()},watchAcceleration:function(a,b,c){d.checkArgs("fFO","accelerometer.watchAcceleration",arguments);var f=c&&c.frequency&&"number"==typeof c.frequency?c.frequency:1e4,g=e.createUUID(),m=n(function(){},function(a){o(m),b&&b(a)});return j.push(m),i[g]={timer:window.setInterval(function(){k&&a(k)},f),listeners:m},h?k&&a(k):l(),g},clearWatch:function(a){a&&i[a]&&(window.clearInterval(i[a].timer),o(i[a].listeners),delete i[a])}};c.exports=p}),cordova.define("org.apache.cordova.device-orientation.compass",function(a,b,c){var d=a("cordova/argscheck"),e=a("cordova/exec"),f=a("cordova/utils"),g=a("./CompassHeading"),h=a("./CompassError"),i={},j={getCurrentHeading:function(a,b,c){d.checkArgs("fFO","compass.getCurrentHeading",arguments);var f=function(b){var c=new g(b.magneticHeading,b.trueHeading,b.headingAccuracy,b.timestamp);a(c)},i=b&&function(a){var c=new h(a);b(c)};e(f,i,"Compass","getHeading",[c])},watchHeading:function(a,b,c){d.checkArgs("fFO","compass.watchHeading",arguments);var e=void 0!==c&&void 0!==c.frequency?c.frequency:100,g=void 0!==c&&void 0!==c.filter?c.filter:0,h=f.createUUID();return g>0?(i[h]="iOS",j.getCurrentHeading(a,b,c)):i[h]=window.setInterval(function(){j.getCurrentHeading(a,b)},e),h},clearWatch:function(a){a&&i[a]&&("iOS"!=i[a]?clearInterval(i[a]):e(null,null,"Compass","stopHeading",[]),delete i[a])}};c.exports=j}),cordova.define("org.apache.cordova.device-orientation.CompassError",function(a,b,c){var d=function(a){this.code=void 0!==a?a:null};d.COMPASS_INTERNAL_ERR=0,d.COMPASS_NOT_SUPPORTED=20,c.exports=d}),cordova.define("org.apache.cordova.device-orientation.CompassHeading",function(a,b,c){var d=function(a,b,c,d){this.magneticHeading=a,this.trueHeading=b,this.headingAccuracy=c,this.timestamp=d||(new Date).getTime()};c.exports=d}),cordova.define("org.apache.cordova.dialogs.notification_android",function(a,b,c){var d=a("cordova/exec");c.exports={activityStart:function(a,b){"undefined"==typeof a&&"undefined"==typeof b&&(a="Busy",b="Please wait..."),d(null,null,"Notification","activityStart",[a,b])},activityStop:function(){d(null,null,"Notification","activityStop",[])},progressStart:function(a,b){d(null,null,"Notification","progressStart",[a,b])},progressStop:function(){d(null,null,"Notification","progressStop",[])},progressValue:function(a){d(null,null,"Notification","progressValue",[a])}}}),cordova.define("org.apache.cordova.file.DirectoryEntry",function(a,b,c){var d=a("cordova/argscheck"),e=a("cordova/utils"),f=a("cordova/exec"),g=a("./Entry"),h=a("./FileError"),i=a("./DirectoryReader"),j=function(a,b,c,d){b&&!/\/$/.test(b)&&(b+="/"),d&&!/\/$/.test(d)&&(d+="/"),j.__super__.constructor.call(this,!1,!0,a,b,c,d)};e.extend(j,g),j.prototype.createReader=function(){return new i(this.toInternalURL())},j.prototype.getDirectory=function(a,b,c,e){d.checkArgs("sOFF","DirectoryEntry.getDirectory",arguments);var g=this.filesystem,i=c&&function(a){var b=new j(a.name,a.fullPath,g,a.nativeURL);c(b)},k=e&&function(a){e(new h(a))};f(i,k,"File","getDirectory",[this.toInternalURL(),a,b])},j.prototype.removeRecursively=function(a,b){d.checkArgs("FF","DirectoryEntry.removeRecursively",arguments);var c=b&&function(a){b(new h(a))};f(a,c,"File","removeRecursively",[this.toInternalURL()])},j.prototype.getFile=function(b,c,e,g){d.checkArgs("sOFF","DirectoryEntry.getFile",arguments);var i=this.filesystem,j=e&&function(b){var c=a("./FileEntry"),d=new c(b.name,b.fullPath,i,b.nativeURL);e(d)},k=g&&function(a){g(new h(a))};f(j,k,"File","getFile",[this.toInternalURL(),b,c])},c.exports=j}),cordova.define("org.apache.cordova.file.DirectoryReader",function(a,b,c){function f(a){this.localURL=a||null,this.hasReadEntries=!1}var d=a("cordova/exec"),e=a("./FileError");f.prototype.readEntries=function(b,c){if(this.hasReadEntries)return b([]),void 0;var f=this,g="function"!=typeof b?null:function(c){for(var d=[],e=0;e<c.length;e++){var g=null;c[e].isDirectory?g=new(a("./DirectoryEntry")):c[e].isFile&&(g=new(a("./FileEntry"))),g.isDirectory=c[e].isDirectory,g.isFile=c[e].isFile,g.name=c[e].name,g.fullPath=c[e].fullPath,g.filesystem=new(a("./FileSystem"))(c[e].filesystemName),g.nativeURL=c[e].nativeURL,d.push(g)}f.hasReadEntries=!0,b(d)},h="function"!=typeof c?null:function(a){c(new e(a))};d(g,h,"File","readEntries",[this.localURL])},c.exports=f}),cordova.define("org.apache.cordova.file.Entry",function(a,b,c){function h(a,b,c,d,e,f){this.isFile=!!a,this.isDirectory=!!b,this.name=c||"",this.fullPath=d||"",this.filesystem=e||null,this.nativeURL=f||null}var d=a("cordova/argscheck"),e=a("cordova/exec"),f=a("./FileError"),g=a("./Metadata");h.prototype.getMetadata=function(a,b){d.checkArgs("FF","Entry.getMetadata",arguments);var c=a&&function(b){var c=new g({size:b.size,modificationTime:b.lastModifiedDate});a(c)},h=b&&function(a){b(new f(a))};e(c,h,"File","getFileMetadata",[this.toInternalURL()])},h.prototype.setMetadata=function(a,b,c){d.checkArgs("FFO","Entry.setMetadata",arguments),e(a,b,"File","setMetadata",[this.toInternalURL(),c])},h.prototype.moveTo=function(b,c,g,h){d.checkArgs("oSFF","Entry.moveTo",arguments);var i=h&&function(a){h(new f(a))},k=(this.filesystem,this.toInternalURL()),l=c||this.name,m=function(c){if(c){if(g){var d=c.filesystemName||c.filesystem&&c.filesystem.name,e=d?new FileSystem(d,{name:"",fullPath:"/"}):new FileSystem(b.filesystem.name,{name:"",fullPath:"/"}),h=c.isDirectory?new(a("./DirectoryEntry"))(c.name,c.fullPath,e,c.nativeURL):new(a("org.apache.cordova.file.FileEntry"))(c.name,c.fullPath,e,c.nativeURL);g(h)}}else i&&i(f.NOT_FOUND_ERR)};e(m,i,"File","moveTo",[k,b.toInternalURL(),l])},h.prototype.copyTo=function(b,c,g,h){d.checkArgs("oSFF","Entry.copyTo",arguments);var i=h&&function(a){h(new f(a))},k=(this.filesystem,this.toInternalURL()),l=c||this.name,m=function(c){if(c){if(g){var d=c.filesystemName||c.filesystem&&c.filesystem.name,e=d?new FileSystem(d,{name:"",fullPath:"/"}):new FileSystem(b.filesystem.name,{name:"",fullPath:"/"}),h=c.isDirectory?new(a("./DirectoryEntry"))(c.name,c.fullPath,e,c.nativeURL):new(a("org.apache.cordova.file.FileEntry"))(c.name,c.fullPath,e,c.nativeURL);g(h)}}else i&&i(f.NOT_FOUND_ERR)};e(m,i,"File","copyTo",[k,b.toInternalURL(),l])},h.prototype.toInternalURL=function(){return this.filesystem&&this.filesystem.__format__?this.filesystem.__format__(this.fullPath):void 0},h.prototype.toURL=function(){return this.nativeURL?this.nativeURL:this.toInternalURL()||"file://localhost"+this.fullPath},h.prototype.toNativeURL=function(){return console.log("DEPRECATED: Update your code to use 'toURL'"),this.toURL()},h.prototype.toURI=function(){return console.log("DEPRECATED: Update your code to use 'toURL'"),this.toURL()},h.prototype.remove=function(a,b){d.checkArgs("FF","Entry.remove",arguments);var c=b&&function(a){b(new f(a))};e(a,c,"File","remove",[this.toInternalURL()])},h.prototype.getParent=function(b,c){d.checkArgs("FF","Entry.getParent",arguments);var g=this.filesystem,h=b&&function(c){var d=a("./DirectoryEntry"),e=new d(c.name,c.fullPath,g,c.nativeURL);b(e)},i=c&&function(a){c(new f(a))};e(h,i,"File","getParent",[this.toInternalURL()])},c.exports=h}),cordova.define("org.apache.cordova.file.File",function(a,b,c){var d=function(a,b,c,d,e){this.name=a||"",this.localURL=b||null,this.type=c||null,this.lastModified=d||null,this.lastModifiedDate=d||null,this.size=e||0,this.start=0,this.end=this.size};d.prototype.slice=function(a,b){var c=this.end-this.start,e=0,f=c;arguments.length&&(e=0>a?Math.max(c+a,0):Math.min(c,a)),arguments.length>=2&&(f=0>b?Math.max(c+b,0):Math.min(b,c));var g=new d(this.name,this.localURL,this.type,this.lastModified,this.size);return g.start=this.start+e,g.end=this.start+f,g},c.exports=d}),cordova.define("org.apache.cordova.file.FileEntry",function(a,b,c){var d=a("cordova/utils"),e=a("cordova/exec"),f=a("./Entry"),g=a("./FileWriter"),h=a("./File"),i=a("./FileError"),j=function(a,b,c,d){j.__super__.constructor.apply(this,[!0,!1,a,b,c,d])};d.extend(j,f),j.prototype.createWriter=function(a,b){this.file(function(c){var d=new g(c);null===d.localURL||""===d.localURL?b&&b(new i(i.INVALID_STATE_ERR)):a&&a(d)},b)},j.prototype.file=function(a,b){var c=this.toInternalURL(),d=a&&function(b){var d=new h(b.name,c,b.type,b.lastModifiedDate,b.size);a(d)},f=b&&function(a){b(new i(a))};e(d,f,"File","getFileMetadata",[c])},c.exports=j}),cordova.define("org.apache.cordova.file.FileError",function(a,b,c){function d(a){this.code=a||null}d.NOT_FOUND_ERR=1,d.SECURITY_ERR=2,d.ABORT_ERR=3,d.NOT_READABLE_ERR=4,d.ENCODING_ERR=5,d.NO_MODIFICATION_ALLOWED_ERR=6,d.INVALID_STATE_ERR=7,d.SYNTAX_ERR=8,d.INVALID_MODIFICATION_ERR=9,d.QUOTA_EXCEEDED_ERR=10,d.TYPE_MISMATCH_ERR=11,d.PATH_EXISTS_ERR=12,c.exports=d}),cordova.define("org.apache.cordova.file.FileReader",function(a,b,c){function l(a){f.defineGetterSetter(k.prototype,a,function(){return this._realReader[a]||null},function(b){this._realReader[a]=b})}function m(a,b){if(a.readyState==k.LOADING)throw new h(h.INVALID_STATE_ERR);return a._result=null,a._error=null,a._readyState=k.LOADING,"string"!=typeof b.localURL?(a._localURL="",!0):(a._localURL=b.localURL,a.onloadstart&&a.onloadstart(new i("loadstart",{target:a})),void 0)}var d=a("cordova/exec"),e=a("cordova/modulemapper"),f=a("cordova/utils"),h=(a("./File"),a("./FileError")),i=a("./ProgressEvent"),j=e.getOriginalSymbol(window,"FileReader"),k=function(){this._readyState=0,this._error=null,this._result=null,this._localURL="",this._realReader=j?new j:{}};k.EMPTY=0,k.LOADING=1,k.DONE=2,f.defineGetter(k.prototype,"readyState",function(){return this._localURL?this._readyState:this._realReader.readyState}),f.defineGetter(k.prototype,"error",function(){return this._localURL?this._error:this._realReader.error}),f.defineGetter(k.prototype,"result",function(){return this._localURL?this._result:this._realReader.result}),l("onloadstart"),l("onprogress"),l("onload"),l("onerror"),l("onloadend"),l("onabort"),k.prototype.abort=function(){return j&&!this._localURL?this._realReader.abort():(this._result=null,this._readyState!=k.DONE&&this._readyState!=k.EMPTY&&(this._readyState=k.DONE,"function"==typeof this.onabort&&this.onabort(new i("abort",{target:this})),"function"==typeof this.onloadend&&this.onloadend(new i("loadend",{target:this}))),void 0)},k.prototype.readAsText=function(a,b){if(m(this,a))return this._realReader.readAsText(a,b);var c=b?b:"UTF-8",e=this,f=[this._localURL,c,a.start,a.end];d(function(a){e._readyState!==k.DONE&&(e._readyState=k.DONE,e._result=a,"function"==typeof e.onload&&e.onload(new i("load",{target:e})),"function"==typeof e.onloadend&&e.onloadend(new i("loadend",{target:e})))},function(a){e._readyState!==k.DONE&&(e._readyState=k.DONE,e._result=null,e._error=new h(a),"function"==typeof e.onerror&&e.onerror(new i("error",{target:e})),"function"==typeof e.onloadend&&e.onloadend(new i("loadend",{target:e})))},"File","readAsText",f)},k.prototype.readAsDataURL=function(a){if(m(this,a))return this._realReader.readAsDataURL(a);var b=this,c=[this._localURL,a.start,a.end];d(function(a){b._readyState!==k.DONE&&(b._readyState=k.DONE,b._result=a,"function"==typeof b.onload&&b.onload(new i("load",{target:b})),"function"==typeof b.onloadend&&b.onloadend(new i("loadend",{target:b})))},function(a){b._readyState!==k.DONE&&(b._readyState=k.DONE,b._result=null,b._error=new h(a),"function"==typeof b.onerror&&b.onerror(new i("error",{target:b})),"function"==typeof b.onloadend&&b.onloadend(new i("loadend",{target:b})))},"File","readAsDataURL",c)},k.prototype.readAsBinaryString=function(a){if(m(this,a))return this._realReader.readAsBinaryString(a);var b=this,c=[this._localURL,a.start,a.end];d(function(a){b._readyState!==k.DONE&&(b._readyState=k.DONE,b._result=a,"function"==typeof b.onload&&b.onload(new i("load",{target:b})),"function"==typeof b.onloadend&&b.onloadend(new i("loadend",{target:b})))},function(a){b._readyState!==k.DONE&&(b._readyState=k.DONE,b._result=null,b._error=new h(a),"function"==typeof b.onerror&&b.onerror(new i("error",{target:b})),"function"==typeof b.onloadend&&b.onloadend(new i("loadend",{target:b})))},"File","readAsBinaryString",c)},k.prototype.readAsArrayBuffer=function(a){if(m(this,a))return this._realReader.readAsArrayBuffer(a);var b=this,c=[this._localURL,a.start,a.end];d(function(a){b._readyState!==k.DONE&&(b._readyState=k.DONE,b._result=a,"function"==typeof b.onload&&b.onload(new i("load",{target:b})),"function"==typeof b.onloadend&&b.onloadend(new i("loadend",{target:b})))},function(a){b._readyState!==k.DONE&&(b._readyState=k.DONE,b._result=null,b._error=new h(a),"function"==typeof b.onerror&&b.onerror(new i("error",{target:b})),"function"==typeof b.onloadend&&b.onloadend(new i("loadend",{target:b})))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                },"File","readAsArrayBuffer",c)},c.exports=k}),cordova.define("org.apache.cordova.file.fileSystemPaths",function(a,b){var d=a("cordova/exec"),e=a("cordova/channel");b.file={applicationDirectory:null,applicationStorageDirectory:null,dataDirectory:null,cacheDirectory:null,externalApplicationStorageDirectory:null,externalDataDirectory:null,externalCacheDirectory:null,externalRootDirectory:null,tempDirectory:null,syncedDataDirectory:null,documentsDirectory:null,sharedDirectory:null},e.waitForInitialization("onFileSystemPathsReady"),e.onCordovaReady.subscribe(function(){function a(a){for(var c in a)b.file[c]=a[c];e.initializationComplete("onFileSystemPathsReady")}d(a,null,"File","requestAllPaths",[])})}),cordova.define("org.apache.cordova.file.fileSystems-roots",function(a){var d=null,e=a("./FileSystem"),f=a("cordova/exec");a("./fileSystems").getFs=function(a,b){function c(c){d={};for(var f=0;f<c.length;++f){var g=c[f],h=new e(g.filesystemName,g);d[h.name]=h}b(d[a])}d?b(d[a]):f(c,null,"File","requestAllFileSystems",[])}}),cordova.define("org.apache.cordova.file.fileSystems",function(a,b,c){c.exports.getFs=function(a,b){b(null)}}),cordova.define("org.apache.cordova.file.FileUploadOptions",function(a,b,c){var d=function(a,b,c,d,e,f){this.fileKey=a||null,this.fileName=b||null,this.mimeType=c||null,this.params=d||null,this.headers=e||null,this.httpMethod=f||null};c.exports=d}),cordova.define("org.apache.cordova.file.FileUploadResult",function(a,b,c){c.exports=function(a,b,c){this.bytesSent=a,this.responseCode=b,this.response=c}}),cordova.define("org.apache.cordova.file.FileWriter",function(a,b,c){var d=a("cordova/exec"),e=a("./FileError"),f=a("./ProgressEvent"),g=function(a){this.fileName="",this.length=0,a&&(this.localURL=a.localURL||a,this.length=a.size||0),this.position=0,this.readyState=0,this.result=null,this.error=null,this.onwritestart=null,this.onprogress=null,this.onwrite=null,this.onwriteend=null,this.onabort=null,this.onerror=null};g.INIT=0,g.WRITING=1,g.DONE=2,g.prototype.abort=function(){if(this.readyState===g.DONE||this.readyState===g.INIT)throw new e(e.INVALID_STATE_ERR);this.error=new e(e.ABORT_ERR),this.readyState=g.DONE,"function"==typeof this.onabort&&this.onabort(new f("abort",{target:this})),"function"==typeof this.onwriteend&&this.onwriteend(new f("writeend",{target:this}))},g.prototype.write=function(a){var i,b=this,c="undefined"!=typeof window.Blob&&"undefined"!=typeof window.ArrayBuffer,h="windows8"===cordova.platformId||"windows"===cordova.platformId;if(a instanceof File||!h&&c&&a instanceof Blob){var j=new FileReader;return j.onload=function(){g.prototype.write.call(b,this.result)},c?j.readAsArrayBuffer(a):j.readAsText(a),void 0}if(i=c&&a instanceof ArrayBuffer,i&&"windowsphone"===cordova.platformId&&(a=Array.apply(null,new Uint8Array(a))),this.readyState===g.WRITING)throw new e(e.INVALID_STATE_ERR);this.readyState=g.WRITING;var k=this;"function"==typeof k.onwritestart&&k.onwritestart(new f("writestart",{target:k})),d(function(a){k.readyState!==g.DONE&&(k.position+=a,k.length=k.position,k.readyState=g.DONE,"function"==typeof k.onwrite&&k.onwrite(new f("write",{target:k})),"function"==typeof k.onwriteend&&k.onwriteend(new f("writeend",{target:k})))},function(a){k.readyState!==g.DONE&&(k.readyState=g.DONE,k.error=new e(a),"function"==typeof k.onerror&&k.onerror(new f("error",{target:k})),"function"==typeof k.onwriteend&&k.onwriteend(new f("writeend",{target:k})))},"File","write",[this.localURL,a,this.position,i])},g.prototype.seek=function(a){if(this.readyState===g.WRITING)throw new e(e.INVALID_STATE_ERR);(a||0===a)&&(this.position=0>a?Math.max(a+this.length,0):a>this.length?this.length:a)},g.prototype.truncate=function(a){if(this.readyState===g.WRITING)throw new e(e.INVALID_STATE_ERR);this.readyState=g.WRITING;var b=this;"function"==typeof b.onwritestart&&b.onwritestart(new f("writestart",{target:this})),d(function(a){b.readyState!==g.DONE&&(b.readyState=g.DONE,b.length=a,b.position=Math.min(b.position,a),"function"==typeof b.onwrite&&b.onwrite(new f("write",{target:b})),"function"==typeof b.onwriteend&&b.onwriteend(new f("writeend",{target:b})))},function(a){b.readyState!==g.DONE&&(b.readyState=g.DONE,b.error=new e(a),"function"==typeof b.onerror&&b.onerror(new f("error",{target:b})),"function"==typeof b.onwriteend&&b.onwriteend(new f("writeend",{target:b})))},"File","truncate",[this.localURL,a])},c.exports=g}),cordova.define("org.apache.cordova.file.Flags",function(a,b,c){function d(a,b){this.create=a||!1,this.exclusive=b||!1}c.exports=d}),cordova.define("org.apache.cordova.file.LocalFileSystem",function(a,b){b.TEMPORARY=0,b.PERSISTENT=1}),cordova.define("org.apache.cordova.file.Metadata",function(a,b,c){var d=function(a){"object"==typeof a?(this.modificationTime=new Date(a.modificationTime),this.size=a.size||0):"undefined"==typeof a?(this.modificationTime=null,this.size=0):this.modificationTime=new Date(a)};c.exports=d}),cordova.define("org.apache.cordova.file.ProgressEvent",function(a,b,c){var d=function(){return function(a,b){this.type=a,this.bubbles=!1,this.cancelBubble=!1,this.cancelable=!1,this.lengthComputable=!1,this.loaded=b&&b.loaded?b.loaded:0,this.total=b&&b.total?b.total:0,this.target=b&&b.target?b.target:null}}();c.exports=d}),cordova.define("org.apache.cordova.file.requestFileSystem",function(a,b,c){var d=a("cordova/argscheck"),e=a("./FileError"),f=a("./FileSystem"),g=a("cordova/exec"),h=a("./fileSystems"),i=function(a,b,c,i){d.checkArgs("nnFF","requestFileSystem",arguments);var j=function(a){i&&i(new e(a))};if(0>a)j(e.SYNTAX_ERR);else{var k=function(a){a?c&&h.getFs(a.name,function(b){b||(b=new f(a.name,a.root)),c(b)}):j(e.NOT_FOUND_ERR)};g(k,j,"File","requestFileSystem",[a,b])}};c.exports=i}),cordova.define("org.apache.cordova.file.resolveLocalFileSystemURI",function(a,b,c){var d=a("cordova/argscheck"),e=a("./DirectoryEntry"),f=a("./FileEntry"),g=a("./FileError"),h=a("cordova/exec"),i=a("./fileSystems");c.exports.resolveLocalFileSystemURL=function(a,b,c){d.checkArgs("sFF","resolveLocalFileSystemURI",arguments);var j=function(a){c&&c(new g(a))};if(!a||a.split(":").length>2)return setTimeout(function(){j(g.ENCODING_ERR)},0),void 0;var k=function(a){if(a){if(b){var c=a.filesystemName||a.filesystem&&a.filesystem.name||(a.filesystem==window.PERSISTENT?"persistent":"temporary");i.getFs(c,function(d){d||(d=new FileSystem(c,{name:"",fullPath:"/"}));var g=a.isDirectory?new e(a.name,a.fullPath,d,a.nativeURL):new f(a.name,a.fullPath,d,a.nativeURL);b(g)})}}else j(g.NOT_FOUND_ERR)};h(k,j,"File","resolveLocalFileSystemURI",[a])},c.exports.resolveLocalFileSystemURI=function(){console.log("resolveLocalFileSystemURI is deprecated. Please call resolveLocalFileSystemURL instead."),c.exports.resolveLocalFileSystemURL.apply(this,arguments)}}),cordova.define("org.apache.cordova.file.androidFileSystem",function(a,b,c){FILESYSTEM_PROTOCOL="cdvfile",c.exports={__format__:function(a){if("content"===this.name)return"content:/"+a;var b=("/"+this.name+("/"===a[0]?"":"/")+encodeURI(a)).replace("//","/");return FILESYSTEM_PROTOCOL+"://localhost"+b}}}),cordova.define("org.apache.cordova.file-transfer.FileTransfer",function(a,b,c){function h(a){var b=new g;return b.lengthComputable=a.lengthComputable,b.loaded=a.loaded,b.total=a.total,b}function i(a){var b=/^http\:\/\/((.*?)\:(.*?))@.*$/g,c=b.exec(a);return c&&c[1]}function j(a){var b=null;if(window.btoa){var c=i(a);if(c){var d="Authorization",e="Basic "+window.btoa(c);b={name:d,value:e}}}return b}var d=a("cordova/argscheck"),e=a("cordova/exec"),f=a("./FileTransferError"),g=a("org.apache.cordova.file.ProgressEvent"),k=0,l=function(){this._id=++k,this.onprogress=null};l.prototype.upload=function(a,b,c,g,k,l){d.checkArgs("ssFFO*","FileTransfer.upload",arguments);var m=null,n=null,o=null,p=null,q=!0,r=null,s=null,t=j(b);t&&(b=b.replace(i(b)+"@",""),k=k||{},k.headers=k.headers||{},k.headers[t.name]=t.value),k&&(m=k.fileKey,n=k.fileName,o=k.mimeType,r=k.headers,s=k.httpMethod||"POST",s="PUT"==s.toUpperCase()?"PUT":"POST",(null!==k.chunkedMode||"undefined"!=typeof k.chunkedMode)&&(q=k.chunkedMode),p=k.params?k.params:{});var u=g&&function(a){var b=new f(a.code,a.source,a.target,a.http_status,a.body,a.exception);g(b)},v=this,w=function(a){"undefined"!=typeof a.lengthComputable?v.onprogress&&v.onprogress(h(a)):c&&c(a)};e(w,u,"FileTransfer","upload",[a,b,m,n,o,p,l,q,r,this._id,s])},l.prototype.download=function(b,c,g,k,l,m){d.checkArgs("ssFF*","FileTransfer.download",arguments);var n=this,o=j(b);o&&(b=b.replace(i(b)+"@",""),m=m||{},m.headers=m.headers||{},m.headers[o.name]=o.value);var p=null;m&&(p=m.headers||null);var q=function(b){if("undefined"!=typeof b.lengthComputable){if(n.onprogress)return n.onprogress(h(b))}else if(g){var c=null;b.isDirectory?c=new(a("org.apache.cordova.file.DirectoryEntry")):b.isFile&&(c=new(a("org.apache.cordova.file.FileEntry"))),c.isDirectory=b.isDirectory,c.isFile=b.isFile,c.name=b.name,c.fullPath=b.fullPath,c.filesystem=new FileSystem(b.filesystemName||(b.filesystem==window.PERSISTENT?"persistent":"temporary")),c.nativeURL=b.nativeURL,g(c)}},r=k&&function(a){var b=new f(a.code,a.source,a.target,a.http_status,a.body,a.exception);k(b)};e(q,r,"FileTransfer","download",[b,c,l,this._id,p])},l.prototype.abort=function(){e(null,null,"FileTransfer","abort",[this._id])},c.exports=l}),cordova.define("org.apache.cordova.file-transfer.FileTransferError",function(a,b,c){var d=function(a,b,c,d,e,f){this.code=a||null,this.source=b||null,this.target=c||null,this.http_status=d||null,this.body=e||null,this.exception=f||null};d.FILE_NOT_FOUND_ERR=1,d.INVALID_URL_ERR=2,d.CONNECTION_ERR=3,d.ABORT_ERR=4,d.NOT_MODIFIED_ERR=5,c.exports=d}),cordova.define("org.apache.cordova.globalization.globalization",function(a,b,c){var d=a("cordova/argscheck"),e=a("cordova/exec");a("./GlobalizationError");var g={getPreferredLanguage:function(a,b){d.checkArgs("fF","Globalization.getPreferredLanguage",arguments),e(a,b,"Globalization","getPreferredLanguage",[])},getLocaleName:function(a,b){d.checkArgs("fF","Globalization.getLocaleName",arguments),e(a,b,"Globalization","getLocaleName",[])},dateToString:function(a,b,c,f){d.checkArgs("dfFO","Globalization.dateToString",arguments);var g=a.valueOf();e(b,c,"Globalization","dateToString",[{date:g,options:f}])},stringToDate:function(a,b,c,f){d.checkArgs("sfFO","Globalization.stringToDate",arguments),e(b,c,"Globalization","stringToDate",[{dateString:a,options:f}])},getDatePattern:function(a,b,c){d.checkArgs("fFO","Globalization.getDatePattern",arguments),e(a,b,"Globalization","getDatePattern",[{options:c}])},getDateNames:function(a,b,c){d.checkArgs("fFO","Globalization.getDateNames",arguments),e(a,b,"Globalization","getDateNames",[{options:c}])},isDayLightSavingsTime:function(a,b,c){d.checkArgs("dfF","Globalization.isDayLightSavingsTime",arguments);var f=a.valueOf();e(b,c,"Globalization","isDayLightSavingsTime",[{date:f}])},getFirstDayOfWeek:function(a,b){d.checkArgs("fF","Globalization.getFirstDayOfWeek",arguments),e(a,b,"Globalization","getFirstDayOfWeek",[])},numberToString:function(a,b,c,f){d.checkArgs("nfFO","Globalization.numberToString",arguments),e(b,c,"Globalization","numberToString",[{number:a,options:f}])},stringToNumber:function(a,b,c,f){d.checkArgs("sfFO","Globalization.stringToNumber",arguments),e(b,c,"Globalization","stringToNumber",[{numberString:a,options:f}])},getNumberPattern:function(a,b,c){d.checkArgs("fFO","Globalization.getNumberPattern",arguments),e(a,b,"Globalization","getNumberPattern",[{options:c}])},getCurrencyPattern:function(a,b,c){d.checkArgs("sfF","Globalization.getCurrencyPattern",arguments),e(b,c,"Globalization","getCurrencyPattern",[{currencyCode:a}])}};c.exports=g}),cordova.define("org.apache.cordova.globalization.GlobalizationError",function(a,b,c){var d=function(a,b){this.code=a||null,this.message=b||""};d.UNKNOWN_ERROR=0,d.FORMATTING_ERROR=1,d.PARSING_ERROR=2,d.PATTERN_ERROR=3,c.exports=d}),cordova.define("org.apache.cordova.inappbrowser.inappbrowser",function(a,b,c){function h(){this.channels={loadstart:e.create("loadstart"),loadstop:e.create("loadstop"),loaderror:e.create("loaderror"),exit:e.create("exit")}}var d=a("cordova/exec"),e=a("cordova/channel"),f=a("cordova/modulemapper"),g=a("cordova/urlutil");h.prototype={_eventHandler:function(a){a&&a.type in this.channels&&this.channels[a.type].fire(a)},close:function(){d(null,null,"InAppBrowser","close",[])},show:function(){d(null,null,"InAppBrowser","show",[])},addEventListener:function(a,b){a in this.channels&&this.channels[a].subscribe(b)},removeEventListener:function(a,b){a in this.channels&&this.channels[a].unsubscribe(b)},executeScript:function(a,b){if(a.code)d(b,null,"InAppBrowser","injectScriptCode",[a.code,!!b]);else{if(!a.file)throw new Error("executeScript requires exactly one of code or file to be specified");d(b,null,"InAppBrowser","injectScriptFile",[a.file,!!b])}},insertCSS:function(a,b){if(a.code)d(b,null,"InAppBrowser","injectStyleCode",[a.code,!!b]);else{if(!a.file)throw new Error("insertCSS requires exactly one of code or file to be specified");d(b,null,"InAppBrowser","injectStyleFile",[a.file,!!b])}}},c.exports=function(a,b,c,e){if(window.frames&&window.frames[b]){var i=f.getOriginalSymbol(window,"open");return i.apply(window,arguments)}a=g.makeAbsolute(a);var j=new h;e=e||{};for(var k in e)j.addEventListener(k,e[k]);var l=function(a){j._eventHandler(a)};return c=c||"",d(l,l,"InAppBrowser","open",[a,b,c]),j}}),cordova.define("org.apache.cordova.media.Media",function(a,b,c){var d=a("cordova/argscheck"),e=a("cordova/utils"),f=a("cordova/exec"),g={},h=function(a,b,c,h){d.checkArgs("SFFF","Media",arguments),this.id=e.createUUID(),g[this.id]=this,this.src=a,this.successCallback=b,this.errorCallback=c,this.statusCallback=h,this._duration=-1,this._position=-1,f(null,this.errorCallback,"Media","create",[this.id,this.src])};h.MEDIA_STATE=1,h.MEDIA_DURATION=2,h.MEDIA_POSITION=3,h.MEDIA_ERROR=9,h.MEDIA_NONE=0,h.MEDIA_STARTING=1,h.MEDIA_RUNNING=2,h.MEDIA_PAUSED=3,h.MEDIA_STOPPED=4,h.MEDIA_MSG=["None","Starting","Running","Paused","Stopped"],h.get=function(a){return g[a]},h.prototype.play=function(a){f(null,null,"Media","startPlayingAudio",[this.id,this.src,a])},h.prototype.stop=function(){var a=this;f(function(){a._position=0},this.errorCallback,"Media","stopPlayingAudio",[this.id])},h.prototype.seekTo=function(a){var b=this;f(function(a){b._position=a},this.errorCallback,"Media","seekToAudio",[this.id,a])},h.prototype.pause=function(){f(null,this.errorCallback,"Media","pausePlayingAudio",[this.id])},h.prototype.getDuration=function(){return this._duration},h.prototype.getCurrentPosition=function(a,b){var c=this;f(function(b){c._position=b,a(b)},b,"Media","getCurrentPositionAudio",[this.id])},h.prototype.startRecord=function(){f(null,this.errorCallback,"Media","startRecordingAudio",[this.id,this.src])},h.prototype.stopRecord=function(){f(null,this.errorCallback,"Media","stopRecordingAudio",[this.id])},h.prototype.release=function(){f(null,this.errorCallback,"Media","release",[this.id])},h.prototype.setVolume=function(a){f(null,null,"Media","setVolume",[this.id,a])},h.onStatus=function(a,b,c){var d=g[a];if(d)switch(b){case h.MEDIA_STATE:d.statusCallback&&d.statusCallback(c),c==h.MEDIA_STOPPED&&d.successCallback&&d.successCallback();break;case h.MEDIA_DURATION:d._duration=c;break;case h.MEDIA_ERROR:d.errorCallback&&d.errorCallback(c);break;case h.MEDIA_POSITION:d._position=Number(c);break;default:console.error&&console.error("Unhandled Media.onStatus :: "+b)}else console.error&&console.error("Received Media.onStatus callback for unknown media :: "+a)},c.exports=h}),cordova.define("org.apache.cordova.media.MediaError",function(a,b,c){var d=window.MediaError;d||(window.MediaError=d=function(a,b){this.code="undefined"!=typeof a?a:null,this.message=b||""}),d.MEDIA_ERR_NONE_ACTIVE=d.MEDIA_ERR_NONE_ACTIVE||0,d.MEDIA_ERR_ABORTED=d.MEDIA_ERR_ABORTED||1,d.MEDIA_ERR_NETWORK=d.MEDIA_ERR_NETWORK||2,d.MEDIA_ERR_DECODE=d.MEDIA_ERR_DECODE||3,d.MEDIA_ERR_NONE_SUPPORTED=d.MEDIA_ERR_NONE_SUPPORTED||4,d.MEDIA_ERR_SRC_NOT_SUPPORTED=d.MEDIA_ERR_SRC_NOT_SUPPORTED||4,c.exports=d}),cordova.define("org.apache.cordova.media-capture.capture",function(a,b,c){function f(a,b,c,f){var g=function(a){var d,c=[];for(d=0;d<a.length;d++){var f=new e;f.name=a[d].name,f.localURL=a[d].localURL||a[d].fullPath,f.fullPath=a[d].fullPath,f.type=a[d].type,f.lastModifiedDate=a[d].lastModifiedDate,f.size=a[d].size,c.push(f)}b(c)};d(g,c,"Capture",a,[f])}function g(){this.supportedAudioModes=[],this.supportedImageModes=[],this.supportedVideoModes=[]}var d=a("cordova/exec"),e=a("./MediaFile");g.prototype.captureAudio=function(a,b,c){f("captureAudio",a,b,c)},g.prototype.captureImage=function(a,b,c){f("captureImage",a,b,c)},g.prototype.captureVideo=function(a,b,c){f("captureVideo",a,b,c)},c.exports=new g}),cordova.define("org.apache.cordova.media-capture.CaptureAudioOptions",function(a,b,c){var d=function(){this.limit=1,this.duration=0};c.exports=d}),cordova.define("org.apache.cordova.media-capture.CaptureError",function(a,b,c){var d=function(a){this.code=a||null};d.CAPTURE_INTERNAL_ERR=0,d.CAPTURE_APPLICATION_BUSY=1,d.CAPTURE_INVALID_ARGUMENT=2,d.CAPTURE_NO_MEDIA_FILES=3,d.CAPTURE_NOT_SUPPORTED=20,c.exports=d}),cordova.define("org.apache.cordova.media-capture.CaptureImageOptions",function(a,b,c){var d=function(){this.limit=1};c.exports=d}),cordova.define("org.apache.cordova.media-capture.CaptureVideoOptions",function(a,b,c){var d=function(){this.limit=1,this.duration=0};c.exports=d}),cordova.define("org.apache.cordova.media-capture.MediaFile",function(a,b,c){var d=a("cordova/utils"),e=a("cordova/exec"),f=a("org.apache.cordova.file.File"),g=a("./CaptureError"),h=function(){h.__super__.constructor.apply(this,arguments)};d.extend(h,f),h.prototype.getFormatData=function(a,b){"undefined"==typeof this.fullPath||null===this.fullPath?b(new g(g.CAPTURE_INVALID_ARGUMENT)):e(a,b,"Capture","getFormatData",[this.localURL,this.type])},c.exports=h}),cordova.define("org.apache.cordova.media-capture.MediaFileData",function(a,b,c){var d=function(a,b,c,d,e){this.codecs=a||null,this.bitrate=b||0,this.height=c||0,this.width=d||0,this.duration=e||0};c.exports=d}),cordova.define("org.apache.cordova.network-information.Connection",function(a,b,c){c.exports={UNKNOWN:"unknown",ETHERNET:"ethernet",WIFI:"wifi",CELL_2G:"2g",CELL_3G:"3g",CELL_4G:"4g",CELL:"cellular",NONE:"none"}}),cordova.define("org.apache.cordova.network-information.network",function(a,b,c){function h(){this.type="unknown"}var d=a("cordova/exec"),e=a("cordova"),f=a("cordova/channel"),g=a("cordova/utils");"undefined"!=typeof navigator&&g.defineGetter(navigator,"onLine",function(){return"none"!=this.connection.type}),h.prototype.getInfo=function(a,b){d(a,b,"NetworkStatus","getConnectionInfo",[])};var i=new h,j=null,k=500;f.createSticky("onCordovaConnectionReady"),f.waitForInitialization("onCordovaConnectionReady"),f.onCordovaReady.subscribe(function(){i.getInfo(function(a){i.type=a,"none"===a?j=setTimeout(function(){e.fireDocumentEvent("offline"),j=null},k):(null!==j&&(clearTimeout(j),j=null),e.fireDocumentEvent("online")),2!==f.onCordovaConnectionReady.state&&f.onCordovaConnectionReady.fire()},function(a){2!==f.onCordovaConnectionReady.state&&f.onCordovaConnectionReady.fire(),console.log("Error initializing Network Connection: "+a)})}),c.exports=i}),cordova.define("org.apache.cordova.splashscreen.SplashScreen",function(a,b,c){var d=a("cordova/exec"),e={show:function(){d(null,null,"SplashScreen","show",[])},hide:function(){d(null,null,"SplashScreen","hide",[])}};c.exports=e}),cordova.define("org.apache.cordova.vibration.notification",function(a,b,c){var d=a("cordova/exec");c.exports={vibrate:function(a){if("number"==typeof a&&0!=a)d(null,null,"Vibration","vibrate",[a]);else if("object"==typeof a&&1==a.length)0==a[0]?d(null,null,"Vibration","cancelVibration",[]):d(null,null,"Vibration","vibrate",[a[0]]);else if("object"==typeof a&&a.length>1){var b=-1;d(null,null,"Vibration","vibrateWithPattern",[a,b])}else d(null,null,"Vibration","cancelVibration",[])},vibrateWithPattern:function(a,b){b="undefined"!=typeof b?b:-1,a.unshift(0),d(null,null,"Vibration","vibrateWithPattern",[a,b])},cancelVibration:function(){d(null,null,"Vibration","cancelVibration",[])}}}),cordova.define("org.apache.cordova.geolocation.Coordinates",function(a,b,c){var d=function(a,b,c,d,e,f,g){this.latitude=a,this.longitude=b,this.accuracy=d,this.altitude=void 0!==c?c:null,this.heading=void 0!==e?e:null,this.speed=void 0!==f?f:null,(0===this.speed||null===this.speed)&&(this.heading=0/0),this.altitudeAccuracy=void 0!==g?g:null};c.exports=d}),cordova.define("org.apache.cordova.geolocation.geolocation",function(a,b,c){function j(a){var b={maximumAge:0,enableHighAccuracy:!1,timeout:1/0};return a&&(void 0!==a.maximumAge&&!isNaN(a.maximumAge)&&a.maximumAge>0&&(b.maximumAge=a.maximumAge),void 0!==a.enableHighAccuracy&&(b.enableHighAccuracy=a.enableHighAccuracy),void 0===a.timeout||isNaN(a.timeout)||(b.timeout=a.timeout<0?0:a.timeout)),b}function k(a,b){var c=setTimeout(function(){clearTimeout(c),c=null,a({code:g.TIMEOUT,message:"Position retrieval timed out."})},b);return c}var d=a("cordova/argscheck"),e=a("cordova/utils"),f=a("cordova/exec"),g=a("./PositionError"),h=a("./Position"),i={},l={lastPosition:null,getCurrentPosition:function(a,b,c){d.checkArgs("fFO","geolocation.getCurrentPosition",arguments),c=j(c);var e={timer:null},i=function(b){if(clearTimeout(e.timer),e.timer){var c=new h({latitude:b.latitude,longitude:b.longitude,altitude:b.altitude,accuracy:b.accuracy,heading:b.heading,velocity:b.velocity,altitudeAccuracy:b.altitudeAccuracy},void 0===b.timestamp?new Date:b.timestamp instanceof Date?b.timestamp:new Date(b.timestamp));l.lastPosition=c,a(c)}},m=function(a){clearTimeout(e.timer),e.timer=null;var c=new g(a.code,a.message);b&&b(c)};return l.lastPosition&&c.maximumAge&&(new Date).getTime()-l.lastPosition.timestamp.getTime()<=c.maximumAge?a(l.lastPosition):0===c.timeout?m({code:g.TIMEOUT,message:"timeout value in PositionOptions set to 0 and no cached Position object available, or cached Position object's age exceeds provided PositionOptions' maximumAge parameter."}):(e.timer=1/0!==c.timeout?k(m,c.timeout):!0,f(i,m,"Geolocation","getLocation",[c.enableHighAccuracy,c.maximumAge])),e},watchPosition:function(a,b,c){d.checkArgs("fFO","geolocation.getCurrentPosition",arguments),c=j(c);var m=e.createUUID();i[m]=l.getCurrentPosition(a,b,c);var n=function(a){clearTimeout(i[m].timer);var c=new g(a.code,a.message);b&&b(c)},o=function(b){clearTimeout(i[m].timer),1/0!==c.timeout&&(i[m].timer=k(n,c.timeout));var d=new h({latitude:b.latitude,longitude:b.longitude,altitude:b.altitude,accuracy:b.accuracy,heading:b.heading,velocity:b.velocity,altitudeAccuracy:b.altitudeAccuracy},void 0===b.timestamp?new Date:b.timestamp instanceof Date?b.timestamp:new Date(b.timestamp));l.lastPosition=d,a(d)};return f(o,n,"Geolocation","addWatch",[m,c.enableHighAccuracy]),m},clearWatch:function(a){a&&void 0!==i[a]&&(clearTimeout(i[a].timer),i[a].timer=!1,f(null,null,"Geolocation","clearWatch",[a]))}};c.exports=l}),cordova.define("org.apache.cordova.geolocation.Position",function(a,b,c){var d=a("./Coordinates"),e=function(a,b){this.coords=a?new d(a.latitude,a.longitude,a.altitude,a.accuracy,a.heading,a.velocity,a.altitudeAccuracy):new d,this.timestamp=void 0!==b?b:new Date};c.exports=e}),cordova.define("org.apache.cordova.geolocation.PositionError",function(a,b,c){var d=function(a,b){this.code=a||null,this.message=b||""};d.PERMISSION_DENIED=1,d.POSITION_UNAVAILABLE=2,d.TIMEOUT=3,c.exports=d}),cordova.define("org.apache.cordova.dialogs.notification",function(a,b,c){var d=a("cordova/exec"),e=a("cordova/platform");c.exports={alert:function(a,b,c,e){var f=c||"Alert",g=e||"OK";d(b,null,"Notification","alert",[a,f,g])},confirm:function(a,b,c,f){var g=c||"Confirm",h=f||["OK","Cancel"];if("string"==typeof h&&console.log("Notification.confirm(string, function, string, string) is deprecated.  Use Notification.confirm(string, function, string, array)."),"amazon-fireos"==e.id||"android"==e.id||"ios"==e.id||"windowsphone"==e.id||"firefoxos"==e.id||"ubuntu"==e.id||"windows8"==e.id||"windows"==e.id)"string"==typeof h&&(h=h.split(","));else if(Array.isArray(h)){var i=h;h=i.toString()}d(b,null,"Notification","confirm",[a,g,h])},prompt:function(a,b,c,e,f){var g=a||"Prompt message",h=c||"Prompt",i=e||["OK","Cancel"],j=f||"";d(b,null,"Notification","prompt",[g,h,i,j])},beep:function(a){var b=a||1;d(null,null,"Notification","beep",[b])}}}),cordova.define("org.apache.cordova.contacts.Contact-iOS",function(a,b,c){var d=a("cordova/exec"),e=a("./ContactError");c.exports={display:function(a,b){if(null===this.id){if("function"==typeof a){var c=new e(e.UNKNOWN_ERROR);a(c)}}else d(null,a,"Contacts","displayContact",[this.id,b])}}}),cordova.define("org.apache.cordova.contacts.contacts-ios",function(a,b,c){var d=a("cordova/exec");c.exports={newContactUI:function(a){d(a,null,"Contacts","newContact",[])},chooseContact:function(b,c){var e=function(c){var d=a("./contacts").create(c);b(d.id,d)};d(e,null,"Contacts","chooseContact",[c])}}}),cordova.define("org.apache.cordova.camera.CameraPopoverHandle",function(a,b,c){var d=a("cordova/exec"),e=function(){this.setPosition=function(a){var b=[a];d(null,null,"Camera","repositionPopover",b)}};c.exports=e}),cordova.define("org.apache.cordova.file.iosFileSystem",function(a,b,c){FILESYSTEM_PROTOCOL="cdvfile",c.exports={__format__:function(a){var b=("/"+this.name+("/"===a[0]?"":"/")+encodeURI(a)).replace("//","/");return FILESYSTEM_PROTOCOL+"://localhost"+b}}}),cordova.define("org.apache.cordova.console.console",function(a,b,c){function j(){}function k(a,b){return function(){var c=[].slice.call(arguments);try{a.apply(g,c)}catch(d){}try{b.apply(f,c)}catch(d){}}}var d=a("./logger");a("cordova/utils");var f=c.exports,g=window.console,h=!1,i={};f.useLogger=function(a){if(arguments.length&&(h=!!a),h&&d.useConsole())throw new Error("console and logger are too intertwingly");return h},f.log=function(){d.useConsole()||d.log.apply(d,[].slice.call(arguments))},f.error=function(){d.useConsole()||d.error.apply(d,[].slice.call(arguments))},f.warn=function(){d.useConsole()||d.warn.apply(d,[].slice.call(arguments))},f.info=function(){d.useConsole()||d.info.apply(d,[].slice.call(arguments))},f.debug=function(){d.useConsole()||d.debug.apply(d,[].slice.call(arguments))},f.assert=function(a){if(!a){var b=d.format.apply(d.format,[].slice.call(arguments,1));f.log("ASSERT: "+b)}},f.clear=function(){},f.dir=function(a){f.log("%o",a)},f.dirxml=function(a){f.log(a.innerHTML)},f.trace=j,f.group=f.log,f.groupCollapsed=f.log,f.groupEnd=j,f.time=function(a){i[a]=(new Date).valueOf()},f.timeEnd=function(a){var b=i[a];if(!b)return f.warn("unknown timer: "+a),void 0;var c=(new Date).valueOf()-b;f.log(a+": "+c+"ms")},f.timeStamp=j,f.profile=j,f.profileEnd=j,f.count=j,f.exception=f.log,f.table=function(a){f.log("%o",a)};for(var l in f)"function"==typeof g[l]&&(f[l]=k(g[l],f[l]))}),cordova.define("org.apache.cordova.console.logger",function(a,b){function q(a,b){b=[a].concat([].slice.call(b)),d.logLevel.apply(d,b)}function r(a){return"string"==typeof a?"":"%o"}function s(a,b){if(null===a||void 0===a)return[""];if(1==arguments.length)return[a.toString()];"string"!=typeof a&&(a=a.toString());for(var c=/(.*?)%(.)(.*)/,d=a,e=[];b.length;){var f=c.exec(d);if(!f)break;var g=b.shift();d=f[3],e.push(f[1]),"%"!=f[2]?e.push(t(g,f[2])):(e.push("%"),b.unshift(g))}e.push(d);var h=[].slice.call(b);return h.unshift(e.join("")),h}function t(a,b){try{switch(b){case"j":case"o":return JSON.stringify(a);case"c":return""}}catch(c){return"error JSON.stringify()ing argument: "+c}return null===a||void 0===a?Object.prototype.toString.call(a):a.toString()}var d=b,e=a("cordova/exec");a("cordova/utils");for(var k,g=!1,h=!0,i=[],j=!1,l=console,m=["LOG","ERROR","WARN","INFO","DEBUG"],n={},o=0;o<m.length;o++){var p=m[o];n[p]=o,d[p]=p}k=n.WARN,d.level=function(a){if(arguments.length){if(null===n[a])throw new Error("invalid logging level: "+a);k=n[a]}return m[k]},d.useConsole=function(a){if(arguments.length&&(g=!!a),g){if("undefined"==typeof console)throw new Error("global console object is not defined");if("function"!=typeof console.log)throw new Error("global console object does not have a log function");if("function"==typeof console.useLogger&&console.useLogger())throw new Error("console and logger are too intertwingly")}return g},d.useLogger=function(a){return arguments.length&&(h=!!a),h},d.log=function(){q("LOG",arguments)},d.error=function(){q("ERROR",arguments)},d.warn=function(){q("WARN",arguments)},d.info=function(){q("INFO",arguments)},d.debug=function(){q("DEBUG",arguments)},d.logLevel=function(a){var b=[].slice.call(arguments,1),c=r(b[0]);c.length>0&&b.unshift(c);var f=d.format.apply(d.format,b);if(null===n[a])throw new Error("invalid logging level: "+a);if(!(n[a]>k)){if(!j&&!g)return i.push([a,f]),void 0;if(h&&e(null,null,"Console","logLevel",[a,f]),g){if(console.useLogger())throw new Error("console and logger are too intertwingly");switch(a){case d.LOG:l.log(f);break;case d.ERROR:l.log("ERROR: "+f);break;case d.WARN:l.log("WARN: "+f);break;case d.INFO:l.log("INFO: "+f);break;case d.DEBUG:l.log("DEBUG: "+f)}}}},d.format=function(){return s(arguments[0],[].slice.call(arguments,1)).join(" ")},d.__onDeviceReady=function(){if(!j){j=!0;for(var a=0;a<i.length;a++){var b=i[a];d.logLevel(b[0],b[1])}i=null}},document.addEventListener("deviceready",d.__onDeviceReady,!1)}),cordova.define("org.apache.cordova.file.FileSystem",function(a,b,c){var d=a("./DirectoryEntry"),e=function(a,b){this.name=a,this.root=b?new d(b.name,b.fullPath,this,b.nativeURL):new d(this.name,"/",this)};e.prototype.__format__=function(a){return a},e.prototype.toJSON=function(){return"<FileSystem: "+this.name+">"},c.exports=e});

// MDI-specific api's
var MdiNativeShell = {
    
    getDeviceUdid: function(callback){
        
        return Cordova.exec(callback, null, "MdiNativeShell", "getDeviceUdid", []);
    },
    
    setState: function(newState){
    
        return Cordova.exec(null, null, "MdiNativeShell", "setState", [newState]);
    },

    scanBarcode: function(callback){
        
        return Cordova.exec(callback, null, "MdiNativeShell", "scanBarcode", []);
    },
    
    sendKochavaEvent: function(callback) {
        return Cordova.exec(null, null, "MdiNativeShell", "sendKochavaEvent", [callback]);
    },

    getMobileGatewayInfo: function(successCallback, errorCallback){
        
        return Cordova.exec(successCallback, errorCallback, "MdiNativeShell", "getMobileGatewayInfo", []);
    },

    isNativeShell: function(){
        
        if (navigator.userAgent.match(/(Mdi Native Shell)/)) {
            return true;
        } else {
            return false; //this is the browser
        }
    },

    // ibeacons
    isMonitoringForIbeacon: function(successCallback, errorCallback, identifier, uuid, major, minor)
    {
        return Cordova.exec(successCallback, errorCallback, "MdiNativeShell", "isMonitoringForIbeacon", [identifier, uuid, major, minor]);
    },

    canMonitorForIbeacons: function(successCallback, errorCallback)
    {
        return Cordova.exec(successCallback, errorCallback, "MdiNativeShell", "canMonitorForIbeacons", []);
    },

    startMonitoringForIbeacons: function(successCallback, errorCallback, identifier, uuid, major, minor)
    {
        return Cordova.exec(successCallback, errorCallback, "MdiNativeShell", "startMonitoringForIbeacons", [identifier, uuid, major, minor]);
    },

    stopMonitoringForIbeacons: function(successCallback, errorCallback, identifier, uuid, major, minor)
    {
        return Cordova.exec(successCallback, errorCallback, "MdiNativeShell", "stopMonitoringForIbeacons", [identifier, uuid, major, minor]);
    },

    startRangingForIbeacons: function(successCallback, errorCallback, identifier, uuid, major, minor)
    {
        return Cordova.exec(successCallback, errorCallback, "MdiNativeShell", "startRangingForIbeacons", [identifier, uuid, major, minor]);
    },

    stopRangingForIbeacons: function(successCallback, errorCallback, identifier, uuid, major, minor)
    {
        return Cordova.exec(successCallback, errorCallback, "MdiNativeShell", "stopRangingForIbeacons", [identifier, uuid, major, minor]);
    }
};


// init and such...
//document.ready(function(){
                  
    console.log("MDI_NativeBridge doc ready");
                  
    // if running in native app, attempt to wait for cordova to let us know it is ready
    if (MdiNativeShell.isNativeShell()){

        document.addEventListener("deviceready", onDeviceReady, false);
    }
//});

/* When this function is called, MDI Native App / Cordova has been initialized and is ready to roll */
var mdiNotifiedPage = false;
function onDeviceReady()
{
    
    if (mdiNotifiedPage) return;
    mdiNotifiedPage = true;
    
    if (typeof(mdiNativeBridgeReady) == "function"){
        mdiNativeBridgeReady();
    }
    
}
