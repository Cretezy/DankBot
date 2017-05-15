    import sys

from dankbot import broadcast

print(sys.argv)
broadcast.announce(sys.argv[1], ' '.join(sys.argv[2:]))
