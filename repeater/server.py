# -*- coding: utf-8 -*-
"""
repeater/server.py
~~~~~~~~~~~~~~~~~~

The main HTTP server that powers pyrc. Right now, in this basic form, all it
does is provide access to the websocket repeater.
"""
from tornado.ioloop import IOLoop
from tornado.web import Application

from .repeater import Repeater

# Define the top-level Tornado application.
application = Application([
    (r"/wsock/", Repeater),
])

if __name__ == '__main__':
    application.listen(80)
    IOLoop.instance().start()
