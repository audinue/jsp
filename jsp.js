var Jsp = function () {
  var script = document.currentScript
  var cache = {}

  if (script.hasAttribute('data-index')) {
    runApp({
      index: script.getAttribute('data-index'),
      target: script.getAttribute('data-target'),
      prefix: script.getAttribute('data-prefix'),
      global: {}
    })
  }

  function escapeStringChar (char) {
    switch (char) {
      case '\\': return '\\\\'
      case '\r': return '\\r'
      case '\n': return '\\n'
      case '"' : return '\\"'
    }
  }

  function escapeString (string) {
    return string.replace(/[\\\r\n"]/g, escapeStringChar)
  }

  function unescapeStringChar ($0, char) {
    switch (char) {
      case '\\': return '\\'
      case  'r': return '\r'
      case  'n': return '\n'
      case  '"': return '"'
    }
  }

  function unescapeString (string) {
    return string.replace(/\\([\\rn"])/g, unescapeStringChar)
  }

  function toString (value) {
    return value === null || value === undefined ? '' : String(value)
  }

  function escapeHtmlChar (char) {
    switch (char) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      case "'": return '&apos;'
    }
  }

  function escapeHtml (value) {
    return toString(value).replace(/[&<>"']/g, escapeHtmlChar)
  }

  function transformTag ($0, flag, code) {
    switch (flag) {
      case '-': return '",Jsp$a(' + unescapeString(code) + '),"'
      case '=': return '",Jsp$b(' + unescapeString(code) + '),"'
      default : return '");' + unescapeString(code) + ';Jsp$d.push("'
    }
  }

  function transformTemplate (template) {
    return 'return async function(Jsp$c){var Jsp$d=[];with(Jsp$c){Jsp$d.push("'
      + escapeString(template).replace(/<\?([=_-]?)(.+?)[_-]?\?>/g, transformTag)
      + '")}return Jsp$d.join("")}'
  }

  function compileTemplate (template) {
    return new Function(
      'Jsp$a',
      'Jsp$b',
      transformTemplate(template)
    )(toString, escapeHtml)
  }

  function compileFile (file) {
    return fetch(file)
      .then(function (response) {
        return response.text()
      })
      .then(compileTemplate)
  }

  function compileFileCached (file) {
    var compiled = cache[file]
    if (!compiled) {
      compiled = cache[file] = compileFile(file)
    }
    return compiled
  }

  function renderFile (file, data) {
    return compileFileCached(file)
      .then(function (render) {
        return render(data)
      })
  }

  function parseHash (url) {
    return new URL(url).hash
  }

  function startApp (options) {
    var container = document.querySelector(options.target)
    var url = parseHashUrl(location.hash || options.index)
    addEventListener('popstate', handlePopState)
    addEventListener('click', handleClick)
    addEventListener('submit', handleSubmit)
    if (history.state) {
      container.innerHTML = history.state
      renderPage(url)
        .then(function (html) {
          history.replaceState(html, null, url.hash)
          showOldPage(html)
        })
    } else {
      replacePage(url)
    }

    function parseHashUrl (hash) {
      var url = new URL('hash://' + hash.slice(1))
      if (/\.jsp$/.test(url.pathname)) {
        var page = url.pathname.slice(2)
        return {
          hash: hash,
          page: page,
          file: page,
          get: Object.fromEntries(url.searchParams),
          post: undefined,
          global: options.global
        }
      }
    }

    function showOldPage (html) {
      var title = document.head.querySelector('title')
      if (title) {
        document.head.removeChild(title)
      }
      container.innerHTML = html
    }

    function showNewPage (html) {
      showOldPage(html)
      scrollTo(0, 0)
      var input = container.querySelector('[autofocus]')
      if (input) {
        input.focus()
      }
    }

    function handlePopState (e) {
      if (e.state === null) {
        var url = parseHashUrl(location.hash)
        if (url) {
          replacePage(url)
        }
      } else {
        showOldPage(e.state)
      }
    }

    function renderPage (url) {
      url = Object.assign({
        include: function (file, data) {
          data = Object.assign({}, url, data, {
            file: file
          })
          return renderPage(data)
        },
        redirect: function (hash) {
          if (hash.charAt(0) !== '#') {
            throw new Error('Redirect argument should be a hash.')
          }
          replacePage(parseHashUrl(hash))
        }
      }, url)
      return renderFile(options.prefix + url.file, url)
    }

    function replacePage (url) {
      renderPage(url)
        .then(function (html) {
          history.replaceState(html, null, url.hash)
          showNewPage(html)
        })
    }

    function pushPage (url) {
      renderPage(url)
        .then(function (html) {
          history.pushState(html, null, url.hash)
          showNewPage(html)
        })
    }

    function handleClick (e) {
      var a, url
      if ((a = e.target.closest('a'))
          && (url = parseHashUrl(parseHash(a.href)))) {
        e.preventDefault()
        pushPage(url)
      }
    }

    function handleSubmit (e) {
      var form = e.target
      var url = parseHashUrl(parseHash(form.action))
      if (url) {
        e.preventDefault()
        var data = new FormData(form)
        if (form.method === 'get') {
          url.get = Object.fromEntries(data)
          url.hash = '#' + url.file + '?' + new URLSearchParams(data)
        } else {
          url.post = Object.fromEntries(data)
        }
        pushPage(url)
      }
    }
  }

  function runApp (options) {
    if (options.index.charAt(0) !== '#') {
      throw new Error('Index should be a hash.')
    }
    options = {
      index: options.index,
      prefix: options.prefix || '',
      target: options.target || 'body',
      global: options.global
    }
    if (document.readyState !== 'loading') {
      startApp(options)
    } else {
      addEventListener('DOMContentLoaded', function load () {
        removeEventListener('DOMContentLoaded', load)
        startApp(options)
      })
    }
  }

  return {
    run: runApp
  }
}()
