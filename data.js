// ============================================================
// data.js — 所有内容集中放在这里。修改文案/添加 demo 都改这里。
// ============================================================

// ---------- 1. Hero 数据 ----------
const HERO = {
  // 16 篇论文时间轴（基于 ahu-talk 内容；月-编号方便定位）
  papers: [
    { m: '2025-12', t: 'DBMM',                 v: 'PRC 113, 024614' },
    { m: '2025-12', t: 'CDCC RB Emulator',     v: 'PRC 113, 044610' },
    { m: '2025-12', t: 'HPRMAT GPU R-matrix',  v: 'arXiv 2512.11590' },
    { m: '2025-12', t: 'BiLNN Optical Model',  v: 'arXiv 2512.22500' },
    { m: '2026-01', t: 'Coherent Absorption',  v: 'arXiv 2601.08245' },
    { m: '2026-02', t: 'ECS PINN',             v: 'arXiv 2602.04553' },
    { m: '2026-02', t: 'Knockout Quenching',   v: 'arXiv 2602.12690' },
    { m: '2026-03', t: 'Deletion ≠ Measure',   v: 'arXiv 2603.24253' },
    { m: '2026-04', t: 'Exact CC Green Fn',    v: 'arXiv 2604.00471' },
    { m: '2026-04', t: 'Channel Couplings',    v: 'arXiv 2604.05600' },
    { m: '2026-04', t: 'IAV breakup',          v: 'draft' },
    { m: '2026-04', t: 'Intrinsic Info Limit', v: 'draft' },
    { m: '2026-04', t: 'Bayesian Calibration', v: 'draft (w/ Furnstahl)' },
    { m: '2026-04', t: 'Info Geometry of EFT', v: 'draft (4 authors)' },
    { m: '2026-04', t: '+2 in submission',     v: '' },
    { m: '2026-04', t: '',                     v: '' }
  ]
};

// ---------- 2. 工作量条数据 ----------
// 用来粗略估算"独立主导的代表性论文 / 深度项目容量"，不是署名总数。
// 这里按科研人员职业生涯中可投入科研主线的正常工作时间估算。
// 核心公式：projects = DEEP_RESEARCH_HOURS * (1 - implementation_ratio) / CORE_HOURS
// CORE_HOURS = 一篇代表性论文 / 一个成熟项目中不可外包的物理判断、
// 验证和论文取舍，约 300 小时
// DEEP_RESEARCH_HOURS ≈ 35 年 × 54 周 × 40 小时 = 75600 小时
const WORK_BAR = {
  coreHours: 300,
  lifetimeHours: 75600,
  defaultRatio: 0.80   // 传统流程：80% 是 implementation
};

