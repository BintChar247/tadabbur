"""Readable transliteration of fully vowelled Arabic (hadith texts), in a simple
beginner style matching the app's Quran transliteration: long vowels a / ee / oo,
ʿ for 'ayn, ' for hamza, al- for the article with sun-letter assimilation."""
import re

FATHA, KASRA, DAMMA, SUKUN, SHADDA = 'َ', 'ِ', 'ُ', 'ْ', 'ّ'
FATHATAN, KASRATAN, DAMMATAN = 'ً', 'ٍ', 'ٌ'
DAGGER = 'ٰ'
CONS = {'ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z','س':'s','ش':'sh',
        'ص':'s','ض':'d','ط':'t','ظ':'z','ع':'ʿ','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n',
        'ه':'h','و':'w','ي':'y','ء':"'",'أ':"'",'إ':"'",'ؤ':"'",'ئ':"'",'ة':'t'}
SUN = set('تثدذرزسشصضطظلن')
VOW = {FATHA:'a', KASRA:'i', DAMMA:'u', FATHATAN:'an', KASRATAN:'in', DAMMATAN:'un'}
MARKS = set(VOW) | {SUKUN, SHADDA, DAGGER}
ALIFS = set('اٱ')

def parse(word):
    """Split a word into [letter, set_of_marks] units."""
    units = []
    for ch in word:
        if ch in MARKS and units: units[-1][1].append(ch)
        elif ch in MARKS: continue
        else: units.append([ch, []])
    return units

def vowel_of(marks):
    for m in marks:
        if m in VOW: return VOW[m]
    return ''

def word_tl(word, first_in_phrase):
    bare = re.sub('[ً-ْٰ]', '', word)
    # Allah and its prefixed forms
    m = re.fullmatch(r'([وفب]?)(لِ?)?', '')
    am = re.match(r'^([وف]?)([بل]?)(ا?)لل[ّ]?ه(.?)$', bare)
    if bare in ('الله', 'لله', 'بالله', 'والله', 'فالله', 'تالله', 'ولله', 'فلله') or am:
        units = parse(word); end = vowel_of(units[-1][1]) if units else ''
        pre = ''
        if bare.startswith('و'): pre = 'wa'
        elif bare.startswith('ف'): pre = 'fa'
        elif bare.startswith('ت'): pre = 'ta'
        core = bare[len(pre) and 1:]
        if core.startswith('ب'): pre += 'bi'
        if core.startswith('لله') or core.startswith('ل') and not core.startswith('ال'): pre += 'li'
        if pre.endswith('li'): return pre[:-2] + 'lillah' + end
        return (pre + 'llah' + end) if pre else ('Allah' + end)
    units = parse(word)
    out = []
    i = 0
    n = len(units)
    while i < n:
        ch, mk = units[i]
        nxt = units[i+1] if i + 1 < n else None
        # definite article: (prefix) + alif + lam
        if ch in ALIFS and not vowel_of(mk) and nxt and nxt[0] == 'ل' and SHADDA in nxt[1] and i + 2 < n:
            out.append(('a' if i == 0 else '') + 'll' + vowel_of(nxt[1]))
            i += 2
            continue
        if ch in ALIFS and not vowel_of(mk) and nxt and nxt[0] == 'ل' and i + 2 < n:
            after = units[i+2]
            sun = after[0] in SUN and SHADDA in after[1]
            pre = ''.join(out)
            art = ('a' if (i == 0 and first_in_phrase) or (i == 0) else '')
            if pre and not pre.endswith('-'): pre_join = '-'
            if sun:
                c = CONS.get(after[0], after[0])
                tok = (art + c + '-') if True else ''
                if i == 0: out = [('a' if art else 'a') + c + '-']
                else: out.append((c + '-'))
                # the sun letter itself will be emitted once more below
                i += 2
                # remove shadda doubling for the sun letter (already written once)
                units[i][1] = [x for x in units[i][1] if x != SHADDA]
                continue
            else:
                if i == 0: out.append('al-')
                else: out.append('l-')
                i += 2
                continue
        if ch in ALIFS:
            # long a after a consonant, or word-initial hamzat al-wasl
            if i == 0:
                v = vowel_of(mk)
                out.append(v if v else ('i' if first_in_phrase else 'i'))
            elif FATHATAN in mk:
                if out and out[-1].endswith('a'): out[-1] = out[-1][:-1]
                out.append('an')
            else:
                prev = out[-1] if out else ''
                if prev.endswith('an') or prev.endswith('oo') or prev.endswith('aw'):
                    pass  # tanween alif or silent alif after waw al-jama'ah
                elif prev and prev[-1] not in 'aiu-':
                    out.append('a')  # e.g. لاَ with fatha after alif
                elif prev.endswith('a'):
                    pass  # already 'a' (long a written as single a, matching the Quran style)
                # carry a vowel written on the alif itself
            i += 1; continue
        if ch == 'آ':
            out.append("'a" if i else 'a'); i += 1; continue
        if ch == 'ى':
            if out and not out[-1].endswith('a'): out.append('a')
            i += 1; continue
        if ch in ('و', 'ي') and not vowel_of(mk) and SHADDA not in mk and i > 0:
            prev = out[-1] if out else ''
            if ch == 'و' and prev.endswith('u'):
                out[-1] = prev[:-1] + 'oo'; i += 1; continue
            if ch == 'ي' and prev.endswith('i'):
                out[-1] = prev[:-1] + 'ee'; i += 1; continue
        if ch == 'و' and not mk and i == n - 1 and out and out[-1].endswith(('in', 'un', 'an', 'i')):
            i += 1; continue  # silent waw as in 'Amr
        if ch == 'ل' and not vowel_of(mk) and SHADDA not in mk and nxt and SHADDA in nxt[1] and nxt[0] in SUN and i >= 1:
            sc = CONS[nxt[0]]
            out.append(sc + '-')
            units[i+1][1] = [x for x in units[i+1][1] if x != SHADDA]
            i += 1; continue
        c = CONS.get(ch)
        if c is None:
            out.append(ch); i += 1; continue
        if ch == 'ة' and not vowel_of(mk):
            c = 'h'
        if SHADDA in mk: c = c + c
        v = vowel_of(mk)
        if DAGGER in mk: v = (v or '') + 'a' if not v else v
        out.append(c + v)
        i += 1
    s = ''.join(out)
    s = s.replace("''", "'").replace('--', '-').replace("-'", '-')
    s = re.sub(r"^((?:wa|fa|bi|li|la)?)'", r'\1', s)
    return s

