// A simple lib inspired by Vue & React.
//
// A quick start example:
//
//  <div d-state="{ count: 0, displayed: true }">
//    <!-- the <p> below initially shows 0 which is the value of the count var we set in d-state -->
//    <p d-text="count"></p>
//    <div d-show="displayed">This div will show/hide while clicking on the link below.</div>
//    <a href="javascript:void(0)" d-click="{ count: count + 1, displayed: !displayed }">Clicking on this link increases the count, and toggles the div display.</a>
//  </div>
//
// How it works:
//   In the above example, d_render created a component instance and attached it to the div with 'd-state' attribute.
//   And then the component compiled the directive (such as d-text, d-show) in div and it's descendants (descendants in children components are excluded) to hooks.
//   After that the component knew how to update the DOM accordingly while the state changes.
//   Whenever a DOM element with 'd-state' or 'd-component' added or removed from DOM tree, the conresponding component will be added or removed automatically..
//
// Component is a state machine with a set of hooks.
//   State:
//     Similar with React state, a object that can contain nested arbitrary objects, use for determining the UI display.
//     Always use Component#setState to update the state. Each setState triggers a Component#render to update the UI.
//
//   Hooks in component:
//     An array of hook object. Each hook object contains a function which would be run while calling setState or render.
//     There are two kinds of hooks: stateHooks and renderHooks
//
//     stateHooks: invoked in Component#setState, used for doing something before calling render.
//     renderHooks: invoked in Component#render, used for updating the UI.
//
//   parent/children:
//     Often the UI is constructed with multiple components.
//     In order to easily access other components, d_render provides two shortcuts Component#parent and Component#children to access conresponding components.
//     Note that both shortcuts always search the DOM tree to find the DOM elements and the attached components, which make life easier on DOM elements adding/moving/removing.
//     If you concern about the performance, try caching for specific component. read Component#AfterInitialized for more details.
//
// Directive is a set of HTML custom attributes whose value compiled to function. Most of those functions will be stored as hooks in Component.
//
//   Directive Value:
//     The value of directive must be one line or multiple lines (separated by ;) of JS code, which can be compiled to JS function.
//     The `this` ref in the JS function is pointing to the current component.
//     In the JS function, you can directly use refs inside Component, Component#state and Component#context without adding prefixes.
//     e.g: given state = { count: 0 }, You can directly use "count" rather than "state.count" in the JS function.
//
//
//   List of Directives:
//     Specific Directives:
//       d-state:
//         declare the initial state of component.
//         e.g: <div d-state="{ count: 0 }"> means the component has initial state { count: 0 }
//       d-component:
//         declare custom component class for component initializing.
//         To use custom component, You first need to register the component to d_render via DRender.registerComponents
//         e.g: <div d-component="Row"> means use Row to initialize the component for this div
//
//     Event Directives:
//       The directive value will be compiled to a JS function, and then registered to event listeners via `jQuery.on`.
//       In the JS function, you can use reference "event" to get the event object.
//
//       JS function shotcut for setState:
//         If the directive value starts with "{", then the Component#setState will be invoked, and the return value of the JS function will be used as the arguments.
//         e.g: the directive d-click: "{ count: 1 }" will be compiled to "this.setState({ count: 1})"
//
//         You can also specify the second argument `transition` of setState in the directive.
//         Transition is a temporary flag to info render to do something only once when state changes from particular value to another.
//         e.g: d-click: "{count: 1}, { startEditing: true }" is equal to setState({ count: 1}, { startCounting: true })
//
//       Prefixes:
//         Just like Vue, you can specify prefixes to the directive value to quickly done something.
//         Currently the prefixes are '.prevent', '.stop', '.debounce'.
//         To add more prefixes, see docs on Constant Prefixes and Function generatePrefixFunc below.
//
//       Currently we have these directives:
//         d-keyup, d-keypress, d-change, d-input, d-click, d-submit, d-focus, d-blur,
//
//       To add more HTML standard or custom events, see docs on Constant Hooks and Function generateEventFunc below.
//
//     DOM Manipulation Directive:
//       These directives manipulate DOM base on the result of the JS function.
//       In the JS function, you can use reference "$node" to get the current element, and reference `transition` to get the render transition.
//
//       d-show: Toggle class 'hidden' based on the result
//       d-debounce-show: If the result is true, debounce add the 'hidden' class, otherwise remove the 'hidden' class immediately.
//       d-class: The result must be either a hash or a string. If it's a hash, set the keys as classes based on the values (true or false), otherwise the string are appended to classes.
//       d-debounce-class: Same as the d-debounce-show but for the classes. The result must be a hash.
//       d-style: The result must be a hash. key is the style name, value is the style value.
//       d-disabled: set disabled attribute based on the result.
//       d-readonly: set readonly attribute based on the result.
//       d-text: replace element innertext with result.
//       d-html: replace element innerHTML with result.
//       d-prop: set the element properties based on the returned result hash
//
//       To add more directives, see docs on Constant Hooks and Function generateDirectiveFunc
//
//     Misc Directive:
//       d-model: Same as the Vue v-model, creates two ways binding.
//       d-loop:
//         Similar to the Vue v-for.
//         The result must be an iterable, either be an array or an object.
//         e.g:
//           <div d-loop="{a: 1,b: 2, c: 3]" d-loop-var='item'>
//             <div d-key='itemKey'>
//               <p d-text='item' />
//               <p d-text='itemIndex' />
//             </div>
//           </div>
//       d-on-state-change:
//         Run JS function on state changing.
//         In the JS function you can access ref "prevState" to get the old state.
//         e.g: 'd-on-state-change': 'prevState.editing == false && editing == true ? alert('startEditing!') : nil'
//       d-on-render:
//         Run JS function on rendering
//         In the JS function you can access ref "transition" to get the render transition. check the setState and render function for more info.
//         e.g: 'd-on-render': 'transition.startEditing && this.refs.input.select()'
//       d-after-initialized:
//         Run only onnce after the component is initialized.

