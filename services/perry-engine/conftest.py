"""pytest bootstrap: put the sidecar root on sys.path for `core`, `pdf`, ... imports."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