// ---------- 3. 终端沙盒 demo 脚本 ----------
// 每一步是 { kind, ... }：
//   user    用户输入
//   thinking  Claude 内部思考（可折叠）
//   tool    工具调用卡片
//   output  Claude 回答（支持简单 markdown）
//   result  代码运行结果（bash 风格）
//   filter  Expert Filter 弹窗，需要用户点确认才继续
//   note    旁白说明，用浅色字呈现在终端外侧
const DEMOS = [
  {
    id: 'dbmm',
    title: 'Demo 1 · 一个新数值方法的诞生',
    subtitle: 'DBMM — 把出射波边界条件直接写进矩阵',
    summary:
      '展示从想法到 PRC 投稿全流程；包括一次真实的 Coulomb phase 失败，Expert Filter 介入并修复',
    steps: [
      {
        kind: 'note',
        text: '我打开终端，进入空目录，敲 `claude` 启动 Claude Code CLI。'
      },
      {
        kind: 'user',
        text: '我想做一个新的散射求解器。核心 idea：把出射波边界条件 ψ\'(R) − γ_s ψ(R) = 0 直接写进矩阵的最后一行，而不是事后做 R-matrix 匹配。先帮我用 research-planning skill 起一个项目骨架。'
      },
      {
        kind: 'thinking',
        text: '用户给了明确的物理设定。先调用 research-planning skill 生成 CLAUDE.md / README.md / TODO.md 三件套，再讨论第一步实现。'
      },
      {
        kind: 'tool',
        name: 'Skill',
        args: 'research-planning',
        result: '加载 SKILL.md（4.2KB） + references/file-templates.md（8.1KB）'
      },
      {
        kind: 'tool',
        name: 'Write',
        args: 'CLAUDE.md',
        result: '写入项目说明：DBMM 求解器，目标 PRC，Lagrange-Legendre 基，benchmark 用 Numerov。'
      },
      {
        kind: 'tool',
        name: 'Write',
        args: 'TODO.md',
        result: '5 个阶段 23 个 checkbox：核心矩阵搭建 → 边界行 → 单道 benchmark → Coulomb 散射 → 论文初稿。'
      },
      {
        kind: 'output',
        text: '骨架已就位。我建议从最小可验证版本开始：纯 Neumann 边界 + 短程势 + ℓ=0。先验证内部行的 Schrödinger 离散化，再加边界行和 Coulomb。要不要我直接写 dbmm_core.f90？'
      },
      {
        kind: 'user',
        text: 'ok 写吧，记得用 OpenBLAS 的 zgesv。'
      },
      {
        kind: 'tool',
        name: 'Write',
        args: 'src/dbmm_core.f90 (118 行)',
        result: '✓ 写入'
      },
      {
        kind: 'tool',
        name: 'Bash',
        args: 'gfortran -O2 -fopenmp src/dbmm_core.f90 -lopenblas -o dbmm_test && ./dbmm_test',
        result: '编译通过。\n[ℓ=0]  |S|=0.94821   arg(S) = -1.4823 rad\n参考 Numerov: |S|=0.94821 arg(S) = -1.4823 rad\nΔ|S| = 1.2e-7   Δarg = 4e-9 rad ✓'
      },
      {
        kind: 'output',
        text: '内部行通过。接下来加 Coulomb 项（Hankel 函数 H⁺_ℓ 的对数导数）。'
      },
      {
        kind: 'tool',
        name: 'Edit',
        args: 'src/dbmm_core.f90 (修改 boundary_row 子例程)'
      },
      {
        kind: 'tool',
        name: 'Bash',
        args: './dbmm_test --target p+12C --energy 30',
        result: '[ℓ=0]   |S|=0.71122  arg(S) = +1.5822 rad\n参考:    |S|=0.71122  arg(S) = -1.5594 rad\nΔ|S| = 6e-6   Δarg ≈ π  ⚠'
      },
      {
        kind: 'filter',
        title: 'Expert Filter 介入',
        body:
          '低分波相位偏了 ≈ π。Claude 写的代码逻辑漂亮、注释里还说"verified against standard conventions"，但符号约定错了。\n\n如果不熟悉 Coulomb-distorted 散射的 Argand 图长什么样，会以为只是数值噪声接着走 2-3 天。这就是为什么 Expert Filter 不能省。',
        confirm: '我看到了，让 Claude 修'
      },
      {
        kind: 'user',
        text: '低分波相位偏 π，怀疑 Coulomb 函数符号约定。把 H⁺ 的对数导数公式贴出来给我看，再对照 Abramowitz §14.5 检查。'
      },
      {
        kind: 'thinking',
        text: '用户指出符号问题。我之前用了 H⁻ 而不是 H⁺。Abramowitz 14.5.1: H⁺_ℓ ~ exp(+i(kr − ηlog(2kr) − ℓπ/2 + σ_ℓ))。我把指数符号弄反了。'
      },
      {
        kind: 'tool',
        name: 'Edit',
        args: 'src/dbmm_core.f90: gamma_s 的虚部翻号'
      },
      {
        kind: 'tool',
        name: 'Bash',
        args: './dbmm_test --target p+12C --energy 30',
        result: '[ℓ=0]   |S|=0.71122  arg(S) = -1.5594 rad\n参考:    |S|=0.71122  arg(S) = -1.5594 rad\nΔ|S| = 2.5e-7   Δarg = 6e-9 rad ✓ 全部分波通过'
      },
      {
        kind: 'output',
        text: '修好了。p+¹²C @30 MeV，11 个分波，与 Numerov 符合到 |S|=2.5×10⁻⁵, arg < 0.01°。可以推广到耦合道了。'
      },
      {
        kind: 'note',
        text: '后面的图表生成、PRC 投稿这里略过。完整故事见 Phys. Rev. C 113, 024614 (2026)。'
      }
    ]
  },

  {
    id: 'cdcc',
    title: 'Demo 2 · 把 DBMM 当砖头盖楼',
    subtitle: 'CDCC reduced-basis emulator — 4 天，220× 加速',
    summary: '在 DBMM 之上做 POD-Galerkin reduced basis；37 通道 18 参数',
    steps: [
      {
        kind: 'note',
        text:
          '上一个 demo 写完 DBMM。现在我希望它能支撑 Bayesian UQ —— 这意味着每次 likelihood 评估必须从分钟级压到毫秒级。'
      },
      {
        kind: 'user',
        text:
          '用 dbmm 当 high-fidelity solver，做 POD-Galerkin reduced basis emulator。target: d+58Ni @ 21.6 MeV，37 通道，18 个光学势参数 (KD03 ±30%)。先 plan。'
      },
      {
        kind: 'tool',
        name: 'Skill',
        args: 'research-planning'
      },
      {
        kind: 'tool',
        name: 'Read',
        args: 'src/dbmm_core.f90 (从已有项目继承矩阵结构)'
      },
      {
        kind: 'output',
        text:
          '设计：Latin hypercube 采 200 样本 → 每个 J 独立 SVD → reduced basis n_b=5..50 → Galerkin 投影。预算：offline 11 小时（48 核），online 30 ms/分波。'
      },
      {
        kind: 'user',
        text: 'go.'
      },
      {
        kind: 'tool',
        name: 'Write',
        args: 'src/snapshot.f90 + src/galerkin.f90 + scripts/lhs_sample.py（约 600 行）'
      },
      {
        kind: 'tool',
        name: 'Bash',
        args: 'sbatch run_offline.slurm  # 11h on 48 cores',
        result: '[等 11 小时... offline 完成]\nsnapshot matrix 200×185000 已保存；SVD 截断 n_b 平均 18。'
      },
      {
        kind: 'tool',
        name: 'Bash',
        args: './emulator_test --n_test 5',
        result:
          '[Test 1] σ_total error = 0.0094%   t = 1.1 s\n[Test 2] σ_total error = 0.043%    t = 1.0 s\n[Test 3] σ_total error = 0.005%    t = 1.1 s\n[Test 4] σ_total error = 0.012%    t = 1.0 s\n[Test 5] σ_total error = 0.018%    t = 1.0 s\n参考 full CDCC: 6.5 s/分波 × 30 J ≈ 195 s/sample\n加速 ≈ 220×    精度 < 0.1%'
      },
      {
        kind: 'filter',
        title: 'Expert Filter — 这次它通过了',
        body:
          '5 个独立测试集精度都低于 0.1%。但 Expert 必须问：偏差最大的 Test 2 (0.043%) 落在参数空间哪个角落？是不是 KD03 ± 边界的极端点？需要画 σ_total error vs ‖θ−θ̄‖ 才能放心。',
        confirm: '让 Claude 画那张诊断图'
      },
      {
        kind: 'user',
        text: '画 σ_total 相对误差 vs ‖θ - θ̄‖₂ 的散点图，做 5000 个 LHS 测试点，看是否随距离单调增长。'
      },
      {
        kind: 'tool',
        name: 'Bash',
        args: './emulator_test --diagnostic 5000 && python scripts/plot_diagnostic.py',
        result:
          '生成 figs/diagnostic.png：误差与‖θ−θ̄‖弱相关 (Spearman ρ=0.21)，整体 < 0.05%，无系统性偏差。'
      },
      {
        kind: 'output',
        text: '诊断通过。可以写论文了。'
      },
      {
        kind: 'note',
        text:
          '12 月 16 日开题，12 月 19 日提交 arXiv：2512.17687。已发表为 Phys. Rev. C 113, 044610 (2026)。'
      }
    ]
  },

  {
    id: 'paper',
    title: 'Demo 3 · 论文初稿与文献',
    subtitle: 'prc-writing + rag-review skill',
    summary: '从代码结果到 PRC 投稿初稿；引用全部走 verified pipeline，不靠记忆造',
    steps: [
      {
        kind: 'user',
        text: '/prc-writing  起草 CDCC RB Emulator 这篇论文的 Introduction 和 Section II。背景文献用 rag-review 从 my_publications 工作区拉。'
      },
      {
        kind: 'tool',
        name: 'Skill',
        args: 'prc-writing'
      },
      {
        kind: 'tool',
        name: 'Skill',
        args: 'rag-review my_publications "reduced basis emulator nuclear scattering"'
      },
      {
        kind: 'tool',
        name: 'Bash',
        args: 'curl http://100.102.98.74:3001/api/v1/workspaces/my_publications/...',
        result: '返回 12 段文献摘要，全部带 DOI；按相关性排序。'
      },
      {
        kind: 'output',
        text:
          '草稿要点：(1) 引 Furnstahl 2020 EC 开篇；(2) 引 Liu, Jin Lei, Ren 2024 PLB 自我延续；(3) 把 Catacora-Rios 2025 和 Liao 2025 作为同期工作并列对比，强调通道数和参数维度。'
      },
      {
        kind: 'tool',
        name: 'Write',
        args: 'paper/intro.tex (47 行)'
      },
      {
        kind: 'filter',
        title: 'Expert Filter — citation 必查',
        body:
          'prc-writing skill 强制：每条 \\cite 的 DOI 必须来自当次 literature-search 调用，不允许凭记忆补全。fabricated citation 是 PRC 拒稿最快的原因。',
        confirm: '我手动 cross-check 了 DOI'
      },
      {
        kind: 'user',
        text: 'Section II Formalism 也起草。重点讲 DBMM matrix 结构如何让 Galerkin 投影变干净。'
      },
      {
        kind: 'tool',
        name: 'Write',
        args: 'paper/formalism.tex (120 行) + paper/figs/workflow.tex'
      },
      {
        kind: 'output',
        text:
          '初稿结构：Intro (motivation) → Formalism (DBMM + POD + Galerkin) → Numerical Results (5 test sets) → Comparison (Catacora-Rios / Liao) → Conclusions。约 6 页双栏。下一步：你审一遍逻辑，我再补 results 文字。'
      },
      {
        kind: 'note',
        text:
          'prc-writing skill 不会替你写 physics judgment，但它会把"格式 / 引用 / 行文风格 / 节奏"这部分摩擦消除。这是 Vibe Research 在论文阶段的形态。'
      }
    ]
  }
];

