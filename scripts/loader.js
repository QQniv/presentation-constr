// scripts/loader.js
// ----------------------------------------------
// Простая загрузка и подбор шаблонов по YAML
// ----------------------------------------------

async function loadPresets() {
  const response = await fetch('config/presets.yaml');
  const text = await response.text();
  const config = jsyaml.load(text);
  console.log('✅ YAML загружен', config);
  return config;
}

// Функция фильтрации шаблонов по критериям
function findTemplates(config, { audience = [], purpose = '', tags = [] } = {}) {
  const all = config.templates || [];
  const results = all.filter(t => {
    const matchAudience = audience.some(a => t.audience?.includes(a));
    const matchTags = tags.some(tag => t.tags?.includes(tag));
    const matchPurpose = purpose
      ? Object.keys(config.auto_select.tag_style_map).some(k =>
          purpose.toLowerCase().includes(k) &&
          config.auto_select.tag_style_map[k].includes(t.style)
        )
      : true;
    return matchAudience || matchTags || matchPurpose;
  });
  return results.slice(0, 3); // top-3
}

// Демонстрация
loadPresets().then(cfg => {
  const selected = findTemplates(cfg, {
    audience: ['инвесторы'],
    purpose: 'инвестиционный питч',
    tags: ['ESG', 'вода']
  });
  console.log('🎯 Подходящие шаблоны:', selected);
});
