// ============================================================
// app.js — 所有交互逻辑。修改行为改这里。
// ============================================================
(() => {
  // ---------- helpers ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    }
    for (const k of kids) {
      if (k == null) continue;
      e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    }
    return e;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function showToast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._h);
    showToast._h = setTimeout(() => t.classList.remove('show'), 1400);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制');
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('已复制'); }
      finally { document.body.removeChild(ta); }
    }
  }

  // ============================================================
  // 1. HERO — countdown + papers strip
  // ============================================================
  function initHero() {
    const oldEl = $('#hero-old');
    const newEl = $('#hero-new');
    const track = $('#papers-track');

    // build paper tiles
    HERO.papers.forEach((p, i) => {
      const tile = el('div', { class: 'paper-tile' + (i < 4 ? ' starred' : '') });
      if (p.t) {
        tile.appendChild(el('div', { class: 'pt-month' }, p.m));
        tile.appendChild(el('div', { class: 'pt-title' }, p.t));
        if (p.v) tile.appendChild(el('div', { class: 'pt-venue' }, p.v));
      }
      track.appendChild(tile);
    });

    // run the countdown once when hero is on screen
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      animateNumber(oldEl, 90, 90, 600); // 左卡停在 90 天
      newEl.textContent = '90';
      animateNumber(newEl, 90, 4, 1800); // 右卡从 90 倒数到 4
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { run(); io.disconnect(); }
      }, { threshold: 0.2 });
      io.observe($('#hero'));
    } else {
      run();
    }
  }

  function animateNumber(node, from, to, duration) {
    const start = performance.now();
    function tick(t) {
      const k = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - k, 3);
      node.textContent = Math.round(from + (to - from) * eased);
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ============================================================
  // 2. PHILOSOPHY BAR
  // ============================================================
  function initBar() {
    const slider = $('#bar-slider');
    const impl   = $('#bar-impl');
    const phys   = $('#bar-physics');
    const implPct = $('#bar-impl-pct');
    const physPct = $('#bar-phys-pct');
    const out    = $('#lifetime-papers');
    const sub    = $('#bar-comparison');

    function render() {
      const ratio = +slider.value / 100;
      impl.style.width = (ratio * 100) + '%';
      phys.style.width = ((1 - ratio) * 100) + '%';
      implPct.textContent = Math.round(ratio * 100) + '%';
      physPct.textContent = Math.round((1 - ratio) * 100) + '%';

      // Conservative capacity estimate for independently led deep projects.
      const projects = Math.round(
        WORK_BAR.lifetimeHours * (1 - ratio) / WORK_BAR.coreHours
      );
      out.textContent = projects;

      // baseline at ratio 0.80 → ~50
      const base = Math.round(WORK_BAR.lifetimeHours * 0.20 / WORK_BAR.coreHours);
      const x = (projects / base).toFixed(1);
      if (Math.abs(ratio - 0.80) < 0.01) {
        sub.textContent = '这是主导型产出的粗略量级，不是署名总数。';
      } else if (projects > base) {
        sub.textContent = '相比传统流程，深度项目容量约 ×' + x + '。';
      } else {
        sub.textContent = '约为传统流程的 ×' + x + '。';
      }
    }
    slider.addEventListener('input', render);
    render();
  }

  // ============================================================
  // 3. WORKFLOW BOARD
  // ============================================================
  function initWorkflow() {
    const root = $('#workflow-board');
    if (!root) return;

    let active = 0;
    const rail = el('div', { class: 'workflow-rail' });
    const detail = el('div', { class: 'workflow-detail' });
    root.appendChild(rail);
    root.appendChild(detail);

    WORKFLOW.forEach((step, i) => {
      const btn = el('button', {
        class: 'workflow-step' + (i === active ? ' active' : ''),
        onClick: () => {
          active = i;
          $$('.workflow-step', rail).forEach((b, k) => b.classList.toggle('active', k === i));
          renderDetail();
        }
      });
      btn.appendChild(el('span', { class: 'workflow-phase' }, step.phase));
      btn.appendChild(el('span', { class: 'workflow-step-title' }, step.title));
      btn.appendChild(el('span', { class: 'workflow-step-meta' }, step.owner + ' · ' + step.time));
      rail.appendChild(btn);
    });

    function renderDetail() {
      const step = WORKFLOW[active];
      detail.innerHTML = '';
      detail.appendChild(el('div', { class: 'workflow-detail-head' },
        el('span', { class: 'workflow-phase big' }, step.phase),
        el('div', {},
          el('h3', {}, step.title),
          el('div', { class: 'workflow-chips' },
            el('span', {}, step.owner),
            el('span', {}, step.time)
          )
        )
      ));
      detail.appendChild(el('p', { class: 'workflow-aim' }, step.aim));

      const list = el('ul', { class: 'workflow-list' });
      step.do.forEach((item) => list.appendChild(el('li', {}, item)));
      detail.appendChild(list);

      detail.appendChild(el('div', { class: 'workflow-checkpoint' },
        el('b', {}, 'Checkpoint'),
        document.createTextNode(step.checkpoint)
      ));
      detail.appendChild(el('pre', { class: 'workflow-prompt' }, step.prompt));
      detail.appendChild(el('button', {
        class: 'copy-btn',
        onClick: () => copyToClipboard(step.prompt)
      }, '复制这一阶段 prompt'));
    }

    renderDetail();
  }

  // ============================================================
  // 4. VALIDATION SUITE
  // ============================================================
  function initValidationSuite() {
    const root = $('#validation-grid');
    if (!root) return;

    VALIDATION_SUITE.forEach((item) => {
      const card = el('div', { class: 'validation-card' });
      card.appendChild(el('div', { class: 'validation-tag' }, item.tag));
      card.appendChild(el('h3', {}, item.title));
      card.appendChild(el('p', {}, item.why));
      card.appendChild(el('div', { class: 'validation-row' },
        el('b', {}, 'Test'),
        el('span', {}, item.test)
      ));
      card.appendChild(el('div', { class: 'validation-row' },
        el('b', {}, 'Pass'),
        el('span', {}, item.pass)
      ));
      card.appendChild(el('button', {
        class: 'copy-btn',
        onClick: () => copyToClipboard(item.prompt)
      }, '复制验证 prompt'));
      root.appendChild(card);
    });
  }

  // ============================================================
  // 5. TERMINAL SANDBOX
  // ============================================================
  const term = {
    demoIdx: 0,
    stepIdx: -1,
    rendered: 0,        // how many steps already painted
    playing: false,
    speed: 1,
    waitingFilter: false,
    timer: null,
    body: null,
    titleEl: null
  };

  function initTerminal() {
    term.body = $('#terminal-body');
    term.titleEl = $('#terminal-title');

    // tabs
    const tabs = $('#demo-tabs');
    DEMOS.forEach((d, i) => {
      const t = el('button', {
        class: 'demo-tab' + (i === 0 ? ' active' : ''),
        onClick: () => switchDemo(i)
      });
      t.appendChild(document.createTextNode(d.title));
      t.appendChild(el('span', { class: 'tab-sub' }, d.subtitle));
      tabs.appendChild(t);
    });

    // controls
    $('#ctrl-play').addEventListener('click', togglePlay);
    $('#ctrl-next').addEventListener('click', () => { stopAuto(); stepNext(); });
    $('#ctrl-prev').addEventListener('click', () => { stopAuto(); stepPrev(); });
    $('#ctrl-reset').addEventListener('click', () => { stopAuto(); resetDemo(); });
    $('#ctrl-speed').addEventListener('change', (e) => { term.speed = +e.target.value; });

    switchDemo(0);
  }

  function switchDemo(i) {
    stopAuto();
    term.demoIdx = i;
    $$('#demo-tabs .demo-tab').forEach((b, k) =>
      b.classList.toggle('active', k === i)
    );
    const d = DEMOS[i];
    term.titleEl.textContent = `claude — ~/Desktop/code/${d.id}`;
    $('#demo-summary').textContent = d.summary;
    resetDemo();
  }

  function resetDemo() {
    term.body.innerHTML = '';
    term.stepIdx = -1;
    term.rendered = 0;
    term.waitingFilter = false;
    updateProgress();
    // auto step into the first one so user sees something
    stepNext();
  }

  function updateProgress() {
    const total = DEMOS[term.demoIdx].steps.length;
    $('#ctrl-progress').textContent = `${Math.max(0, term.stepIdx + 1)} / ${total}`;
    $('#ctrl-prev').disabled = term.stepIdx <= 0;
    $('#ctrl-next').disabled = term.stepIdx >= total - 1 || term.waitingFilter;
  }

  function togglePlay() {
    if (term.playing) stopAuto();
    else startAuto();
  }
  function startAuto() {
    if (term.waitingFilter) return;
    term.playing = true;
    $('#ctrl-play').textContent = '❚❚ Pause';
    runAuto();
  }
  function stopAuto() {
    term.playing = false;
    $('#ctrl-play').textContent = '▶ Play';
    if (term.timer) { clearTimeout(term.timer); term.timer = null; }
  }
  async function runAuto() {
    while (term.playing) {
      const total = DEMOS[term.demoIdx].steps.length;
      if (term.stepIdx >= total - 1) { stopAuto(); break; }
      stepNext();
      // wait for filter to clear if any
      const dwell = stepDwell(DEMOS[term.demoIdx].steps[term.stepIdx]);
      const start = Date.now();
      while (term.playing && (Date.now() - start) < dwell) {
        await sleep(60);
        if (term.waitingFilter) { stopAuto(); return; }
      }
    }
  }

  function stepDwell(step) {
    // how long to show each step in auto-play (ms), scaled by speed
    const base = {
      user:     1800,
      thinking: 1400,
      tool:     1300,
      output:   2400,
      result:   2200,
      note:     1700,
      filter:   30000  // filter pauses anyway
    }[step.kind] || 1500;
    return base / term.speed;
  }

  function stepNext() {
    if (term.waitingFilter) return;
    const steps = DEMOS[term.demoIdx].steps;
    if (term.stepIdx >= steps.length - 1) return;
    term.stepIdx++;
    renderStepsUpTo(term.stepIdx);
    updateProgress();
    term.body.scrollTop = term.body.scrollHeight;
  }

  function stepPrev() {
    if (term.stepIdx <= 0) return;
    term.stepIdx--;
    // re-render from scratch up to this step
    term.body.innerHTML = '';
    term.rendered = 0;
    term.waitingFilter = false;
    renderStepsUpTo(term.stepIdx);
    updateProgress();
  }

  function renderStepsUpTo(targetIdx) {
    const steps = DEMOS[term.demoIdx].steps;
    while (term.rendered <= targetIdx) {
      const node = renderStep(steps[term.rendered]);
      term.body.appendChild(node);
      term.rendered++;
    }
  }

  function renderStep(step) {
    const wrap = el('div', { class: 't-step' });
    switch (step.kind) {
      case 'user':
        wrap.appendChild(el('div', { class: 't-user' }, step.text));
        break;
      case 'thinking':
        wrap.appendChild(el('div', { class: 't-thinking' }, step.text));
        break;
      case 'tool': {
        const card = el('div', { class: 't-tool' });
        const head = el('div', {});
        head.appendChild(el('span', { class: 't-tool-name' }, '⚙ ' + step.name));
        if (step.args) head.appendChild(el('span', { class: 't-tool-args' }, '· ' + step.args));
        card.appendChild(head);
        if (step.result) card.appendChild(el('div', { class: 't-tool-result' }, step.result));
        wrap.appendChild(card);
        break;
      }
      case 'output':
        wrap.appendChild(el('div', { class: 't-output' }, step.text));
        break;
      case 'result': {
        const isWarn = /⚠|偏 π|偏了 π|fail|error/i.test(step.result || '');
        wrap.appendChild(el('pre', { class: 't-result' + (isWarn ? ' warn' : '') }, step.result));
        break;
      }
      case 'note':
        wrap.appendChild(el('div', { class: 't-note' }, step.text));
        break;
      case 'filter': {
        term.waitingFilter = true;
        const f = el('div', { class: 't-filter' });
        f.appendChild(el('div', { class: 't-filter-title' }, '⊘ ' + (step.title || 'Expert Filter')));
        f.appendChild(el('div', { class: 't-filter-body' }, step.body));
        const btn = el('button', {
          class: 't-filter-confirm',
          onClick: () => {
            f.classList.add('consumed');
            term.waitingFilter = false;
            updateProgress();
            // optional auto-resume? keep paused — user controls.
          }
        }, step.confirm || '我看到了，继续');
        f.appendChild(btn);
        wrap.appendChild(f);
        break;
      }
    }
    return wrap;
  }

  // ============================================================
  // 6. PRODUCTION PIPELINE
  // ============================================================
  function initProductionPipeline() {
    const grid = $('#production-grid');
    const brief = $('#production-brief');
    if (!grid || !brief) return;

    PRODUCTION_STAGES.forEach((stage, i) => {
      const card = el('div', { class: 'production-card' });
      card.appendChild(el('div', { class: 'production-index' }, String(i + 1)));
      card.appendChild(el('h3', {}, stage.title));
      card.appendChild(el('p', {}, stage.detail));
      card.appendChild(el('div', { class: 'production-row' },
        el('b', {}, 'Artifact'),
        el('span', {}, stage.artifact)
      ));
      card.appendChild(el('div', { class: 'production-danger' }, stage.danger));
      grid.appendChild(card);
    });

    brief.appendChild(el('div', { class: 'launch-head' },
      el('div', {},
        el('div', { class: 'eyebrow' }, 'Production prompt'),
        el('h3', {}, '生产运行 brief')
      ),
      el('button', {
        class: 'copy-btn',
        onClick: () => copyToClipboard(PRODUCTION_BRIEF)
      }, '复制 production brief')
    ));
    brief.appendChild(el('pre', {}, PRODUCTION_BRIEF));
  }

  // ============================================================
  // 7. FAILURE MODES
  // ============================================================
  function initFailureModes() {
    const tabs = $('#failure-tabs');
    const detail = $('#failure-detail');
    if (!tabs || !detail) return;

    let active = 0;
    FAILURE_MODES.forEach((mode, i) => {
      const btn = el('button', {
        class: 'failure-tab' + (i === active ? ' active' : ''),
        onClick: () => {
          active = i;
          $$('.failure-tab', tabs).forEach((b, k) => b.classList.toggle('active', k === i));
          render();
        }
      });
      btn.appendChild(el('span', { class: 'failure-tab-title' }, mode.title));
      btn.appendChild(el('span', { class: 'failure-tab-badge' }, mode.badge));
      tabs.appendChild(btn);
    });

    function row(label, text) {
      return el('div', { class: 'failure-row' },
        el('b', {}, label),
        el('p', {}, text)
      );
    }

    function render() {
      const mode = FAILURE_MODES[active];
      detail.innerHTML = '';
      detail.appendChild(el('div', { class: 'failure-detail-head' },
        el('div', {},
          el('div', { class: 'eyebrow' }, mode.badge),
          el('h3', {}, mode.title)
        ),
        el('button', {
          class: 'copy-btn',
          onClick: () => copyToClipboard(mode.prompt)
        }, '复制诊断 prompt')
      ));
      detail.appendChild(row('信号', mode.signal));
      detail.appendChild(row('风险', mode.risk));
      detail.appendChild(row('检查', mode.check));
      detail.appendChild(row('修法', mode.fix));
      detail.appendChild(el('pre', { class: 'failure-prompt' }, mode.prompt));
    }

    render();
  }

  // ============================================================
  // 8. SKILL GALLERY
  // ============================================================
  function initSkills() {
    const grid = $('#skill-grid');
    const tabs = $('#stage-tabs');

    // "all" + each stage
    let activeStage = 'all';
    const allTab = el('button', { class: 'stage-tab active', onClick: () => filter('all') });
    allTab.appendChild(document.createTextNode('全部'));
    allTab.appendChild(el('span', { class: 'stage-hint' }, '12 个'));
    tabs.appendChild(allTab);

    STAGES.forEach((s) => {
      const t = el('button', { class: 'stage-tab', onClick: () => filter(s.id) });
      t.appendChild(document.createTextNode(s.label));
      t.appendChild(el('span', { class: 'stage-hint' }, s.hint));
      tabs.appendChild(t);
    });

    function filter(stageId) {
      activeStage = stageId;
      $$('#stage-tabs .stage-tab').forEach((b, i) => {
        const id = i === 0 ? 'all' : STAGES[i - 1].id;
        b.classList.toggle('active', id === stageId);
      });
      render();
    }

    function render() {
      grid.innerHTML = '';
      const visible = SKILLS.filter((s) => activeStage === 'all' || s.stage === activeStage);
      visible.forEach((s) => {
        const card = el('div', {
          class: `skill-card color-${s.color}`,
          onClick: () => copyToClipboard(s.invoke)
        });
        card.appendChild(el('span', { class: 'copy-hint' }, '点击复制'));
        card.appendChild(el('div', { class: 'skill-name' }, s.name));
        card.appendChild(el('div', { class: 'skill-cn' }, s.cn));

        const r1 = el('div', { class: 'skill-row' });
        r1.appendChild(el('b', {}, '何时'));
        r1.appendChild(document.createTextNode(s.when));
        card.appendChild(r1);

        const r2 = el('div', { class: 'skill-row' });
        r2.appendChild(el('b', {}, '做什么'));
        r2.appendChild(document.createTextNode(s.does));
        card.appendChild(r2);

        card.appendChild(el('div', { class: 'skill-invoke' }, s.invoke));
        grid.appendChild(card);
      });
    }

    render();
  }

  // ============================================================
  // 9. PAPER PIPELINE
  // ============================================================
  function initPaperPipeline() {
    const root = $('#paperflow-grid');
    if (!root) return;

    PAPER_PIPELINE.forEach((item) => {
      const card = el('div', { class: 'paperflow-card' });
      card.appendChild(el('div', { class: 'paperflow-tag' }, item.tag));
      card.appendChild(el('h3', {}, item.title));
      card.appendChild(el('p', {}, item.job));
      card.appendChild(el('div', { class: 'paperflow-proof' },
        el('b', {}, 'Evidence rule'),
        document.createTextNode(item.proof)
      ));
      card.appendChild(el('button', {
        class: 'copy-btn',
        onClick: () => copyToClipboard(item.prompt)
      }, '复制写作 prompt'));
      root.appendChild(card);
    });
  }

  // ============================================================
  // 10. SESSION PROTOCOL
  // ============================================================
  function initSessionProtocol() {
    const grid = $('#session-grid');
    const brief = $('#launch-brief');
    if (!grid || !brief) return;

    SESSION_PROTOCOL.forEach((phase, i) => {
      const card = el('div', { class: 'session-card' });
      card.appendChild(el('div', { class: 'session-index' }, String(i + 1)));
      card.appendChild(el('h3', {}, phase.title));
      card.appendChild(el('div', { class: 'session-meta' }, phase.time));
      card.appendChild(el('p', {}, phase.lead));
      const list = el('ul', {});
      phase.items.forEach((item) => list.appendChild(el('li', {}, item)));
      card.appendChild(list);
      grid.appendChild(card);
    });

    brief.appendChild(el('div', { class: 'launch-head' },
      el('div', {},
        el('div', { class: 'eyebrow' }, 'Copy starter'),
        el('h3', {}, '会话启动 brief')
      ),
      el('button', {
        class: 'copy-btn',
        onClick: () => copyToClipboard(LAUNCH_BRIEF)
      }, '复制完整 brief')
    ));
    brief.appendChild(el('pre', {}, LAUNCH_BRIEF));
  }

  // ============================================================
  // 11. COOKBOOK
  // ============================================================
  function initCookbook() {
    const root = $('#cookbook-items');
    COOKBOOK.forEach((cat) => {
      const block = el('div', { class: 'cookbook-cat' });
      block.appendChild(el('div', { class: 'cookbook-cat-title' }, cat.cat));
      cat.items.forEach((it) => {
        const item = el('div', { class: 'cookbook-item' });
        item.appendChild(el('div', { class: 'cookbook-item-title' }, it.title));
        item.appendChild(el('pre', {}, it.prompt));
        item.appendChild(el('button', {
          class: 'copy-btn',
          onClick: () => copyToClipboard(it.prompt)
        }, '📋 复制 prompt'));
        block.appendChild(item);
      });
      root.appendChild(block);
    });
  }

  // ============================================================
  // 12. CHECKLIST
  // ============================================================
  function initChecklist() {
    const root = $('#checklist-items');
    const cta = $('#cta');
    const remaining = $('#cta-remaining');
    const hint = $('#cta-hint');
    const state = new Array(CHECKS.length).fill(false);

    function refresh() {
      const left = state.filter((x) => !x).length;
      remaining.textContent = left;
      cta.disabled = left > 0;
      if (left === 0) {
        hint.innerHTML = '已就绪。把 Claude Code 安装好（<code>npm i -g @anthropic-ai/claude-code</code>），<code>cd</code> 到你的项目目录，敲 <code>claude</code>。';
      } else {
        hint.innerHTML = '还差 <span id="cta-remaining">' + left + '</span> 条。';
      }
    }

    CHECKS.forEach((c, i) => {
      const item = el('div', {
        class: 'check-item',
        onClick: () => {
          state[i] = !state[i];
          item.classList.toggle('checked', state[i]);
          refresh();
        }
      });
      item.appendChild(el('div', { class: 'check-box' }, '✓'));
      const content = el('div', { class: 'check-content' });
      content.appendChild(el('div', { class: 'check-q' }, c.q));
      content.appendChild(el('div', { class: 'check-why' }, '— ' + c.why));
      item.appendChild(content);
      root.appendChild(item);
    });

    cta.addEventListener('click', () => {
      if (cta.disabled) return;
      window.open('https://docs.claude.com/en/docs/claude-code', '_blank', 'noopener');
    });

    refresh();
  }

  // ============================================================
  // boot
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initBar();
    initWorkflow();
    initValidationSuite();
    initTerminal();
    initProductionPipeline();
    initFailureModes();
    initSkills();
    initPaperPipeline();
    initSessionProtocol();
    initCookbook();
    initChecklist();
  });
})();