import $ from 'jquery';
const Classes = {}
const registerComponents = (...components) => {
  components.forEach(component => Classes[component.name] = component)
  DRender.observer && run() // run again only if we've run it before
}

let debug = {
  logAllFuncStr: false,
  keepDirectives: false,
  logCompiledFuncExecutionError: true,
}

const addReturnToScriptStr = (str) => {
  let arr = str.split(';')
  let last = arr[arr.length - 1]
  arr[arr.length - 1] = `return ${last}`
  return arr.join(";\n")
}

let unsafeEvalSupported = (() => {
  let unsafeEval = true
  try
  {
    const func = new Function('param1', 'param2', 'param3', 'return param1[param2] === param3;');
    unsafeEval = func({ a: 'b' }, 'a', 'b') === true;
  }
  catch (e)
  {
    unsafeEval = false;
  }
  return unsafeEval
})()

const fallbackCompileToFunc = (codeStr) => {
  var result;

  // Define callback
  window.evalCallback = (r) => result = r

  var newScript = document.createElement("script");
  var nonce = document.querySelector("meta[name=csp-nonce]").content
  newScript.setAttribute('nonce', nonce);
  newScript.innerHTML = "evalCallback(" + codeStr + ");";
  document.body.appendChild(newScript);

  // Now clean up DOM and global scope
  document.body.removeChild(newScript);
  delete window.evalCallback;
  return result;
};

