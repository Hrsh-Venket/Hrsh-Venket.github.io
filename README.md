# Hrsh-Venket.github.io

Personal website. Pure static HTML/CSS, no Jekyll, no build step.

## Structure

```
index.html              profile + CV button
style.css               single stylesheet
404.html
.nojekyll               disables Jekyll on GitHub Pages
assets/
  img/prof_pic.jpg
  pdf/CV.pdf
  js/site.js            markdown loader + listing renderer
blog/
  index.html            listing page
  post.html             single-post viewer (?slug=...)
  posts.json            ["slug-1", "slug-2", ...]
  posts/<slug>.md       markdown content with YAML frontmatter
projects/
  (same shape as blog/)
```

## Adding a blog post

1. Create `blog/posts/<slug>.md`:

   ```
   ---
   title: My post title
   date: 2026-04-30
   description: One-line summary shown on the index.
   tags: [foo, bar]
   ---

   Markdown body here. Reference images with absolute paths:

   ![Alt](/assets/img/blog/example.png)
   ```

2. Append `"<slug>"` to `blog/posts.json`.

Posts are sorted by `date` (newest first).

## Adding a project

Same as blog, under `projects/`.

## Local preview

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.