// ---------- 4. Skill 武器库 ----------
const SKILLS = [
  {
    name: 'research-planning',
    cn: '项目规划',
    when: '开新坑时；用户给了大致方向但还没动手',
    does: '生成三件套 CLAUDE.md / README.md / TODO.md，含数学背景、技术实现、验证计划',
    invoke: '/research-planning',
    stage: 'plan',
    color: 'blue'
  },
  {
    name: 'debug-physics-first',
    cn: '物理先行 debug',
    when: '卡墙数日；调超参没用；结果不物理；和参考值对不上',
    does: '先怀疑物理 (Hamiltonian / 守恒律 / 边界 / 量纲)，再怀疑代码；优先执行用户给的具体指令',
    invoke: '/debug-physics-first',
    stage: 'debug',
    color: 'red'
  },
  {
    name: 'rag-review',
    cn: '私域文献检索',
    when: '需要从你自己上传的论文库里拉相关段落',
    does: '调 AnythingLLM 私有 workspace，返回带 DOI 的文献摘要；不会编造',
    invoke: '/rag-review my_publications <topic>',
    stage: 'lit',
    color: 'green'
  },
  {
    name: 'review-writing',
    cn: '综述撰写',
    when: '写 Annual Review 风格的领域综述；需要 RAG + Hallmarks 框架',
    does: '宏框架 + 段落级文献编织；自动调 rag-review 取证',
    invoke: '/review-writing <topic>',
    stage: 'write',
    color: 'green'
  },
  {
    name: 'prc-writing',
    cn: 'Phys. Rev. C 撰写',
    when: '起草 PRC 论文；改格式；写 abstract',
    does: '强制 PRC 行文风格 + 章节结构；引用全程委托 literature-search，绝不凭记忆',
    invoke: '/prc-writing',
    stage: 'write',
    color: 'blue'
  },
  {
    name: 'prl-writing',
    cn: 'Phys. Rev. Lett. 撰写',
    when: '起草 PRL 短篇；4 页字数限制下的取舍',
    does: 'PRL 字数控制 + 引用 verified pipeline',
    invoke: '/prl-writing',
    stage: 'write',
    color: 'blue'
  },
  {
    name: 'slidev-talk-kami',
    cn: 'Kami 风格幻灯',
    when: 'Colloquium / Review talk / 正式邀请报告',
    does: '羊皮纸 + 墨蓝衬线，Adapted from print design system',
    invoke: '/slidev-talk:kami',
    stage: 'talk',
    color: 'blue'
  },
  {
    name: 'slidev-talk-sketch',
    cn: 'Sketch 风格幻灯',
    when: 'Seminar / 组会 / 教学；想降低正式感',
    does: '米纸纹理 + 彩铅配色，Caveat / Patrick Hand',
    invoke: '/slidev-talk:sketch',
    stage: 'talk',
    color: 'green'
  },
  {
    name: 'slidev-talk-formal',
    cn: 'Formal 风格幻灯',
    when: 'APS March Meeting / 答辩 / 工业 conference',
    does: '白底钢蓝 + IBM Plex 字体；企业感',
    invoke: '/slidev-talk:formal',
    stage: 'talk',
    color: 'blue'
  },
  {
    name: 'skill-iterate',
    cn: 'Skill 迭代',
    when: '某个 skill 不好用想优化；写新 skill 想跑评测',
    does: 'Read → Test → Reflect → Write 循环；保证 trigger 覆盖率',
    invoke: '/skill-iterate',
    stage: 'meta',
    color: 'purple'
  },
  {
    name: 'todo',
    cn: '研究 todo widget',
    when: '想把当前研究任务摆到桌面常驻',
    does: '操作 macOS 上的 Research Todo 桌面 widget',
    invoke: '/todo',
    stage: 'meta',
    color: 'purple'
  },
  {
    name: 'game / book-writing / trump',
    cn: '其他生活类 skill',
    when: '想转换上下文：写中文教材、设计游戏、扮演特朗普视角',
    does: '与科研 skill 同源；说明 Vibe 流程的可泛化性',
    invoke: '/game · /book-writing · /trump-perspective',
    stage: 'meta',
    color: 'purple'
  }
];

