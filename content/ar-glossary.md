# Arabic translation glossary — Impact17 action catalogue

**Purpose.** This is the controlled lexicon used for the Arabic translations of the 170 actions in `/content/sdg-*.md`. Every recurring English term below has ONE chosen Arabic equivalent. Once approved, the same Arabic term is used everywhere it appears across all 170 actions — no synonyms, no creative variation. A wrong choice here propagates into every action that uses the term, so this is the most important review step.

**Conventions used throughout the catalogue translation.**

- Modern Standard Arabic (MSA). No dialect.
- Western Arabic digits (`0-9`) inside Arabic prose, matching the existing `messages/ar.json` style (e.g. "18 عاماً").
- Sentence rhythm: imperative voice in how-to steps (matches the English), e.g. "اجمع…", "صوّر…".
- Diacritics (tashkīl) added only on grammatically ambiguous words; otherwise omitted to match modern Emirati editorial style.
- "Photo" / "photograph (verb)" / "photograph (noun, your finished item)" are distinguished — see entries.
- Plurals: use the natural broken plural where one exists; otherwise the sound plural with `-ات` / `-ون`.

**How to review.** Skim the table. For each row, the question is only: *is the Arabic equivalent the right word for the job, used consistently?* If yes, OK. If you'd prefer a different word, say so and I'll switch globally before translating any action.

---

## A. Catalogue meta-labels (per-action structural fields)

These mirror the English bullet headers in the `/content/sdg-NN.md` files. The parallel Arabic files will use these tokens, and the importer will key off them.

| English (source) | Arabic (chosen) | Notes |
|---|---|---|
| Effort | الجهد | bullet header |
| Easy | سهل | already in `messages/ar.json` → `effort.easy` — kept identical |
| Medium | متوسط | already in `messages/ar.json` → `effort.medium` |
| Hard | صعب | already in `messages/ar.json` → `effort.hard` |
| Points | النقاط | bullet header |
| Verification | التحقق | bullet header |
| How to do this | كيفية التنفيذ | already in `messages/ar.json` → `action.howTo` — kept identical |
| Reflection prompts | أسئلة التأمل | already in `messages/ar.json` → `action.reflectionPrompts` — kept identical |
| Photo of \<X\> | صورة لِـ\<X\> | verification field, e.g. "Photo of the poster" → "صورة للملصق" |
| *(rewritten)* | *(معاد صياغته)* | inline marker on verification line; preserved as italic |

## B. Action-instruction verbs (highest-frequency)

| English | Arabic | Notes |
|---|---|---|
| photograph (verb) | صوِّر | imperative; "photograph your finished poster" → "صوِّر ملصقك النهائي" |
| photo (noun, the artefact) | صورة | used in verification lines |
| document (verb) | وثِّق | "document filling it" → "وثِّق ملأها" |
| share (verb) | شارِك | "share it with classmates" → "شارِكه مع زملائك" |
| share (noun) | مشاركة | rare; only when nominalised |
| donate (verb) | تبرَّع | "donate them" → "تبرَّع بها" |
| donation | تبرُّع | "donation point" → "نقطة تبرُّع" |
| volunteer (verb) | تطوَّع | "volunteer at a food bank" |
| volunteer (noun) | متطوِّع | "as a volunteer" |
| collect | اجمع | "collect supplies" → "اجمع المستلزمات" |
| organise / organize | نظِّم | "organise a fundraiser" |
| run (an activity) | نفِّذ | "run the activity" — avoids the misleading "اركض" |
| make / create | اصنع | for tangible objects (poster, jar). When abstract ("create a plan") → ضع |
| design (verb) | صمِّم | posters, infographics |
| write | اكتب | guides, notes, summaries |
| research (verb) | ابحث في | "research a UAE programme" → "ابحث في برنامج إماراتي" |
| find / identify | حدِّد | "find a recipient channel" → "حدِّد قناة استلام" |
| pick / choose | اختر | |
| prepare | جهِّز | "prepare a meal" → "جهِّز وجبة" |
| display / show | اعرِض | "display your poster" → "اعرِض ملصقك" |
| keep (records, track) | احتفِظ بِـ | "keep records" → "احتفِظ بسجلات" |
| track (verb) | تتبَّع | "track your usage" → "تتبَّع استهلاكك" |
| plant (verb) | ازرع | trees, saplings |
| respect / respectfully | باحترام | adverb form; "respectfully share" → "شارِك باحترام" |
| permission (get permission) | إذن | "get permission from your school" → "احصل على إذن من مدرستك" |

