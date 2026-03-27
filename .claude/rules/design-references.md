# Design References Rule — Obrigatório antes de criar qualquer UI

## Quando esta regra se aplica

Esta regra é **obrigatória** sempre que você for criar ou modificar qualquer saída visual:

- Páginas web (HTML, React, Vue, Next.js, etc.)
- Componentes de UI (botões, cards, forms, layouts)
- Landing pages, dashboards, portfólios
- Apresentações, slides, templates
- Sistemas de design (cores, tipografia, tokens)
- Conteúdo para redes sociais (Instagram, LinkedIn)
- Qualquer arquivo CSS, SCSS, Tailwind com estilo visual

## Protocolo obrigatório (SEMPRE executar antes de criar UI)

### Passo 1 — Ler o catálogo de referências

```
Read: docs/design/references-catalog.md
```

### Passo 2 — Identificar a referência mais adequada

Com base no contexto do projeto, escolha a referência primária da tabela "Referência Rápida por Tipo de Projeto".

### Passo 3 — Ler o HTML da referência

```
Read: home/ubuntu/upload/referencias/<nome-escolhido>/index.html
```

Extraia:
- Paleta de cores exata (hex)
- Família tipográfica usada
- Padrões de animação e easing
- Classes CSS / estrutura de layout
- Efeitos visuais (glassmorphism, gradients, shadows)

### Passo 4 — Aplicar como ponto de partida

Use os tokens extraídos como base. **Adapte ao contexto do projeto** — não copie o conteúdo, use o estilo e os padrões visuais.

---

## Regras de design que SEMPRE se aplicam

Independente da referência escolhida:

1. **Mobile-first**: comece pelo mobile, expanda para desktop
2. **WCAG AA mínimo**: contraste mínimo 4.5:1 para texto, 3:1 para UI
3. **Tokens como variáveis CSS**: `--color-primary`, `--font-heading`, etc.
4. **Consistência**: use apenas fontes e cores da referência escolhida
5. **Performance**: prefira `transform` e `opacity` para animações (GPU-friendly)
6. **Easing com caráter**: prefira `cubic-bezier(0.16, 1, 0.3, 1)` (spring) ou `ease-out` — nunca `linear` para UI

---

## Quando o usuário não especifica o estilo

Se o usuário não informar preferência visual, pergunte o tipo de projeto e aplique a referência da tabela. Se não for possível perguntar, use:

- **Padrão para produtos digitais**: `cool-dashboard` (dark, moderno, profissional)
- **Padrão para landing pages**: `pagina-de-captura` (light, clean, conversão)

---

## Agentes especializados disponíveis

Para análise profunda de referências e geração de design system completo:

```
@visual-analyzer   — analisa HTML, extrai elementos visuais
@color-extractor   — extrai paleta e tokens de cor
@typography-analyzer — extrai sistema tipográfico
@component-mapper  — mapeia componentes e estados
@motion-detector   — detecta animações e transições
@ds-generator      — gera design-system.html completo
```

Workflow completo via: `squads/design-system-squad/workflows/design-system-generation.yaml`
