# AniTrack editorial artwork

Retrieved: 2026-10-28.

These local assets provide distinct artwork for the marketing and account pages. The shared catalog and saved watchlists keep their existing title covers. These bundled editorial images do not require a runtime request to the source websites.

## Sources

Anime cover metadata and cover files were retrieved from Kitsu's public API and image CDN. Film stills came from Studio Ghibli's official work galleries. Artwork remains the property of its respective rightsholders; consult the linked source pages for reuse conditions.

| Local file | Title | Placement | Source page | Original image |
| --- | --- | --- | --- | --- |
| [cowboy-bebop.webp](cowboy-bebop.webp) | Cowboy Bebop | Landing hero | [Source](https://kitsu.app/anime/cowboy-bebop) | [Download](https://media.kitsu.app/anime/poster_images/1/large.jpg) |
| [fullmetal-alchemist.webp](fullmetal-alchemist.webp) | Fullmetal Alchemist: Brotherhood | Landing hero | [Source](https://kitsu.app/anime/fullmetal-alchemist-brotherhood) | [Download](https://media.kitsu.app/anime/poster_images/3936/large.jpg) |
| [haikyu.webp](haikyu.webp) | HAIKYU!! | Watchlist feature | [Source](https://kitsu.app/anime/haikyuu) | [Download](https://media.kitsu.app/anime/poster_images/8133/large.jpg) |
| [violet-evergarden.webp](violet-evergarden.webp) | Violet Evergarden | Favorites feature | [Source](https://kitsu.app/anime/violet-evergarden) | [Download](https://media.kitsu.app/anime/poster_images/12230/large.jpg) |
| [demon-slayer.webp](demon-slayer.webp) | Demon Slayer: Kimetsu no Yaiba | Landing hero | [Source](https://kitsu.app/anime/kimetsu-no-yaiba) | [Download](https://media.kitsu.app/anime/poster_images/41370/large.jpg) |
| [chainsaw-man.webp](chainsaw-man.webp) | Chainsaw Man | Landing hero | [Source](https://kitsu.app/anime/chainsaw-man) | [Download](https://media.kitsu.app/anime/43806/poster_image/large-815d6008fb3b56f4291b9f0ffa05cd8f.jpeg) |
| [spy-family.webp](spy-family.webp) | SPY x FAMILY | Landing hero | [Source](https://kitsu.app/anime/spy-x-family) | [Download](https://media.kitsu.app/anime/45398/poster_image/large-c26c1e0b77e881fcd66475af6bd22c57.jpeg) |
| [frieren.webp](frieren.webp) | Frieren: Beyond Journeyâ€™s End | Landing hero | [Source](https://kitsu.app/anime/sousou-no-frieren) | [Download](https://media.kitsu.app/anime/46474/poster_image/large-ec9b98dd5fbf8f92532d1edb45f9e882.jpeg) |
| [howls-moving-castle.webp](howls-moving-castle.webp) | Howl's Moving Castle | Spotlight feature | [Source](https://www.ghibli.jp/works/howl/) | [Download](https://www.ghibli.jp/gallery/howl049.jpg) |
| [castle-in-the-sky.webp](castle-in-the-sky.webp) | Castle in the Sky | Journey gallery | [Source](https://www.ghibli.jp/works/laputa/) | [Download](https://www.ghibli.jp/gallery/laputa039.jpg) |
| [spirited-away.webp](spirited-away.webp) | Spirited Away | Journey gallery | [Source](https://www.ghibli.jp/works/chihiro/) | [Download](https://www.ghibli.jp/gallery/chihiro049.jpg) |
| [whisper-of-the-heart.webp](whisper-of-the-heart.webp) | Whisper of the Heart | Login page | [Source](https://www.ghibli.jp/works/mimi/) | [Download](https://www.ghibli.jp/gallery/mimi049.jpg) |
| [kikis-delivery-service.webp](kikis-delivery-service.webp) | Kiki's Delivery Service | Registration page | [Source](https://www.ghibli.jp/works/majo/) | [Download](https://www.ghibli.jp/gallery/majo019.jpg) |
| [ponyo.webp](ponyo.webp) | Ponyo | Closing headline | [Source](https://www.ghibli.jp/works/ponyo/) | [Download](https://www.ghibli.jp/gallery/ponyo049.jpg) |
| [next-chapter-landscape.webp](next-chapter-landscape.webp) | Existing AniTrack landscape | Closing background | Existing project artwork | [Original](../next-chapter-landscape.png) |

## Image preparation

- Converted to WebP with Pillow; EXIF orientation was applied and metadata was removed.
- Cover images retain their original aspect ratios, capped at 600 by 840 pixels.
- Gallery stills retain their original aspect ratios, capped at 1440 pixels wide. The small Ponyo inset is 480 pixels wide.
- The existing closing landscape was resized to 1600 by 900 pixels and converted from PNG to WebP.
- New artwork uses WebP quality 84. The existing closing landscape uses quality 82.
- Landscape framing is handled in CSS, so the source compositions remain available for responsive layouts.