// 工作流阶段说明 — 用来给 skill 卡片分组
const STAGES = [
  { id: 'plan',  label: '规划',     hint: '问对问题' },
  { id: 'lit',   label: '文献',     hint: '快速读透领域' },
  { id: 'debug', label: '实现 / Debug', hint: '把想法变代码' },
  { id: 'write', label: '撰写',     hint: '从代码结果到论文' },
  { id: 'talk',  label: '讲',       hint: '从论文到报告' },
  { id: 'meta',  label: '元工具',   hint: '管理 skill 自身' }
];

// ---------- 5. Prompt Cookbook ----------
const COOKBOOK = [
  {
    cat: '文献综述',
    items: [
      {
        title: '快速建立子领域 mental map',
        prompt:
`/rag-review my_publications <topic>

读完后用 Hallmarks 框架综述给我：
1. 主流方法的"族谱"（谁继承谁）
2. 核心 unsolved problem 是什么
3. 你认为最有突破空间的 3 个方向，并给每个方向找一篇你认为最值得读的 paper`
      },
      {
        title: '读一篇硬核 paper',
        prompt:
`帮我读这篇 paper：<arxiv id 或路径>

请按以下结构回答：
- 核心 claim 一句话
- 关键 derivation 复述（用我能理解的符号）
- 数值实验的 fair / unfair 之处
- 我自己的 X 项目能不能借用其中的 idea Y`
      }
    ]
  },
  {
    cat: '起草新算法',
    items: [
      {
        title: '从想法到 MVP',
        prompt:
`核心 idea: <一句话>

按以下流程做：
1. 用 research-planning 起项目骨架
2. 选最简单的可验证 case 先写出来
3. 跑 benchmark 对照 <参考实现>
4. 在每一步停下来等我审一次再往下走

如果中间发现物理不对劲就停，调用 debug-physics-first。`
      },
      {
        title: 'Reduced-order model 套路',
        prompt:
`参考 Phys. Rev. C 113, 044610 (2026) 的 POD-Galerkin 套路，
为我的 <方程> 做 reduced basis emulator：
- 参数空间维度: <D>
- 高保真求解器: <现有代码路径>
- 目标加速: ≥100×, 精度 < 0.5%

先写 plan, 不要直接写代码。`
      }
    ]
  },
  {
    cat: 'Debug',
    items: [
      {
        title: '数值结果不对',
        prompt:
`/debug-physics-first

现象: <一句话>
参考值: <数值或文献来源>
我的结果: <数值>
偏差: <绝对值与方向>

请先列 5 个最可能出错的物理点（守恒律 / 量纲 / 边界 / 渐近 / 通道结构），
然后选最该先查的一个，写一个最小诊断脚本验证。
不要先调超参。`
      }
    ]
  },
  {
    cat: '写论文',
    items: [
      {
        title: 'PRC 起草',
        prompt:
`/prc-writing

我已有结果（图见 figs/）和 method 描述（见 design.md）。
起草 Intro 和 Section II Formalism。
所有 \\cite 必须走 literature-search，引用过的 DOI 给我列在 sources.txt 里方便我手动核对。`
      },
      {
        title: '回审稿意见',
        prompt:
`参考 review.txt 里的审稿意见。

按以下格式给每条意见准备回应：
1. 复述 referee 的 concern（确认你理解了）
2. 我们的 response（实质性回答，不是套话）
3. 论文里要做的具体修改（diff 形式）

不要 defensive，referee 对的就承认。`
      }
    ]
  },
  {
    cat: '做幻灯',
    items: [
      {
        title: 'Colloquium 风格',
        prompt:
`/slidev-talk:kami

主题: <题目>
听众: <colloquium / review talk / 邀请报告>
时长: <分钟>

要求：
- 每页一个 central message，写在 speaker note 第一行
- 数据卡片左上 / idea 卡片右下 / gap 卡片用红 accent
- 不要 emoji；不要 italic`
      }
    ]
  }
];

