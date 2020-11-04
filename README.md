# jsp

```html
<script src="/path/to/jsp.js" 
  data-index="index-page-hash"
  data-prefix="path-prefix"
  data-target="container-selector"></script>
```

`jsp-loading` is added to `<body>` when the page is loading.

```ts
type Options = {
  index: string
  prefix: string
  target: string
  global: any
}

type Jsp = {
  run (options: Options)
}
```

```ts
type JspLocals = {
  hash: string
  page: string // current page from hash
  file: string // current file (differ on include)
  get: Record<string, string> // from searchParams in hash
  post: Record<string, any> | undefined // from FormData in <form method="post">
  global: any
  include (file: string, data: any): Promise<string>
  redirect (hash: string)
}
```