## C. Recurring nouns and themes

| English | Arabic | Notes |
|---|---|---|
| community | المجتمع | the abstract; "community drive" → "حملة مجتمعية" |
| community (adj., a local one) | مجتمعي | |
| sustainability | الاستدامة | core platform term |
| sustainable | مستدام | |
| poverty | الفقر | |
| hardship | الشدّة | "overcoming hardship" → "تجاوز الشدّة" |
| household | المنزل | "household electricity" → "كهرباء المنزل" |
| school | المدرسة | |
| classmates | الزملاء | "share with classmates" |
| family | العائلة | |
| neighbour | الجار | |
| poster | الملصق | |
| guide (the document) | الدليل | "budgeting basics guide" → "دليل أساسيات الميزانية" |
| infographic | الرسم المعلوماتي | |
| jar / container | برطمان / حاويـة | "a give-back jar" → "برطمان العطاء" |
| recycling | إعادة التدوير | |
| recycling point / machine | نقطة إعادة تدوير / آلة | "Sparklo machine" → "آلة سباركلو" (transliterated brand; see §F) |
| waste | النفايات | |
| food waste | هدر الطعام | |
| meal | الوجبة | |
| food bank | بنك الطعام | when generic; "UAE Food Bank" stays as its official name (see §F) |
| iftar | إفطار | proper Arabic noun; preserved |
| Ramadan | رمضان | |
| mosque | المسجد | |
| sapling | شتلة | "get a sapling" → "احصل على شتلة" |
| tree | شجرة | |
| native species | نوع محلي | "a native, climate-suited species" → "نوع محلي يتأقلم مع المناخ" |
| desert (adj.) | صحراوي | "desert shrub" → "شجيرة صحراوية" |
| climate | المناخ | |
| climate change | تغيُّر المناخ | |
| energy | الطاقة | |
| clean energy | الطاقة النظيفة | |
| electricity | الكهرباء | |
| water | المياه | the resource; "water conservation" → "ترشيد المياه" |
| budget | الميزانية | |
| saving / savings | الادخار | |
| needs vs wants | الاحتياجات مقابل الرغبات | |
| supplies | المستلزمات | "school supplies" → "المستلزمات المدرسية" |
| programme / initiative | برنامج / مبادرة | use "برنامج" for formal/named programmes, "مبادرة" for initiatives |
| service (public service) | خدمة | "support service" → "خدمة دعم" |
| skill | مهارة | |
| innovation | الابتكار | |
| smart-city | المدينة الذكية | |

## D. Reflection-prompt phrasing (recurring questions)

These 3 questions appear in some form on the majority of the 170 actions. Pinning them here ensures identical phrasing across the catalogue.

| English question | Arabic question |
|---|---|
| What did you do / make / cook / plant…? | ماذا فعلت / صنعت / طبخت / زرعت…؟ |
| What did you enjoy? | ما الذي استمتعت به؟ |
| What did you learn? | ماذا تعلَّمت؟ |
| What was hardest / what was challenging? | ما الأصعب؟ / ما الذي شكَّل تحدّيًا؟ |
| What surprised you? | ما الذي فاجأك؟ |
| Who did you share it with? | مع مَن شاركته؟ |
| Why those items? | لماذا اخترت هذه الأشياء؟ |
| Where did it go? | إلى أين ذهبت / ذهب؟ |

## E. Number / unit conventions

