import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { TitleService } from './title.service';
import { AppConfig } from '../../common/config/app.config';
import { UAParser } from 'ua-parser-js';
import { Request, Response } from 'express';

@Controller('movies')
export class ShareController {
  constructor(
    private readonly titleService: TitleService,
    private readonly config: AppConfig,
  ) {}

  @Get(':slug')
  @Public()
  async get(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ua = req.headers['user-agent'] ?? '';
    const os = new UAParser(ua).getOS().name;

    if (os === 'iOS') {
      return res.redirect(302, this.config.appStoreUrl);
    } else if (os === 'Android') {
      return res.redirect(302, this.config.playMarketUrl);
    }

    const title = await this.titleService.getBySlugToShare(slug);
    let shortDesc =
      title.genres
        .slice(0, 2)
        .map((genre) => genre.title)
        .join(', ') +
      '\n' +
      (title.shortDesc ?? '');
    if (shortDesc.length > 200) {
      shortDesc = shortDesc.slice(0, 250) + '...';
    }
    //todo agar web chiqsa webga redirect qilish kerak.
    const html = `
<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title.title ?? ''}</title>

  <meta property="og:site_name" content="MegaFilm">
  <meta property="og:title" content="${title.title ?? ''}" />
  <meta property="og:description" content="${shortDesc}" />
  <meta property="og:url" content="${this.config.appUrl}/movies/${slug}" />
  <meta property="og:type" content="video.other" />
  <meta property="og:image" content="${title.imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${title.imageUrl}" />
  <meta name="twitter:description" content="${shortDesc}" />

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    /* logo variables for easy tuning */
    :root {
      --logo-bg1: #660f0f;
      --logo-bg2: #010101;
      --logo-bg3: #6efff8;
    }


    /* --- Bubble background (kept from your example) --- */
    :root {
      --color-bg1: rgb(108, 0, 162);
      --color-bg2: rgb(0, 17, 82);
      --color1: 18, 113, 255;
      --color2: 221, 74, 255;
      --color3: 100, 220, 255;
      --color4: 200, 50, 50;
      --color5: 180, 180, 50;
      --color-interactive: 140, 100, 255;
      --circle-size: 80%;
      --blending: hard-light;
    }

    @keyframes moveInCircle { 0%{transform:rotate(0deg)} 50%{transform:rotate(180deg)} 100%{transform:rotate(360deg)} }
    @keyframes moveVertical { 0%{transform:translateY(-50%)} 50%{transform:translateY(50%)} 100%{transform:translateY(-50%)} }
    @keyframes moveHorizontal { 0%{transform:translateX(-50%) translateY(-10%)} 50%{transform:translateX(50%) translateY(10%)} 100%{transform:translateX(-50%) translateY(-10%)} }

.gradient-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: url(${title.imageUrl}) center/cover no-repeat;
  overflow: hidden;
}

.gradient-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25); /* shaffofroq overlay */
  backdrop-filter: blur(15px); /* blur effekt kuchliroq */
}
    .gradient-bg svg { position: fixed; top:0; left:0; width: 0; height: 0; }
    .gradients-container { filter: url(#goo) blur(40px); width: 100%; height: 100%; }
    .g1, .g2, .g3, .g4, .g5, .interactive {
      position: absolute;
      mix-blend-mode: var(--blending);
      opacity: 1;
    }
    .g1 {
      background: radial-gradient(circle at center, rgba(var(--color1), 0.8) 0, rgba(var(--color1), 0) 50%);
      width: var(--circle-size); height: var(--circle-size);
      top: calc(50% - var(--circle-size)/2); left: calc(50% - var(--circle-size)/2);
      transform-origin: center; animation: moveVertical 30s ease infinite;
    }
    .g2 {
      background: radial-gradient(circle at center, rgba(var(--color2), 0.8) 0, rgba(var(--color2), 0) 50%);
      width: var(--circle-size); height: var(--circle-size);
      top: calc(50% - var(--circle-size)/2); left: calc(50% - var(--circle-size)/2);
      transform-origin: calc(50% - 400px); animation: moveInCircle 20s reverse infinite;
    }
    .g3 {
      background: radial-gradient(circle at center, rgba(var(--color3), 0.8) 0, rgba(var(--color3), 0) 50%);
      width: var(--circle-size); height: var(--circle-size);
      top: calc(50% - var(--circle-size)/2 + 200px); left: calc(50% - var(--circle-size)/2 - 500px);
      transform-origin: calc(50% + 400px); animation: moveInCircle 40s linear infinite;
    }
    .g4 {
      background: radial-gradient(circle at center, rgba(var(--color4), 0.8) 0, rgba(var(--color4), 0) 50%);
      width: var(--circle-size); height: var(--circle-size);
      top: calc(50% - var(--circle-size)/2); left: calc(50% - var(--circle-size)/2);
      transform-origin: calc(50% - 200px); animation: moveHorizontal 40s ease infinite; opacity: 0.7;
    }
    .g5 {
      background: radial-gradient(circle at center, rgba(var(--color5), 0.8) 0, rgba(var(--color5), 0) 50%);
      width: calc(var(--circle-size) * 2); height: calc(var(--circle-size) * 2);
      top: calc(50% - var(--circle-size)); left: calc(50% - var(--circle-size));
      transform-origin: calc(50% - 800px) calc(50% + 200px); animation: moveInCircle 20s ease infinite;
    }
    .interactive {
      background: radial-gradient(circle at center, rgba(var(--color-interactive), 0.8) 0, rgba(var(--color-interactive), 0) 50%);
      width: 100%; height: 100%; top: -50%; left: -50%; opacity: 0.7;
    }

    /* --- Logo image + RGB sweep (slower, borderless, matched colors) --- */
.logo-container {
  display: inline-flex;
  align-items: center;
  position: relative;
  padding: 10px 20px;
  overflow: hidden;
}

.logo-text {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  z-index: 2;
}

.logo-img {
  height: 40px;
  margin: 0 10px;
  z-index: 2;
}

/* Background bubble animation */
.bubbles {
  position: absolute;
  inset: 0;
  background: linear-gradient(270deg, #ff6ec4, #7873f5, #4facfe, #43e97b);
  background-size: 600% 600%;
  animation: gradientFlow 12s ease infinite;
  opacity: 0.25;
  z-index: 1;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

  </style>
</head>

<body class="relative text-gray-900">
  <!-- Bubble Background -->
  <div class="gradient-bg absolute inset-0 z-0">
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 18 -8" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
    <div class="gradients-container">
      <div class="g1"></div>
      <div class="g2"></div>
      <div class="g3"></div>
      <div class="g4"></div>
      <div class="g5"></div>
      <div class="interactive"></div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
    <!-- Logo: image with RGB sweep behind -->
    <div class="logo-container">
  <span class="logo-text" style="margin-right: -10px;">Mega</span>
  <img src="/api/assets/logo.svg" alt="MegaFilm" class="logo-img" />
  <span class="logo-text" style="margin-left: -10px;">Film</span>
  <div class="bubbles"></div>
</div>

    <!-- Movie Card -->
    <div class="flex flex-col lg:flex-row max-w-5xl w-full shadow-xl rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm">
      <!-- Poster -->
      <div class="w-full lg:w-1/3 aspect-[3/4] max-h-[500px] overflow-hidden rounded-xl shadow bg-black mx-auto">
        <img src="${title.imageVerticalUrl}" alt="Movie Poster" class="w-full h-full object-cover" />
      </div>

      <!-- Content -->
      <div class="w-full lg:w-2/3 p-6 flex flex-col justify-between">
        <h1 class="text-3xl font-extrabold mb-2 uppercase">${title.title ?? ''}</h1>
        ${
          title.genres?.length
            ? `<div class="mb-4 flex flex-wrap gap-2">
                ${title.genres
                  .map(
                    (g) =>
                      `<span class="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full select-none">${g.title}</span>`,
                  )
                  .join('')}
              </div>`
            : ''
        }
        <p class="text-gray-700 mb-4">${title.description}</p>
        ${
          title.releaseDate
            ? `<div class="text-sm text-gray-500 mb-6">
                📅 Chiqarilgan sana: <span class="font-medium">${new Date(title.releaseDate).toLocaleDateString()}</span>
              </div>`
            : ''
        }
        <div class="flex gap-4 mt-auto">
          <!-- Apple App Store -->
          <a href="${this.config.appStoreUrl}" target="_blank" rel="noopener noreferrer">
            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                 alt="App Store dan yuklab olish"
                 class="h-12" />
          </a>
        
          <!-- Google Play -->
          <a href="${this.config.playMarketUrl}" target="_blank" rel="noopener noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                 alt="Google Play Market dan yuklab olish"
                 class="h-12" />
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Mouse-interactive bubble move script (no template literals inside) -->
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      var interBubble = document.querySelector('.interactive');
      var curX = 0, curY = 0, tgX = 0, tgY = 0;
      function move() {
        // faster responsiveness (smaller divisor => faster follow)
        curX += (tgX - curX) / 8;
        curY += (tgY - curY) / 8;
        interBubble.style.transform = 'translate(' + Math.round(curX) + 'px, ' + Math.round(curY) + 'px) scale(1.06)';
        requestAnimationFrame(move);
      }
      window.addEventListener('mousemove', function (e) {
        tgX = e.clientX;
        tgY = e.clientY;
      });
      move();
    });
  </script>
</body>
</html>
`;

    res.type('text/html').status(200).send(html);
  }
}
