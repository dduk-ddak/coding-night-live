def javaHash(s):
    max_h = (1<<32)
    h = 0
    if not s: return 0
    for ch in s:
        ch = ord(ch)
        print(ch)
        h = ((h<<5)-h) + ch
        h %= max_h
    return h