// ---------- 6. 工作流卡片 ----------
const WORKFLOW = [
  {
    phase: '0',
    title: '选题压缩',
    owner: '人主导',
    time: '30-60 min',
    aim: '把一个模糊兴趣压成一个能验证的物理问题。',
    do: [
      '写出 central claim：如果这件事成立，它改变了什么',
      '列出一个最低成本 benchmark：解析解、旧代码、表格数据或文献图',
      '定义失败条件：什么结果出来就立刻停止'
    ],
    checkpoint: 'Claude 只能帮你整理选项，不能替你决定这个问题值不值得做。',
    prompt:
`我有一个研究想法：<一句话>。

请帮我压缩成 3 个可执行版本：
1. 最小可验证版本
2. 最像论文的版本
3. 风险最高但可能最有价值的版本

每个版本列 central claim、最小 benchmark、失败条件。
不要替我决定，最后只给比较表。`
  },
  {
    phase: '1',
    title: '骨架落地',
    owner: 'Claude 主写，人定边界',
    time: '1-2 h',
    aim: '把研究问题变成 repo 结构、验证计划和第一批 TODO。',
    do: [
      '生成 CLAUDE.md，固定物理约定、单位、参考值和不可改边界',
      '写 README 的最小复现实验',
      '把 TODO 拆成可连续验证的小块'
    ],
    checkpoint: '先审 CLAUDE.md。约定写错，后面的代码会系统性错。',
    prompt:
`/research-planning

项目主题：<topic>
核心方程 / 模型：<model>
最小 benchmark：<reference>
不能改变的物理约定：<units, sign, normalization, boundary>

生成 CLAUDE.md / README.md / TODO.md。
重点写清楚验证路径，不要先写代码。`
  },
  {
    phase: '2',
    title: '最小求解器',
    owner: 'Claude 实现，人审物理',
    time: '2-6 h',
    aim: '只做最小 case，先证明离散化、边界和归一化没错。',
    do: [
      '固定一个通道、一个能量、一个角动量或一个最简单网格',
      '每一步输出可检查的中间量',
      '先和解析解或旧代码逐项对照'
    ],
    checkpoint: '不要在第一个版本里追求通用性。最小 case 没过，扩展只会放大错误。',
    prompt:
`现在只写最小求解器。

限制：
- case: <one simplest case>
- benchmark: <reference>
- 输出中间量：<matrix norm / phase / residual / conservation>
- 不要做 general framework

写完后先跑 benchmark，结果没有通过就停下来分析，不要继续扩展。`
  },
  {
    phase: '3',
    title: '诊断闭环',
    owner: '人提出怀疑，Claude 写诊断',
    time: '30-90 min/轮',
    aim: '把“感觉不对”变成一个能复现实验。',
    do: [
      '把偏差写成数字：方向、量级、发生区域',
      '一次只查一个物理怀疑点',
      '把诊断脚本留下来当 regression test'
    ],
    checkpoint: '先查守恒律、量纲、边界、相位、通道编号，再查超参。',
    prompt:
`/debug-physics-first

现象：<what is wrong>
参考：<expected value or behavior>
我的结果：<actual>
偏差方向和量级：<delta>

请先提出 5 个物理层面的可能原因。
然后只选最可能的一个，写最小诊断脚本验证。
不要改主程序，除非诊断脚本证明原因。`
  },
  {
    phase: '4',
    title: '规模化与性能',
    owner: 'Claude 执行，人控精度预算',
    time: '0.5-2 days',
    aim: '从最小 case 扩展到生产 case，同时保住误差预算。',
    do: [
      '增加参数维度、通道数、采样点或 HPC 调度',
      '记录 online/offline 时间、内存、误差分布',
      '把极端点和边界点单独测'
    ],
    checkpoint: '性能提升只有在误差图过关后才算数。',
    prompt:
`把当前最小实现扩展到 production setting：

目标规模：<channels / parameters / grid / samples>
精度预算：<tolerance>
性能目标：<speedup or runtime>
必须输出：
- runtime table
- error distribution
- worst-case examples
- 一张 diagnostic plot

任何精度超过预算的点都要列出来，不要平均掉。`
  },
  {
    phase: '5',
    title: '论文化',
    owner: '人定叙事，Claude 起草',
    time: '1-4 days',
    aim: '把结果变成能经得住审稿人追问的论证。',
    do: [
      '先写 story spine：gap、idea、evidence、limitation',
      '所有 citation 走检索或本地 RAG，不靠记忆',
      '把失败模式和验证图写进正文或 supplement'
    ],
    checkpoint: 'Claude 可以写 prose，但不能替你决定 claim 的强度。',
    prompt:
`/prc-writing

请根据以下 story spine 起草论文结构：
- Gap: <what is missing>
- Idea: <our method>
- Evidence: <main figures / tables>
- Limitation: <known limits>

要求：
1. Introduction 只服务这个 spine
2. 所有引用必须来自 literature-search / rag-review
3. 每个强 claim 后面都要有对应证据
4. 先给 outline，等我审完再写正文`
  }
];

