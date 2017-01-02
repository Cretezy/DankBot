import sys

from dankbot import broadcast

broadcast.announce(sys.argv[1], ' '.join(sys.argv[2:]))
