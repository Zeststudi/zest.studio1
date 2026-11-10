ZEST — сайт-портфолио
=====================
Страницы: index.html (главная + портфолио), contact.html (Контакты — соцсети)

ВСЁ редактируется в js/content.js:
  • size — размеры логотипа (меню / главный экран) и фото, с комментариями
  • social — соцсети
  • reels / events / clips — портфолио: вставляйте путь к файлу в кавычках
Файлы кладите в папку media/ (logo.png и hero.jpg уже там).

VS Code: папку нужно открыть целиком (File → Open Folder) — тогда
.vscode/settings.json включит перенос длинных строк.

ВИДЕО НЕ ИГРАЕТ / ТЯЖЁЛЫЕ ФАЙЛЫ
  Ролик 30 сек должен весить 5–20 МБ, а не 100. Сжать (нужен ffmpeg):
  ffmpeg -i исходник.mp4 -vf "scale=-2:1280" -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart video1.mp4
  Путь в content.js: "media/video1.mp4" (латиница, без пробелов — надёжнее).
