# Homepage editorial design

文芸、現代思想、アート、音楽、技術にまたがる執筆・制作を紹介する個人サイト。エッセイ集から書評、日記、制作物、写真、音声へ進める。

- 白と黒、青のリンク。明朝見出しとサンセリフ本文。
- ヒーロー全面画像と透明メニュー。下部では白背景の固定メニュー。
- 画像は装飾用の生成写真であり、本人の撮影・所有物・実在の店とは表示しない。
- エッセイと制作物は既存フィード、読書欄は2026年の公開日記本文、日記・音声は既存データから掲載。
- 2列のエッセイ、左右の写真と記事、長方形の写真グリッド。700px以下は縦に並べる。
- メニュー、切替ボタン、リンクはキーボード操作可。フォーカス表示と動きを抑える設定に対応。

## Generated assets

Built-in image generation used. The user approved this instead of the unavailable explicit model selection.

- public/images/editorial/bookshop-interior.webp
- public/images/editorial/reading-desk.webp
- public/images/editorial/records.webp

WebP conversion at quality 85–86; generated originals remain in the tool output directory.

## Final prompts

### Bookshop
Use case: photorealistic-natural. Asset type: full-bleed landscape website editorial hero, 3:2. An unposed documentary photograph of a small independent bookshop viewed through its street window at dusk in an ordinary Tokyo neighborhood. Cool blue exterior light, clear white interior light, chrome window frame, a small red awning edge. Tangible shelves densely filled with paperback novels, literary journals, philosophy books of assorted sizes, two books opened on a low display table by the window, pale gray concrete walls. Close view, asymmetrical photographic framing, reflections of overhead utility wires and mundane apartment buildings across the street layer softly on the glass. No people. Right two-thirds show luminous detailed books and the shop; left third is a dark gray tiled wall and shadow with space for a white headline overlay. Independent culture magazine photography, natural color, authentic everyday detail, fine film grain, no nostalgia filter, no sepia, no beige mood board, no orange lighting, no artificial sculptural objects, no floating objects, no sphere, no neon, no sci-fi. No legible text, no shop name, no logos, no watermark. Strong concrete place, no abstract imagery.

Final bookshop edit prompt:
Edit the provided bookshop photograph, preserving the camera angle, window framing, building, lighting, and overall composition. Remove the entire foreground low display table directly behind the window and ALL books and objects on that table, including both open books. Replace that foreground area with a clear, ordinary pale-gray concrete floor and unobstructed interior walkway. There should be NO window-facing book display, NO table against the window, NO open books anywhere near the window. Retain the existing wall-mounted bookshelves further inside the store, arranged naturally for customers standing inside the store to browse. Maintain convincing architecture, perspective, and physical retail layout. Keep the dusk street reflections and quiet photographic quality. Do not add any objects, signage, abstract forms, people, text or logos.

### Reading desk
Initial image prompt:
Use case: photorealistic-natural. Asset type: landscape 3:2 editorial photograph. Close overhead documentary photo of an ordinary reader's working table: a black softcover notebook open with a few indistinct pencil marks, several paperback books with colored page tabs stacked casually, a small white ceramic coffee cup with a coffee ring inside, black reading glasses, a graphite pencil, and one folded newspaper. Red laminate table, soft but cool natural window light, medium gray wall glimpsed at top. Books have white, dark blue and muted red covers, blank without legible titles. Real handled paper and natural creases. Candid and slightly imperfect, cultured personal reading scene, decisive crop, independent literary journal editorial. No chrome sculpture, no spheres, no abstract objects, no showroom styling, no computer, no sepia filter, no warm beige, no watermark or typography.

Final edit prompt:
Edit this still-life photograph. Remove the coffee cup completely and leave the red tabletop clean where it stood. Close the open notebook so only its plain matte black unlettered cover is visible; keep pencil lying diagonally across the closed cover. Remove newspaper on right entirely. Remove all fake handwriting and all visible printed text. Books at upper left should remain with blank covers and clean white edges. Keep reading glasses. Make lighting cooler and a little brighter, crisp contemporary editorial color with a vivid true red table, neutral white paper, black objects. No sepia or vintage wash. Preserve photographic perspective and natural physical layout. No coffee, no writing, no logos, no dirt.

### Records
Use case: photorealistic-natural. Asset type: landscape 3:2 editorial photo for a personal website about music and podcasts. Close documentary photograph of a black turntable with a spinning vinyl record on a charcoal shelf, a stack of twelve inch records with paper sleeves leaning against a clean light-gray wall, a pair of well-used wired black headphones lying naturally on the shelf. A cobalt-blue record sleeve without text is foremost; one red sleeve behind. Shot from slightly above at a diagonal, cropped tightly, cool daylight from the side, tactile grooves and dust specks, black and white with a blue and red accent. Credible small apartment listening corner, independent music magazine photography. No abstract sculptures, no spheres, no glowing cables, no luxury showroom, no sepia, no vintage color filter, no legible text, no brand logos, no watermark.

## Validation

TypeScript and lint passed (existing img-element warnings). Desktop 1440px and mobile 390px/320px checked in browser. Hero starts at viewport top; transparent header has no visible border and becomes white below hero. Mobile menu and journal/blog switch tested. Three selected 2026 journal URLs returned HTTP 200. Journal/blog panels share the height of the taller panel, keeping the image crop and following section position unchanged. Production compilation also passed. Full archive export was not completed during the interactive design edits. The final text edit was checked again with TypeScript.