// Compile string to function
// the last arguments is the string, rest of them would be arguments of the compiled function
const compileToFunc = (...args) => {
  let options = typeof args[args.length - 1] == 'object' ? args.pop() : {}
  let { addReturn = false } = options

  if (addReturn) {
    args[args.length - 1] = addReturnToScriptStr(args[args.length - 1])
  }

  if (debug.logCompiledFuncExecutionError) {
    let str = args[args.length - 1]
    let logStr = str.replaceAll('"', `\\\"`).replaceAll("\n", "\\n")
    str = `
      try {
        ${str}
      } catch (e) {
        console.log("Error occurred when executing compiled function:")
        console.log("${logStr}")
        throw e
      }
    `
    args[args.length - 1] = str
  }

  try {
    if (unsafeEvalSupported) {
      debug.logAllFuncStr && console.log("Compile string to function via 'new Function()':\n", `new Function(${args.map(e => `"${e}"`).join(", ")})`)
      return (new Function(...args))
    } else {
      let body = args.pop()
      let str = `function(${args.join(", ")}) { ${body} }`
      debug.logAllFuncStr && console.log("Compile string to function via <script>:\n", str)
      return fallbackCompileToFunc(str)
    }
  } catch (e) {
    console.log("Error occurred when compiling function from string:")
    console.log(args[args.length - 1])
    throw e
  }
}

const getDescriptor = (obj, method) => {
  let prototype = Object.getPrototypeOf(obj)
  let descriptor = undefined

  while(true) {
    descriptor = Object.getOwnPropertyDescriptor(prototype, method)

    if (descriptor != undefined || prototype == Object.prototype) {
      break
    } else {
      prototype = Object.getPrototypeOf(prototype)
    }
  }
  return descriptor
}

// Compile str with the `with` syntax to function and bind to the component.
// If the last of args is a function, it will be invoked to transform the str before compiling.
// Convention:
//  If the str is a method name of component, the matching method of component would be returned regardless of other args.
const compileWithComponent = (str, component, ...args) => {
  let func
  let descriptor = getDescriptor(component, str)

  if (descriptor && !descriptor.get && typeof component[str] == 'function') {
    func = component[str].bind(component)
  } else {
    let transformStrFunc = args[args.length - 1]
    if (typeof transformStrFunc == 'function') {
      args.pop()
      str = transformStrFunc(str)
    } else {
      str = addReturnToScriptStr(str)
    }
    str = `
        with(this) {
          with(context) {
            with (state) {
              ${str}
            }
          }
        }
      `
    func = compileToFunc(...args, str).bind(component)
  }
  return func
}

//Split and Collect Prefixes from the str
//e.g:
//  given the string below
//    ".prevent.stop { updating: true }
//returns ["{ updating: true }", [".prevent", ".stop"]]
const collectPrefixes = (str) => {
  let prefixes = str.match(/^\.[^\s]+\s/)
  if (prefixes) {
    prefixes = prefixes[0].substring(1).split('.').map(prefix => `.${prefix}`.trim() )
    str = str.replace(/^\.[^\s]+\s/, '')
  }
  return [str, prefixes]
}

// This function returns a function that stored in Hooks and invoked in Component#registerHooks()
// When the returned function gets invoked:
//  It compiles the directive value to a handler function. And then registers the handler to event listener.
//  Convention:
//    If the directive value starts with "{", transform to "this.setState(${originalStr})" before compiling.
//    If preDefinedStr is present, use it to compile the handle function.
const generateEventFunc = (identifier, event, preDefinedStr = null) => {
  return (component, $node) => {
    let originalStr = preDefinedStr ? preDefinedStr.trim() : $node.attr(identifier).trim()
    let [str, prefixes] = collectPrefixes(originalStr)

    let handler = compileWithComponent(str, component, 'event', (str) => str[0] == '{' ? `this.setState(${str})` : str)
    prefixes && prefixes.forEach((prefix) => {
      handler = Prefixes[prefix] ? Prefixes[prefix](handler, component, $node, prefixes) : handler
    })

    $node.on(`${event}.d-component`, handler)
    !debug.keepDirectives && $node.removeAttr(identifier)
  }
}

