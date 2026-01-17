# Seed Planning Global (Prototype)

This is a static HTML prototype for the new English site intended to live under:

- `https://seedplanning.co.jp/global/`

All internal links are written as **root-relative** paths (e.g., `/global/why-seed/`) to match that deployment.

## Preview locally

1) Unzip the archive.
2) Run a simple web server from the **directory that contains the `global/` folder**:

```bash
# example (adjust path as needed)
cd <folder-containing-global>
python3 -m http.server 8080
# open:
#   http://localhost:8080/global/
```

## Design system (single CSS file)

All styling is centralized in:

- `global/assets/css/site.css`

Update the `:root` tokens (colors, fonts, spacing) and component styles there.

## Key files

- `global/index.html` — Home
- `global/sitemap.html` — Human-readable sitemap
- `global/sitemap.xml` — XML sitemap (URL base is set to `https://seedplanning.co.jp/global/` as a placeholder)

## Downloads (placeholders)

- `global/assets/docs/SeedPlanning_Company_Profile_EN.pdf`
- `global/assets/docs/SeedPlanning_Full_Team_Profile_EN.pdf`
- `global/assets/docs/Japan_Fact_Sheets_Pack_EN.pdf`

Replace these with approved PDFs.