def transliterate(text):
    text = text.replace('‏', '').replace('ـ', '').replace('ـ', '')
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace('صلى الله عليه وسلم', 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ').replace('ﷺ', 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ')
    text = text.replace('رضى الله عنه', 'رَضِيَ اللَّهُ عَنْهُ').replace('رضى الله عنها', 'رَضِيَ اللَّهُ عَنْهَا').replace('رضى الله عنهما', 'رَضِيَ اللَّهُ عَنْهُمَا')
    tokens = re.findall(r'[ء-ْٰٱ]+|[^ء-ْٰٱ]+', text)
    res = []
    first = True
    for t in tokens:
        if re.match(r'[ء-ْٰٱ]', t):
            res.append(word_tl(t, first)); first = False
        else:
            t = t.replace('،', ',').replace('؟', '?').replace('؛', ';').replace('{', '“').replace('}', '”')
            res.append(t)
            if re.search(r'[.!?]', t): first = True
    s = ''.join(res)
    s = re.sub(r'\s+([,.;?!])', r'\1', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s[:1].upper() + s[1:] if s else s

QURAN_SUN = r'\bal(sh|th|dh|t|d|r|z|s|n|l)\1'
def quran_display(tl):
    tl = tl.replace('AA', 'ʿ')
    tl = re.sub(r'\b([Aa])l(sh|th|dh|t|d|r|z|s|n)\2', lambda m: m.group(1) + m.group(2) + '-' + m.group(2), tl)
    return tl

if __name__ == '__main__':
    tests = ['لاَ صَلاَةَ لِمَنْ لَمْ يَقْرَأْ بِفَاتِحَةِ الْكِتَابِ',
             'أُمُّ الْقُرْآنِ هِيَ السَّبْعُ الْمَثَانِي وَالْقُرْآنُ الْعَظِيمُ',
             'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
             'قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم',
             'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
             'مَا أَدْرِي لَعَلَّهُ كَمَا قَالَ قَوْمٌ',
             'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ']
    for t in tests: print(transliterate(t))
    print(quran_display('Bismi Allahi alrrahmani alrraheemi'), '|', quran_display('qala ya qawmi ittabiAAoo almursaleena'), '|', quran_display('wala alddalleena'))