// This function returns a function that invoked in generateDirectiveFunc
// Similar with Redux#compose, When the returned function gets invoked:
//  It returns another function with handler function as argument to be able to chaining.
const generatePrefixFunc = (func) => {
  return (handler, component, $node, prefixes) => {
    return (event) => {
      func(handler, event, component, $node, prefixes)
    }
  }
}

// This function returns a function that stored in Hooks
// When the returned function gets invoked:
//  It compiles the directive value to a result function.
//  It pushes a hook object with the callback function to Component#renderHooks
//  When the hook gets invoked, the callback function updates DOM accordingly based on the return value of the result function.
const generateDirectiveFunc = (identifier, prop, callbackFunc) => {
  return (component, $node) => {
    let originalProp = prop ? $node.attr(prop) : null
    let str = $node.attr(identifier).trim()
    let resultFunc = compileWithComponent(str, component, '$node', 'transition')

    !debug.keepDirectives && $node.removeAttr(identifier)
    component.renderHooks.push({
      identifier,
      value: str,
      $node,
      hook: (transition) => callbackFunc($node, resultFunc($node, transition), component, originalProp)
    })
  }
}

// Prefixes: a constant object to hold the prefix functions. Form: { [prefix string]: prefix function }.
// The prefix function gets executed when the prefix string matched in generateEventFunc.
//  It takes four arguments: handler, component, $node, prefixes, and returns a function which gets invoked in the event listener.
//  handler: the chaining handler function, called to run other handlers.
//
// e.g: register a 'esc' prefix to handle esc pressing.
//   Prefixes['.esc'] = (handler, component, $node, prefixes) => {
//     return (event) => {
//       if (event.type == 'keyup' && event.key == 'esc') {
//          event.preventDefault()
//          // do something special for esc pressing, like compiling the directive value to function and run it
//       } else {
//         handler() //not pressing esc, do nothing and pass to the next handler.
//       }
//     }
//   }
const Prefixes = {
  '.prevent': generatePrefixFunc((handler, event, _component, _$node, _prefixes) => {
    event.preventDefault()
    handler(event)
  }),
  '.stop': generatePrefixFunc((handler, event, _component, _$node, _prefixes) => {
    event.stopPropagation()
    handler(event)
  }),
  '.debounce': generatePrefixFunc((handler, event, _component, $node, _prefixes) => {
    let time = $node.attr('d-debounce-duration') || 400
    let timer = $node.data(`drender-${event.type}-debounce`)
    timer && clearTimeout(timer);
    timer = setTimeout(() => handler(event), time);
    $node.data(`drender-${event.type}-debounce`, timer)
  }),
}

