---
title: Hello, world
date: 2026-04-30
description: A starter post — drop a markdown file in /blog/posts/, add the slug to /blog/posts.json, and it shows up here.
tags: [meta]
---

This is a sample post. It demonstrates the format expected by the blog renderer.


## How to add a post

1. Create a markdown file at `/blog/posts/<slug>.md` with frontmatter at the top:

```
---
title: My post
date: 2026-04-30
description: Short summary shown on the index.
tags: [foo, bar]
---
```

2. Add `"<slug>"` to `/blog/posts.json`.

That's it. The index sorts posts by date.

## Images

Images can live anywhere under `/assets/`. Reference them with absolute paths so they resolve regardless of where the post is rendered:

```
![Alt text](/assets/img/blog/example.png)
```

## Code

Inline `code` and fenced blocks both work:

```python
def hello():
    print("hello")
```

> Block quotes render too.

You can delete this file and remove its slug from `posts.json` once you've got real posts.
