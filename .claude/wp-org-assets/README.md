# WP.org アセットのソース

このディレクトリは WordPress.org 用バナーの **編集可能なソース** を保管する。
配布物（`.wordpress-org/*.jpg`）はここから生成する。`.claude` は `.distignore` で
WP.org 配布物から除外されるため、ここにソースを置いても配布 zip には含まれない。

> Tarosky プラグインバナーの標準。リファレンス（理想形）は `rich-taxonomy`。
> スキル: `~/.claude/skills/wp-org-assets`（SKILL.md / references/rendering.md）。

## デザイン原則

- 背景は白ベース + ブランドブルー `#00A9D9` の柔らかいラジアルグロー。
- **四辺はすべて純白 `#FFFFFF` にフェードさせる**（WP.org は白背景。端が純白でないと
  バナーが「箱」に見えて浮く）。グローは端の手前で必ず透明（=白）に収束させ、生成後に
  ピクセルで四辺=255 を検算する。
- メインのグローは価値を象徴する語（`.hl` を付けた語）の中心へ自動追従する。
- ロゴ・タイトル・タグラインのレイアウトは維持。TAROSKY 公式ワードマークは無改変で埋め込む。

## 再現手順（macOS / ヘッドレス Chrome / ImageMagick）

`banner.html` は自己完結（ロゴ SVG をインライン埋め込み、グロー位置とタイトル自動縮小を
JS で自己補正）。編集したら以下で再生成する:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1544,500 --screenshot=banner-1544x500.png "file://$PWD/banner.html"

# 四辺が純白（min=65535）か検算
for g in North South West East; do
  dim=1544x1; case $g in West|East) dim=1x500;; esac
  echo "$g min=$(magick banner-1544x500.png -gravity $g -crop $dim+0+0 +repage -format '%[min]' info:)"
done

magick banner-1544x500.png -background white -flatten -quality 92 banner-1544x500.jpg
magick banner-1544x500.jpg -resize 772x250 -quality 92 banner-772x250.jpg
cp banner-1544x500.jpg banner-772x250.jpg ../../.wordpress-org/
```

タイトルの強調語は HTML の `<span class="hl">…</span>` で指定する。グロー位置・大きさは
JS が自動計算し、端の手前で必ず白へ収束する（端を割らない）。