// ---------- 7. 失败模式库 ----------
const FAILURE_MODES = [
  {
    id: 'phase',
    title: '相位约定错',
    badge: '散射 / Coulomb',
    signal: '模长对，相位差接近 π 或整体符号翻转；图看起来很像“只是 convention”。',
    risk: '最容易被漂亮代码掩盖。继续往后做会污染所有分波、截面和相移解释。',
    check: '把渐近形式、H+ / H-、S-matrix 定义、相移符号逐行写出来；用一个低分波 benchmark 对照。',
    fix: '先冻结主程序，只写一个只计算渐近函数和对数导数的小脚本。',
    prompt:
`怀疑相位约定错。

请把以下定义逐行展开：
- asymptotic wave
- H+ / H- convention
- S-matrix definition
- phase shift sign

然后写一个最小脚本，只比较 <case> 的低分波相位。
不要修改主求解器。`
  },
  {
    id: 'unit',
    title: '单位和尺度混用',
    badge: 'MeV / fm / hbarc',
    signal: '趋势对但数值系统性偏大/偏小；换能量或质量后误差按固定比例漂移。',
    risk: 'LLM 常会默认自然单位，或者把 hbarc、约化质量、2μ 因子藏进公式里。',
    check: '列出每一项的量纲，打印所有换算常数，做一个无势自由粒子 sanity check。',
    fix: '把单位约定写进 CLAUDE.md，并加一个 dimension smoke test。',
    prompt:
`怀疑单位混用。

请为 Hamiltonian / kinetic term / potential / boundary condition 做量纲表。
列出代码里每个常数的单位和来源。
然后写一个 free-particle smoke test，验证尺度是否正确。`
  },
  {
    id: 'normalization',
    title: '归一化悄悄变了',
    badge: 'basis / overlap',
    signal: '波函数形状合理，但矩阵元、截面或概率总和不守恒。',
    risk: '不同基函数、积分权重、连续谱归一化之间切换时尤其常见。',
    check: '打印 overlap matrix、closure relation、概率守恒量；和解析基或数值积分对照。',
    fix: '把 overlap 当成一等公民，不要假设 basis 是正交归一。',
    prompt:
`怀疑归一化错。

请检查：
1. basis overlap matrix
2. quadrature weights
3. wavefunction normalization
4. observable formula 中是否重复乘了权重

写一个最小测试，输出 norm / closure / conservation 三个数。`
  },
  {
    id: 'channel',
    title: '通道编号错位',
    badge: 'coupled channels',
    signal: '单通道通过，耦合道一开就出现奇怪尖峰或不守恒；交换两个通道后结果大变。',
    risk: '数组下标、量子数顺序、阈值能量和耦合矩阵很容易错位但不报错。',
    check: '输出 channel table，逐项打印 quantum numbers、threshold、coupling block 的 shape 和 symmetry。',
    fix: '先做 2-channel toy model，确认 index map 再扩展到 37 channels。',
    prompt:
`怀疑 channel indexing 错。

请生成 channel audit：
- index
- quantum numbers
- threshold
- coupling partners
- matrix block range

再写一个 2-channel toy model，验证交换通道顺序后物理结果不变。`
  },
  {
    id: 'citation',
    title: '引用看起来像真的',
    badge: 'paper writing',
    signal: '作者、年份、题目都很合理，但 DOI 或页码对不上；引用支持的 claim 其实不在原文里。',
    risk: '这是写作阶段最容易损害可信度的问题。',
    check: '每条 citation 必须有 DOI、arXiv 或本地 PDF 证据；把 claim 和原文位置绑定。',
    fix: '引用生成和正文生成分开做，先建 sources.txt，再写 paragraph。',
    prompt:
`请核查以下 citation，不要凭记忆补全：
<citations>

对每条返回：
- DOI / arXiv / 本地 PDF 路径
- 支持的具体 claim
- 原文位置
- 如果不支持，标记为 unusable

不要写正文。`
  },
  {
    id: 'overreach',
    title: '结论强度超过证据',
    badge: 'story / claim',
    signal: '结果只覆盖一个能区或一个核，但文字写成了普适方法；只做平均误差却声称高精度。',
    risk: 'LLM 很擅长把局部成功包装成一般结论。',
    check: '把每个 claim 后面绑定 evidence、domain、limitation。',
    fix: '在 introduction 和 conclusion 里主动限定适用域。',
    prompt:
`请审查这段论文文字的 claim strength：
<text>

对每个 claim 列：
- evidence
- valid domain
- missing test
- 建议降级后的表述

不要润色，先做 claim audit。`
  }
];

