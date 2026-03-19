// ── Bilingual content ────────────────────────────────────────────────────────
const LANG = {
  en: {
    // Welcome screen
    subtitle:      '"world" — what is it, really?\nHow do you define it?',
    startBtn:      'START GAME',
    langToggle:    '中文',

    // Dialogue UI
    tapHint:       'tap to continue',
    speaker:       'LILY',

    // ── Part 1: intro dialogue steps ──────────────────────────────────────────
    introDlg: [
      { type: 'text',   text: 'Hello. My name is Lily.' },
      { type: 'text',   text: "I've been thinking lately... what exactly is this world?\nWhat about you? Do you like this world?" },
      { type: 'choice', options: ['Yes, I like it.', 'No, I hate this world.'] },
      { type: 'text',   text: 'Really, interesting.' },
      { type: 'text',   text: "You know, the world I see is actually different from yours.\nI was born blind, until a surgery a year ago gave me the chance to observe this world.", afterAction: 'openCamera' },
      { type: 'text',   text: "Oh sorry, I've been talking too long. Where am I anyway?" },
      { type: 'text',   text: "Take your phone and lead me to explore this world —\nwhat objects are around you?", afterAction: 'startGame' },
    ],

    // ── Part 2: per-object Lily reactions ─────────────────────────────────────
    continueExplore: "Let's keep exploring.",

    objectResponses: {
      'chair':        "A chair... I always knew its shape from touch.\nBut seeing it — there's such grace in how it holds space.",
      'couch':        "I've spent so many hours lying on things like this.\nSeeing its shape is like finally meeting an old friend.",
      'bed':          "The place where darkness was once the most natural thing in the world.",
      'dining table': "The center of so many conversations I heard\nbut couldn't fully picture.",
      'cup':          "A cup. My hands have held hundreds of these.\nHow did someone decide it should look exactly like this?",
      'bottle':       "I love how light passes through it —\nthat must be what 'transparent' really means.",
      'bowl':         "Simple, round, complete. I find it strangely comforting.",
      'book':         "I used to read with my fingers.\nSeeing words on a page is completely different from what I imagined.",
      'laptop':       "I've heard it humming for hours.\nI never imagined it would look so thin, so flat.",
      'keyboard':     "My fingers know every single key by heart.\nSeeing all the letters together is a little overwhelming.",
      'mouse':        "Such a small thing to control so much.",
      'cell phone':   "Something so small that contains so many voices...\nit's almost unbelievable.",
      'remote':       "This little thing commands so much. I like that.",
      'tv':           "Moving light, arranged to tell stories...\nhumans really are extraordinary creatures.",
      'clock':        "Time, made visible. That's a strange thought.",
      'vase':         "It holds nothing right now, but it looks like it's waiting.\nI like that about it.",
      'potted plant': "I knew plants could be green,\nbut I didn't know green had so many different greens.",
      'person':       "Every time I see a person, I still feel this strange shock.\nWe all look so different from each other.",
      'backpack':     "I've carried one of these before.\nIt feels different to finally see its shape.",
      'umbrella':     "I've stood under one of these in the rain.\nI never imagined it looking like this from the outside.",
      'scissors':     "Two blades working together. I knew the sound well before I knew the shape.",
      'teddy bear':   "A stuffed animal. I had one of these once.\nI wonder if it looks how I imagined.",
      'suitcase':     "Ready to go somewhere. I know that feeling.",
      'sink':         "I've stood at one of these so many times, hands moving in the dark.",
    },

    genericResponses: [
      "Every object I see feels like a small gift. This one too.",
      "I've never really been able to picture this before.\nThe world is full of shapes I'm still learning.",
      "Whatever this is — it's remarkable in its own way.",
    ],

    // ── Part 3: ending dialogue ───────────────────────────────────────────────
    p3: {
      line1:       "Thank you. I need to close my eyes and rest.",
      btn_okay:    "Are you okay?",
      line2:       "You know, this world is beautiful, and tempting.\nBut I think I've grown used to the quietness and softness of living in darkness.",
      branchA:     "I understand. Go rest.",
      branchB:     "Can you tell me about your world?",
      lineA1:      "Thank you. I'll be going then.",
      btnDarkness: "I think darkness is better.",
      btnGoodbye:  "Goodbye.",
      mono1:       "Actually, I don't prefer darkness.\nMore than anyone, I wanted to see the normal world,\nto be a normal person.",
      mono2:       "But once I could see — once others knew I could see — things changed.\nI don't know how to describe the feeling.\nI suddenly had a sense of existence.\nI began to care about myself.",
      mono3:       "And more than that — it seemed like everyone was chasing a version of 'beautiful.'\nEveryone trying to become something distinct, something different.\nI couldn't understand ugliness or charm.\nSuddenly there were so many rules, so much pressure.",
      mono4:       "But in the darkness, I could hold my own rhythm.",
      final:       "When I couldn't see, I could imagine everything in my dark world.\nFree. Unbound. I like that.\nMaybe that is my world?",
      thankyou:    "THANK YOU FOR PLAYING",
    },
  },

  zh: {
    // Welcome screen
    subtitle:      '"世界"——它究竟是什么？\n你怎么定义它？',
    startBtn:      '开始游戏',
    langToggle:    'EN',

    // Dialogue UI
    tapHint:       '点击继续',
    speaker:       'LILY',

    // ── Part 1: intro dialogue steps ──────────────────────────────────────────
    introDlg: [
      { type: 'text',   text: '你好。我叫Lily。' },
      { type: 'text',   text: '我最近在想，这个世界到底是什么。\n你呢？你喜欢这个世界吗？' },
      { type: 'choice', options: ['是的，我喜欢。', '不，我讨厌这个世界。'] },
      { type: 'text',   text: '是吗，有意思。' },
      { type: 'text',   text: '你知道吗，我看出去的世界其实跟你们不一样。\n我是一个先天性的瞎子，直到一年前的一个手术赐予了我观察这个世界的机会。', afterAction: 'openCamera' },
      { type: 'text',   text: '哦，抱歉聊的太久了。我这是在哪里。' },
      { type: 'text',   text: '拿起手机，带领我去看看——\n探索这个世界，比如周边的物品？', afterAction: 'startGame' },
    ],

    // ── Part 2: per-object Lily reactions ─────────────────────────────────────
    continueExplore: '继续带我去看吧。',

    objectResponses: {
      'chair':        '椅子……我一直知道它摸上去的感觉。\n但真的看见它，还是觉得它那么优雅地存在着。',
      'couch':        '我在这样的东西上躺过那么多小时。\n看见它的形状，就像终于见到了一个老朋友。',
      'bed':          '曾经，黑暗在这里是最自然不过的事。',
      'dining table': '许多我听过却无法完全想象的对话，\n都发生在这样的地方。',
      'cup':          '杯子。我的手握过无数个这样的东西。\n是谁决定它应该长成这个样子的呢？',
      'bottle':       '我喜欢光穿过它的样子——\n那应该就是"透明"真正的意思吧。',
      'bowl':         '简单，圆润，完整。我觉得它莫名的让人安心。',
      'book':         '我曾经用手指阅读。\n真正看见书页上的文字……和我想象的完全不一样。',
      'laptop':       '我听过它嗡嗡运转的声音。\n没想到它竟然这么薄、这么平。',
      'keyboard':     '我的手指记住了每一个键。\n但真正看见所有字母在一起，还是会有点不知所措。',
      'mouse':        '这么小的东西，却能控制那么多。',
      'cell phone':   '这么小的东西里装着那么多声音……\n简直难以置信。',
      'remote':       '这个小东西掌控着那么多。我喜欢这样。',
      'tv':           '流动的光，组合起来讲述故事……\n人类真的是了不起的生物。',
      'clock':        '时间，变得可见。这是个奇怪的想法。',
      'vase':         '它现在什么都没装，却好像在等待着什么。\n我喜欢它这一点。',
      'potted plant': '我知道植物是绿色的，\n但我没想到绿色有这么多种绿色。',
      'person':       '每次看见人，我还是会有一种奇怪的震撼。\n我们每个人看起来都那么不一样。',
      'backpack':     '我以前背过这样的东西。\n真正看见它的形状，感觉还挺不一样的。',
      'umbrella':     '我曾经在雨中站在这样的东西下面。\n从没想过从外面看它是这个样子。',
      'scissors':     '两片刀刃协作。我早就熟悉它的声音，\n但还是第一次真正看见它的形状。',
      'teddy bear':   '毛绒玩具。我小时候有一个这样的东西。\n不知道它长得跟我想象的一不一样。',
      'suitcase':     '随时准备去什么地方。我知道那种感觉。',
      'sink':         '我在这样的东西前站过那么多次，\n双手在黑暗中移动。',
    },

    genericResponses: [
      '我看见的每一件东西都像是一份小礼物。这个也是。',
      '我以前从来没有真正想象过这个。\n这个世界充满了我还在学习认识的形状。',
      '不管这是什么——它都有自己的奇妙之处。',
    ],

    // ── Part 3: ending dialogue ───────────────────────────────────────────────
    p3: {
      line1:       '谢谢，我需要把眼睛闭上休息了。',
      btn_okay:    '怎么了吗？',
      line2:       '你知道吗，这个世界很漂亮，而且很诱人。\n但是我似乎已经习惯了深处在黑暗的那种宁静，柔和的感觉。',
      branchA:     '我明白了，你去休息吧。',
      branchB:     '你可以跟我讲讲你的世界吗？',
      lineA1:      '谢谢你，那我走了。',
      btnDarkness: '我觉得黑暗世界更好。',
      btnGoodbye:  '再见。',
      mono1:       '其实，我不是喜欢黑暗，我比谁都想看见正常的世界，\n想要成为一个正常人。',
      mono2:       '但是当我看得到这个真实的世界后，或者说，\n当别人知道我可以看见后，情况就改变了。\n我不知道该如何形容我的感受，\n我好像有了一种存在感。我开始在乎我自己了。',
      mono3:       '不止如此，好像每个人都在追求把自己打扮的"漂亮"？\n每个人好像都要把自己变成形状不一，与众不同的人。\n我理解不了丑陋和魅力这个概念，\n这个世界上突然多出了太多太多的规训让我感到压力。',
      mono4:       '但是在黑暗里，我可以更好的掌握我的节奏。',
      final:       '在我看不见的时候我可以在我黑暗的世界里想象一切的事情。\n自由自在，无拘无束。我喜欢这样。\n这也许就是我的世界？',
      thankyou:    '谢谢游玩',
    },
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
let currentLang = 'en';

function t(key)         { return LANG[currentLang][key] ?? LANG.en[key]; }
function getIntroDlg()  { return LANG[currentLang].introDlg; }
function getP3()        { return LANG[currentLang].p3; }
function toggleLang()   { currentLang = currentLang === 'en' ? 'zh' : 'en'; }