// Hooks: a constant object to hold the hook functions. Form: { [directive string]: hook function }.
//  The hook function gets executed in Component#registerHooks.
//  Each of them registers a hook object either to the renderHooks which invoked in Component#render,
//  or to the stateHooks which invoked in Component#setState
//  The hook function takes two arguments: component, $node.
//
//  e.g: add a d-debug directive to log the state
//    Hooks['d-debug'] = (component, $node) => {
//    component.stateHooks.push({
//      identifier: 'd-log',
//      value: null,
//      $node,
//      hook: () => console.log(component.state)
//    })
//  }
const Hooks = {
  'd-model': (component, $node) => {
    let key = $node.attr('d-model')
    let a = generateEventFunc('d-model', 'input', `{ ${key}: event.target.value }`)
    a(component, $node)
    component.renderHooks.push({
      identifier: 'd-model',
      value: key,
      $node,
      hook: () => $node.val(component.state[key])
    })
  },
  'd-loop': (component, $node) => {
    if ($node.children().length != 1) {
      throw new Error("Must only have one root element inside the d-loop.")
    }

    let keyStr = $node.children().eq(0).attr('d-key'),
      loopStr = $node.attr('d-loop'),
      varStr = $node.attr('d-loop-var') || 'loopItem',
      loopItemKey = `${varStr}Key`, loopItem = varStr, loopItemIndex = `${varStr}Index`

    !$node.children().eq(0).attr('d-component') && $node.children().eq(0).attr('d-component', '')

    if (keyStr == undefined) {
      throw new Error("The root element inside d-loop must have d-key directive")
    }

    const loopFunc = compileWithComponent(loopStr, component)
    const keyFunc = compileWithComponent(keyStr, component, loopItemKey, loopItem, loopItemIndex)

    const iterate = (items, func) => {
      if (items.constructor == Array) {
        items.forEach((value, index) => func({ [loopItemKey]: null, [loopItem]: value, [loopItemIndex]: index }))
      } else {
        Object.entries(items).forEach(([key, value], index) => func({ [loopItemKey]: key, [loopItem]: value, [loopItemIndex]: index }))
      }
    }

    let originalHTML = $node.html()
    $node.empty()

    const append = (childComponentKey, context) => {
      let $childNode = $(originalHTML)
      $childNode.data('d-component-context', { ...context, _loopComponentKey: childComponentKey })
      $childNode.appendTo($node)
      return createComponent($childNode, { context: { ...context, _loopComponentKey: childComponentKey }})
    }

    iterate(loopFunc(component), (context) => {
      let childComponentKey = keyFunc(...Object.values(context))
      append(childComponentKey, context)
    })

    if (!debug.keepDirectives) {
      $node.removeAttr('d-loop d-loop-var')
      $node.children().removeAttr('d-key')
    }

    const loopHook = () => {
      let results = loopFunc(component)
      let updated = {}

      let children = $node.children('[d-component]').toArray().reduce((map, child) => {
        let component = $(child).dComponent()
        map[component.context._loopComponentKey] = component
        return map
      }, {})

      iterate(results, (context) => {
        let childComponentKey = keyFunc(...Object.values(context))
        let childComponent = children[childComponentKey]

        if (childComponent) {
          childComponent.context = $.extend({}, childComponent.context, context)
        } else {
          childComponent = append(childComponentKey, context)
        }
        childComponent.$element.appendTo($node)
        updated[childComponentKey] = true
      })

      Object.entries(children).forEach(([k, childComponent]) => {
        (updated[k] == undefined) && childComponent.$element.remove()
      })
    }

    component.stateHooks.push({
      identifier: 'd-loop',
      value: loopStr,
      $node,
      hook: loopHook
    })
  },
  'd-keyup': generateEventFunc('d-keyup', 'keyup'),
  'd-keypress': generateEventFunc('d-keypress', 'keypress'),
  'd-change': generateEventFunc('d-change', 'change'),
  'd-input': generateEventFunc('d-input', 'input'),
  'd-click': generateEventFunc('d-click', 'click'),
  'd-submit': generateEventFunc('d-submit', 'submit'),
  'd-focus': generateEventFunc('d-focus', 'focus'),
  'd-blur': generateEventFunc('d-blur', 'blur'),
  'd-show': generateDirectiveFunc('d-show', null, ($node, result, _component) => {
    $node.toggleClass('hidden', !(!!result))
  }),
  'd-debounce-show': generateDirectiveFunc('d-debounce-show', null, ($node, result, _component) => {
    let timer = $node.data(`drender-debounce-show`)
    if (!!result == true) {
      let time = $node.attr('d-debounce-duration') || 400
      timer && clearTimeout(timer);
      timer = setTimeout(() => $node.toggleClass('hidden', !(!!result)), time);
      $node.data(`drender-debounce-show`, timer)
    } else {
      $node.toggleClass('hidden', !(!!result))
      timer && clearTimeout(timer);
    }
  }),
  'd-class': generateDirectiveFunc('d-class', 'class', ($node, result, _component, originalClassName) => {
    if (typeof result == 'object') {
      Object.entries(result).forEach(([name, state]) => $node.toggleClass(name, state))
    } else {
      $node.prop('class', `${originalClassName || ''} ${result}`)
    }
  }),
  'd-debounce-class': generateDirectiveFunc('d-debounce-class', null, ($node, result, _component) => {
    let timerHash = $node.data(`drender-debounce-class`) || {}
    Object.entries(result).forEach(([name, state]) => {
      let timer = timerHash[name]
      if (state) {
        let time = $node.attr('d-debounce-duration') || 400
        timer && clearTimeout(timer);
        timer = setTimeout(() => { $node.addClass(name) }, time)
        timerHash[name] = timer
      } else {
        $node.removeClass(name)
        timer && clearTimeout(timer);
      }
    })
    $node.data(`drender-debounce-class`, timerHash)
  }),
  'd-style': generateDirectiveFunc('d-style', null, ($node, result, _component) => {
    Object.entries(result).forEach(([name, state]) => $node.css(name, state))
  }),
  'd-disabled': generateDirectiveFunc('d-disabled', null, ($node, result, _component) => {
    $node.prop('disabled', !!result)
  }),
  'd-readonly': generateDirectiveFunc('d-readonly', 'readonly', ($node, result, _component, _originalProp) => {
    $node.prop('readonly', !!result)
  }),
  'd-text': generateDirectiveFunc('d-text', null, ($node, result, _component, _originalProp) => {
    $node.is('input') ? $node.val(result) : $node.text(result)
  }),
  'd-html': generateDirectiveFunc('d-html', null, ($node, result, _component, _originalProp) => {
    $node.is('input') ? $node.val(result) : $node.html(result)
  }),
  'd-prop': generateDirectiveFunc('d-prop', null, ($node, result, _component, _originalProp) => {
    Object.entries(result).forEach(([name, state]) => $node.prop(name, state))
  }),
  'd-on-state-change': (component, $node) => {
    let str = $node.attr('d-on-state-change')
    let func = compileWithComponent(str, component, '$node', 'prevState')
    component.stateHooks.push({
      identifier: 'd-on-state-change',
      value: str,
      $node,
      hook: (prevState) => func($node, prevState)
    })
    !debug.keepDirectives && $node.removeAttr('d-on-state-change')
  },
  'd-on-render': (component, $node) => {
    let str = $node.attr('d-on-render')
    let func = compileWithComponent(str, component, '$node', 'transition')
    component.renderHooks.push({
      identifier: 'd-on-render',
      value: str,
      $node,
      hook: (transition) => func($node, transition)
    })
    !debug.keepDirectives && $node.removeAttr('d-on-render')
  },
}