// ---------- 8. 会话启动协议 ----------
const SESSION_PROTOCOL = [
  {
    title: '开局',
    time: '5 min',
    lead: '写清目标和边界',
    items: [
      '今天只做一个主目标',
      '列出允许修改的文件或目录',
      '列出不能改变的物理约定'
    ]
  },
  {
    title: '执行',
    time: '30-90 min',
    lead: '小步推进，每步有输出',
    items: [
      '先读代码和文档，再改',
      '每个修改后跑最小验证',
      '遇到物理不确定性就停'
    ]
  },
  {
    title: '收尾',
    time: '10 min',
    lead: '把状态写回项目',
    items: [
      '记录通过和失败的测试',
      '把新诊断脚本纳入 TODO',
      '下一次会话从明确 checkpoint 开始'
    ]
  }
];

const LAUNCH_BRIEF =
`今天的目标：<one concrete outcome>

背景：
- 项目：<project>
- 当前状态：<what already works>
- 参考值 / benchmark：<reference>

边界：
- 允许改：<files or directories>
- 不要改：<files or conventions>
- 物理约定：<units, sign, normalization, boundary>

执行方式：
1. 先读相关文件，总结你看到的现状。
2. 给一个短 plan，等我确认。
3. 每次只做一个小修改。
4. 每个修改后跑最小验证。
5. 如果结果和物理预期冲突，停止并调用 debug-physics-first，不要继续堆代码。`;

// ---------- 9. 验证矩阵 ----------
const VALIDATION_SUITE = [
  {
    title: '解析极限',
    tag: 'analytic limit',
    why: '无势、弱势、低能、单通道这些极限最便宜，也最能抓住符号和单位错误。',
    test: '先跑一个你能手算或能从教材读出来的 case。',
    pass: '误差随网格加密按预期收敛；不是只在一个网格点上碰巧对。',
    prompt:
`为当前求解器设计 analytic-limit validation。

请列出 3 个最便宜的解析极限：
1. free case
2. weak-coupling / perturbative case
3. single-channel or low-energy case

每个极限给出 expected behavior、需要打印的中间量、通过标准。
先不要改代码。`
  },
  {
    title: '独立实现对照',
    tag: 'reference code',
    why: '同一个错误很可能在同一个代码路径里自洽。独立实现能打破这种自洽。',
    test: '用 Numerov、R-matrix、旧 Fortran、Mathematica 或一段极简 Python 对照。',
    pass: '关键 observable 和至少一个中间量同时对上。',
    prompt:
`请为 <observable> 做 independent reference check。

要求：
- 不复用主程序核心函数
- 用最短实现写一个 reference solver
- 输出主程序和 reference 的中间量对照表
- 如果 observable 对但中间量不对，标记为失败`
  },
  {
    title: '守恒律 / 对称性',
    tag: 'conservation',
    why: '能量、概率、unitarity、Hermiticity、交换对称性比肉眼看图可靠。',
    test: '每次生产运行前自动打印违反程度。',
    pass: '违反量比目标误差预算至少小一个数量级。',
    prompt:
`请为当前项目加 conservation / symmetry audit。

列出所有应该成立的约束：
- unitarity / flux conservation
- Hermiticity or complex symmetry
- channel exchange invariance
- normalization / closure

为每个约束写一个数值指标和 fail threshold。`
  },
  {
    title: '边界点压力测试',
    tag: 'worst case',
    why: '平均误差会掩盖最危险的角落。审稿人通常会问 worst case。',
    test: '采参数空间边界、阈值附近、强耦合区、低分波和高分波尾部。',
    pass: '列出 top-10 worst cases，并解释它们为什么仍在可接受范围内。',
    prompt:
`请设计 worst-case validation。

参数空间：<ranges>
目标 observable：<observable>
误差预算：<tolerance>

不要只报告平均误差。
请输出 top-10 worst cases、它们的参数位置、误差来源猜测、下一步诊断建议。`
  }
];

// ---------- 10. 生产管线 ----------
const PRODUCTION_STAGES = [
  {
    title: '冻结物理版本',
    detail: '生产前先固定 Hamiltonian、单位、边界条件、参数范围和 benchmark commit。',
    artifact: 'CLAUDE.md + config.yaml + benchmark log',
    danger: '一边跑大规模数据一边改物理定义，会让所有结果不可解释。'
  },
  {
    title: '小批量冒烟',
    detail: '先跑 3-5 个样本，覆盖中心点、边界点和一个你最担心的极端点。',
    artifact: 'smoke.json + diagnostic.png',
    danger: '只在中心点通过，不代表生产点通过。'
  },
  {
    title: '集群作业模板',
    detail: '把 job array、日志路径、随机种子、失败重试和资源预算写进脚本。',
    artifact: 'run.slurm + manifest.csv',
    danger: '没有 manifest 的大规模运行，后面很难追溯哪一组参数出了错。'
  },
  {
    title: '在线诊断面板',
    detail: '每轮自动生成 runtime、failure rate、worst error、代表性曲线。',
    artifact: 'summary.html / summary.md',
    danger: '等全部跑完才看图，会把 12 小时问题变成 12 天问题。'
  },
  {
    title: '结果锁定',
    detail: '把最终 config、代码 hash、环境、图表脚本和原始数据位置一起记录。',
    artifact: 'results.lock + reproducibility.md',
    danger: '论文修改两周后无法复现实验，是最昂贵的返工。'
  }
];