| English | Arabic | Notes |
|---|---|---|
| 5 / 10 / 20 points | 5 / 10 / 20 نقاط | Western digits; plural نقاط in 3-10, نقطة elsewhere. The importer doesn't translate the numeric Effort/Points line — it parses the English meta line and stores the numeric value in DB. So this only matters where points are spelled out in prose. |
| 18+ | 18 عاماً فأكثر | matches `messages/ar.json` style |
| one-page | صفحة واحدة | |

## F. UAE-specific named entities — proposed Arabic forms

These are the named entities that recur across the catalogue. The right column is my **best-effort** form; entries marked **🚩** are ones I'm not confident enough to commit to without your verification, and they'll move into the `flagged-uncertain.md` file before any catalogue translation locks in their form. Names I am confident about (well-known official Arabic names with strong public usage) are unmarked.

| English | Arabic (proposed) | Confident? |
|---|---|---|
| United Arab Emirates / UAE | الإمارات العربية المتحدة / الإمارات | ✅ |
| Emirates Red Crescent | الهلال الأحمر الإماراتي | ✅ official |
| UAE Food Bank | بنك الإمارات للطعام | ✅ official |
| Dubai Charity Association | جمعية دبي الخيرية | 🚩 verify exact official form |
| Zakat Fund | صندوق الزكاة | ✅ official |
| Community Development Authority (CDA, Dubai) | هيئة تنمية المجتمع | 🚩 confirm scope (Dubai-only?) and whether to include "بدبي" |
| Goumbook | جومبوك | 🚩 transliteration — confirm preferred form |
| Goumbook's Give a Ghaf programme | برنامج "ازرع غافًا" التابع لجومبوك | 🚩 confirm official Arabic name of the programme |
| Sparklo / Sparklomat | سباركلو / سباركلومات | 🚩 transliteration — confirm preferred form |
| DEWA (Dubai Electricity and Water Authority) | هيئة كهرباء ومياه دبي | ✅ official |
| ADDC (Abu Dhabi Distribution Company) | شركة أبوظبي للتوزيع | ✅ official |
| Masdar City | مدينة مصدر | ✅ |
| Barakah (nuclear plant) | محطة براكة | ✅ |
| Mohammed bin Rashid Al Maktoum Solar Park | مجمع محمد بن راشد آل مكتوم للطاقة الشمسية | ✅ official |
| Mars mission / Hope Probe (Emirates Mars Mission) | مسبار الأمل (مهمة الإمارات إلى المريخ) | ✅ — using the more familiar مسبار الأمل |
| Ghaf (tree) | الغاف | ✅ |
| Sidr (tree) | السدر | ✅ |
| Date Palm | النخيل | ✅ |
| Prosopis juliflora (mesquite) | المسكيت (Prosopis juliflora) | ✅ retain Latin in parens to preserve the species ID |

Any entity not listed above that appears in a specific action will be flagged in `flagged-uncertain.md` as I encounter it during translation, rather than guessed in place.

---

## Open questions for review

1. **"You" form in instructions.** The English how-to steps are imperative ("Photograph your assembled care package"). I'll use the masculine-singular imperative throughout (the unmarked default in Arabic catalogue copy: "صوِّر طردك…"). Confirm this is the right register — some platforms prefer gender-neutral or plural ("صوِّروا…"). Default to masculine-singular unless told otherwise.
2. **"Emirates Red Crescent" vs the spelled-out long form.** Some official documents use "هيئة الهلال الأحمر بدولة الإمارات العربية المتحدة". The catalogue is conversational, so I propose the shorter "الهلال الأحمر الإماراتي" everywhere. Confirm.
3. **Transliterated brand names.** "Sparklo" and "Goumbook" don't have a stable Arabic spelling that I can verify. I've proposed سباركلو and جومبوك respectively. If you have the actual forms these brands use on their own Arabic websites, please share — that becomes the canonical form.
4. **Whether to keep Latin Linnaean names in parens.** For *Prosopis juliflora*, I retained the Latin to preserve species precision. Same approach OK for any other Latin name I encounter (e.g. for marine species in SDG 14)?

---

**Stopping here. Will not translate any actions until you approve the glossary above (or send revisions).**
