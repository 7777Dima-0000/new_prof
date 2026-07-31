#!/usr/bin/env python3
"""Сборка многостраничного сайта из блоков.

Секции лежат в sections/*.html, общие части — в partials/.
Запуск: python3 build.py
"""

import pathlib
import re

ROOT = pathlib.Path(__file__).parent
SECTIONS = ROOT / "sections"
PARTIALS = ROOT / "partials"

CSS_VERSION = "20"
JS_VERSION = "3"

# страница -> (файл, заголовок вкладки, описание, надзаголовок, H1 страницы, секции)
PAGES = [
    (
        "index.html",
        "Семинар «Лифтинг и регенерация. PDRN-бабочка» | НИИ ИКЭМ",
        "Однодневный семинар по PDRN-терапии: лифтинг и регенерация нижней трети "
        "овала лица. Москва, 20 августа, очно или онлайн.",
        None,
        None,
        ["hero", "benefits", "audience", "why", "speaker", "problem", "proof", "apply"],
    ),
    (
        "product.html",
        "Что такое PDRN — семинар «PDRN-бабочка» | НИИ ИКЭМ",
        "PDRN: механизм действия через рецептор A2A, отличие от гиалуроновой "
        "кислоты и что вы получите на семинаре.",
        "Продукт",
        "Что такое PDRN и что вы получите на курсе",
        ["product", "cta"],
    ),
    (
        "advantages.html",
        "Преимущества семинара | НИИ ИКЭМ",
        "Чем наш семинар по PDRN отличается от других: практика руками, "
        "независимость от производителей, открытая цена.",
        "Преимущества",
        "Чем это отличается от других семинаров по PDRN",
        ["advantages", "cta"],
    ),
    (
        "pricing.html",
        "Стоимость участия | НИИ ИКЭМ",
        "Открытый прайс семинара по PDRN: офлайн 5 000 ₽ или оплата закупкой "
        "препаратов, онлайн 2 900 ₽.",
        "Тарифы",
        "Открытый прайс — без «уточните у менеджера»",
        ["pricing", "cta"],
    ),
    (
        "stages.html",
        "Программа семинара | НИИ ИКЭМ",
        "Как проходит однодневный семинар по PDRN: теория и разбор препаратов, "
        "практика на моделях.",
        "Этапы",
        "Как проходит обучение — 1 день",
        ["stages", "cta"],
    ),
    (
        "guarantees.html",
        "Гарантии | НИИ ИКЭМ",
        "Доступ к записи навсегда и месяц сопровождения куратора — гарантии в "
        "договоре, а не на словах.",
        "Гарантии",
        "Гарантии в договоре, а не на словах",
        ["guarantees", "cta"],
    ),
    (
        "faq.html",
        "Частые вопросы | НИИ ИКЭМ",
        "Ответы на частые вопросы о PDRN-терапии, удостоверении ФРДО, "
        "рассрочке и участии из регионов.",
        "FAQ",
        "Частые вопросы",
        ["faq", "cta"],
    ),
    (
        "contacts.html",
        "Контакты | НИИ ИКЭМ",
        "Адрес, телефон и мессенджеры НИИ ИКЭМ. Место проведения: Москва, "
        "ул. Красина, д. 2, стр. 1.",
        "Контакты",
        "Свяжитесь с нами",
        ["contacts"],
    ),
]

NAV = [
    ("index.html", "Главная"),
    ("product.html", "Продукт"),
    ("advantages.html", "Преимущества"),
    ("pricing.html", "Тарифы"),
    ("stages.html", "Этапы"),
    ("guarantees.html", "Гарантии"),
    ("faq.html", "Частые вопросы"),
    ("contacts.html", "Контакты"),
]


def read(path):
    return path.read_text(encoding="utf-8")


def build_nav(current):
    links = []
    for href, label in NAV:
        active = ' class="nav-active"' if href == current else ""
        links.append(f'      <a href="{href}"{active}>{label}</a>')
    links.append(
        '      <a href="index.html#apply" class="btn btn-primary nav-cta">'
        "Записаться на курс</a>"
    )
    return "\n".join(links)


def page_hero(tag, title):
    return f"""
<section class="page-hero reveal">
  <div class="container">
    <span class="section-tag">{tag}</span>
    <h1>{title}</h1>
  </div>
</section>
"""


def main():
    header = read(PARTIALS / "header.html")
    footer = read(PARTIALS / "footer.html")
    floating = read(PARTIALS / "floating.html")

    for filename, title, description, tag, heading, section_names in PAGES:
        body = header.replace("{{NAV}}", build_nav(filename))

        if tag and heading:
            body += page_hero(tag, heading)

        for name in section_names:
            body += read(SECTIONS / f"{name}.html")

        body += footer + floating

        html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content="{description}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="styles.css?v={CSS_VERSION}" />
</head>
<body>
{body}
<script src="script.js?v={JS_VERSION}"></script>
</body>
</html>
"""
        # заголовки внутри секций на внутренних страницах дублируют page-hero
        if tag and heading:
            html = re.sub(
                r'\s*<div class="section-head[^"]*">\s*<span class="section-tag">'
                + re.escape(tag)
                + r"</span>\s*<h2>[^<]*</h2>\s*</div>",
                "",
                html,
                count=1,
            )

        (ROOT / filename).write_text(html, encoding="utf-8")
        print(f"собрано: {filename}")


if __name__ == "__main__":
    main()