// Create a component isntance and attach it to the element with key 'd-component'
// The argument `context` would be stored in element data 'd-component-context', and be used for directive functions
const createComponent = ($node, { context = {}, ignoreIfClassNotFound = false } = {}) => {
  if ($node.dComponent() != undefined) return $node.dComponent()

  $node.data('d-component-context', context)

  let className = $node.attr('d-component')

  // Return if the specified class is not registered to DRender yet
  // We will back to it later while the component class is registered to DRender
  // The component must be a top level component.
  if (ignoreIfClassNotFound && typeof className !== 'undefined' && Classes[className] == undefined) {
    return null
  }

  let _class = (Classes[className] || Component),
    component = new _class($node)
  $node.data('d-component', component)

  let children = component.findChildrenElements()
  children.map(child => createComponent($(child), { context }))

  component.afterInitialized()

  if (!debug.keepDirectives) {
    $node.attr('d-state') && $node.attr('d-state', '')
    $node.attr('d-component') && $node.attr('d-component', '')
  }

  return component
}

// Initialize components in view, and start the mutation observer to initialize new coming components
const run = () => {
  if (!DRender.observer) {
    DRender.observer = new MutationObserver((mutationsList, _observer) => {
      for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          //mutation.addedNodes.forEach(node => node.nodeType == node.ELEMENT_NODE && console.log('added Node', node))
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === node.ELEMENT_NODE) {
              if (node.hasAttribute('d-component') || node.hasAttribute('d-state')) {
                createComponent($(node)).render()
                $(node).trigger('d-component-initialized-from-mutation')
              } else {
                if (node.querySelectorAll('[d-component], [d-state]').length > 0) {
                  let descendant = $(node).find('[d-state] [d-component], [d-state] [d-state], [d-component] [d-state], [d-component] [d-state]').toArray()
                  let top = $(node).find('[d-state], [d-component]').toArray().filter(ele => !descendant.includes(ele))
                  top.forEach((node) => createComponent($(node)).render())
                  top.forEach((node) => $(node).trigger('d-component-initialized-from-mutation'))
                }
              }
            }
          })
        }
      }
    });
    DRender.observer.observe(document, { childList: true, subtree: true })
  }

  let descendant = $('[d-state] [d-component], [d-state] [d-state], [d-component] [d-state], [d-component] [d-state]').toArray()
  let top = $('[d-state], [d-component]').toArray().filter(ele => !descendant.includes(ele))
  top.forEach((node) => {
    let component = createComponent($(node), { ignoreIfClassNotFound: true })
    component && component.render()
  })
}

