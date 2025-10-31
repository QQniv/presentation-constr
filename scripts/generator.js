// scripts/generator.js
// Генерация .pptx на основе контента и выбранного "стиля" из presets.yaml
// Требует PptxGenJS (подключим из CDN в index.html)

function mapStyle(config, styleKey) {
  const s = config.styles?.[styleKey] || {};
  const palette = config.palettes?.[s.palette] || ["#111217", "#ffffff"];
  const fonts = config.fonts?.[s.fonts] || { heading: "Inter", body: "Inter" };
  return { palette, fonts, tone: s.tone || [] };
}

// contentSchema (пример):
// {
//   title: "Проблемы денежного обращения",
//   subtitle: "Цифровой рубль, статистика ЦБ, тренды",
//   slides: [
//     { type: "section", title: "Динамика наличных и безналичных" },
//     { type: "bullets", title: "Ключевые факты", bullets: ["2018: ~70%", "2023: ~86.5%"] },
//     { type: "two_column", title: "Цифровой рубль", col_left: "Задачи", col_right: "Риски" },
//     { type: "closing", title: "Спасибо!", cta: "Вопросы?" }
//   ]
// }

function generatePPTX(config, chosenTemplate, contentSchema) {
  const { palette, fonts } = mapStyle(config, chosenTemplate.style);
  const primary = palette[0] || "#111217";
  const bg = palette[3] || "#EAF2FF";
  const text = palette[0] || "#111217";

  const pptx = new PptxGenJS();
  pptx.layout = "16x9";

  // Ковер
  {
    const slide = pptx.addSlide();
    slide.background = { color: bg };
    slide.addText(contentSchema.title || "Презентация", {
      x: 0.7, y: 1.5, w: 9, h: 1.2,
      fontFace: fonts.heading || "Inter",
      fontSize: 36, bold: true, color: primary
    });
    if (contentSchema.subtitle) {
      slide.addText(contentSchema.subtitle, {
        x: 0.7, y: 2.6, w: 9, h: 0.8,
        fontFace: fonts.body || "Inter",
        fontSize: 20, color: text
      });
    }
  }

  // Прочие слайды
  (contentSchema.slides || []).forEach(s => {
    const slide = pptx.addSlide();
    slide.background = { color: "#FFFFFF" };

    const title = s.title || "";
    if (title) {
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: bg } });
      slide.addText(title, {
        x: 0.6, y: 0.2, w: 8.8, h: 0.6,
        fontFace: fonts.heading || "Inter",
        fontSize: 22, bold: true, color: primary
      });
    }

    if (s.type === "section") {
      slide.addText(title, {
        x: 0.7, y: 2.5, w: 8.6, h: 1,
        fontFace: fonts.heading || "Inter",
        fontSize: 40, bold: true, color: primary, align: "center"
      });
    }

    if (s.type === "bullets") {
      const bullets = (s.bullets || []).map(b => `• ${b}`).join("\n");
      slide.addText(bullets, {
        x: 1.0, y: 1.4, w: 8.4, h: 4.5,
        fontFace: fonts.body || "Inter",
        fontSize: 18, color: text, lineSpacingMultiple: 1.1
      });
    }

    if (s.type === "two_column") {
      slide.addText(s.col_left || "", {
        x: 0.8, y: 1.4, w: 4.0, h: 4.8,
        fontFace: fonts.body || "Inter",
        fontSize: 16, color: text
      });
      slide.addText(s.col_right || "", {
        x: 5.2, y: 1.4, w: 4.0, h: 4.8,
        fontFace: fonts.body || "Inter",
        fontSize: 16, color: text
      });
    }

    if (s.type === "quote") {
      slide.addText(`“${s.quote_text || ""}”`, {
        x: 0.9, y: 2.1, w: 8.2, h: 2.5,
        fontFace: fonts.heading || "Inter",
        fontSize: 28, italic: true, color: primary, align: "center"
      });
      if (s.author) {
        slide.addText(`— ${s.author}`, {
          x: 0.9, y: 4.2, w: 8.2, h: 0.6,
          fontFace: fonts.body || "Inter",
          fontSize: 16, color: text, align: "center"
        });
      }
    }

    if (s.type === "closing") {
      slide.addText(s.title || "Спасибо!", {
        x: 0.7, y: 2.3, w: 8.6, h: 1,
        fontFace: fonts.heading || "Inter",
        fontSize: 40, bold: true, color: primary, align: "center"
      });
      if (s.cta) {
        slide.addText(s.cta, {
          x: 0.7, y: 3.5, w: 8.6, h: 0.8,
          fontFace: fonts.body || "Inter",
          fontSize: 18, color: text, align: "center"
        });
      }
    }
  });

  const fileName = (contentSchema.fileName || "presentation") + ".pptx";
  pptx.writeFile({ fileName });
}

// Утилита для примера
async function generateFromForm(config, chosen, rawJson) {
  try {
    const content = JSON.parse(rawJson);
    generatePPTX(config, chosen, content);
  } catch (e) {
    alert("Ошибка в JSON контента: " + e.message);
  }
}

export { generatePPTX, generateFromForm };
