from ctypes import c_int32

def javaHash(s):
    h = 0
    if not s: return 0
    for ch in s:
        ch = ord(ch)
        h = ((h<<5)-h) + ch
        h = c_int32(h).value
    return h