class Component {
  constructor($element) {
    this.$element = $element
    this.renderHooks = []
    this.stateHooks = []
    this.refs = {}

    let state = {}, str = $element.attr('d-state')
    // use return directly in case the values of state hash has ; inside
    if (str) {
      str = `
        with(this) {
          with(context) {
            return ${str}
          }
        }
      `
      state = compileToFunc('context = {}', str).bind(this)(this.context)
    }
    this.state = $.extend(true, {}, state)
    this.initialState = $.extend(true, {}, this.state)

    this.registerHooks()
    this.registerRefs()
  }

  // A lifecycle hook to run d-after-initialized directive.
  // also it's for something after component initialized like caching the parent/children
  // e.g: cache the parent and children after initializing, so that each time calling parent/children won't do the search on the DOM tree.
  // this.parent = this.parent
  // this.children = this.children
  afterInitialized() {
    let hook = 'd-after-initialized'
    const func = (node) => {
      let $node = $(node)
      let str = $node.attr(hook).trim()
      let resultFunc = compileWithComponent(str, this, '$node')
      resultFunc($node)
    }
    this.findTopLevel(`[${hook}]`).forEach(func)
    this.$element.attr(hook) && func(this.$element)
  }

  // The key of context object could be direclty used in html directive.
  // e.g:
  //  given context: { outsideComponentData: 1 }
  //  in html directive, 'd-show': '{ data: outsideComponentData + 1 }'
  //
  // Note that
  // If you want modify the data('d-component-context'), always use $.extend to clone first
  // Because it's used for d-loop internally.
  // e.g:
  //   let old = this.$element.data('d-component-context')
  //   let new = $.extend(true, {}, old, new)
  //   this.$element.data('d-component-context', new)
  get context() {
    return this.$element.data('d-component-context') || {}
  }

  set context(context) {
    return this.$element.data('d-component-context', context)
  }

  set parent(parent) {
    this._parent = parent
  }

  get parent() {
    return this._parent || this.$element.parents('[d-component], [d-state]').eq(0).dComponent()
  }

  set children(children) {
    this._children = children
  }

  get children() {
    if (this._children) {
      return [...this._children] //always return a new array in case someone modify the array using things like Array.prototype.reverse
    } else {
      return this.findChildrenElements({ includeElementInLoop: true }).map(e => $(e).dComponent())
    }
  }

  // find the most upper children that matches [d-component] or [d-state]
  findChildrenElements({ includeElementInLoop = false } = {}) {
    let descendant = null
    if (includeElementInLoop) {
      descendant = this.$element.find('[d-state] [d-component], [d-state] [d-state], [d-component] [d-state], [d-component] [d-state]').toArray()
    } else {
      descendant = this.$element.find('[d-loop] [d-state], [d-loop] [d-component], [d-state] [d-component], [d-state] [d-state], [d-component] [d-state], [d-component] [d-state]').toArray()
    }
    return this.$element.find('[d-state], [d-component]').toArray().filter((ele) => !descendant.includes(ele))
  }