const PRODUCTION_BRIEF =
`把当前项目推进到 production run。

前提：
- 已通过的 benchmark：<benchmarks>
- 目标参数空间：<ranges>
- 误差预算：<tolerance>
- 资源限制：<nodes / cores / hours>

请按以下顺序做：
1. 检查 config 是否完整记录物理约定。
2. 写 3-5 个 smoke samples。
3. 写 job manifest，不要只写 slurm。
4. 写运行后自动汇总脚本，至少包含 runtime、failure rate、worst cases。
5. 给出 stop rule：什么情况必须停止生产运行。`;

// ---------- 11. 论文管线 ----------
const PAPER_PIPELINE = [
  {
    title: 'Story spine',
    tag: 'gap / idea / evidence / limit',
    job: '先写论文骨架，不先写 prose。每一节都服务同一个 central claim。',
    proof: '一页 outline 能说明：为什么现在的问题没解决、你的 idea 新在哪里、证据够不够。',
    prompt:
`请为我的结果做 story-spine audit。

输入：
- central result: <result>
- main figures: <figures>
- target journal: <journal>

输出：
1. Gap
2. Idea
3. Evidence
4. Limitation
5. 哪些 claim 现在证据不够，必须降级`
  },
  {
    title: 'Claim-evidence map',
    tag: 'avoid overclaim',
    job: '每个强结论后面绑定一张图、一个表或一个验证测试。',
    proof: '没有 evidence 的句子不能进入 abstract 和 conclusion。',
    prompt:
`请把下面这段论文草稿拆成 claim-evidence map：
<text>

对每个 claim 返回：
- claim
- evidence source (figure/table/test/citation)
- valid domain
- wording strength: weak / moderate / strong
- 是否需要降级`
  },
  {
    title: 'Citation audit',
    tag: 'verified sources',
    job: '引用只做核查，不让 LLM 凭记忆补全 BibTeX。',
    proof: '每条引用都有 DOI/arXiv/PDF 路径，并说明它支持哪一句话。',
    prompt:
`/rag-review my_publications <topic>

请只做 citation audit：
- 每条 source 的 DOI / arXiv / 本地 PDF
- 它支持的具体 claim
- 是否是 method precedent / benchmark / competing work / background
- 不确定就标记 uncertain，不要补全`
  },
  {
    title: 'Reviewer rehearsal',
    tag: 'pre-review',
    job: '投稿前模拟一个严厉审稿人，找最容易被攻击的三点。',
    proof: '每个弱点都有补图、补测试或降级表述。',
    prompt:
`请模拟 PRC 审稿人审这篇稿子。

重点找：
1. claim 是否过强
2. benchmark 是否不够独立
3. 参数空间是否覆盖不足
4. citation 是否漏掉关键同期工作

请给出最严重的 5 条问题和具体补救方案。`
  }
];

// ---------- 12. Expert Filter 自检清单 ----------
const CHECKS = [
  {
    q: '我能在不依赖 Claude 的情况下，独立判断一段物理推导是否正确。',
    why: 'Claude 会自信地给你 confident incorrectness。Expert Filter 的核心是物理直觉。'
  },
  {
    q: '我熟悉至少一个被 LLM 写错过、但很有迷惑性的常见陷阱（Coulomb phase、量纲、归一化、边界条件之一）。',
    why: 'Vibe Research 的失败模式不是 random bug，是看起来合理的错。'
  },
  {
    q: '当 LLM 给我看似漂亮的代码时，我会去查它和某个独立参考（解析解、文献基准）的对照。',
    why: '"代码不报错"不等于"物理对"。'
  },
  {
    q: '当 LLM 给我一条 citation 时，我会查 DOI 是否真的指向那篇论文。',
    why: '虚构引用是 Vibe Research 最常见的事故，也是 PRC 拒稿最快的原因。'
  },
  {
    q: '当 LLM 偏离我给的具体指令去自创"另一种实现"时，我会拉它回来。',
    why: '专家的具体指针几乎总比 LLM 自己生成的 hypothesis 更有信息量。'
  },
  {
    q: '我能区分一个项目的"智力内核"和"实现 overhead"，并清楚自己时间该花在哪。',
    why: 'Vibe Research 不是更努力，是把不该花的时间从 80% 砍下去。'
  },
  {
    q: '我在每次会话开始前，都会先想"今天我让 Claude 做什么 / 不做什么"。',
    why: '没有研究问题的工具是放大器，但放大的可能是噪声。'
  },
  {
    q: '我接受论文里每一行物理判断的最终责任在我，不在 LLM。',
    why: 'Vibe Research 是协作不是自动化。署名负责的是你。'
  }
];