  // find the most upper children that matches selector
  findTopLevel(selector) {
    let descendant
    if (selector == '[d-loop]') {
      descendant = this.$element.find(`[d-loop] ${selector}, [d-state] ${selector}, [d-state]${selector}, [d-component] ${selector}, [d-component]${selector}`).toArray()
    } else {
      descendant = this.$element.find(`[d-loop] ${selector}, [d-loop]${selector}, [d-state] ${selector}, [d-state]${selector}, [d-component] ${selector}, [d-component]${selector}`).toArray()
    }

    let elements = this.$element.find(selector).toArray().filter((ele) => !descendant.includes(ele))
    this.$element.is(selector) && elements.unshift(this.$element[0])

    return elements
  }

  // Assign d-ref to this.refs
  // e.g:
  //   directive d-ref: 'form' assign the current node to this.refs.form
  //
  //   d-ref: 'checkboxes[]' assign the current node to array this.refs.checkboxes
  registerRefs() {
    this.findTopLevel('[d-ref]').forEach((ele) => {
      let name = $(ele).attr('d-ref')

      if (name.slice(-2) == '[]') {
        name = name.slice(0, -2)
        !this.refs[name] && (this.refs[name] = [])
        this.refs[name].push($(ele))
      } else {
        this.refs[name] = $(ele)
      }

      !debug.keepDirectives && $(ele).removeAttr('d-ref')
    })
  }

  // A method meant to be overridden in sub-class to provide class specific hooks
  classSpecificHooks() {
    return {}
  }

  // Iterate Hooks to register hook to renderHooks and stateHooks
  registerHooks() {
    Object.entries(Hooks).concat(Object.entries(this.classSpecificHooks())).forEach(([hook, func]) => {
      this.findTopLevel(`[${hook}]`).forEach((ele) => {
        func(this, $(ele))
      })
    })
  }

  transistionOnStateChanging(prevState, state) {
    prevState == state
    return {}
  }

  deepMerge(obj, ...sources) {
    for (let source of sources) {
      for (let key in source) {
        let value = obj[key], newValue = source[key]
        if (value && value.constructor == Object && newValue && newValue.constructor == Object) {
          obj[key] = this.deepMerge(value, newValue)
        } else {
          obj[key] = newValue
        }
      }
    }
    return obj
  }

  setState(state = {}, transition = {}, triggerRendering = true) {
    let prevState = this.state
    let cloned = $.extend(true, {}, this.state)
    let newState = typeof state == 'function' ?  state(cloned) : this.deepMerge(cloned, state)

    this.state = newState
    this.stateHooks.forEach(obj => obj.hook(prevState))

    transition = this.deepMerge(this.transistionOnStateChanging(prevState, newState), transition)
    triggerRendering && this.render(transition)

    return $.extend(true, {}, newState)
  }

  // transition: a temporary flag to info render to do something only once when state changes from particular value to another.
  render(transition = {}) {
    this.renderHooks.forEach(obj => obj.hook(transition))
    transition.triggerChildrenRendering != false && this.children.forEach(child => child.render(transition))
  }

  get root() {
    let par = this.parent
    while (true) {
      if (par.parent) {
        par = par.parent
      } else {
        break
      }
    }
    return par
  }

  get node() {
    return this.$element[0]
  }
}

const DRender = {
  run,
  registerComponents,
  Classes,
  Component,
  Hooks,
  Prefixes,
  createComponent,
  generateEventFunc,
  generateDirectiveFunc,
  generatePrefixFunc,
  debug,
  compileToFunc,
  compileWithComponent,
}

$.fn.dComponent = function() {
  return $(this).data('d-component')
}

export default DRender
